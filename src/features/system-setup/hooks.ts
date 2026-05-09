import { useCallback, useEffect, useState } from 'react';
import { loadSystemSetupData } from './api';
import type { SystemSetupData } from './types';

const EMPTY_SYSTEM_SETUP_DATA: SystemSetupData = {
  events: [],
  activations: [],
  expenses: [],
  operations: [],
  suppliers: [],
  inventory: [],
  clients: [],
};

export function useSystemSetupData() {
  const [data, setData] = useState<SystemSetupData>(EMPTY_SYSTEM_SETUP_DATA);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(await loadSystemSetupData());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, setData, loading, refresh };
}
