import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { soundFx } from '../utils/sound';

interface StoreStatusContextType {
  isTakingOrders: boolean;
  setIsTakingOrders: (isOpen: boolean) => Promise<void>;
  isLoadingStatus: boolean;
}

const StoreStatusContext = createContext<StoreStatusContextType | undefined>(undefined);

const STORAGE_KEY = 'allama_store_taking_orders';

export const StoreStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTakingOrders, setIsTakingOrdersState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // ignore
    }
    return true; // Default open
  });
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Fetch initial operating status from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('id', { ascending: false })
          .limit(20);

        if (!error && data && data.length > 0) {
          // Find the most recent store settings row
          const settingRow = data.find((r: any) => {
            const p = r.data && typeof r.data === 'object' ? r.data : r;
            return p.isStoreSettings === true || p.type === 'store_status';
          });

          if (settingRow) {
            const p = settingRow.data && typeof settingRow.data === 'object' ? settingRow.data : settingRow;
            const open = Boolean(p.isTakingOrders ?? p.isOpen);
            if (isMounted) {
              setIsTakingOrdersState(open);
              try {
                localStorage.setItem(STORAGE_KEY, String(open));
              } catch {
                // ignore
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load store operating status:', err);
      } finally {
        if (isMounted) setIsLoadingStatus(false);
      }
    }

    loadStatus();

    // Subscribe to live Postgres changes and Realtime Broadcast
    const channel = supabase.channel('store-operating-channel');

    channel
      .on('broadcast', { event: 'store_status_changed' }, ({ payload }) => {
        if (payload && typeof payload.isOpen === 'boolean') {
          setIsTakingOrdersState(payload.isOpen);
          try {
            localStorage.setItem(STORAGE_KEY, String(payload.isOpen));
          } catch {
            // ignore
          }
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const row = payload.new as any;
        const p = row?.data && typeof row.data === 'object' ? row.data : row;
        if (p?.isStoreSettings === true || p?.type === 'store_status') {
          const open = Boolean(p.isTakingOrders ?? p.isOpen);
          setIsTakingOrdersState(open);
          try {
            localStorage.setItem(STORAGE_KEY, String(open));
          } catch {
            // ignore
          }
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const setIsTakingOrders = async (isOpen: boolean) => {
    setIsTakingOrdersState(isOpen);
    try {
      localStorage.setItem(STORAGE_KEY, String(isOpen));
    } catch {
      // ignore
    }

    if (isOpen) {
      soundFx.playSuccess();
    } else {
      soundFx.playDoorKnock();
    }

    // 1. Broadcast immediately to all active tabs and devices
    try {
      const channel = supabase.channel('store-operating-channel');
      await channel.send({
        type: 'broadcast',
        event: 'store_status_changed',
        payload: { isOpen, timestamp: new Date().toISOString() }
      });
    } catch (err) {
      console.warn('Realtime broadcast status error:', err);
    }

    // 2. Persist to Supabase orders table as system configuration record
    try {
      await supabase.from('orders').insert([{
        data: {
          isStoreSettings: true,
          type: 'store_status',
          isTakingOrders: isOpen,
          updatedAt: new Date().toISOString(),
        }
      }]);
    } catch (err) {
      console.error('Failed to persist store status to Supabase:', err);
    }
  };

  return (
    <StoreStatusContext.Provider value={{ isTakingOrders, setIsTakingOrders, isLoadingStatus }}>
      {children}
    </StoreStatusContext.Provider>
  );
};

export const useStoreStatus = () => {
  const context = useContext(StoreStatusContext);
  if (!context) {
    throw new Error('useStoreStatus must be used within a StoreStatusProvider');
  }
  return context;
};
