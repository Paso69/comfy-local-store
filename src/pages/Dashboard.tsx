import { useEffect, useState } from "react";
import { useStore, uid } from "@/lib/hooks";
import type { Task, Habit, HabitLog, Goal, ScheduleItem, DashboardWidget } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckSquare, Target, Flame, Calendar, Plus, Zap, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const WIDGET_LABELS: Record<string, string> = {
  priorities: "Active Priorities",
  todayTasks: "Today's Tasks",
  weeklyProgress: "Weekly Progress",
  habitSnapshot: "Habit Snapshot",
  quickCapture: "Quick Capture",
  reviewReminder: "Weekly Review",
  upcomingSchedule: "Upcoming Schedule",
};

export default function Dashboard() {
  const { items: goals } = useStore<Goal>("goals");
  const { items: tasks, save: saveTask } = useStore<Task>("tasks");
  const { items: habits } = useStore<Habit>("habits");
  const { items: habitLogs } = useStore<HabitLog>("habitLogs");
  const { items: scheduleItems } = useStore<ScheduleItem>("scheduleItems");
  const { items: widgets, save: saveWidget } = useStore<DashboardWidget>("dashboardWidgets");
  const navigate = useNavigate();
  const [quickText, setQuickText] = useState("");
  const [quickType, setQuickType] = useState("task");
  const [manageOpen, setManageOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const activeGoals = goals.filter((g) => g.status === "active" && (g.priorityLevel === "primary" || g.priorityLevel === "secondary"));
  const todayTasks = tasks.filter((t) => t.status !== "done" && t.status !== "archived");
  const activeHabits = habits.filter((h) => h.status === "active");
  const todayLogs = habitLogs.filter((l) => l.date === today);
  const completedToday = todayLogs.filter((l) => l.completed).length;
  const upcomingItems = scheduleItems.filter((s) => s.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);

  const handleQuickAdd = () => {
    if (!quickText.trim()) return;
    if (quickType === "task") {
      saveTask({
        id: uid(), title: quickText, description: "", domain: "", linkedGoalId: "",
        priority: "medium", dueDate: today, recurrence: "", estimatedEffort: "",
        status: "not-started", tags: [], notes: "", listId: "", order: 0,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      });
    } else {
      navigate(`/notes?quick=${encodeURIComponent(quickText)}&type=${quickType}`);
    }
    setQuickText("");
  };

  const toggleWidget = (w: DashboardWidget) => saveWidget({ ...w, visible: !w.visible });
  const toggleCollapse = (w: DashboardWidget) => saveWidget({ ...w, collapsed: !w.collapsed });
  const moveWidget = (w: DashboardWidget, dir: number) => {
    const sorted = [...widgets].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s.id === w.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    saveWidget({ ...sorted[idx], order: sorted[swapIdx].order });
    saveWidget({ ...sorted[swapIdx], order: sorted[idx].order });
  };

  const renderWidget = (w: DashboardWidget) => {
    if (!w.visible) return null;
    const content: Record<string, React.ReactNode> = {
      priorities: (
        <div className="space-y-2">
          {activeGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active priorities set</p>
          ) : (
            activeGoals.map((g) => (
              <div key={g.id} className="flex items-center gap-2">
                <Badge variant={g.priorityLevel === "primary" ? "default" : "secondary"} className="text-xs">{g.priorityLevel}</Badge>
                <span className="text-sm">{g.title}</span>
              </div>
            ))
          )}
        </div>
      ),
      todayTasks: (
        <div className="space-y-1">
          {todayTasks.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center gap-2 text-sm">
              <CheckSquare className="h-3 w-3 text-muted-foreground" />
              <span>{t.title}</span>
            </div>
          ))}
          {todayTasks.length === 0 && <p className="text-sm text-muted-foreground">All clear!</p>}
        </div>
      ),
      weeklyProgress: (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tasks done this week</span>
            <span className="font-medium">{tasks.filter((t) => t.status === "done").length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Habits completed today</span>
            <span className="font-medium">{completedToday}/{activeHabits.length}</span>
          </div>
        </div>
      ),
      habitSnapshot: (
        <div className="space-y-1">
          {activeHabits.slice(0, 5).map((h) => {
            const done = todayLogs.some((l) => l.habitId === h.id && l.completed);
            return (
              <div key={h.id} className="flex items-center gap-2 text-sm">
                <div className={`h-2 w-2 rounded-full ${done ? "bg-primary" : "bg-muted"}`} />
                <span className={done ? "line-through text-muted-foreground" : ""}>{h.title}</span>
              </div>
            );
          })}
        </div>
      ),
      quickCapture: (
        <div className="flex gap-2">
          <Select value={quickType} onValueChange={setQuickType}>
            <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="Idea">Idea</SelectItem>
              <SelectItem value="Journal">Journal</SelectItem>
              <SelectItem value="Quote / Phrase">Quote</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Quick capture..." value={quickText} onChange={(e) => setQuickText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()} className="h-8 text-sm" />
          <Button size="sm" className="h-8" onClick={handleQuickAdd}><Plus className="h-3 w-3" /></Button>
        </div>
      ),
      reviewReminder: (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Have you done your weekly review?</p>
          <Button variant="outline" size="sm" onClick={() => navigate("/review")}>Start Review</Button>
        </div>
      ),
      upcomingSchedule: (
        <div className="space-y-1">
          {upcomingItems.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-sm">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{s.date}</span>
              <span>{s.title}</span>
            </div>
          ))}
          {upcomingItems.length === 0 && <p className="text-sm text-muted-foreground">Nothing scheduled</p>}
        </div>
      ),
    };

    const icons: Record<string, React.ReactNode> = {
      priorities: <Target className="h-4 w-4" />,
      todayTasks: <CheckSquare className="h-4 w-4" />,
      weeklyProgress: <Flame className="h-4 w-4" />,
      habitSnapshot: <Flame className="h-4 w-4" />,
      quickCapture: <Zap className="h-4 w-4" />,
      reviewReminder: <Calendar className="h-4 w-4" />,
      upcomingSchedule: <Calendar className="h-4 w-4" />,
    };

    return (
      <Card key={w.id}>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            {icons[w.type]}
            <CardTitle className="text-sm font-medium">{WIDGET_LABELS[w.type]}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveWidget(w, -1)}><ChevronUp className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveWidget(w, 1)}><ChevronDown className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleCollapse(w)}>
              {w.collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            </Button>
          </div>
        </CardHeader>
        {!w.collapsed && <CardContent>{content[w.type]}</CardContent>}
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your command center</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setManageOpen(true)}>
          <Eye className="h-3 w-3 mr-1" /> Manage Widgets
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sortedWidgets.map(renderWidget)}
      </div>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manage Widgets</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {sortedWidgets.map((w) => (
              <div key={w.id} className="flex items-center justify-between py-1">
                <span className="text-sm">{WIDGET_LABELS[w.type]}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleWidget(w)}>
                  {w.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter><Button onClick={() => setManageOpen(false)}>Done</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
