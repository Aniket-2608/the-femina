import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index.js';
import { openAuthModal, logout } from '../../store/slices/authSlice.js';
import { openCartDrawer } from '../../store/slices/cartSlice.js';
import { toggleMobileMenu, toggleSearchOverlay } from '../../store/slices/uiSlice.js';
import { useGetTaxonomyQuery } from '../../store/api/apiSlice.js';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  MapPin,
  ShieldCheck,
  LogOut,
  PackageCheck,
  Crown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const isMobileMenuOpen = useSelector((state: RootState) => state.ui.isMobileMenuOpen);
  const { data: taxonomyData } = useGetTaxonomyQuery();

  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const isStaffRole =
    user && ['super_admin', 'inventory_manager', 'sales_manager', 'accountant', 'content_manager'].includes(user.role);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-femina-200/80 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-luxury-gradient text-white text-[11px] sm:text-xs py-1.5 px-4 text-center tracking-widest uppercase font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-gold-400" />
        <span>Complimentary Pan-India Insured Express Shipping On All Orders</span>
        <Sparkles className="w-3.5 h-3.5 text-gold-400 hidden sm:inline" />
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className="p-2 text-luxury-wine hover:text-luxury-dark focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo & Title */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <Link to="/" className="inline-block group">
              <span className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold tracking-widest text-luxury-wine group-hover:text-femina-700 transition-colors uppercase block">
                The Femina
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.35em] text-gold-600 font-semibold uppercase block -mt-1">
                Exclusive
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              to="/"
              className="text-sm font-medium tracking-wider text-gray-800 hover:text-luxury-wine uppercase transition-colors"
            >
              Home
            </Link>

            {/* Shop Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsShopDropdownOpen(true)}
              onMouseLeave={() => setIsShopDropdownOpen(false)}
            >
              <Link
                to="/shop"
                className="text-sm font-medium tracking-wider text-gray-800 hover:text-luxury-wine uppercase transition-colors inline-flex items-center gap-1 py-4"
              >
                <span>Shop</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </Link>

              {isShopDropdownOpen && (
                <div className="absolute top-full -left-4 w-64 bg-white rounded-xl shadow-2xl border border-femina-200 p-4 grid gap-2 animate-fadeIn z-50">
                  <div className="text-[11px] font-semibold text-femina-800 tracking-wider uppercase border-b border-femina-100 pb-2">
                    Browse Categories
                  </div>
                  {taxonomyData?.data?.categories?.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/shop?category=${cat.slug}`}
                      onClick={() => setIsShopDropdownOpen(false)}
                      className="text-xs font-medium text-gray-700 hover:text-luxury-wine hover:bg-femina-50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between"
                    >
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                  <div className="pt-2 border-t border-femina-100 mt-1">
                    <Link
                      to="/shop"
                      onClick={() => setIsShopDropdownOpen(false)}
                      className="text-xs font-semibold text-luxury-wine hover:underline block text-center"
                    >
                      View All Collections →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/about"
              className="text-sm font-medium tracking-wider text-gray-800 hover:text-luxury-wine uppercase transition-colors"
            >
              About Us
            </Link>

            <Link
              to="/branches"
              className="text-sm font-medium tracking-wider text-gray-800 hover:text-luxury-wine uppercase transition-colors inline-flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5 text-femina-600" />
              <span>Boutiques</span>
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Search Trigger */}
            <button
              onClick={() => dispatch(toggleSearchOverlay())}
              className="p-2 text-gray-700 hover:text-luxury-wine transition-colors"
              title="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => dispatch(openCartDrawer())}
              className="relative p-2 text-gray-700 hover:text-luxury-wine transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute top-0 right-0 bg-luxury-wine text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Account / Sign In */}
            {isAuthenticated && user ? (
              <div
                className="relative"
                onMouseEnter={() => setIsUserDropdownOpen(true)}
                onMouseLeave={() => setIsUserDropdownOpen(false)}
              >
                <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-femina-100 transition-colors border border-femina-300">
                  <div className="w-7 h-7 rounded-full bg-luxury-wine text-white flex items-center justify-center font-serif text-xs font-bold">
                    {user.firstName[0]}
                  </div>
                  <span className="text-xs font-medium text-luxury-dark hidden md:inline max-w-[90px] truncate">
                    {user.firstName}
                  </span>
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-2xl border border-femina-200 p-2.5 grid gap-1 z-50 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-femina-100">
                      <div className="text-xs font-semibold text-luxury-wine truncate">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">{user.email}</div>
                      {isStaffRole && (
                        <span className="mt-1.5 inline-block text-[10px] uppercase font-bold tracking-wider bg-gold-100 text-gold-900 px-2 py-0.5 rounded">
                          {user.role.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    {isStaffRole && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gold-800 bg-gold-50/70 hover:bg-gold-100 rounded-lg transition-colors"
                      >
                        <Crown className="w-4 h-4 text-gold-600" />
                        <span>Admin CRM Portal</span>
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-femina-50 hover:text-luxury-wine rounded-lg transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>My Profile & Addresses</span>
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-femina-50 hover:text-luxury-wine rounded-lg transition-colors"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>My Orders</span>
                    </Link>

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        dispatch(logout());
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => dispatch(openAuthModal({ tab: 'login' }))}
                className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase bg-luxury-wine text-white px-4 py-2 rounded-lg hover:bg-luxury-dark shadow-sm transition-all"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-femina-200 bg-white px-5 py-6 space-y-4 animate-slide-up">
          <Link
            to="/"
            onClick={() => dispatch(toggleMobileMenu())}
            className="block text-sm font-semibold tracking-wider uppercase text-gray-800 hover:text-luxury-wine"
          >
            Home
          </Link>
          <Link
            to="/shop"
            onClick={() => dispatch(toggleMobileMenu())}
            className="block text-sm font-semibold tracking-wider uppercase text-gray-800 hover:text-luxury-wine"
          >
            All Collections
          </Link>
          <div className="pl-4 space-y-2 border-l-2 border-femina-200">
            {taxonomyData?.data?.categories?.map((cat) => (
              <Link
                key={cat._id}
                to={`/shop?category=${cat.slug}`}
                onClick={() => dispatch(toggleMobileMenu())}
                className="block text-xs font-medium text-gray-600 hover:text-luxury-wine"
              >
                {cat.name}
              </Link>
            ))}
          </div>
          <Link
            to="/about"
            onClick={() => dispatch(toggleMobileMenu())}
            className="block text-sm font-semibold tracking-wider uppercase text-gray-800 hover:text-luxury-wine"
          >
            About Us
          </Link>
          <Link
            to="/branches"
            onClick={() => dispatch(toggleMobileMenu())}
            className="block text-sm font-semibold tracking-wider uppercase text-gray-800 hover:text-luxury-wine"
          >
            Physical Boutiques
          </Link>
        </div>
      )}
    </header>
  );
};
