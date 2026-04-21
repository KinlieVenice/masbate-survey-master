import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Download, FileText, MapPin, Pencil, Upload, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSale, upsertSale, type SaleFile } from "@/lib/adminStore";
import { SaleFormDialog } from "@/components/admin/SaleFormDialog";
import { toast } from "sonner";

const peso = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

const MAX_DIM = 1600;
const compressImage = (file: File): Promise<string> =>
  new Promise(async (resolve, reject) => {
    try {
      const dataUrl = await fileToDataUrl(file);
      if (!file.type.startsWith("image/") || file.type === "image/gif") return resolve(dataUrl);
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          const s = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * s); height = Math.round(height * s);
        }
        const c = document.createElement("canvas");
        c.width = width; c.height = height;
        const ctx = c.getContext("2d");
        if (!ctx) return resolve(dataUrl);
        ctx.drawImage(img, 0, 0, width, height);
        try { resolve(c.toDataURL("image/jpeg", 0.78)); } catch { resolve(dataUrl); }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch (e) { reject(e); }
  });

const AdminSaleDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [version, setVersion] = useState(0);
  const sale = getSale(id || "");
  const [idx, setIdx] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!sale) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground mb-4">Sale not found.</p>
        <Button variant="outline" onClick={() => nav("/ranola-admin/sales")}>Back to sales</Button>
      </div>
    );
  }

  const file = sale.files[idx];
  const isImage = file?.type.startsWith("image/");
  const isPdf = file?.type === "application/pdf";

  const handleUpload = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    setBusy(true);
    try {
      const MAX_FILES = 15;
      const remaining = MAX_FILES - sale.files.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${MAX_FILES} files per sale`);
        return;
      }
      const incoming = Array.from(list).slice(0, remaining);
      if (list.length > remaining) {
        toast.error(`Only ${remaining} more file${remaining > 1 ? "s" : ""} allowed (max ${MAX_FILES})`);
      }
      const next: SaleFile[] = [];
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
      upsertSale({
        id: sale.id,
        clientName: sale.clientName,
        location: sale.location,
        surveyingDay: sale.surveyingDay,
        totalAmount: sale.totalAmount,
        paidAmount: sale.paidAmount,
        checklist: sale.checklist,
        files: [...sale.files, ...next],
      });
      toast.success(`${next.length} file${next.length === 1 ? "" : "s"} uploaded`);
      setVersion((v) => v + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    upsertSale({
      id: sale.id,
      clientName: sale.clientName,
      location: sale.location,
      surveyingDay: sale.surveyingDay,
      totalAmount: sale.totalAmount,
      paidAmount: sale.paidAmount,
      checklist: sale.checklist,
      files: sale.files.filter((f) => f.id !== fileId),
    });
    setIdx(0);
    setVersion((v) => v + 1);
    toast.success("File removed");
  };

  return (
    <div className="space-y-6" key={version}>
      <Link to="/ranola-admin/sales" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> All sales
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Client</div>
          <h1 className="font-serif text-3xl text-foreground">{sale.clientName}</h1>
          <p className="text-sm text-muted-foreground mt-1">Surveying day · {format(new Date(sale.surveyingDay), "EEEE, MMM d, yyyy")}</p>
          <p className="text-sm text-muted-foreground mt-1 inline-flex items-start gap-1.5">
            <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <span>{sale.location || <span className="italic opacity-70">Location not set</span>}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={
            sale.status === "Paid" ? "bg-primary/15 text-primary border-primary/20" :
            sale.status === "Down Payment" ? "bg-accent/20 text-accent-foreground border-accent/30" :
            "bg-muted text-muted-foreground border-border"
          }>{sale.status}</Badge>
          <Button onClick={() => setEditOpen(true)} className="gap-2">
            <Pencil className="h-4 w-4" /> Edit sale
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 gap-3">
              <h2 className="font-serif text-xl">Files ({sale.files.length})</h2>
              <label className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-input bg-background hover:bg-secondary/40 cursor-pointer transition-colors">
                <Upload className="h-4 w-4" />
                {busy ? "Uploading…" : "Upload files"}
                <input type="file" multiple className="hidden" disabled={busy} onChange={(e) => { handleUpload(e.target.files); e.target.value = ""; }} />
              </label>
            </div>
            {sale.files.length === 0 ? (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-sm p-12 cursor-pointer hover:bg-muted/30 transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload — multiple files supported (max 8MB each)</span>
                <input type="file" multiple className="hidden" disabled={busy} onChange={(e) => { handleUpload(e.target.files); e.target.value = ""; }} />
              </label>
            ) : (
              <>
                <div className="relative bg-muted/30 rounded-sm overflow-hidden border border-border">
                  <div className="aspect-[4/3] flex items-center justify-center">
                    {isImage ? (
                      <img src={file.dataUrl} alt={file.name} className="max-h-full max-w-full object-contain" />
                    ) : isPdf ? (
                      <iframe src={file.dataUrl} title={file.name} className="w-full h-full" />
                    ) : (
                      <div className="text-center p-8">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <div className="text-sm text-foreground">{file.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">Preview not available</div>
                      </div>
                    )}
                  </div>

                  {sale.files.length > 1 && (
                    <>
                      <button
                        onClick={() => setIdx((i) => (i - 1 + sale.files.length) % sale.files.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-background"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setIdx((i) => (i + 1) % sale.files.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-background"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 gap-4">
                  <div className="text-sm min-w-0">
                    <div className="font-medium text-foreground truncate">{file.name}</div>
                    <div className="text-xs text-muted-foreground">{idx + 1} of {sale.files.length}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a href={file.dataUrl} download={file.name}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" /> Download
                      </Button>
                    </a>
                    <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={() => handleDeleteFile(file.id)}>
                      <Trash2 className="h-4 w-4" /> Remove
                    </Button>
                  </div>
                </div>

                {sale.files.length > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {sale.files.map((f, i) => (
                      <button
                        key={f.id}
                        onClick={() => setIdx(i)}
                        className={`shrink-0 h-16 w-16 rounded-sm overflow-hidden border-2 ${i === idx ? "border-primary" : "border-border"} bg-muted/40 flex items-center justify-center`}
                      >
                        {f.type.startsWith("image/") ? (
                          <img src={f.dataUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-serif text-lg mb-4">Payment</h3>
            <div className="space-y-3 text-sm">
              <Row label="Total amount" value={peso(sale.totalAmount)} />
              <Row label="Paid amount" value={peso(sale.paidAmount)} />
              <Row label="Balance" value={peso(Math.max(0, sale.totalAmount - sale.paidAmount))} />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-serif text-lg mb-4">Requirements</h3>
            <ul className="space-y-2 text-sm">
              {sale.checklist.map((done, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${done ? "bg-primary" : "bg-border"}`} />
                  <span className={done ? "text-muted-foreground line-through opacity-60" : "text-foreground"}>
                    {i + 1}. {REQ_LABELS[i]}
                  </span>
                </li>
              ))}
            </ul>
            <div className="text-xs text-muted-foreground mt-4">
              {sale.checklist.filter(Boolean).length} of {sale.checklist.length} complete
            </div>
          </Card>
        </div>
      </div>

      <SaleFormDialog open={editOpen} onOpenChange={setEditOpen} sale={sale} onSaved={() => setVersion((v) => v + 1)} />
    </div>
  );
};

const REQ_LABELS = [
  "Latest Tax Declaration (CTC)",
  "Proof of Deed",
  "Certification of Land Status (CENRO)",
  "RTC certification (no pending case)",
  "Barangay certification (no claims)",
  "LRA/ROD Lot Status",
  "DENR Lot Status & Survey Authority",
  "Notice for adjoining owner & barangay",
  "Certificate of Occupancy",
];

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-baseline border-b border-border/60 pb-2 last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

export default AdminSaleDetail;
