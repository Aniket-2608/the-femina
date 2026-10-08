import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useGetOrderByIdQuery } from '../../../store/api/apiSlice.js';
import { Button } from '../../../components/common/Button.js';
import {
  CheckCircle2,
  PackageCheck,
  MapPin,
  Sparkles,
  Printer,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { data, isLoading } = useGetOrderByIdQuery(orderId || '');
  const order = data?.data;

  useEffect(() => {
    // Trigger celebratory gold confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#4A0E17', '#FAF7F2'],
    });
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="w-16 h-16 bg-femina-200 rounded-full mx-auto mb-4" />
        <div className="h-6 bg-femina-200 rounded w-1/2 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-fade-in">
      {/* Confirmation Banner */}
      <div className="bg-white rounded-3xl p-8 text-center border border-femina-200 shadow-luxury space-y-4">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700 bg-gold-50 px-3 py-1 rounded-full uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-gold-600" />
          <span>Payment Authorized & Confirmed</span>
        </div>

        <h1 className="font-serif text-3xl font-bold text-luxury-wine">
          Thank You For Your Patronage
        </h1>

        <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
          Your bespoke order has been recorded. Our master artisans are preparing your heirloom pieces with utmost care.
        </p>

        <div className="pt-2 text-xs font-mono font-bold text-luxury-dark bg-femina-50 py-2 px-4 rounded-xl inline-block border border-femina-200">
          Order Reference: {order?.orderNumber || orderId}
        </div>
      </div>

      {/* Order Details & Receipt */}
      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-femina-200 shadow-luxury space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-femina-100">
            <h2 className="font-serif text-lg font-bold text-luxury-wine uppercase tracking-wider">
              Receipt & Items Summary
            </h2>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-luxury-wine p-2 rounded-lg hover:bg-femina-50"
            >
              <Printer className="w-4 h-4" /> Print Invoice
            </button>
          </div>

          {/* Items */}
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-3 rounded-2xl bg-femina-50/50 border border-femina-100 text-xs">
                <img src={item.image} alt={item.productName} className="w-16 h-20 object-cover rounded-xl bg-femina-100" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif font-semibold text-sm text-luxury-dark">{item.productName}</h4>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Color: {item.color} • Size: {item.size} • Qty: {item.quantity}
                    </div>
                  </div>
                  <div className="font-bold text-luxury-wine">₹{item.subtotal.toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery & Pricing Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-femina-100 text-xs">
            <div>
              <span className="font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                Delivery Destination
              </span>
              <div className="text-gray-800 font-medium leading-relaxed">
                <div>{order.shippingAddress.fullName} ({order.shippingAddress.phone})</div>
                <div>{order.shippingAddress.addressLine1}</div>
                <div>
                  {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 sm:text-right">
              <div className="flex sm:justify-end gap-6 text-gray-600">
                <span>Subtotal:</span>
                <span className="font-medium text-gray-900">₹{order.pricing.itemsSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex sm:justify-end gap-6 text-gray-600">
                <span>Shipping:</span>
                <span className="font-semibold text-emerald-800">
                  {order.pricing.shippingCharges === 0 ? 'COMPLIMENTARY' : `₹${order.pricing.shippingCharges}`}
                </span>
              </div>
              <div className="flex sm:justify-end gap-6 text-sm font-bold text-luxury-wine pt-2 border-t border-femina-100">
                <span>Total Paid:</span>
                <span>₹{order.pricing.totalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Links */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <Link to="/orders">
          <Button variant="outline" size="md">
            View In My Orders
          </Button>
        </Link>
        <Link to="/shop">
          <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};
