import { useState } from "react";
import { useStore, uid } from "@/lib/hooks";
import type { Goal, Domain } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const PRIORITY_LEVELS = ["primary", "secondary", "maintenance", "someday"] as const;
const STATUSES = ["active", "paused", "archived", "completed"] as const;

const emptyGoal = (): Partial<Goal> => ({
  title: "", description: "", domain: "", priorityLevel: "maintenance",
  horizon: "", target: "", currentProgress: 0, status: "active",
  notes: "", reviewDate: "",
});

export default function Goals() {
  const { items: goals, save, remove, saveStatus } = useStore<Goal>("goals");
  const { items: domains } = useStore<Domain>("domains");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Goal>>(emptyGoal());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const primaryCount = goals.filter(g => g.priorityLevel === "primary" && g.status === "active").length;
  const secondaryCount = goals.filter(g => g.priorityLevel === "secondary" && g.status === "active").length;

  const warnPrimary = form.priorityLevel === "primary" && form.status === "active" && primaryCount >= 2 && !editingId;
  const warnSecondary = form.priorityLevel === "secondary" && form.status === "active" && secondaryCount >= 1 && !editingId;

  const startEdit = (g: Goal) => { setForm(g); setEditingId(g.id); setOpen(true); };
  const startNew = () => { setForm(emptyGoal()); setEditingId(null); setOpen(true); };

  const handleSave = () => {
    const item: Goal = {
      ...emptyGoal(), ...form,
      id: editingId || uid(),
      currentProgress: Number(form.currentProgress) || 0,
      createdAt: editingId ? (form as Goal).createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Goal;
    save(item);
    setOpen(false);
  };

  const filtered = filter === "all" ? goals : goals.filter(g => g.status === filter);
  const set = (key: string, val: unknown) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Goals / Focus</h1>
          <p className="text-sm text-muted-foreground">
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : `${goals.filter(g=>g.status==='active').length} active goals`}
          </p>
        </div>
        <Button onClick={startNew}><Plus className="h-4 w-4 mr-1" />New Goal</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", ...STATUSES].map(s => (
          <Badge key={s} variant={filter === s ? "default" : "outline"} className="cursor-pointer" onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Badge>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No goals yet. Create your first goal to get started.</CardContent></Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map(g => (
          <Card key={g.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{g.title}</CardTitle>
                  <div className="flex gap-1 flex-wrap">
                    <Badge variant={g.priorityLevel === "primary" ? "default" : "secondary"} className="text-xs">{g.priorityLevel}</Badge>
                    <Badge variant="outline" className="text-xs">{g.status}</Badge>
                    {g.domain && <Badge variant="outline" className="text-xs">{g.domain}</Badge>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(g)}><Pencil className="h-3 w-3" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><Trash2 className="h-3 w-3" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Delete goal?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => remove(g.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {g.description && <p className="text-sm text-muted-foreground">{g.description}</p>}
              {g.target && <p className="text-xs text-muted-foreground">Target: {g.target}</p>}
              <div className="space-y-1">
                <div className="flex justify-between text-xs"><span>Progress</span><span>{g.currentProgress}%</span></div>
                <Progress value={g.currentProgress} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Goal" : "New Goal"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {(warnPrimary || warnSecondary) && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertTriangle className="h-4 w-4" />
                {warnPrimary ? "You already have 2 primary goals" : "You already have 1 secondary goal"}
              </div>
            )}
            <Input placeholder="Title" value={form.title || ""} onChange={e => set("title", e.target.value)} />
            <Textarea placeholder="Description" value={form.description || ""} onChange={e => set("description", e.target.value)} />
            <Select value={form.domain || ""} onValueChange={v => set("domain", v)}>
              <SelectTrigger><SelectValue placeholder="Domain" /></SelectTrigger>
              <SelectContent>{domains.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={form.priorityLevel || "maintenance"} onValueChange={v => set("priorityLevel", v)}>
              <SelectTrigger><SelectValue placeholder="Priority Level" /></SelectTrigger>
              <SelectContent>{PRIORITY_LEVELS.map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={form.status || "active"} onValueChange={v => set("status", v)}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Horizon (e.g. 6 months)" value={form.horizon || ""} onChange={e => set("horizon", e.target.value)} />
            <Input placeholder="Target" value={form.target || ""} onChange={e => set("target", e.target.value)} />
            <div>
              <label className="text-xs text-muted-foreground">Progress ({form.currentProgress || 0}%)</label>
              <Input type="range" min="0" max="100" value={form.currentProgress || 0} onChange={e => set("currentProgress", Number(e.target.value))} />
            </div>
            <Input type="date" value={form.reviewDate || ""} onChange={e => set("reviewDate", e.target.value)} />
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
