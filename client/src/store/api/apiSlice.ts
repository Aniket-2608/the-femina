import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index.js';
import { Product, Category, Fabric, Occasion, Order, Branch, StoreContent, User } from '../../types/index.js';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'Products',
    'ProductDetail',
    'Taxonomy',
    'Orders',
    'AdminDashboard',
    'AdminProducts',
    'Inventory',
    'Expenses',
    'Vendors',
    'Customers',
    'AuditLogs',
    'Content',
    'UserProfile',
  ],
  endpoints: (builder) => ({
    // 1. Discovery & Products
    getProducts: builder.query<{ success: boolean; data: Product[]; meta: any }, Record<string, any>>({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: ['Products'],
    }),
    getProductBySlug: builder.query<{ success: boolean; data: { product: Product; relatedProducts: Product[] } }, string>({
      query: (slug) => `/products/${slug}`,
      providesTags: (_res, _err, slug) => [{ type: 'ProductDetail', id: slug }],
    }),
    getTaxonomy: builder.query<{
      success: boolean;
      data: {
        categories: Category[];
        fabrics: Fabric[];
        occasions: Occasion[];
        workTypes: string[];
        priceRange: { min: number; max: number };
      };
    }, void>({
      query: () => '/products/taxonomy',
      providesTags: ['Taxonomy'],
    }),

    // 2. Authentication & Profile
    register: builder.mutation<any, any>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    verifyEmailOtp: builder.mutation<any, { email: string; otp: string }>({
      query: (body) => ({
        url: '/auth/verify-email-otp',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UserProfile'],
    }),
    verifyPhoneOtp: builder.mutation<any, { phone: string; otp: string }>({
      query: (body) => ({
        url: '/auth/verify-phone-otp',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UserProfile'],
    }),
    resendOtp: builder.mutation<any, { email?: string; phone?: string; type: 'email' | 'phone' }>({
      query: (body) => ({
        url: '/auth/resend-otp',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation<any, { email: string; password: string }>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UserProfile'],
    }),
    getProfile: builder.query<{ success: boolean; data: { user: User } }, void>({
      query: () => '/auth/me',
      providesTags: ['UserProfile'],
    }),
    updateProfile: builder.mutation<any, { firstName: string; lastName: string }>({
      query: (body) => ({
        url: '/auth/me',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['UserProfile'],
    }),
    addAddress: builder.mutation<any, any>({
      query: (body) => ({
        url: '/auth/addresses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UserProfile'],
    }),
    deleteAddress: builder.mutation<any, string>({
      query: (addressId) => ({
        url: `/auth/addresses/${addressId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UserProfile'],
    }),

    // 3. Checkout & Orders
    validateCart: builder.mutation<any, { items: { productId: string; variantId: string; quantity: number }[] }>({
      query: (body) => ({
        url: '/checkout/validate-cart',
        method: 'POST',
        body,
      }),
    }),
    createOrder: builder.mutation<any, any>({
      query: (body) => ({
        url: '/checkout/create-order',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Products', 'AdminDashboard', 'Inventory'],
    }),
    verifyPayment: builder.mutation<any, any>({
      query: (body) => ({
        url: '/payments/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders', 'AdminDashboard', 'Inventory'],
    }),
    getMyOrders: builder.query<{ success: boolean; data: Order[] }, void>({
      query: () => '/orders/my-orders',
      providesTags: ['Orders'],
    }),
    getOrderById: builder.query<{ success: boolean; data: Order }, string>({
      query: (orderId) => `/orders/my-orders/${orderId}`,
    }),

    // 4. Store Content & Branches
    getStoreContent: builder.query<{ success: boolean; data: StoreContent }, void>({
      query: () => '/store/content',
      providesTags: ['Content'],
    }),
    getBranches: builder.query<{ success: boolean; data: Branch[] }, void>({
      query: () => '/store/branches',
    }),

    // 5. Enterprise Admin CRM
    getDashboardMetrics: builder.query<{ success: boolean; data: any }, void>({
      query: () => '/admin/dashboard',
      providesTags: ['AdminDashboard'],
    }),
    getAdminProducts: builder.query<{ success: boolean; data: Product[]; meta: any }, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: '/admin/products',
        params,
      }),
      providesTags: ['AdminProducts'],
    }),
    createAdminProduct: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Products', 'AdminProducts', 'AdminDashboard', 'Inventory', 'Taxonomy'],
    }),
    updateAdminProduct: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/admin/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Products', 'AdminProducts', 'AdminDashboard'],
    }),
    adjustInventory: builder.mutation<any, { variantId: string; delta: number; type: string; reason: string }>({
      query: (body) => ({
        url: '/admin/inventory/adjust',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Inventory', 'AdminProducts', 'AdminDashboard', 'Products'],
    }),
    getInventoryLedger: builder.query<{ success: boolean; data: any[]; meta: any }, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/admin/inventory/ledger',
        params,
      }),
      providesTags: ['Inventory'],
    }),
    getAdminOrders: builder.query<{ success: boolean; data: Order[]; meta: any }, { page?: number; limit?: number; status?: string }>({
      query: (params) => ({
        url: '/admin/orders',
        params,
      }),
      providesTags: ['Orders', 'AdminDashboard'],
    }),
    updateAdminOrderStatus: builder.mutation<any, { id: string; status: string; note: string }>({
      query: ({ id, status, note }) => ({
        url: `/admin/orders/${id}/status`,
        method: 'PUT',
        body: { status, note },
      }),
      invalidatesTags: ['Orders', 'AdminDashboard', 'AuditLogs'],
    }),
    getExpenses: builder.query<{ success: boolean; data: { expenses: any[]; totalSum: number }; meta: any }, { page?: number; limit?: number; category?: string }>({
      query: (params) => ({
        url: '/admin/expenses',
        params,
      }),
      providesTags: ['Expenses'],
    }),
    createExpense: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/expenses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Expenses', 'AdminDashboard', 'AuditLogs'],
    }),
    getVendors: builder.query<{ success: boolean; data: any[] }, void>({
      query: () => '/admin/vendors',
      providesTags: ['Vendors'],
    }),
    createVendor: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/vendors',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Vendors', 'AuditLogs'],
    }),
    createPurchaseOrder: builder.mutation<any, any>({
      query: (body) => ({
        url: '/admin/purchases',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Vendors', 'Inventory', 'AdminProducts', 'AdminDashboard', 'AuditLogs'],
    }),
    getAdminCustomers: builder.query<{ success: boolean; data: any[]; meta: any }, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/admin/customers',
        params,
      }),
      providesTags: ['Customers'],
    }),
    getAuditLogs: builder.query<{ success: boolean; data: any[]; meta: any }, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/admin/audit-logs',
        params,
      }),
      providesTags: ['AuditLogs'],
    }),
    updateStoreContent: builder.mutation<any, any>({
      query: (body) => ({
        url: '/store/content',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Content', 'AuditLogs'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetTaxonomyQuery,
  useRegisterMutation,
  useVerifyEmailOtpMutation,
  useVerifyPhoneOtpMutation,
  useResendOtpMutation,
  useLoginMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useAddAddressMutation,
  useDeleteAddressMutation,
  useValidateCartMutation,
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useGetStoreContentQuery,
  useGetBranchesQuery,
  useGetDashboardMetricsQuery,
  useGetAdminProductsQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useAdjustInventoryMutation,
  useGetInventoryLedgerQuery,
  useGetAdminOrdersQuery,
  useUpdateAdminOrderStatusMutation,
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useGetVendorsQuery,
  useCreateVendorMutation,
  useCreatePurchaseOrderMutation,
  useGetAdminCustomersQuery,
  useGetAuditLogsQuery,
  useUpdateStoreContentMutation,
} = apiSlice;
