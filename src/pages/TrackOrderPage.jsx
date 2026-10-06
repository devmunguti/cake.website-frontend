import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import { paymentApi } from '../api/paymentApi';
import { useSettings } from '../context/SettingsContext';
import { toast } from 'react-hot-toast';

export default function TrackOrderPage() {
  const { orderRef: paramOrderRef } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [searchRef, setSearchRef] = useState(paramOrderRef || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [payingStk, setPayingStk] = useState(false);
  const [stkPhone, setStkPhone] = useState('');

  const fetchOrder = async (ref) => {
    if (!ref || !ref.trim()) return;
    try {
      setLoading(true);
      const res = await orderApi.getOrderByRef(ref.trim());
      if (res.success && res.data) {
        setOrder(res.data);
        setStkPhone(res.data.customerDetails?.phone || '');
      } else {
        setOrder(null);
        toast.error('Order not found. Please check your reference code.');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setOrder(null);
      toast.error('Order not found. Please check your reference code.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramOrderRef) {
      fetchOrder(paramOrderRef);
    }
  }, [paramOrderRef]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchRef.trim()) {
      navigate(`/track-order/${searchRef.trim().toUpperCase()}`);
    }
  };

  const handlePayNow = async () => {
    if (!stkPhone) {
      toast.error('Please enter an M-Pesa phone number.');
      return;
    }
    try {
      setPayingStk(true);
      const res = await paymentApi.initiatePayment(order._id, stkPhone);
      if (res.success) {
        toast.success('M-Pesa STK Prompt sent! Enter your PIN on your phone.');
        setTimeout(() => fetchOrder(order.orderNumber), 8000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error triggering payment.');
    } finally {
      setPayingStk(false);
    }
  };

  const PIPELINE_STAGES = [
    { key: 'CONFIRMED', label: 'Order Confirmed', icon: 'receipt_long' },
    { key: 'PREPARING', label: 'Ingredients Prepared', icon: 'soup_kitchen' },
    { key: 'BAKING', label: 'Baking Sponge', icon: 'oven' },
    { key: 'DECORATING', label: 'Decorating & Piping', icon: 'palette' },
    { key: 'READY', label: order?.deliveryMethod === 'PICKUP' ? 'Ready for Pickup' : 'Out for Delivery', icon: 'local_shipping' },
    { key: 'COMPLETED', label: 'Delivered / Completed', icon: 'celebration' }
  ];

  const getCurrentStageIndex = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'PENDING_PAYMENT') return 0;
    if (s === 'PAYMENT_CONFIRMED' || s === 'ORDER_CONFIRMED') return 1;
    if (s === 'PREPARING') return 2;
    if (s === 'BAKING') return 3;
    if (s === 'DECORATING') return 4;
    if (s === 'READY' || s === 'OUT_FOR_DELIVERY' || s === 'PICKUP_READY') return 5;
    if (s === 'DELIVERED' || s === 'PICKED_UP' || s === 'COMPLETED') return 6;
    return 1;
  };

  const currentStageIndex = getCurrentStageIndex(order?.orderStatus || order?.status);

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-[#C85A32]">Live Bakery Tracking</span>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#2C2420]">
            Track Your Cake Order
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Follow the exact stage of your cake — from mixing and baking to icing and delivery.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto pt-4">
            <input
              type="text"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value.toUpperCase())}
              placeholder="Enter Order Reference (e.g. ORD-0001)"
              className="flex-1 px-5 py-3 rounded-full border border-[#E8DFD3] text-sm font-bold uppercase bg-white text-[#2C2420] focus:border-[#C85A32] focus:outline-none shadow-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-[#C85A32] text-white font-bold text-sm hover:bg-[#B04B25] shadow-md cursor-pointer"
            >
              Track
            </button>
          </form>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-[#C85A32] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-serif-display font-semibold text-stone-600">Locating order in kitchen...</p>
          </div>
        ) : order ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Status Hero Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DFD3] shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-serif-display text-2xl font-bold text-[#2C2420]">
                      Order {order.orderNumber}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Payment: {order.paymentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Scheduled for: <strong>{new Date(order.scheduledDate).toLocaleDateString()}</strong> ({order.scheduledTimeSlot}) • {order.deliveryMethod}
                  </p>
                </div>

                {order.paymentStatus !== 'PAID' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="tel"
                      value={stkPhone}
                      onChange={(e) => setStkPhone(e.target.value)}
                      placeholder="M-Pesa Phone"
                      className="px-3 py-1.5 rounded-xl border border-[#E8DFD3] text-xs font-bold w-36"
                    />
                    <button
                      onClick={handlePayNow}
                      disabled={payingStk}
                      className="px-4 py-2 rounded-full bg-[#C85A32] text-white text-xs font-bold hover:bg-[#B04B25]"
                    >
                      {payingStk ? 'Sending...' : 'Pay via M-Pesa'}
                    </button>
                  </div>
                )}
              </div>

              {/* Progress Pipeline */}
              <div className="pt-2">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-6">Bakery Production Pipeline</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {PIPELINE_STAGES.map((stage, idx) => {
                    const isDone = currentStageIndex >= idx + 1;
                    const isCurrent = currentStageIndex === idx + 1;

                    return (
                      <div
                        key={stage.key}
                        className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center space-y-2 transition-all ${
                          isCurrent
                            ? 'border-[#C85A32] bg-[#FAECE5] ring-2 ring-[#C85A32] shadow-sm'
                            : isDone
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-stone-100 bg-stone-50/60 text-stone-400'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCurrent
                              ? 'bg-[#C85A32] text-white'
                              : isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-200 text-stone-400'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xl">{stage.icon}</span>
                        </div>
                        <p className="font-bold text-xs leading-tight">{stage.label}</p>
                        {isCurrent && (
                          <span className="text-[10px] font-extrabold uppercase text-[#C85A32] animate-pulse">
                            In Progress
                          </span>
                        )}
                        {isDone && !isCurrent && (
                          <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs">done</span> Complete
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Items & Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Items Card */}
              <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#E8DFD3] space-y-4">
                <h3 className="font-serif-display text-lg font-bold text-[#2C2420] border-b border-stone-100 pb-3">
                  Ordered Cakes ({order.items?.length})
                </h3>

                <div className="space-y-4">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex gap-4 border-b border-stone-100 pb-4 last:border-0 last:pb-0">
                      <img
                        src={item.cakeImageSnapshot || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=200&q=80'}
                        alt={item.cakeNameSnapshot}
                        className="w-20 h-20 rounded-2xl object-cover border border-[#E8DFD3]"
                      />
                      <div className="flex-1 text-xs space-y-1">
                        <h4 className="font-serif-display font-bold text-base text-[#2C2420]">{item.cakeNameSnapshot}</h4>
                        <p className="text-stone-600">
                          <strong>Size:</strong> {item.size?.name} • <strong>Flavor:</strong> {item.flavour?.name} • <strong>Filling:</strong> {item.filling?.name}
                        </p>
                        {item.customMessage && (
                          <p className="text-[#C85A32] font-semibold italic bg-[#FAECE5] px-2.5 py-1 rounded-md inline-block">
                            Custom Writing: "{item.customMessage}"
                          </p>
                        )}
                        <p className="font-bold text-[#2C2420] pt-1">
                          Qty: {item.quantity} × KES {item.unitPrice?.toLocaleString()} = KES {item.totalPrice?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery & Timeline Card */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-[#E8DFD3] space-y-4 text-xs">
                  <h3 className="font-serif-display text-base font-bold text-[#2C2420] border-b border-stone-100 pb-2">
                    {order.deliveryMethod === 'DELIVERY' ? 'Delivery Address' : 'Pickup Point'}
                  </h3>

                  {order.deliveryMethod === 'DELIVERY' ? (
                    <div className="space-y-1 text-stone-600">
                      <p className="font-bold text-[#2C2420]">{order.customerDetails?.fullName}</p>
                      <p>{order.deliveryAddress?.street}</p>
                      {order.deliveryAddress?.landmark && <p>Landmark: {order.deliveryAddress.landmark}</p>}
                      <p>Phone: {order.customerDetails?.phone}</p>
                    </div>
                  ) : (
                    <div className="space-y-1 text-stone-600">
                      <p className="font-bold text-[#2C2420]">{settings?.platformName || 'Sweet Delights Bakery'}</p>
                      <p>{settings?.storeAddress || 'Main Bakery Shop, Nairobi'}</p>
                      <p>Customer: {order.customerDetails?.fullName} ({order.customerDetails?.phone})</p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-stone-100 space-y-1.5">
                    <div className="flex justify-between text-stone-500">
                      <span>Subtotal</span>
                      <span className="font-bold text-[#2C2420]">KES {order.pricing?.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>Delivery</span>
                      <span className="font-bold text-[#2C2420]">KES {order.pricing?.deliveryFee || 0}</span>
                    </div>
                    <div className="flex justify-between text-base font-serif-display font-extrabold text-[#C85A32] pt-1 border-t border-stone-100">
                      <span>Total</span>
                      <span>KES {order.pricing?.grandTotal?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Review Prompt if order is completed */}
                {['DELIVERED', 'COMPLETED', 'PICKED_UP'].includes((order.orderStatus || order.status || '').toUpperCase()) && (
                  <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-center space-y-3">
                    <h4 className="font-serif-display font-bold text-amber-900">How was your cake?</h4>
                    <p className="text-xs text-amber-800">Your feedback helps us make every celebration even more memorable.</p>
                    <Link
                      to={`/reviews?orderRef=${order.orderNumber}`}
                      className="inline-block px-6 py-2.5 rounded-full bg-[#C85A32] text-white font-bold text-xs hover:bg-[#B04B25]"
                    >
                      Leave a 5-Star Review
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
