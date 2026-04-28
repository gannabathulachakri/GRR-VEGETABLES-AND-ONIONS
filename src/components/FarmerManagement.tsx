import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { UserPlus, User, Phone, ChevronRight, Search, Edit2, Trash2 } from "lucide-react";
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
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t("farmers")}</h2>
          <p className="text-slate-500">{farmers.length} {t("totalFarmers")}</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-brand-600 text-white p-3 rounded-xl shadow-lg shadow-brand-200 active:scale-95 transition-all"
        >
          <UserPlus size={24} />
        </button>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder={t("selectFarmer") + "..."}
          className="input-field pl-12"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filteredFarmers.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            {t("noFarmersFound")}
          </div>
        ) : (
          filteredFarmers.map((farmer: Farmer) => (
            <div 
              key={farmer.id} 
              onClick={() => handleOpenEdit(farmer)}
              className="glass-card p-4 flex items-center justify-between active:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {farmer.name}
                  </h4>
                  {farmer.phone && (
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Phone size={12} />
                      {farmer.phone}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => handleDelete(farmer.id, e)}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    confirmDeleteId === farmer.id 
                      ? "bg-rose-500 text-white animate-pulse" 
                      : "text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                  )}
                >
                  {confirmDeleteId === farmer.id ? (
                    <span className="text-[10px] font-bold uppercase">{t("save") === "Save" ? "Confirm" : "నిర్ధారించు"}</span>
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
                <Edit2 size={18} className="text-slate-300 group-hover:text-brand-400 transition-colors ml-1" />
                <ChevronRight size={20} className="text-slate-300" />
              </div>
            </div>
          ))
        )}
      </div>

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
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-8 space-y-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-slate-800">
                {editingFarmer ? t("settings") : t("addFarmer")}
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">{t("farmerName")}</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">{t("phone")}</label>
                  <input 
                    type="tel" 
                    className="input-field" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98XXX XXXXX"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                {editingFarmer && (
                  <button 
                    onClick={handleModalDelete}
                    className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete Farmer"
                  >
                    <Trash2 size={24} />
                  </button>
                )}
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  {t("cancel")}
                </button>
                <button 
                  onClick={handleSave}
                  className="btn-primary flex-1"
                >
                  {t("save")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
