import { useState } from "react";
import { useStore, uid } from "@/lib/hooks";
import type { Domain, TaskList, ReviewTemplate } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Download, Upload, RotateCcw } from "lucide-react";
import { exportAllData, importAllData, clearAllData } from "@/lib/db";
import { toast } from "@/hooks/use-toast";

export default function Settings() {
  const { items: domains, save: saveDomain, remove: removeDomain } = useStore<Domain>("domains");
  const { items: taskLists, save: saveList, remove: removeList } = useStore<TaskList>("taskLists");
  const { items: templates, save: saveTpl, remove: removeTpl } = useStore<ReviewTemplate>("reviewTemplates");
  const [newDomain, setNewDomain] = useState("");
  const [newList, setNewList] = useState("");
  const [newTpl, setNewTpl] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [editTplId, setEditTplId] = useState<string | null>(null);

  const handleExport = async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `life-os-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "Backup downloaded." });
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text);
      await importAllData(data);
      toast({ title: "Imported", description: "Data restored. Refreshing..." });
      setTimeout(() => window.location.reload(), 1000);
    };
    input.click();
  };

  const handleReset = async () => {
    await clearAllData();
    toast({ title: "Reset", description: "All data cleared. Refreshing..." });
    setTimeout(() => window.location.reload(), 1000);
  };

  const sortedDomains = [...domains].filter(d => !d.archived).sort((a, b) => a.order - b.order);
  const sortedLists = [...taskLists].filter(l => !l.archived).sort((a, b) => a.order - b.order);
  const activeTpls = templates.filter(t => !t.archived);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Data Management</CardTitle></CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-1" />Export JSON</Button>
          <Button variant="outline" onClick={handleImport}><Upload className="h-4 w-4 mr-1" />Import JSON</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="destructive"><RotateCcw className="h-4 w-4 mr-1" />Reset All Data</Button></AlertDialogTrigger>
            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Reset all data?</AlertDialogTitle><AlertDialogDescription>This will permanently delete all your data. This cannot be undone. Export a backup first.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleReset}>Reset Everything</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Domains</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {sortedDomains.map(d => (
            <div key={d.id} className="flex items-center justify-between"><span className="text-sm">{d.name}</span><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeDomain(d.id)}><Trash2 className="h-3 w-3" /></Button></div>
          ))}
          <div className="flex gap-2 pt-2">
            <Input placeholder="New domain" value={newDomain} onChange={e => setNewDomain(e.target.value)} className="h-8" onKeyDown={e => { if (e.key === "Enter" && newDomain.trim()) { saveDomain({ id: uid(), name: newDomain.trim(), order: domains.length, archived: false }); setNewDomain(""); } }} />
            <Button size="sm" className="h-8" onClick={() => { if (newDomain.trim()) { saveDomain({ id: uid(), name: newDomain.trim(), order: domains.length, archived: false }); setNewDomain(""); } }}><Plus className="h-3 w-3" /></Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Task Lists</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {sortedLists.map(l => (
            <div key={l.id} className="flex items-center justify-between"><span className="text-sm">{l.name}</span><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeList(l.id)}><Trash2 className="h-3 w-3" /></Button></div>
          ))}
          <div className="flex gap-2 pt-2">
            <Input placeholder="New list" value={newList} onChange={e => setNewList(e.target.value)} className="h-8" onKeyDown={e => { if (e.key === "Enter" && newList.trim()) { saveList({ id: uid(), name: newList.trim(), order: taskLists.length, archived: false }); setNewList(""); } }} />
            <Button size="sm" className="h-8" onClick={() => { if (newList.trim()) { saveList({ id: uid(), name: newList.trim(), order: taskLists.length, archived: false }); setNewList(""); } }}><Plus className="h-3 w-3" /></Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Review Templates</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {activeTpls.map(t => (
            <div key={t.id} className="border rounded-md p-3 space-y-2">
              <div className="flex items-center justify-between"><span className="text-sm font-medium">{t.name}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setEditTplId(editTplId === t.id ? null : t.id)}>{editTplId === t.id ? "Close" : "Edit"}</Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeTpl(t.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
              {editTplId === t.id && (
                <div className="space-y-1">
                  {t.prompts.map((p, i) => (
                    <div key={i} className="flex items-center gap-2"><span className="text-xs flex-1">{p}</span><Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => saveTpl({ ...t, prompts: t.prompts.filter((_, j) => j !== i) })}><Trash2 className="h-2 w-2" /></Button></div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <Input placeholder="New prompt" value={newPrompt} onChange={e => setNewPrompt(e.target.value)} className="h-7 text-xs" />
                    <Button size="sm" className="h-7 text-xs" onClick={() => { if (newPrompt.trim()) { saveTpl({ ...t, prompts: [...t.prompts, newPrompt.trim()] }); setNewPrompt(""); } }}>Add</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Input placeholder="New template name" value={newTpl} onChange={e => setNewTpl(e.target.value)} className="h-8" />
            <Button size="sm" className="h-8" onClick={() => { if (newTpl.trim()) { saveTpl({ id: uid(), name: newTpl.trim(), prompts: [], archived: false }); setNewTpl(""); } }}><Plus className="h-3 w-3" /></Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Toggle dark/light mode using the button in the top-right corner of the header.</p>
        </CardContent>
      </Card>
    </div>
  );
}
