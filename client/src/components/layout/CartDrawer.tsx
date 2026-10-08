import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index.js';
import { closeCartDrawer, updateQuantity, removeFromCart } from '../../store/slices/cartSlice.js';
import { openAuthModal } from '../../store/slices/authSlice.js';
import { PriceDisplay } from '../common/PriceDisplay.js';
import { Button } from '../common/Button.js';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Sparkles } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector((state: RootState) => state.cart.isCartDrawerOpen);
  const items = useSelector((state: RootState) => state.cart.items);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const freeShippingThreshold = 2999;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckoutClick = () => {
    dispatch(closeCartDrawer());
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      // Prompt sign up / in modal with redirection directly to checkout
      dispatch(openAuthModal({ tab: 'login', redirectUrl: '/checkout' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => dispatch(closeCartDrawer())}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-left">
          {/* Drawer Header */}
          <div className="p-5 border-b border-femina-200 flex items-center justify-between bg-femina-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-luxury-wine" />
              <h2 className="font-serif text-lg font-bold text-luxury-wine uppercase tracking-wider">
                Your Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => dispatch(closeCartDrawer())}
              className="p-1.5 rounded-full hover:bg-femina-200 text-gray-500 hover:text-luxury-wine transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-femina-100/60 p-3.5 border-b border-femina-200 text-xs">
            <div className="flex items-center justify-between font-medium text-luxury-wine mb-1.5">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                {amountNeededForFreeShipping === 0 ? (
                  <span className="font-semibold text-emerald-800">You unlocked Complimentary Express Shipping!</span>
                ) : (
                  <span>
                    Add ₹{amountNeededForFreeShipping.toLocaleString('en-IN')} more for Complimentary Shipping
                  </span>
                )}
              </span>
            </div>
            <div className="w-full bg-femina-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gold-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-femina-100 flex items-center justify-center text-femina-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-gray-800">Your bag is empty</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">
                    Explore our heirloom sarees, bespoke lehengas, and artisanal kurtis to begin shopping.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    dispatch(closeCartDrawer());
                    navigate('/shop');
                  }}
                  variant="primary"
                  size="sm"
                >
                  Explore Collections
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-4 p-3.5 rounded-xl border border-femina-200/80 bg-femina-50/40 hover:bg-white transition-all shadow-2xs"
                >
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-20 h-24 object-cover object-top rounded-lg bg-femina-100 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif text-sm font-semibold text-luxury-dark line-clamp-1">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() =>
                            dispatch(removeFromCart({ productId: item.productId, variantId: item.variantId }))
                          }
                          className="text-gray-400 hover:text-rose-600 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-gray-500 mt-0.5 space-x-2">
                        <span>Color: <strong>{item.color}</strong></span>
                        <span>•</span>
                        <span>Size: <strong>{item.size}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-femina-300 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                productId: item.productId,
                                variantId: item.variantId,
                                quantity: item.quantity - 1,
                              })
                            )
                          }
                          className="px-2 py-1 text-gray-600 hover:bg-femina-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-luxury-dark">{item.quantity}</span>
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                productId: item.productId,
                                variantId: item.variantId,
                                quantity: item.quantity + 1,
                              })
                            )
                          }
                          disabled={item.quantity >= item.availableStock}
                          className="px-2 py-1 text-gray-600 hover:bg-femina-100 disabled:opacity-30 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <PriceDisplay price={item.subtotal} size="sm" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-femina-200 bg-white space-y-4 shadow-lg">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-luxury-dark">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insured Shipping</span>
                  <span className="font-semibold text-emerald-800">
                    {subtotal >= 2999 ? 'FREE' : '₹199'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-luxury-wine pt-2 border-t border-femina-100">
                  <span>Total Estimated</span>
                  <span>₹{(subtotal + (subtotal >= 2999 ? 0 : 199)).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 text-center leading-tight">
                Taxes included. Artisanal final sale policy applies.
              </div>

              <Button
                onClick={handleCheckoutClick}
                variant="gold"
                size="lg"
                className="w-full justify-center"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
