import { useState } from "react";
import { useStore, uid } from "@/lib/hooks";
import type { PhoneRule, PhoneLog } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Smartphone, AlertTriangle } from "lucide-react";

const MODES = ["Work Mode", "Social Mode", "Trading Mode", "Capture Mode"];

export default function PhoneProtocol() {
  const { items: rules, save: saveRule, remove: removeRule, saveStatus } = useStore<PhoneRule>("phoneRules");
  const { items: logs, save: saveLog, remove: removeLog } = useStore<PhoneLog>("phoneLogs");
  const [ruleOpen, setRuleOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [ruleForm, setRuleForm] = useState({ mode: "Work Mode", rule: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [logForm, setLogForm] = useState({ type: "breach" as "breach" | "reflection", content: "" });

  const sortedRules = [...rules].sort((a, b) => a.order - b.order);
  const today = new Date().toISOString().split("T")[0];
  const recentLogs = logs.filter(l => l.date >= today).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const startNewRule = () => { setRuleForm({ mode: "Work Mode", rule: "" }); setEditingId(null); setRuleOpen(true); };
  const startEditRule = (r: PhoneRule) => { setRuleForm({ mode: r.mode, rule: r.rule }); setEditingId(r.id); setRuleOpen(true); };

  const handleSaveRule = () => {
    if (!ruleForm.rule.trim()) return;
    saveRule({ id: editingId || uid(), mode: ruleForm.mode, rule: ruleForm.rule, enabled: true, order: editingId ? rules.find(r => r.id === editingId)?.order || 0 : rules.length, createdAt: editingId ? rules.find(r => r.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString() });
    setRuleOpen(false);
  };

  const handleSaveLog = () => {
    if (!logForm.content.trim()) return;
    saveLog({ id: uid(), date: today, type: logForm.type, content: logForm.content, createdAt: new Date().toISOString() });
    setLogForm({ type: "breach", content: "" });
    setLogOpen(false);
  };

  const groupedByMode: Record<string, PhoneRule[]> = {};
  sortedRules.forEach(r => { (groupedByMode[r.mode] = groupedByMode[r.mode] || []).push(r); });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Phone Protocol</h1><p className="text-sm text-muted-foreground">{saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : "Control your device, not the other way around."}</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLogOpen(true)}><AlertTriangle className="h-4 w-4 mr-1" />Log</Button>
          <Button onClick={startNewRule}><Plus className="h-4 w-4 mr-1" />New Rule</Button>
        </div>
      </div>

      {Object.entries(groupedByMode).map(([mode, modeRules]) => (
        <Card key={mode}>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Smartphone className="h-4 w-4" />{mode}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {modeRules.map(r => (
              <div key={r.id} className="flex items-center gap-3">
                <Switch checked={r.enabled} onCheckedChange={v => saveRule({ ...r, enabled: v })} />
                <span className={`text-sm flex-1 ${!r.enabled ? "text-muted-foreground line-through" : ""}`}>{r.rule}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEditRule(r)}><Pencil className="h-3 w-3" /></Button>
                <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><Trash2 className="h-3 w-3" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete rule?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => removeRule(r.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {rules.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">No phone rules yet. Define your boundaries.</CardContent></Card>}

      <div className="pt-4 border-t">
        <h2 className="text-lg font-semibold mb-3">Recent Logs</h2>
        {recentLogs.length === 0 && <p className="text-sm text-muted-foreground">No logs today.</p>}
        {recentLogs.map(l => (
          <Card key={l.id} className="mb-2"><CardContent className="py-2 flex items-center gap-3">
            <Badge variant={l.type === "breach" ? "destructive" : "secondary"} className="text-xs">{l.type}</Badge>
            <span className="text-sm flex-1">{l.content}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeLog(l.id)}><Trash2 className="h-3 w-3" /></Button>
          </CardContent></Card>
        ))}
      </div>

      <Dialog open={ruleOpen} onOpenChange={setRuleOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? "Edit" : "New"} Rule</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Select value={ruleForm.mode} onValueChange={v => setRuleForm(p => ({ ...p, mode: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MODES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
            <Input placeholder="Rule" value={ruleForm.rule} onChange={e => setRuleForm(p => ({ ...p, rule: e.target.value }))} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setRuleOpen(false)}>Cancel</Button><Button onClick={handleSaveRule}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Entry</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Select value={logForm.type} onValueChange={v => setLogForm(p => ({ ...p, type: v as "breach" | "reflection" }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="breach">Breach</SelectItem><SelectItem value="reflection">Reflection</SelectItem></SelectContent></Select>
            <Textarea placeholder="What happened?" value={logForm.content} onChange={e => setLogForm(p => ({ ...p, content: e.target.value }))} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setLogOpen(false)}>Cancel</Button><Button onClick={handleSaveLog}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
