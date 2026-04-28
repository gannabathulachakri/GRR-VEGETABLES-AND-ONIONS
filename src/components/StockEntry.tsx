import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Calculator, Check, AlertCircle, X, Search } from "lucide-react";
import { VEGETABLES, PricingRow, Expense, Farmer, VegetableStock } from "../types";
import { cn } from "../lib/utils";

interface StockEntryProps {
  farmitre: any;
  editingStock?: VegetableStock | null;
  onComplete?: () => void;
}

export default function StockEntry({ farmitre, editingStock, onComplete }: StockEntryProps) {
  const { t, i18n } = useTranslation();
  const { farmers, addStock, updateStock, deleteStock } = farmitre;
  
  const isTe = i18n.language === "te";

  const [farmerId, setFarmerId] = useState("");
  const [vegetableId, setVegetableId] = useState("");
  const [importedBags, setImportedBags] = useState(0);
  const [totalKgs, setTotalKgs] = useState(0);
  const [pricingRows, setPricingRows] = useState<PricingRow[]>([]);
  const [soldBags, setSoldBags] = useState(0);
  const [soldKgs, setSoldKgs] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: Stock Details, 2: Pricing & Sales

  useEffect(() => {
    if (editingStock) {
      setFarmerId(editingStock.farmerId);
      setVegetableId(editingStock.vegetableId);
      setImportedBags(editingStock.importedBags);
      setTotalKgs(editingStock.totalKgs);
      setPricingRows(editingStock.pricingRows);
      setSoldBags(editingStock.soldBags || 0);
      setSoldKgs(editingStock.soldKgs || 0);
      setExpenses(editingStock.expenses);
    } else {
      resetForm();
    }
  }, [editingStock]);

  const addPricingRow = () => {
    setPricingRows([...pricingRows, { id: Math.random().toString(), kgs: 0, price: 0 }]);
  };

  const removePricingRow = (id: string) => {
    setPricingRows(pricingRows.filter(r => r.id !== id));
  };

  const updatePricingRow = (id: string, field: keyof PricingRow, value: number) => {
    const updatedRows = pricingRows.map(r => r.id === id ? { ...r, [field]: value } : r);
    setPricingRows(updatedRows);
    
    // Auto-add next row if current one is filled and there's more stock to price
    const currentRow = updatedRows.find(r => r.id === id);
    const totalKgsPriced = updatedRows.reduce((sum, r) => sum + r.kgs, 0);
    const isLastRow = updatedRows[updatedRows.length - 1]?.id === id;

    if (currentRow && currentRow.kgs > 0 && currentRow.price > 0 && totalKgsPriced < soldKgs && isLastRow) {
      setPricingRows([...updatedRows, { id: Math.random().toString(), kgs: 0, price: 0 }]);
    }
  };

  const addExpense = (name: string) => {
    setExpenses([...expenses, { id: Math.random().toString(), name, amount: 0 }]);
  };

  const updateExpense = (id: string, amount: number) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, amount } : e));
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const totalPricingKgs = pricingRows.reduce((sum, row) => sum + row.kgs, 0);
  const totalSalesAmount = pricingRows.reduce((sum, row) => sum + (row.kgs * row.price), 0);
  const totalExpensesAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const grandTotal = totalSalesAmount - totalExpensesAmount;
  const remainingKgs = totalKgs - soldKgs;

  const handleSubmit = () => {
    if (!farmerId || !vegetableId) return;
    
    if (soldBags > importedBags || soldKgs > totalKgs) {
      alert(isTe ? "అమ్మిన స్టాక్ దిగుమతి చేసుకున్న స్టాక్ కంటే ఎక్కువగా ఉండకూడదు." : "Sold stock cannot be more than imported stock.");
      return;
    }

    if (totalPricingKgs !== soldKgs) {
      alert(isTe ? `మొత్తం ధర కేజీలు (${totalPricingKgs}) అమ్మిన కేజీలతో (${soldKgs}) సరిపోలాలి.` : `Total pricing KGs (${totalPricingKgs}) must match sold KGs (${soldKgs}).`);
      return;
    }
    
    const stockData = {
      farmerId,
      vegetableId,
      date: editingStock?.date || new Date().toISOString(),
      importedBags,
      totalKgs,
      pricingRows,
      soldBags,
      soldKgs,
      expenses,
    };

    if (editingStock) {
      updateStock(editingStock.id, stockData);
    } else {
      addStock(stockData);
    }
    
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      resetForm();
      if (onComplete) onComplete();
    }, 1500);
  };

  const [vegetableSearch, setVegetableSearch] = useState("");
  
  const filteredVegetables = VEGETABLES.filter(v => 
    v.nameEn.toLowerCase().includes(vegetableSearch.toLowerCase()) ||
    v.nameTe.toLowerCase().includes(vegetableSearch.toLowerCase())
  );

  const resetForm = () => {
    setFarmerId("");
    setVegetableId("");
    setVegetableSearch("");
    setImportedBags(0);
    setTotalKgs(0);
    setPricingRows([]);
    setSoldBags(0);
    setSoldKgs(0);
    setExpenses([]);
    setStep(1);
  };

  if (farmers.length === 0) {
    return (
      <div className="glass-card p-12 text-center flex flex-col items-center space-y-4">
        <AlertCircle size={48} className="text-amber-500" />
        <h3 className="text-xl font-bold">{t("noFarmersFound")}</h3>
        <p className="text-slate-500 max-w-xs">{t("addFarmer")} first to start adding stock.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {editingStock ? t("settings") : t("addStock")}
          </h2>
          <p className="text-slate-500">{t("billDetails")}</p>
        </div>
        {editingStock && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (confirm(t("confirmDelete") || "Are you sure?")) {
                  deleteStock(editingStock.id);
                  if (onComplete) onComplete();
                }
              }}
              className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-full active:scale-90 transition-all"
              title="Delete Bill"
            >
              <Trash2 size={20} />
            </button>
            <button 
              onClick={onComplete}
              className="p-2.5 bg-slate-100 rounded-full text-slate-500 active:scale-90 transition-transform"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </header>

      <div className="space-y-4">
        {step === 1 ? (
          <>
            {/* Step 1: Basic Info */}
            <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">{t("selectFarmer")}</label>
                <select 
                  className="input-field appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_16px_center] bg-no-repeat"
                  value={farmerId}
                  onChange={(e) => setFarmerId(e.target.value)}
                >
                  <option value="">{t("selectFarmer")}</option>
                  {farmers.map((f: Farmer) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">{t("selectVegetable")}</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    placeholder={isTe ? "వెతకండి..." : "Search vegetable..."}
                    className="input-field pl-10 text-sm py-2"
                    value={vegetableSearch}
                    onChange={(e) => setVegetableSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 max-h-[240px] overflow-y-auto p-1 scrollbar-hide">
                  {filteredVegetables.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVegetableId(v.id)}
                      className={cn(
                        "w-full px-3 py-3 flex flex-col items-center justify-center rounded-xl border-2 transition-all active:scale-95 text-center",
                        vegetableId === v.id 
                          ? "border-brand-500 bg-brand-50 shadow-sm text-brand-700 font-bold" 
                          : "border-slate-100 hover:border-slate-200 bg-white text-slate-600"
                      )}
                    >
                      <span className="text-[10px] leading-tight mb-0.5 opacity-70">
                        {isTe ? v.nameEn : v.nameTe}
                      </span>
                      <span className="text-xs font-semibold leading-tight">
                        {isTe ? v.nameTe : v.nameEn}
                      </span>
                    </button>
                  ))}
                  {filteredVegetables.length === 0 && (
                    <div className="col-span-full py-8 text-center text-slate-400 text-sm">
                      No vegetables found
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 1: Quantities */}
            <div className="glass-card p-6 grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">{t("importedBags")}</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={importedBags || ""}
                  onChange={(e) => setImportedBags(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">{t("totalKgsLabel")}</label>
                <input 
                  type="number" 
                  className="input-field font-bold text-brand-700" 
                  value={totalKgs || ""}
                  onChange={(e) => setTotalKgs(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!farmerId || !vegetableId || totalKgs <= 0) {
                  alert(isTe ? "దయచేసి అన్ని వివరాలను నింపండి." : "Please fill all stock details.");
                  return;
                }
                setStep(2);
                if (pricingRows.length === 0) {
                  addPricingRow();
                }
              }}
              className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all"
            >
              {isTe ? "ధర వివరాలకు వెళ్ళండి" : "Next: Pricing Details"} →
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setStep(1)}
              className="text-slate-500 font-medium flex items-center gap-1 hover:text-slate-800 transition-colors"
            >
              ← {isTe ? "స్టాక్ వివరాలకు తిరిగి వెళ్ళండి" : "Back to Stock Details"}
            </button>

            {/* Step 2: Sales Tracking */}
            <div className="glass-card p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2 flex items-center justify-between mb-2">
                <div className="p-3 bg-slate-100 rounded-xl text-slate-700 text-sm font-bold">
                  {t("importedBags")}: {importedBags}
                </div>
                <div className="p-3 bg-brand-100 rounded-xl text-brand-700 text-sm font-bold">
                  {t("totalKgsLabel")}: {totalKgs} {t("kgs")}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">{t("soldBags")}</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={soldBags || ""}
                  onChange={(e) => setSoldBags(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">{t("soldKgs")}</label>
                <input 
                  type="number" 
                  className="input-field font-bold text-brand-700" 
                  value={soldKgs || ""}
                  onChange={(e) => setSoldKgs(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div className="col-span-2 flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1 pt-2">
                <span className={cn((importedBags - soldBags) < 0 && "text-rose-500")}>
                  {t("remainingBags")}: {importedBags - soldBags}
                </span>
                <span className={cn((totalKgs - soldKgs) < 0 && "text-rose-500")}>
                  {t("remainingKgs")}: {totalKgs - soldKgs} {t("kgs")}
                </span>
              </div>
            </div>

            {/* Step 2: Dynamic Pricing */}
            <div className="glass-card p-6 space-y-4 border-2 border-transparent transition-all" style={{
              borderColor: totalPricingKgs === soldKgs && soldKgs > 0 ? '#10b981' : (totalPricingKgs > soldKgs ? '#f43f5e' : 'transparent')
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Calculator size={18} className="text-brand-500" />
                    {t("pricing")}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {isTe ? "అమ్మిన కేజీలకు ధరను కేటాయించండి" : "Assign prices to sold KGs"}
                  </p>
                </div>
                <button 
                  onClick={addPricingRow}
                  className="text-xs font-bold px-3 py-1.5 bg-brand-50 text-brand-600 rounded-lg border border-brand-100 hover:bg-brand-100 transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> {t("addPriceRow")}
                </button>
              </div>
              
              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">{isTe ? "అమ్మిన కేజీలు" : "Total Sold KGs"}</p>
                  <p className="text-lg font-black text-slate-800">{soldKgs}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">{isTe ? "కేటాయించిన కేజీలు" : "Priced KGs"}</p>
                  <p className={cn(
                    "text-lg font-black",
                    totalPricingKgs === soldKgs ? "text-emerald-600" : "text-amber-500"
                  )}>
                    {totalPricingKgs} / {soldKgs}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {pricingRows.map((row) => (
                  <div key={row.id} className="flex gap-3 items-end animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex-1 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{t("kgs")}</span>
                      <input 
                        type="number" 
                        className="input-field py-2 text-sm" 
                        placeholder="KGs"
                        value={row.kgs || ""}
                        onChange={(e) => updatePricingRow(row.id, "kgs", Number(e.target.value))}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{isTe ? "ధర (కేజీకి)" : "Rate (per KG)"}</span>
                      <input 
                        type="number" 
                        className="input-field py-2 text-sm" 
                        placeholder="₹"
                        value={row.price || ""}
                        onChange={(e) => updatePricingRow(row.id, "price", Number(e.target.value))}
                      />
                    </div>
                    <div className="text-right pb-3 px-1">
                      <p className="text-[10px] text-slate-400 font-bold">Total</p>
                      <p className="text-sm font-bold text-slate-700">₹{Math.round(row.kgs * row.price).toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => removePricingRow(row.id)}
                      className="mb-1 p-2.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {pricingRows.length === 0 && (
                  <div className="py-4 text-center text-slate-400 italic text-sm">
                    {isTe ? "అమ్మిన కిలోలను నమోదు చేయండి" : "Enter sold KGs to begin pricing"}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-slate-500 font-medium">{t("totalSales")}</span>
                <span className="text-xl font-bold text-slate-900">₹ {Math.round(totalSalesAmount).toLocaleString()}</span>
              </div>
            </div>

            {/* Step 2: Expenses */}
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">{t("expenses")}</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => addExpense(t("transport"))}
                    className="text-xs font-bold px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600 active:scale-95 transition-colors"
                  >
                    + {t("transport")}
                  </button>
                  <button 
                    onClick={() => addExpense(t("otherCharges"))}
                    className="text-xs font-bold px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600 active:scale-95 transition-colors"
                  >
                    + {t("otherCharges")}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex gap-3 items-center">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-400 mb-1">{exp.name}</p>
                      <input 
                        type="number" 
                        className="input-field py-2 text-sm" 
                        placeholder="₹ Amount"
                        value={exp.amount || ""}
                        onChange={(e) => updateExpense(exp.id, Number(e.target.value))}
                      />
                    </div>
                    <button 
                      onClick={() => removeExpense(exp.id)}
                      className="mt-5 p-2.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Summary & Submit */}
            <div className="glass-card p-6 bg-brand-900 text-white space-y-4 shadow-xl shadow-brand-900/20 border-0">
              <div className="flex justify-between items-center text-brand-200">
                <span>{t("totalSales")}</span>
                <span className="font-bold">₹ {Math.round(totalSalesAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-rose-300">
                <span>{t("expenses")}</span>
                <span className="font-bold">- ₹ {Math.round(totalExpensesAmount).toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-brand-800 flex justify-between items-center">
                <span className="text-lg font-medium">{t("grandTotal")}</span>
                <span className="text-3xl font-black">₹ {Math.round(grandTotal).toLocaleString()}</span>
              </div>
              
              <button 
                onClick={handleSubmit}
                disabled={!farmerId || !vegetableId || totalPricingKgs !== soldKgs || success}
                className={cn(
                  "w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95",
                  success 
                    ? "bg-emerald-500 text-white" 
                    : "bg-white text-brand-900 hover:bg-brand-50 disabled:opacity-50 disabled:active:scale-100"
                )}
              >
                {success ? <Check size={24} /> : null}
                {success ? (isTe ? "విజయవంతంగా సేవ్ చేయబడింది!" : "Saved successfully!") : (editingStock ? t("save") : t("generateBill"))}
              </button>
              
              {totalPricingKgs !== soldKgs && (
                <p className="text-[10px] text-center text-brand-300 font-medium">
                  {isTe 
                    ? `దయచేసి ధర వివరాల కేజీలు (${totalPricingKgs}) అమ్మిన కేజీలతో (${soldKgs}) సరిపోలాలి.` 
                    : `Pricing KGs (${totalPricingKgs}) must equal sold KGs (${soldKgs}) to save.`}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
