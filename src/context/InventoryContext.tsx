import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { FoodItem } from '../types';
import { PRODUCTS } from '../data/products';

interface InventoryContextType {
  products: FoodItem[];
  toggleStock: (productId: string) => Promise<void>;
  setStock: (productId: string, inStock: boolean) => Promise<void>;
  restockAll: () => Promise<void>;
  addProduct: (item: Omit<FoodItem, 'id'> & { id?: string }) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  updateProduct: (productId: string, updated: Partial<FoodItem>) => Promise<void>;
  resetToDefaultMenu: () => Promise<void>;
  getProductById: (productId: string) => FoodItem | undefined;
  inStockCount: number;
  outOfStockCount: number;
  isLoadingInventory: boolean;
  fetchProducts: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEY = 'allama_cloud_products_cache_v1';

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<FoodItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load products from cache', e);
    }
    return PRODUCTS;
  });

  const [isLoadingInventory, setIsLoadingInventory] = useState(true);

  // Parse product row from Supabase
  const parseProductRow = useCallback((row: any): FoodItem | null => {
    if (!row) return null;
    const p = row.data && typeof row.data === 'object' ? row.data : row;
    if (!p.name) return null;
    return {
      ...p,
      id: String(row.id || p.id),
      inStock: p.inStock ?? true,
    };
  }, []);

  // Fetch all products from Supabase 'products' table
  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        console.error('Failed to fetch products from Supabase:', error);
        setIsLoadingInventory(false);
        return;
      }

      // App Startup / Seed: If 'products' table is empty, seed it with default catalog items
      if (!data || data.length === 0) {
        console.log('Products table in Supabase is empty. Seeding with default catalog...');
        const seedRows = PRODUCTS.map((item) => ({
          id: item.id,
          data: item,
        }));

        const { error: seedError } = await supabase.from('products').insert(seedRows);
        if (seedError) {
          console.error('Failed to seed products into Supabase:', seedError);
        } else {
          setProducts(PRODUCTS);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(PRODUCTS));
          } catch {}
        }
        setIsLoadingInventory(false);
        return;
      }

      // Parse loaded rows
      const parsed: FoodItem[] = data
        .map((row: any) => parseProductRow(row))
        .filter((item): item is FoodItem => item !== null);

      if (parsed.length > 0) {
        setProducts(parsed);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        } catch {}
      }
    } catch (err) {
      console.error('Unexpected error during fetchProducts:', err);
    } finally {
      setIsLoadingInventory(false);
    }
  }, [parseProductRow]);

  // Initial load and Real-time listener on 'products' table
  useEffect(() => {
    let isMounted = true;

    fetchProducts();

    // Cross-Device Real-Time Sync: Subscribe to changes on 'products' table
    const channel = supabase
      .channel('products-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          if (isMounted) {
            fetchProducts();
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  // Updating / Out-of-Stock: Toggle an item's inStock state in Supabase
  const toggleStock = async (productId: string) => {
    const currentItem = products.find((p) => p.id === productId);
    if (!currentItem) return;

    const newInStock = !currentItem.inStock;
    const updatedItem: FoodItem = {
      ...currentItem,
      inStock: newInStock,
    };

    // Optimistically update local state
    setProducts((prev) =>
      prev.map((item) => (item.id === productId ? updatedItem : item))
    );

    try {
      const { error } = await supabase
        .from('products')
        .update({ data: updatedItem })
        .eq('id', productId);

      if (error) {
        console.error('Failed to update stock status in Supabase:', error);
      }
    } catch (err) {
      console.error('Error toggling product stock:', err);
    }
  };

  const setStock = async (productId: string, inStock: boolean) => {
    const currentItem = products.find((p) => p.id === productId);
    if (!currentItem) return;

    const updatedItem: FoodItem = {
      ...currentItem,
      inStock,
    };

    setProducts((prev) =>
      prev.map((item) => (item.id === productId ? updatedItem : item))
    );

    try {
      const { error } = await supabase
        .from('products')
        .update({ data: updatedItem })
        .eq('id', productId);

      if (error) {
        console.error('Failed to set stock in Supabase:', error);
      }
    } catch (err) {
      console.error('Error setting product stock:', err);
    }
  };

  const restockAll = async () => {
    const updatedProducts = products.map((item) => ({ ...item, inStock: true }));
    setProducts(updatedProducts);

    try {
      const updates = updatedProducts.map((item) => ({
        id: item.id,
        data: item,
      }));
      const { error } = await supabase.from('products').upsert(updates);
      if (error) {
        console.error('Failed to restockAll in Supabase:', error);
      }
    } catch (err) {
      console.error('Error in restockAll:', err);
    }
  };

  // Adding an Item: Insert into Supabase
  const addProduct = async (newItemData: Omit<FoodItem, 'id'> & { id?: string }) => {
    const newProduct: FoodItem = {
      ...newItemData,
      id: newItemData.id || `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      rating: newItemData.rating ?? 4.9,
      reviewsCount: newItemData.reviewsCount ?? 1,
      inStock: newItemData.inStock ?? true,
    };

    setProducts((prev) => [newProduct, ...prev]);

    try {
      const { error } = await supabase
        .from('products')
        .insert([{ id: newProduct.id, data: newProduct }]);

      if (error) {
        console.error('Failed to insert new product into Supabase:', error);
      }
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  // Deleting an Item: Delete from Supabase by ID
  const removeProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== productId));

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Failed to delete product from Supabase:', error);
      }
    } catch (err) {
      console.error('Error removing product:', err);
    }
  };

  const updateProduct = async (productId: string, updated: Partial<FoodItem>) => {
    const current = products.find((p) => p.id === productId);
    if (!current) return;

    const updatedItem: FoodItem = { ...current, ...updated };

    setProducts((prev) =>
      prev.map((item) => (item.id === productId ? updatedItem : item))
    );

    try {
      const { error } = await supabase
        .from('products')
        .update({ data: updatedItem })
        .eq('id', productId);

      if (error) {
        console.error('Failed to update product in Supabase:', error);
      }
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const resetToDefaultMenu = async () => {
    setProducts(PRODUCTS);

    try {
      // Clear current rows and seed default catalog
      await supabase.from('products').delete().neq('id', '___none___');
      const seedRows = PRODUCTS.map((item) => ({ id: item.id, data: item }));
      const { error } = await supabase.from('products').insert(seedRows);
      if (error) {
        console.error('Failed to reseed default menu in Supabase:', error);
      }
    } catch (err) {
      console.error('Error resetting default menu:', err);
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
        fetchProducts,
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
