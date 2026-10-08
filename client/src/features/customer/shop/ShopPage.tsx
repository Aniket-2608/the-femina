import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetProductsQuery, useGetTaxonomyQuery } from '../../../store/api/apiSlice.js';
import { ProductCard } from '../../../components/display/ProductCard.js';
import { Button } from '../../../components/common/Button.js';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Search,
} from 'lucide-react';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Local Filter States initialized from URL params
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>(
    searchParams.getAll('fabric').length ? searchParams.getAll('fabric') : []
  );
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(
    searchParams.getAll('occasion').length ? searchParams.getAll('occasion') : []
  );
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>(
    searchParams.getAll('workType').length ? searchParams.getAll('workType') : []
  );
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'recommended');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Synchronize state when searchParams change externally
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSearchQuery(searchParams.get('search') || '');
    setSortBy(searchParams.get('sort') || 'recommended');
  }, [searchParams]);

  // Fetch Taxonomy & Products
  const { data: taxonomyData } = useGetTaxonomyQuery();

  const queryParams: Record<string, any> = {
    sort: sortBy,
  };
  if (selectedCategory) queryParams.category = selectedCategory;
  if (selectedFabrics.length) queryParams.fabric = selectedFabrics;
  if (selectedOccasions.length) queryParams.occasion = selectedOccasions;
  if (selectedWorkTypes.length) queryParams.workType = selectedWorkTypes;
  if (searchQuery) queryParams.search = searchQuery;

  const { data: productsData, isLoading, isFetching } = useGetProductsQuery(queryParams);

  const toggleFabric = (fabricName: string) => {
    setSelectedFabrics((prev) =>
      prev.includes(fabricName) ? prev.filter((f) => f !== fabricName) : [...prev, fabricName]
    );
  };

  const toggleOccasion = (occasionName: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occasionName) ? prev.filter((o) => o !== occasionName) : [...prev, occasionName]
    );
  };

  const toggleWorkType = (workName: string) => {
    setSelectedWorkTypes((prev) =>
      prev.includes(workName) ? prev.filter((w) => w !== workName) : [...prev, workName]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedFabrics([]);
    setSelectedOccasions([]);
    setSelectedWorkTypes([]);
    setSearchQuery('');
    setSortBy('recommended');
    setSearchParams({});
  };

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    selectedFabrics.length > 0 ||
    selectedOccasions.length > 0 ||
    selectedWorkTypes.length > 0 ||
    Boolean(searchQuery);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-femina-200">
        <div>
          <span className="text-xs font-bold text-femina-700 tracking-[0.25em] uppercase">
            Haute Couture Catalogue
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-luxury-dark mt-1">
            {selectedCategory ? `${selectedCategory} Collection` : 'All Exclusive Pieces'}
          </h1>
        </div>

        {/* Search input on shop page */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Filter by fabric, style, occasion..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-femina-200 rounded-xl text-xs focus:outline-none focus:border-luxury-wine shadow-xs"
          />
        </div>
      </div>

      {/* Control Bar: Mobile Filter Button & Sort Dropdown */}
      <div className="flex items-center justify-between gap-4 bg-femina-50 p-4 rounded-2xl border border-femina-200">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-xs font-semibold text-luxury-wine border border-femina-300 shadow-xs"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters {hasActiveFilters && '(Active)'}</span>
        </button>

        <div className="text-xs text-gray-600 font-medium hidden sm:block">
          Showing <strong>{productsData?.data?.length || 0}</strong> handcrafted articles
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-gray-600 font-medium hidden sm:inline">Sort By:</label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-femina-300 rounded-xl px-3 py-2 text-xs font-semibold text-luxury-wine appearance-none pr-8 focus:outline-none focus:border-luxury-wine shadow-xs cursor-pointer"
            >
              <option value="recommended">Featured / Curated</option>
              <option value="newest">Newest Drops</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="best_seller">Best Sellers</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex items-center flex-wrap gap-2 pt-1">
          <span className="text-xs text-gray-500 font-medium mr-1">Active Filters:</span>
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 text-xs bg-femina-100 text-luxury-wine px-3 py-1 rounded-full font-medium border border-femina-200">
              Category: {selectedCategory}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
            </span>
          )}
          {selectedFabrics.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 text-xs bg-femina-100 text-luxury-wine px-3 py-1 rounded-full font-medium border border-femina-200"
            >
              Fabric: {f}
              <X className="w-3 h-3 cursor-pointer" onClick={() => toggleFabric(f)} />
            </span>
          ))}
          {selectedOccasions.map((o) => (
            <span
              key={o}
              className="inline-flex items-center gap-1 text-xs bg-femina-100 text-luxury-wine px-3 py-1 rounded-full font-medium border border-femina-200"
            >
              Occasion: {o}
              <X className="w-3 h-3 cursor-pointer" onClick={() => toggleOccasion(o)} />
            </span>
          ))}
          {selectedWorkTypes.map((w) => (
            <span
              key={w}
              className="inline-flex items-center gap-1 text-xs bg-femina-100 text-luxury-wine px-3 py-1 rounded-full font-medium border border-femina-200"
            >
              Craft: {w}
              <X className="w-3 h-3 cursor-pointer" onClick={() => toggleWorkType(w)} />
            </span>
          ))}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 text-xs bg-femina-100 text-luxury-wine px-3 py-1 rounded-full font-medium border border-femina-200">
              Search: "{searchQuery}"
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-rose-700 hover:underline flex items-center gap-1 ml-2"
          >
            <RotateCcw className="w-3 h-3" /> Clear All
          </button>
        </div>
      )}

      {/* Main Grid with Sidebar Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-femina-200 shadow-luxury h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-femina-100">
            <h3 className="font-serif text-base font-bold text-luxury-wine uppercase tracking-wider">
              Filter By
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-gray-500 hover:text-luxury-wine"
              >
                Reset
              </button>
            )}
          </div>

          {/* 1. Silhouette / Categories */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">Categories</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:text-luxury-wine">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === ''}
                  onChange={() => setSelectedCategory('')}
                  className="text-luxury-wine focus:ring-femina-400"
                />
                <span>All Categories</span>
              </label>
              {taxonomyData?.data?.categories?.map((cat) => (
                <label
                  key={cat._id}
                  className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:text-luxury-wine"
                >
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat.slug || selectedCategory === cat.name}
                    onChange={() => setSelectedCategory(cat.slug)}
                    className="text-luxury-wine focus:ring-femina-400"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 2. Fabric Weaves */}
          <div className="pt-4 border-t border-femina-100">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">Pure Fabrics</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {taxonomyData?.data?.fabrics?.map((fab) => (
                <label
                  key={fab._id}
                  className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:text-luxury-wine"
                >
                  <input
                    type="checkbox"
                    checked={selectedFabrics.includes(fab.name)}
                    onChange={() => toggleFabric(fab.name)}
                    className="rounded text-luxury-wine focus:ring-femina-400"
                  />
                  <span>{fab.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Occasion */}
          <div className="pt-4 border-t border-femina-100">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">Occasion</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {taxonomyData?.data?.occasions?.map((occ) => (
                <label
                  key={occ._id}
                  className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:text-luxury-wine"
                >
                  <input
                    type="checkbox"
                    checked={selectedOccasions.includes(occ.name)}
                    onChange={() => toggleOccasion(occ.name)}
                    className="rounded text-luxury-wine focus:ring-femina-400"
                  />
                  <span>{occ.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Craft / Work Type */}
          {taxonomyData?.data?.workTypes && (
            <div className="pt-4 border-t border-femina-100">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">Artisanal Work</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {taxonomyData.data.workTypes.map((work) => (
                  <label
                    key={work}
                    className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:text-luxury-wine"
                  >
                    <input
                      type="checkbox"
                      checked={selectedWorkTypes.includes(work)}
                      onChange={() => toggleWorkType(work)}
                      className="rounded text-luxury-wine focus:ring-femina-400"
                    />
                    <span>{work}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {isLoading || isFetching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="aspect-[3/4] bg-femina-200/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : !productsData?.data || productsData.data.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-femina-200 shadow-luxury space-y-4">
              <div className="w-16 h-16 rounded-full bg-femina-100 flex items-center justify-center mx-auto text-femina-700">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-luxury-dark">No Products Found</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                No articles matched your chosen filter combinations. Try removing some filters or searching for another fabric or occasion.
              </p>
              <Button onClick={handleResetFilters} variant="primary" size="md">
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsData.data.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 z-10 animate-slide-left">
            <div className="flex items-center justify-between pb-4 border-b border-femina-200">
              <h3 className="font-serif text-lg font-bold text-luxury-wine">Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Category</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="radio"
                    name="mobile-cat"
                    checked={selectedCategory === ''}
                    onChange={() => setSelectedCategory('')}
                  />
                  <span>All</span>
                </label>
                {taxonomyData?.data?.categories?.map((c) => (
                  <label key={c._id} className="flex items-center gap-2 text-xs text-gray-700">
                    <input
                      type="radio"
                      name="mobile-cat"
                      checked={selectedCategory === c.slug}
                      onChange={() => setSelectedCategory(c.slug)}
                    />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fabrics */}
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Fabrics</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {taxonomyData?.data?.fabrics?.map((f) => (
                  <label key={f._id} className="flex items-center gap-2 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedFabrics.includes(f.name)}
                      onChange={() => toggleFabric(f.name)}
                    />
                    <span>{f.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setIsMobileFilterOpen(false)}
              variant="gold"
              size="md"
              className="w-full justify-center mt-6"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
