import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { FoodItem } from '../types';
import { PRODUCTS } from '../data/products';

interface InventoryContextType {
  products: FoodItem[];
  toggleStock: (productId: string) => Promise<void>;
  setStock: (productId: string, inStock: boolean) => Promise<void>;
  restockAll: () => Promise<void>;
  addProduct: (item: Omit<FoodItem, 'id'> & { id?: string }) => void;
  removeProduct: (productId: string) => void;
  updateProduct: (productId: string, updated: Partial<FoodItem>) => void;
  resetToDefaultMenu: () => Promise<void>;
  getProductById: (productId: string) => FoodItem | undefined;
  inStockCount: number;
  outOfStockCount: number;
  isLoadingInventory: boolean;
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

  const [isLoadingInventory, setIsLoadingInventory] = useState(true);

  // Helper to update local item stock state
  const updateItemStockLocally = useCallback((productId: string, isOutOfStock: boolean) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, inStock: !isOutOfStock } : item
      )
    );
  }, []);

  // 1. Sync on App Load: Fetch all inventory overrides from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadInventoryFromSupabase() {
      try {
        const { data, error } = await supabase.from('inventory').select('*');
        if (error) {
          console.error('Failed to fetch inventory from Supabase:', error);
          return;
        }

        if (data && Array.isArray(data) && isMounted) {
          const stockMap = new Map<string, boolean>();
          data.forEach((row: any) => {
            if (row && row.id) {
              stockMap.set(row.id, Boolean(row.is_out_of_stock));
            }
          });

          setProducts((prev) =>
            prev.map((item) => {
              if (stockMap.has(item.id)) {
                const isOutOfStock = stockMap.get(item.id)!;
                return { ...item, inStock: !isOutOfStock };
              }
              return item;
            })
          );
        }
      } catch (err) {
        console.error('Unexpected error loading Supabase inventory:', err);
      } finally {
        if (isMounted) {
          setIsLoadingInventory(false);
        }
      }
    }

    loadInventoryFromSupabase();

    // 2. Real-Time Customer & Admin Listener:
    // Listen to postgres_changes on the 'inventory' table
    const channel = supabase
      .channel('inventory-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        (payload: any) => {
          if (!isMounted) return;

          if (payload?.eventType === 'DELETE' && payload.old?.id) {
            updateItemStockLocally(payload.old.id, false);
          } else if (payload?.new && payload.new.id) {
            updateItemStockLocally(payload.new.id, Boolean(payload.new.is_out_of_stock));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [updateItemStockLocally]);

  // Keep localStorage as local offline backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save inventory to storage', e);
    }
  }, [products]);

  // 3. Admin Toggle Action:
  // Upsert the change directly into Supabase ('inventory' table)
  const toggleStock = async (productId: string) => {
    const currentItem = products.find((p) => p.id === productId);
    const currentlyInStock = currentItem ? currentItem.inStock : true;
    const newInStock = !currentlyInStock;
    const newStatus = !newInStock; // is_out_of_stock: true when out of stock

    // Optimistically update local state immediately
    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, inStock: newInStock } : item
      )
    );

    try {
      const { error } = await supabase.from('inventory').upsert({
        id: productId,
        is_out_of_stock: newStatus,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Supabase upsert inventory stock error:', error);
      }
    } catch (err) {
      console.error('Failed to upsert inventory stock in Supabase:', err);
    }
  };

  const setStock = async (productId: string, inStock: boolean) => {
    const newStatus = !inStock; // is_out_of_stock

    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, inStock } : item
      )
    );

    try {
      const { error } = await supabase.from('inventory').upsert({
        id: productId,
        is_out_of_stock: newStatus,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Supabase setStock error:', error);
      }
    } catch (err) {
      console.error('Failed to set stock in Supabase:', err);
    }
  };

  const restockAll = async () => {
    setProducts((prev) => prev.map((item) => ({ ...item, inStock: true })));

    try {
      const updates = products.map((item) => ({
        id: item.id,
        is_out_of_stock: false,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('inventory').upsert(updates);
      if (error) {
        console.error('Supabase restockAll error:', error);
      }
    } catch (err) {
      console.error('Failed to restockAll in Supabase:', err);
    }
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

  const resetToDefaultMenu = async () => {
    setProducts(PRODUCTS);
    try {
      const updates = PRODUCTS.map((item) => ({
        id: item.id,
        is_out_of_stock: false,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from('inventory').upsert(updates);
    } catch (err) {
      console.error('Failed to reset default menu in Supabase:', err);
    }
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
        isLoadingInventory,
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
