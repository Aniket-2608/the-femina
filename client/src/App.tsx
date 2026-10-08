import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './store/index.js';
import { useGetProfileQuery } from './store/api/apiSlice.js';
import { updateUserProfile } from './store/slices/authSlice.js';

// Layout & Overlays
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { CartDrawer } from './components/layout/CartDrawer.js';
import { AuthModal } from './components/auth/AuthModal.js';
import { SearchOverlay } from './components/common/SearchOverlay.js';
import { ToastContainer } from './components/common/ToastContainer.js';

// Customer Pages
import { HomePage } from './features/customer/home/HomePage.js';
import { ShopPage } from './features/customer/shop/ShopPage.js';
import { ProductDetailPage } from './features/customer/product/ProductDetailPage.js';
import { CheckoutPage } from './features/customer/checkout/CheckoutPage.js';
import { OrderConfirmationPage } from './features/customer/checkout/OrderConfirmationPage.js';
import { MyOrdersPage } from './features/customer/profile/MyOrdersPage.js';
import { ProfilePage } from './features/customer/profile/ProfilePage.js';
import { AboutUsPage } from './features/customer/pages/AboutUsPage.js';
import { BranchesPage } from './features/customer/pages/BranchesPage.js';

// Admin Layout & Pages
import { AdminLayout } from './features/admin/AdminLayout.js';
import { AdminDashboardPage } from './features/admin/dashboard/AdminDashboardPage.js';
import { AdminProductsPage } from './features/admin/products/AdminProductsPage.js';
import { AdminInventoryPage } from './features/admin/inventory/AdminInventoryPage.js';
import { AdminOrdersPage } from './features/admin/orders/AdminOrdersPage.js';
import { AdminAccountingPage } from './features/admin/accounting/AdminAccountingPage.js';
import { AdminVendorsPage } from './features/admin/vendors/AdminVendorsPage.js';
import { AdminCustomersPage } from './features/admin/customers/AdminCustomersPage.js';
import { AdminContentPage } from './features/admin/content/AdminContentPage.js';
import { AdminAuditLogsPage } from './features/admin/audit/AdminAuditLogsPage.js';

// Scroll to top on navigation helper
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Protected Customer Route
const ProtectedCustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isAdminPath = location.pathname.startsWith('/admin');
  const { accessToken } = useAppSelector((state) => state.auth);

  // Sync active user profile on load if access token exists
  const { data: profileData } = useGetProfileQuery(undefined, {
    skip: !accessToken,
  });

  useEffect(() => {
    if (profileData?.data?.user) {
      dispatch(updateUserProfile(profileData.data.user));
    }
  }, [profileData, dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-femina-50 text-luxury-dark selection:bg-femina-200">
      <ScrollToTop />

      {/* Global Overlays */}
      <ToastContainer />
      <CartDrawer />
      <AuthModal />
      <SearchOverlay />

      {/* Customer Header - hidden in admin */}
      {!isAdminPath && <Navbar />}

      {/* Main Content Viewport */}
      <main className="flex-1">
        <Routes>
          {/* Customer Storefront Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route
            path="/orders"
            element={
              <ProtectedCustomerRoute>
                <MyOrdersPage />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedCustomerRoute>
                <ProfilePage />
              </ProtectedCustomerRoute>
            }
          />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/branches" element={<BranchesPage />} />

          {/* Enterprise Admin CRM Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="accounting" element={<AdminAccountingPage />} />
            <Route path="vendors" element={<AdminVendorsPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="content" element={<AdminContentPage />} />
            <Route path="audit" element={<AdminAuditLogsPage />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Customer Footer - hidden in admin */}
      {!isAdminPath && <Footer />}
    </div>
  );
};
