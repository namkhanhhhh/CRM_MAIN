import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  GitBranch,
  TrendingUp,
  UserCog,
  Calendar,
  Bell,
  MessageSquare,
  Settings,
  ChevronDown,
  ChevronRight,
  User,
  Receipt,
  Globe2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  badge?: number;
  children?: { label: string; path: string }[];
}

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    children: [
      { label: "Overview", path: "/dashboard" },
      { label: "Freelancer Management", path: "/dashboard/candidate-management" },
    ],
  },
  {
    icon: Users,
    label: "Candidates",
    children: [
      { label: "My Candidates", path: "/candidates/my" },
      { label: "Candidate Database", path: "/candidates/database" },
    ],
  },
  {
    icon: Building2,
    label: "Clients",
    children: [
      { label: "Clients & Companies", path: "/clients" },
      { label: "HR Contacts", path: "/clients/hr-contacts" },
    ],
  },
  {
    icon: TrendingUp,
    label: "BD CRM",
    children: [
      { label: "Customer List", path: "/bd-crm/customers" },
      { label: "Schedule Management", path: "/bd-crm/schedule" },
      { label: "CRM Statistic", path: "/bd-crm/stats" },
    ],
  },
  {
    icon: Briefcase,
    label: "Jobs",
    children: [
      { label: "Open Jobs", path: "/jobs/open" },
      { label: "Admin Jobs", path: "/jobs/admin" },
    ],
  },
  { icon: GitBranch, label: "Processes", path: "/processes" },
  {
    icon: Receipt,
    label: "Sales",
    children: [
      { label: "Dữ liệu chung", path: "/sales/data" },
      { label: "Công nợ", path: "/sales/debt" },
      { label: "Dashboard doanh thu", path: "/sales/dashboard" },
      { label: "Hoa hồng", path: "/sales/commissions" },
    ],
  },
  {
    icon: UserCog,
    label: "Users",
    children: [{ label: "User List", path: "/users" }],
  },
  {
    icon: Globe2,
    label: "Trang cá nhân",
    children: [
      { label: "Quản lý trang", path: "/headhunter/profile" },
      { label: "Quản lý Jobs", path: "/headhunter/jobs" },
    ],
  },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: Bell, label: "Notifications", path: "/notifications", badge: 3 },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
];

const otherItems: MenuItem[] = [
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["BD CRM", "Dashboard"]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]));
  };

  const isActive = (path?: string, children?: { path: string }[]) => {
    if (path) return location.pathname === path;
    if (children) return children.some((child) => location.pathname.startsWith(child.path));
    return false;
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const active = isActive(item.path, item.children);
    const expanded = expandedItems.includes(item.label);

    if (item.children) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpand(item.label)}
            className={cn("sidebar-item w-full", active ? "sidebar-item-active" : "sidebar-item-inactive")}
          >
            <Icon className="h-5 w-5" />
            <span className="flex-1 text-left">{item.label}</span>
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {expanded && (
            <div className="ml-8 mt-1 space-y-1 animate-fade-in">
              {item.children.map((child) => (
                <Link
                  key={child.path}
                  to={child.path}
                  className={cn(
                    "sidebar-item",
                    location.pathname === child.path ? "sidebar-item-active" : "sidebar-item-inactive",
                  )}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        to={item.path!}
        className={cn("sidebar-item", active ? "sidebar-item-active" : "sidebar-item-inactive")}
      >
        <Icon className="h-5 w-5" />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            A
          </div>
          <span className="text-xl font-bold text-foreground">APEX</span>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Menu</div>
          <div className="space-y-1">{menuItems.map(renderMenuItem)}</div>

          <div className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Others
          </div>
          <div className="space-y-1">{otherItems.map(renderMenuItem)}</div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="text-sm font-semibold text-foreground">TD Consulting</div>
          <div className="text-xs text-muted-foreground">Đối tác tuyển dụng tin cậy của bạn</div>
        </div>
      </div>
    </aside>
  );
}
