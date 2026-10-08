import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/index.js';
import { openAuthModal } from '../../../store/slices/authSlice.js';
import { clearCart } from '../../../store/slices/cartSlice.js';
import { addToast } from '../../../store/slices/uiSlice.js';
import {
  useValidateCartMutation,
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useAddAddressMutation,
} from '../../../store/api/apiSlice.js';
import { Button } from '../../../components/common/Button.js';
import { PriceDisplay } from '../../../components/common/PriceDisplay.js';
import {
  ShieldCheck,
  CreditCard,
  MapPin,
  Lock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Truck,
  Sparkles,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  // Address Selection
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Policy checkbox
  const [noReturnAcknowledged, setNoReturnAcknowledged] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // API Mutations
  const [validateCartMutation, { data: validatedCartData, isLoading: isValidating }] =
    useValidateCartMutation();
  const [createOrderMutation, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [verifyPaymentMutation, { isLoading: isVerifyingPayment }] = useVerifyPaymentMutation();
  const [addAddressMutation] = useAddAddressMutation();

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(openAuthModal({ tab: 'login', redirectUrl: '/checkout' }));
    }
  }, [isAuthenticated, dispatch]);

  // Validate cart against DB on load
  useEffect(() => {
    if (cartItems.length > 0) {
      validateCartMutation({
        items: cartItems.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      });
    }
  }, [cartItems, validateCartMutation]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-luxury-dark">Authentication Required</h2>
        <p className="text-xs text-gray-500">Please sign in or create an account to proceed with checkout.</p>
        <Button
          onClick={() => dispatch(openAuthModal({ tab: 'login', redirectUrl: '/checkout' }))}
          variant="gold"
          size="md"
        >
          Sign In Now
        </Button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-luxury-dark">Your Bag is Empty</h2>
        <p className="text-xs text-gray-500">Add items to your bag before proceeding to checkout.</p>
        <Button onClick={() => navigate('/shop')} variant="primary" size="md">
          Explore Catalogue
        </Button>
      </div>
    );
  }

  const savedAddresses = user?.savedAddresses || [];
  const activeAddress = showNewAddressForm ? newAddress : savedAddresses[selectedAddressIndex] || newAddress;

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.addressLine1 || !newAddress.city || !newAddress.pincode) {
      setErrorMessage('Please fill in complete address fields.');
      return;
    }

    try {
      await addAddressMutation(newAddress).unwrap();
      setShowNewAddressForm(false);
      dispatch(addToast({ type: 'success', message: 'Address saved to your address book.' }));
    } catch {
      setErrorMessage('Failed to save address.');
    }
  };

  const handleProceedToPayment = async () => {
    setErrorMessage('');
    if (!noReturnAcknowledged) {
      setErrorMessage('You must acknowledge and accept the No Return Policy to place your order.');
      return;
    }

    if (!activeAddress.addressLine1 || !activeAddress.city || !activeAddress.pincode) {
      setErrorMessage('Please provide a complete delivery address.');
      return;
    }

    try {
      // 1. Create Server-Side Order & Razorpay Order
      const orderPayload = {
        items: cartItems.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        shippingAddress: {
          fullName: activeAddress.fullName,
          phone: activeAddress.phone,
          addressLine1: activeAddress.addressLine1,
          addressLine2: activeAddress.addressLine2,
          landmark: activeAddress.landmark,
          city: activeAddress.city,
          state: activeAddress.state,
          pincode: activeAddress.pincode,
        },
        noReturnAcknowledged: true,
      };

      const orderRes = await createOrderMutation(orderPayload).unwrap();
      const orderData = orderRes.data;

      // 2. Launch Razorpay Checkout Popup
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency,
        name: 'The Femina Exclusive',
        description: `Order #${orderData.orderNumber}`,
        order_id: orderData.razorpayOrderId.startsWith('rzp_order_mock') ? undefined : orderData.razorpayOrderId,
        prefill: {
          name: orderData.customer.name,
          email: orderData.customer.email,
          contact: orderData.customer.phone,
        },
        theme: {
          color: '#4A0E17',
        },
        handler: async (response: any) => {
          try {
            // Verify Signature on Backend
            const verifyRes = await verifyPaymentMutation({
              orderId: orderData.orderId,
              razorpayOrderId: response.razorpay_order_id || orderData.razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
              razorpaySignature: response.razorpay_signature || 'mock_valid_signature',
            }).unwrap();

            dispatch(clearCart());
            navigate(`/order-confirmation/${orderData.orderId}`);
          } catch (err: any) {
            setErrorMessage(err?.data?.message || 'Payment signature verification failed.');
          }
        },
        modal: {
          ondismiss: () => {
            dispatch(addToast({ type: 'info', message: 'Payment window closed. Order is pending authorization.' }));
          },
        },
      };

      // Check if Razorpay SDK is loaded
      if (typeof (window as any).Razorpay !== 'undefined' && !orderData.razorpayOrderId.startsWith('rzp_order_mock')) {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Fallback for Development/Demo sandbox simulation
        console.log('[Dev Payment Sandbox] Simulating seamless payment authorization...');
        setTimeout(async () => {
          const verifyRes = await verifyPaymentMutation({
            orderId: orderData.orderId,
            razorpayOrderId: orderData.razorpayOrderId,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpaySignature: 'mock_valid_signature',
          }).unwrap();

          dispatch(clearCart());
          navigate(`/order-confirmation/${orderData.orderId}`);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err?.data?.message || 'Failed to initiate order.');
    }
  };

  const pricing = validatedCartData?.data?.pricing || {
    itemsSubtotal: cartItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    shippingCharges: 0,
    discountAmount: 0,
    totalPayable: cartItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-bold text-femina-700 tracking-[0.25em] uppercase">Secure Checkout</span>
        <h1 className="font-serif text-3xl font-bold text-luxury-dark mt-1">Complete Your Order</h1>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700 font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Form: Delivery Address */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Address Selection */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-femina-200 shadow-luxury space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-luxury-wine" />
                <h2 className="font-serif text-lg font-bold text-luxury-wine uppercase tracking-wider">
                  Delivery Destination
                </h2>
              </div>
              {savedAddresses.length > 0 && !showNewAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-xs font-semibold text-luxury-wine hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> New Address
                </button>
              )}
            </div>

            {/* Saved Addresses Radio Cards */}
            {!showNewAddressForm && savedAddresses.length > 0 ? (
              <div className="space-y-3">
                {savedAddresses.map((addr, idx) => (
                  <label
                    key={addr._id || idx}
                    className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedAddressIndex === idx
                        ? 'border-luxury-wine bg-femina-50/60 shadow-xs'
                        : 'border-femina-200 hover:border-femina-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressIndex === idx}
                      onChange={() => setSelectedAddressIndex(idx)}
                      className="mt-1 text-luxury-wine focus:ring-femina-400"
                    />
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-luxury-dark">{addr.fullName} • {addr.phone}</div>
                      <div className="text-gray-600">
                        {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ''}
                        {addr.city}, {addr.state} — <strong>{addr.pincode}</strong>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              /* New Address Form */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                      Recipient Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-femina-50/50 border border-femina-200 rounded-xl text-xs focus:outline-none focus:border-luxury-wine"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-femina-50/50 border border-femina-200 rounded-xl text-xs focus:outline-none focus:border-luxury-wine"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                    Address Line (House / Building / Street)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Villa 42, Palm Avenue"
                    value={newAddress.addressLine1}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-femina-50/50 border border-femina-200 rounded-xl text-xs focus:outline-none focus:border-luxury-wine"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-femina-50/50 border border-femina-200 rounded-xl text-xs focus:outline-none focus:border-luxury-wine"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maharashtra"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-femina-50/50 border border-femina-200 rounded-xl text-xs focus:outline-none focus:border-luxury-wine"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 400050"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-femina-50/50 border border-femina-200 rounded-xl text-xs focus:outline-none focus:border-luxury-wine"
                    />
                  </div>
                </div>

                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    className="text-xs text-gray-500 hover:text-luxury-wine"
                  >
                    Cancel and select from saved addresses
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 2. Mandatory Policy Acknowledgement */}
          <div className="bg-gold-50/80 rounded-3xl p-6 border-2 border-gold-300/80 shadow-luxury space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="policyCheck"
                checked={noReturnAcknowledged}
                onChange={(e) => setNoReturnAcknowledged(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-luxury-wine focus:ring-femina-400"
              />
              <label htmlFor="policyCheck" className="text-xs text-gold-950 font-medium leading-relaxed cursor-pointer">
                <strong>I understand & accept The Femina Exclusive No-Return Policy:</strong> All handcrafted pure silk and hand-embroidered artisanal garments are customized final sales. We do not accept returns or exchanges.
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary: Order Items & Razorpay Payment Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-femina-200 shadow-luxury space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-femina-100">
              <Sparkles className="w-5 h-5 text-gold-600" />
              <h2 className="font-serif text-lg font-bold text-luxury-wine uppercase tracking-wider">
                Order Review ({cartItems.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>

            {/* Item List */}
            <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-3.5 text-xs">
                  <img src={item.image} alt={item.productName} className="w-14 h-18 object-cover rounded-lg bg-femina-100" />
                  <div className="flex-1">
                    <h4 className="font-serif font-semibold text-luxury-dark line-clamp-1">{item.productName}</h4>
                    <div className="text-[11px] text-gray-500">
                      {item.color} • Size {item.size} • Qty: {item.quantity}
                    </div>
                    <div className="font-bold text-luxury-wine mt-1">₹{item.subtotal.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-femina-100 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-medium text-gray-900">₹{pricing.itemsSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Insured Express Shipping</span>
                <span className="font-semibold text-emerald-800">
                  {pricing.shippingCharges === 0 ? 'COMPLIMENTARY' : `₹${pricing.shippingCharges}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-luxury-wine pt-3 border-t border-femina-100">
                <span>Grand Total</span>
                <span>₹{pricing.totalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Pay Button */}
            <Button
              onClick={handleProceedToPayment}
              disabled={!noReturnAcknowledged || isCreatingOrder || isVerifyingPayment}
              isLoading={isCreatingOrder || isVerifyingPayment}
              variant="gold"
              size="lg"
              className="w-full justify-center shadow-gold-glow"
              leftIcon={<CreditCard className="w-4 h-4" />}
            >
              Pay ₹{pricing.totalPayable.toLocaleString('en-IN')} via Razorpay
            </Button>

            <div className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Razorpay 256-bit Encrypted SSL Gateway</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
