import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index.js';
import { closeSearchOverlay } from '../../store/slices/uiSlice.js';
import { Search, X, Sparkles, ArrowRight } from 'lucide-react';

export const SearchOverlay: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector((state: RootState) => state.ui.isSearchOverlayOpen);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    dispatch(closeSearchOverlay());
    navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm('');
  };

  const handleQuickTagClick = (tag: string) => {
    dispatch(closeSearchOverlay());
    navigate(`/shop?search=${encodeURIComponent(tag)}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        onClick={() => dispatch(closeSearchOverlay())}
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-femina-200 z-10 animate-slide-up">
        <div className="p-6 border-b border-femina-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-500" />
            <h3 className="font-serif text-base font-bold text-luxury-wine uppercase tracking-wider">
              Search The Femina Haute Couture
            </h3>
          </div>
          <button
            onClick={() => dispatch(closeSearchOverlay())}
            className="p-1 rounded-full hover:bg-femina-100 text-gray-400 hover:text-luxury-wine transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-6 h-6 text-gray-400 absolute left-4 top-3.5" />
            <input
              type="text"
              autoFocus
              placeholder="Search by fabric, occasion, work type (e.g., Banarasi Silk, Zardozi Lehenga)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-13 pr-12 py-3.5 bg-femina-50 border-2 border-femina-300 rounded-2xl text-base text-luxury-dark placeholder-gray-400 focus:outline-none focus:border-luxury-wine transition-all"
            />
            {searchTerm && (
              <button
                type="submit"
                className="absolute right-3 top-2.5 p-2 bg-luxury-wine text-white rounded-xl hover:bg-luxury-dark transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Popular Search Suggestions */}
          <div className="mt-6">
            <div className="text-[11px] font-semibold text-gray-500 tracking-wider uppercase mb-2.5">
              Popular Curations
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                'Banarasi Katan Silk',
                'Bridal Zardozi Lehenga',
                'Chanderi Anarkali',
                'Lucknowi Chikankari',
                'Velvet Gharara',
                'Champagne Satin Gown',
                'Mulmul Cotton',
              ].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleQuickTagClick(tag)}
                  className="text-xs bg-femina-50 hover:bg-femina-100 text-luxury-wine border border-femina-200 px-3 py-1.5 rounded-full font-medium transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
