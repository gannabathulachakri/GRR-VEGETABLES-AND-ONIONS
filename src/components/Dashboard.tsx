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
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">{t("todaySummary")}</h2>
        <p className="text-slate-500">{new Date().toLocaleDateString(isTe ? 'te-IN' : 'en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 border-l-4 border-l-brand-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brand-100 rounded-xl text-brand-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="text-slate-500 font-medium">{t("totalSales")}</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(totalSales, i18n.language)}</h3>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              <Package size={18} />
            </div>
          </div>
          <p className="text-slate-500 font-medium">{t("totalKgs")}</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">
            {totalKgs.toLocaleString()} <span className="text-lg font-normal text-slate-400">{t("kgs")}</span>
          </h3>
        </div>
      </div>

      {/* Recent Transactions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock size={20} className="text-slate-400" />
            {t("recentTransactions")}
          </h3>
          <button className="text-brand-600 font-medium text-sm hover:underline">
            {t("viewAll")}
          </button>
        </div>

        <div className="space-y-3">
          {recentStocks.length === 0 ? (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <Plus size={32} />
              </div>
              <p className="text-slate-500">{t("noFarmersFound")}</p>
            </div>
          ) : (
            recentStocks.map((stock: any) => {
              const farmer = farmers.find((f: any) => f.id === stock.farmerId);
              const veg = VEGETABLES.find((v) => v.id === stock.vegetableId);

              return (
                <div key={stock.id} className="glass-card p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-xl font-bold text-brand-600 shadow-sm">
                      {veg?.emoji || (isTe ? veg?.nameTe.charAt(0) : veg?.nameEn.charAt(0))}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{farmer?.name || "Unknown"}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        {isTe ? veg?.nameTe : veg?.nameEn} • {new Date(stock.createdAt).toLocaleTimeString(isTe ? 'te-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-brand-700">{formatCurrency(calculateStockTotal(stock), i18n.language)}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{stock.totalKgs} {t("kgs")}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(t("confirmDelete") || "Delete?")) {
                          deleteStock(stock.id);
                        }
                      }}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                    <ChevronRight size={18} className="text-slate-300" />
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
