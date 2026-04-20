import { useMemo, useState } from "react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, isWithinInterval, addDays } from "date-fns";
import { CalendarIcon, TrendingUp, Wallet, Receipt, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { listSales, listExpenses } from "@/lib/adminStore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

type Range = "day" | "week" | "month" | "year";

const peso = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const AdminDashboard = () => {
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

  const sales = listSales();
  const expenses = listExpenses();

  const filteredSales = sales.filter((s) => isWithinInterval(new Date(s.surveyingDay), interval));
  const filteredExpenses = expenses.filter((e) => isWithinInterval(new Date(e.date), interval));

  const revenue = filteredSales.reduce((a, s) => a + s.paidAmount, 0);
  const expenseTotal = filteredExpenses.reduce((a, e) => a + e.amount, 0);
  const profit = revenue - expenseTotal;

  const chartData = useMemo(() => {
    const days = eachDayOfInterval(interval);
    return days.map((d) => {
      const dayInt = { start: startOfDay(d), end: endOfDay(d) };
      const rev = sales.filter((s) => isWithinInterval(new Date(s.surveyingDay), dayInt)).reduce((a, s) => a + s.paidAmount, 0);
      const exp = expenses.filter((e) => isWithinInterval(new Date(e.date), dayInt)).reduce((a, e) => a + e.amount, 0);
      return { date: format(d, days.length > 60 ? "MMM" : "MMM d"), revenue: rev, profit: rev - exp };
    });
  }, [interval, sales, expenses]);

  const upcoming = useMemo(() => {
    const now = new Date();
    const in7 = addDays(now, 7);
    return sales
      .filter((s) => {
        const d = new Date(s.surveyingDay);
        return d >= startOfDay(now) && d <= endOfDay(in7);
      })
      .sort((a, b) => +new Date(a.surveyingDay) - +new Date(b.surveyingDay));
  }, [sales]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of revenue, profit, and surveys.</p>
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
                <CalendarIcon className="h-4 w-4" />
                {format(anchor, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={anchor} onSelect={(d) => d && setAnchor(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Revenue" value={peso(revenue)} sub={`${filteredSales.length} sales`} accent="text-primary" />
        <StatCard icon={Wallet} label="Expenses" value={peso(expenseTotal)} sub={`${filteredExpenses.length} entries`} accent="text-destructive" />
        <StatCard icon={Receipt} label="Profit" value={peso(profit)} sub={profit >= 0 ? "Net positive" : "Net negative"} accent={profit >= 0 ? "text-primary" : "text-destructive"} />
        <StatCard icon={CalendarClock} label="Upcoming (7d)" value={String(upcoming.length)} sub="surveys scheduled" accent="text-foreground" />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl">Revenue & profit</h2>
          <span className="text-xs text-muted-foreground">{format(interval.start, "MMM d")} – {format(interval.end, "MMM d, yyyy")}</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} formatter={(v: number) => peso(v)} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="profit" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-6 text-xs text-muted-foreground mt-4">
          <span className="flex items-center gap-2"><span className="h-0.5 w-4 bg-primary" /> Revenue</span>
          <span className="flex items-center gap-2"><span className="h-0.5 w-4 bg-accent" /> Profit</span>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl">Upcoming surveys (next 7 days)</h2>
          <Link to="/ranola-admin/sales" className="text-xs text-primary hover:underline">View all sales</Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No surveys scheduled in the next 7 days.</p>
        ) : (
          <div className="divide-y divide-border">
            {upcoming.map((s) => (
              <Link key={s.id} to={`/ranola-admin/sales/${s.id}`} className="flex items-center justify-between py-4 hover:bg-secondary/40 -mx-2 px-2 rounded-sm transition-colors">
                <div>
                  <div className="font-medium text-foreground">{s.clientName}</div>
                  <div className="text-xs text-muted-foreground">{format(new Date(s.surveyingDay), "EEEE, MMM d")}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{peso(s.totalAmount)}</div>
                  <div className="text-xs text-muted-foreground">{s.status}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, accent }: { icon: React.ElementType; label: string; value: string; sub: string; accent: string }) => (
  <Card className="p-5">
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={cn("font-serif text-2xl mt-2", accent)}>{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{sub}</div>
      </div>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </div>
  </Card>
);

export default AdminDashboard;
