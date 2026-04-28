import { useTranslation } from "react-i18next";
import { Globe, Info, Shield, Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export default function Settings({ farmitre }: { farmitre: any }) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t("settings")}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t("configureApp")}</p>
      </header>

      <div className="space-y-4">
        {/* Theme Preference */}
        <section className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-xl">
                {theme === "dark" ? <Moon size={24} /> : <Sun size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">{t("appearance")}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("chooseAppearance")}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => theme === "dark" && toggleTheme()}
              className={`p-4 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-2 ${
                theme === "light" 
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20" 
                  : "border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900"
              }`}
            >
              <Sun size={20} />
              {t("light")}
            </button>
            <button 
              onClick={() => theme === "light" && toggleTheme()}
              className={`p-4 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-2 ${
                theme === "dark" 
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20" 
                  : "border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900"
              }`}
            >
              <Moon size={20} />
              {t("dark")}
            </button>
          </div>
        </section>

        {/* Language Preference */}
        <section className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">{t("language")}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("chooseLanguage")}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => i18n.changeLanguage("en")}
              className={`p-4 rounded-xl border-2 font-bold transition-all ${
                i18n.language === "en" 
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20" 
                  : "border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900"
              }`}
            >
              English
            </button>
            <button 
              onClick={() => i18n.changeLanguage("te")}
              className={`p-4 rounded-xl border-2 font-bold transition-all ${
                i18n.language === "te" 
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20" 
                  : "border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900"
              }`}
            >
              తెలుగు
            </button>
          </div>
        </section>

        {/* Info & Support */}
        <div className="space-y-3">
          <div className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                <Shield size={20} />
              </div>
              <span className="font-medium text-slate-700">{t("dataPrivacy")}</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase">Local Storage</span>
          </div>

          <div className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                <Info size={20} />
              </div>
              <span className="font-medium text-slate-700">{t("appVersion")}</span>
            </div>
            <span className="text-sm text-slate-400 font-medium">v1.2.0</span>
          </div>
        </div>

        <div className="pt-6 text-center">
          <div className="text-xs text-slate-400">
            {t("designedBy")}{" "}
            <a 
              href="https://chakrigannabathulaportfolio-pi.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand-600 font-bold hover:underline"
            >
              Chakri Gannabathula
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
