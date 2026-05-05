import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { UserPlus, User, Phone, ChevronRight, Search, Edit2, Trash2, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { Farmer } from "../types";

export default function FarmerManagement({ farmitre }: { farmitre: any }) {
  const { t } = useTranslation();
  const { farmers, addFarmer, updateFarmer, deleteFarmer } = farmitre;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingFarmer(null);
    setName("");
    setPhone("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    setName(farmer.name);
    setPhone(farmer.phone || "");
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (name.trim()) {
      if (editingFarmer) {
        updateFarmer(editingFarmer.id, { name, phone });
      } else {
        addFarmer(name, phone);
      }
      setName("");
      setPhone("");
      setIsModalOpen(false);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      deleteFarmer(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const handleModalDelete = () => {
    if (editingFarmer) {
      deleteFarmer(editingFarmer.id);
      setIsModalOpen(false);
    }
  };

  const filteredFarmers = farmers.filter((f: Farmer) => 
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="label-caps">Directory</span>
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{t("farmers")}</h2>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="btn-primary h-14 px-8 uppercase tracking-widest shadow-xl shadow-primary/20"
        >
          <UserPlus size={20} strokeWidth={2.5} />
          {t("addFarmer")}
        </button>
      </header>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" size={24} />
        <input 
          type="text" 
          placeholder={t("selectFarmer") + "..."}
          className="w-full h-16 pl-16 pr-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFarmers.length === 0 ? (
          <div className="col-span-full premium-card p-20 flex flex-col items-center justify-center text-center space-y-4 border-dashed bg-transparent">
             <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300">
                <User size={32} />
              </div>
              <div className="max-w-xs">
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No farmers found</p>
                <p className="text-sm text-slate-400 mt-1">Try a different search or add a new farmer.</p>
              </div>
          </div>
        ) : (
          filteredFarmers.map((farmer: Farmer) => (
            <motion.div 
              layout
              key={farmer.id} 
              onClick={() => handleOpenEdit(farmer)}
              className="premium-card p-6 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <User size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">
                    {farmer.name}
                  </h4>
                  {farmer.phone && (
                    <p className="text-sm text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                      <Phone size={12} className="opacity-60" />
                      {farmer.phone}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => handleDelete(farmer.id, e)}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90",
                    confirmDeleteId === farmer.id 
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
                      : "text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  )}
                >
                  {confirmDeleteId === farmer.id ? (
                     <CheckCircle2 size={16} />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
                <ChevronRight size={20} className="text-slate-200 dark:text-white/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal is further down */}

      {/* Add/Edit Farmer Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <span className="label-caps">Farmer Details</span>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {editingFarmer ? "Edit Farmer" : "New Farmer"}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t("farmerName")}</label>
                    <input 
                      type="text" 
                      className="w-full h-16 px-6 bg-slate-100 dark:bg-white/5 border-transparent rounded-2xl text-lg font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-primary/10 transition-all" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t("phone")}</label>
                    <input 
                      type="tel" 
                      className="w-full h-16 px-6 bg-slate-100 dark:bg-white/5 border-transparent rounded-2xl text-lg font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-primary/10 transition-all" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98XXX XXXXX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-10">
                  {editingFarmer ? (
                    <button 
                      onClick={handleModalDelete}
                      className="h-16 flex items-center justify-center text-rose-500 font-bold bg-rose-50 dark:bg-rose-500/10 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all active:scale-95"
                    >
                      <Trash2 size={24} className="mr-2" />
                      Delete
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="h-16 flex items-center justify-center text-slate-500 font-bold bg-slate-100 dark:bg-white/5 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95"
                    >
                      {t("cancel")}
                    </button>
                  )}
                  <button 
                    onClick={handleSave}
                    className="h-16 btn-primary shadow-xl shadow-primary/20 text-lg"
                  >
                    {t("save")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
