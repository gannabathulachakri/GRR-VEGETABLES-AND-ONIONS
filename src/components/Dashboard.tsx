import { useTranslation } from "react-i18next";
import { TrendingUp, Package, Clock, Plus, Trash2, ChevronRight } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { VEGETABLES } from "../types";

export default function Dashboard({ farmitre }: { farmitre: any }) {
  const { t, i18n } = useTranslation();
  const { stocks, farmers, calculateStockTotal, deleteStock } = farmitre;

  const totalSales = stocks.reduce((acc: number, s: any) => acc + calculateStockTotal(s), 0);
  const totalKgs = stocks.reduce((acc: number, s: any) => acc + s.totalKgs, 0);

  const recentStocks = [...stocks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const isTe = i18n.language === "te";

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="label-caps">{new Date().toLocaleDateString(isTe ? 'te-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{t("todaySummary")}</h2>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={() => farmitre.setActiveView?.("stock")}
            className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 active:scale-90 transition-transform lg:hidden"
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-8 flex flex-col justify-between min-h-[200px] group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div>
            <span className="label-caps text-primary">{t("totalSales")}</span>
            <h3 className="stats-value text-slate-900 dark:text-white">{formatCurrency(totalSales, i18n.language)}</h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-4">
            <TrendingUp size={14} className="text-primary" />
            <span>+12.5% from yesterday</span>
          </div>
        </div>

        <div className="premium-card p-8 flex flex-col justify-between min-h-[200px] group relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <div>
            <span className="label-caps text-accent">{t("totalKgs")}</span>
            <h3 className="stats-value text-slate-900 dark:text-white">
              {totalKgs.toLocaleString()} <span className="text-xl font-normal text-slate-400 font-sans ml-1">{t("kgs")}</span>
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-4">
            <Package size={14} className="text-accent" />
            <span>{stocks.length} batches recorded</span>
          </div>
        </div>

        <div className="premium-card p-8 bg-[#0A0A0A] dark:bg-primary border-none shadow-2xl flex flex-col justify-between min-h-[200px] group hover:scale-[1.02] transition-all cursor-pointer">
          <div className="flex flex-col">
            <span className="label-caps text-white/50">Quick Action</span>
            <h3 className="text-2xl font-black text-white leading-tight mt-1">Record New Stock Entry</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white">
              <Plus size={24} />
            </div>
            <ChevronRight size={20} className="text-white/30 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {t("recentTransactions")}
            </h3>
          </div>
          <button className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">
            {t("viewAll")}
          </button>
        </div>

        <div className="space-y-3">
          {recentStocks.length === 0 ? (
            <div className="premium-card p-20 flex flex-col items-center justify-center text-center space-y-4 border-dashed bg-transparent">
              <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300">
                <Plus size={32} />
              </div>
              <div className="max-w-xs">
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No activity yet</p>
                <p className="text-sm text-slate-400 mt-1">Start recording stock entries to see them here.</p>
              </div>
            </div>
          ) : (
            recentStocks.map((stock: any) => {
              const farmer = farmers.find((f: any) => f.id === stock.farmerId);
              const veg = VEGETABLES.find((v) => v.id === stock.vegetableId);

              return (
                <div key={stock.id} className="premium-card p-6 flex items-center justify-between premium-card-hover group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:scale-110">
                      {veg?.emoji || "📦"}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white leading-snug">{farmer?.name || "Record"}</h4>
                      <p className="text-sm text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                        <span className="text-slate-300">•</span>
                        {isTe ? veg?.nameTe : veg?.nameEn}
                        <span className="text-slate-300 text-[8px]">●</span>
                        {new Date(stock.createdAt).toLocaleTimeString(isTe ? 'te-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-black text-xl text-slate-900 dark:text-white tracking-tight">{formatCurrency(calculateStockTotal(stock), i18n.language)}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{stock.totalKgs} {t("kgs")}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(t("confirmDelete") || "Delete?")) {
                            deleteStock(stock.id);
                          }
                        }}
                        className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full transition-all md:opacity-0 md:group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                      <ChevronRight size={20} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
