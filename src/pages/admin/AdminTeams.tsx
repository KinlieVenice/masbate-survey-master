import { useState } from "react";
import { Plus, Search, Pencil, Trash2, HardHat, Users, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { listTeams, upsertTeam, deleteTeam, type Team, type TeamMember, type TeamMemberRole, type TeamStatus } from "@/lib/adminStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const roles: TeamMemberRole[] = ["Party Chief", "Instrumentman", "Rodman", "Helper", "Other"];
const statuses: TeamStatus[] = ["Available", "Deployed", "Offline"];

const statusVariant = (s: TeamStatus) =>
  s === "Available" ? "bg-primary/15 text-primary border-primary/20" :
  s === "Deployed" ? "bg-accent/20 text-accent-foreground border-accent/30" :
  "bg-muted text-muted-foreground border-border";

const MemberFormDialog = ({
  open,
  onOpenChange,
  member,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  member: TeamMember | null;
  index: number;
  onSaved: (m: TeamMember) => void;
}) => {
  const [name, setName] = useState(member?.name ?? "");
  const [role, setRole] = useState<TeamMemberRole>(member?.role ?? "Rodman");
  const [phone, setPhone] = useState(member?.phone ?? "");

  const submit = () => {
    if (!name.trim()) { toast.error("Member name is required"); return; }
    onSaved({ id: member?.id ?? Math.random().toString(36).slice(2, 10), name: name.trim(), role, phone: phone.trim() || undefined });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-serif text-xl">{member ? "Edit member" : "Add member"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="mname">Name *</Label>
            <Input id="mname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as TeamMemberRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mph">Phone</Label>
              <Input id="mph" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912 345 6789" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{member ? "Save" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TeamFormDialog = ({
  open,
  onOpenChange,
  team,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  team: Team | null;
  onSaved: () => void;
}) => {
  const [name, setName] = useState(team?.name ?? "");
  const [status, setStatus] = useState<TeamStatus>(team?.status ?? "Available");
  const [notes, setNotes] = useState(team?.notes ?? "");
  const [members, setMembers] = useState<TeamMember[]>(team?.members ?? []);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<{ member: TeamMember | null; index: number } | null>(null);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && team) {
      setName(team.name);
      setStatus(team.status);
      setNotes(team.notes ?? "");
      setMembers(team.members);
    } else if (isOpen) {
      setName("");
      setStatus("Available");
      setNotes("");
      setMembers([]);
    }
    onOpenChange(isOpen);
  };

  const handleSaveMember = (member: TeamMember) => {
    if (editingMember !== null) {
      const updated = [...members];
      updated[editingMember.index] = member;
      setMembers(updated);
      setEditingMember(null);
    } else {
      setMembers((prev) => [...prev, member]);
    }
  };

  const submit = () => {
    if (!name.trim()) { toast.error("Team name is required"); return; }
    upsertTeam({
      id: team?.id,
      name: name.trim(),
      leaderId: members[0]?.id ?? "",
      members,
      status,
      notes: notes.trim() || undefined,
    });
    toast.success(team ? "Team updated" : "Team added");
    onSaved();
    handleOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="font-serif text-2xl">{team ? "Edit team" : "New team"}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tname">Team name *</Label>
                <Input id="tname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Team Alpha" />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as TeamStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Team members ({members.length})</Label>
                <Button variant="outline" size="sm" onClick={() => { setEditingMember(null); setMemberDialogOpen(true); }} className="gap-1 h-8">
                  <Plus className="h-3 w-3" /> Add member
                </Button>
              </div>
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-sm">No members yet. Add team members.</p>
              ) : (
                <div className="space-y-2">
                  {members.map((m, i) => (
                    <div key={m.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-sm bg-muted/40 border border-border text-sm">
                      <div>
                        <span className="font-medium">{m.name}</span>
                        <span className="text-muted-foreground mx-2">·</span>
                        <span className="text-muted-foreground text-xs">{m.role}</span>
                        {m.phone && <span className="text-muted-foreground mx-2">·</span>}
                        {m.phone && <span className="text-xs text-muted-foreground flex items-center gap-1 inline"><Phone className="h-3 w-3" />{m.phone}</span>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingMember({ member: m, index: i }); setMemberDialogOpen(true); }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setMembers((prev) => prev.filter((_, idx) => idx !== i))}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tnotes">Notes</Label>
              <Textarea id="tnotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Additional notes..." maxLength={500} />
            </div>
          </div>
        </div>
        <DialogFooter className="px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={() => handleOpen(false)}>Cancel</Button>
          <Button onClick={submit}>{team ? "Save changes" : "Add team"}</Button>
        </DialogFooter>
      </DialogContent>

      {memberDialogOpen && (
        <MemberFormDialog
          open={memberDialogOpen}
          onOpenChange={setMemberDialogOpen}
          member={editingMember?.member ?? null}
          index={editingMember?.index ?? -1}
          onSaved={handleSaveMember}
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
        <AlertDialogTitle>Delete this team?</AlertDialogTitle>
        <AlertDialogDescription>This action cannot be undone. Projects assigned to this team will lose their assignment.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const AdminTeams = () => {
  const [version, setVersion] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Team | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = () => setVersion((v) => v + 1);

  const all = listTeams();
  const filtered = all.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = t.name.toLowerCase().includes(q) || t.members.some((m) => m.name.toLowerCase().includes(q));
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Survey Teams</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage field survey crews and assignments.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> New team
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team name or member…"
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
            <option value="Available">Available</option>
            <option value="Deployed">Deployed</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm" key={version}>
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-3 px-2 font-medium">Team</th>
                <th className="py-3 px-2 font-medium">Members</th>
                <th className="py-3 px-2 font-medium">Status</th>
                <th className="py-3 px-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((t) => (
                <tr key={t.id} className="border-b border-border/60 hover:bg-secondary/40 transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <HardHat className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.members.length} member{t.members.length !== 1 ? "s" : ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex flex-wrap gap-1">
                      {t.members.length === 0 ? (
                        <span className="text-muted-foreground/50 text-xs italic">No members</span>
                      ) : (
                        t.members.map((m) => (
                          <span key={m.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs">
                            <Users className="h-3 w-3" />{m.name}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant="outline" className={statusVariant(t.status)}>{t.status}</Badge>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(t); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteBtn onConfirm={() => { deleteTeam(t.id); toast.success("Team deleted"); refresh(); }} />
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={4} className="py-12 text-center text-muted-foreground text-sm">
                  {search || statusFilter !== "all" ? "No teams match your filters" : "No teams yet. Add your first team."}
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
          {paginated.map((t) => (
            <div key={t.id} className="border border-border rounded-sm p-4 bg-card">
              <div className="flex items-start justify-between mb-2">
                <div className="font-medium text-foreground">{t.name}</div>
                <Badge variant="outline" className={statusVariant(t.status)}>{t.status}</Badge>
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                {t.members.map((m) => m.name).join(", ") || "No members"}
              </div>
              <div className="flex gap-1 justify-end">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(t); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <DeleteBtn onConfirm={() => { deleteTeam(t.id); toast.success("Team deleted"); refresh(); }} />
              </div>
            </div>
          ))}
          {paginated.length === 0 && (
            <p className="py-8 text-center text-muted-foreground text-sm">
              {search || statusFilter !== "all" ? "No teams found" : "No teams yet."}
            </p>
          )}
        </div>
      </Card>

      <TeamFormDialog open={open} onOpenChange={setOpen} team={editing} onSaved={refresh} />
    </div>
  );
};

export default AdminTeams;