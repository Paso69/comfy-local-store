import {
  LayoutDashboard, Target, CheckSquare, Flame, Clock, Calendar,
  Zap, BookOpen, Lightbulb, TrendingUp, DollarSign, FileText,
  Smartphone, Settings
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const modules = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Goals / Focus", url: "/goals", icon: Target },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Habits", url: "/habits", icon: Flame },
  { title: "Routine Builder", url: "/routines", icon: Clock },
  { title: "Schedule Planner", url: "/schedule", icon: Calendar },
  { title: "Quick Capture", url: "/notes", icon: Zap },
  { title: "Knowledge Vault", url: "/knowledge", icon: BookOpen },
  { title: "Idea Bank", url: "/ideas", icon: Lightbulb },
  { title: "Trading Journal", url: "/trading", icon: TrendingUp },
  { title: "Financial Roadmap", url: "/financial", icon: DollarSign },
  { title: "Weekly Review", url: "/review", icon: FileText },
  { title: "Phone Protocol", url: "/phone", icon: Smartphone },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {!collapsed && (
          <div className="px-4 py-4">
            <h1 className="text-lg font-bold tracking-tight text-foreground">Life OS</h1>
            <p className="text-xs text-muted-foreground">Command Center</p>
          </div>
        )}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {modules.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
