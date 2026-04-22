import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Eye, MapPin, FolderKanban, X, Upload } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { listProjects, listClients, listTeams, upsertProject, deleteProject, REQUIREMENTS_CHECKLIST, type Project, type ProjectStatus, type SurveyType, type SaleFile } from "@/lib/adminStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TimePicker } from "@/components/admin/TimePicker";

const PAGE_SIZE = 10;
const peso = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const statusVariant = (s: ProjectStatus) =>
  s === "Completed" ? "bg-primary/15 text-primary border-primary/20" :
  s === "On-Site" ? "bg-accent/20 text-accent-foreground border-accent/30" :
  "bg-muted text-muted-foreground border-border";

const surveyTypes: SurveyType[] = [
  "Relocation Survey",
  "Subdivision",
  "Topographic",
  "Boundary",
  "Construction",
  "Other",
];

const MAX_DIM = 1280;
const JPEG_QUALITY = 0.7;

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

const compressImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    (async () => {
      try {
        const dataUrl = await fileToDataUrl(file);
        if (!file.type.startsWith("image/") || file.type === "image/gif") {
          resolve(dataUrl);
          return;
        }
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > MAX_DIM || height > MAX_DIM) {
            const scale = Math.min(MAX_DIM / width, MAX_DIM / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) { resolve(dataUrl); return; }
          ctx.drawImage(img, 0, 0, width, height);
          try {
            const reencoded = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
            resolve(reencoded.length < dataUrl.length ? reencoded : dataUrl);
          } catch {
            resolve(dataUrl);
          }
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      } catch (e) {
        reject(e);
      }
    })();
  });

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

export const ProjectFormDialog = ({
  open,
  onOpenChange,
  project,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  project: Project | null;
  onSaved: () => void;
}) => {
  const clients = listClients();
  const teams = listTeams();

  const [clientId, setClientId] = useState(project?.clientId ?? "");
  const [title, setTitle] = useState(project?.title ?? "");
  const [location, setLocation] = useState(project?.location ?? "");
  const [surveyType, setSurveyType] = useState<SurveyType>(project?.surveyType ?? "Relocation Survey");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "Pending");
  const [assignedTeamId, setAssignedTeamId] = useState(project?.assignedTeamId ?? "__none__");
  const [date, setDate] = useState<Date>(project ? new Date(project.surveyingDate) : new Date());
  const [time, setTime] = useState(() => {
    if (project) {
      const d = new Date(project.surveyingDate);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    return "09:00";
  });
  const [deadline, setDeadline] = useState(project?.deadline ? new Date(project.deadline) : null as Date | null);
  const [total, setTotal] = useState(String(project?.totalAmount ?? "0"));
  const [paid, setPaid] = useState(String(project?.paidAmount ?? "0"));
  const [checklist, setChecklist] = useState<boolean[]>(
    project?.checklist ?? REQUIREMENTS_CHECKLIST.map(() => false)
  );
  const [files, setFiles] = useState<SaleFile[]>(project?.files ?? []);
  const [remarks, setRemarks] = useState(project?.remarks ?? "");
  const [busy, setBusy] = useState(false);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && project) {
      setClientId(project.clientId);
      setTitle(project.title);
      setLocation(project.location);
      setSurveyType(project.surveyType);
      setStatus(project.status);
      setAssignedTeamId(project.assignedTeamId ?? "__none__");
      setDate(new Date(project.surveyingDate));
      const d = new Date(project.surveyingDate);
      setTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
      setDeadline(project.deadline ? new Date(project.deadline) : null);
      setTotal(String(project.totalAmount));
      setPaid(String(project.paidAmount));
      setChecklist(project.checklist.length === REQUIREMENTS_CHECKLIST.length ? project.checklist : REQUIREMENTS_CHECKLIST.map(() => false));
      setFiles(project.files);
      setRemarks(project.remarks ?? "");
    } else if (isOpen) {
      setClientId("");
      setTitle("");
      setLocation("");
      setSurveyType("Relocation Survey");
      setStatus("Pending");
      setAssignedTeamId("__none__");
      setDate(new Date());
      setTime("09:00");
      setDeadline(null);
      setTotal("0");
      setPaid("0");
      setChecklist(REQUIREMENTS_CHECKLIST.map(() => false));
      setFiles([]);
      setRemarks("");
    }
    onOpenChange(isOpen);
  };

  const handleFiles = async (list: FileList | null) => {
    if (!list) return;
    setBusy(true);
    try {
      const next: SaleFile[] = [];
      const remaining = 15 - files.length;
      if (remaining <= 0) { toast.error("Maximum 15 files allowed"); return; }
      const incoming = Array.from(list).slice(0, remaining);
      if (list.length > remaining) toast.error(`Only ${remaining} more file(s) allowed`);
      for (const f of incoming) {
        if (f.size > 8 * 1024 * 1024) { toast.error(`${f.name} skipped — over 8MB`); continue; }
        next.push({
          id: Math.random().toString(36).slice(2, 10),
          name: f.name,
          type: f.type.startsWith("image/") && f.type !== "image/gif" ? "image/jpeg" : (f.type || "application/octet-stream"),
          dataUrl: await compressImage(f),
        });
      }
      setFiles((prev) => [...prev, ...next]);
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    const selectedClient = clients.find((c) => c.id === clientId);
    if (!clientId || !selectedClient) { toast.error("Please select a client"); return; }
    if (!title.trim()) { toast.error("Project title is required"); return; }
    const [hh, mm] = time.split(":").map((n) => Number(n) || 0);
    const surveyingDate = new Date(date);
    surveyingDate.setHours(hh, mm, 0, 0);
    upsertProject({
      id: project?.id,
      clientId,
      clientName: selectedClient.name,
      title: title.trim(),
      location: location.trim(),
      surveyType,
      status,
      assignedTeamId: assignedTeamId === "__none__" ? undefined : assignedTeamId,
      surveyingDate: surveyingDate.toISOString(),
      deadline: deadline ? deadline.toISOString() : undefined,
      totalAmount: Number(total) || 0,
      paidAmount: Number(paid) || 0,
      checklist,
      files,
      remarks: remarks.trim() || undefined,
    });
    toast.success(project ? "Project updated" : "Project added");
    onSaved();
    handleOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="font-serif text-2xl">{project ? "Edit project" : "New project"}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Client *</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients.length === 0 && <p className="text-xs text-muted-foreground p-2">No clients yet. Add one first.</p>}
                    {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="title">Project title *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lot 123 Resurvey" />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Survey type</Label>
                <Select value={surveyType} onValueChange={(v) => setSurveyType(v as SurveyType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {surveyTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="On-Site">On-Site</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Assign team</Label>
                <Select value={assignedTeamId} onValueChange={setAssignedTeamId}>
                  <SelectTrigger><SelectValue placeholder="No team" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No team</SelectItem>
                    {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Survey date</Label>
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
                <Label>Survey time</Label>
                <TimePicker value={time} onChange={setTime} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Brgy. / Municipality" />
              </div>
              <div className="space-y-1.5">
                <Label>Deadline (optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2 font-normal">
                      <CalendarIcon className="h-4 w-4" />
                      {deadline ? format(deadline, "PPP") : "No deadline"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={deadline ?? undefined} onSelect={(d) => { setDeadline(d ?? null); }} className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="total">Total amount (₱)</Label>
                <Input id="total" type="number" min={0} step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} onFocus={(e) => { if (e.target.value === "0") setTotal(""); e.target.select(); }} onBlur={(e) => { if (e.target.value === "") setTotal("0"); }} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paid">Paid amount (₱)</Label>
                <Input id="paid" type="number" min={0} step="0.01" value={paid} onChange={(e) => setPaid(e.target.value)} onFocus={(e) => { if (e.target.value === "0") setPaid(""); e.target.select(); }} onBlur={(e) => { if (e.target.value === "") setPaid("0"); }} />
              </div>
            </div>

            <div>
              <Label className="block mb-3">Requirements checklist</Label>
              <div className="space-y-2 border border-border rounded-sm p-4 bg-muted/20">
                {REQUIREMENTS_CHECKLIST.map((req, i) => (
                  <label key={i} className="flex items-start gap-3 text-sm cursor-pointer py-1">
                    <Checkbox
                      checked={checklist[i]}
                      onCheckedChange={(v) => {
                        const next = [...checklist];
                        next[i] = v === true;
                        setChecklist(next);
                      }}
                    />
                    <span className="text-foreground/85 leading-relaxed">{i + 1}. {req}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{checklist.filter(Boolean).length} of {checklist.length} complete</p>
            </div>

            <div>
              <Label className="block mb-3">Attachments</Label>
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-sm p-6 cursor-pointer hover:bg-muted/30 transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground text-center">Click to upload — up to 15 files (max 8MB each)</span>
                <span className="text-xs text-muted-foreground/70">Images, PDFs, documents · {files.length}/15 used</span>
                <input type="file" multiple accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" className="hidden" disabled={files.length >= 15} onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
              </label>
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs text-muted-foreground">{files.length} file(s) attached</div>
                  {files.map((f) => (
                    <div key={f.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-sm bg-muted/40 border border-border text-sm">
                      <span className="truncate">{f.name}</span>
                      <button type="button" onClick={() => setFiles((p) => p.filter((x) => x.id !== f.id))} className="text-muted-foreground hover:text-destructive shrink-0">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="remarks">Remarks <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} maxLength={1000} rows={3} placeholder="Notes about this project…" />
            </div>
          </div>
        </div>
        <DialogFooter className="px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={() => handleOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{project ? "Save changes" : "Add project"}</Button>
        </DialogFooter>
      </DialogContent>
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
        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const AdminProjects = () => {
  const [version, setVersion] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Project | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = () => setVersion((v) => v + 1);

  const all = listProjects();
  const filtered = all.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.clientName.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage survey job orders with requirements tracking.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> New project
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client, title, location…"
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
            <option value="Pending">Pending</option>
            <option value="On-Site">On-Site</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm" key={version}>
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-3 px-2 font-medium">Project</th>
                <th className="py-3 px-2 font-medium">Client</th>
                <th className="py-3 px-2 font-medium">Type</th>
                <th className="py-3 px-2 font-medium">Date</th>
                <th className="py-3 px-2 font-medium text-right">Total</th>
                <th className="py-3 px-2 font-medium">Status</th>
                <th className="py-3 px-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => (
                <tr key={p.id} className="border-b border-border/60 hover:bg-secondary/40 transition-colors">
                  <td className="py-3 px-2">
                    <Link to={`/ranola-admin/projects/${p.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <FolderKanban className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <div className="font-medium text-foreground hover:text-primary hover:underline">{p.title}</div>
                        <div className="text-xs text-muted-foreground">{p.checklist.filter(Boolean).length}/{p.checklist.length} reqs · {p.files.length} files</div>
                      </div>
                    </Link>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground">{p.clientName}</td>
                  <td className="py-3 px-2 text-muted-foreground text-xs">{p.surveyType}</td>
                  <td className="py-3 px-2 text-muted-foreground whitespace-nowrap">{format(new Date(p.surveyingDate), "MMM d, yyyy")}</td>
                  <td className="py-3 px-2 text-right">{peso(p.totalAmount)}</td>
                  <td className="py-3 px-2">
                    <Badge variant="outline" className={statusVariant(p.status)}>{p.status}</Badge>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteBtn onConfirm={() => { deleteProject(p.id); toast.success("Project deleted"); refresh(); }} />
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                  {search || statusFilter !== "all" ? "No projects match your filters" : "No projects yet. Add your first project."}
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
          {paginated.map((p) => (
            <div key={p.id} className="border border-border rounded-sm p-4 bg-card">
              <div className="flex items-start justify-between mb-2">
                <Link to={`/ranola-admin/projects/${p.id}`} className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-primary shrink-0" />
                  <div className="font-medium text-foreground hover:text-primary hover:underline">{p.title}</div>
                </Link>
                <Badge variant="outline" className={statusVariant(p.status)}>{p.status}</Badge>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {p.clientName} · {p.surveyType} · {format(new Date(p.surveyingDate), "MMM d, yyyy")} · {peso(p.totalAmount)}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{p.checklist.filter(Boolean).length}/{p.checklist.length} reqs</div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DeleteBtn onConfirm={() => { deleteProject(p.id); toast.success("Project deleted"); refresh(); }} />
                </div>
              </div>
            </div>
          ))}
          {paginated.length === 0 && (
            <p className="py-8 text-center text-muted-foreground text-sm">
              {search || statusFilter !== "all" ? "No projects found" : "No projects yet."}
            </p>
          )}
        </div>
      </Card>

      <ProjectFormDialog open={open} onOpenChange={setOpen} project={editing} onSaved={refresh} />
    </div>
  );
};

export default AdminProjects;