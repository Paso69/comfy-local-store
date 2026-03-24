import { useState } from "react";
import { useStore, uid } from "@/lib/hooks";
import type { ScheduleItem, Domain, Goal } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Copy, Clock } from "lucide-react";

const TYPES = ["fixed", "flexible", "recurring", "deadline", "event"] as const;

const emptyItem = (): Partial<ScheduleItem> => ({
  title: "", description: "", date: new Date().toISOString().split("T")[0],
  startTime: "", endTime: "", type: "flexible", recurrence: "",
  domain: "", linkedGoalId: "", linkedTaskId: "", notes: "",
});

export default function SchedulePlanner() {
  const { items, save, remove, saveStatus } = useStore<ScheduleItem>("scheduleItems");
  const { items: domains } = useStore<Domain>("domains");
  const { items: goals } = useStore<Goal>("goals");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<ScheduleItem>>(emptyItem());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [view, setView] = useState("week");

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const getWeekDays = () => {
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay() + 1);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  };

  const getMonthDays = () => {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const days: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  };

  const viewDays = view === "day" ? [todayStr] : view === "week" ? getWeekDays() : getMonthDays();
  const agendaItems = items.filter(i => i.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  const startNew = (date?: string) => { setForm({ ...emptyItem(), date: date || todayStr }); setEditingId(null); setOpen(true); };
  const startEdit = (s: ScheduleItem) => { setForm(s); setEditingId(s.id); setOpen(true); };
  const duplicate = (s: ScheduleItem) => save({ ...s, id: uid(), title: s.title + " (copy)", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

  const handleSave = () => {
    const item: ScheduleItem = {
      ...emptyItem(), ...form,
      id: editingId || uid(),
      createdAt: editingId ? (form as ScheduleItem).createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ScheduleItem;
    save(item);
    setOpen(false);
  };

  const set = (key: string, val: unknown) => setForm(prev => ({ ...prev, [key]: val }));
  const dayName = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Schedule Planner</h1>
          <p className="text-sm text-muted-foreground">{saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : ""}</p>
        </div>
        <Button onClick={() => startNew()}><Plus className="h-4 w-4 mr-1" />New Item</Button>
      </div>

      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>

        {["day", "week", "month"].map(v => (
          <TabsContent key={v} value={v} className="mt-4 space-y-4">
            {(v === view ? viewDays : []).map(date => {
              const dayItems = items.filter(i => i.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime));
              return (
                <div key={date}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-sm font-medium ${date === todayStr ? "text-primary" : "text-muted-foreground"}`}>{dayName(date)}</h3>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => startNew(date)}><Plus className="h-3 w-3" /></Button>
                  </div>
                  {dayItems.length === 0 ? (
                    <p className="text-xs text-muted-foreground ml-2">—</p>
                  ) : dayItems.map(s => (
                    <Card key={s.id} className="mb-1">
                      <CardContent className="py-2 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{s.title}</p>
                          <div className="flex gap-1 mt-0.5">
                            {s.startTime && <Badge variant="outline" className="text-xs"><Clock className="h-2 w-2 mr-0.5" />{s.startTime}{s.endTime && `–${s.endTime}`}</Badge>}
                            <Badge variant="secondary" className="text-xs">{s.type}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => duplicate(s)}><Copy className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(s)}><Pencil className="h-3 w-3" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><Trash2 className="h-3 w-3" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Delete?</AlertDialogTitle></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => remove(s.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              );
            })}
          </TabsContent>
        ))}

        <TabsContent value="agenda" className="mt-4 space-y-2">
          {agendaItems.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">Nothing scheduled</CardContent></Card>}
          {agendaItems.slice(0, 20).map(s => (
            <Card key={s.id}>
              <CardContent className="py-2 flex items-center gap-3">
                <Badge variant="outline" className="text-xs shrink-0">{s.date}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{s.title}</p>
                  {s.startTime && <span className="text-xs text-muted-foreground">{s.startTime}{s.endTime && `–${s.endTime}`}</span>}
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(s)}><Pencil className="h-3 w-3" /></Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "New"} Schedule Item</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title" value={form.title || ""} onChange={e => set("title", e.target.value)} />
            <Textarea placeholder="Description" value={form.description || ""} onChange={e => set("description", e.target.value)} />
            <Input type="date" value={form.date || ""} onChange={e => set("date", e.target.value)} />
            <div className="flex gap-2">
              <Input type="time" value={form.startTime || ""} onChange={e => set("startTime", e.target.value)} />
              <Input type="time" value={form.endTime || ""} onChange={e => set("endTime", e.target.value)} />
            </div>
            <Select value={form.type || "flexible"} onValueChange={v => set("type", v)}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Recurrence" value={form.recurrence || ""} onChange={e => set("recurrence", e.target.value)} />
            <Select value={form.domain || ""} onValueChange={v => set("domain", v)}>
              <SelectTrigger><SelectValue placeholder="Domain" /></SelectTrigger>
              <SelectContent>{domains.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
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
