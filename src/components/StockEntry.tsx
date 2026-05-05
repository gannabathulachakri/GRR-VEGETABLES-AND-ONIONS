import { useState, useEffect, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Calculator, Check, AlertCircle, X, Search, Scale, IndianRupee, User, UserPlus, Phone, ArrowLeft, Send, CheckCircle2, Package, Users, ChevronRight, Landmark } from "lucide-react";
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
  const [oldBags, setOldBags] = useState(0);
  const [newBags, setNewBags] = useState(0);
  const [oldKgs, setOldKgs] = useState(0);
  const [newKgs, setNewKgs] = useState(0);
  const [pricingRows, setPricingRows] = useState<PricingRow[]>([]);
  const [soldBags, setSoldBags] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (editingStock) {
      setFarmerId(editingStock.farmerId);
      setVegetableId(editingStock.vegetableId);
      setOldBags(editingStock.oldBags || 0);
      setOldKgs(editingStock.oldKgs || 0);
      setNewBags(editingStock.importedBags - (editingStock.oldBags || 0));
      setNewKgs(editingStock.totalKgs - (editingStock.oldKgs || 0));
      setPricingRows(editingStock.pricingRows);
      setSoldBags(editingStock.soldBags || 0);
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

  // Calculated values
  const totalImportedBags = oldBags + newBags;
  const totalImportedKgs = oldKgs + newKgs;
  const totalSoldKgs = pricingRows.reduce((sum, row) => sum + row.kgs, 0);
  const remainingBags = totalImportedBags - soldBags;
  const remainingKgs = totalImportedKgs - totalSoldKgs;

  const totalSalesAmount = pricingRows.reduce((sum, row) => sum + (row.kgs * row.price), 0);
  const commissionAmount = Math.round(totalSalesAmount * 0.1);
  const importChargeAmount = newBags * 15;
  
  // Group pricing by rate for summary
  const groupedPricing = pricingRows.reduce((acc: { price: number; kgs: number }[], row) => {
    if (row.kgs <= 0 || row.price <= 0) return acc;
    const existing = acc.find(item => item.price === row.price);
    if (existing) {
      existing.kgs += row.kgs;
    } else {
      acc.push({ price: row.price, kgs: row.kgs });
    }
    return acc;
  }, []);

  const totalExpensesAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0) + commissionAmount + importChargeAmount;
  const grandTotal = totalSalesAmount - totalExpensesAmount;

  const handleKeyDown = (e: KeyboardEvent, nextAction?: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextAction) {
        nextAction();
      } else {
        const form = (e.target as HTMLElement).closest("form") || document;
        const index = Array.from(form.querySelectorAll("input, select, button")).indexOf(e.target as any);
        const next = form.querySelectorAll("input, select, button")[index + 1] as HTMLElement;
        if (next) next.focus();
      }
    }
  };

  const handleSubmit = () => {
    if (!farmerId || !vegetableId) return;
    
    if (soldBags > totalImportedBags || totalSoldKgs > totalImportedKgs) {
      alert(isTe ? "అమ్మిన స్టాక్ దిగుమతి చేసుకున్న స్టాక్ కంటే ఎక్కువగా ఉండకూడదు." : "Sold stock cannot be more than imported stock.");
      return;
    }

    if (totalSoldKgs <= 0) {
      alert(isTe ? "అమ్మిన కేజీలకు ధరను నమోదు చేయండి." : "Please enter pricing for sold KGs.");
      return;
    }
    
    const stockData = {
      farmerId,
      vegetableId,
      date: editingStock?.date || new Date().toISOString(),
      importedBags: totalImportedBags,
      oldBags,
      totalKgs: totalImportedKgs,
      oldKgs,
      pricingRows,
      soldBags,
      soldKgs: totalSoldKgs,
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
    setOldBags(0);
    setNewBags(0);
    setOldKgs(0);
    setNewKgs(0);
    setPricingRows([{ id: Math.random().toString(), kgs: 0, price: 0 }]);
    setSoldBags(0);
    setExpenses([]);
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
    <div className="space-y-8 pb-40">
      <header className="flex items-center justify-between">
        <div>
          <span className="label-caps">{editingStock ? t("settings") : "Inventory"}</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {editingStock ? "Edit Record" : t("addStock")}
          </h2>
        </div>
        {editingStock && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (confirm(t("confirmDelete") || "Are you sure?")) {
                  deleteStock(editingStock.id);
                  if (onComplete) onComplete();
                }
              }}
              className="w-10 h-10 flex items-center justify-center text-rose-500 bg-rose-50 dark:bg-rose-500/10 rounded-full active:scale-90 transition-all"
            >
              <Trash2 size={20} />
            </button>
            <button 
              onClick={onComplete}
              className="w-10 h-10 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 active:scale-90 transition-transform"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </header>

      <form className="space-y-6" onKeyDown={handleKeyDown}>
        {/* Step 1: Identity */}
        <section className="space-y-3">
           <span className="label-caps px-1">Step 1: Farmer & Item</span>
           <div className="premium-card p-5 space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">{t("selectFarmer")}</label>
              <div className="relative">
                <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  className="input-field pl-11 h-12 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:18px_18px] bg-[right_16px_center] bg-no-repeat"
                  value={farmerId}
                  onChange={(e) => setFarmerId(e.target.value)}
                  autoFocus
                >
                  <option value="">{t("selectFarmer")}</option>
                  {farmers.map((f: Farmer) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">{t("selectVegetable")}</label>
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder={isTe ? "వెతకండి..." : "Search vegetable..."}
                  className="input-field pl-11 h-12"
                  value={vegetableSearch}
                  onChange={(e) => setVegetableSearch(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-[300px] overflow-y-auto p-1 scrollbar-hide">
                {filteredVegetables.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVegetableId(v.id)}
                    className={cn(
                      "group flex flex-col items-center justify-center aspect-square rounded-[18px] border-2 transition-all active:scale-95 text-center p-1.5",
                      vegetableId === v.id 
                        ? "border-primary bg-primary/5 dark:bg-primary/20 shadow-md shadow-primary/5" 
                        : "border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
                    )}
                  >
                    <span className="text-xl mb-1.5 transition-transform group-hover:scale-110">{v.emoji}</span>
                    <span className={cn(
                      "text-[9px] font-black leading-tight uppercase tracking-tighter line-clamp-2",
                      vegetableId === v.id ? "text-primary" : "text-slate-500"
                    )}>
                      {isTe ? v.nameTe : v.nameEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {farmerId && vegetableId && (
          <div className="space-y-6 animate-in fade-in duration-700">
            {/* Step 2: Inbound */}
            <section className="space-y-3">
              <span className="label-caps px-1">Step 2: Inbound Stock</span>
              <div className="premium-card p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Bag Inputs */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1.5">
                       <Package size={14} className="text-slate-400" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t("bags")}</span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <div className="relative">
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-300 uppercase">{t("oldBags")}</span>
                        <input 
                          type="number" 
                          id="old-bags-input"
                          className="input-field h-14 text-xl font-black pr-16" 
                          value={oldBags || ""}
                          onChange={(e) => setOldBags(Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-300 uppercase">{t("newBags")}</span>
                        <input 
                          type="number" 
                          id="new-bags-input"
                          className="input-field h-14 text-xl font-black pr-16" 
                          value={newBags || ""}
                          onChange={(e) => setNewBags(Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* KG Inputs */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1.5">
                       <Scale size={14} className="text-slate-400" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t("kgs")}</span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <div className="relative">
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-300 uppercase">{t("oldKgs")}</span>
                        <input 
                          type="number" 
                          id="old-kgs-input"
                          className="input-field h-14 text-xl font-black pr-16" 
                          value={oldKgs || ""}
                          onChange={(e) => setOldKgs(Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-300 uppercase">{t("newKgs")}</span>
                        <input 
                          type="number" 
                          id="new-kgs-input"
                          className="input-field h-14 text-xl font-black pr-16" 
                          value={newKgs || ""}
                          onChange={(e) => setNewKgs(Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Totals */}
                  <div className="bg-slate-50 dark:bg-white/5 rounded-[20px] p-5 flex flex-col justify-between border border-slate-200/50 dark:border-white/5">
                    <div>
                      <span className="label-caps text-slate-400 text-[10px]">Total Import</span>
                      <div className="flex items-baseline gap-1.5 mt-1.5">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">{totalImportedBags}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("bags")}</span>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold text-primary tabular-nums">{totalImportedKgs}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("kgs")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 3: Pricing */}
            <section className="space-y-3">
               <div className="flex items-center justify-between px-1">
                <span className="label-caps">Step 3: Sale Details</span>
                <button 
                  type="button"
                  onClick={addPricingRow}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[9px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                >
                  <Plus size={12} strokeWidth={3} /> {t("addPriceRow")}
                </button>
              </div>

              <div className="space-y-3">
                {pricingRows.map((row, index) => (
                  <div key={row.id} className="premium-card p-4 flex flex-row items-center gap-4 relative group animate-in fade-in duration-300">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      {/* KGs */}
                      <div className="space-y-0.5">
                        <span className="label-caps opacity-60 text-[7px] mb-0">{t("kgs")}</span>
                        <input 
                          type="number" 
                          data-pricing-kgs={index}
                          className="input-field h-10 text-base font-black px-3" 
                          placeholder="0"
                          value={row.kgs || ""}
                          onChange={(e) => updatePricingRow(row.id, "kgs", Number(e.target.value))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const rateInput = document.querySelector(`input[data-pricing-rate="${index}"]`) as HTMLInputElement;
                              rateInput?.focus();
                            }
                          }}
                        />
                      </div>
                      {/* Rate */}
                      <div className="space-y-0.5">
                        <span className="label-caps opacity-60 text-[7px] mb-0">{isTe ? "ధర" : "RATE"}</span>
                        <input 
                          type="number" 
                          data-pricing-rate={index}
                          className="input-field h-10 text-base font-black px-3 border-accent/20 focus:border-accent focus:ring-accent/10" 
                          placeholder="0"
                          value={row.price || ""}
                          onChange={(e) => updatePricingRow(row.id, "price", Number(e.target.value))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (index === pricingRows.length - 1 && row.kgs > 0 && row.price > 0) {
                                addPricingRow();
                                setTimeout(() => {
                                  const nextKgsInput = document.querySelector(`input[data-pricing-kgs="${index + 1}"]`) as HTMLInputElement;
                                  nextKgsInput?.focus();
                                }, 100);
                              } else {
                                const nextKgsInput = document.querySelector(`input[data-pricing-kgs="${index + 1}"]`) as HTMLInputElement;
                                if (nextKgsInput) {
                                  nextKgsInput.focus();
                                } else {
                                  document.getElementById('sold-bags-input')?.focus();
                                }
                              }
                            }
                          }}
                        />
                      </div>

                      {/* Row Total - 1/3 Portion */}
                      <div className="bg-primary/5 dark:bg-primary/20 rounded-[12px] px-3 flex flex-col justify-center border border-primary/10">
                        <span className="label-caps opacity-60 text-[7px] text-primary mb-0">Total</span>
                        <span className="text-base font-black text-primary tabular-nums leading-tight">
                          ₹{Math.round(row.kgs * row.price).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => removePricingRow(row.id)}
                      className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 bg-slate-50 dark:bg-white/5 rounded-full active:scale-90 transition-all ml-1"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

             {/* Step 4: Outbound & Expenses */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="space-y-3">
                <span className="label-caps px-1">Step 4: Inventory Status</span>
                <div className="premium-card p-5 space-y-5">
                   <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">{t("soldBags")}</label>
                    <input 
                      type="number" 
                      id="sold-bags-input"
                      className="input-field h-12 text-lg font-black" 
                      value={soldBags || ""}
                      onChange={(e) => setSoldBags(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5">
                      <span className="label-caps text-[8px] opacity-60">Remaining Bags</span>
                      <p className={cn("text-xl font-black tabular-nums", remainingBags < 0 ? "text-rose-500" : "text-slate-800 dark:text-white")}>
                        {remainingBags}
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5">
                      <span className="label-caps text-[8px] opacity-60">Remaining KGs</span>
                      <p className={cn("text-xl font-black tabular-nums", remainingKgs < 0 ? "text-rose-500" : "text-slate-800 dark:text-white")}>
                        {remainingKgs}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="label-caps">{t("expenses")}</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => addExpense(t("transport"))} className="text-[9px] font-bold px-3 py-1 bg-slate-100 dark:bg-white/10 rounded-full text-slate-600 dark:text-slate-400 active:scale-95 transition-all">+ {t("transport")}</button>
                    <button type="button" onClick={() => addExpense(t("otherCharges"))} className="text-[9px] font-bold px-3 py-1 bg-slate-100 dark:bg-white/10 rounded-full text-slate-600 dark:text-slate-400 active:scale-95 transition-all uppercase">+ {t("other")}</button>
                  </div>
                </div>
                <div className="premium-card p-5 space-y-3.5">
                  {expenses.length === 0 ? (
                    <p className="text-xs font-medium text-slate-400 text-center py-5 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[16px]">No additional expenses added</p>
                  ) : (
                    expenses.map((exp) => (
                      <div key={exp.id} className="flex gap-2.5 items-center group">
                        <div className="flex-1 relative">
                           <span className="absolute left-4 top-1 text-[7px] font-black text-slate-300 uppercase tracking-widest">{exp.name}</span>
                          <input 
                            type="number" 
                            className="input-field h-12 pt-5 text-base font-black" 
                            placeholder="₹ 0"
                            value={exp.amount || ""}
                            onChange={(e) => updateExpense(exp.id, Number(e.target.value))}
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeExpense(exp.id)}
                          className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 bg-slate-50 dark:bg-white/5 rounded-xl active:scale-90 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>
             </div>

            {/* Final Sticky Checkout Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-2xl border-t border-slate-200 dark:border-white/5 z-50 animate-in fade-in">
              <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
                
                {/* Horizontal pricing summary */}
                <div className="flex-1 w-full overflow-x-auto scrollbar-hide">
                  <div className="flex items-center gap-4 min-w-max pr-12">
                    {groupedPricing.sort((a,b) => b.price - a.price).map((group, idx) => (
                      <div key={idx} className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{group.kgs} KGS @ ₹{group.price}</span>
                        <span className="text-base font-black text-slate-900 dark:text-white leading-none">₹{Math.round(group.kgs * group.price).toLocaleString()}</span>
                      </div>
                    ))}
                    {groupedPricing.length > 0 && <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2" />}
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest leading-none mb-1">Commission (10%)</span>
                      <span className="text-base font-black text-primary leading-none">₹{commissionAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col font-black">
                      <span className="text-[9px] font-black text-accent uppercase tracking-widest leading-none mb-1">Import Fee</span>
                      <span className="text-base font-black text-accent leading-none">₹{importChargeAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5 w-full md:w-auto">
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{t("grandTotal")}</span>
                    <span className="text-3xl font-extrabold text-slate-950 dark:text-white tabular-nums tracking-tighter">
                      ₹{Math.round(grandTotal).toLocaleString()}
                    </span>
                  </div>
                  <button 
                    type="button"
                    onClick={handleSubmit}
                    disabled={!farmerId || !vegetableId || totalSoldKgs <= 0 || success}
                    className={cn(
                      "btn-primary h-14 min-w-[180px] flex-1 md:flex-none text-lg rounded-[18px]",
                      success && "bg-emerald-500 shadow-emerald-500/20"
                    )}
                  >
                    {success ? <Check size={24} /> : null}
                    {success ? (isTe ? "సేవ్ చేయబడింది!" : "Saved!") : (editingStock ? t("save") : t("generateBill"))}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
