import React from 'react';
import { Link } from 'react-router-dom';
import { useGetMyOrdersQuery } from '../../../store/api/apiSlice.js';
import { Button } from '../../../components/common/Button.js';
import { Badge } from '../../../components/common/Badge.js';
import {
  PackageCheck,
  ShoppingBag,
  Calendar,
  MessageCircle,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const MyOrdersPage: React.FC = () => {
  const { data, isLoading } = useGetMyOrdersQuery();
  const orders = data?.data || [];

  const getStatusBadgeVariant = (status: string): 'gold' | 'wine' | 'emerald' | 'gray' => {
    switch (status) {
      case 'DELIVERED':
        return 'emerald';
      case 'CONFIRMED':
      case 'PAID':
        return 'gold';
      case 'PROCESSING':
      case 'PACKED':
      case 'SHIPPED':
        return 'wine';
      default:
        return 'gray';
    }
  };

  const handleSupportWhatsApp = (orderNumber: string) => {
    const text = encodeURIComponent(
      `Hello The Femina Exclusive Concierge, I have a query regarding my Order #${orderNumber}.`
    );
    window.open(`https://wa.me/919876543210?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-bold text-femina-700 tracking-[0.25em] uppercase">Private Account</span>
        <h1 className="font-serif text-3xl font-bold text-luxury-dark mt-1">My Orders</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-femina-200/50 rounded-3xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-femina-200 shadow-luxury space-y-4">
          <div className="w-16 h-16 rounded-full bg-femina-100 flex items-center justify-center mx-auto text-femina-700">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-luxury-dark">No Orders Placed Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You haven't placed any orders with The Femina Exclusive yet. Discover our pure handloom sarees and couture collections.
          </p>
          <Link to="/shop">
            <Button variant="primary" size="md">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-femina-200 shadow-luxury space-y-6"
            >
              {/* Order Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-femina-100 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-base font-bold text-luxury-dark">
                      Order #{order.orderNumber}
                    </span>
                    <Badge variant={getStatusBadgeVariant(order.orderStatus)}>
                      {order.orderStatus}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-gray-500 block">Total Amount</span>
                  <span className="text-lg font-bold text-luxury-wine">
                    ₹{order.pricing.totalPayable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-3.5 p-3 rounded-2xl bg-femina-50/50 border border-femina-100 text-xs">
                    <img src={item.image} alt={item.productName} className="w-16 h-20 object-cover rounded-xl bg-femina-100 shrink-0" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif font-semibold text-luxury-dark line-clamp-1">{item.productName}</h4>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {item.color} • Size {item.size} • Qty: {item.quantity}
                        </div>
                      </div>
                      <div className="font-bold text-luxury-wine">₹{item.subtotal.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Timeline & Support Action */}
              <div className="pt-4 border-t border-femina-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-gold-600" />
                  <span>Insured Express Shipping • Handcrafted Final Sale</span>
                </div>

                <button
                  onClick={() => handleSupportWhatsApp(order.orderNumber)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span>WhatsApp Order Inquiry</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
