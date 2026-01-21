'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import ProductImage from './ProductImage';

// Компонент для загрузки изображения через API endpoint
function ProductImageLoader({ apiUrl, alt }: { apiUrl: string; alt: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && apiUrl.includes('/api/products/images')) {
      fetch(apiUrl)
        .then(res => res.json())
        .then((data: unknown) => {
          const response = data as { mainImage?: unknown; images?: unknown };
          if (typeof response.mainImage === 'string') {
            setImageUrl(response.mainImage);
          } else if (Array.isArray(response.images) && response.images.length > 0 && typeof response.images[0] === 'string') {
            setImageUrl(response.images[0]);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [apiUrl, mounted]);

  // На сервере всегда показываем placeholder
  if (!mounted || loading || !imageUrl) {
    return (
      <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-card-bg-start to-card-bg-end border border-card-border flex items-center justify-center" suppressHydrationWarning>
        {mounted && loading && (
          <div className="w-8 h-8 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
        )}
      </div>
    );
  }

  return (
    <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-card-bg-start to-card-bg-end border border-card-border" suppressHydrationWarning>
      <ProductImage
        src={imageUrl}
        alt={alt}
        className="w-full h-full"
      />
    </div>
  );
}

interface SearchSuggestion {
  id: string;
  type: 'product' | 'category';
  title: string;
  slug: string;
  brand?: string;
  imageUrl?: string;
}

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animated placeholder
  const placeholderOptions = ['Dyson', 'iPhone', 'Apple Watch', 'iPad', 'AirPods'];
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [placeholderText, setPlaceholderText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentOption = placeholderOptions[currentPlaceholderIndex];

    if (!isDeleting) {
      // Typing
      if (placeholderText.length < currentOption.length) {
        timeout = setTimeout(() => {
          setPlaceholderText(currentOption.slice(0, placeholderText.length + 1));
        }, 100);
      } else {
        // Finished typing, wait then start deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      // Deleting
      if (placeholderText.length > 0) {
        timeout = setTimeout(() => {
          setPlaceholderText(placeholderText.slice(0, -1));
        }, 50);
      } else {
        // Finished deleting, move to next option
        setIsDeleting(false);
        setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholderOptions.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [placeholderText, isDeleting, currentPlaceholderIndex, placeholderOptions]);

  // Search suggestions
  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, 300);

  useEffect(() => {
    if (query) {
      setIsTyping(true);
      debouncedSearch(query);
      const timeout = setTimeout(() => setIsTyping(false), 300);
      return () => clearTimeout(timeout);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsTyping(false);
    }
  }, [query, debouncedSearch]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product') {
      router.push(`/products/${suggestion.slug}`);
    } else {
      router.push(`/catalog?category=${suggestion.slug}`);
    }
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-4xl mx-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={query ? '' : placeholderText + '|'}
            className="w-full px-4 py-2.5 pl-10 pr-12 rounded-button bg-background border border-card-border text-foreground placeholder:text-white placeholder:font-mono focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all duration-250"
          />
          
          {/* Search icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="9" r="6" />
              <path d="m15 15-3-3" />
            </svg>
          </div>

          {/* Loading indicator */}
          {isTyping && query && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
            </div>
          )}

          {/* Clear button */}
          {query && !isTyping && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-neon-green transition-colors duration-250"
              aria-label="Löschen"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="5" x2="15" y2="15" />
                <line x1="15" y1="5" x2="5" y2="15" />
              </svg>
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-card-bg-start to-card-bg-end border border-card-border rounded-card shadow-card-hover max-h-96 overflow-y-auto z-50">
            <div className="p-2">
              {suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  type="button"
                  onClick={() => handleSelect(suggestion)}
                  className="w-full text-left px-4 py-3 rounded-button hover:bg-neon-green/10 hover:text-neon-green transition-all duration-250 group"
                  suppressHydrationWarning
                >
                  <div className="flex items-center gap-3" suppressHydrationWarning>
                    {suggestion.type === 'product' ? (
                      suggestion.imageUrl && !suggestion.imageUrl.includes('/api/products/images') ? (
                        // Прямой URL к изображению
                        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-card-bg-start to-card-bg-end border border-card-border" suppressHydrationWarning>
                          <ProductImage
                            src={suggestion.imageUrl}
                            alt={suggestion.title}
                            className="w-full h-full"
                          />
                        </div>
                      ) : suggestion.imageUrl ? (
                        // API endpoint - загружаем JSON и получаем mainImage
                        <ProductImageLoader
                          apiUrl={suggestion.imageUrl}
                          alt={suggestion.title}
                        />
                      ) : (
                        <span className="text-text-muted group-hover:text-neon-green transition-colors duration-250 flex-shrink-0" suppressHydrationWarning>
                          📦
                        </span>
                      )
                    ) : (
                      <span className="text-text-muted group-hover:text-neon-green transition-colors duration-250 flex-shrink-0" suppressHydrationWarning>
                        📁
                      </span>
                    )}
                    <div className="flex-1 min-w-0" suppressHydrationWarning>
                      <div className="font-medium truncate">{suggestion.title}</div>
                      {suggestion.brand && (
                        <div className="text-sm text-text-muted">{suggestion.brand}</div>
                      )}
                    </div>
                    <span className="text-text-muted group-hover:text-neon-green transition-colors duration-250 opacity-0 group-hover:opacity-100 flex-shrink-0" suppressHydrationWarning>
                      →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
