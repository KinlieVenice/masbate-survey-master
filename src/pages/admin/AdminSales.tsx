import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Plus, Search, Pencil, Eye, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { listSales, deleteSale, type Sale } from "@/lib/adminStore";
import { SaleFormDialog } from "@/components/admin/SaleFormDialog";
import { toast } from "sonner";

const peso = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const statusVariant = (s: Sale["status"]) =>
  s === "Paid" ? "bg-primary/15 text-primary border-primary/20" :
  s === "Down Payment" ? "bg-accent/20 text-accent-foreground border-accent/30" :
  "bg-muted text-muted-foreground border-border";

const AdminSales = () => {
  const [version, setVersion] = useState(0);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Sale | null>(null);
  const [open, setOpen] = useState(false);

  const sales = listSales().filter((s) => {
    const q = search.toLowerCase();
    return s.clientName.toLowerCase().includes(q) || (s.location ?? "").toLowerCase().includes(q);
  });

  const refresh = () => setVersion((v) => v + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Sales</h1>
          <p className="text-sm text-muted-foreground mt-1">Track clients, payments, and approval requirements.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> New sale
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search client or location…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm" key={version}>
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-3 px-2 font-medium">Client</th>
                <th className="py-3 px-2 font-medium">Location</th>
                <th className="py-3 px-2 font-medium">Surveying day</th>
                <th className="py-3 px-2 font-medium text-right">Total</th>
                <th className="py-3 px-2 font-medium text-right">Paid</th>
                <th className="py-3 px-2 font-medium">Status</th>
                <th className="py-3 px-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-b border-border/60 hover:bg-secondary/40 transition-colors">
                  <td className="py-3 px-2">
                    <Link to={`/ranola-admin/sales/${s.id}`} className="font-medium text-foreground hover:text-primary hover:underline">
                      {s.clientName}
                    </Link>
                    <div className="text-xs text-muted-foreground">{s.checklist.filter(Boolean).length}/{s.checklist.length} requirements · {s.files.length} files</div>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground max-w-[220px]">
                    {s.location ? (
                      <span className="inline-flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                        <span className="truncate" title={s.location}>{s.location}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50 italic text-xs">Not set</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-muted-foreground whitespace-nowrap">{format(new Date(s.surveyingDay), "MMM d, yyyy")} <span className="text-foreground/70">· {format(new Date(s.surveyingDay), "h:mm a")}</span></td>
                  <td className="py-3 px-2 text-right">{peso(s.totalAmount)}</td>
                  <td className="py-3 px-2 text-right">{peso(s.paidAmount)}</td>
                  <td className="py-3 px-2">
                    <Badge variant="outline" className={statusVariant(s.status)}>{s.status}</Badge>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(s); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/ranola-admin/sales/${s.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteBtn onConfirm={() => { deleteSale(s.id); toast.success("Sale deleted"); refresh(); }} />
                    </div>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground text-sm">No sales found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3" key={`m-${version}`}>
          {sales.map((s) => (
            <div key={s.id} className="border border-border rounded-sm p-4 bg-card">
              <div className="flex items-start justify-between gap-3 mb-2">
                <Link to={`/ranola-admin/sales/${s.id}`} className="font-medium text-foreground">{s.clientName}</Link>
                <Badge variant="outline" className={statusVariant(s.status)}>{s.status}</Badge>
              </div>
              <div className="text-xs text-muted-foreground mb-2">{format(new Date(s.surveyingDay), "MMM d, yyyy")} · {format(new Date(s.surveyingDay), "h:mm a")}</div>
              {s.location && (
                <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-3">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                  <span className="leading-snug">{s.location}</span>
                </div>
              )}
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Paid / Total</div>
                  <div className="text-sm">{peso(s.paidAmount)} / {peso(s.totalAmount)}</div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(s); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DeleteBtn onConfirm={() => { deleteSale(s.id); toast.success("Sale deleted"); refresh(); }} />
                </div>
              </div>
            </div>
          ))}
          {sales.length === 0 && <p className="py-12 text-center text-muted-foreground text-sm">No sales found.</p>}
        </div>
      </Card>

      <SaleFormDialog open={open} onOpenChange={setOpen} sale={editing} onSaved={refresh} />
    </div>
  );
};

const DeleteBtn = ({ onConfirm }: { onConfirm: () => void }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete this sale?</AlertDialogTitle>
        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default AdminSales;
