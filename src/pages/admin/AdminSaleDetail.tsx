import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSale } from "@/lib/adminStore";

const peso = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const AdminSaleDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const sale = getSale(id || "");
  const [idx, setIdx] = useState(0);

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

  return (
    <div className="space-y-6">
      <Link to="/ranola-admin/sales" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> All sales
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Client</div>
          <h1 className="font-serif text-3xl text-foreground">{sale.clientName}</h1>
          <p className="text-sm text-muted-foreground mt-1">Surveying day · {format(new Date(sale.surveyingDay), "EEEE, MMM d, yyyy")}</p>
        </div>
        <Badge variant="outline" className={
          sale.status === "Paid" ? "bg-primary/15 text-primary border-primary/20" :
          sale.status === "Down Payment" ? "bg-accent/20 text-accent-foreground border-accent/30" :
          "bg-muted text-muted-foreground border-border"
        }>{sale.status}</Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="font-serif text-xl mb-4">Files ({sale.files.length})</h2>
            {sale.files.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">No files uploaded yet.</p>
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
                  <div className="text-sm">
                    <div className="font-medium text-foreground truncate">{file.name}</div>
                    <div className="text-xs text-muted-foreground">{idx + 1} of {sale.files.length}</div>
                  </div>
                  <a href={file.dataUrl} download={file.name}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" /> Download
                    </Button>
                  </a>
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
                  <span className={done ? "text-foreground" : "text-muted-foreground line-through opacity-60"}>
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
