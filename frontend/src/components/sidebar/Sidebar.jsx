import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route as RouteIcon,
  Wrench,
  Fuel,
  BarChart3,
  Settings as SettingsIcon,
  MoreVertical,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { ROLE_PERMISSIONS } from "@/utils/constants";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const NAV_GROUPS = [
  {
    title: "Dashboard",
    items: [
      { to: "/dashboard", label: "Overview", icon: LayoutDashboard, section: "dashboard" }
    ]
  },
  {
    title: "Fleet Operations",
    items: [
      { to: "/fleet", label: "Fleet", icon: Truck, section: "fleet", badgeKey: "vehicles" },
      { to: "/drivers", label: "Drivers", icon: Users, section: "drivers", badgeKey: "drivers" },
      { to: "/trips", label: "Trips", icon: RouteIcon, section: "trips", badgeKey: "trips" }
    ]
  },
  {
    title: "Maintenance & Reports",
    items: [
      { to: "/maintenance", label: "Maintenance", icon: Wrench, section: "maintenance", badgeKey: "maintenance" },
      { to: "/fuel-expenses", label: "Fuel & Expenses", icon: Fuel, section: "fuel" },
      { to: "/analytics", label: "Analytics", icon: BarChart3, section: "analytics" }
    ]
  }
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const data = useData();
  const allowed = ROLE_PERMISSIONS[user?.role] || [];

  // Helper to resolve badge counts dynamically
  const getBadgeCount = (key) => {
    if (!data) return null;
    if (key === "vehicles") return data.vehicles?.length || null;
    if (key === "drivers") return data.drivers?.length || null;
    if (key === "trips") {
      const active = data.trips?.filter(t => t.status === "dispatched" || t.status === "active") || [];
      return active.length || null;
    }
    if (key === "maintenance") {
      const open = data.maintenance?.filter(m => m.status === "open") || [];
      return open.length || null;
    }
    return null;
  };

  return (
    <aside className="hidden w-64 h-[97%] my-auto shrink-0 flex-col border border-slate-200 bg-white ml-3 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] md:flex font-sans">
      {/* Top Header: Traffic Lights */}
      <div className="flex gap-1.5 px-6 pt-5 pb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ED6A5E]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#F5BF4F]" />
        <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
      </div>

      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2.5 px-6 py-2 mb-4">
        <img src="/src/assets/images/logo.png" alt="Logo" className="w-12 h-12" />
        <span className="font-sans font-bold text-slate-900 text-[17px] tracking-tight">TransitOps</span>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-5 scrollbar-thin">
        {NAV_GROUPS.map((group) => {
          // Filter items based on user role permissions
          const visibleItems = group.items.filter((item) => allowed.includes(item.section));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400/90 tracking-widest px-3 py-1 block uppercase">
                {group.title}
              </span>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const badge = getBadgeCount(item.badgeKey);
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
                          isActive
                            ? "bg-slate-900/5 text-slate-900"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )
                      }
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4.5 w-4.5 stroke-[1.8] flex-shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {badge !== null && badge > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-900/10 px-1.5 text-[10px] font-bold text-slate-700">
                          {badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Settings Link */}
      {allowed.includes("settings") && (
        <div className="px-4 py-2">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-slate-900/5 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )
            }
          >
            <SettingsIcon className="h-4.5 w-4.5 stroke-[1.8] flex-shrink-0" />
            <span>Settings</span>
          </NavLink>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-slate-100 mx-4 my-2" />

      {/* Bottom Profile Section */}
      <div className="flex items-center justify-between px-5 py-4 bg-white rounded-b-[24px]">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=128&h=128&fit=crop"
            alt="Profile Avatar"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0"
          />
          <div className="text-left overflow-hidden min-w-0">
            <p className="text-xs font-semibold text-slate-800 leading-tight truncate">
              {user?.name || "Frankie Sullivan"}
            </p>
            <p className="text-[10px] font-light text-slate-500 leading-tight truncate">
              {user?.email || "frankie@untitledui.com"}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition-colors focus:outline-none flex-shrink-0">
            <MoreVertical className="h-4.5 w-4.5 stroke-[1.8]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-100 shadow-lg">
            <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 py-1">
              Account Options
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem onSelect={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-lg mx-1 my-1 px-3 py-2 text-xs font-semibold flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
