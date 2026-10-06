import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/layout/CartDrawer';
import './App.css';

// Lazy-loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const CakesPage = lazy(() => import('./pages/CakesPage'));
const CakeDetailsPage = lazy(() => import('./pages/CakeDetailsPage'));
const CustomCakePage = lazy(() => import('./pages/CustomCakePage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'));
const PortalGateway = lazy(() => import('./pages/PortalGateway'));
const AdminPortal = lazy(() => import('./pages/AdminPortal'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-fadeIn bg-[#FAF7F2]">
      <div className="w-12 h-12 rounded-full border-4 border-[#C85A32] border-t-transparent animate-spin mb-4" />
      <p className="font-serif-display text-sm font-semibold text-[#2C2420]">Baking sweet experiences...</p>
    </div>
  );
}

function MaintenanceBanner() {
  const { settings } = useSettings();
  const { user } = useAuth();

  if (!settings?.maintenanceMode) return null;
  if (user && user.role === 'admin') return null; // Admin bypass

  return (
    <div className="bg-amber-500 text-slate-900 font-bold text-xs px-4 py-3 text-center flex items-center justify-center gap-2 shadow-md">
      <span className="material-symbols-outlined text-[18px]">engineering</span>
      <span>
        <strong>Notice:</strong> {settings?.platformName || 'Sweet Delights Bakery'} is currently undergoing scheduled kitchen maintenance. Cake orders are temporarily paused.
      </span>
    </div>
  );
}

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

function AppContent() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#2C2420',
            color: '#FAF7F2',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            padding: '12px 18px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <MaintenanceBanner />
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public & Customer Storefront Routes */}
            <Route
              path="/"
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />
            <Route
              path="/cakes"
              element={
                <Layout>
                  <CakesPage />
                </Layout>
              }
            />
            <Route
              path="/cakes/:slug"
              element={
                <Layout>
                  <CakeDetailsPage />
                </Layout>
              }
            />
            <Route
              path="/custom-cake"
              element={
                <Layout>
                  <CustomCakePage />
                </Layout>
              }
            />
            <Route
              path="/checkout"
              element={
                <Layout>
                  <CheckoutPage />
                </Layout>
              }
            />
            <Route
              path="/track-order"
              element={
                <Layout>
                  <TrackOrderPage />
                </Layout>
              }
            />
            <Route
              path="/track-order/:orderRef"
              element={
                <Layout>
                  <TrackOrderPage />
                </Layout>
              }
            />
            <Route
              path="/reviews"
              element={
                <Layout>
                  <ReviewsPage />
                </Layout>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute allowedRoles={['customer', 'user', 'admin']}>
                  <Layout>
                    <MyOrdersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <Layout>
                  <PortalGateway />
                </Layout>
              }
            />
            <Route
              path="/portal"
              element={
                <Layout>
                  <PortalGateway />
                </Layout>
              }
            />

            {/* Admin Command Center (Protected) */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPortal />
                </ProtectedRoute>
              }
            />

            {/* Legacy redirect bridges */}
            <Route path="/provider/*" element={<Navigate to="/admin" replace />} />
            <Route path="/shop/*" element={<Navigate to="/cakes" replace />} />
            <Route path="/cleaner/*" element={<Navigate to="/cakes" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
