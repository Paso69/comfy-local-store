import { useState } from "react";
import { useStore, uid } from "@/lib/hooks";
import type { Routine, RoutineTemplate, RoutineCheckItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Copy, X, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const emptyRoutine = (): Partial<Routine> => ({
  title: "", description: "", checklist: [], estimatedDuration: "",
  weekdays: [1, 2, 3, 4, 5], time: "", status: "active", order: 0, templateId: "",
});

export default function RoutineBuilder() {
  const { items: routines, save, remove, saveStatus } = useStore<Routine>("routines");
  const { items: templates, save: saveTpl, remove: removeTpl } = useStore<RoutineTemplate>("routineTemplates");
  const [open, setOpen] = useState(false);
  const [tplOpen, setTplOpen] = useState(false);
  const [form, setForm] = useState<Partial<Routine>>(emptyRoutine());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState("all");
  const [newCheckItem, setNewCheckItem] = useState("");
  const [tplForm, setTplForm] = useState({ title: "", description: "" });

  const filtered = activeTemplate === "all" ? routines : routines.filter(r => r.templateId === activeTemplate);
  const activeRoutines = filtered.filter(r => r.status === "active").sort((a, b) => a.order - b.order);

  const startNew = () => { setForm({ ...emptyRoutine(), templateId: activeTemplate === "all" ? "" : activeTemplate }); setEditingId(null); setOpen(true); };
  const startEdit = (r: Routine) => { setForm(r); setEditingId(r.id); setOpen(true); };
  const duplicate = (r: Routine) => { save({ ...r, id: uid(), title: r.title + " (copy)", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); };

  const handleSave = () => {
    const item: Routine = {
      ...emptyRoutine(), ...form, checklist: form.checklist || [],
      id: editingId || uid(),
      createdAt: editingId ? (form as Routine).createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Routine;
    save(item);
    setOpen(false);
  };

  const addCheckItem = () => {
    if (!newCheckItem.trim()) return;
    setForm(prev => ({
      ...prev,
      checklist: [...(prev.checklist || []), { id: uid(), text: newCheckItem, done: false }]
    }));
    setNewCheckItem("");
  };

  const removeCheckItem = (itemId: string) => {
    setForm(prev => ({ ...prev, checklist: (prev.checklist || []).filter(c => c.id !== itemId) }));
  };

  const toggleCheckItem = (routineId: string, itemId: string) => {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;
    save({
      ...routine,
      checklist: routine.checklist.map(c => c.id === itemId ? { ...c, done: !c.done } : c),
      updatedAt: new Date().toISOString(),
    });
  };

  const toggleWeekday = (day: number) => {
    const days = form.weekdays || [];
    setForm(prev => ({
      ...prev,
      weekdays: days.includes(day) ? days.filter(d => d !== day) : [...days, day].sort()
    }));
  };

  const set = (key: string, val: unknown) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Routine Builder</h1>
          <p className="text-sm text-muted-foreground">
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : `${activeRoutines.length} active blocks`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTplOpen(true)}>Templates</Button>
          <Button onClick={startNew}><Plus className="h-4 w-4 mr-1" />New Block</Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge variant={activeTemplate === "all" ? "default" : "outline"} className="cursor-pointer" onClick={() => setActiveTemplate("all")}>All</Badge>
        {templates.map(t => (
          <Badge key={t.id} variant={activeTemplate === t.id ? "default" : "outline"} className="cursor-pointer" onClick={() => setActiveTemplate(t.id)}>
            {t.title}
          </Badge>
        ))}
      </div>

      {activeRoutines.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No routine blocks. Build your ideal day structure.</CardContent></Card>
      )}

      <div className="space-y-3">
        {activeRoutines.map(r => (
          <Card key={r.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{r.title}</CardTitle>
                  <div className="flex gap-1 mt-1">
                    {r.time && <Badge variant="outline" className="text-xs">{r.time}</Badge>}
                    {r.estimatedDuration && <Badge variant="outline" className="text-xs">{r.estimatedDuration}</Badge>}
                    <Badge variant="secondary" className="text-xs">{r.weekdays.map(d => WEEKDAYS[d - 1]).join(", ")}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicate(r)}><Copy className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(r)}><Pencil className="h-3 w-3" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><Trash2 className="h-3 w-3" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Delete block?</AlertDialogTitle></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => remove(r.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {r.checklist.map(c => (
                <div key={c.id} className="flex items-center gap-2">
                  <Checkbox checked={c.done} onCheckedChange={() => toggleCheckItem(r.id, c.id)} />
                  <span className={`text-sm ${c.done ? "line-through text-muted-foreground" : ""}`}>{c.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Block" : "New Block"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Block title" value={form.title || ""} onChange={e => set("title", e.target.value)} />
            <Textarea placeholder="Description" value={form.description || ""} onChange={e => set("description", e.target.value)} />
            <Select value={form.templateId || ""} onValueChange={v => set("templateId", v)}>
              <SelectTrigger><SelectValue placeholder="Template" /></SelectTrigger>
              <SelectContent>{templates.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Estimated duration" value={form.estimatedDuration || ""} onChange={e => set("estimatedDuration", e.target.value)} />
            <Input type="time" value={form.time || ""} onChange={e => set("time", e.target.value)} />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Weekdays</p>
              <div className="flex gap-1">{WEEKDAYS.map((d, i) => (
                <Button key={d} variant={(form.weekdays || []).includes(i + 1) ? "default" : "outline"} size="sm" className="h-7 w-9 text-xs p-0" onClick={() => toggleWeekday(i + 1)}>{d}</Button>
              ))}</div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Checklist</p>
              {(form.checklist || []).map(c => (
                <div key={c.id} className="flex items-center gap-2 mb-1">
                  <span className="text-sm flex-1">{c.text}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeCheckItem(c.id)}><X className="h-3 w-3" /></Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input placeholder="Add item" value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)} onKeyDown={e => e.key === "Enter" && addCheckItem()} className="h-8" />
                <Button size="sm" className="h-8" onClick={addCheckItem}><Plus className="h-3 w-3" /></Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title?.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tplOpen} onOpenChange={setTplOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Routine Templates</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {templates.map(t => (
              <div key={t.id} className="flex items-center justify-between">
                <span className="text-sm">{t.title}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeTpl(t.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Input placeholder="New template name" value={tplForm.title} onChange={e => setTplForm({ ...tplForm, title: e.target.value })} className="h-8" />
              <Button size="sm" className="h-8" onClick={() => {
                if (!tplForm.title.trim()) return;
                saveTpl({ id: uid(), title: tplForm.title, description: "", createdAt: new Date().toISOString() });
                setTplForm({ title: "", description: "" });
              }}><Plus className="h-3 w-3" /></Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
