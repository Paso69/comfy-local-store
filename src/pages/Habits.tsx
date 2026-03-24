import { useState } from "react";
import { useStore, uid } from "@/lib/hooks";
import type { Habit, HabitLog, Domain } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Flame, Check } from "lucide-react";

const emptyHabit = (): Partial<Habit> => ({
  title: "", description: "", domain: "", frequency: "daily",
  targetCount: 1, unit: "times", status: "active", order: 0,
});

export default function Habits() {
  const { items: habits, save, remove, saveStatus } = useStore<Habit>("habits");
  const { items: logs, save: saveLog } = useStore<HabitLog>("habitLogs");
  const { items: domains } = useStore<Domain>("domains");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Habit>>(emptyHabit());
  const [editingId, setEditingId] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const activeHabits = habits.filter(h => h.status === "active").sort((a, b) => a.order - b.order);

  const isCompleted = (habitId: string) => logs.some(l => l.habitId === habitId && l.date === today && l.completed);

  const toggleCompletion = (habitId: string) => {
    const existing = logs.find(l => l.habitId === habitId && l.date === today);
    if (existing) {
      saveLog({ ...existing, completed: !existing.completed });
    } else {
      saveLog({ id: uid(), habitId, date: today, completed: true, count: 1, createdAt: new Date().toISOString() });
    }
  };

  const getStreak = (habitId: string) => {
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = d.toISOString().split("T")[0];
      const log = logs.find(l => l.habitId === habitId && l.date === dateStr && l.completed);
      if (log) { streak++; d.setDate(d.getDate() - 1); }
      else if (i === 0) { d.setDate(d.getDate() - 1); continue; }
      else break;
    }
    return streak;
  };

  const getWeekRate = (habitId: string) => {
    const d = new Date();
    let completed = 0;
    for (let i = 0; i < 7; i++) {
      const dateStr = d.toISOString().split("T")[0];
      if (logs.some(l => l.habitId === habitId && l.date === dateStr && l.completed)) completed++;
      d.setDate(d.getDate() - 1);
    }
    return Math.round((completed / 7) * 100);
  };

  const completedToday = activeHabits.filter(h => isCompleted(h.id)).length;

  const startNew = () => { setForm(emptyHabit()); setEditingId(null); setOpen(true); };
  const startEdit = (h: Habit) => { setForm(h); setEditingId(h.id); setOpen(true); };

  const handleSave = () => {
    const item: Habit = {
      ...emptyHabit(), ...form,
      id: editingId || uid(),
      targetCount: Number(form.targetCount) || 1,
      createdAt: editingId ? (form as Habit).createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Habit;
    save(item);
    setOpen(false);
  };

  const set = (key: string, val: unknown) => setForm(prev => ({ ...prev, [key]: val }));

  // Last 7 days for mini calendar
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Habits</h1>
          <p className="text-sm text-muted-foreground">
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : `${completedToday}/${activeHabits.length} completed today`}
          </p>
        </div>
        <Button onClick={startNew}><Plus className="h-4 w-4 mr-1" />New Habit</Button>
      </div>

      {activeHabits.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No habits yet. Start tracking your consistency.</CardContent></Card>
      )}

      <div className="space-y-3">
        {activeHabits.map(h => {
          const done = isCompleted(h.id);
          const streak = getStreak(h.id);
          const weekRate = getWeekRate(h.id);
          return (
            <Card key={h.id} className={done ? "border-primary/30" : ""}>
              <CardContent className="py-3 flex items-center gap-4">
                <Button
                  variant={done ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full"
                  onClick={() => toggleCompletion(h.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${done ? "line-through text-muted-foreground" : ""}`}>{h.title}</p>
                  <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                    {streak > 0 && (
                      <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-accent" />{streak}d streak</span>
                    )}
                    <span>{weekRate}% this week</span>
                    <span>{h.frequency}</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {last7.map(date => {
                      const logged = logs.some(l => l.habitId === h.id && l.date === date && l.completed);
                      return <div key={date} className={`h-2 w-2 rounded-full ${logged ? "bg-primary" : "bg-muted"}`} />;
                    })}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(h)}><Pencil className="h-3 w-3" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><Trash2 className="h-3 w-3" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Delete habit?</AlertDialogTitle><AlertDialogDescription>History will be preserved.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => remove(h.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? "Edit Habit" : "New Habit"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Habit title" value={form.title || ""} onChange={e => set("title", e.target.value)} />
            <Textarea placeholder="Description" value={form.description || ""} onChange={e => set("description", e.target.value)} />
            <Select value={form.domain || ""} onValueChange={v => set("domain", v)}>
              <SelectTrigger><SelectValue placeholder="Domain" /></SelectTrigger>
              <SelectContent>{domains.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={form.frequency || "daily"} onValueChange={v => set("frequency", v)}>
              <SelectTrigger><SelectValue placeholder="Frequency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input type="number" placeholder="Target" value={form.targetCount || 1} onChange={e => set("targetCount", e.target.value)} className="w-24" />
              <Input placeholder="Unit" value={form.unit || ""} onChange={e => set("unit", e.target.value)} />
            </div>
            <Select value={form.status || "active"} onValueChange={v => set("status", v)}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
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
