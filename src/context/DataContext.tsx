import { createContext, useContext, useEffect, useState } from 'react';
import { fetchAllData } from '../lib/sheets';
import type { AppData } from '../types';

interface DataContextValue {
  data: AppData | null;
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextValue>({ data: null, loading: true, error: null });

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return <DataContext.Provider value={{ data, loading, error }}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
