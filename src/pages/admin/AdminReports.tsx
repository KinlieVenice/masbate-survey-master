import { useMemo, useState } from "react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns";
import { CalendarIcon, FileDown, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { listSales, listExpenses } from "@/lib/adminStore";
import { cn } from "@/lib/utils";

type Range = "day" | "week" | "month" | "year";
const peso = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const AdminReports = () => {
  const [range, setRange] = useState<Range>("month");
  const [anchor, setAnchor] = useState<Date>(new Date());

  const interval = useMemo(() => {
    switch (range) {
      case "day": return { start: startOfDay(anchor), end: endOfDay(anchor) };
      case "week": return { start: startOfWeek(anchor), end: endOfWeek(anchor) };
      case "month": return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
      case "year": return { start: startOfYear(anchor), end: endOfYear(anchor) };
    }
  }, [range, anchor]);

  const sales = listSales().filter((s) => isWithinInterval(new Date(s.surveyingDay), interval));
  const expenses = listExpenses().filter((e) => isWithinInterval(new Date(e.date), interval));
  const revenue = sales.reduce((a, s) => a + s.paidAmount, 0);
  const expenseTotal = expenses.reduce((a, e) => a + e.amount, 0);
  const profit = revenue - expenseTotal;

  const periodLabel = `${format(interval.start, "MMM d, yyyy")} – ${format(interval.end, "MMM d, yyyy")}`;

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
      body: sales.map((s) => [format(new Date(s.surveyingDay), "MMM d, yyyy"), s.clientName, peso(s.totalAmount), peso(s.paidAmount), s.status]),
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

    doc.save(`Ranola_Report_${range}_${format(anchor, "yyyy-MM-dd")}.pdf`);
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
      Paid: s.paidAmount,
      Balance: Math.max(0, s.totalAmount - s.paidAmount),
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

    XLSX.writeFile(wb, `Ranola_Report_${range}_${format(anchor, "yyyy-MM-dd")}.xlsx`);
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

      <div className="flex flex-wrap gap-2">
        <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="h-4 w-4" /> {format(anchor, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={anchor} onSelect={(d) => d && setAnchor(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
          </PopoverContent>
        </Popover>
      </div>

      <div className="text-xs text-muted-foreground">{periodLabel}</div>

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
                  <td className="py-2 px-2 text-right">{peso(s.paidAmount)}</td>
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
