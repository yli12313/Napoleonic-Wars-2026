import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_FILTERS,
  filtersFromSearch,
  filtersToSearch,
  isDefaultFilters,
  type FilterState,
} from '../lib/filters';

/**
 * Filter state that round-trips through the query string, so any filtered view
 * can be linked and survives a reload.
 */
export function useFilterState(campaigns: string[]) {
  const campaignsRef = useRef(campaigns);
  campaignsRef.current = campaigns;

  const [filters, setFilters] = useState<FilterState>(() =>
    typeof window === 'undefined'
      ? DEFAULT_FILTERS
      : filtersFromSearch(window.location.search, campaigns),
  );

  // Write to the URL without adding history entries on every keystroke.
  useEffect(() => {
    const search = filtersToSearch(filters);
    const next = `${window.location.pathname}${search}${window.location.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next !== current) window.history.replaceState(null, '', next);
  }, [filters]);

  // Back/forward should restore the view they captured.
  useEffect(() => {
    const onPop = () => setFilters(filtersFromSearch(window.location.search, campaignsRef.current));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const update = useCallback((updater: (f: FilterState) => FilterState) => {
    setFilters((f) => updater(f));
  }, []);

  const clear = useCallback(() => setFilters({ ...DEFAULT_FILTERS }), []);

  return { filters, update, clear, dirty: !isDefaultFilters(filters) };
}
