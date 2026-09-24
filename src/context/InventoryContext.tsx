import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem } from '../types';
import { PRODUCTS } from '../data/products';

interface InventoryContextType {
  products: FoodItem[];
  toggleStock: (productId: string) => void;
  setStock: (productId: string, inStock: boolean) => void;
  restockAll: () => void;
  addProduct: (item: Omit<FoodItem, 'id'> & { id?: string }) => void;
  removeProduct: (productId: string) => void;
  updateProduct: (productId: string, updated: Partial<FoodItem>) => void;
  resetToDefaultMenu: () => void;
  getProductById: (productId: string) => FoodItem | undefined;
  inStockCount: number;
  outOfStockCount: number;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEY = 'allama_inventory_v5';

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<FoodItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) 
        || localStorage.getItem('allama_inventory_v4') 
        || localStorage.getItem('allama_inventory_v3')
        || localStorage.getItem('allama_inventory_v2');

      if (saved) {
        const parsed: FoodItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sync default product images and descriptions from PRODUCTS (e.g. actual sealed packet images)
          const defaultProductsMap = new Map(PRODUCTS.map(p => [p.id, p]));
          return parsed.map(item => {
            const defaultItem = defaultProductsMap.get(item.id);
            if (defaultItem) {
              return {
                ...item,
                image: defaultItem.image,
                tag: defaultItem.tag,
                description: defaultItem.description,
                prepTime: defaultItem.prepTime,
              };
            }
            return item;
          });
        }
      }
    } catch (e) {
      console.error('Failed to load inventory from storage', e);
    }
    return PRODUCTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save inventory to storage', e);
    }
  }, [products]);

  const toggleStock = (productId: string) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, inStock: !item.inStock } : item
      )
    );
  };

  const setStock = (productId: string, inStock: boolean) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, inStock } : item
      )
    );
  };

  const restockAll = () => {
    setProducts((prev) => prev.map((item) => ({ ...item, inStock: true })));
  };

  const addProduct = (newItemData: Omit<FoodItem, 'id'> & { id?: string }) => {
    const newProduct: FoodItem = {
      ...newItemData,
      id: newItemData.id || `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      rating: newItemData.rating ?? 4.9,
      reviewsCount: newItemData.reviewsCount ?? 1,
      inStock: newItemData.inStock ?? true,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const removeProduct = (productId: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateProduct = (productId: string, updated: Partial<FoodItem>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, ...updated } : item))
    );
  };

  const resetToDefaultMenu = () => {
    setProducts(PRODUCTS);
  };

  const getProductById = (productId: string) => {
    return products.find((p) => p.id === productId);
  };

  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = products.length - inStockCount;

  return (
    <InventoryContext.Provider
      value={{
        products,
        toggleStock,
        setStock,
        restockAll,
        addProduct,
        removeProduct,
        updateProduct,
        resetToDefaultMenu,
        getProductById,
        inStockCount,
        outOfStockCount,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
