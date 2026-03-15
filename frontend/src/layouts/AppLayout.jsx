import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Map, Focus, BookOpen } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

export default function AppLayout() {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Roadmaps", path: "/roadmaps", icon: Map },
    { name: "Focus", path: "/focus", icon: Focus },
    { name: "Knowledge", path: "/knowledge", icon: BookOpen },
  ];

  const NavLinks = ({ isMobile }) => (
    <>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const activeClass = isActive
          ? "text-forge-accent bg-indigo-50"
          : "text-forge-textSecondary hover:bg-forge-surfaceHover";

        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center p-3 rounded-xl transition-colors ${
              isMobile ? "flex-col justify-center flex-1" : "gap-4 mb-2"
            } ${activeClass}`}
          >
            <item.icon
              size={isMobile ? 20 : 22}
              className={isActive ? "text-forge-accent" : ""}
            />
            <span
              className={
                isMobile ? "text-[10px] mt-1 font-medium" : "font-semibold"
              }
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-forge-bg">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-forge-surface border-r border-forge-border p-4">
        <div className="mb-10 mt-4 px-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-forge-textPrimary tracking-tight">
            LazyOwl.
          </h1>
          <ThemeToggle />
        </div>
        <nav className="flex-1">
          <NavLinks isMobile={false} />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto p-6 md:p-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-forge-surface border-t border-forge-border flex px-2 py-2 pb-safe z-50 shadow-lg">
        <NavLinks isMobile={true} />
      </nav>
    </div>
  );
}
