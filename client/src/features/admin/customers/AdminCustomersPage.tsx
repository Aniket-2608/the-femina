import React, { useState } from 'react';
import { useGetAdminCustomersQuery } from '../../../store/api/apiSlice.js';
import { Button } from '../../../components/common/Button.js';
import { Badge } from '../../../components/common/Badge.js';
import { PriceDisplay } from '../../../components/common/PriceDisplay.js';

export const AdminCustomersPage: React.FC = () => {
  const [page, setPage] = useState(1);

  const { data: customersData, isLoading } = useGetAdminCustomersQuery({
    page,
    limit: 15,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Clientele & Customer Directory</h1>
          <p className="text-sm text-gray-600">Track high-net-worth patrons, customer lifetime value (LTV), and purchase history</p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-gray-900">Registered Boutique Patrons</h2>
          <span className="text-xs text-gray-500">
            {customersData?.meta?.totalCount || customersData?.data?.length || 0} Total Customers
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading customer profiles...</div>
        ) : !customersData?.data || customersData.data.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No customers registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Customer Name</th>
                  <th className="px-6 py-3">Contact Details</th>
                  <th className="px-6 py-3">Security & Verification</th>
                  <th className="px-6 py-3">Orders Placed</th>
                  <th className="px-6 py-3">Lifetime Spend (LTV)</th>
                  <th className="px-6 py-3">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {customersData.data.map((c: any) => (
                  <tr key={c._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{c.fullName || `${c.firstName} ${c.lastName}`}</div>
                      <div className="text-xs text-gray-400">ID: {c._id.slice(-6)}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="text-gray-900 font-medium">{c.email}</div>
                      <div className="text-gray-500">{c.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={c.isEmailVerified ? 'success' : 'warning'}>
                          {c.isEmailVerified ? 'Email ✓' : 'Email Unverified'}
                        </Badge>
                        <Badge variant={c.isPhoneVerified ? 'success' : 'warning'}>
                          {c.isPhoneVerified ? 'Phone ✓' : 'Phone Unverified'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">
                      {c.orderCount || 0} orders
                    </td>
                    <td className="px-6 py-4 font-semibold text-luxury-gold font-mono">
                      <PriceDisplay amount={c.totalSpent || 0} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {customersData?.meta && customersData.meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Page {page} of {customersData.meta.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= customersData.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
