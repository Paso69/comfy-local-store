import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/lib/hooks";
import type { FinancialRoadmapData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";

const FIELDS: { key: keyof FinancialRoadmapData; label: string; type: "text" | "area" }[] = [
  { key: "vision", label: "Vision", type: "area" },
  { key: "currentBaseline", label: "Current Baseline", type: "area" },
  { key: "monthlyBaselineCost", label: "Monthly Baseline Cost", type: "text" },
  { key: "comfortTarget", label: "Comfort Target", type: "text" },
  { key: "independenceTarget", label: "Independence Target", type: "text" },
  { key: "incomeStreams", label: "Income Streams", type: "area" },
  { key: "savingsTargets", label: "Savings Targets", type: "area" },
  { key: "capitalTargets", label: "Capital Targets", type: "area" },
  { key: "targetIncomeSources", label: "Target Income Sources", type: "area" },
  { key: "currentFocus", label: "Current Focus", type: "area" },
  { key: "nextMilestones", label: "Next Milestones", type: "area" },
  { key: "notes", label: "Notes & Reflections", type: "area" },
];

export default function FinancialRoadmap() {
  const { items, save, saveStatus } = useStore<FinancialRoadmapData>("financialRoadmap");
  const [form, setForm] = useState<Partial<FinancialRoadmapData>>({});
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (items.length > 0) setForm(items[0]);
  }, [items]);

  const autoSave = useCallback((updated: Partial<FinancialRoadmapData>) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => {
      save({ ...updated, id: "main", updatedAt: new Date().toISOString() } as FinancialRoadmapData);
    }, 800);
    setDebounceTimer(timer);
  }, [save, debounceTimer]);

  const set = (key: string, val: string) => {
    const updated = { ...form, [key]: val };
    setForm(updated);
    autoSave(updated);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Financial Roadmap</h1>
        <p className="text-sm text-muted-foreground">{saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : "Your path to financial independence"}</p>
      </div>
      {FIELDS.map(f => (
        <Card key={f.key}>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-3 w-3" />{f.label}</CardTitle></CardHeader>
          <CardContent>
            {f.type === "text" ? (
              <Input value={(form[f.key] as string) || ""} onChange={e => set(f.key, e.target.value)} placeholder={f.label} />
            ) : (
              <Textarea value={(form[f.key] as string) || ""} onChange={e => set(f.key, e.target.value)} placeholder={f.label} rows={3} />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
