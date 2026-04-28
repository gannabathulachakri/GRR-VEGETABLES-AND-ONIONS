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

    let message = `*GRR*\n_vegetables and onions_\n\n`;
    message += `${t("farmer")}: ${farmer?.name}\n`;
    message += `${t("date")}: ${indiaDate}\n\n`;

    let totalGross = 0;
    let totalExpenses = 0;

    stockGroup.forEach((item, index) => {
      const veg = VEGETABLES.find((v) => v.id === item.vegetableId);
      const vegName = isTe ? veg?.nameTe : veg?.nameEn;
      
      const salesTotal = item.pricingRows.reduce((acc: number, row: any) => acc + (row.kgs * row.price), 0);
      const expensesTotal = item.expenses.reduce((acc: number, exp: any) => acc + exp.amount, 0);
      
      totalGross += salesTotal;
      totalExpenses += expensesTotal;

      message += `*${index + 1}. ${vegName}*\n`;
      message += `${t("importedBags")}: *${item.importedBags}*, ${t("totalKgsLabel")}: *${item.totalKgs} ${t("kgs")}*\n\n`;
      
      message += `*${t("pricingDetails")}*\n`;
      item.pricingRows.forEach((r: any) => {
        const rowTotal = r.kgs * r.price;
        message += `  • *${r.kgs} ${t("kgs")}* @ *₹${Math.round(r.price)}* = *₹${Math.round(rowTotal).toLocaleString()}*\n`;
      });
      message += `\n`;

      message += `${t("soldBags")}: *${item.soldBags}*, ${t("soldKgs")}: *${item.soldKgs} ${t("kgs")}*\n`;
      message += `${t("remainingBags")}: *${item.importedBags - item.soldBags}*, ${t("remainingKgs")}: *${item.totalKgs - item.soldKgs} ${t("kgs")}*\n`;
      
      if (item.expenses.length > 0) {
        message += `  ${t("expenses")}: *₹${Math.round(expensesTotal).toLocaleString()}*\n`;
      }
      
      message += `  ${t("item")} ${t("net")}: *₹${Math.round(salesTotal - expensesTotal).toLocaleString()}*\n\n`;
    });

    message += `------------------------\n`;
    message += `*${t("grossTotalCapital")}: ₹${Math.round(totalGross).toLocaleString()}*\n`;
    message += `*${t("totalExpensesCapital")}: ₹${Math.round(totalExpenses).toLocaleString()}*\n`;
    message += `*${t("finalPayableCapital")}: ₹${Math.round(totalGross - totalExpenses).toLocaleString()}*\n\n`;
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
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="mb-2">
            <h1 className="text-2xl font-black text-brand-950 uppercase tracking-tighter leading-none">GRR</h1>
            <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest -mt-0.5">vegetables and onions</p>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{t("bills")}</h2>
          <p className="text-slate-500">{groupedStocks.length} {t("history")} batches</p>
        </div>
      </header>

      <div className="space-y-4">
        {groupedStocks.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 font-medium">
            {t("noFarmersFound")}
          </div>
        ) : (
          groupedStocks.map((group) => {
            const firstStock = group[0];
            const farmer = farmers.find((f: any) => f.id === firstStock.farmerId);
            
            const groupTotal = group.reduce((acc, s) => {
              const sales = s.pricingRows.reduce((sum: number, r: any) => sum + (r.kgs * r.price), 0);
              const exp = s.expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
              return acc + (sales - exp);
            }, 0);

            const vegNames = group.map(s => {
              const v = VEGETABLES.find(v => v.id === s.vegetableId);
              return i18n.language === "te" ? v?.nameTe : v?.nameEn;
            }).join(", ");

            return (
              <div key={`${firstStock.farmerId}_${firstStock.date}`} className="glass-card overflow-hidden border-l-4 border-brand-500">
                <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-sm font-bold text-brand-600 shadow-sm">
                      {group.length > 1 ? <FileText size={20} /> : (VEGETABLES.find(v => v.id === firstStock.vegetableId)?.emoji || (i18n.language === "te" ? VEGETABLES.find(v => v.id === firstStock.vegetableId)?.nameTe.charAt(0) : VEGETABLES.find(v => v.id === firstStock.vegetableId)?.nameEn.charAt(0)))}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{farmer?.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(firstStock.date).toLocaleDateString()}
                        {group.length > 1 && <span className="ml-2 bg-brand-100 text-brand-700 px-1.5 rounded-full text-[10px] font-bold">{group.length} items</span>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-600">{formatCurrency(groupTotal, i18n.language)}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black max-w-[120px] truncate">{vegNames}</p>
                  </div>
                </div>
                
                <div className="bg-white/50 px-4 py-2 text-xs space-y-2">
                  {group.map((s, idx) => {
                    const v = VEGETABLES.find(veg => veg.id === s.vegetableId);
                    const vName = i18n.language === "te" ? v?.nameTe : v?.nameEn;
                    const itmSales = s.pricingRows.reduce((a: number, r: any) => a + (r.kgs * r.price), 0);
                    return (
                      <div key={s.id} className="flex items-center justify-between group/item py-1 border-b border-slate-100 last:border-0 hover:bg-slate-100/50 -mx-2 px-2 rounded-lg transition-colors">
                        <div className="flex-1">
                          <p className="text-slate-600 dark:text-slate-200 font-medium">{idx+1}. {vName}</p>
                          <div className="flex flex-wrap gap-x-2 text-slate-400 dark:text-slate-500 text-[10px]">
                            <span>{t("importedBags")}: {s.importedBags}</span>
                            <span>{t("soldBags")}: {s.soldBags} ({s.soldKgs} {t("kgs")})</span>
                            <span className="text-brand-600 dark:text-brand-400 font-bold">{t("remaining") || "Rem"}: {s.importedBags - s.soldBags} ({s.totalKgs - s.soldKgs} {t("kgs")})</span>
                          </div>
                          <p className="text-brand-600 dark:text-brand-400 font-bold text-[10px] mt-0.5">₹{Math.round(itmSales).toLocaleString()}</p>
                        </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditStock(s);
                              }}
                              className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                              title="Edit Item"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSingle(s);
                              }}
                              className={cn(
                                "p-1.5 rounded-lg transition-all flex items-center gap-1",
                                confirmDeleteId === s.id 
                                  ? "bg-rose-500 text-white animate-pulse" 
                                  : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                              )}
                              title={confirmDeleteId === s.id ? t("confirmDelete") : "Delete Item"}
                            >
                              {confirmDeleteId === s.id ? (
                                <span className="text-[9px] font-bold uppercase">{t("save") === "Save" ? "Confirm" : "నిర్ధారించు"}</span>
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 flex gap-2">
                  <button 
                    onClick={() => handleShare(group)}
                    className="flex-1 btn-primary py-2.5 text-xs shadow-md"
                  >
                    <Share2 size={16} />
                    {t("sendBill")}
                  </button>
                  <button 
                    onClick={() => handleDelete(group)}
                    className={cn(
                      "p-2.5 rounded-xl transition-all border flex items-center justify-center gap-2",
                      confirmDeleteBatchId === `${firstStock.farmerId}_${firstStock.date.substring(0, 10)}`
                        ? "bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-200 animate-pulse px-4"
                        : "text-rose-500 hover:bg-rose-50 border-transparent hover:border-rose-100"
                    )}
                    title="Delete Batch"
                  >
                    {confirmDeleteBatchId === `${firstStock.farmerId}_${firstStock.date.substring(0, 10)}` ? (
                      <>
                        <AlertTriangle size={18} />
                        <span className="text-[10px] font-black uppercase tracking-tight">Confirm Delete</span>
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
