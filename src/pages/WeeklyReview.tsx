import { useState, useEffect } from "react";
import { useStore, uid } from "@/lib/hooks";
import type { WeeklyReview, ReviewTemplate } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, FileText, ChevronDown, ChevronUp } from "lucide-react";

function getWeekStart(d: Date = new Date()) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split("T")[0];
}

export default function WeeklyReviewPage() {
  const { items: reviews, save, saveStatus } = useStore<WeeklyReview>("weeklyReviews");
  const { items: templates } = useStore<ReviewTemplate>("reviewTemplates");
  const [selectedWeek, setSelectedWeek] = useState(getWeekStart());
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const activeTemplates = templates.filter(t => !t.archived);
  const currentReview = reviews.find(r => r.weekStart === selectedWeek);
  const currentPrompts = selectedTemplate ? templates.find(t => t.id === selectedTemplate)?.prompts || [] : activeTemplates[0]?.prompts || [];

  useEffect(() => {
    if (activeTemplates.length > 0 && !selectedTemplate) setSelectedTemplate(activeTemplates[0].id);
  }, [activeTemplates]);

  const [responses, setResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currentReview) { setResponses(currentReview.responses); }
    else { setResponses({}); }
  }, [selectedWeek, currentReview]);

  const handleResponseChange = (prompt: string, value: string) => {
    const updated = { ...responses, [prompt]: value };
    setResponses(updated);
    const review: WeeklyReview = {
      id: currentReview?.id || uid(),
      weekStart: selectedWeek,
      templateId: selectedTemplate,
      responses: updated,
      createdAt: currentReview?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    save(review);
  };

  const pastReviews = reviews.filter(r => r.weekStart !== selectedWeek && (!search || JSON.stringify(r.responses).toLowerCase().includes(search.toLowerCase()))).sort((a, b) => b.weekStart.localeCompare(a.weekStart));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Weekly Review</h1><p className="text-sm text-muted-foreground">{saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : "Reflect. Adjust. Improve."}</p></div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Input type="date" value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)} className="w-44 h-8" />
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
          <SelectTrigger className="w-44 h-8"><SelectValue placeholder="Template" /></SelectTrigger>
          <SelectContent>{activeTemplates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {currentPrompts.map((prompt, i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{prompt}</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={responses[prompt] || ""} onChange={e => handleResponseChange(prompt, e.target.value)} placeholder="Your reflection..." rows={3} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-4 border-t">
        <h2 className="text-lg font-semibold mb-3">Past Reviews</h2>
        <Input placeholder="Search reviews..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm h-8 mb-3" />
        {pastReviews.length === 0 && <p className="text-sm text-muted-foreground">No past reviews yet.</p>}
        {pastReviews.map(r => (
          <Card key={r.id} className="mb-2">
            <CardHeader className="pb-1 cursor-pointer" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Week of {r.weekStart}</CardTitle>
                {expanded === r.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
            {expanded === r.id && (
              <CardContent className="space-y-2">
                {Object.entries(r.responses).map(([prompt, response]) => response && (
                  <div key={prompt}><p className="text-xs font-medium text-muted-foreground">{prompt}</p><p className="text-sm">{response}</p></div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
