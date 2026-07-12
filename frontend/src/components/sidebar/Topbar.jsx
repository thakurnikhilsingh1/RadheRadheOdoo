import { Search, LogOut, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Topbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex h-16 items-center gap-4 border-b border-slate-100 bg-white px-5 sm:px-7 shadow-[0_1px_4px_rgba(0,0,0,0.03)] rounded-lg">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative ml-0 w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search fleet, drivers, trips…"
            className="w-full h-8 rounded-xl border border-slate-100 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-700/30 transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">⌘F</span>
        </div>
      </div>

      {/* Right Side: Icons + User Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bells */}
        <button className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-slate-50 border border-transparent hover:border-slate-100 focus:outline-none transition-all">
            <Avatar className="h-8 w-8 ring-2 ring-slate-100">
              <AvatarFallback className="bg-slate-200 text-slate-800 text-xs font-bold">{initials(user?.name)}</AvatarFallback>
            </Avatar>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</p>
              <p className="text-[10px] leading-tight text-slate-400">{user?.email?.split('@')[0]}@mail.com</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-2xl border-slate-100 shadow-lg p-1.5">
            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1">{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem onSelect={() => navigate("/settings")} className="rounded-xl cursor-pointer text-xs font-medium px-3 py-2 focus:bg-slate-50 gap-2">
              <UserIcon className="h-4 w-4 text-slate-400" /> Profile & settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem onSelect={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-xl text-xs font-medium px-3 py-2 gap-2">
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
