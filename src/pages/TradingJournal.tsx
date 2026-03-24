import { useState } from "react";
import { useStore, uid } from "@/lib/hooks";
import type { Trade } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, TrendingUp } from "lucide-react";

const emptyTrade = (): Partial<Trade> => ({ date: new Date().toISOString().split("T")[0], instrument: "", setup: "", thesis: "", entry: "", stop: "", target: "", result: "", emotionalState: "", ruleFollowingScore: 5, lessonLearned: "", imageData: "", tags: [] });

export default function TradingJournal() {
  const { items, save, remove, saveStatus } = useStore<Trade>("trades");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Trade>>(emptyTrade());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const startNew = () => { setForm(emptyTrade()); setEditingId(null); setOpen(true); };
  const startEdit = (t: Trade) => { setForm(t); setEditingId(t.id); setOpen(true); };
  const handleSave = () => {
    save({ ...emptyTrade(), ...form, tags: form.tags || [], ruleFollowingScore: Number(form.ruleFollowingScore) || 5, id: editingId || uid(), createdAt: editingId ? (form as Trade).createdAt : new Date().toISOString(), updatedAt: new Date().toISOString() } as Trade);
    setOpen(false);
  };
  const filtered = items.filter(t => !search || t.instrument.toLowerCase().includes(search.toLowerCase()) || t.setup.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.date.localeCompare(a.date));
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Trading Journal</h1><p className="text-sm text-muted-foreground">{saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : `${items.length} trades`}</p></div>
        <Button onClick={startNew}><Plus className="h-4 w-4 mr-1" />New Trade</Button>
      </div>
      <Input placeholder="Search by instrument or setup..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm h-8" />
      {filtered.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground"><TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />No trades logged yet.</CardContent></Card>}
      <div className="space-y-3">
        {filtered.map(t => (
          <Card key={t.id}>
            <CardHeader className="pb-2"><div className="flex items-start justify-between">
              <div><CardTitle className="text-sm">{t.instrument} — {t.setup || "No setup"}</CardTitle><div className="flex gap-1 mt-1"><Badge variant="outline" className="text-xs">{t.date}</Badge>{t.result && <Badge variant={t.result.startsWith("+") || t.result.toLowerCase().includes("win") ? "default" : "secondary"} className="text-xs">{t.result}</Badge>}<Badge variant="outline" className="text-xs">Rule: {t.ruleFollowingScore}/10</Badge></div></div>
              <div className="flex gap-1"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(t)}><Pencil className="h-3 w-3" /></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><Trash2 className="h-3 w-3" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete trade?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => remove(t.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>
            </div></CardHeader>
            <CardContent>{t.thesis && <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">Thesis:</span> {t.thesis}</p>}{t.lessonLearned && <p className="text-xs text-muted-foreground"><span className="font-medium">Lesson:</span> {t.lessonLearned}</p>}</CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "New"} Trade</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input type="date" value={form.date || ""} onChange={e => set("date", e.target.value)} />
            <Input placeholder="Instrument" value={form.instrument || ""} onChange={e => set("instrument", e.target.value)} />
            <Input placeholder="Setup" value={form.setup || ""} onChange={e => set("setup", e.target.value)} />
            <Textarea placeholder="Thesis" value={form.thesis || ""} onChange={e => set("thesis", e.target.value)} />
            <div className="grid grid-cols-3 gap-2"><Input placeholder="Entry" value={form.entry || ""} onChange={e => set("entry", e.target.value)} /><Input placeholder="Stop" value={form.stop || ""} onChange={e => set("stop", e.target.value)} /><Input placeholder="Target" value={form.target || ""} onChange={e => set("target", e.target.value)} /></div>
            <Input placeholder="Result" value={form.result || ""} onChange={e => set("result", e.target.value)} />
            <Input placeholder="Emotional state" value={form.emotionalState || ""} onChange={e => set("emotionalState", e.target.value)} />
            <div><label className="text-xs text-muted-foreground">Rule-following score ({form.ruleFollowingScore || 5}/10)</label><Input type="range" min="1" max="10" value={form.ruleFollowingScore || 5} onChange={e => set("ruleFollowingScore", Number(e.target.value))} /></div>
            <Textarea placeholder="Lesson learned" value={form.lessonLearned || ""} onChange={e => set("lessonLearned", e.target.value)} />
            <Input placeholder="Tags (comma-separated)" value={(form.tags || []).join(", ")} onChange={e => set("tags", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={!form.instrument?.trim()}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
