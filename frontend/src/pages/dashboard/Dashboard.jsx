import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useData } from "@/context/DataContext";
import { VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS, VEHICLE_TYPES, REGIONS } from "@/utils/constants";
import { formatDate } from "@/lib/utils";
import { RouteIcon, Truck, Activity, Users, Gauge, PackageCheck, Clock3, TrendingUp, ArrowUpRight, Play, Pause, RotateCcw, ShieldAlert, Award } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const TREND_DAYS = 14;

const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=128&h=128&fit=crop", 
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=128&h=128&fit=crop", 
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=128&h=128&fit=crop", 
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=128&h=128&fit=crop",
];

function buildTripTrend(trips) {
  const days = Array.from({ length: TREND_DAYS }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (TREND_DAYS - 1 - i));
    return d;
  });

  return days.map((d) => {
    const dayKey = d.toISOString().slice(0, 10);
    const dayTrips = trips.filter((t) => t.createdAt?.slice(0, 10) === dayKey);
    return {
      label: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      trips: dayTrips.length,
      completed: dayTrips.filter((t) => t.status === TRIP_STATUS.COMPLETED).length,
    };
  });
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-800">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-slate-500 mt-0.5">
          {p.name}: <span className="font-semibold text-slate-900">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function Kpi({ label, value, isHighlight = false, subtext = "Increased from last week" }) {
  if (isHighlight) {
    return (
      <div className="relative flex flex-col justify-between bg-slate-900 text-white rounded-2xl p-4.5 pl-6 pt-5 shadow-sm border border-slate-900/20 min-h-[125px] overflow-hidden group hover:shadow-md transition-all">
        {/* Background visual curve */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/5 pointer-events-none group-hover:scale-110 transition-transform" />
        
        <div>
          <span className="text-[10px] font-bold text-white/90 block uppercase tracking-wider">{label}</span>
          <span className="text-4xl font-bold mt-1.5 block tracking-tight">{value}</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between relative z-10">
          <span className="bg-slate-700 text-slate-200 px-2 py-0.5 rounded-full text-[9px] font-medium leading-none">
            {subtext}
          </span>
          <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center text-white">
            <ArrowUpRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col justify-between bg-white border border-slate-100 rounded-2xl p-4.5 pl-5 pt-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] min-h-[125px] hover:shadow-md transition-all">
      <div>
        <span className="text-[10px] font-bold text-slate-700 block uppercase tracking-wider">{label}</span>
        <span className="text-4xl font-bold text-slate-800 mt-1.5 block tracking-tight">{value}</span>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-[9px] font-medium text-slate-700 leading-none">
          {subtext}
        </span>
        <div className="w-5 h-5 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all cursor-pointer">
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { vehicles, drivers, trips, loading } = useData();
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [region, setRegion] = useState("all");

  // Running Time Tracker Stopwatch State
  const [isTimeRunning, setIsTimeRunning] = useState(true);
  const [seconds, setSeconds] = useState(5048); // start at 01:24:08

  useEffect(() => {
    let interval = null;
    if (isTimeRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimeRunning]);

  const formatStopwatch = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, "0");
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const filteredVehicles = useMemo(
    () =>
      vehicles.filter(
        (v) => (type === "all" || v.type === type) && (status === "all" || v.status === status) && (region === "all" || v.region === region)
      ),
    [vehicles, type, status, region]
  );

  const kpis = useMemo(() => {
    const active = filteredVehicles.filter((v) => v.status !== VEHICLE_STATUS.RETIRED).length;
    const available = filteredVehicles.filter((v) => v.status === VEHICLE_STATUS.AVAILABLE).length;
    const inShop = filteredVehicles.filter((v) => v.status === VEHICLE_STATUS.IN_SHOP).length;
    const activeTrips = trips.filter((t) => t.status === TRIP_STATUS.DISPATCHED).length;
    const pendingTrips = trips.filter((t) => t.status === TRIP_STATUS.DRAFT).length;
    const onDuty = drivers.filter((d) => d.status !== DRIVER_STATUS.OFF_DUTY && d.status !== DRIVER_STATUS.SUSPENDED).length;
    const utilization = filteredVehicles.length
      ? Math.round((filteredVehicles.filter((v) => v.status === VEHICLE_STATUS.ON_TRIP).length / filteredVehicles.length) * 100)
      : 0;
    return { active, available, inShop, activeTrips, pendingTrips, onDuty, utilization };
  }, [filteredVehicles, trips, drivers]);

  const statusCounts = useMemo(() => {
    return Object.values(VEHICLE_STATUS).map((s) => ({
      status: s,
      count: filteredVehicles.filter((v) => v.status === s).length,
    }));
  }, [filteredVehicles]);

  const recentTrips = trips.slice(0, 5);
  const trend = useMemo(() => buildTripTrend(trips), [trips]);
  const trendPrevHalf = trend.slice(0, 7).reduce((s, d) => s + d.trips, 0);
  const trendRecentHalf = trend.slice(7).reduce((s, d) => s + d.trips, 0);
  const trendChangePct = trendPrevHalf > 0 ? Math.round(((trendRecentHalf - trendPrevHalf) / trendPrevHalf) * 100) : trendRecentHalf > 0 ? 100 : 0;
  const expiringLicenses = drivers.filter((d) => {
    if (!d.licenseExpiry) return false;
    const days = (new Date(d.licenseExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days < 45;
  });

  return (
    <div className="space-y-6">
      {/* Dynamic Styled Header */}
      <PageHeader
        title="Dashboard"
        description="Real-time snapshot of fleet health, dispatch activity, and utilization."
        actions={
          <div className="flex flex-wrap gap-2">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-9 w-32 rounded-xl text-xs bg-white border-slate-100 hover:bg-slate-50 transition-colors shadow-sm">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100">
                <SelectItem value="all">All types</SelectItem>
                {VEHICLE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-32 rounded-xl text-xs bg-white border-slate-100 hover:bg-slate-50 transition-colors shadow-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100">
                <SelectItem value="all">All statuses</SelectItem>
                {Object.values(VEHICLE_STATUS).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="h-9 w-32 rounded-xl text-xs bg-white border-slate-100 hover:bg-slate-50 transition-colors shadow-sm">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100">
                <SelectItem value="all">All regions</SelectItem>
                {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        <Kpi label="Active Vehicles" value={kpis.active} isHighlight={true} subtext="Increased from last month" />
        <Kpi label="Available Vehicles" value={kpis.available} subtext="Ready to dispatch" />
        <Kpi label="In Maintenance" value={kpis.inShop} subtext="Active service tickets" />
        <Kpi label="Active Trips" value={kpis.activeTrips} subtext="Vehicles on route" />
        <Kpi label="Pending Trips" value={kpis.pendingTrips} subtext="Trips in dispatch queue" />
        <Kpi label="Drivers On Duty" value={kpis.onDuty} subtext="Active driver roster" />
        <Kpi label="Fleet Utilization" value={`${kpis.utilization}%`} subtext="Average utilization index" />
      </div>

      {/* Main Grid Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Chart, Team, Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Card */}
          <Card className="rounded-2xl border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] bg-white overflow-hidden">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-slate-800 text-base font-bold">Trip activity — last {TREND_DAYS} days</CardTitle>
                <CardDescription className="text-slate-400 text-xs">Trips created vs. completed, tracked daily.</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-100 px-3 py-1 text-xs font-semibold">
                <TrendingUp className={"h-3.5 w-3.5 " + (trendChangePct >= 0 ? "text-slate-800" : "text-destructive")} />
                <span className={trendChangePct >= 0 ? "text-slate-800" : "text-destructive"}>
                  {trendChangePct >= 0 ? "+" : ""}{trendChangePct}%
                </span>
                <span className="text-slate-400 font-light">vs. previous week</span>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tripsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0F172A" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#0F172A" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6B7280" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6B7280" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="trips" name="Trips created" stroke="#0F172A" strokeWidth={2} fill="url(#tripsGradient)" />
                    <Area type="monotone" dataKey="completed" name="Completed" stroke="#6B7280" strokeWidth={2} fill="url(#completedGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sub Grid: Team Collaboration & Project Progress */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Team Collaboration Card (Drivers on Duty) */}
            <Card className="rounded-2xl border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] bg-white overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-800 text-base font-bold">Team Collaboration</CardTitle>
                <CardDescription className="text-slate-400 text-xs">Active drivers on duty and their statuses.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {loading && <p className="text-xs text-slate-400">Loading drivers…</p>}
                {!loading && drivers.length === 0 && (
                  <EmptyState icon={Users} title="No drivers" description="Add drivers to see duty roster." />
                )}
                {drivers.slice(0, 4).map((driver, idx) => {
                  const avatarUrl = AVATARS[idx % AVATARS.length];
                  return (
                    <div key={driver.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 text-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={avatarUrl}
                          alt={driver.name}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-slate-100"
                        />
                        <div className="overflow-hidden">
                          <p className="font-semibold text-slate-800 truncate leading-snug">{driver.name}</p>
                          <p className="text-[10px] text-slate-400 font-light truncate leading-none mt-1">
                            {driver.role || "Dispatcher"} · Lic: {driver.licenseNumber}
                          </p>
                        </div>
                      </div>
                      <span className="flex-shrink-0">
                        <StatusBadge status={driver.status} />
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Project Progress Card (Fleet Utilization Circular Progress) */}
            <Card className="rounded-2xl border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] bg-white overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-800 text-base font-bold">Project Progress</CardTitle>
                <CardDescription className="text-slate-400 text-xs">Real-time active fleet load distribution.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-between">
                {/* SVG Semi-Donut Progress Chart */}
                <div className="relative flex flex-col items-center justify-center py-1 mt-2">
                  <svg className="w-44 h-26" viewBox="0 0 100 60">
                    <path 
                      d="M 10 50 A 40 40 0 0 1 90 50" 
                      fill="none" 
                      stroke="#F1F3F5" 
                      strokeWidth="11" 
                      strokeLinecap="round" 
                    />
                    <path 
                      d="M 10 50 A 40 40 0 0 1 90 50" 
                      fill="none" 
                      stroke="#0F172A" 
                      strokeWidth="11" 
                      strokeLinecap="round" 
                      strokeDasharray="125.6" 
                      strokeDashoffset={125.6 - (125.6 * kpis.utilization) / 100}
                    />
                  </svg>
                  <div className="absolute top-[38px] text-center">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{kpis.utilization}%</span>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Active Fleet</p>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex gap-4 w-full justify-center text-[10px] font-semibold text-slate-500 mt-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-900" /> Active
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" /> Standby
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Side: Compliance Reminders, Projects (Recent Trips) & Time Tracker */}
        <div className="space-y-6">
          {/* Reminders/Alerts Card (Donezo styling) */}
          <Card className="rounded-2xl border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] bg-white overflow-hidden p-5 flex flex-col justify-between min-h-[175px]">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Compliance Reminders</span>
              {expiringLicenses.length > 0 ? (
                <div className="mt-3 space-y-1">
                  <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-destructive" />
                    Licenses Expiring Soon
                  </h3>
                  <p className="text-xs font-light text-slate-500 leading-relaxed">
                    {expiringLicenses.length} driver license(s) expire within 45 days. Review credentials now to prevent compliance flags.
                  </p>
                </div>
              ) : (
                <div className="mt-3 space-y-1">
                  <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-slate-700" />
                    All Drivers Compliant
                  </h3>
                  <p className="text-xs font-light text-slate-500 leading-relaxed">
                    All currently dispatched drivers have valid, active commercial driver licenses (CDL).
                  </p>
                </div>
              )}
            </div>

            <Link
              to="/drivers"
              className="mt-4 w-full bg-slate-900 text-white hover:bg-black font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              Verify Drivers
            </Link>
          </Card>

          {/* Project List (Recent Trips) */}
          <Card className="rounded-2xl border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] bg-white overflow-hidden">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-slate-800 text-base font-bold">Recent Trips</CardTitle>
                <CardDescription className="text-slate-400 text-xs">Recently created transport routes.</CardDescription>
              </div>
              <Link to="/trips" className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline">View all</Link>
            </CardHeader>
            <CardContent className="space-y-1">
              {loading && <p className="text-xs text-slate-400">Loading trips…</p>}
              {!loading && recentTrips.length === 0 && (
                <EmptyState icon={RouteIcon} title="No trips yet" description="Create your first trip from the Trips page." />
              )}
              {recentTrips.map((trip, idx) => {
                const colors = [
                  { bg: "bg-slate-100 text-slate-700" },
                  { bg: "bg-zinc-100 text-zinc-700" },
                  { bg: "bg-neutral-100 text-neutral-700" },
                  { bg: "bg-gray-200 text-gray-700" },
                  { bg: "bg-stone-200 text-stone-700" },
                ];
                const theme = colors[idx % colors.length];
                return (
                  <div key={trip.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0 text-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${theme.bg}`}>
                        <RouteIcon className="w-4.5 h-4.5" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-slate-800 truncate leading-snug">{trip.source} → {trip.destination}</p>
                        <p className="text-[10px] text-slate-400 font-light truncate leading-none mt-1">
                          Cargo: {trip.cargoKg}kg · {trip.plannedKm}km · {formatDate(trip.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className="flex-shrink-0">
                      <StatusBadge status={trip.status} />
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Time Tracker Card (Stopwatch) */}
          <div className="relative bg-gradient-to-br from-slate-900 to-black text-white rounded-2xl p-5 shadow-sm overflow-hidden h-[180px] flex flex-col justify-between group hover:shadow-md transition-all">
            {/* Wavy background shapes */}
            <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,50 Q25,25 50,50 T100,50" fill="none" stroke="white" strokeWidth="2" />
                <path d="M0,60 Q25,45 50,60 T100,60" fill="none" stroke="white" strokeWidth="2" />
              </svg>
            </div>

            <div className="relative z-10">
              <span className="text-[10px] font-bold text-white/70 block uppercase tracking-wider">Active Operation Tracker</span>
              <p className="font-mono text-4xl font-extrabold tracking-widest my-3 text-center">
                {formatStopwatch(seconds)}
              </p>
            </div>

            <div className="flex justify-center gap-4 relative z-10">
              <button
                type="button"
                onClick={() => setIsTimeRunning(!isTimeRunning)}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-white transition-all focus:outline-none"
              >
                {isTimeRunning ? <Pause className="w-4 h-4 fill-white text-white" /> : <Play className="w-4 h-4 fill-white text-white ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={() => setSeconds(0)}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center text-white transition-all focus:outline-none"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
