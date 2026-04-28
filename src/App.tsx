import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  LayoutDashboard, 
  Users, 
  Leaf, 
  FileText, 
  Settings as SettingsIcon,
  Plus,
  Globe,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import "./i18n";
import { useTheme } from "./hooks/useTheme";

import Dashboard from "./components/Dashboard";
import FarmerManagement from "./components/FarmerManagement";
import StockEntry from "./components/StockEntry";
import Bills from "./components/Bills";
import Settings from "./components/Settings";
import { useFarmitre } from "./hooks/useFarmitre";
import { cn } from "./lib/utils";
import { VegetableStock } from "./types";

type View = "dashboard" | "farmers" | "stock" | "bills" | "settings";

export default function App() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [editingStock, setEditingStock] = useState<VegetableStock | null>(null);

  const farmitre = useFarmitre();

  const handleEditStock = (stock: VegetableStock) => {
    setEditingStock(stock);
    setActiveView("stock");
  };

  const clearEditingStock = () => {
    setEditingStock(null);
  };

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { id: "farmers", icon: Users, label: t("farmers") },
    { id: "stock", icon: Leaf, label: t("stock") },
    { id: "bills", icon: FileText, label: t("bills") },
    { id: "settings", icon: SettingsIcon, label: t("settings") },
  ];

  const handleNavClick = (view: View) => {
    if (view !== "stock") {
      setEditingStock(null);
    }
    setActiveView(view);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-24 lg:pb-0 lg:pl-64 transition-colors duration-300">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white text-2xl">
            🌱
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-2xl font-black text-brand-950 dark:text-white uppercase tracking-tighter">GRR</span>
            <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest -mt-1">vegetables and onions</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as View)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left",
                activeView === item.id 
                  ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? t("light") : t("dark")}
          </button>
          <button 
            onClick={() => i18n.changeLanguage(i18n.language === "en" ? "te" : "en")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
          >
            <Globe size={16} />
            {i18n.language === "en" ? "తెలుగు" : "English"}
          </button>
        </div>
      </aside>

      {/* Header for Mobile */}
      <header className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-black text-brand-950 dark:text-white uppercase tracking-tighter">GRR</span>
            <span className="text-[8px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest -mt-1">vegetables and onions</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => i18n.changeLanguage(i18n.language === "en" ? "te" : "en")}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300"
          >
            <Globe size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeView === "dashboard" && <Dashboard farmitre={farmitre} />}
            {activeView === "farmers" && <FarmerManagement farmitre={farmitre} />}
            {activeView === "stock" && (
              <StockEntry 
                farmitre={farmitre} 
                editingStock={editingStock} 
                onComplete={clearEditingStock}
              />
            )}
            {activeView === "bills" && (
              <Bills 
                farmitre={farmitre} 
                onEditStock={handleEditStock}
              />
            )}
            {activeView === "settings" && <Settings farmitre={farmitre} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-50 flex justify-between items-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id as View)}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-xl transition-all flex-1",
              activeView === item.id 
                ? "text-brand-600 bg-brand-50/50" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <item.icon size={22} />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
