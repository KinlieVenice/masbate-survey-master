import { useState } from "react";
import { format } from "date-fns";
import { z } from "zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { listExpenses, upsertExpense, deleteExpense, EXPENSE_CATEGORIES, type Expense } from "@/lib/adminStore";

const schema = z.object({
  name: z.string().trim().min(2, "Name required").max(120),
  description: z.string().trim().max(500),
  category: z.string().min(1),
  amount: z.number().min(0),
});

const peso = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const AdminExpenses = () => {
  const [version, setVersion] = useState(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const expenses = listExpenses();
  const total = expenses.reduce((a, e) => a + e.amount, 0);

  const refresh = () => setVersion((v) => v + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground mt-1">Total tracked: <span className="font-medium text-foreground">{peso(total)}</span></p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> New expense
        </Button>
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
              {expenses.map((e) => (
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
              {expenses.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No expenses yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {expenses.map((e) => (
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
          {expenses.length === 0 && <p className="py-12 text-center text-muted-foreground">No expenses yet.</p>}
        </div>
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

  // Reset on open
  useState(() => {
    setName(expense?.name ?? "");
    setDescription(expense?.description ?? "");
    setCategory(expense?.category ?? EXPENSE_CATEGORIES[0]);
    setAmount(String(expense?.amount ?? 0));
    setDate(expense?.date ?? new Date().toISOString());
  });

  // Re-init when dialog opens with new expense
  useReinit(open, expense, { setName, setDescription, setCategory, setAmount, setDate });

  const submit = () => {
    try {
      const v = schema.parse({ name, description, category, amount: Number(amount) || 0 });
      upsertExpense({ id: expense?.id, ...v, date });
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
          <div className="space-y-1.5">
            <Label htmlFor="edate">Date</Label>
            <Input id="edate" type="date" value={date.slice(0, 10)} onChange={(e) => setDate(new Date(e.target.value).toISOString())} />
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

import { useEffect } from "react";
function useReinit(open: boolean, expense: Expense | null, setters: { setName: (s: string) => void; setDescription: (s: string) => void; setCategory: (s: string) => void; setAmount: (s: string) => void; setDate: (s: string) => void }) {
  useEffect(() => {
    if (open) {
      setters.setName(expense?.name ?? "");
      setters.setDescription(expense?.description ?? "");
      setters.setCategory(expense?.category ?? EXPENSE_CATEGORIES[0]);
      setters.setAmount(String(expense?.amount ?? 0));
      setters.setDate(expense?.date ?? new Date().toISOString());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, expense]);
}

export default AdminExpenses;
