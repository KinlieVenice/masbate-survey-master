import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Upload, X } from "lucide-react";
import { z } from "zod";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { REQUIREMENTS_CHECKLIST, computeStatus, upsertSale, type Sale, type SaleFile } from "@/lib/adminStore";
import { cn } from "@/lib/utils";
import { TimePicker } from "@/components/admin/TimePicker";

const schema = z.object({
  clientName: z.string().trim().min(2, "Client name required").max(120),
  totalAmount: z.number().min(0, "Must be ≥ 0"),
  paidAmount: z.number().min(0, "Must be ≥ 0"),
});

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

// Downscale large images to keep localStorage usage manageable.
// Non-images pass through unchanged. Picks the smaller of original vs re-encoded.
const MAX_DIM = 1280;
const JPEG_QUALITY = 0.7;
const compressImage = (file: File): Promise<string> =>
  new Promise(async (resolve, reject) => {
    try {
      const dataUrl = await fileToDataUrl(file);
      if (!file.type.startsWith("image/") || file.type === "image/gif") {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          const scale = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(dataUrl);
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const reencoded = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
          // Prefer whichever is smaller — small originals shouldn't be inflated by re-encoding.
          resolve(reencoded.length < dataUrl.length ? reencoded : dataUrl);
        } catch {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch (e) {
      reject(e);
    }
  });

export const SaleFormDialog = ({
  open,
  onOpenChange,
  sale,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sale: Sale | null;
  onSaved: () => void;
}) => {
  const [clientName, setClientName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState("09:00");
  const [total, setTotal] = useState("0");
  const [paid, setPaid] = useState("0");
  const [checklist, setChecklist] = useState<boolean[]>(REQUIREMENTS_CHECKLIST.map(() => false));
  const [files, setFiles] = useState<SaleFile[]>([]);
  const [remarks, setRemarks] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      if (sale) {
        const d = new Date(sale.surveyingDay);
        setClientName(sale.clientName);
        setLocation(sale.location ?? "");
        setDate(d);
        setTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
        setTotal(String(sale.totalAmount));
        setPaid(String(sale.paidAmount));
        setChecklist(sale.checklist.length === REQUIREMENTS_CHECKLIST.length ? sale.checklist : REQUIREMENTS_CHECKLIST.map(() => false));
        setFiles(sale.files);
        setRemarks(sale.remarks ?? "");
      } else {
        setClientName("");
        setLocation("");
        setDate(new Date());
        setTime("09:00");
        setTotal("0");
        setPaid("0");
        setChecklist(REQUIREMENTS_CHECKLIST.map(() => false));
        setFiles([]);
        setRemarks("");
      }
    }
  }, [open, sale]);

  const totalNum = Number(total) || 0;
  const paidNum = Number(paid) || 0;
  const status = computeStatus(totalNum, paidNum);

  const MAX_FILES = 15;
  const handleFiles = async (list: FileList | null) => {
    if (!list) return;
    setBusy(true);
    try {
      const next: SaleFile[] = [];
      const remaining = MAX_FILES - files.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${MAX_FILES} files allowed`);
        return;
      }
      const incoming = Array.from(list).slice(0, remaining);
      if (list.length > remaining) {
        toast.error(`Only ${remaining} more file${remaining > 1 ? "s" : ""} allowed (max ${MAX_FILES})`);
      }
      for (const f of incoming) {
        if (f.size > 8 * 1024 * 1024) {
          toast.error(`${f.name} skipped — over 8MB`);
          continue;
        }
        next.push({
          id: Math.random().toString(36).slice(2, 10),
          name: f.name,
          type: f.type.startsWith("image/") && f.type !== "image/gif" ? "image/jpeg" : (f.type || "application/octet-stream"),
          dataUrl: await compressImage(f),
        });
      }
      setFiles((prev) => [...prev, ...next]);
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    try {
      const v = schema.parse({ clientName, totalAmount: totalNum, paidAmount: paidNum });
      const [hh, mm] = time.split(":").map((n) => Number(n) || 0);
      const merged = new Date(date);
      merged.setHours(hh, mm, 0, 0);
      upsertSale({
        id: sale?.id,
        clientName: v.clientName,
        location: location.trim() || undefined,
        surveyingDay: merged.toISOString(),
        totalAmount: v.totalAmount,
        paidAmount: v.paidAmount,
        checklist,
        files,
        remarks: remarks.trim() || undefined,
      });
      toast.success(sale ? "Sale updated" : "Sale added");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.errors[0].message : err instanceof Error ? err.message : "Failed to save";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="font-serif text-2xl">{sale ? "Edit sale" : "New sale"}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="client">Client name</Label>
                <Input id="client" value={clientName} onChange={(e) => setClientName(e.target.value)} maxLength={120} />
              </div>
              <div className="space-y-1.5">
                <Label>Surveying day</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2 font-normal">
                      <CalendarIcon className="h-4 w-4" />
                      {format(date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Surveying time</Label>
                <TimePicker value={time} onChange={setTime} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location (Barangay / Municipality)</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={160} placeholder="e.g. Brgy. Nursery, Masbate City" />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="total">Total amount (₱)</Label>
                <Input id="total" type="number" min={0} step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} onFocus={(e) => { if (e.target.value === "0") setTotal(""); e.target.select(); }} onBlur={(e) => { if (e.target.value === "") setTotal("0"); }} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paid">Paid amount (₱)</Label>
                <Input id="paid" type="number" min={0} step="0.01" value={paid} onChange={(e) => setPaid(e.target.value)} onFocus={(e) => { if (e.target.value === "0") setPaid(""); e.target.select(); }} onBlur={(e) => { if (e.target.value === "") setPaid("0"); }} />
              </div>
              <div className="space-y-1.5">
                <Label>Status (auto)</Label>
                <div className="h-10 flex items-center px-3 rounded-md border border-input bg-muted/40">
                  <Badge variant="outline" className={
                    status === "Paid" ? "bg-primary/15 text-primary border-primary/20" :
                    status === "Down Payment" ? "bg-accent/20 text-accent-foreground border-accent/30" :
                    "bg-muted text-muted-foreground border-border"
                  }>{status}</Badge>
                </div>
              </div>
            </div>

            <div>
              <Label className="block mb-3">Requirements checklist</Label>
              <div className="space-y-2 border border-border rounded-sm p-4 bg-muted/20">
                {REQUIREMENTS_CHECKLIST.map((req, i) => (
                  <label key={i} className="flex items-start gap-3 text-sm cursor-pointer py-1">
                    <Checkbox
                      checked={checklist[i]}
                      onCheckedChange={(v) => {
                        const next = [...checklist];
                        next[i] = v === true;
                        setChecklist(next);
                      }}
                    />
                    <span className="text-foreground/85 leading-relaxed">{i + 1}. {req}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{checklist.filter(Boolean).length} of {checklist.length} complete</p>
            </div>

            <div>
              <Label className="block mb-3">Bulk file upload</Label>
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-sm p-6 cursor-pointer hover:bg-muted/30 transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground text-center">Click to upload — up to 15 files (max 8MB each)</span>
                <span className="text-xs text-muted-foreground/70">Images, PDFs, documents · {files.length}/15 used</span>
                <input type="file" multiple accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" className="hidden" disabled={files.length >= 15} onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
              </label>
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs text-muted-foreground">{files.length} file{files.length > 1 ? "s" : ""} attached</div>
                  {files.map((f) => (
                    <div key={f.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-sm bg-muted/40 border border-border text-sm">
                      <span className="truncate">{f.name}</span>
                      <button type="button" onClick={() => setFiles((p) => p.filter((x) => x.id !== f.id))} className="text-muted-foreground hover:text-destructive shrink-0">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="remarks">Remarks <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} maxLength={1000} rows={3} placeholder="Notes about this sale, the surveying day, or any special instructions…" />
            </div>
          </div>
        </div>
        <DialogFooter className="px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{sale ? "Save changes" : "Add sale"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
