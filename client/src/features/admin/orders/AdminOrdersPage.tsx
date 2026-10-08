import React, { useState } from 'react';
import {
  useGetAdminOrdersQuery,
  useUpdateAdminOrderStatusMutation,
} from '../../../store/api/apiSlice.js';
import { Button } from '../../../components/common/Button.js';
import { Badge } from '../../../components/common/Badge.js';
import { PriceDisplay } from '../../../components/common/PriceDisplay.js';
import { Order } from '../../../types/index.js';
import { useAppDispatch } from '../../../store/index.js';
import { addToast } from '../../../store/slices/uiSlice.js';

export const AdminOrdersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const { data: ordersData, isLoading } = useGetAdminOrdersQuery({
    page,
    limit: 15,
    status: statusFilter || undefined,
  });

  const [updateOrderStatus, { isLoading: isUpdatingStatus }] = useUpdateAdminOrderStatusMutation();

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newStatus) return;

    try {
      await updateOrderStatus({
        id: selectedOrder._id,
        status: newStatus,
        note: statusNote || `Status updated to ${newStatus} by Admin`,
      }).unwrap();

      dispatch(addToast({ message: `Order #${selectedOrder.orderNumber} updated to ${newStatus}`, type: 'success' }));
      setSelectedOrder(null);
      setNewStatus('');
      setStatusNote('');
    } catch (err: any) {
      dispatch(addToast({ message: err?.data?.message || 'Failed to update order status', type: 'error' }));
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'PAID':
        return 'success';
      case 'PROCESSING':
      case 'PACKED':
      case 'CONFIRMED':
        return 'gold';
      case 'SHIPPED':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const filterTabs = [
    { label: 'All Orders', value: '' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Packed', value: 'PACKED' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">Order Fulfillment & Logistics</h1>
          <p className="text-sm text-gray-600">Process boutique dispatches, monitor fulfillment stages, and manage customer orders</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 scrollbar-none">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === tab.value
                ? 'bg-luxury-maroon text-luxury-cream shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading orders...</div>
        ) : !ordersData?.data || ordersData.data.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No orders found matching this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Order Number</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Total Payable</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3">Fulfillment</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {ordersData.data.map((order: Order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{order.customer?.fullName}</div>
                      <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-700">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} pcs
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      <PriceDisplay amount={order.pricing.totalPayable} />
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={order.paymentInfo?.status === 'PAID' ? 'success' : 'warning'}>
                        {order.paymentInfo?.status || 'PENDING'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getBadgeVariant(order.orderStatus)}>
                        {order.orderStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.orderStatus);
                        }}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {ordersData?.meta && ordersData.meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Page {page} of {ordersData.meta.totalPages}
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
                disabled={page >= ordersData.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details & Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-gray-900">
                  Order #{selectedOrder.orderNumber}
                </h3>
                <span className="text-xs text-gray-500">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-xs">
              <div>
                <span className="font-semibold uppercase tracking-wider text-gray-500 block mb-1">Customer Info</span>
                <p className="font-medium text-gray-900">{selectedOrder.customer.fullName}</p>
                <p className="text-gray-600">{selectedOrder.customer.email}</p>
                <p className="text-gray-600">{selectedOrder.customer.phone}</p>
              </div>
              <div>
                <span className="font-semibold uppercase tracking-wider text-gray-500 block mb-1">Delivery Address</span>
                <p className="text-gray-900">{selectedOrder.shippingAddress.addressLine1}</p>
                {selectedOrder.shippingAddress.addressLine2 && (
                  <p className="text-gray-600">{selectedOrder.shippingAddress.addressLine2}</p>
                )}
                <p className="text-gray-600">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                </p>
              </div>
            </div>

            {/* Ordered Items */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-3">Ensemble Items</h4>
              <div className="space-y-2 divide-y divide-gray-100 max-h-48 overflow-y-auto">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 pt-2">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-12 h-14 object-cover rounded border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{item.productName}</p>
                      <p className="text-[11px] text-gray-500">
                        SKU: {item.sku} | {item.color} / Size: {item.size}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-medium text-gray-900">
                        {item.quantity} x <PriceDisplay amount={item.unitPrice} />
                      </p>
                      <p className="font-semibold text-luxury-gold">
                        <PriceDisplay amount={item.subtotal} />
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm font-serif">
              <span className="text-gray-700">Total Invoice Amount:</span>
              <span className="text-lg font-bold text-luxury-maroon">
                <PriceDisplay amount={selectedOrder.pricing.totalPayable} />
              </span>
            </div>

            {/* Update Fulfillment Stage Form */}
            <form onSubmit={handleUpdateStatus} className="border-t border-gray-100 pt-4 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700">Fulfillment Stage Progression</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">New Stage Status</label>
                  <select
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                  >
                    <option value="PAID">PAID</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING (Artisans Packing)</option>
                    <option value="PACKED">PACKED (Boutique Box Sealed)</option>
                    <option value="SHIPPED">SHIPPED (In Transit)</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED (Stock Restocked)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Dispatch / Stage Note</label>
                  <input
                    type="text"
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold"
                    placeholder="e.g. Courier Airway Bill #EXP98214"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Packing Slip
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isUpdatingStatus}
                  >
                    Save Fulfillment Update
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
