import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Wrench, Calendar, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { listEquipment, listTeams, upsertEquipment, deleteEquipment, type Equipment, type EquipmentType, type EquipmentCondition, type MaintenanceLog } from "@/lib/adminStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const equipmentTypes: EquipmentType[] = ["GPS", "Total Station", "Theodolite", "Level", "Drone", "Other"];
const conditions: EquipmentCondition[] = ["Good", "Needs Maintenance", "Out of Service"];

const conditionVariant = (c: EquipmentCondition) =>
  c === "Good" ? "bg-primary/15 text-primary border-primary/20" :
  c === "Needs Maintenance" ? "bg-yellow-500/15 text-yellow-600 border-yellow-500/20" :
  "bg-destructive/15 text-destructive border-destructive/20";

const MaintenanceFormDialog = ({
  open,
  onOpenChange,
  log,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  log: MaintenanceLog | null;
  index: number;
  onSaved: (log: MaintenanceLog) => void;
}) => {
  const [description, setDescription] = useState(log?.description ?? "");
  const [cost, setCost] = useState(String(log?.cost ?? ""));
  const [date, setDate] = useState<Date>(log ? new Date(log.date) : new Date());

  const submit = () => {
    if (!description.trim()) { toast.error("Description is required"); return; }
    onSaved({
      id: log?.id ?? Math.random().toString(36).slice(2, 10),
      date: date.toISOString(),
      description: description.trim(),
      cost: cost ? Number(cost) : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-serif text-xl">{log ? "Edit maintenance log" : "Add maintenance log"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2 font-normal">
                  <Calendar className="h-4 w-4" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="logdesc">Description *</Label>
            <Input id="logdesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Replaced battery, calibrated lens" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="logcost">Cost (₱)</Label>
            <Input id="logcost" type="number" min={0} step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{log ? "Save" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EquipmentFormDialog = ({
  open,
  onOpenChange,
  equipment,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  equipment: Equipment | null;
  onSaved: () => void;
}) => {
  const teams = listTeams();

  const [name, setName] = useState(equipment?.name ?? "");
  const [type, setType] = useState<EquipmentType>(equipment?.type ?? "GPS");
  const [serialNumber, setSerialNumber] = useState(equipment?.serialNumber ?? "");
  const [condition, setCondition] = useState<EquipmentCondition>(equipment?.condition ?? "Good");
  const [assignedTeamId, setAssignedTeamId] = useState(equipment?.assignedTeamId ?? "__none__");
  const [lastCalibration, setLastCalibration] = useState<Date | null>(equipment?.lastCalibration ? new Date(equipment.lastCalibration) : null);
  const [notes, setNotes] = useState(equipment?.notes ?? "");
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(equipment?.maintenanceLogs ?? []);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<{ log: MaintenanceLog | null; index: number } | null>(null);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && equipment) {
      setName(equipment.name);
      setType(equipment.type);
      setSerialNumber(equipment.serialNumber ?? "");
      setCondition(equipment.condition);
      setAssignedTeamId(equipment.assignedTeamId ?? "__none__");
      setLastCalibration(equipment.lastCalibration ? new Date(equipment.lastCalibration) : null);
      setNotes(equipment.notes ?? "");
      setMaintenanceLogs(equipment.maintenanceLogs);
    } else if (isOpen) {
      setName("");
      setType("GPS");
      setSerialNumber("");
      setCondition("Good");
      setAssignedTeamId("__none__");
      setLastCalibration(null);
      setNotes("");
      setMaintenanceLogs([]);
    }
    onOpenChange(isOpen);
  };

  const handleSaveLog = (log: MaintenanceLog) => {
    if (editingLog !== null) {
      const updated = [...maintenanceLogs];
      updated[editingLog.index] = log;
      setMaintenanceLogs(updated);
      setEditingLog(null);
    } else {
      setMaintenanceLogs((prev) => [...prev, log]);
    }
  };

  const submit = () => {
    if (!name.trim()) { toast.error("Equipment name is required"); return; }
    upsertEquipment({
      id: equipment?.id,
      name: name.trim(),
      type,
      serialNumber: serialNumber.trim() || undefined,
      condition,
      assignedTeamId: assignedTeamId === "__none__" ? undefined : assignedTeamId || undefined,
      lastCalibration: lastCalibration?.toISOString(),
      maintenanceLogs,
      notes: notes.trim() || undefined,
    });
    toast.success(equipment ? "Equipment updated" : "Equipment added");
    onSaved();
    handleOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="font-serif text-2xl">{equipment ? "Edit equipment" : "New equipment"}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ename">Equipment name *</Label>
                <Input id="ename" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Topcon GPS System" />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as EquipmentType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{equipmentTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="eserial">Serial number</Label>
                <Input id="eserial" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="Optional" />
              </div>
              <div className="space-y-1.5">
                <Label>Condition</Label>
                <Select value={condition} onValueChange={(v) => setCondition(v as EquipmentCondition)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{conditions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Assign to team</Label>
                <Select value={assignedTeamId} onValueChange={setAssignedTeamId}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Unassigned</SelectItem>
                    {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Last calibration</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2 font-normal">
                      <Calendar className="h-4 w-4" />
                      {lastCalibration ? format(lastCalibration, "PPP") : "Not set"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={lastCalibration ?? undefined}
                      onSelect={(d) => { setLastCalibration(d ?? null); }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Maintenance history ({maintenanceLogs.length})</Label>
                <Button variant="outline" size="sm" onClick={() => { setEditingLog(null); setLogDialogOpen(true); }} className="gap-1 h-8">
                  <Plus className="h-3 w-3" /> Add log
                </Button>
              </div>
              {maintenanceLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-sm">No maintenance logs yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {maintenanceLogs.map((log, i) => (
                    <div key={log.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-sm bg-muted/40 border border-border text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">{format(new Date(log.date), "MMM d, yyyy")}</div>
                        <div className="font-medium text-foreground">{log.description}</div>
                        {log.cost !== undefined && <div className="text-xs text-muted-foreground">₱{log.cost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingLog({ log, index: i }); setLogDialogOpen(true); }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setMaintenanceLogs((prev) => prev.filter((_, idx) => idx !== i))}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="enotes">Notes</Label>
              <Textarea id="enotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Additional notes..." maxLength={500} />
            </div>
          </div>
        </div>
        <DialogFooter className="px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={() => handleOpen(false)}>Cancel</Button>
          <Button onClick={submit}>{equipment ? "Save changes" : "Add equipment"}</Button>
        </DialogFooter>
      </DialogContent>

      {logDialogOpen && (
        <MaintenanceFormDialog
          open={logDialogOpen}
          onOpenChange={setLogDialogOpen}
          log={editingLog?.log ?? null}
          index={editingLog?.index ?? -1}
          onSaved={handleSaveLog}
        />
      )}
    </Dialog>
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
        <AlertDialogTitle>Delete this equipment?</AlertDialogTitle>
        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const AdminEquipment = () => {
  const [version, setVersion] = useState(0);
  const [search, setSearch] = useState("");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = () => setVersion((v) => v + 1);

  const all = listEquipment();
  const filtered = all.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q) || (e.serialNumber ?? "").toLowerCase().includes(q);
    const matchCondition = conditionFilter === "all" || e.condition === conditionFilter;
    return matchSearch && matchCondition;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Equipment</h1>
          <p className="text-sm text-muted-foreground mt-1">Track surveying equipment inventory and maintenance.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> New equipment
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, type, serial number…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <select
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            value={conditionFilter}
            onChange={(e) => { setConditionFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All conditions</option>
            <option value="Good">Good</option>
            <option value="Needs Maintenance">Needs Maintenance</option>
            <option value="Out of Service">Out of Service</option>
          </select>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm" key={version}>
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-3 px-2 font-medium">Equipment</th>
                <th className="py-3 px-2 font-medium">Type</th>
                <th className="py-3 px-2 font-medium">Assigned team</th>
                <th className="py-3 px-2 font-medium">Calibration</th>
                <th className="py-3 px-2 font-medium">Condition</th>
                <th className="py-3 px-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((e) => {
                const assignedTeam = e.assignedTeamId ? listTeams().find((t) => t.id === e.assignedTeamId) : null;
                return (
                  <tr key={e.id} className="border-b border-border/60 hover:bg-secondary/40 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <Wrench className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{e.name}</div>
                          {e.serialNumber && <div className="text-xs text-muted-foreground">SN: {e.serialNumber}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">{e.type}</td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">
                      {assignedTeam ? assignedTeam.name : <span className="italic text-muted-foreground/50">Unassigned</span>}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground text-xs whitespace-nowrap">
                      {e.lastCalibration ? format(new Date(e.lastCalibration), "MMM d, yyyy") : <span className="italic text-muted-foreground/50">Never</span>}
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className={conditionVariant(e.condition)}>{e.condition}</Badge>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="inline-flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(e); setOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DeleteBtn onConfirm={() => { deleteEquipment(e.id); toast.success("Equipment deleted"); refresh(); }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-muted-foreground text-sm">
                  {search || conditionFilter !== "all" ? "No equipment matches your filters" : "No equipment yet. Add your first item."}
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
          {paginated.map((e) => {
            const assignedTeam = e.assignedTeamId ? listTeams().find((t) => t.id === e.assignedTeamId) : null;
            return (
              <div key={e.id} className="border border-border rounded-sm p-4 bg-card">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-foreground">{e.name}</div>
                  <Badge variant="outline" className={conditionVariant(e.condition)}>{e.condition}</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1 mb-3">
                  {e.serialNumber && <div>SN: {e.serialNumber}</div>}
                  <div>{e.type} · {assignedTeam?.name ?? "Unassigned"}</div>
                  {e.lastCalibration && <div>Calibrated: {format(new Date(e.lastCalibration), "MMM d, yyyy")}</div>}
                </div>
                <div className="flex gap-1 justify-end">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(e); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DeleteBtn onConfirm={() => { deleteEquipment(e.id); toast.success("Equipment deleted"); refresh(); }} />
                </div>
              </div>
            );
          })}
          {paginated.length === 0 && (
            <p className="py-8 text-center text-muted-foreground text-sm">
              {search || conditionFilter !== "all" ? "No equipment found" : "No equipment yet."}
            </p>
          )}
        </div>
      </Card>

      <EquipmentFormDialog open={open} onOpenChange={setOpen} equipment={editing} onSaved={refresh} />
    </div>
  );
};

export default AdminEquipment;