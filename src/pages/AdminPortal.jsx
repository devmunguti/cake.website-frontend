import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/orderApi';
import { cakeApi } from '../api/cakeApi';
import { categoryApi } from '../api/categoryApi';
import { customCakeApi } from '../api/customCakeApi';
import { paymentApi } from '../api/paymentApi';
import { reviewApi } from '../api/reviewApi';
import { promotionApi } from '../api/promotionApi';
import { systemSettingsApi } from '../api/systemSettingsApi';
import { auditLogApi } from '../api/auditLogApi';
import { toast } from 'react-hot-toast';

export default function AdminPortal() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'overview';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cakes State
  const [cakes, setCakes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCakeModal, setShowCakeModal] = useState(false);
  const [editingCake, setEditingCake] = useState(null);
  const [cakeForm, setCakeForm] = useState({
    name: '',
    category: '',
    basePrice: '',
    description: '',
    images: '',
    preparationTimeHours: 24,
    preparationTimeText: '24-48 hours',
    available: true,
    featured: false
  });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  // Custom Cakes State
  const [customRequests, setCustomRequests] = useState([]);
  const [quoteModalReq, setQuoteModalReq] = useState(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');

  // Payments State
  const [payments, setPayments] = useState([]);
  const [showManualPayModal, setShowManualPayModal] = useState(false);
  const [manualPayOrderNumber, setManualPayOrderNumber] = useState('');
  const [manualPayReceipt, setManualPayReceipt] = useState('');

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [replyingReview, setReplyingReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Promotions State
  const [promotions, setPromotions] = useState([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoForm, setPromoForm] = useState({
    code: '',
    title: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 2000,
    endDate: ''
  });

  // Settings State
  const [settingsData, setSettingsData] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Audit Logs State
  const [logs, setLogs] = useState([]);
  const [logCategoryFilter, setLogCategoryFilter] = useState('All');
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // Fetch data based on active tab
  useEffect(() => {
    async function loadTabData() {
      setLoading(true);
      try {
        if (activeTab === 'overview') {
          const res = await orderApi.getDashboardStats();
          if (res.success) setStats(res.data);
        } else if (activeTab === 'cakes') {
          const [cakesRes, catRes] = await Promise.all([
            cakeApi.getCakes({ limit: 100 }),
            categoryApi.getCategories()
          ]);
          if (cakesRes.success) setCakes(cakesRes.data || []);
          if (catRes.success) setCategories(catRes.data || []);
        } else if (activeTab === 'orders') {
          const params = orderStatusFilter !== 'All' ? { orderStatus: orderStatusFilter } : {};
          const res = await orderApi.getAdminOrders(params);
          if (res.success) setOrders(res.data || []);
        } else if (activeTab === 'customCakes') {
          const res = await customCakeApi.getAdminRequests();
          if (res.success) setCustomRequests(res.data || []);
        } else if (activeTab === 'payments') {
          const res = await paymentApi.getAdminPayments();
          if (res.success) setPayments(res.data || []);
        } else if (activeTab === 'reviews') {
          const res = await reviewApi.getReviews({ limit: 50 });
          if (res.success) setReviews(res.data || []);
        } else if (activeTab === 'promotions') {
          const res = await promotionApi.getAdminPromotions();
          if (res.success) setPromotions(res.data || []);
        } else if (activeTab === 'settings') {
          const res = await systemSettingsApi.getSettings();
          if (res.success) {
            setSettingsData(res.data || {
              general: {},
              bakeryOperations: {},
              operations: {},
              paymentMethods: {}
            });
          }
        } else if (activeTab === 'logs') {
          const params = {};
          if (logCategoryFilter !== 'All') params.category = logCategoryFilter;
          if (logSearchQuery.trim()) params.search = logSearchQuery.trim();
          const res = await auditLogApi.getLogs(params);
          if (res.success) {
            const list = Array.isArray(res.data) ? res.data : (res.data?.logs || []);
            setLogs(list);
          }
        }
      } catch (err) {
        console.error('Error loading tab data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTabData();
  }, [activeTab, orderStatusFilter, logCategoryFilter]);

  const setTab = (tabName) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tabName);
    setSearchParams(newParams);
  };

  // Cake Save Handler
  const handleSaveCake = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...cakeForm,
        basePrice: Number(cakeForm.basePrice),
        images: cakeForm.images ? cakeForm.images.split(',').map((s) => s.trim()).filter(Boolean) : []
      };

      if (editingCake) {
        const res = await cakeApi.updateCake(editingCake._id, payload);
        if (res.success) toast.success('Cake updated successfully!');
      } else {
        const res = await cakeApi.createCake(payload);
        if (res.success) toast.success('New cake added to catalog!');
      }
      setShowCakeModal(false);
      setEditingCake(null);
      const updated = await cakeApi.getCakes({ limit: 100 });
      if (updated.success) setCakes(updated.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving cake.');
    }
  };

  // Order Status Update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await orderApi.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        toast.success(`Order status updated to ${newStatus}`);
        const updated = await orderApi.getAdminOrders(orderStatusFilter !== 'All' ? { orderStatus: orderStatusFilter } : {});
        if (updated.success) setOrders(updated.data || []);
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(res.data);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating status.');
    }
  };

  // Custom Cake Quote Submit
  const handleSendQuote = async (e) => {
    e.preventDefault();
    if (!quoteAmount || Number(quoteAmount) <= 0) {
      toast.error('Please enter a valid quote amount.');
      return;
    }
    try {
      const res = await customCakeApi.provideQuote(quoteModalReq._id, {
        quoteAmount: Number(quoteAmount),
        quoteNotes
      });
      if (res.success) {
        toast.success(`Quote sent: KES ${quoteAmount}`);
        setQuoteModalReq(null);
        setQuoteAmount('');
        setQuoteNotes('');
        const updated = await customCakeApi.getAdminRequests();
        if (updated.success) setCustomRequests(updated.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending quotation.');
    }
  };

  // Manual Payment Verification
  const handleManualVerifyPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await paymentApi.manualVerify(manualPayOrderNumber.trim(), manualPayReceipt.trim());
      if (res.success) {
        toast.success('Payment verified manually!');
        setShowManualPayModal(false);
        setManualPayOrderNumber('');
        setManualPayReceipt('');
        const updated = await paymentApi.getAdminPayments();
        if (updated.success) setPayments(updated.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error verifying payment.');
    }
  };

  // Reply Review Handler
  const handleReplyReview = async (e) => {
    e.preventDefault();
    try {
      const res = await reviewApi.replyToReview(replyingReview._id, replyText);
      if (res.success) {
        toast.success('Reply posted!');
        setReplyingReview(null);
        setReplyText('');
        const updated = await reviewApi.getReviews({ limit: 50 });
        if (updated.success) setReviews(updated.data || []);
      }
    } catch (err) {
      toast.error('Error posting reply.');
    }
  };

  // Promotion Create Handler
  const handleCreatePromo = async (e) => {
    e.preventDefault();
    try {
      const res = await promotionApi.createPromotion(promoForm);
      if (res.success) {
        toast.success('Promotion coupon created!');
        setShowPromoModal(false);
        const updated = await promotionApi.getAdminPromotions();
        if (updated.success) setPromotions(updated.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating promotion.');
    }
  };

  // Save Settings Handler
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await systemSettingsApi.updateSettings(settingsData);
      if (res.success) {
        toast.success('Bakery settings saved successfully!');
        if (res.data) setSettingsData(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Audit Logs Search Handler
  const handleAuditSearch = async (e) => {
    if (e) e.preventDefault();
    try {
      const params = {};
      if (logCategoryFilter !== 'All') params.category = logCategoryFilter;
      if (logSearchQuery.trim()) params.search = logSearchQuery.trim();
      const res = await auditLogApi.getLogs(params);
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.logs || []);
        setLogs(list);
      }
    } catch (err) {
      toast.error('Error fetching filtered audit logs');
    }
  };

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'cakes', label: 'Cakes Catalog', icon: 'cake' },
    { id: 'orders', label: 'Orders Pipeline', icon: 'receipt_long' },
    { id: 'customCakes', label: 'Custom Cake Quotes', icon: 'auto_awesome' },
    { id: 'payments', label: 'Payments Ledger', icon: 'payments' },
    { id: 'reviews', label: 'Reviews', icon: 'rate_review' },
    { id: 'promotions', label: 'Coupons & Promos', icon: 'local_offer' },
    { id: 'settings', label: 'Store Settings', icon: 'settings' },
    { id: 'logs', label: 'Audit Logs', icon: 'security' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#2C2420] text-white p-6 flex flex-col justify-between border-r border-[#4A3E39]">
        <div className="space-y-8">
          {/* Admin Header */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C85A32] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">cake</span>
            </div>
            <div>
              <h2 className="font-serif-display font-bold text-base text-white">Bakery Admin</h2>
              <span className="text-[10px] text-[#C85A32] font-semibold uppercase tracking-wider block">Owner Command Center</span>
            </div>
          </Link>

          {/* Nav Tab Items */}
          <nav className="space-y-1">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#C85A32] text-white shadow-md'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-6 border-t border-stone-800">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-white mb-3"
          >
            <span className="material-symbols-outlined text-sm">storefront</span>
            <span>View Public Storefront</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Top Breadcrumb & User Info */}
        <div className="flex items-center justify-between pb-8 border-b border-[#E8DFD3] mb-8">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#C85A32]">Store Management</span>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2C2420]">
              {navTabs.find((t) => t.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-stone-500">Signed in as <strong>{user?.fullName || 'Owner'}</strong></span>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8 animate-fadeIn">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-[#E8DFD3] shadow-sm space-y-1">
                <span className="text-xs font-bold text-stone-400 uppercase">Today's Orders</span>
                <p className="font-serif-display font-extrabold text-3xl text-[#2C2420]">{stats.todayOrdersCount}</p>
                <span className="text-[11px] text-[#C85A32] font-semibold">{stats.pendingOrdersCount} pending payment/prep</span>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-[#E8DFD3] shadow-sm space-y-1">
                <span className="text-xs font-bold text-stone-400 uppercase">In Kitchen (Baking)</span>
                <p className="font-serif-display font-extrabold text-3xl text-amber-600">{stats.bakingCount}</p>
                <span className="text-[11px] text-stone-500">{stats.readyCount} ready for pickup/delivery</span>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-[#E8DFD3] shadow-sm space-y-1">
                <span className="text-xs font-bold text-stone-400 uppercase">Today's Revenue</span>
                <p className="font-serif-display font-extrabold text-3xl text-emerald-600">KES {stats.todayRevenue?.toLocaleString()}</p>
                <span className="text-[11px] text-stone-500">KES {stats.monthlyRevenue?.toLocaleString()} this month</span>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-[#E8DFD3] shadow-sm space-y-1">
                <span className="text-xs font-bold text-stone-400 uppercase">Total Completed</span>
                <p className="font-serif-display font-extrabold text-3xl text-[#C85A32]">{stats.completedOrdersCount}</p>
                <span className="text-[11px] text-stone-500">{stats.totalCustomersCount} unique customers</span>
              </div>
            </div>

            {/* Popular Cakes Table */}
            <div className="bg-white p-6 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-4">
              <h3 className="font-serif-display text-lg font-bold text-[#2C2420]">Top Selling Cakes</h3>
              <div className="divide-y divide-stone-100">
                {stats.popularCakes?.map((c, i) => (
                  <div key={i} className="py-3 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2C2420]">{c._id || 'Specialty Cake'}</span>
                    <span className="text-stone-500">{c.count} sold • KES {c.revenue?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CAKES CATALOG */}
        {activeTab === 'cakes' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <p className="text-xs text-stone-500">Manage cakes, sizes, flavors, and pricing.</p>
              <button
                onClick={() => {
                  setEditingCake(null);
                  setCakeForm({
                    name: '',
                    category: categories[0]?._id || '',
                    basePrice: 2500,
                    description: '',
                    images: '',
                    preparationTimeHours: 24,
                    preparationTimeText: '24 hours',
                    available: true,
                    featured: false
                  });
                  setShowCakeModal(true);
                }}
                className="px-6 py-2.5 rounded-full bg-[#C85A32] text-white font-bold text-xs hover:bg-[#B04B25] flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Add New Cake</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8DFD3] shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-stone-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Cake</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Base Price</th>
                    <th className="p-4">Lead Time</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Featured</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {cakes.map((cake) => (
                    <tr key={cake._id} className="hover:bg-stone-50/60">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={cake.images?.[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=100&q=80'}
                          alt={cake.name}
                          className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                        />
                        <div>
                          <p className="font-bold text-[#2C2420]">{cake.name}</p>
                          <span className="text-[10px] text-stone-400">Slug: {cake.slug}</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-stone-700">{cake.categoryName || 'General'}</td>
                      <td className="p-4 font-bold text-[#C85A32]">KES {cake.basePrice?.toLocaleString()}</td>
                      <td className="p-4 text-stone-600">{cake.preparationTimeText || '24 hrs'}</td>
                      <td className="p-4">
                        <button
                          onClick={async () => {
                            await cakeApi.toggleAvailability(cake._id);
                            const updated = await cakeApi.getCakes({ limit: 100 });
                            if (updated.success) setCakes(updated.data || []);
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase cursor-pointer ${
                            cake.available ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {cake.available ? 'Available' : 'Disabled'}
                        </button>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={async () => {
                            await cakeApi.toggleFeatured(cake._id);
                            const updated = await cakeApi.getCakes({ limit: 100 });
                            if (updated.success) setCakes(updated.data || []);
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase cursor-pointer ${
                            cake.featured ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-400'
                          }`}
                        >
                          {cake.featured ? 'Featured ★' : 'No'}
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingCake(cake);
                            setCakeForm({
                              name: cake.name,
                              category: cake.category?._id || cake.category || categories[0]?._id,
                              basePrice: cake.basePrice,
                              description: cake.description,
                              images: cake.images?.join(', ') || '',
                              preparationTimeHours: cake.preparationTimeHours || 24,
                              preparationTimeText: cake.preparationTimeText || '24 hours',
                              available: cake.available,
                              featured: cake.featured
                            });
                            setShowCakeModal(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-[#FAECE5] text-[#C85A32] font-bold hover:bg-[#F5D8CC]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete cake "${cake.name}"?`)) {
                              await cakeApi.deleteCake(cake._id);
                              toast.success('Cake deleted');
                              const updated = await cakeApi.getCakes({ limit: 100 });
                              if (updated.success) setCakes(updated.data || []);
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-rose-50 text-rose-600 font-bold hover:bg-rose-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS PIPELINE */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['All', 'PENDING_PAYMENT', 'ORDER_CONFIRMED', 'PREPARING', 'BAKING', 'DECORATING', 'READY', 'DELIVERED', 'COMPLETED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    orderStatusFilter === st
                      ? 'bg-[#C85A32] text-white'
                      : 'bg-white border border-[#E8DFD3] text-stone-600 hover:bg-[#FAECE5]'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-[#E8DFD3] shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-stone-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Order Ref</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Scheduled Date</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Order Pipeline Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-stone-50/60">
                      <td className="p-4 font-bold text-[#2C2420]">{ord.orderNumber}</td>
                      <td className="p-4">
                        <p className="font-bold text-stone-800">{ord.customerDetails?.fullName}</p>
                        <p className="text-[10px] text-stone-400">{ord.customerDetails?.phone}</p>
                      </td>
                      <td className="p-4 text-stone-600">
                        {new Date(ord.scheduledDate).toLocaleDateString()} ({ord.scheduledTimeSlot})
                      </td>
                      <td className="p-4 font-bold text-[#C85A32]">KES {ord.pricing?.grandTotal?.toLocaleString()}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            ord.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={ord.orderStatus || ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-[#E8DFD3] text-xs font-bold bg-[#FAF7F2] text-[#2C2420] focus:border-[#C85A32]"
                        >
                          <option value="PENDING_PAYMENT">Pending Payment</option>
                          <option value="PAYMENT_CONFIRMED">Payment Confirmed</option>
                          <option value="ORDER_CONFIRMED">Order Confirmed</option>
                          <option value="PREPARING">Preparing Ingredients</option>
                          <option value="BAKING">Baking in Oven</option>
                          <option value="DECORATING">Decorating & Piping</option>
                          <option value="READY">Ready for Pickup / Delivery</option>
                          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="PICKED_UP">Picked Up</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] text-[#C85A32] font-bold border border-[#E8DFD3] hover:bg-[#FAECE5]"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOM CAKE REQUESTS */}
        {activeTab === 'customCakes' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl border border-[#E8DFD3] shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-stone-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Ref</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Occasion & Serves</th>
                    <th className="p-4">Event Date</th>
                    <th className="p-4">Budget / Quote</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {customRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-stone-50/60">
                      <td className="p-4 font-bold text-[#2C2420]">{req.requestRef}</td>
                      <td className="p-4">
                        <p className="font-bold text-stone-800">{req.customerName}</p>
                        <p className="text-[10px] text-stone-400">{req.customerPhone}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-stone-800">{req.eventType} ({req.numberOfGuests} guests)</p>
                        <p className="text-[10px] text-stone-500 line-clamp-1">{req.designRequirements}</p>
                      </td>
                      <td className="p-4 text-stone-600">{new Date(req.eventDate).toLocaleDateString()}</td>
                      <td className="p-4">
                        {req.quoteAmount > 0 ? (
                          <span className="font-bold text-emerald-600">Quote: KES {req.quoteAmount.toLocaleString()}</span>
                        ) : (
                          <span className="text-stone-400">Budget: KES {req.budget?.toLocaleString() || 'Flexible'}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#FAECE5] text-[#C85A32]">
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setQuoteModalReq(req);
                            setQuoteAmount(req.quoteAmount || req.budget || '');
                            setQuoteNotes(req.quoteNotes || '');
                          }}
                          className="px-4 py-1.5 rounded-full bg-[#C85A32] text-white font-bold text-xs hover:bg-[#B04B25]"
                        >
                          Send Quote
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: PAYMENTS LEDGER */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <p className="text-xs text-stone-500">M-Pesa transaction codes and payment reconciliations.</p>
              <button
                onClick={() => setShowManualPayModal(true)}
                className="px-6 py-2.5 rounded-full bg-[#2C2420] text-white font-bold text-xs hover:bg-stone-800 flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">verified</span>
                <span>Manual Payment Verification</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8DFD3] shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-stone-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Order Ref</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Receipt / Ref</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-stone-50/60">
                      <td className="p-4 text-stone-500">{new Date(p.createdAt).toLocaleString()}</td>
                      <td className="p-4 font-bold text-[#2C2420]">{p.orderNumber || p.orderId}</td>
                      <td className="p-4">
                        <p className="font-bold text-stone-800">{p.customerName}</p>
                        <p className="text-[10px] text-stone-400">{p.phoneNumber}</p>
                      </td>
                      <td className="p-4 font-bold text-emerald-700">KES {p.amount?.toLocaleString()}</td>
                      <td className="p-4 font-mono font-bold text-stone-700">{p.transactionId || p.payheroReference || '—'}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            p.status?.toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-6 rounded-3xl bg-white border border-[#E8DFD3] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#2C2420]">{rev.customerName}</h4>
                      <p className="text-[11px] text-[#C85A32] font-semibold">{rev.cakeName || 'Artisanal Cake'} • Order {rev.orderNumber}</p>
                    </div>
                    <div className="flex text-amber-400 text-sm">{'★'.repeat(rev.rating)}</div>
                  </div>

                  <p className="text-xs text-stone-700 italic">"{rev.comment}"</p>

                  {rev.adminReply?.text && (
                    <div className="p-3 rounded-2xl bg-[#FAECE5] text-xs text-stone-800">
                      <span className="font-bold text-[#C85A32] block">Bakery Reply:</span>
                      {rev.adminReply.text}
                    </div>
                  )}

                  <div className="pt-2 flex justify-between items-center border-t border-stone-100">
                    <button
                      onClick={() => {
                        setReplyingReview(rev);
                        setReplyText(rev.adminReply?.text || '');
                      }}
                      className="text-xs text-[#C85A32] font-bold hover:underline"
                    >
                      {rev.adminReply?.text ? 'Edit Reply' : 'Reply to Customer'}
                    </button>
                    <button
                      onClick={async () => {
                        await reviewApi.togglePublish(rev._id);
                        const updated = await reviewApi.getReviews({ limit: 50 });
                        if (updated.success) setReviews(updated.data || []);
                      }}
                      className="text-xs text-stone-500 hover:text-stone-800"
                    >
                      {rev.isPublished ? 'Hide from Web' : 'Publish'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: PROMOTIONS */}
        {activeTab === 'promotions' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <p className="text-xs text-stone-500">Create discount coupons for seasonal campaigns and celebrations.</p>
              <button
                onClick={() => setShowPromoModal(true)}
                className="px-6 py-2.5 rounded-full bg-[#C85A32] text-white font-bold text-xs hover:bg-[#B04B25] flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Create Promo Code</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((pr) => (
                <div key={pr._id} className="p-6 rounded-3xl bg-white border border-[#E8DFD3] shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 rounded-full bg-[#FAECE5] text-[#C85A32] font-bold text-xs font-mono uppercase">
                      {pr.code}
                    </span>
                    <span className="text-[10px] font-bold text-stone-400">
                      {pr.discountType === 'percentage' ? `${pr.discountValue}% OFF` : `KES ${pr.discountValue} OFF`}
                    </span>
                  </div>
                  <h4 className="font-serif-display font-bold text-base text-[#2C2420]">{pr.title}</h4>
                  <p className="text-xs text-stone-500">Min Order: KES {pr.minOrderAmount?.toLocaleString() || 0}</p>
                  <p className="text-[11px] text-stone-400">Expires: {new Date(pr.endDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: STORE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-4xl animate-fadeIn">
            {!settingsData ? (
              <div className="bg-white p-8 rounded-3xl border border-[#E8DFD3] text-center text-stone-500">
                Loading store configuration...
              </div>
            ) : (
              <form onSubmit={handleSaveSettings} className="bg-white p-8 rounded-3xl border border-[#E8DFD3] shadow-sm space-y-8">
                {/* Bakery Branding */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                    <span className="material-symbols-outlined text-[#C85A32]">storefront</span>
                    <h3 className="font-serif-display text-lg font-bold text-[#2C2420]">Bakery Brand & Contact Info</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Bakery Name</label>
                      <input
                        type="text"
                        value={settingsData.general?.platformName || ''}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          general: { ...(settingsData.general || {}), platformName: e.target.value }
                        })}
                        className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Currency Code</label>
                      <input
                        type="text"
                        value={settingsData.general?.currency || 'KES'}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          general: { ...(settingsData.general || {}), currency: e.target.value.toUpperCase() }
                        })}
                        className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm font-mono uppercase bg-[#FAF7F2]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Customer Support Phone</label>
                      <input
                        type="text"
                        value={settingsData.general?.supportPhone || ''}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          general: { ...(settingsData.general || {}), supportPhone: e.target.value }
                        })}
                        placeholder="+254 700 000 000"
                        className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">WhatsApp Orders Number</label>
                      <input
                        type="text"
                        value={settingsData.general?.whatsappNumber || ''}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          general: { ...(settingsData.general || {}), whatsappNumber: e.target.value }
                        })}
                        placeholder="+254 700 000 000"
                        className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Customer Support Email</label>
                      <input
                        type="email"
                        value={settingsData.general?.supportEmail || ''}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          general: { ...(settingsData.general || {}), supportEmail: e.target.value }
                        })}
                        className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Admin Alert Notification Email</label>
                      <input
                        type="email"
                        value={settingsData.general?.adminAlertEmail || ''}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          general: { ...(settingsData.general || {}), adminAlertEmail: e.target.value }
                        })}
                        className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-stone-700 block mb-1">Store Physical / Pickup Address</label>
                      <input
                        type="text"
                        value={settingsData.general?.storeAddress || ''}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          general: { ...(settingsData.general || {}), storeAddress: e.target.value }
                        })}
                        placeholder="1st Avenue, Parklands / Westlands, Nairobi, Kenya"
                        className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2]"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery & Operations */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                    <span className="material-symbols-outlined text-[#C85A32]">local_shipping</span>
                    <h3 className="font-serif-display text-lg font-bold text-[#2C2420]">Delivery & Lead Times</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Default Delivery Fee (KES)</label>
                      <input
                        type="number"
                        value={settingsData.bakeryOperations?.defaultDeliveryFee ?? 350}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          bakeryOperations: { ...(settingsData.bakeryOperations || {}), defaultDeliveryFee: Number(e.target.value) }
                        })}
                        className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Free Delivery Threshold (KES)</label>
                      <input
                        type="number"
                        value={settingsData.bakeryOperations?.freeDeliveryThreshold ?? 6000}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          bakeryOperations: { ...(settingsData.bakeryOperations || {}), freeDeliveryThreshold: Number(e.target.value) }
                        })}
                        className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Min Prep Lead Time (Hours)</label>
                      <input
                        type="number"
                        value={settingsData.bakeryOperations?.minimumLeadTimeHours ?? 24}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          bakeryOperations: { ...(settingsData.bakeryOperations || {}), minimumLeadTimeHours: Number(e.target.value) }
                        })}
                        className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Daily Opening Time</label>
                      <input
                        type="text"
                        value={settingsData.bakeryOperations?.openingTime || '08:00 AM'}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          bakeryOperations: { ...(settingsData.bakeryOperations || {}), openingTime: e.target.value }
                        })}
                        className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Daily Closing Time</label>
                      <input
                        type="text"
                        value={settingsData.bakeryOperations?.closingTime || '07:00 PM'}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          bakeryOperations: { ...(settingsData.bakeryOperations || {}), closingTime: e.target.value }
                        })}
                        className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Pickup Instructions for Customer</label>
                      <textarea
                        rows={3}
                        value={settingsData.bakeryOperations?.pickupInstructions || ''}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          bakeryOperations: { ...(settingsData.bakeryOperations || {}), pickupInstructions: e.target.value }
                        })}
                        className="w-full p-3 rounded-xl border border-[#E8DFD3] text-xs bg-[#FAF7F2]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Delivery Instructions for Customer</label>
                      <textarea
                        rows={3}
                        value={settingsData.bakeryOperations?.deliveryInstructions || ''}
                        onChange={(e) => setSettingsData({
                          ...settingsData,
                          bakeryOperations: { ...(settingsData.bakeryOperations || {}), deliveryInstructions: e.target.value }
                        })}
                        className="w-full p-3 rounded-xl border border-[#E8DFD3] text-xs bg-[#FAF7F2]"
                      />
                    </div>
                  </div>
                </div>

                {/* Operations & Maintenance */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                    <span className="material-symbols-outlined text-[#C85A32]">build</span>
                    <h3 className="font-serif-display text-lg font-bold text-[#2C2420]">System & Maintenance Controls</h3>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD3]">
                    <input
                      type="checkbox"
                      id="maintToggle"
                      checked={!!settingsData.operations?.maintenanceMode}
                      onChange={(e) => setSettingsData({
                        ...settingsData,
                        operations: { ...(settingsData.operations || {}), maintenanceMode: e.target.checked }
                      })}
                      className="w-5 h-5 rounded text-[#C85A32] accent-[#C85A32] cursor-pointer"
                    />
                    <label htmlFor="maintToggle" className="cursor-pointer">
                      <span className="font-bold text-sm text-[#2C2420] block">Bakery Maintenance Mode</span>
                      <span className="text-xs text-stone-500 block">When activated, customers will see a friendly temporary maintenance banner during checkout.</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-8 py-3.5 rounded-full bg-[#C85A32] text-white font-bold text-sm hover:bg-[#B04B25] shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingSettings && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                    <span>{savingSettings ? 'Saving Settings...' : 'Save Bakery Settings'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 9: AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-3xl border border-[#E8DFD3] shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
              <form onSubmit={handleAuditSearch} className="flex-1 flex gap-2 w-full">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">search</span>
                  <input
                    type="text"
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    placeholder="Search logs by user, action, IP, or details..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8DFD3] text-xs bg-[#FAF7F2]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#2C2420] text-white text-xs font-bold hover:bg-[#1f1916] cursor-pointer"
                >
                  Search
                </button>
              </form>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={logCategoryFilter}
                  onChange={(e) => setLogCategoryFilter(e.target.value)}
                  className="p-2.5 rounded-xl border border-[#E8DFD3] text-xs bg-[#FAF7F2] font-semibold text-stone-700"
                >
                  <option value="All">All Categories</option>
                  <option value="Auth">Auth</option>
                  <option value="Order">Order</option>
                  <option value="Cake">Cake</option>
                  <option value="CustomCake">CustomCake</option>
                  <option value="Payment">Payment</option>
                  <option value="Settings">Settings</option>
                  <option value="Review">Review</option>
                </select>

                <button
                  onClick={() => handleAuditSearch()}
                  title="Refresh Logs"
                  className="p-2.5 rounded-xl border border-[#E8DFD3] text-stone-700 hover:bg-[#FAF7F2] flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                </button>
              </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-3xl border border-[#E8DFD3] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#E8DFD3] bg-[#FAF7F2]/50 flex justify-between items-center">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Audit Activity Stream ({logs?.length || 0} recorded events)
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-[#E8DFD3] text-stone-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Action</th>
                      <th className="p-4">User</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Details</th>
                      <th className="p-4">IP Address</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {!logs || logs.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-stone-500">
                          No audit logs found matching the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log._id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="p-4 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="p-4 font-bold text-[#2C2420] whitespace-nowrap">
                            {log.action}
                          </td>
                          <td className="p-4 text-stone-700 whitespace-nowrap">
                            <span className="font-semibold">{log.userName || 'System'}</span>
                            {log.role && <span className="text-[10px] text-stone-400 block uppercase">({log.role})</span>}
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FAF7F2] text-[#C85A32] border border-[#E8DFD3]">
                              {log.category || 'General'}
                            </span>
                          </td>
                          <td className="p-4 text-stone-600 max-w-sm">
                            <p className="line-clamp-2">{log.details}</p>
                          </td>
                          <td className="p-4 font-mono text-[10px] text-stone-400 whitespace-nowrap">
                            {log.ipAddress || '-'}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${log.status === 'Success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {log.status || 'Success'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Cake Add/Edit Modal */}
      {showCakeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 border border-[#E8DFD3] shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-serif-display text-xl font-bold text-[#2C2420]">
                {editingCake ? `Edit Cake: ${editingCake.name}` : 'Add New Artisanal Cake'}
              </h3>
              <button onClick={() => setShowCakeModal(false)} className="text-stone-400 hover:text-stone-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCake} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Cake Name *</label>
                  <input
                    type="text"
                    value={cakeForm.name}
                    onChange={(e) => setCakeForm({ ...cakeForm, name: e.target.value })}
                    required
                    className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Category *</label>
                  <select
                    value={cakeForm.category}
                    onChange={(e) => setCakeForm({ ...cakeForm, category: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2]"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Base Price (KES) *</label>
                  <input
                    type="number"
                    value={cakeForm.basePrice}
                    onChange={(e) => setCakeForm({ ...cakeForm, basePrice: e.target.value })}
                    required
                    className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Preparation Lead Time Text</label>
                  <input
                    type="text"
                    value={cakeForm.preparationTimeText}
                    onChange={(e) => setCakeForm({ ...cakeForm, preparationTimeText: e.target.value })}
                    placeholder="e.g. 24 hours"
                    className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={cakeForm.description}
                  onChange={(e) => setCakeForm({ ...cakeForm, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-xs bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Image URLs (comma-separated)</label>
                <input
                  type="text"
                  value={cakeForm.images}
                  onChange={(e) => setCakeForm({ ...cakeForm, images: e.target.value })}
                  placeholder="https://images.unsplash.com/..., https://..."
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-xs bg-[#FAF7F2]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#C85A32] text-white font-bold text-sm hover:bg-[#B04B25] shadow-md cursor-pointer"
              >
                Save Cake to Catalog
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Send Custom Cake Quote Modal */}
      {quoteModalReq && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-[#E8DFD3] shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-serif-display text-xl font-bold text-[#2C2420]">
                Send Quote: {quoteModalReq.requestRef}
              </h3>
              <button onClick={() => setQuoteModalReq(null)} className="text-stone-400 hover:text-stone-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] text-xs space-y-1">
              <p><strong>Customer:</strong> {quoteModalReq.customerName} ({quoteModalReq.customerPhone})</p>
              <p><strong>Occasion:</strong> {quoteModalReq.eventType} • {quoteModalReq.numberOfGuests} guests</p>
              <p><strong>Theme:</strong> {quoteModalReq.designRequirements}</p>
            </div>

            <form onSubmit={handleSendQuote} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Quote Amount (KES) *</label>
                <input
                  type="number"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  required
                  placeholder="e.g. 7500"
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm font-bold bg-[#FAF7F2]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Chef's Notes / Inclusions</label>
                <textarea
                  rows={3}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="Includes 2-tier construction, edible gold foil, and fresh rose cascade..."
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-xs bg-[#FAF7F2]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#C85A32] text-white font-bold text-sm hover:bg-[#B04B25]"
              >
                Send Quotation to Customer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manual Verify Modal */}
      {showManualPayModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-[#E8DFD3] shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-serif-display text-xl font-bold text-[#2C2420]">Manual Payment Verification</h3>
              <button onClick={() => setShowManualPayModal(false)} className="text-stone-400 hover:text-stone-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleManualVerifyPayment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Order Number *</label>
                <input
                  type="text"
                  value={manualPayOrderNumber}
                  onChange={(e) => setManualPayOrderNumber(e.target.value.toUpperCase())}
                  required
                  placeholder="ORD-0001"
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm uppercase font-bold bg-[#FAF7F2]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">M-Pesa Transaction Code / Receipt</label>
                <input
                  type="text"
                  value={manualPayReceipt}
                  onChange={(e) => setManualPayReceipt(e.target.value.toUpperCase())}
                  placeholder="QBC7129XYZ"
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm uppercase font-mono bg-[#FAF7F2]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700"
              >
                Mark as Paid & Confirm Order
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Promo Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-[#E8DFD3] shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-serif-display text-xl font-bold text-[#2C2420]">Create Promo Code</h3>
              <button onClick={() => setShowPromoModal(false)} className="text-stone-400 hover:text-stone-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreatePromo} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                  required
                  placeholder="CAKE15"
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm font-mono uppercase font-bold bg-[#FAF7F2]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Title *</label>
                <input
                  type="text"
                  value={promoForm.title}
                  onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                  required
                  placeholder="15% Weekend Special"
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Discount Type</label>
                  <select
                    value={promoForm.discountType}
                    onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#E8DFD3] text-xs bg-[#FAF7F2]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (KES)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Value *</label>
                  <input
                    type="number"
                    value={promoForm.discountValue}
                    onChange={(e) => setPromoForm({ ...promoForm, discountValue: Number(e.target.value) })}
                    required
                    className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Expiration Date *</label>
                <input
                  type="date"
                  value={promoForm.endDate}
                  onChange={(e) => setPromoForm({ ...promoForm, endDate: e.target.value })}
                  required
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#C85A32] text-white font-bold text-sm hover:bg-[#B04B25]"
              >
                Create Coupon
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
