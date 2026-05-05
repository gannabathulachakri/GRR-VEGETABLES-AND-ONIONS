import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { Farmer, VegetableStock } from "../types";

// Simple random id generator
const generateId = () => Math.random().toString(36).substr(2, 9);

export function useFarmitre() {
  const [farmers, setFarmers] = useLocalStorage<Farmer[]>("farmitre_farmers", []);
  const [stocks, setStocks] = useLocalStorage<VegetableStock[]>("farmitre_stocks", []);

  // Auto-delete records older than 48 hours
  useEffect(() => {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    
    const oldStockIds = stocks
      .filter(s => !s.createdAt || s.createdAt < fortyEightHoursAgo)
      .map(s => s.id);
      
    if (oldStockIds.length > 0) {
      setStocks(prev => prev.filter(s => !oldStockIds.includes(s.id)));
    }

    const oldFarmerIds = farmers
      .filter(f => !f.createdAt || f.createdAt < fortyEightHoursAgo)
      .map(f => f.id);

    if (oldFarmerIds.length > 0) {
      setFarmers(prev => prev.filter(f => !oldFarmerIds.includes(f.id)));
    }
  }, []);

  const addFarmer = (name: string, phone?: string) => {
    const newFarmer: Farmer = {
      id: generateId(),
      name,
      phone,
      createdAt: new Date().toISOString(),
    };
    setFarmers((prev) => [...prev, newFarmer]);
    return newFarmer;
  };

  const updateFarmer = (id: string, updates: Partial<Farmer>) => {
    setFarmers((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const deleteFarmer = (id: string) => {
    // Also delete associated stocks? Usually a good idea or at least warning. 
    // For now just delete the farmer.
    setFarmers((prev) => prev.filter((f) => f.id !== id));
    setStocks((prev) => prev.filter((s) => s.farmerId !== id));
  };

  const addStock = (data: Omit<VegetableStock, "id" | "createdAt">) => {
    const newStock: VegetableStock = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setStocks((prev) => [...prev, newStock]);
    return newStock;
  };

  const updateStock = (id: string, updates: Partial<VegetableStock>) => {
    setStocks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteStock = (id: string) => {
    setStocks((prev) => prev.filter((s) => s.id !== id));
  };

  const deleteStocks = (ids: string[]) => {
    setStocks((prev) => prev.filter((s) => !ids.includes(s.id)));
  };

  const getFarmerStocks = (farmerId: string) => {
    return stocks.filter((s) => s.farmerId === farmerId);
  };

  const calculateStockTotal = (stock: VegetableStock) => {
    const salesTotal = stock.pricingRows.reduce((acc, row) => acc + (row.kgs * row.price), 0);
    const commission = Math.round(salesTotal * 0.1);
    const importCharge = (stock.importedBags - (stock.oldBags || 0)) * 15;
    const extraExpenses = stock.expenses.reduce((acc, exp) => acc + exp.amount, 0);
    return salesTotal - (commission + importCharge + extraExpenses);
  };

  return {
    farmers,
    stocks,
    addFarmer,
    updateFarmer,
    deleteFarmer,
    addStock,
    updateStock,
    deleteStock,
    deleteStocks,
    getFarmerStocks,
    calculateStockTotal,
  };
};
