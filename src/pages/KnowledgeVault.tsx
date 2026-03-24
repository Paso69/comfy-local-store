import { useState } from "react";
import { useStore, uid } from "@/lib/hooks";
import type { KnowledgeItem, Domain, Goal } from "@/lib/types";
import { DEFAULT_KNOWLEDGE_CATEGORIES } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";

const STATUSES = ["to-explore", "in-progress", "completed", "archived"] as const;

const emptyItem = (): Partial<KnowledgeItem> => ({
  title: "", type: "", category: "", source: "", summary: "",
  keyTakeaways: "", tags: [], status: "to-explore", linkedGoalId: "",
});

export default function KnowledgeVault() {
  const { items, save, remove, saveStatus } = useStore<KnowledgeItem>("knowledgeItems");
  const { items: domains } = useStore<Domain>("domains");
  const { items: goals } = useStore<Goal>("goals");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<KnowledgeItem>>(emptyItem());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const startNew = () => { setForm(emptyItem()); setEditingId(null); setOpen(true); };
  const startEdit = (k: KnowledgeItem) => { setForm(k); setEditingId(k.id); setOpen(true); };

  const handleSave = () => {
    const item: KnowledgeItem = {
      ...emptyItem(), ...form, tags: form.tags || [],
      id: editingId || uid(),
      createdAt: editingId ? (form as KnowledgeItem).createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as KnowledgeItem;
    save(item);
    setOpen(false);
  };

  const filtered = items
    .filter(k => filterCat === "all" || k.category === filterCat)
    .filter(k => filterStatus === "all" || k.status === filterStatus)
    .filter(k => !search || k.title.toLowerCase().includes(search.toLowerCase()) || k.summary.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const set = (key: string, val: unknown) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Vault</h1>
          <p className="text-sm text-muted-foreground">{saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : `${items.length} items`}</p>
        </div>
        <Button onClick={startNew}><Plus className="h-4 w-4 mr-1" />Add Knowledge</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs h-8" />
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {DEFAULT_KNOWLEDGE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/-/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />No knowledge items yet. Start building your vault.</CardContent></Card>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map(k => (
          <Card key={k.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm">{k.title}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(k)}><Pencil className="h-3 w-3" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><Trash2 className="h-3 w-3" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Delete?</AlertDialogTitle></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => remove(k.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 mb-2 flex-wrap">
                {k.category && <Badge variant="secondary" className="text-xs">{k.category}</Badge>}
                <Badge variant="outline" className="text-xs">{k.status.replace(/-/g, " ")}</Badge>
              </div>
              {k.summary && <p className="text-xs text-muted-foreground line-clamp-3">{k.summary}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "New"} Knowledge Item</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title" value={form.title || ""} onChange={e => set("title", e.target.value)} />
            <Input placeholder="Type (e.g. Book, Podcast)" value={form.type || ""} onChange={e => set("type", e.target.value)} />
            <Select value={form.category || ""} onValueChange={v => set("category", v)}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>{DEFAULT_KNOWLEDGE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Source" value={form.source || ""} onChange={e => set("source", e.target.value)} />
            <Textarea placeholder="Summary" value={form.summary || ""} onChange={e => set("summary", e.target.value)} />
            <Textarea placeholder="Key takeaways" value={form.keyTakeaways || ""} onChange={e => set("keyTakeaways", e.target.value)} />
            <Input placeholder="Tags (comma-separated)" value={(form.tags || []).join(", ")} onChange={e => set("tags", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
            <Select value={form.status || "to-explore"} onValueChange={v => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/-/g, " ")}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={form.linkedGoalId || "none"} onValueChange={v => set("linkedGoalId", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Linked Goal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {goals.filter(g => g.status === "active").map(g => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title?.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
