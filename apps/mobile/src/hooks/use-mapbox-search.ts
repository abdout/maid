import { useState, useCallback, useRef } from 'react';
import { searchPlaces, type MapboxFeature } from '@/lib/mapbox';
import { useDebounce } from './use-debounce';

interface UseMapboxSearchResult {
  query: string;
  setQuery: (query: string) => void;
  results: MapboxFeature[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
}

export function useMapboxSearch(debounceMs = 300): UseMapboxSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MapboxFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track latest query to prevent stale results
  const latestQueryRef = useRef('');

  const debouncedQuery = useDebounce(query, debounceMs);

  const search = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    latestQueryRef.current = trimmed;

    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const features = await searchPlaces(trimmed);

      // Only update if this is still the latest query
      if (latestQueryRef.current === trimmed) {
        setResults(features);
      }
    } catch (err) {
      if (latestQueryRef.current === trimmed) {
        setError('Search failed. Please try again.');
        setResults([]);
      }
    } finally {
      if (latestQueryRef.current === trimmed) {
        setLoading(false);
      }
    }
  }, []);

  // Auto-search when debounced query changes
  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    if (newQuery.trim().length >= 2) {
      search(newQuery);
    } else {
      setResults([]);
    }
  }, [search]);

  const clearResults = useCallback(() => {
    setResults([]);
    setQuery('');
    setError(null);
    latestQueryRef.current = '';
  }, []);

  return {
    query,
    setQuery: handleQueryChange,
    results,
    loading,
    error,
    search,
    clearResults,
  };
}
