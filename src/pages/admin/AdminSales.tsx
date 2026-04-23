import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, subMonths, isWithinInterval, startOfYear, endOfYear } from "date-fns";
import { Plus, Search, Pencil, Eye, Trash2, MapPin, CalendarIcon, ChevronLeft, ChevronRight, FileText, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { listSales, deleteSale, listInvoices, getInvoiceForSale, upsertInvoice, listTeams, type Sale, type SaleStatus, type SurveyType, type Invoice } from "@/lib/adminStore";
import { SaleFormDialog } from "@/components/admin/SaleFormDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

const peso = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const PAGE_SIZE = 10;

type Preset = { label: string; getRange: () => { from: Date; to: Date } };

const PRESETS: Preset[] = [
  { label: "Today", getRange: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { label: "Last 7 days", getRange: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }) },
  { label: "Last 30 days", getRange: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }) },
  { label: "This month", getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: "Last month", getRange: () => { const d = subMonths(new Date(), 1); return { from: startOfMonth(d), to: endOfMonth(d) }; } },
  { label: "This year", getRange: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
  { label: "Last year", getRange: () => { const d = subMonths(new Date(), 12); return { from: startOfYear(d), to: endOfYear(d) }; } },
];

const surveyTypes: SurveyType[] = [
  "Relocation Survey",
  "Subdivision",
  "Topographic",
  "Boundary",
  "Construction",
  "Other",
];

const statusVariant = (s: SaleStatus) =>
  s === "Paid" ? "bg-primary/15 text-primary border-primary/20" :
  s === "Down Payment" ? "bg-accent/20 text-accent-foreground border-accent/30" :
  "bg-muted text-muted-foreground border-border";

const invoiceStatusVariant = (s: string) =>
  s === "Paid" ? "bg-primary/15 text-primary border-primary/20" :
  s === "Partial" ? "bg-accent/20 text-accent-foreground border-accent/30" :
  s === "Overdue" ? "bg-destructive/15 text-destructive border-destructive/20" :
  "bg-muted text-muted-foreground border-border";

const AdminSales = () => {
  const [version, setVersion] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [open, setOpen] = useState(false);
  const [surveyTypeFilter, setSurveyTypeFilter] = useState("all");
  const [range, setRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const refresh = () => setVersion((v) => v + 1);

  const sales = listSales();
  const teams = listTeams();
  const invoices = listInvoices();

  const interval = useMemo(() => ({
    start: startOfDay(range.from ?? new Date()),
    end: endOfDay(range.to ?? range.from ?? new Date()),
  }), [range]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch = s.clientName.toLowerCase().includes(q) || (s.location ?? "").toLowerCase().includes(q);
      const matchDate = isWithinInterval(new Date(s.surveyingDay), interval);
      const matchType = surveyTypeFilter === "all" || s.surveyType === surveyTypeFilter;
      return matchSearch && matchDate && matchType;
    });
  }, [sales, search, interval, surveyTypeFilter]);

  const totalFiltered = filteredSales.reduce((a, s) => a + s.totalAmount, 0);
  const totalPages = Math.max(1, Math.ceil(filteredSales.length / PAGE_SIZE));
  const paginatedSales = filteredSales.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activePresetLabel = useMemo(() => {
    if (!range.from || !range.to) return null;
    for (const p of PRESETS) {
      const r = p.getRange();
      if (
        startOfDay(r.from).getTime() === startOfDay(range.from).getTime() &&
        endOfDay(r.to).getTime() === endOfDay(range.to).getTime()
      ) return p.label;
    }
    return null;
  }, [range]);

  const rangeLabel = range.from
    ? range.to && startOfDay(range.to).getTime() !== startOfDay(range.from).getTime()
      ? `${format(range.from, "MMM d, yyyy")} – ${format(range.to, "MMM d, yyyy")}`
      : format(range.from, "MMM d, yyyy")
    : "Pick a range";

  const getInvoiceForCurrentSale = (saleId: string): Invoice | null => {
    return invoices.find(inv => inv.saleId === saleId) ?? null;
  };

  const handleCreateInvoice = (sale: Sale) => {
    setSelectedSale(sale);
    setInvoiceDialogOpen(true);
  };

  const getTeamName = (teamId?: string) => {
    if (!teamId) return "—";
    const team = teams.find(t => t.id === teamId);
    return team?.name ?? "—";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Sales</h1>
          <p className="text-sm text-muted-foreground mt-1">Total: <span className="font-medium text-foreground">{peso(totalFiltered)}</span></p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> New sale
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search client or location…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <select
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
          value={surveyTypeFilter}
          onChange={(e) => { setSurveyTypeFilter(e.target.value); setPage(1); }}
        >
          <option value="all">All types</option>
          {surveyTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-3 justify-start min-w-[260px] h-10 px-4">
              <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{activePresetLabel ?? "Custom range"}</span>
                <span className="text-sm font-medium truncate">{rangeLabel}</span>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 max-w-[calc(100vw-2rem)]" align="end">
            <div className="flex flex-col sm:flex-row">
              <div className="border-b sm:border-b-0 sm:border-r border-border p-2 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible sm:min-w-[150px] bg-muted/30">
                <div className="hidden sm:block text-[10px] uppercase tracking-wider text-muted-foreground px-3 pt-2 pb-1">Quick select</div>
                {PRESETS.map((p) => {
                  const isActive = activePresetLabel === p.label;
                  return (
                    <button
                      key={p.label}
                      onClick={() => setRange(p.getRange())}
                      className={cn(
                        "text-left text-sm px-3 py-1.5 rounded-sm whitespace-nowrap transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <Calendar
                mode="range"
                selected={range}
                onSelect={(r) => r && setRange(r)}
                numberOfMonths={1}
                defaultMonth={range.from}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Card className="p-4">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm" key={version}>
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-3 px-2 font-medium">Date</th>
                <th className="py-3 px-2 font-medium">Client</th>
                <th className="py-3 px-2 font-medium">Survey Type</th>
                <th className="py-3 px-2 font-medium">Team</th>
                <th className="py-3 px-2 font-medium text-right">Total</th>
                <th className="py-3 px-2 font-medium text-right">Paid</th>
                <th className="py-3 px-2 font-medium">Status</th>
                <th className="py-3 px-2 font-medium">Invoice</th>
                <th className="py-3 px-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSales.map((s) => {
                const invoice = getInvoiceForCurrentSale(s.id);
                return (
                  <tr key={s.id} className="border-b border-border/60 hover:bg-secondary/40 transition-colors">
                    <td className="py-3 px-2 text-muted-foreground whitespace-nowrap">{format(new Date(s.surveyingDay), "MMM d, yyyy")}</td>
                    <td className="py-3 px-2">
                      <Link to={`/ranola-admin/sales/${s.id}`} className="font-medium text-foreground hover:text-primary hover:underline">
                        {s.clientName}
                      </Link>
                      <div className="text-xs text-muted-foreground">{s.checklist.filter(Boolean).length}/{s.checklist.length} req · {s.files.length} files</div>
                    </td>
                    <td className="py-3 px-2"><Badge variant="secondary">{s.surveyType}</Badge></td>
                    <td className="py-3 px-2 text-muted-foreground">{getTeamName(s.assignedTeamId)}</td>
                    <td className="py-3 px-2 text-right">{peso(s.totalAmount)}</td>
                    <td className="py-3 px-2 text-right">{invoice ? peso(invoice.payments.reduce((sum, p) => sum + p.amount, 0)) : "-"}</td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className={statusVariant(s.status)}>{s.status}</Badge>
                    </td>
                    <td className="py-3 px-2">
                      {invoice ? (
                        <Badge variant="outline" className={invoiceStatusVariant(invoice.status)}>
                          <FileText className="h-3 w-3 mr-1" />
                          {invoice.invoiceNumber}
                        </Badge>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleCreateInvoice(s)}>
                          <PlusCircle className="h-3 w-3" /> Create
                        </Button>
                      )}
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
                );
              })}
              {paginatedSales.length === 0 && (
                <tr><td colSpan={9} className="py-12 text-center text-muted-foreground text-sm">No sales found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3" key={`m-${version}`}>
          {paginatedSales.map((s) => {
            const invoice = getInvoiceForCurrentSale(s.id);
            return (
              <div key={s.id} className="border border-border rounded-sm p-4 bg-card">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <Link to={`/ranola-admin/sales/${s.id}`} className="font-medium text-foreground">{s.clientName}</Link>
                  <Badge variant="outline" className={statusVariant(s.status)}>{s.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">{format(new Date(s.surveyingDay), "MMM d, yyyy")} · {s.surveyType}</div>
                {s.location && (
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-3">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                    <span className="leading-snug">{s.location}</span>
                  </div>
                )}
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">{peso(s.totalAmount)}</div>
                    {invoice ? (
                      <Badge variant="outline" className={invoiceStatusVariant(invoice.status) + " mt-1"}>
                        <FileText className="h-3 w-3 mr-1" />
                        {invoice.invoiceNumber}
                      </Badge>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 mt-1" onClick={() => handleCreateInvoice(s)}>
                        <PlusCircle className="h-3 w-3" /> Invoice
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(s); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <DeleteBtn onConfirm={() => { deleteSale(s.id); toast.success("Sale deleted"); refresh(); }} />
                  </div>
                </div>
              </div>
            );
          })}
          {paginatedSales.length === 0 && <p className="py-12 text-center text-muted-foreground text-sm">No sales found.</p>}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>

      <SaleFormDialog open={open} onOpenChange={setOpen} sale={editing} onSaved={refresh} />

      {selectedSale && (
        <InvoiceCreateDialog
          open={invoiceDialogOpen}
          onOpenChange={setInvoiceDialogOpen}
          sale={selectedSale}
          onSaved={() => { refresh(); setSelectedSale(null); }}
        />
      )}
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

const InvoiceCreateDialog = ({
  open,
  onOpenChange,
  sale,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sale: Sale;
  onSaved: () => void;
}) => {
  const [amount, setAmount] = useState(String(sale.totalAmount));
  const [dueDate, setDueDate] = useState<Date>(new Date(sale.surveyingDay));

  const existingInvoice = getInvoiceForSale(sale.id);

  const submit = () => {
    if (existingInvoice) {
      toast.error("Invoice already exists for this sale");
      return;
    }
    const amt = Number(amount);
    if (amt <= 0) {
      toast.error("Valid amount is required");
      return;
    }
    upsertInvoice({
      saleId: sale.id,
      clientId: sale.clientId,
      amount: amt,
      dueDate: dueDate.toISOString(),
      payments: [],
    });
    toast.success("Invoice created");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Create invoice</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label>Client</Label>
            <div className="h-10 flex items-center px-3 rounded-md border border-input bg-muted/40 text-sm">
              {sale.clientName}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="invamount">Amount (₱)</Label>
              <Input
                id="invamount"
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Due date</Label>
              <div className="h-10 flex items-center px-3 rounded-md border border-input bg-muted/40 text-sm">
                {format(dueDate, "MMM d, yyyy")}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Due date is automatically set to the survey date ({format(new Date(sale.surveyingDay), "MMM d, yyyy")}).
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Create invoice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

export default AdminSales;