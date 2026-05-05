import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Share2, Trash2, Calendar, FileText, ChevronRight, ArrowUpDown, IndianRupee, ArrowUp, ArrowDown, Edit2, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { formatCurrency, cn } from "../lib/utils";
import { VEGETABLES, VegetableStock } from "../types";

type SortType = "date" | "amount";
type SortOrder = "asc" | "desc";

interface BillsProps {
  farmitre: any;
  onEditStock: (stock: VegetableStock) => void;
}

export default function Bills({ farmitre, onEditStock }: BillsProps) {
  const { t, i18n } = useTranslation();
  const { stocks, farmers, deleteStock, deleteStocks } = farmitre;
  const [sortType, setSortType] = useState<SortType>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteBatchId, setConfirmDeleteBatchId] = useState<string | null>(null);

  const groupedStocks = useMemo(() => {
    const groups: { [key: string]: VegetableStock[] } = {};
    
    stocks.forEach((stock: VegetableStock) => {
      // Use YYYY-MM-DD for stability across locales
      const dateKey = stock.date.substring(0, 10);
      const groupKey = `${stock.farmerId}_${dateKey}`;
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(stock);
    });

    return Object.values(groups).sort((a, b) => {
      const dateA = new Date(a[0].date).getTime();
      const dateB = new Date(b[0].date).getTime();
      return dateB - dateA;
    });
  }, [stocks]);

  const handleShare = (stockGroup: VegetableStock[]) => {
    if (stockGroup.length === 0) return;
    
    const stock = stockGroup[0];
    const farmer = farmers.find((f: any) => f.id === stock.farmerId);
    const isTe = i18n.language === "te";
    
    const indiaDate = new Date(stock.date).toLocaleDateString(isTe ? 'te-IN' : 'en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    let message = isTe ? `*గర్ర్ కూరగాయలు మరియు ఉల్లిపాయ*\n` : `*GRR VEGTABLES AND ONION*\n`;
    message += `———————————————\n\n`;
    message += `                  Date: ${indiaDate}\n`;

    let totalGross = 0;
    let totalExpenses = 0;

    stockGroup.forEach((item) => {
      const veg = VEGETABLES.find((v) => v.id === item.vegetableId);
      const vegName = isTe ? veg?.nameTe : veg?.nameEn;
      const bagsLabel = isTe ? "బస్తాలు" : "Bags";
      const totalKgsLabel = isTe ? "మొత్తం కిలోలు" : "Total KGs";
      const salesLabel = isTe ? "అమ్మకం వివరాలు" : "Sales Details";
      
      const salesTotal = item.pricingRows.reduce((acc: number, row: any) => acc + (row.kgs * row.price), 0);
      const commissionTotal = Math.round(salesTotal * 0.1);
      const importChargeTotal = item.importedBags * 15;
      const expensesTotal = item.expenses.reduce((acc: number, exp: any) => acc + exp.amount, 0) + commissionTotal + importChargeTotal;
      
      totalGross += salesTotal;
      totalExpenses += expensesTotal;

      if (isTe) {
        message += `${vegName} :        ${item.importedBags} ${bagsLabel}\n`;
        message += `${totalKgsLabel} :     ${item.totalKgs} kg\n\n`;
      } else {
        message += ` Total bags : ${item.importedBags} ${bagsLabel}\n`;
        message += `Total kg : ${item.totalKgs} kg\n\n`;
      }
      
      message += `${isTe ? "అమ్మకం వివరాలు" : "pricing details"} :\n`;
      
      // Group pricing by rate for summary
      const groupedPricingRows = item.pricingRows.reduce((acc: { price: number; kgs: number }[], row: any) => {
        if (row.kgs <= 0 || row.price <= 0) return acc;
        const existing = acc.find((group: any) => group.price === row.price);
        if (existing) {
          existing.kgs += row.kgs;
        } else {
          acc.push({ price: row.price, kgs: row.kgs });
        }
        return acc;
      }, []);

      groupedPricingRows.sort((a: any, b: any) => b.price - a.price).forEach((r: any) => {
        const rowTotal = r.kgs * r.price;
        message += `${r.kgs} kg * ${r.price} ₹ = ${Math.round(rowTotal).toLocaleString().padStart(8)}\n`;
      });
      
      message += `———————\n`;
      const totalValueLabel = isTe ? "మొత్తం విలువ" : "Total amount";
      message += `${totalValueLabel} - ${Math.round(salesTotal).toLocaleString().padStart(8)}\n`;

      // Commission line
      const commLabel = isTe ? "కమిషను" : "Commission";
      message += `${commLabel.padEnd(10)} - ${Math.round(commissionTotal).toLocaleString().padStart(12)}\n`;

      // Import Charges line
      const importLabel = isTe ? "దిగుమతి" : "Import";
      message += `${importLabel.padEnd(10)} - ${Math.round(importChargeTotal).toLocaleString().padStart(12)}\n`;

      // Individual Expenses
      item.expenses.forEach(exp => {
        const label = isTe ? (exp.name === "Hire" ? "కిరాయి" : exp.name) : (exp.name === "Hire" ? "Hire" : exp.name);
        message += `${label.padEnd(10)} - ${Math.round(exp.amount).toLocaleString().padStart(12)}\n`;
      });
      
      message += `———————\n`;
      const itemNet = salesTotal - expensesTotal;
      const netValueLabel = isTe ? "నికర విలువ" : "Net value";
      message += `${netValueLabel}.        ${Math.round(itemNet).toLocaleString()}\n\n`;

      // Storage Info
      const storageBagsLabel = isTe ? "నిల్వ బస్తాలు" : "Storage bags";
      const storageKgsLabel = isTe ? "నిల్వ కిలోలు" : "Storage kg";
      message += `${storageBagsLabel} :${item.importedBags - item.soldBags}\n`;
      message += `${storageKgsLabel}:${item.totalKgs - item.soldKgs} kg \n\n`;
    });

    if (stockGroup.length > 1) {
      message += `-------------------------------\n`;
      message += `*${t("finalPayableCapital")}: ₹${Math.round(totalGross - totalExpenses).toLocaleString()}*\n`;
    }
    
    message += `_${t("generatedVia")}_`;

    const whatsappUrl = `https://wa.me/${farmer?.phone?.replace(/\D/g, '') || ""}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleDelete = (group: VegetableStock[]) => {
    const batchId = `${group[0].farmerId}_${group[0].date.substring(0, 10)}`;
    if (confirmDeleteBatchId === batchId) {
      deleteStocks(group.map(s => s.id));
      setConfirmDeleteBatchId(null);
    } else {
      setConfirmDeleteBatchId(batchId);
      setConfirmDeleteId(null);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDeleteBatchId(null), 3000);
    }
  };

  const handleDeleteSingle = (stock: VegetableStock) => {
    if (confirmDeleteId === stock.id) {
      deleteStock(stock.id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(stock.id);
      setConfirmDeleteBatchId(null);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="label-caps">History</span>
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{t("bills")}</h2>
        </div>
        <div className="flex items-center gap-2">
           <div className="bg-slate-50 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/50 dark:border-white/5 flex">
             <button 
              onClick={() => setSortType("date")}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", sortType === "date" ? "bg-white dark:bg-white/10 shadow-sm text-primary" : "text-slate-400")}
             >
                By Date
             </button>
             <button 
              onClick={() => setSortType("amount")}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", sortType === "amount" ? "bg-white dark:bg-white/10 shadow-sm text-primary" : "text-slate-400")}
             >
                By Amount
             </button>
           </div>
        </div>
      </header>

      <div className="space-y-6">
        {groupedStocks.length === 0 ? (
          <div className="premium-card p-20 flex flex-col items-center justify-center text-center space-y-4 border-dashed bg-transparent">
             <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300">
                <FileText size={32} />
              </div>
              <div className="max-w-xs">
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No records yet</p>
                <p className="text-sm text-slate-400 mt-1">Generate a bill to see it in your history.</p>
              </div>
          </div>
        ) : (
          groupedStocks.map((group) => {
            const firstStock = group[0];
            const farmer = farmers.find((f: any) => f.id === firstStock.farmerId);
            
            const groupTotal = group.reduce((acc, s) => {
              const sales = s.pricingRows.reduce((sum: number, r: any) => sum + (r.kgs * r.price), 0);
              const commission = Math.round(sales * 0.1);
              const importCharge = (s.importedBags - (s.oldBags || 0)) * 15;
              const exp = s.expenses.reduce((sum: number, e: any) => sum + e.amount, 0) + commission + importCharge;
              return acc + (sales - exp);
            }, 0);

            const vegNames = group.map(s => {
              const v = VEGETABLES.find(v => v.id === s.vegetableId);
              return i18n.language === "te" ? v?.nameTe : v?.nameEn;
            }).join(", ");

            const batchId = `${firstStock.farmerId}_${firstStock.date.substring(0, 10)}`;

            return (
              <div key={batchId} className="premium-card overflow-hidden border-l-4 border-l-primary group">
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform">
                      {group.length > 1 ? "🧾" : (VEGETABLES.find(v => v.id === firstStock.vegetableId)?.emoji || "📦")}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{farmer?.name}</h4>
                      <p className="text-sm text-slate-400 font-medium flex items-center gap-2 mt-1">
                        <Calendar size={14} className="opacity-60" />
                        {new Date(firstStock.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        {group.length > 1 && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">{group.length} Items</span>}
                      </p>
                    </div>
                  </div>
                  <div className="md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start">
                    <div className="md:mb-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-0.5">Payable Amount</p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{formatCurrency(groupTotal, i18n.language)}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full max-w-[200px] truncate">{vegNames}</p>
                  </div>
                </div>
                
                <div className="p-4 md:p-8 space-y-4 bg-white/40 dark:bg-transparent">
                  {group.map((s, idx) => {
                    const v = VEGETABLES.find(veg => veg.id === s.vegetableId);
                    const vName = i18n.language === "te" ? v?.nameTe : v?.nameEn;
                    const itmSales = s.pricingRows.reduce((a: number, r: any) => a + (r.kgs * r.price), 0);
                    const itmComm = Math.round(itmSales * 0.1);
                    const itmImport = (s.importedBags - (s.oldBags || 0)) * 15;
                    const itmExp = s.expenses.reduce((a: number, e: any) => a + e.amount, 0) + itmComm + itmImport;
                    const itmNet = itmSales - itmExp;
                    
                    return (
                      <div key={s.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-5 bg-slate-50/50 dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/5 group/item transition-all hover:bg-slate-50 dark:hover:bg-white/[0.05]">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-5 h-5 flex items-center justify-center bg-slate-200 dark:bg-white/10 rounded-full text-[10px] font-bold text-slate-500">{idx+1}</span>
                            <p className="text-base font-bold text-slate-800 dark:text-slate-200">{vName}</p>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                            <div className="flex flex-col">
                              <span className="label-caps opacity-50 text-[8px] mb-0.5">{t("bags")}</span>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{s.importedBags} <span className="text-[10px] opacity-40 uppercase">Total</span></span>
                            </div>
                            <div className="flex flex-col">
                              <span className="label-caps opacity-50 text-[8px] mb-0.5">Sold/Rem</span>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{s.soldBags} / {s.importedBags - s.soldBags}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="label-caps opacity-50 text-[8px] mb-0.5">{t("totalKgs")}</span>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{s.totalKgs} kg</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="label-caps opacity-50 text-[8px] text-primary mb-0.5">Net Value</span>
                              <span className="text-sm font-black text-primary">₹{Math.round(itmNet).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 justify-end md:border-l border-slate-100 dark:border-white/5 md:pl-6">
                          <button 
                            onClick={() => onEditStock(s)}
                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-xl transition-all active:scale-90"
                            title="Edit Item"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteSingle(s)}
                            className={cn(
                              "h-10 px-3 rounded-xl transition-all flex items-center gap-2 font-bold text-xs uppercase transition-all active:scale-95",
                              confirmDeleteId === s.id 
                                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
                                : "text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                            )}
                          >
                            {confirmDeleteId === s.id ? (
                               <>
                                 <CheckCircle2 size={14} />
                                 <span>Confirm</span>
                               </>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-6 md:p-8 pt-0 flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => handleShare(group)}
                    className="flex-1 btn-primary h-14 text-sm uppercase tracking-widest shadow-xl shadow-primary/20"
                  >
                    <Share2 size={18} strokeWidth={2.5} />
                    {t("sendBill")}
                  </button>
                  <button 
                    onClick={() => handleDelete(group)}
                    className={cn(
                      "h-14 px-8 rounded-[16px] font-bold text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2",
                      confirmDeleteBatchId === batchId
                        ? "bg-rose-600 text-white shadow-2xl shadow-rose-500/30 w-full sm:w-auto"
                        : "bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    )}
                  >
                    {confirmDeleteBatchId === batchId ? (
                      <>
                        <AlertTriangle size={18} />
                        <span>Confirm Batch Delete</span>
                      </>
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

}
