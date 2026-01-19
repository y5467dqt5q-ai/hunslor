'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface FilterOptions {
  categories: { id: string; name: string; slug: string }[];
  brands: string[];
  colors: string[];
  memories: string[];
  sizes: string[];
  minPrice: number;
  maxPrice: number;
}

interface ProductFiltersProps {
  options: FilterOptions;
}

export default function ProductFilters({ options }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [priceRange, setPriceRange] = useState({
    min: parseInt(searchParams.get('minPrice') || '0'),
    max: parseInt(searchParams.get('maxPrice') || String(options.maxPrice)),
  });
  const [selectedColors, setSelectedColors] = useState<string[]>(
    searchParams.get('colors')?.split(',').filter(Boolean) || []
  );
  const [selectedMemories, setSelectedMemories] = useState<string[]>(
    searchParams.get('memories')?.split(',').filter(Boolean) || []
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    searchParams.get('sizes')?.split(',').filter(Boolean) || []
  );
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');

  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedBrand) params.set('brand', selectedBrand);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (priceRange.min > 0) params.set('minPrice', String(priceRange.min));
    if (priceRange.max < options.maxPrice) params.set('maxPrice', String(priceRange.max));
    if (selectedColors.length > 0) params.set('colors', selectedColors.join(','));
    if (selectedMemories.length > 0) params.set('memories', selectedMemories.join(','));
    if (selectedSizes.length > 0) params.set('sizes', selectedSizes.join(','));
    if (inStock) params.set('inStock', 'true');

    router.push(`/catalog?${params.toString()}`, { scroll: false });
  }, [selectedCategory, selectedBrand, searchQuery, priceRange, selectedColors, selectedMemories, selectedSizes, inStock, router, options.maxPrice]);

  const debouncedUpdateURL = useDebouncedCallback(updateURL, 300);

  useEffect(() => {
    debouncedUpdateURL();
  }, [debouncedUpdateURL]);

  const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSearchQuery('');
    setPriceRange({ min: 0, max: options.maxPrice });
    setSelectedColors([]);
    setSelectedMemories([]);
    setSelectedSizes([]);
    setInStock(false);
    router.push('/catalog', { scroll: false });
  };

  return (
    <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Filter</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-neon-green hover:text-neon-green-dark transition-colors duration-250"
        >
          Zurücksetzen
        </button>
      </div>

      {/* Suche */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-text-muted">Suche</h3>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Produkt suchen..."
          className="w-full px-3 py-2 bg-card-bg-start border border-card-border rounded-lg text-sm text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-neon-green"
        />
      </div>

      {/* Kategorie */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-text-muted">Kategorie</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {options.categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="category"
                value={cat.slug}
                checked={selectedCategory === cat.slug}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCategory(value);
                  // Сбрасываем поиск при смене категории
                  if (searchQuery) setSearchQuery('');

                  // Немедленно обновляем URL, чтобы продукты реагировали на клик
                  const params = new URLSearchParams();
                  if (value) params.set('category', value);
                  if (selectedBrand) params.set('brand', selectedBrand);
                  if (priceRange.min > 0) params.set('minPrice', String(priceRange.min));
                  if (priceRange.max < options.maxPrice) params.set('maxPrice', String(priceRange.max));
                  if (selectedColors.length > 0) params.set('colors', selectedColors.join(','));
                  if (selectedMemories.length > 0) params.set('memories', selectedMemories.join(','));
                  if (selectedSizes.length > 0) params.set('sizes', selectedSizes.join(','));
                  if (inStock) params.set('inStock', 'true');

                  router.push(`/catalog?${params.toString()}`, { scroll: false });
                }}
                className="w-4 h-4 text-neon-green border-card-border focus:ring-neon-green focus:ring-2"
              />
              <span className="text-sm group-hover:text-neon-green transition-colors duration-250">
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Marke */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-text-muted">Marke</h3>
        <div className="space-y-2">
          {options.brands.map((brand) => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="brand"
                value={brand}
                checked={selectedBrand === brand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-4 h-4 text-neon-green border-card-border focus:ring-neon-green focus:ring-2"
              />
              <span className="text-sm group-hover:text-neon-green transition-colors duration-250">
                {brand}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Preis */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-text-muted">
          Preis: {priceRange.min} € - {priceRange.max} €
        </h3>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max={options.maxPrice}
            value={priceRange.min}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setPriceRange((prev) => ({ ...prev, min: value }));
              debouncedUpdateURL();
            }}
            className="w-full h-2 bg-card-border rounded-lg appearance-none cursor-pointer accent-neon-green"
          />
          <input
            type="range"
            min="0"
            max={options.maxPrice}
            value={priceRange.max}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setPriceRange((prev) => ({ ...prev, max: value }));
              debouncedUpdateURL();
            }}
            className="w-full h-2 bg-card-border rounded-lg appearance-none cursor-pointer accent-neon-green"
          />
        </div>
      </div>

      {/* Farbe */}
      {options.colors.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 text-text-muted">Farbe</h3>
          <div className="space-y-2">
            {options.colors.map((color) => (
              <label key={color} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedColors.includes(color)}
                  onChange={() => toggleArrayItem(selectedColors, setSelectedColors, color)}
                  className="w-4 h-4 text-neon-green border-card-border focus:ring-neon-green focus:ring-2 rounded"
                />
                <span className="text-sm group-hover:text-neon-green transition-colors duration-250">
                  {color}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Speicher */}
      {options.memories.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 text-text-muted">Speicher</h3>
          <div className="space-y-2">
            {options.memories.map((memory) => (
              <label key={memory} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedMemories.includes(memory)}
                  onChange={() => toggleArrayItem(selectedMemories, setSelectedMemories, memory)}
                  className="w-4 h-4 text-neon-green border-card-border focus:ring-neon-green focus:ring-2 rounded"
                />
                <span className="text-sm group-hover:text-neon-green transition-colors duration-250">
                  {memory}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Größe */}
      {options.sizes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 text-text-muted">Größe</h3>
          <div className="space-y-2">
            {options.sizes.map((size) => (
              <label key={size} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(size)}
                  onChange={() => toggleArrayItem(selectedSizes, setSelectedSizes, size)}
                  className="w-4 h-4 text-neon-green border-card-border focus:ring-neon-green focus:ring-2 rounded"
                />
                <span className="text-sm group-hover:text-neon-green transition-colors duration-250">
                  {size}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Verfügbarkeit */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="w-4 h-4 text-neon-green border-card-border focus:ring-neon-green focus:ring-2 rounded"
          />
          <span className="text-sm group-hover:text-neon-green transition-colors duration-250">
            Nur verfügbare Artikel
          </span>
        </label>
      </div>
    </div>
  );
}
