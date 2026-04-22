import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Time picker (no manual typing). Value is "HH:mm" 24h string.
 * UI shows 12-hour with AM/PM and 5-minute increments.
 */
export const TimePicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [hStr = "09", mStr = "00"] = (value || "09:00").split(":");
  const h24 = Math.max(0, Math.min(23, Number(hStr) || 0));
  const m = Math.max(0, Math.min(59, Number(mStr) || 0));
  const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
  const h12 = ((h24 + 11) % 12) + 1;
  // round minute display to nearest 5
  const mRounded = Math.round(m / 5) * 5;
  const mDisplay = mRounded === 60 ? 55 : mRounded;

  const emit = (nh12: number, nm: number, np: "AM" | "PM") => {
    let nh24 = nh12 % 12;
    if (np === "PM") nh24 += 12;
    onChange(`${String(nh24).padStart(2, "0")}:${String(nm).padStart(2, "0")}`);
  };

  const label = `${h12}:${String(mDisplay).padStart(2, "0")} ${period}`;

  const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0,5,...,55

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2 font-normal">
          <Clock className="h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex items-center gap-2">
          <Select value={String(h12)} onValueChange={(v) => emit(Number(v), mDisplay, period)}>
            <SelectTrigger className="w-[72px]"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-[260px]">
              {hours.map((h) => <SelectItem key={h} value={String(h)}>{h}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground font-medium">:</span>
          <Select value={String(mDisplay)} onValueChange={(v) => emit(h12, Number(v), period)}>
            <SelectTrigger className="w-[72px]"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-[260px]">
              {minutes.map((mm) => <SelectItem key={mm} value={String(mm)}>{String(mm).padStart(2, "0")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={(v) => emit(h12, mDisplay, v as "AM" | "PM")}>
            <SelectTrigger className="w-[72px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
};
