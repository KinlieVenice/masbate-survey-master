import { useMemo, useState } from "react";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, subDays, subMonths } from "date-fns";
import { CalendarIcon, FileDown, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { listSales, listExpenses, listInvoices } from "@/lib/adminStore";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

const peso = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const getSalePaid = (saleId: string, invoices: ReturnType<typeof listInvoices>) =>
  invoices.find(i => i.saleId === saleId)?.payments.reduce((sum, p) => sum + p.amount, 0) ?? 0;

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

const AdminReports = () => {
  const [range, setRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const interval = useMemo(() => ({
    start: startOfDay(range.from ?? new Date()),
    end: endOfDay(range.to ?? range.from ?? new Date()),
  }), [range]);

  const sales = listSales().filter((s) => isWithinInterval(new Date(s.surveyingDay), interval));
  const expenses = listExpenses().filter((e) => isWithinInterval(new Date(e.date), interval));
  const invoices = listInvoices();
  const revenue = sales.reduce((a, s) => {
    const inv = invoices.find(i => i.saleId === s.id);
    return a + (inv ? inv.payments.reduce((sum, p) => sum + p.amount, 0) : 0);
  }, 0);
  const expenseTotal = expenses.reduce((a, e) => a + e.amount, 0);
  const profit = revenue - expenseTotal;

  const periodLabel = `${format(interval.start, "MMM d, yyyy")} – ${format(interval.end, "MMM d, yyyy")}`;

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

  const fileSlug = `${format(interval.start, "yyyy-MM-dd")}_to_${format(interval.end, "yyyy-MM-dd")}`;

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Rañola Surveying Services", 14, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Revenue & Expense Report", 14, 28);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Period: ${periodLabel}`, 14, 34);
    doc.text(`Generated: ${format(new Date(), "PPP p")}`, 14, 39);
    doc.setTextColor(0);

    autoTable(doc, {
      startY: 46,
      head: [["Summary", "Amount (PHP)"]],
      body: [
        ["Total Revenue", peso(revenue)],
        ["Total Expenses", peso(expenseTotal)],
        ["Net Profit", peso(profit)],
        ["Number of Sales", String(sales.length)],
        ["Number of Expenses", String(expenses.length)],
      ],
      theme: "striped",
      headStyles: { fillColor: [27, 67, 50] },
    });

    autoTable(doc, {
      head: [["Date", "Client", "Total", "Paid", "Status"]],
      body: sales.map((s) => [format(new Date(s.surveyingDay), "MMM d, yyyy"), s.clientName, peso(s.totalAmount), peso(getSalePaid(s.id, invoices)), s.status]),
      theme: "grid",
      headStyles: { fillColor: [27, 67, 50] },
      didDrawPage: (d) => { doc.text("Sales", 14, (d.cursor?.y ?? 30) - 4); },
      margin: { top: 24 },
    });

    autoTable(doc, {
      head: [["Date", "Name", "Category", "Amount"]],
      body: expenses.map((e) => [format(new Date(e.date), "MMM d, yyyy"), e.name, e.category, peso(e.amount)]),
      theme: "grid",
      headStyles: { fillColor: [27, 67, 50] },
      didDrawPage: (d) => { doc.text("Expenses", 14, (d.cursor?.y ?? 30) - 4); },
      margin: { top: 24 },
    });

    doc.save(`Ranola_Report_${fileSlug}.pdf`);
  };

  const exportXlsx = () => {
    const wb = XLSX.utils.book_new();

    const summary = [
      ["Rañola Surveying Services"],
      ["Revenue & Expense Report"],
      ["Period", periodLabel],
      ["Generated", format(new Date(), "PPP p")],
      [],
      ["Total Revenue", revenue],
      ["Total Expenses", expenseTotal],
      ["Net Profit", profit],
      ["Number of Sales", sales.length],
      ["Number of Expenses", expenses.length],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(summary);
    ws1["!cols"] = [{ wch: 24 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Summary");

    const ws2 = XLSX.utils.json_to_sheet(sales.map((s) => ({
      Date: format(new Date(s.surveyingDay), "yyyy-MM-dd"),
      Client: s.clientName,
      Total: s.totalAmount,
      Paid: getSalePaid(s.id, invoices),
      Balance: Math.max(0, s.totalAmount - getSalePaid(s.id, invoices)),
      Status: s.status,
    })));
    XLSX.utils.book_append_sheet(wb, ws2, "Sales");

    const ws3 = XLSX.utils.json_to_sheet(expenses.map((e) => ({
      Date: format(new Date(e.date), "yyyy-MM-dd"),
      Name: e.name,
      Category: e.category,
      Description: e.description,
      Amount: e.amount,
    })));
    XLSX.utils.book_append_sheet(wb, ws3, "Expenses");

    XLSX.writeFile(wb, `Ranola_Report_${fileSlug}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Revenue & income</h1>
          <p className="text-sm text-muted-foreground mt-1">Filter by period and export to PDF or Excel.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportXlsx} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
          <Button onClick={exportPdf} className="gap-2">
            <FileDown className="h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-3 justify-start min-w-[260px] h-12 px-4">
              <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{activePresetLabel ?? "Custom range"}</span>
                <span className="text-sm font-medium truncate">{rangeLabel}</span>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 max-w-[calc(100vw-2rem)]" align="start">
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

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Revenue</div>
          <div className="font-serif text-2xl text-primary mt-2">{peso(revenue)}</div>
          <div className="text-xs text-muted-foreground mt-1">{sales.length} sales</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Expenses</div>
          <div className="font-serif text-2xl text-destructive mt-2">{peso(expenseTotal)}</div>
          <div className="text-xs text-muted-foreground mt-1">{expenses.length} entries</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Profit</div>
          <div className={`font-serif text-2xl mt-2 ${profit >= 0 ? "text-primary" : "text-destructive"}`}>{peso(profit)}</div>
          <div className="text-xs text-muted-foreground mt-1">{profit >= 0 ? "Positive" : "Negative"}</div>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="font-serif text-xl px-2 pt-2 mb-4">Sales in period</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-2 px-2 font-medium">Date</th>
                <th className="py-2 px-2 font-medium">Client</th>
                <th className="py-2 px-2 font-medium text-right">Total</th>
                <th className="py-2 px-2 font-medium text-right">Paid</th>
                <th className="py-2 px-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-b border-border/60">
                  <td className="py-2 px-2 text-muted-foreground">{format(new Date(s.surveyingDay), "MMM d, yyyy")}</td>
                  <td className="py-2 px-2">{s.clientName}</td>
                  <td className="py-2 px-2 text-right">{peso(s.totalAmount)}</td>
                  <td className="py-2 px-2 text-right">{peso(getSalePaid(s.id, invoices))}</td>
                  <td className="py-2 px-2 text-muted-foreground">{s.status}</td>
                </tr>
              ))}
              {sales.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No sales in period.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-serif text-xl px-2 pt-2 mb-4">Expenses in period</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-2 px-2 font-medium">Date</th>
                <th className="py-2 px-2 font-medium">Name</th>
                <th className="py-2 px-2 font-medium">Category</th>
                <th className="py-2 px-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b border-border/60">
                  <td className="py-2 px-2 text-muted-foreground">{format(new Date(e.date), "MMM d, yyyy")}</td>
                  <td className="py-2 px-2">{e.name}</td>
                  <td className="py-2 px-2 text-muted-foreground">{e.category}</td>
                  <td className="py-2 px-2 text-right">{peso(e.amount)}</td>
                </tr>
              ))}
              {expenses.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No expenses in period.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminReports;
