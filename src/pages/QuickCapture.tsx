import { useState, useEffect } from "react";
import { useStore, uid } from "@/lib/hooks";
import type { Note, Domain } from "@/lib/types";
import { DEFAULT_NOTE_TYPES } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ArrowRight, Zap } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";

const emptyNote = (): Partial<Note> => ({
  title: "", type: "Random thought", content: "", tags: [],
  domain: "", status: "inbox",
});

export default function QuickCapture() {
  const { items: notes, save, remove, saveStatus } = useStore<Note>("notes");
  const { items: domains } = useStore<Domain>("domains");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Note>>(emptyNote());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [quickText, setQuickText] = useState("");
  const [quickType, setQuickType] = useState("Random thought");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const quick = searchParams.get("quick");
    const type = searchParams.get("type");
    if (quick) {
      save({
        id: uid(), title: quick, type: type || "Random thought", content: "",
        tags: [], domain: "", status: "inbox",
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      });
      navigate("/notes", { replace: true });
    }
  }, []);

  const quickAdd = () => {
    if (!quickText.trim()) return;
    save({
      id: uid(), title: quickText, type: quickType, content: "",
      tags: [], domain: "", status: "inbox",
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    setQuickText("");
  };

  const startEdit = (n: Note) => { setForm(n); setEditingId(n.id); setOpen(true); };
  const startNew = () => { setForm(emptyNote()); setEditingId(null); setOpen(true); };

  const handleSave = () => {
    const item: Note = {
      ...emptyNote(), ...form, tags: form.tags || [],
      id: editingId || uid(),
      createdAt: editingId ? (form as Note).createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Note;
    save(item);
    setOpen(false);
  };

  const convertTo = (note: Note, target: string) => {
    if (target === "task") navigate(`/tasks?title=${encodeURIComponent(note.title)}`);
    else if (target === "idea") navigate(`/ideas?title=${encodeURIComponent(note.title)}`);
    else if (target === "knowledge") navigate(`/knowledge?title=${encodeURIComponent(note.title)}`);
    save({ ...note, status: "processed", updatedAt: new Date().toISOString() });
  };

  const filtered = notes
    .filter(n => filterType === "all" || n.type === filterType)
    .filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const set = (key: string, val: unknown) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quick Capture</h1>
          <p className="text-sm text-muted-foreground">{saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : `${notes.filter(n=>n.status==='inbox').length} in inbox`}</p>
        </div>
        <Button onClick={startNew}><Plus className="h-4 w-4 mr-1" />New Note</Button>
      </div>

      <Card>
        <CardContent className="py-3 flex gap-2">
          <Zap className="h-4 w-4 mt-2 text-accent shrink-0" />
          <Select value={quickType} onValueChange={setQuickType}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{DEFAULT_NOTE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Capture anything..." value={quickText} onChange={e => setQuickText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && quickAdd()} className="h-8" />
          <Button size="sm" className="h-8" onClick={quickAdd}>Add</Button>
        </CardContent>
      </Card>

      <div className="flex gap-2 flex-wrap items-center">
        <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs h-8" />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {DEFAULT_NOTE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 && (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No notes yet. Capture your first thought.</CardContent></Card>
      )}

      <div className="space-y-2">
        {filtered.map(n => (
          <Card key={n.id}>
            <CardContent className="py-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                {n.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.content}</p>}
                <div className="flex gap-1 mt-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs">{n.type}</Badge>
                  <Badge variant="outline" className="text-xs">{n.status}</Badge>
                  {n.domain && <Badge variant="outline" className="text-xs">{n.domain}</Badge>}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Convert to task" onClick={() => convertTo(n, "task")}><ArrowRight className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(n)}><Pencil className="h-3 w-3" /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><Trash2 className="h-3 w-3" /></Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete note?</AlertDialogTitle></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => remove(n.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Note" : "New Note"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title" value={form.title || ""} onChange={e => set("title", e.target.value)} />
            <Select value={form.type || "Random thought"} onValueChange={v => set("type", v)}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>{DEFAULT_NOTE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <Textarea placeholder="Content" rows={6} value={form.content || ""} onChange={e => set("content", e.target.value)} />
            <Select value={form.domain || ""} onValueChange={v => set("domain", v)}>
              <SelectTrigger><SelectValue placeholder="Domain" /></SelectTrigger>
              <SelectContent>{domains.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Tags (comma-separated)" value={(form.tags || []).join(", ")} onChange={e => set("tags", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
            <Select value={form.status || "inbox"} onValueChange={v => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="inbox">Inbox</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
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
