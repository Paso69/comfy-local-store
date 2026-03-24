import { useState } from "react";
import { useStore, uid } from "@/lib/hooks";
import type { Idea, Domain } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Lightbulb } from "lucide-react";

const STATUSES = ["parked", "evaluating", "active", "rejected", "archived"] as const;
const emptyIdea = (): Partial<Idea> => ({ title: "", category: "", description: "", whyItMatters: "", estimatedUpside: "", estimatedDifficulty: "", nextAction: "", domain: "", tags: [], status: "parked" });

export default function IdeaBank() {
  const { items, save, remove, saveStatus } = useStore<Idea>("ideas");
  const { items: domains } = useStore<Domain>("domains");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Idea>>(emptyIdea());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const startNew = () => { setForm(emptyIdea()); setEditingId(null); setOpen(true); };
  const startEdit = (i: Idea) => { setForm(i); setEditingId(i.id); setOpen(true); };
  const handleSave = () => {
    save({ ...emptyIdea(), ...form, tags: form.tags || [], id: editingId || uid(), createdAt: editingId ? (form as Idea).createdAt : new Date().toISOString(), updatedAt: new Date().toISOString() } as Idea);
    setOpen(false);
  };
  const filtered = items.filter(i => filterStatus === "all" || i.status === filterStatus).filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Idea Bank</h1><p className="text-sm text-muted-foreground">{saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : `${items.length} ideas`}</p></div>
        <Button onClick={startNew}><Plus className="h-4 w-4 mr-1" />New Idea</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs h-8" />
        <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
      </div>
      {filtered.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground"><Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />No ideas yet. Capture your next big thought.</CardContent></Card>}
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map(i => (
          <Card key={i.id}>
            <CardHeader className="pb-2"><div className="flex items-start justify-between"><CardTitle className="text-sm">{i.title}</CardTitle><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(i)}><Pencil className="h-3 w-3" /></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><Trash2 className="h-3 w-3" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => remove(i.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></div></CardHeader>
            <CardContent><div className="flex gap-1 mb-2 flex-wrap"><Badge variant="secondary" className="text-xs">{i.status}</Badge>{i.category && <Badge variant="outline" className="text-xs">{i.category}</Badge>}{i.domain && <Badge variant="outline" className="text-xs">{i.domain}</Badge>}</div>{i.description && <p className="text-xs text-muted-foreground line-clamp-2">{i.description}</p>}{i.nextAction && <p className="text-xs mt-1"><span className="font-medium">Next:</span> {i.nextAction}</p>}</CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "New"} Idea</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title" value={form.title || ""} onChange={e => set("title", e.target.value)} />
            <Input placeholder="Category" value={form.category || ""} onChange={e => set("category", e.target.value)} />
            <Textarea placeholder="Description" value={form.description || ""} onChange={e => set("description", e.target.value)} />
            <Textarea placeholder="Why it matters" value={form.whyItMatters || ""} onChange={e => set("whyItMatters", e.target.value)} />
            <Input placeholder="Estimated upside" value={form.estimatedUpside || ""} onChange={e => set("estimatedUpside", e.target.value)} />
            <Input placeholder="Estimated difficulty" value={form.estimatedDifficulty || ""} onChange={e => set("estimatedDifficulty", e.target.value)} />
            <Input placeholder="Next action" value={form.nextAction || ""} onChange={e => set("nextAction", e.target.value)} />
            <Select value={form.domain || ""} onValueChange={v => set("domain", v)}><SelectTrigger><SelectValue placeholder="Domain" /></SelectTrigger><SelectContent>{domains.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent></Select>
            <Input placeholder="Tags (comma-separated)" value={(form.tags || []).join(", ")} onChange={e => set("tags", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
            <Select value={form.status || "parked"} onValueChange={v => set("status", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={!form.title?.trim()}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
