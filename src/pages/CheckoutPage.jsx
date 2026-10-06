import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { orderApi } from '../api/orderApi';
import { paymentApi } from '../api/paymentApi';
import { promotionApi } from '../api/promotionApi';
import { toast } from 'react-hot-toast';

export default function CheckoutPage() {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [deliveryMethod, setDeliveryMethod] = useState('DELIVERY');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [notes, setNotes] = useState('');

  // Customer details
  const [customerDetails, setCustomerDetails] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  // Delivery Address
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: user?.addresses?.[0]?.street || '',
    houseNumber: user?.addresses?.[0]?.houseNumber || '',
    landmark: user?.addresses?.[0]?.landmark || '',
    instructions: user?.addresses?.[0]?.instructions || '',
    city: 'Nairobi'
  });

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);

  // Checkout / Payment Modal State
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState(user?.phone || '');
  const [paymentPolling, setPaymentPolling] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Delivery Fee Calculation
  const defaultDeliveryFee = settings?.bakeryOperations?.defaultDeliveryFee ?? 350;
  const freeThreshold = settings?.bakeryOperations?.freeDeliveryThreshold ?? 6000;
  const deliveryFee = deliveryMethod === 'DELIVERY' ? (subtotal >= freeThreshold ? 0 : defaultDeliveryFee) : 0;
  const discount = appliedPromo?.calculatedDiscount || 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee - discount);

  // Min Date Calculation (24 hours lead time)
  const minLeadHours = settings?.bakeryOperations?.minimumLeadTimeHours || 24;
  const minDateStr = new Date(Date.now() + minLeadHours * 3600 * 1000).toISOString().split('T')[0];

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    try {
      setPromoLoading(true);
      const res = await promotionApi.validateCode(promoInput.trim(), subtotal);
      if (res.success && res.data) {
        setAppliedPromo(res.data);
        toast.success(`Promo code applied: -KES ${res.data.calculatedDiscount}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid promotion code.');
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error('Your cake basket is empty.');
      navigate('/cakes');
      return;
    }

    if (!customerDetails.fullName || !customerDetails.phone || !customerDetails.email) {
      toast.error('Please provide full name, phone number, and email.');
      return;
    }

    if (!scheduledDate) {
      toast.error('Please select a delivery or pickup date.');
      return;
    }

    if (deliveryMethod === 'DELIVERY' && !deliveryAddress.street.trim()) {
      toast.error('Please enter your delivery street and area.');
      return;
    }

    try {
      setSubmittingOrder(true);

      const orderPayload = {
        items: cartItems.map((item) => ({
          cakeId: item.cakeId,
          cakeName: item.cakeName,
          quantity: item.quantity,
          size: item.size,
          flavour: item.flavour,
          filling: item.filling,
          decoration: item.decoration,
          customMessage: item.customMessage,
          specialInstructions: item.specialInstructions
        })),
        customerDetails,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'DELIVERY' ? deliveryAddress : {},
        scheduledDate: new Date(scheduledDate),
        scheduledTimeSlot,
        promoCode: appliedPromo?.code || '',
        notes
      };

      const res = await orderApi.createOrder(orderPayload);
      if (res.success && res.data) {
        const order = res.data;
        setActiveOrder(order);
        setMpesaPhone(customerDetails.phone);
        setShowPaymentModal(true);
      }
    } catch (err) {
      console.error('Order creation error:', err);
      toast.error(err.response?.data?.message || 'Failed to create order. Please check inputs.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleTriggerMpesaStk = async () => {
    if (!mpesaPhone || !mpesaPhone.trim()) {
      toast.error('Please enter an M-Pesa phone number.');
      return;
    }

    try {
      setPaymentPolling(true);
      const res = await paymentApi.initiatePayment(activeOrder._id, mpesaPhone.trim());
      if (res.success) {
        toast.success('M-Pesa STK Prompt sent! Enter your PIN on your phone.');

        // Start polling payment status
        let attempts = 0;
        const maxAttempts = 24; // 2 minutes (every 5s)
        const pollInterval = setInterval(async () => {
          attempts += 1;
          try {
            const statusRes = await paymentApi.getPaymentStatus(activeOrder._id);
            if (statusRes.success && statusRes.data?.paymentStatus === 'PAID') {
              clearInterval(pollInterval);
              setPaymentPolling(false);
              setPaymentSuccess(true);
              clearCart();
              toast.success('Payment confirmed! Your cake order is being prepared.');
            } else if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              setPaymentPolling(false);
              toast.error('Payment prompt timed out. You can also pay later or track your order.');
            }
          } catch (pollErr) {
            console.warn('Payment polling error:', pollErr);
          }
        }, 5000);
      }
    } catch (err) {
      setPaymentPolling(false);
      toast.error(err.response?.data?.message || 'Error initiating M-Pesa payment.');
    }
  };

  if (cartItems.length === 0 && !activeOrder) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 bg-[#FAF7F2] px-4 text-center">
        <span className="material-symbols-outlined text-6xl text-stone-300 mb-4">shopping_bag</span>
        <h2 className="font-serif-display text-2xl font-bold text-[#2C2420] mb-2">Your Basket is Empty</h2>
        <p className="text-stone-500 mb-6">Choose your favorite artisanal cake before proceeding to checkout.</p>
        <Link to="/cakes" className="px-8 py-3.5 rounded-full bg-[#C85A32] text-white font-bold text-sm">
          Browse Cake Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-bold tracking-widest text-[#C85A32]">Safe Cashless Checkout</span>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#2C2420] mt-1">
            Complete Your Cake Order
          </h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Delivery & Contact Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Delivery or Pickup Method */}
            <div className="bg-white p-6 rounded-3xl border border-[#E8DFD3] space-y-4">
              <h2 className="font-serif-display text-lg font-bold text-[#2C2420] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#C85A32]">local_shipping</span>
                <span>1. Delivery Option</span>
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('DELIVERY')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    deliveryMethod === 'DELIVERY'
                      ? 'border-[#C85A32] bg-[#FAECE5] ring-1 ring-[#C85A32]'
                      : 'border-[#E8DFD3] bg-[#FAF7F2]/50 hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-[#2C2420]">Doorstep Delivery</span>
                    <span className="material-symbols-outlined text-[#C85A32]">two_wheeler</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    {subtotal >= freeThreshold ? 'Free Delivery' : `KES ${defaultDeliveryFee} flat across Nairobi`}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('PICKUP')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    deliveryMethod === 'PICKUP'
                      ? 'border-[#C85A32] bg-[#FAECE5] ring-1 ring-[#C85A32]'
                      : 'border-[#E8DFD3] bg-[#FAF7F2]/50 hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-[#2C2420]">Bakery Pickup</span>
                    <span className="material-symbols-outlined text-[#C85A32]">storefront</span>
                  </div>
                  <p className="text-xs text-stone-500">Free collection at our main shop</p>
                </button>
              </div>

              {/* Schedule Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {deliveryMethod === 'DELIVERY' ? 'Delivery Date' : 'Pickup Date'} *
                  </label>
                  <input
                    type="date"
                    min={minDateStr}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Requires min {minLeadHours}h preparation lead time</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Preferred Time Window *</label>
                  <select
                    value={scheduledTimeSlot}
                    onChange={(e) => setScheduledTimeSlot(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                  >
                    <option value="09:00 AM - 11:00 AM">Morning (09:00 AM - 11:00 AM)</option>
                    <option value="11:00 AM - 01:00 PM">Midday (11:00 AM - 01:00 PM)</option>
                    <option value="02:00 PM - 04:00 PM">Afternoon (02:00 PM - 04:00 PM)</option>
                    <option value="04:00 PM - 06:00 PM">Evening (04:00 PM - 06:00 PM)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Customer Contact Details */}
            <div className="bg-white p-6 rounded-3xl border border-[#E8DFD3] space-y-4">
              <h2 className="font-serif-display text-lg font-bold text-[#2C2420] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#C85A32]">person</span>
                <span>2. Contact Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={customerDetails.fullName}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, fullName: e.target.value })}
                    required
                    placeholder="Jane Doe"
                    className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Phone Number (M-Pesa) *</label>
                  <input
                    type="tel"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                    required
                    placeholder="0712 345 678"
                    className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                    required
                    placeholder="jane@example.com"
                    className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                  />
                </div>
              </div>

              {/* Delivery Address Details (if delivery selected) */}
              {deliveryMethod === 'DELIVERY' && (
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Street / Building / Area *</label>
                      <input
                        type="text"
                        value={deliveryAddress.street}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                        required
                        placeholder="e.g. Kileleshwa, Githunguri Rd, Apt 4B"
                        className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Landmark / Gate Instructions</label>
                      <input
                        type="text"
                        value={deliveryAddress.landmark}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, landmark: e.target.value })}
                        placeholder="Near QuickMart, Black gate"
                        className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Additional Order Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special notes for our baking team or driver..."
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-xs bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Pay Button */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E8DFD3] shadow-md space-y-6">
              <h2 className="font-serif-display text-lg font-bold text-[#2C2420] border-b border-stone-100 pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-normal text-stone-500">{cartItems.length} items</span>
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.cartKey} className="flex gap-3 text-xs border-b border-stone-100 pb-3">
                    <img
                      src={item.cakeImage || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=150&q=80'}
                      alt={item.cakeName}
                      className="w-14 h-14 rounded-xl object-cover border border-[#E8DFD3]"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-[#2C2420]">{item.cakeName}</p>
                      <p className="text-stone-500">{item.size?.name} • {item.flavour?.name}</p>
                      {item.customMessage && (
                        <p className="text-[10px] text-[#C85A32] italic">"{item.customMessage}"</p>
                      )}
                      <p className="font-semibold text-stone-700 mt-1">
                        Qty: {item.quantity} × KES {item.unitPrice?.toLocaleString()}
                      </p>
                    </div>
                    <span className="font-bold text-sm text-[#2C2420]">
                      KES {item.totalPrice?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Input */}
              <div className="pt-2 border-t border-stone-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Coupon code (e.g. SWEET10)"
                    className="flex-1 px-4 py-2 rounded-xl border border-[#E8DFD3] text-xs uppercase font-semibold bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoInput.trim()}
                    className="px-4 py-2 rounded-xl bg-[#2C2420] text-white font-bold text-xs hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
                  >
                    {promoLoading ? 'Checking...' : 'Apply'}
                  </button>
                </div>
                {appliedPromo && (
                  <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span>Coupon "{appliedPromo.code}" applied: -KES {appliedPromo.calculatedDiscount}</span>
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-2 text-xs border-t border-stone-100">
                <div className="flex justify-between text-stone-600">
                  <span>Cakes Subtotal</span>
                  <span className="font-semibold text-[#2C2420]">KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery ({deliveryMethod})</span>
                  <span className="font-semibold text-[#2C2420]">
                    {deliveryFee === 0 ? 'FREE' : `KES ${deliveryFee.toLocaleString()}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-KES {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-[#E8DFD3] pt-3 flex justify-between items-center text-base">
                  <span className="font-serif-display font-bold text-[#2C2420]">Total Amount</span>
                  <span className="font-serif-display font-extrabold text-2xl text-[#C85A32]">
                    KES {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingOrder}
                className="w-full py-4 rounded-full bg-[#C85A32] text-white font-bold text-base hover:bg-[#B04B25] transition-all shadow-xl shadow-orange-900/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submittingOrder ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Placing Your Order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order & Pay via M-Pesa</span>
                    <span className="material-symbols-outlined text-lg">payments</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 3. M-Pesa STK Push Payment Modal */}
      {showPaymentModal && activeOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-[#E8DFD3] shadow-2xl space-y-6 text-center relative">
            {paymentSuccess ? (
              <div className="space-y-4 py-4 animate-fadeIn">
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <h3 className="font-serif-display text-2xl font-bold text-[#2C2420]">Payment Received!</h3>
                <p className="text-xs text-stone-600">
                  Your order <strong>{activeOrder.orderNumber}</strong> has been confirmed. Our chef has received your baking instructions!
                </p>
                <div className="pt-4 flex flex-col gap-3">
                  <Link
                    to={`/track-order/${activeOrder.orderNumber}`}
                    className="w-full py-3.5 rounded-full bg-[#C85A32] text-white font-bold text-sm text-center shadow-md hover:bg-[#B04B25]"
                  >
                    Track Cake Preparation
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FAECE5] text-[#C85A32] flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">phone_iphone</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold tracking-widest text-[#C85A32]">M-Pesa STK Push</span>
                  <h3 className="font-serif-display text-2xl font-bold text-[#2C2420]">Complete Payment</h3>
                  <p className="text-xs text-stone-500">
                    Order Ref: <strong>{activeOrder.orderNumber}</strong> • Total: <strong className="text-[#C85A32]">KES {activeOrder.pricing?.grandTotal?.toLocaleString()}</strong>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] text-left space-y-3">
                  <label className="text-xs font-bold text-stone-700 block">
                    Enter Safaricom M-Pesa Phone Number:
                  </label>
                  <input
                    type="tel"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    placeholder="0712 345 678"
                    className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-white font-semibold text-[#2C2420] focus:border-[#C85A32] focus:outline-none"
                  />
                  <p className="text-[11px] text-stone-400">
                    A pop-up prompt will appear on this phone requesting your M-Pesa PIN.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerMpesaStk}
                  disabled={paymentPolling || !mpesaPhone}
                  className="w-full py-3.5 rounded-full bg-[#C85A32] text-white font-bold text-sm hover:bg-[#B04B25] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {paymentPolling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Awaiting PIN Confirmation...</span>
                    </>
                  ) : (
                    <>
                      <span>Send M-Pesa Prompt</span>
                      <span className="material-symbols-outlined text-base">send_to_mobile</span>
                    </>
                  )}
                </button>

                <div className="flex justify-between items-center text-xs text-stone-400 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => {
                      clearCart();
                      navigate(`/track-order/${activeOrder.orderNumber}`);
                    }}
                    className="hover:text-stone-700 underline"
                  >
                    Pay later / View Order
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="hover:text-stone-700"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
