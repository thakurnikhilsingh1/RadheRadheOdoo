import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#090A0F] px-4 py-8 overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute -top-48 -left-48 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-slate-400/20 to-transparent blur-[130px] pointer-events-none select-none" />
      <div className="absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-gray-500/20 to-transparent blur-[130px] pointer-events-none select-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-zinc-500/10 blur-[150px] pointer-events-none select-none" />

      {/* Main Container Card */}
      <div className="relative flex w-full max-w-[1080px] min-h-[640px] lg:h-[720px] flex-col lg:flex-row bg-white rounded-[32px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.65)] z-10">

        {/* Left Side: Creative Panel (Exact design matching) */}
        <div className="hidden lg:flex w-[48%] p-3 h-full select-none">
          <div className="relative flex h-full w-full flex-col justify-between rounded-[24px] overflow-hidden bg-black p-12 text-white border border-white/10">

            {/* Background Video */}


            <iframe
              src="https://player.mux.com/V2th1mKJasnMrRhBBH2EvGzRyhi00zJSQEUgQ1uAfHuE?autoplay=muted&loop=true&muted=true&controls=false"
              className="absolute inset-0 h-full w-full border-none pointer-events-none select-none scale-[1.3] object-cover"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Auth Background Video"
            ></iframe>
            {/* Overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/70 z-10" />

            {/* Top Content */}
            <div className="relative z-20 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white/80">
              <span className="shrink-0">A wise quote</span>
              <div className="h-[1px] w-full bg-white/20" />
            </div>

            {/* Bottom Content */}
            <div className="relative z-20">
              <h2 className="font-serif text-5xl font-normal leading-[1.12] text-white tracking-wide">
                Get<br />Everything<br />You Want
              </h2>
              <p className="mt-5 text-[13px] font-light text-white/75 leading-relaxed max-w-[280px]">
                You can get everything you want if you work hard, trust the process, and stick to the plan.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Dynamic Form Panel */}
        <div className="flex flex-1 flex-col justify-between bg-white p-6 sm:p-10 md:p-14 lg:p-10 xl:p-14 min-h-[550px] lg:min-h-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
