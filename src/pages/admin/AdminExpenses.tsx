import { useState, useMemo } from "react";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, subMonths, isWithinInterval, startOfYear, endOfYear } from "date-fns";
import { z } from "zod";
import { Plus, Pencil, Trash2, Search, CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { listExpenses, upsertExpense, deleteExpense, EXPENSE_CATEGORIES, type Expense } from "@/lib/adminStore";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { useEffect } from "react";

const schema = z.object({
  name: z.string().trim().min(2, "Name required").max(120),
  description: z.string().trim().max(500),
  category: z.string().min(1),
  amount: z.number().min(0),
});

const peso = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

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

const AdminExpenses = () => {
  const [version, setVersion] = useState(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [range, setRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const refresh = () => setVersion((v) => v + 1);

  const expenses = listExpenses();
  const interval = useMemo(() => ({
    start: startOfDay(range.from ?? new Date()),
    end: endOfDay(range.to ?? range.from ?? new Date()),
  }), [range]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch = search === "" ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase());
      const matchDate = isWithinInterval(new Date(e.date), interval);
      return matchSearch && matchDate;
    });
  }, [expenses, search, interval]);

  const totalFiltered = filteredExpenses.reduce((a, e) => a + e.amount, 0);
  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / pageSize));
  const paginatedExpenses = filteredExpenses.slice((page - 1) * pageSize, page * pageSize);

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
          <h1 className="font-serif text-3xl text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground mt-1">Total tracked: <span className="font-medium text-foreground">{peso(totalFiltered)}</span></p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> New expense
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, category, description…"
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
      </div>

      <Card className="p-4" key={version}>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-3 px-2 font-medium">Date</th>
                <th className="py-3 px-2 font-medium">Name</th>
                <th className="py-3 px-2 font-medium">Description</th>
                <th className="py-3 px-2 font-medium">Category</th>
                <th className="py-3 px-2 font-medium text-right">Amount</th>
                <th className="py-3 px-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExpenses.map((e) => (
                <tr key={e.id} className="border-b border-border/60 hover:bg-secondary/40">
                  <td className="py-3 px-2 text-muted-foreground">{format(new Date(e.date), "MMM d, yyyy")}</td>
                  <td className="py-3 px-2 font-medium text-foreground">{e.name}</td>
                  <td className="py-3 px-2 text-muted-foreground max-w-xs truncate">{e.description}</td>
                  <td className="py-3 px-2"><Badge variant="secondary">{e.category}</Badge></td>
                  <td className="py-3 px-2 text-right">{peso(e.amount)}</td>
                  <td className="py-3 px-2 text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(e); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteBtn onConfirm={() => { deleteExpense(e.id); toast.success("Expense deleted"); refresh(); }} />
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedExpenses.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No expenses found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {paginatedExpenses.map((e) => (
            <div key={e.id} className="border border-border rounded-sm p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="font-medium">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{format(new Date(e.date), "MMM d, yyyy")}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{peso(e.amount)}</div>
                  <Badge variant="secondary" className="mt-1">{e.category}</Badge>
                </div>
              </div>
              {e.description && <p className="text-sm text-muted-foreground mb-3">{e.description}</p>}
              <div className="flex gap-1 justify-end">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(e); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <DeleteBtn onConfirm={() => { deleteExpense(e.id); toast.success("Expense deleted"); refresh(); }} />
              </div>
            </div>
          ))}
          {paginatedExpenses.length === 0 && <p className="py-12 text-center text-muted-foreground">No expenses found.</p>}
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

      <ExpenseFormDialog open={open} onOpenChange={setOpen} expense={editing} onSaved={refresh} />
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
        <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const ExpenseFormDialog = ({ open, onOpenChange, expense, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; expense: Expense | null; onSaved: () => void }) => {
  const [name, setName] = useState(expense?.name ?? "");
  const [description, setDescription] = useState(expense?.description ?? "");
  const [category, setCategory] = useState(expense?.category ?? EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState(String(expense?.amount ?? 0));
  const [date, setDate] = useState(expense?.date ?? new Date().toISOString());

  useEffect(() => {
    if (open) {
      setName(expense?.name ?? "");
      setDescription(expense?.description ?? "");
      setCategory(expense?.category ?? EXPENSE_CATEGORIES[0]);
      setAmount(String(expense?.amount ?? 0));
      setDate(expense?.date ?? new Date().toISOString());
    }
  }, [open, expense]);

  const submit = () => {
    try {
      const v = schema.parse({ name, description, category, amount: Number(amount) || 0 });
      upsertExpense({ id: expense?.id, name: v.name, description: v.description, category: v.category, amount: v.amount, date });
      toast.success(expense ? "Expense updated" : "Expense added");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.errors[0].message : "Failed";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{expense ? "Edit expense" : "New expense"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ename">Name</Label>
            <Input id="ename" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edesc">Description</Label>
            <Textarea id="edesc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="eamount">Amount (₱)</Label>
              <Input id="eamount" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{expense ? "Save changes" : "Add expense"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminExpenses;