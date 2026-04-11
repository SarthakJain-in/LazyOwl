import { Suspense, useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Map, Focus, BookOpen, LogOut } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import PageLoader from "../components/PageLoader";
import { useAppStore } from "../store/useAppStore";

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Roadmaps", path: "/dashboard/roadmaps", icon: Map },
    { name: "Focus", path: "/dashboard/focus", icon: Focus },
    { name: "Knowledge", path: "/dashboard/knowledge", icon: BookOpen },
  ];

  const NavLinks = ({ isMobile }) => (
    <>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const activeClass = isActive
          ? "text-forge-textPrimary bg-forge-surface font-bold shadow-sm border border-forge-border/50"
          : "text-forge-textSecondary hover:text-forge-textPrimary hover:bg-forge-bg/50 border border-transparent";

        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center p-3 rounded-xl transition-all ${
              isMobile ? "flex-col justify-center flex-1" : "gap-4 mb-1"
            } ${activeClass}`}
          >
            <item.icon
              size={isMobile ? 20 : 20}
              className={
                isActive ? "text-forge-textPrimary" : "text-forge-textSecondary"
              }
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
    <div
      className="flex h-screen overflow-hidden p-0 md:p-4 md:gap-4 transition-colors duration-500"
      style={{
        background:
          "linear-gradient(to bottom right, var(--layout-bg-start), var(--layout-bg-end))",
      }}
    >
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-transparent gap-5 shrink-0">
        <div className="px-3 pt-2 pb-1 flex items-center justify-between">
          <span
            className="font-black text-3xl tracking-tighter transition-colors duration-500"
            style={{
              color: "var(--brand-title-color)",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            LazyOwl.
          </span>
          <ThemeToggle />
        </div>

        {/* Greeting Component */}
        {user && (
          <div className="bg-forge-bg rounded-2xl p-6 border border-forge-border shadow-brand">
            <div className="text-[11px] text-forge-textSecondary font-bold uppercase tracking-widest mb-3 mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </div>
            <h2 className="text-[28px] font-bold text-forge-textPrimary leading-[1.15] tracking-tight">
              Welcome back,
              <br />
              {user.name?.split(" ")[0]}!
            </h2>
          </div>
        )}

        {/* Navigation Links Component */}
        <div className="bg-forge-bg rounded-2xl p-3 border border-forge-border shadow-brand flex-1 overflow-y-auto">
          <nav className="flex flex-col gap-1">
            <NavLinks isMobile={false} />
          </nav>
        </div>

        {/* Logout User Component */}
        <button
          onClick={handleLogout}
          className="relative w-full rounded-2xl p-4 overflow-hidden border border-forge-border/50 shadow-brand group text-left hover:border-forge-accent/40 transition-all shrink-0 bg-forge-bg"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent dark:from-blue-600/20 transition-opacity group-hover:opacity-80"></div>
          <div className="relative flex items-center gap-3 z-10 text-forge-textPrimary">
            <div className="p-2 bg-forge-bg rounded-lg shadow-sm border border-forge-border/50 group-hover:scale-110 transition-transform">
              <LogOut size={16} className="text-forge-textPrimary" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-sm">Logout Session</div>
              <div className="text-[11px] text-forge-textSecondary mt-0.5">
                See you next time
              </div>
            </div>
          </div>
        </button>
      </aside>

      <main className="flex-1 bg-forge-bg md:border border-forge-border md:rounded-xl md:shadow-brand overflow-y-auto pb-20 md:pb-0 relative">
        <div className="relative w-full min-h-full p-4 md:p-8 flex flex-col">
          <Suspense key={location.pathname} fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-forge-surface border-t border-forge-border flex px-2 py-2 pb-safe z-50 shadow-lg">
        <NavLinks isMobile={true} />
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 p-3 rounded-xl text-forge-textSecondary hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-[10px] mt-1 font-medium">Logout</span>
        </button>
      </nav>
    </div>
  );
}
