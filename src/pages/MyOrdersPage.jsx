import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import { useAuth } from '../context/AuthContext';

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const res = await orderApi.getMyOrders();
        if (res.success) {
          setOrders(res.data || []);
        }
      } catch (err) {
        console.error('Error fetching customer orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#C85A32]">Customer Portal</span>
            <h1 className="font-serif-display text-3xl font-bold text-[#2C2420]">
              My Cake Orders
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">Welcome back, {user?.fullName || 'Customer'}</p>
          </div>

          <Link
            to="/cakes"
            className="px-6 py-2.5 rounded-full bg-[#C85A32] text-white font-bold text-xs hover:bg-[#B04B25] shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">cake</span>
            <span>Order a New Cake</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-[#C85A32] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-serif-display font-semibold text-stone-600">Loading your past orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#E8DFD3] text-center space-y-4">
            <span className="material-symbols-outlined text-5xl text-stone-300">receipt_long</span>
            <h3 className="font-serif-display text-xl font-bold text-[#2C2420]">No Orders Yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              You haven't placed any cake orders with us yet. Start celebrating with an artisanal creation!
            </p>
            <Link
              to="/cakes"
              className="inline-block px-8 py-3.5 rounded-full bg-[#C85A32] text-white font-bold text-sm"
            >
              Explore Cake Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord._id}
                className="bg-white p-6 rounded-3xl border border-[#E8DFD3] shadow-sm hover:border-[#C85A32] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-serif-display font-bold text-lg text-[#2C2420]">
                      {ord.orderNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ord.paymentStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.paymentStatus}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7F2] text-[#C85A32] uppercase">
                      {ord.orderStatus}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600">
                    Scheduled: <strong>{new Date(ord.scheduledDate).toLocaleDateString()}</strong> • {ord.deliveryMethod} ({ord.items?.length} items)
                  </p>

                  <div className="flex gap-2 flex-wrap pt-1">
                    {ord.items?.map((item, idx) => (
                      <span key={idx} className="text-[11px] bg-stone-100 px-2 py-0.5 rounded text-stone-700">
                        {item.cakeNameSnapshot} ({item.size?.name})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-stone-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Total</span>
                    <span className="font-serif-display font-extrabold text-xl text-[#C85A32]">
                      KES {ord.pricing?.grandTotal?.toLocaleString()}
                    </span>
                  </div>

                  <Link
                    to={`/track-order/${ord.orderNumber}`}
                    className="px-5 py-2 rounded-full bg-[#FAF7F2] text-[#C85A32] font-bold text-xs hover:bg-[#FAECE5] border border-[#E8DFD3] transition-colors"
                  >
                    Track Progress →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
