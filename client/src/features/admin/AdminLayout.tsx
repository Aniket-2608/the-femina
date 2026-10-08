import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index.js';
import { logout } from '../../store/slices/authSlice.js';
import {
  LayoutDashboard,
  Shirt,
  Boxes,
  ShoppingBag,
  ReceiptText,
  Truck,
  Users,
  ScrollText,
  Tv,
  LogOut,
  ChevronRight,
  Crown,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check if user has staff role
  const isStaffRole =
    user && ['super_admin', 'inventory_manager', 'sales_manager', 'accountant', 'content_manager'].includes(user.role);

  if (!isStaffRole) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <Crown className="w-12 h-12 text-gold-500 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-luxury-dark">Staff Authorization Required</h2>
        <p className="text-xs text-gray-500">
          This portal is reserved for authorized staff, inventory managers, and accountants of The Femina Exclusive.
        </p>
        <Link
          to="/"
          className="inline-block bg-luxury-wine text-white text-xs font-semibold px-6 py-2.5 rounded-xl uppercase tracking-wider"
        >
          Return to Customer Storefront
        </Link>
      </div>
    );
  }

  const navItems = [
    { label: 'Executive Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Master Articles & SKUs', path: '/admin/products', icon: Shirt },
    { label: 'Inventory & Stock Ledger', path: '/admin/inventory', icon: Boxes },
    { label: 'Orders & Fulfillment', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Accounting & P&L', path: '/admin/accounting', icon: ReceiptText },
    { label: 'Vendors & PO Inward', path: '/admin/vendors', icon: Truck },
    { label: 'Customer Directory', path: '/admin/customers', icon: Users },
    { label: 'Storefront CMS & Banners', path: '/admin/content', icon: Tv },
    { label: 'Immutable Audit Trail', path: '/admin/audit-logs', icon: ScrollText },
  ];

  const handleSignOut = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-femina-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 h-screen w-72 bg-luxury-dark text-white border-r border-gold-900/30 flex flex-col justify-between z-50 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="block">
              <span className="font-serif text-lg font-bold tracking-widest text-gold-shimmer uppercase block">
                The Femina
              </span>
              <span className="text-[10px] tracking-[0.3em] text-gold-400 font-semibold uppercase block">
                Enterprise CRM
              </span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Badge */}
          <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gold-gradient text-luxury-dark flex items-center justify-center font-serif text-sm font-bold shadow-md">
              {user?.firstName[0]}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-xs font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </div>
              <span className="text-[10px] font-bold text-gold-300 uppercase tracking-wider block truncate">
                {user?.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-gold-gradient text-luxury-dark shadow-md font-bold'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-gold-300 hover:bg-white/10 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-950/50 hover:text-rose-200 transition-colors text-left font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-femina-200 px-4 py-3 flex items-center justify-between lg:hidden shadow-xs">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-luxury-wine hover:text-luxury-dark rounded-lg hover:bg-femina-50"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-serif text-base font-bold text-luxury-wine uppercase">Admin CRM</span>
          <div className="w-8" />
        </header>

        {/* Dynamic Route Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
