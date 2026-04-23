import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Upload, X, Plus, Search } from "lucide-react";
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
import { REQUIREMENTS_CHECKLIST, upsertSale, upsertClient, listClients, listTeams, type Sale, type SaleFile, type Client, type SurveyType, type Team } from "@/lib/adminStore";
import { cn } from "@/lib/utils";
import { TimePicker } from "@/components/admin/TimePicker";

const schema = z.object({
  clientName: z.string().trim().min(2, "Client name required").max(120),
  totalAmount: z.number().min(0, "Must be ≥ 0"),
});

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

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

const surveyTypes: SurveyType[] = [
  "Relocation Survey",
  "Subdivision",
  "Topographic",
  "Boundary",
  "Construction",
  "Other",
];

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
  const clients = listClients();
  const teams = listTeams();

  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState("09:00");
  const [total, setTotal] = useState("0");
  const [surveyType, setSurveyType] = useState<SurveyType>("Relocation Survey");
  const [assignedTeamId, setAssignedTeamId] = useState<string>("__none__");
  const [checklist, setChecklist] = useState<boolean[]>(REQUIREMENTS_CHECKLIST.map(() => false));
  const [files, setFiles] = useState<SaleFile[]>([]);
  const [remarks, setRemarks] = useState("");
  const [busy, setBusy] = useState(false);

  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");

  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  useEffect(() => {
    if (open) {
      if (sale) {
        const d = new Date(sale.surveyingDay);
        setClientId(sale.clientId);
        setClientName(sale.clientName);
        setLocation(sale.location ?? "");
        setDate(d);
        setTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
        setTotal(String(sale.totalAmount));
        setSurveyType(sale.surveyType);
        setAssignedTeamId(sale.assignedTeamId ?? "__none__");
        setChecklist(sale.checklist.length === REQUIREMENTS_CHECKLIST.length ? sale.checklist : REQUIREMENTS_CHECKLIST.map(() => false));
        setFiles(sale.files);
        setRemarks(sale.remarks ?? "");
      } else {
        setClientId("");
        setClientName("");
        setLocation("");
        setDate(new Date());
        setTime("09:00");
        setTotal("0");
        setSurveyType("Relocation Survey");
        setAssignedTeamId("__none__");
        setChecklist(REQUIREMENTS_CHECKLIST.map(() => false));
        setFiles([]);
        setRemarks("");
      }
      setClientSearch("");
      setShowClientDropdown(false);
    }
  }, [open, sale]);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const handleSelectClient = (client: Client) => {
    setClientId(client.id);
    setClientName(client.name);
    setShowClientDropdown(false);
    setClientSearch("");
  };

  const handleCreateClient = () => {
    if (!newClientName.trim()) {
      toast.error("Client name is required");
      return;
    }
    const newClient: Omit<Client, "id" | "createdAt"> = {
      name: newClientName.trim(),
      email: newClientEmail.trim() || undefined,
      phone: newClientPhone.trim() || undefined,
      address: newClientAddress.trim() || undefined,
    };
    upsertClient(newClient);
    const created = listClients().find(c => c.name === newClient.name);
    if (created) {
      setClientId(created.id);
      setClientName(created.name);
    }
    setNewClientName("");
    setNewClientEmail("");
    setNewClientPhone("");
    setNewClientAddress("");
    setClientDialogOpen(false);
    toast.success("Client created");
  };

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
      if (!clientName.trim()) {
        toast.error("Client name required");
        return;
      }
      const v = schema.parse({ clientName: clientName.trim(), totalAmount: Number(total) || 0 });
      const [hh, mm] = time.split(":").map((n) => Number(n) || 0);
      const merged = new Date(date);
      merged.setHours(hh, mm, 0, 0);
      upsertSale({
        id: sale?.id,
        clientId: clientId || "",
        clientName: v.clientName,
        location: location.trim() || undefined,
        surveyingDay: merged.toISOString(),
        totalAmount: v.totalAmount,
        surveyType,
        assignedTeamId: assignedTeamId === "__none__" ? undefined : assignedTeamId,
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="font-serif text-2xl">{sale ? "Edit sale" : "New sale"}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Client</Label>
                  <div className="relative">
                    <Input
                      value={clientName}
                      onChange={(e) => { setClientName(e.target.value); setClientId(""); setShowClientDropdown(true); setClientSearch(e.target.value); }}
                      onFocus={() => setShowClientDropdown(true)}
                      placeholder="Select or search client..."
                      maxLength={120}
                    />
                    {showClientDropdown && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-64 overflow-y-auto">
                        {filteredClients.length > 0 && filteredClients.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSelectClient(c)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors"
                          >
                            <div className="font-medium">{c.name}</div>
                            {c.email && <div className="text-xs text-muted-foreground">{c.email}</div>}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => { setClientDialogOpen(true); setShowClientDropdown(false); }}
                          className="w-full text-left px-3 py-2 text-sm border-t border-border hover:bg-muted/60 transition-colors text-primary"
                        >
                          <Plus className="h-3 w-3 inline mr-1" />
                          Create new client{clientSearch ? `: ${clientSearch}` : ""}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location (Barangay / Municipality)</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={160} placeholder="e.g. Brgy. Nursery, Masbate City" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Survey type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={surveyType}
                    onChange={(e) => setSurveyType(e.target.value as SurveyType)}
                  >
                    {surveyTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Assigned team</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={assignedTeamId}
                    onChange={(e) => setAssignedTeamId(e.target.value)}
                  >
                    <option value="__none__">No team</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
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
                <div className="space-y-1.5">
                  <Label>Surveying time</Label>
                  <TimePicker value={time} onChange={setTime} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="total">Total amount (₱)</Label>
                  <Input id="total" type="number" min={0} step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} onFocus={(e) => { if (e.target.value === "0") setTotal(""); e.target.select(); }} onBlur={(e) => { if (e.target.value === "") setTotal("0"); }} />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <div className="h-10 flex items-center px-3 rounded-md border border-input bg-muted/40">
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Synced from invoice</Badge>
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

      <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Create new client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="cname">Name *</Label>
              <Input id="cname" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} maxLength={120} placeholder="Full name or company name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cemail">Email</Label>
                <Input id="cemail" type="email" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} placeholder="optional" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cphone">Phone</Label>
                <Input id="cphone" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} placeholder="optional" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="caddress">Address</Label>
              <Input id="caddress" value={newClientAddress} onChange={(e) => setNewClientAddress(e.target.value)} placeholder="optional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClientDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateClient}>Create client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};