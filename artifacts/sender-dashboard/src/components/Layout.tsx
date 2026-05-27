import { Link, useLocation } from "wouter";
import {
  Activity, Contact, LayoutDashboard, List, Send,
  Settings, Trophy, Menu, X, Maximize, Moon, Sun,
  Zap, BarChart2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, group: "main" },
  {
    href: "/fix-merah",
    label: "Fix Merah",
    icon: Zap,
    group: "fixmerah",
    highlight: true,
  },
  {
    href: "/fix-merah-dashboard",
    label: "Dashboard Fix Merah",
    icon: BarChart2,
    group: "fixmerah",
  },
  { href: "/senders", label: "Senders", icon: Send, group: "main" },
  { href: "/history", label: "History", icon: List, group: "main" },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, group: "main" },
  { href: "/settings", label: "Settings", icon: Settings, group: "main" },
  { href: "/status", label: "Status", icon: Activity, group: "main" },
  { href: "/contact", label: "Contact", icon: Contact, group: "main" },
];

function NavItem({
  item,
  isActive,
  onClick,
}: {
  item: (typeof navItems)[0];
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link href={item.href}>
      <div
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 cursor-pointer ${
          isActive
            ? item.highlight
              ? "bg-primary/15 text-primary border border-primary/40 shadow-[0_0_12px_rgba(255,0,51,0.2)]"
              : "bg-primary/10 text-primary border border-primary/20"
            : item.highlight
            ? "text-primary/70 hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
        }`}
      >
        <item.icon
          className={`w-5 h-5 shrink-0 ${
            isActive
              ? "text-primary drop-shadow-[0_0_8px_rgba(255,0,51,0.8)]"
              : item.highlight
              ? "text-primary/70"
              : ""
          }`}
        />
        <span className="font-medium text-sm">{item.label}</span>
        {item.highlight && !isActive && (
          <span className="ml-auto text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/30">
            HOT
          </span>
        )}
      </div>
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  const mainItems = navItems.filter((n) => n.group === "main");
  const fixMerahItems = navItems.filter((n) => n.group === "fixmerah");

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden selection:bg-primary selection:text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/50 glass-card">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/20 border border-primary flex items-center justify-center neon-border">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-wider neon-text text-primary">ADI FIX MERAH</h1>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {/* Fix Merah Section — prominently at top */}
          <div className="mb-3">
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest px-3 mb-1.5">
              Fix Merah
            </p>
            {fixMerahItems.map((item) => (
              <NavItem key={item.href} item={item} isActive={location === item.href} />
            ))}
          </div>

          <div className="border-t border-border/40 pt-3">
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-3 mb-1.5">
              Menu
            </p>
            {mainItems.map((item) => (
              <NavItem key={item.href} item={item} isActive={location === item.href} />
            ))}
          </div>
        </nav>
      </aside>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="w-64 bg-background border-r border-border relative z-50 flex flex-col glass-card">
            <div className="h-16 flex items-center justify-between px-6 border-b border-border">
              <span className="text-xl font-bold neon-text text-primary">ADI FIX MERAH</span>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
              <div className="mb-3">
                <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest px-3 mb-1.5">
                  Fix Merah
                </p>
                {fixMerahItems.map((item) => (
                  <NavItem
                    key={item.href}
                    item={item}
                    isActive={location === item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                ))}
              </div>
              <div className="border-t border-border/40 pt-3">
                <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest px-3 mb-1.5">
                  Menu
                </p>
                {mainItems.map((item) => (
                  <NavItem
                    key={item.href}
                    item={item}
                    isActive={location === item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                ))}
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

        <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-card/30 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="md:hidden flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold neon-text text-primary">ADI FIX MERAH</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-muted-foreground hover:text-primary"
            >
              <Maximize className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-muted-foreground hover:text-primary"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center neon-border">
              <span className="text-xs font-bold text-primary">AD</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 relative z-10">{children}</div>
      </main>
    </div>
  );
}
