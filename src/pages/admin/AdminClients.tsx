import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, User, Mail, Phone, MapPin, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { listClients, upsertClient, deleteClient, type Client } from "@/lib/adminStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const ClientFormDialog = ({
  open,
  onOpenChange,
  client,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  client: Client | null;
  onSaved: () => void;
}) => {
  const [name, setName] = useState(client?.name ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [phone, setPhone] = useState(client?.phone ?? "");
  const [address, setAddress] = useState(client?.address ?? "");
  const [tin, setTin] = useState(client?.tin ?? "");
  const [notes, setNotes] = useState(client?.notes ?? "");

  useEffect(() => {
    if (client) {
      setName(client.name);
      setEmail(client.email ?? "");
      setPhone(client.phone ?? "");
      setAddress(client.address ?? "");
      setTin(client.tin ?? "");
      setNotes(client.notes ?? "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setTin("");
      setNotes("");
    }
  }, [client]);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      if (client) {
        setName(client.name);
        setEmail(client.email ?? "");
        setPhone(client.phone ?? "");
        setAddress(client.address ?? "");
        setTin(client.tin ?? "");
        setNotes(client.notes ?? "");
      } else {
        setName("");
        setEmail("");
        setPhone("");
        setAddress("");
        setTin("");
        setNotes("");
      }
    }
    onOpenChange(isOpen);
  };

  const submit = () => {
    if (!name.trim()) {
      toast.error("Client name is required");
      return;
    }
    upsertClient({
      id: client?.id,
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      tin: tin.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    toast.success(client ? "Client updated" : "Client added");
    onSaved();
    handleOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{client ? "Edit client" : "New client"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Client name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="Full name or company" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912 345 6789" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Brgy. / Municipality / Province" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tin">TIN</Label>
            <Input id="tin" value={tin} onChange={(e) => setTin(e.target.value)} placeholder="123-456-789-000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Additional notes..." maxLength={500} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpen(false)}>Cancel</Button>
          <Button onClick={submit}>{client ? "Save changes" : "Add client"}</Button>
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
      <DialogHeader>
        <AlertDialogTitle>Delete this client?</AlertDialogTitle>
        <AlertDialogDescription>This action cannot be undone. Existing projects will keep client name but lose the link.</AlertDialogDescription>
      </DialogHeader>
      <DialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
      </DialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const AdminClients = () => {
  const [version, setVersion] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Client | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = () => setVersion((v) => v + 1);

  const all = listClients();
  const filtered = all.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      c.name.toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.phone ?? "").includes(q) ||
      (c.address ?? "").toLowerCase().includes(q);
    return matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paginated = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage client profiles and contact information.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> New client
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone, address…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
        </div>

      <Card className="p-4">
        

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm" key={version}>
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-3 px-2 font-medium">Client</th>
                <th className="py-3 px-2 font-medium">Contact</th>
                <th className="py-3 px-2 font-medium">Address</th>
                <th className="py-3 px-2 font-medium">TIN</th>
                <th className="py-3 px-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c) => (
                <tr key={c.id} className="border-b border-border/60 hover:bg-secondary/40 transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{c.name}</div>
                        <div className="text-xs text-muted-foreground">Added {format(new Date(c.createdAt), "MMM d, yyyy")}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="space-y-1">
                      {c.email && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{c.email}</div>}
                      {c.phone && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{c.phone}</div>}
                      {!c.email && !c.phone && <span className="text-muted-foreground/50 italic text-xs">No contact</span>}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground text-xs max-w-[200px]">
                    {c.address ? <span className="truncate block" title={c.address}>{c.address}</span> : <span className="italic text-muted-foreground/50">Not set</span>}
                  </td>
                  <td className="py-3 px-2 text-xs text-muted-foreground">
                    {c.tin || <span className="italic text-muted-foreground/50">—</span>}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteBtn onConfirm={() => { deleteClient(c.id); toast.success("Client deleted"); refresh(); }} />
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-muted-foreground text-sm">
                  {search ? `No clients found for "${search}"` : "No clients yet. Add your first client."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageSafe === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Page {pageSafe} of {totalPages}</span>
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={pageSafe === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="md:hidden space-y-3 mt-4">
          {paginated.map((c) => (
            <div key={c.id} className="border border-border rounded-sm p-4 bg-card">
              <div className="flex items-start justify-between mb-2">
                <div className="font-medium text-foreground">{c.name}</div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DeleteBtn onConfirm={() => { deleteClient(c.id); toast.success("Client deleted"); refresh(); }} />
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                {c.email && <div><Mail className="h-3 w-3 inline mr-1" />{c.email}</div>}
                {c.phone && <div><Phone className="h-3 w-3 inline mr-1" />{c.phone}</div>}
                {c.address && <div><MapPin className="h-3 w-3 inline mr-1" />{c.address}</div>}
              </div>
            </div>
          ))}
          {paginated.length === 0 && (
            <p className="py-8 text-center text-muted-foreground text-sm">
              {search ? `No clients found for "${search}"` : "No clients yet."}
            </p>
          )}
        </div>
      </Card>

      <ClientFormDialog open={open} onOpenChange={setOpen} client={editing} onSaved={refresh} />
    </div>
  );
};

export default AdminClients;