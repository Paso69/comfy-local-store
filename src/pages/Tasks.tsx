import { useState } from "react";
import { useStore, uid } from "@/lib/hooks";
import type { Task, Domain, TaskList, Goal } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Copy, CheckCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const PRIORITIES = ["low", "medium", "high", "critical"] as const;
const STATUSES = ["not-started", "in-progress", "done", "deferred", "archived"] as const;

const emptyTask = (): Partial<Task> => ({
  title: "", description: "", domain: "", linkedGoalId: "", priority: "medium",
  dueDate: "", recurrence: "", estimatedEffort: "", status: "not-started",
  tags: [], notes: "", listId: "", order: 0,
});

export default function Tasks() {
  const { items: tasks, save, remove, saveStatus } = useStore<Task>("tasks");
  const { items: taskLists } = useStore<TaskList>("taskLists");
  const { items: domains } = useStore<Domain>("domains");
  const { items: goals } = useStore<Goal>("goals");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Task>>(emptyTask());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeList, setActiveList] = useState("all");
  const [search, setSearch] = useState("");

  const activeLists = taskLists.filter(l => !l.archived).sort((a, b) => a.order - b.order);

  const startNew = (listId?: string) => { setForm({ ...emptyTask(), listId: listId || "" }); setEditingId(null); setOpen(true); };
  const startEdit = (t: Task) => { setForm(t); setEditingId(t.id); setOpen(true); };
  const duplicate = (t: Task) => { save({ ...t, id: uid(), title: t.title + " (copy)", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); };

  const handleSave = () => {
    const item: Task = {
      ...emptyTask(), ...form, tags: form.tags || [],
      id: editingId || uid(),
      createdAt: editingId ? (form as Task).createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Task;
    save(item);
    setOpen(false);
  };

  const toggleDone = (t: Task) => {
    save({ ...t, status: t.status === "done" ? "not-started" : "done", updatedAt: new Date().toISOString() });
  };

  const filtered = tasks
    .filter(t => activeList === "all" || t.listId === activeList)
    .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.status === "done" && b.status !== "done") return 1;
      if (a.status !== "done" && b.status === "done") return -1;
      const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (pOrder[a.priority] || 2) - (pOrder[b.priority] || 2);
    });

  const set = (key: string, val: unknown) => setForm(prev => ({ ...prev, [key]: val }));

  const priorityColor = (p: string) => {
    if (p === "critical") return "destructive";
    if (p === "high") return "default";
    return "secondary";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : `${tasks.filter(t=>t.status!=='done'&&t.status!=='archived').length} active`}
          </p>
        </div>
        <Button onClick={() => startNew()}><Plus className="h-4 w-4 mr-1" />New Task</Button>
      </div>

      <Input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <Tabs value={activeList} onValueChange={setActiveList}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All</TabsTrigger>
          {activeLists.map(l => <TabsTrigger key={l.id} value={l.id}>{l.name}</TabsTrigger>)}
        </TabsList>

        <TabsContent value={activeList} className="mt-4 space-y-2">
          {filtered.length === 0 && (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No tasks here. Add one to get started.</CardContent></Card>
          )}
          {filtered.map(t => (
            <Card key={t.id} className={t.status === "done" ? "opacity-60" : ""}>
              <CardContent className="py-3 flex items-center gap-3">
                <Checkbox checked={t.status === "done"} onCheckedChange={() => toggleDone(t)} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${t.status === "done" ? "line-through" : ""}`}>{t.title}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Badge variant={priorityColor(t.priority)} className="text-xs">{t.priority}</Badge>
                    {t.domain && <Badge variant="outline" className="text-xs">{t.domain}</Badge>}
                    {t.dueDate && <Badge variant="outline" className="text-xs">{t.dueDate}</Badge>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicate(t)}><Copy className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(t)}><Pencil className="h-3 w-3" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><Trash2 className="h-3 w-3" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Delete task?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => remove(t.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Task" : "New Task"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title" value={form.title || ""} onChange={e => set("title", e.target.value)} />
            <Textarea placeholder="Description" value={form.description || ""} onChange={e => set("description", e.target.value)} />
            <Select value={form.listId || ""} onValueChange={v => set("listId", v)}>
              <SelectTrigger><SelectValue placeholder="List" /></SelectTrigger>
              <SelectContent>{activeLists.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={form.domain || ""} onValueChange={v => set("domain", v)}>
              <SelectTrigger><SelectValue placeholder="Domain" /></SelectTrigger>
              <SelectContent>{domains.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={form.linkedGoalId || "none"} onValueChange={v => set("linkedGoalId", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Linked Goal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {goals.filter(g => g.status === "active").map(g => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={form.priority || "medium"} onValueChange={v => set("priority", v)}>
              <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={form.status || "not-started"} onValueChange={v => set("status", v)}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/-/g, ' ')}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="date" value={form.dueDate || ""} onChange={e => set("dueDate", e.target.value)} />
            <Input placeholder="Recurrence (e.g. daily, weekly)" value={form.recurrence || ""} onChange={e => set("recurrence", e.target.value)} />
            <Input placeholder="Estimated effort (e.g. 30 min)" value={form.estimatedEffort || ""} onChange={e => set("estimatedEffort", e.target.value)} />
            <Input placeholder="Tags (comma-separated)" value={(form.tags || []).join(", ")} onChange={e => set("tags", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
            <Textarea placeholder="Notes" value={form.notes || ""} onChange={e => set("notes", e.target.value)} />
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
