import { useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, MapPin, User2, CalendarDays, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listSales, type Sale } from "@/lib/adminStore";
import { cn } from "@/lib/utils";

const peso = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusClass = (s: Sale["status"]) =>
  s === "Paid"
    ? "bg-primary/15 text-primary border-primary/20"
    : s === "Down Payment"
    ? "bg-accent/30 text-accent-foreground border-accent/40"
    : "bg-muted text-muted-foreground border-border";

const AdminBookings = () => {
  const [cursor, setCursor] = useState<Date>(startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date>(new Date());

  const sales = listSales();

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const byDay = useMemo(() => {
    const map = new Map<string, Sale[]>();
    for (const s of sales) {
      const key = format(new Date(s.surveyingDay), "yyyy-MM-dd");
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    }
    return map;
  }, [sales]);

  const selectedKey = format(selected, "yyyy-MM-dd");
  const selectedBookings = (byDay.get(selectedKey) ?? [])
    .slice()
    .sort((a, b) => +new Date(a.surveyingDay) - +new Date(b.surveyingDay));

  const monthBookingsCount = useMemo(
    () =>
      sales.filter((s) => isSameMonth(new Date(s.surveyingDay), cursor)).length,
    [sales, cursor]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground flex items-center gap-3">
            <CalendarDays className="h-7 w-7 text-primary" />
            Booking Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track scheduled surveys with client and location at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCursor((c) => subMonths(c, 1))} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[160px] text-center">
            <div className="font-serif text-lg">{format(cursor, "MMMM yyyy")}</div>
            <div className="text-xs text-muted-foreground">{monthBookingsCount} booking{monthBookingsCount === 1 ? "" : "s"}</div>
          </div>
          <Button variant="outline" size="icon" onClick={() => setCursor((c) => addMonths(c, 1))} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { const n = new Date(); setCursor(startOfMonth(n)); setSelected(n); }}>
            Today
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-4 sm:p-6">
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {gridDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const items = byDay.get(key) ?? [];
              const inMonth = isSameMonth(day, cursor);
              const isSel = isSameDay(day, selected);
              const today = isToday(day);
              return (
                <button
                  key={key}
                  onClick={() => setSelected(day)}
                  className={cn(
                    "min-h-[78px] sm:min-h-[96px] text-left p-1.5 rounded-sm border transition-colors flex flex-col gap-1 overflow-hidden",
                    inMonth ? "bg-card" : "bg-muted/30",
                    isSel
                      ? "border-primary ring-1 ring-primary/40"
                      : "border-border hover:border-primary/40 hover:bg-secondary/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-xs font-medium h-5 w-5 flex items-center justify-center rounded-full",
                        today && "bg-primary text-primary-foreground",
                        !today && !inMonth && "text-muted-foreground/60",
                        !today && inMonth && "text-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {items.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                        {items.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    {items.slice(0, 2).map((s) => (
                      <div
                        key={s.id}
                        className="text-[10px] sm:text-[11px] leading-tight truncate px-1 py-0.5 rounded-sm bg-primary/10 text-primary"
                        title={`${format(new Date(s.surveyingDay), "h:mm a")} — ${s.clientName}${s.location ? " — " + s.location : ""}`}
                      >
                        <span className="font-medium">{format(new Date(s.surveyingDay), "h:mma").toLowerCase()}</span> {s.clientName}
                      </div>
                    ))}
                    {items.length > 2 && (
                      <div className="text-[10px] text-muted-foreground px-1">
                        +{items.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 sm:p-6 h-fit">
          <div className="border-b border-border pb-3 mb-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {isToday(selected) ? "Today" : format(selected, "EEEE")}
            </div>
            <div className="font-serif text-xl mt-0.5">{format(selected, "MMMM d, yyyy")}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {selectedBookings.length} booking{selectedBookings.length === 1 ? "" : "s"}
            </div>
          </div>

          {selectedBookings.length === 0 ? (
            <div className="text-center py-10">
              <CalendarDays className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No surveys scheduled.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedBookings.map((s) => (
                <Link
                  key={s.id}
                  to={`/ranola-admin/sales/${s.id}`}
                  className="block p-3 rounded-sm border border-border hover:border-primary/40 hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <User2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{s.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-primary mt-1.5 font-medium">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>{format(new Date(s.surveyingDay), "h:mm a")}</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-muted-foreground mt-1.5">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span className="leading-snug">{s.location || "Location not set"}</span>
                      </div>
                      {s.remarks && (
                        <div className="text-xs text-muted-foreground/90 mt-2 italic line-clamp-2">
                          “{s.remarks}”
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className={cn("shrink-0 text-[10px]", statusClass(s.status))}>
                      {s.status}
                    </Badge>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium text-foreground">{peso(s.totalAmount)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminBookings;
