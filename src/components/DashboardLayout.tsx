import { type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  LayoutDashboard, FileSearch, Target, BookOpen, User, Settings, LogOut, Sun, Moon, ChevronLeft, ChevronRight, Sparkles, History
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", color: "text-primary" },
  { icon: FileSearch, label: "Resume Analyzer", path: "/analyze", color: "text-aqua" },
  { icon: Target, label: "Skill Gap", path: "/dashboard/skills", color: "text-muted-red" },
  { icon: BookOpen, label: "Learning Path", path: "/dashboard/learning", color: "text-accent" },
  { icon: History, label: "History", path: "/dashboard/history", color: "text-signal-yellow" },
  { icon: User, label: "Profile", path: "/dashboard/profile", color: "text-foreground" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings", color: "text-muted-foreground" },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`relative flex flex-col border-r border-border bg-card/80 backdrop-blur-sm transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Sidebar gradient accent */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />

        <div className="relative flex items-center justify-between p-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-heading text-base font-bold text-foreground">Skill Set Go</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="relative flex-1 space-y-1 px-2 py-4">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-primary/15 to-accent/10 text-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${active ? item.color : ""}`} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="relative space-y-1 border-t border-border p-2">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            {theme === "dark" ? <Sun className="h-5 w-5 shrink-0 text-primary" /> : <Moon className="h-5 w-5 shrink-0 text-primary" />}
            {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>
          <button
            onClick={() => { signOut(); navigate("/"); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-6 py-3">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {navItems.find((i) => i.path === location.pathname)?.label || "Skill Set Go"}
          </h2>
          <div className="flex items-center gap-3">
            <span className="font-body text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-heading text-sm font-bold shadow-lg shadow-primary/20">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
