import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";

export default function CRMLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — hidden on mobile, shown on md+ */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-3.5 h-3.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-900">CRM Inteligente</span>
        </div>

        <div className="px-6 py-6 pb-24 md:pb-6 max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom navigation — mobile only */}
      <BottomNav />
    </div>
  );
}
