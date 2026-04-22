import { useState } from "react";
import { Plus, Search, Pencil, Trash2, FileText, Receipt, X, PlusCircle } from "lucide-react";
import { format } from "date-fns";
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
import { listInvoices, listClients, listProjects, upsertInvoice, deleteInvoice, computeInvoiceStatus, type Invoice, type InvoiceStatus, type InvoiceScope, type Payment, type PaymentMethod } from "@/lib/adminStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const peso = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const statusVariant = (s: InvoiceStatus) =>
  s === "Paid" ? "bg-primary/15 text-primary border-primary/20" :
  s === "Partial" ? "bg-accent/20 text-accent-foreground border-accent/30" :
  s === "Overdue" ? "bg-destructive/15 text-destructive border-destructive/20" :
  "bg-muted text-muted-foreground border-border";

const paymentMethods: PaymentMethod[] = ["Cash", "Bank Transfer", "GCash", "Check", "Other"];

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
  const projects = listProjects();

  const [scope, setScope] = useState<InvoiceScope>(invoice?.scope ?? "client");
  const [clientId, setClientId] = useState(invoice?.clientId ?? "");
  const [projectId, setProjectId] = useState(invoice?.projectId ?? "");
  const [amount, setAmount] = useState(String(invoice?.amount ?? "0"));
  const [dueDate, setDueDate] = useState<Date | null>(invoice?.dueDate ? new Date(invoice.dueDate) : null);
  const [notes, setNotes] = useState(invoice?.notes ?? "");
  const [payments, setPayments] = useState<Payment[]>(invoice?.payments ?? []);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<{ payment: Payment | null; index: number } | null>(null);

  const selectedProject = projectId ? projects.find((p) => p.id === projectId) : null;

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && invoice) {
      setScope(invoice.scope);
      setClientId(invoice.clientId);
      setProjectId(invoice.projectId ?? "");
      setAmount(String(invoice.amount));
      setDueDate(invoice.dueDate ? new Date(invoice.dueDate) : null);
      setNotes(invoice.notes ?? "");
      setPayments(invoice.payments);
    } else if (isOpen) {
      setScope("client");
      setClientId("");
      setProjectId("");
      setAmount("0");
      setDueDate(null);
      setNotes("");
      setPayments([]);
    }
    onOpenChange(isOpen);
  };

  const handleSavePayment = (payment: Payment) => {
    if (editingPayment !== null) {
      const updated = [...payments];
      updated[editingPayment.index] = payment;
      setPayments(updated);
      setEditingPayment(null);
    } else {
      setPayments((prev) => [...prev, payment]);
    }
  };

  const submit = () => {
    if (!clientId) { toast.error("Please select a client"); return; }
    const amt = Number(amount);
    if (amt <= 0) { toast.error("Valid amount is required"); return; }
    upsertInvoice({
      id: invoice?.id,
      scope,
      clientId,
      projectId: scope === "project" && projectId ? projectId : undefined,
      amount: amt,
      dueDate: dueDate?.toISOString(),
      payments,
      notes: notes.trim() || undefined,
    });
    toast.success(invoice ? "Invoice updated" : "Invoice created");
    onSaved();
    handleOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="font-serif text-2xl">{invoice ? "Edit invoice" : "New invoice"}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Scope *</Label>
                <Select value={scope} onValueChange={(v) => { setScope(v as InvoiceScope); setProjectId(""); if (v === "project") setAmount("0"); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Per Client</SelectItem>
                    <SelectItem value="project">Per Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Client *</Label>
                <Select value={clientId} onValueChange={(v) => { setClientId(v); setProjectId(""); setAmount("0"); }}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients.length === 0 && <p className="text-xs text-muted-foreground p-2">No clients yet.</p>}
                    {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {scope === "project" && (
              <div className="space-y-1.5">
                <Label>Project *</Label>
                <Select value={projectId} onValueChange={(v) => {
                  setProjectId(v);
                  const proj = projects.find((p) => p.id === v);
                  if (proj) setAmount(String(proj.totalAmount));
                }}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects.filter((p) => p.clientId === clientId).length === 0 && (
                      <p className="text-xs text-muted-foreground p-2">No projects for this client.</p>
                    )}
                    {projects.filter((p) => p.clientId === clientId).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title} — {peso(p.totalAmount)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="iamt">Amount (₱) *</Label>
                <Input
                  id="iamt"
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Payments ({payments.length})</Label>
                <Button variant="outline" size="sm" onClick={() => { setEditingPayment(null); setPaymentDialogOpen(true); }} className="gap-1 h-8">
                  <Plus className="h-3 w-3" /> Record payment
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
          <Button onClick={submit}>{invoice ? "Save changes" : "Create invoice"}</Button>
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

const AdminBilling = () => {
  const [version, setVersion] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = () => setVersion((v) => v + 1);

  const all = listInvoices();
  const clients = listClients();
  const projects = listProjects();

  const filtered = all.filter((inv) => {
    const q = search.toLowerCase();
    const client = clients.find((c) => c.id === inv.clientId);
    const project = inv.projectId ? projects.find((p) => p.id === inv.projectId) : null;
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(q) ||
      (client?.name ?? "").toLowerCase().includes(q) ||
      (project?.title ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    const matchScope = scopeFilter === "all" || inv.scope === scopeFilter;
    return matchSearch && matchStatus && matchScope;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const totalPaid = (inv: Invoice) => inv.payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and track invoices for clients and projects.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> New invoice
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoice #, client, project…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
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
          <select
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            value={scopeFilter}
            onChange={(e) => { setScopeFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All scopes</option>
            <option value="client">Per Client</option>
            <option value="project">Per Project</option>
          </select>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm" key={version}>
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-3 px-2 font-medium">Invoice #</th>
                <th className="py-3 px-2 font-medium">Client</th>
                <th className="py-3 px-2 font-medium">Project</th>
                <th className="py-3 px-2 font-medium">Scope</th>
                <th className="py-3 px-2 font-medium text-right">Amount</th>
                <th className="py-3 px-2 font-medium text-right">Paid</th>
                <th className="py-3 px-2 font-medium">Status</th>
                <th className="py-3 px-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((inv) => {
                const client = clients.find((c) => c.id === inv.clientId);
                const project = inv.projectId ? projects.find((p) => p.id === inv.projectId) : null;
                const paid = totalPaid(inv);
                return (
                  <tr key={inv.id} className="border-b border-border/60 hover:bg-secondary/40 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <div className="font-medium text-foreground">{inv.invoiceNumber}</div>
                          <div className="text-xs text-muted-foreground">{format(new Date(inv.createdAt), "MMM d, yyyy")}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">{client?.name ?? "—"}</td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">
                      {project ? <span title={project.title} className="truncate max-w-[150px] block">{project.title}</span> : <span className="italic text-muted-foreground/50">—</span>}
                    </td>
                    <td className="py-3 px-2 text-xs">
                      <Badge variant="secondary">{inv.scope === "client" ? "Client" : "Project"}</Badge>
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
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(inv); setOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DeleteBtn onConfirm={() => { deleteInvoice(inv.id); toast.success("Invoice deleted"); refresh(); }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-muted-foreground text-sm">
                  {search || statusFilter !== "all" || scopeFilter !== "all" ? "No invoices match your filters" : "No invoices yet. Create your first invoice."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Showing {(pageSafe - 1) * PAGE_SIZE + 1}–{Math.min(pageSafe * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={pageSafe === 1}>«</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageSafe === 1}>‹</Button>
              <span className="flex items-center px-3 text-sm text-muted-foreground">Page {pageSafe} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={pageSafe === totalPages}>›</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={pageSafe === totalPages}>»</Button>
            </div>
          </div>
        )}

        <div className="md:hidden space-y-3 mt-4">
          {paginated.map((inv) => {
            const client = clients.find((c) => c.id === inv.clientId);
            const project = inv.projectId ? projects.find((p) => p.id === inv.projectId) : null;
            const paid = totalPaid(inv);
            return (
              <div key={inv.id} className="border border-border rounded-sm p-4 bg-card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-foreground">{inv.invoiceNumber}</div>
                    <div className="text-xs text-muted-foreground">{client?.name ?? "—"}</div>
                  </div>
                  <Badge variant="outline" className={statusVariant(inv.status)}>{inv.status}</Badge>
                </div>
                {project && <div className="text-xs text-muted-foreground mb-1">{project.title}</div>}
                <div className="text-xs text-muted-foreground mb-3">
                  {peso(paid)} paid / {peso(inv.amount)}
                </div>
                <div className="flex gap-1 justify-end">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(inv); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DeleteBtn onConfirm={() => { deleteInvoice(inv.id); toast.success("Invoice deleted"); refresh(); }} />
                </div>
              </div>
            );
          })}
          {paginated.length === 0 && (
            <p className="py-8 text-center text-muted-foreground text-sm">
              {search || statusFilter !== "all" || scopeFilter !== "all" ? "No invoices found" : "No invoices yet."}
            </p>
          )}
        </div>
      </Card>

      <InvoiceFormDialog open={open} onOpenChange={setOpen} invoice={editing} onSaved={refresh} />
    </div>
  );
};

export default AdminBilling;