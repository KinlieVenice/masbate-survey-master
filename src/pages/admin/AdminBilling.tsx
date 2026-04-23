import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Pencil, Trash2, FileText, X, PlusCircle, CalendarIcon, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, endOfYear, isWithinInterval, subDays, subMonths, startOfYear } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { listInvoices, listClients, listSales, upsertInvoice, deleteInvoice, computeInvoiceStatus, upsertSale, getSale, type Invoice, type InvoiceStatus, type Payment, type PaymentMethod } from "@/lib/adminStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

const PAGE_SIZE = 10;
const peso = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const statusVariant = (s: InvoiceStatus) =>
  s === "Paid" ? "bg-primary/15 text-primary border-primary/20" :
  s === "Partial" ? "bg-accent/20 text-accent-foreground border-accent/30" :
  s === "Overdue" ? "bg-destructive/15 text-destructive border-destructive/20" :
  "bg-muted text-muted-foreground border-border";

const paymentMethods: PaymentMethod[] = ["Cash", "Bank Transfer", "GCash", "Check", "Other"];

type Preset = { label: string; getRange: () => { from: Date; to: Date } };

const PRESETS: Preset[] = [
  { label: "Today", getRange: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { label: "Last 7 days", getRange: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }) },
  { label: "Last 30 days", getRange: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }) },
  { label: "This month", getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: "Last month", getRange: () => { const d = subMonths(new Date(), 1); return { from: startOfMonth(d), to: endOfMonth(d) }; } },
  { label: "This year", getRange: () => ({ from: startOfMonth(new Date()), to: endOfYear(new Date()) }) },
];

const PaymentFormDialog = ({
  open,
  onOpenChange,
  payment,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  payment: Payment | null;
  onSaved: (p: Payment) => void;
}) => {
  const [amount, setAmount] = useState(String(payment?.amount ?? ""));
  const [method, setMethod] = useState<PaymentMethod>(payment?.method ?? "Cash");
  const [reference, setReference] = useState(payment?.reference ?? "");
  const [notes, setNotes] = useState(payment?.notes ?? "");
  const [date, setDate] = useState<Date>(payment ? new Date(payment.date) : new Date());

  const submit = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { toast.error("Valid amount is required"); return; }
    onSaved({
      id: payment?.id ?? Math.random().toString(36).slice(2, 10),
      date: date.toISOString(),
      amount: amt,
      method,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-serif text-xl">{payment ? "Edit payment" : "Record payment"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date</Label>
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
              <Label htmlFor="pamt">Amount (₱) *</Label>
              <Input id="pamt" type="number" min={0.01} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Payment method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{paymentMethods.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pref">Reference / Transaction #</Label>
            <Input id="pref" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Optional" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pnotes">Notes</Label>
            <Input id="pnotes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" maxLength={200} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{payment ? "Save" : "Record payment"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const InvoiceFormDialog = ({
  open,
  onOpenChange,
  invoice,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  invoice: Invoice | null;
  onSaved: () => void;
}) => {
  const clients = listClients();
  const sales = listSales();

  const [amount, setAmount] = useState(String(invoice?.amount ?? "0"));
  const [dueDate, setDueDate] = useState<Date | null>(invoice?.dueDate ? new Date(invoice.dueDate) : null);
  const [notes, setNotes] = useState(invoice?.notes ?? "");
  const [payments, setPayments] = useState<Payment[]>(invoice?.payments ?? []);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<{ payment: Payment | null; index: number } | null>(null);
  const [amountWarning, setAmountWarning] = useState(false);

  const selectedSale = invoice?.saleId ? sales.find((s) => s.id === invoice.saleId) : null;
  const client = invoice?.clientId ? clients.find((c) => c.id === invoice.clientId) : null;

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && invoice) {
      setAmount(String(invoice.amount));
      setDueDate(invoice.dueDate ? new Date(invoice.dueDate) : null);
      setNotes(invoice.notes ?? "");
      setPayments(invoice.payments);
      setAmountWarning(false);
    } else if (isOpen) {
      setAmount("0");
      setDueDate(null);
      setNotes("");
      setPayments([]);
      setAmountWarning(false);
    }
    onOpenChange(isOpen);
  };

  const handleAmountChange = (newAmount: string) => {
    setAmount(newAmount);
    if (selectedSale) {
      const origAmount = invoice?.amount ?? selectedSale.totalAmount;
      const newAmt = Number(newAmount) || 0;
      if (newAmt !== origAmount) {
        setAmountWarning(true);
      } else {
        setAmountWarning(false);
      }
    }
  };

  const handleSavePayment = (payment: Payment) => {
    if (editingPayment !== null && editingPayment.index >= 0) {
      const updated = [...payments];
      updated[editingPayment.index] = payment;
      setPayments(updated);
      setEditingPayment(null);
    } else {
      setPayments((prev) => [...prev, payment]);
    }
  };

  const submit = () => {
    if (!client) { toast.error("Please select a client"); return; }
    const amt = Number(amount);
    if (amt <= 0) { toast.error("Valid amount is required"); return; }

    upsertInvoice({
      id: invoice?.id,
      clientId: client.id,
      saleId: invoice?.saleId ?? selectedSale?.id ?? "",
      amount: amt,
      dueDate: dueDate?.toISOString(),
      payments,
      notes: notes.trim() || undefined,
    });

    if (selectedSale && amt !== selectedSale.totalAmount) {
      upsertSale({
        id: selectedSale.id,
        clientId: selectedSale.clientId,
        clientName: selectedSale.clientName,
        location: selectedSale.location,
        surveyingDay: selectedSale.surveyingDay,
        totalAmount: amt,
        surveyType: selectedSale.surveyType,
        assignedTeamId: selectedSale.assignedTeamId,
        checklist: selectedSale.checklist,
        files: selectedSale.files,
        remarks: selectedSale.remarks,
      });
      toast.success("Invoice updated. Sale amount also updated.");
    } else {
      toast.success("Invoice updated");
    }
    onSaved();
    handleOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="font-serif text-2xl">Edit invoice</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            <div className="bg-accent/10 border border-accent/20 rounded-sm p-3 text-sm">
              <p className="text-foreground/80">This invoice was created from a Sale. Client and scope cannot be changed.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Client</Label>
                <div className="h-10 flex items-center px-3 rounded-md border border-input bg-muted/40 text-sm">
                  {client?.name ?? "—"}
                </div>
              </div>
              {selectedSale && (
                <div className="space-y-1.5">
                  <Label>Sale</Label>
                  <div className="h-10 flex items-center px-3 rounded-md border border-input bg-muted/40 text-sm">
                    {selectedSale.clientName} — {peso(selectedSale.totalAmount)}
                  </div>
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="iamt">Amount (₱) *</Label>
                <Input
                  id="iamt"
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  onFocus={(e) => { if (e.target.value === "0") setAmount(""); e.target.select(); }}
                  onBlur={(e) => { if (e.target.value === "") setAmount("0"); }}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Due date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2 font-normal">
                      <CalendarIcon className="h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "No due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dueDate ?? undefined} onSelect={(d) => { setDueDate(d ?? null); }} className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {amountWarning && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-sm p-3">
                <p className="text-sm text-destructive">
                  Warning: Changing the amount will also update the Sale's total amount to {peso(Number(amount) || 0)}.
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Payments ({payments.length})</Label>
                <Button variant="outline" size="sm" onClick={() => { setEditingPayment(null); setPaymentDialogOpen(true); }} className="gap-1 h-8">
                  <PlusCircle className="h-3 w-3" /> Record payment
                </Button>
              </div>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-sm">No payments recorded yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {payments.map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-sm bg-muted/40 border border-border text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">{format(new Date(p.date), "MMM d, yyyy")}</div>
                        <div className="font-medium text-foreground">{peso(p.amount)}</div>
                        <div className="text-xs text-muted-foreground">{p.method}{p.reference ? ` · ${p.reference}` : ""}</div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingPayment({ payment: p, index: i }); setPaymentDialogOpen(true); }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setPayments((prev) => prev.filter((_, idx) => idx !== i))}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {payments.length > 0 && (
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">Total paid: </span>
                  <span className="font-medium text-primary">{peso(payments.reduce((s, p) => s + p.amount, 0))}</span>
                  <span className="text-muted-foreground"> / {peso(Number(amount) || 0)}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inotes">Notes</Label>
              <Textarea id="inotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional notes…" maxLength={500} />
            </div>
          </div>
        </div>
        <DialogFooter className="px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={() => handleOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>

      {paymentDialogOpen && (
        <PaymentFormDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          payment={editingPayment?.payment ?? null}
          onSaved={handleSavePayment}
        />
      )}
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

const DeleteBtn = ({ onConfirm }: { onConfirm: () => void }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete this invoice?</AlertDialogTitle>
        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const downloadInvoicePdf = (inv: Invoice, sale: ReturnType<typeof listSales>[0] | undefined, client: ReturnType<typeof listClients>[0] | undefined) => {
  const doc = new jsPDF();
  const pesoFmt = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
  const paid = inv.payments.reduce((s, p) => s + p.amount, 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("INVOICE", 14, 22);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(inv.invoiceNumber, 14, 30);

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Date: ${format(new Date(inv.createdAt), "MMMM d, yyyy")}`, 14, 40);
  if (inv.dueDate) doc.text(`Due: ${format(new Date(inv.dueDate), "MMMM d, yyyy")}`, 14, 45);
  doc.setTextColor(0);

  doc.setFontSize(10);
  doc.text(`Client: ${client?.name ?? "—"}`, 14, 55);
  if (sale) doc.text(`Sale: ${sale.clientName}`, 14, 61);

  autoTable(doc, {
    startY: 68,
    head: [["Description", "Amount (PHP)"]],
    body: [
      ["Total Amount", pesoFmt(inv.amount)],
      ["Amount Paid", pesoFmt(paid)],
      ["Balance Due", pesoFmt(Math.max(0, inv.amount - paid))],
    ],
    theme: "striped",
    headStyles: { fillColor: [27, 67, 50] },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });

  if (inv.payments.length > 0) {
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Date", "Method", "Reference", "Amount (PHP)"]],
      body: inv.payments.map((p) => [
        format(new Date(p.date), "MMM d, yyyy"),
        p.method,
        p.reference ?? "—",
        pesoFmt(p.amount),
      ]),
      theme: "grid",
      headStyles: { fillColor: [27, 67, 50] },
      columnStyles: { 3: { halign: "right" } },
      margin: { left: 14, right: 14 },
    });
  }

  if (inv.notes) {
    const notesY = (doc as any).lastAutoTable?.finalY + 10 ?? 150;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Notes:", 14, notesY);
    doc.setTextColor(0);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(inv.notes, 182);
    doc.text(lines, 14, notesY + 5);
  }

  doc.save(`Invoice_${inv.invoiceNumber}.pdf`);
};

const AdminBilling = () => {
  const [version, setVersion] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [range, setRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = () => setVersion((v) => v + 1);

  const all = listInvoices();
  const clients = listClients();
  const sales = listSales();

  const interval = useMemo(() => ({
    start: startOfDay(range.from ?? new Date()),
    end: endOfDay(range.to ?? range.from ?? new Date()),
  }), [range]);

  const filtered = useMemo(() => {
    return all.filter((inv) => {
      const q = search.toLowerCase();
      const client = clients.find((c) => c.id === inv.clientId);
      const sale = inv.saleId ? sales.find((s) => s.id === inv.saleId) : null;
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(q) ||
        (client?.name ?? "").toLowerCase().includes(q) ||
        (sale?.clientName ?? "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || inv.status === statusFilter;
      const matchDate = isWithinInterval(new Date(inv.createdAt), interval);
      return matchSearch && matchStatus && matchDate;
    });
  }, [all, clients, sales, search, statusFilter, interval]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  const totalPaid = (inv: Invoice) => inv.payments.reduce((s, p) => s + p.amount, 0);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage invoices. Invoices are created from Sales.</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoice #, client…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
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
          <select
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All statuses</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

      <Card className="p-4">
        

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm" key={version}>
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-3 px-2 font-medium">Invoice #</th>
                <th className="py-3 px-2 font-medium">Client</th>
                <th className="py-3 px-2 font-medium">Sale</th>
                <th className="py-3 px-2 font-medium text-right">Amount</th>
                <th className="py-3 px-2 font-medium text-right">Paid</th>
                <th className="py-3 px-2 font-medium">Status</th>
                <th className="py-3 px-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((inv) => {
                const client = clients.find((c) => c.id === inv.clientId);
                const sale = inv.saleId ? sales.find((s) => s.id === inv.saleId) : null;
                const paid = totalPaid(inv);
                return (
                  <tr key={inv.id} className="border-b border-border/60 hover:bg-secondary/40 transition-colors">
                    <td className="py-3 px-2">
                      {inv.saleId ? (
                        <Link to={`/ranola-admin/sales/${inv.saleId}`} className="flex items-center gap-2 hover:text-primary">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <div>
                            <div className="font-medium text-foreground hover:underline">{inv.invoiceNumber}</div>
                            <div className="text-xs text-muted-foreground">{format(new Date(inv.createdAt), "MMM d, yyyy")}</div>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <div>
                            <div className="font-medium text-foreground">{inv.invoiceNumber}</div>
                            <div className="text-xs text-muted-foreground">{format(new Date(inv.createdAt), "MMM d, yyyy")}</div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">{client?.name ?? "—"}</td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">
                      {sale ? <span className="truncate max-w-[150px] block">{sale.clientName}</span> :
                       <span className="italic text-muted-foreground/50">—</span>}
                    </td>
                    <td className="py-3 px-2 text-right">{peso(inv.amount)}</td>
                    <td className="py-3 px-2 text-right">
                      <span className={paid >= inv.amount ? "text-primary" : "text-accent-foreground"}>{peso(paid)}</span>
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className={statusVariant(inv.status)}>{inv.status}</Badge>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="inline-flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => downloadInvoicePdf(inv, sale, client)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <DeleteBtn onConfirm={() => { deleteInvoice(inv.id); toast.success("Invoice deleted"); refresh(); }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                  {search || statusFilter !== "all" ? "No invoices match your filters" : "No invoices yet. Create invoices from Sales."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageSafe === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Page {pageSafe} of {totalPages}</span>
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={pageSafe === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="md:hidden space-y-3 mt-4">
          {paginated.map((inv) => {
            const client = clients.find((c) => c.id === inv.clientId);
            const sale = inv.saleId ? sales.find((s) => s.id === inv.saleId) : null;
            const paid = totalPaid(inv);
            return (
              <div key={inv.id} className="border border-border rounded-sm p-4 bg-card">
                <div className="flex items-start justify-between mb-2">
                  {inv.saleId ? (
                    <Link to={`/ranola-admin/sales/${inv.saleId}`} className="font-medium text-foreground hover:text-primary">
                      {inv.invoiceNumber}
                    </Link>
                  ) : (
                    <div className="font-medium text-foreground">{inv.invoiceNumber}</div>
                  )}
                  <Badge variant="outline" className={statusVariant(inv.status)}>{inv.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{client?.name ?? "—"}</div>
                {sale && <div className="text-xs text-muted-foreground mb-1">{sale.clientName}</div>}
                <div className="text-xs text-muted-foreground mb-3">
                  {peso(paid)} paid / {peso(inv.amount)}
                </div>
                <div className="flex gap-1 justify-end">
                  <Button variant="ghost" size="icon" onClick={() => downloadInvoicePdf(inv, sale, client)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <DeleteBtn onConfirm={() => { deleteInvoice(inv.id); toast.success("Invoice deleted"); refresh(); }} />
                </div>
              </div>
            );
          })}
          {paginated.length === 0 && (
            <p className="py-8 text-center text-muted-foreground text-sm">
              {search || statusFilter !== "all" ? "No invoices found" : "No invoices yet."}
            </p>
          )}
        </div>
      </Card>

      <InvoiceFormDialog open={open} onOpenChange={setOpen} invoice={editing} onSaved={refresh} />
    </div>
  );
};

export default AdminBilling;