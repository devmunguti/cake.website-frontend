import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { cakeApi } from '../api/cakeApi';
import { categoryApi } from '../api/categoryApi';
import { useCart } from '../context/CartContext';

export default function CakesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cakes, setCakes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const selectedCategory = searchParams.get('category') || 'All';
  const searchTerm = searchParams.get('search') || '';
  const sortOption = searchParams.get('sort') || 'newest';

  const [searchInput, setSearchInput] = useState(searchTerm);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await categoryApi.getCategories();
        if (res.success) setCategories(res.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchCakes() {
      try {
        setLoading(true);
        const params = {
          sort: sortOption
        };
        if (selectedCategory && selectedCategory !== 'All') {
          params.categorySlug = selectedCategory;
        }
        if (searchTerm) {
          params.search = searchTerm;
        }

        const res = await cakeApi.getCakes(params);
        if (res.success) {
          setCakes(res.data || []);
        }
      } catch (err) {
        console.error('Error fetching cakes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCakes();
  }, [selectedCategory, searchTerm, sortOption]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleCategoryChange = (slug) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', slug);
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', e.target.value);
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-bold tracking-widest text-[#C85A32]">Artisanal Menu</span>
          <h1 className="font-serif-display text-3xl sm:text-5xl font-bold text-[#2C2420] mt-1">
            Our Cake Catalog
          </h1>
          <p className="text-sm sm:text-base text-stone-600 mt-2">
            Freshly baked with love, premium European chocolates, and natural fillings.
          </p>
        </div>

        {/* Search & Sort Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E8DFD3] shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="w-full md:max-w-md relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                search
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search chocolate, vanilla, birthday, red velvet..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-[#E8DFD3] focus:border-[#C85A32] focus:outline-none text-sm bg-[#FAF7F2]/50 text-[#2C2420]"
              />
            </form>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <span className="text-xs font-bold text-stone-500">Sort by:</span>
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="px-4 py-2.5 rounded-full border border-[#E8DFD3] text-xs font-semibold bg-white text-[#2C2420] focus:outline-none focus:border-[#C85A32]"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="rating">Top Rated (5 Stars)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-stone-100 pb-1">
            <button
              onClick={() => handleCategoryChange('All')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-[#C85A32] text-white shadow-sm'
                  : 'bg-[#FAF7F2] text-[#4A3E39] hover:bg-[#FAECE5]'
              }`}
            >
              All Cakes
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.slug
                    ? 'bg-[#C85A32] text-white shadow-sm'
                    : 'bg-[#FAF7F2] text-[#4A3E39] hover:bg-[#FAECE5]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Cake Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-[#C85A32] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-serif-display font-semibold text-stone-600">Baking the catalog...</p>
          </div>
        ) : cakes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E8DFD3] p-8">
            <span className="material-symbols-outlined text-5xl text-stone-400 mb-2">cake</span>
            <h3 className="font-serif-display text-xl font-bold text-[#2C2420]">No cakes match your criteria</h3>
            <p className="text-sm text-stone-500 mt-1 mb-6">Try searching with different terms or reset your filters.</p>
            <button
              onClick={() => {
                setSearchInput('');
                setSearchParams({});
              }}
              className="px-6 py-2.5 rounded-full bg-[#C85A32] text-white font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cakes.map((cake) => (
              <div key={cake._id} className="cake-card flex flex-col overflow-hidden group">
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={cake.images?.[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'}
                    alt={cake.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#C85A32] shadow-sm">
                    {cake.categoryName || 'Signature'}
                  </div>
                  <div className="absolute top-3 right-3 bg-[#2C2420]/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
                    <span className="text-amber-400">★</span> {cake.rating || '5.0'}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif-display font-bold text-xl text-[#2C2420] group-hover:text-[#C85A32] transition-colors line-clamp-1">
                      {cake.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
                      {cake.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-[11px] px-2.5 py-1 rounded-md bg-[#FAF7F2] text-stone-600 font-medium">
                        ⏱ {cake.preparationTimeText || '24 hrs'} lead time
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-stone-400 uppercase font-semibold block">Base Price</span>
                      <span className="font-serif-display font-extrabold text-xl text-[#2C2420]">
                        KES {cake.basePrice?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(cake)}
                        className="p-2.5 rounded-full bg-[#FAECE5] text-[#C85A32] hover:bg-[#C85A32] hover:text-white transition-colors cursor-pointer"
                        title="Quick Add Default 1kg"
                      >
                        <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                      </button>
                      <Link
                        to={`/cakes/${cake.slug}`}
                        className="px-4 py-2.5 rounded-full bg-[#C85A32] text-white font-bold text-xs hover:bg-[#B04B25] transition-colors"
                      >
                        Customize
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
