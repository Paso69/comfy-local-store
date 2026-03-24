import { getAllItems, putItem } from './db';
import type { Goal, Task, Habit, Routine, RoutineTemplate, WeeklyReview, FinancialRoadmapData, Domain, TaskList, ReviewTemplate, DashboardWidget, PhoneRule } from './types';
import { DEFAULT_DOMAINS, DEFAULT_TASK_LISTS, DEFAULT_REVIEW_PROMPTS } from './types';

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

export async function seedIfEmpty() {
  const existing = await getAllItems('goals');
  if (existing.length > 0) return;

  // Domains
  for (let i = 0; i < DEFAULT_DOMAINS.length; i++) {
    await putItem('domains', { id: uid(), name: DEFAULT_DOMAINS[i], order: i, archived: false } as Domain);
  }

  // Task Lists
  for (let i = 0; i < DEFAULT_TASK_LISTS.length; i++) {
    await putItem('taskLists', { id: uid(), name: DEFAULT_TASK_LISTS[i], order: i, archived: false } as TaskList);
  }

  // Review Templates
  await putItem('reviewTemplates', {
    id: uid(), name: 'Standard Week', prompts: DEFAULT_REVIEW_PROMPTS, archived: false
  } as ReviewTemplate);
  await putItem('reviewTemplates', {
    id: uid(), name: 'Exam Week', prompts: [...DEFAULT_REVIEW_PROMPTS.slice(0, 6), 'How did exam prep go?', 'What topics need more work?', 'General notes'], archived: false
  } as ReviewTemplate);

  // Routine Templates
  const defaultTplId = uid();
  await putItem('routineTemplates', { id: defaultTplId, title: 'Default Week', description: 'Standard weekday routine', createdAt: now() } as RoutineTemplate);

  // Sample Goals
  await putItem('goals', {
    id: uid(), title: 'Build consistent deep work practice', description: 'Establish 2+ hours of focused deep work daily', domain: 'Discipline',
    priorityLevel: 'primary', horizon: '6 months', target: '2 hours daily', currentProgress: 30, status: 'active', notes: '', reviewDate: '', createdAt: now(), updatedAt: now()
  } as Goal);
  await putItem('goals', {
    id: uid(), title: 'Achieve financial baseline', description: 'Cover monthly expenses through own income', domain: 'Wealth Building',
    priorityLevel: 'primary', horizon: '12 months', target: '€2000/month', currentProgress: 15, status: 'active', notes: '', reviewDate: '', createdAt: now(), updatedAt: now()
  } as Goal);

  // Sample Tasks
  const taskLists = await getAllItems<TaskList>('taskLists');
  const todayList = taskLists.find(l => l.name === 'Today');
  await putItem('tasks', {
    id: uid(), title: 'Complete chapter 5 reading', description: '', domain: 'University', linkedGoalId: '', priority: 'high',
    dueDate: new Date().toISOString().split('T')[0], recurrence: '', estimatedEffort: '90 min', status: 'not-started',
    tags: [], notes: '', listId: todayList?.id || '', order: 0, createdAt: now(), updatedAt: now()
  } as Task);

  // Sample Habits
  const defaultHabits = [
    'Sleep target met', 'First deep work block completed', 'Training completed',
    'Reading completed', 'Study / course progress logged', 'Trade or business documentation completed', 'Weekly review completed'
  ];
  for (let i = 0; i < defaultHabits.length; i++) {
    await putItem('habits', {
      id: uid(), title: defaultHabits[i], description: '', domain: 'Discipline',
      frequency: i === 6 ? 'weekly' : 'daily', targetCount: 1, unit: 'times',
      status: 'active', order: i, createdAt: now(), updatedAt: now()
    } as Habit);
  }

  // Sample Routines
  await putItem('routines', {
    id: uid(), templateId: defaultTplId, title: 'Morning Setup', description: 'Start the day right',
    checklist: [
      { id: uid(), text: 'Make bed', done: false },
      { id: uid(), text: 'Cold water', done: false },
      { id: uid(), text: 'Review daily plan', done: false },
    ],
    estimatedDuration: '30 min', weekdays: [1, 2, 3, 4, 5], time: '06:30', status: 'active', order: 0, createdAt: now(), updatedAt: now()
  } as Routine);

  // Financial Roadmap
  await putItem('financialRoadmap', {
    id: 'main', vision: 'Financial independence by 30 — location-free income, no dependency on employment.',
    currentBaseline: '', monthlyBaselineCost: '€1200', comfortTarget: '€3000/month',
    independenceTarget: '€5000/month passive', incomeStreams: '', savingsTargets: '',
    capitalTargets: '', currentFocus: 'Build first income stream while studying',
    nextMilestones: '', targetIncomeSources: '', notes: '', updatedAt: now()
  } as FinancialRoadmapData);

  // Phone Rules
  const defaultRules = [
    { mode: 'Work Mode', rule: 'No social media before first deep work block' },
    { mode: 'Work Mode', rule: 'No phone on desk during deep work' },
    { mode: 'Social Mode', rule: 'Social media only in set windows' },
    { mode: 'Trading Mode', rule: 'Trading checks only in defined windows' },
    { mode: 'Work Mode', rule: 'No phone in bed' },
  ];
  for (let i = 0; i < defaultRules.length; i++) {
    await putItem('phoneRules', {
      id: uid(), mode: defaultRules[i].mode, rule: defaultRules[i].rule,
      enabled: true, order: i, createdAt: now()
    } as PhoneRule);
  }

  // Dashboard widgets
  const widgetTypes = ['priorities', 'todayTasks', 'weeklyProgress', 'habitSnapshot', 'quickCapture', 'reviewReminder', 'upcomingSchedule'];
  for (let i = 0; i < widgetTypes.length; i++) {
    await putItem('dashboardWidgets', {
      id: uid(), type: widgetTypes[i], visible: true, order: i, collapsed: false
    } as DashboardWidget);
  }
}
