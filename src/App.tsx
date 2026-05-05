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
    <div className="min-h-screen bg-[#FBFBFB] dark:bg-[#0A0A0A] flex flex-col pb-24 lg:pb-0 lg:pl-72 transition-colors duration-500">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#111] border-r border-slate-200/60 dark:border-white/5 z-50">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 bg-primary rounded-[14px] flex items-center justify-center text-white text-2xl shadow-lg shadow-primary/20">
              🌱
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                {t("appName").split(' ')[1] || t("appName")}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Farmite Platform
              </span>
            </div>
          </div>
          
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as View)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-[14px] font-bold transition-all text-left group",
                    isActive 
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/10" 
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                  )}
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={cn("transition-transform group-active:scale-90", isActive ? "text-primary" : "")} />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-3">
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-white/5 rounded-[16px] border border-slate-200/50 dark:border-white/5">
            <button 
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center py-2.5 rounded-[10px] transition-all hover:bg-white dark:hover:bg-white/10 hover:shadow-sm"
              title={theme === "dark" ? t("light") : t("dark")}
            >
              {theme === "dark" ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-slate-600" />}
            </button>
            <div className="w-px h-4 bg-slate-200 dark:bg-white/10" />
            <button 
              onClick={() => i18n.changeLanguage(i18n.language === "en" ? "te" : "en")}
              className="flex-1 flex items-center justify-center py-2.5 rounded-[10px] transition-all hover:bg-white dark:hover:bg-white/10 hover:shadow-sm text-xs font-bold text-slate-600 dark:text-slate-400"
            >
              {i18n.language === "en" ? "TE" : "EN"}
            </button>
          </div>
        </div>
      </aside>

      {/* Header for Mobile */}
      <header className="lg:hidden bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
           <div className="w-9 h-9 bg-primary rounded-[10px] flex items-center justify-center text-lg shadow-lg shadow-primary/20">
            🌱
          </div>
          <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
             {t("appName").split(' ')[1] || t("appName")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => i18n.changeLanguage(i18n.language === "en" ? "te" : "en")}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-white/10 rounded-full text-xs font-black text-slate-600 dark:text-slate-400 active:scale-90 transition-transform"
          >
            {i18n.language === "en" ? "TE" : "EN"}
          </button>
           <button 
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-white/10 rounded-full text-slate-600 dark:text-slate-400 active:scale-90 transition-transform"
          >
            {theme === "dark" ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 w-full max-w-[1400px] mx-auto animate-slide-up">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 bg-[#111] dark:bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.1)] rounded-[24px] p-2 z-50 flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as View)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-[18px] transition-all flex-1 min-w-0 active:scale-90",
                isActive 
                  ? "text-primary bg-white/10 dark:bg-slate-900/10" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-[9px] mt-1 font-bold uppercase tracking-tighter opacity-0 scale-50 h-0 overflow-hidden transition-all duration-300", isActive ? "opacity-100 scale-100 h-auto mt-1" : "")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
