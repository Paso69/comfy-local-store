export interface Goal {
  id: string;
  title: string;
  description: string;
  domain: string;
  priorityLevel: 'primary' | 'secondary' | 'maintenance' | 'someday';
  horizon: string;
  target: string;
  currentProgress: number;
  status: 'active' | 'paused' | 'archived' | 'completed';
  notes: string;
  reviewDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  domain: string;
  linkedGoalId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  recurrence: string;
  estimatedEffort: string;
  status: 'not-started' | 'in-progress' | 'done' | 'deferred' | 'archived';
  tags: string[];
  notes: string;
  listId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  domain: string;
  frequency: 'daily' | 'weekly' | 'custom';
  targetCount: number;
  unit: string;
  status: 'active' | 'paused' | 'archived';
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  count: number;
  createdAt: string;
}

export interface Routine {
  id: string;
  templateId: string;
  title: string;
  description: string;
  checklist: RoutineCheckItem[];
  estimatedDuration: string;
  weekdays: number[];
  time: string;
  status: 'active' | 'paused' | 'archived';
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineCheckItem {
  id: string;
  text: string;
  done: boolean;
}

export interface RoutineTemplate {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'fixed' | 'flexible' | 'recurring' | 'deadline' | 'event';
  recurrence: string;
  domain: string;
  linkedGoalId: string;
  linkedTaskId: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  type: string;
  content: string;
  tags: string[];
  domain: string;
  status: 'inbox' | 'processed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  type: string;
  category: string;
  source: string;
  summary: string;
  keyTakeaways: string;
  tags: string[];
  status: 'to-explore' | 'in-progress' | 'completed' | 'archived';
  linkedGoalId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Idea {
  id: string;
  title: string;
  category: string;
  description: string;
  whyItMatters: string;
  estimatedUpside: string;
  estimatedDifficulty: string;
  nextAction: string;
  domain: string;
  tags: string[];
  status: 'parked' | 'evaluating' | 'active' | 'rejected' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Trade {
  id: string;
  date: string;
  instrument: string;
  setup: string;
  thesis: string;
  entry: string;
  stop: string;
  target: string;
  result: string;
  emotionalState: string;
  ruleFollowingScore: number;
  lessonLearned: string;
  imageData: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FinancialRoadmapData {
  id: string;
  vision: string;
  currentBaseline: string;
  monthlyBaselineCost: string;
  comfortTarget: string;
  independenceTarget: string;
  incomeStreams: string;
  savingsTargets: string;
  capitalTargets: string;
  currentFocus: string;
  nextMilestones: string;
  targetIncomeSources: string;
  notes: string;
  updatedAt: string;
}

export interface WeeklyReview {
  id: string;
  weekStart: string;
  templateId: string;
  responses: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface PhoneRule {
  id: string;
  mode: string;
  rule: string;
  enabled: boolean;
  order: number;
  createdAt: string;
}

export interface PhoneLog {
  id: string;
  date: string;
  type: 'breach' | 'reflection';
  content: string;
  createdAt: string;
}

export interface Domain {
  id: string;
  name: string;
  order: number;
  archived: boolean;
}

export interface TaskList {
  id: string;
  name: string;
  order: number;
  archived: boolean;
}

export interface ReviewTemplate {
  id: string;
  name: string;
  prompts: string[];
  archived: boolean;
}

export interface DashboardWidget {
  id: string;
  type: string;
  visible: boolean;
  order: number;
  collapsed: boolean;
}

export interface AppSettings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  sidebarModules: { id: string; label: string; visible: boolean; order: number }[];
  noteTypes: string[];
}

export const DEFAULT_DOMAINS: string[] = [
  'Health', 'University', 'Wealth Building', 'Trading / Investing',
  'Business', 'Knowledge', 'Relationships', 'Social / Network', 'Discipline'
];

export const DEFAULT_TASK_LISTS: string[] = [
  'Today', 'This Week', 'University', 'Wealth / Business',
  'Trading', 'Health', 'Social / Admin', 'Someday / Later'
];

export const DEFAULT_NOTE_TYPES: string[] = [
  'Task', 'Idea', 'Insight', 'Journal', 'Quote / Phrase',
  'Research note', 'Lesson', 'Networking thought', 'Random thought'
];

export const DEFAULT_KNOWLEDGE_CATEGORIES: string[] = [
  'Books', 'Podcasts', 'Articles', 'Courses', 'Finance / Macro',
  'Business', 'Psychology', 'Health', 'Communication / Rhetoric',
  'History / General Knowledge', 'Quotes / Frameworks'
];

export const DEFAULT_REVIEW_PROMPTS: string[] = [
  'What moved me forward this week?',
  'What wasted time?',
  'Which rules did I break?',
  'What distracted me most?',
  'What did I avoid?',
  'What should I cut next week?',
  'What are next week\'s top 3 outcomes?',
  'Reflection on phone usage',
  'General notes'
];
