import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItemCount, setIsCartOpen } = useCart();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const platformName = settings?.platformName || 'Sweet Delights Bakery';

  const navLinks = [
    { name: 'Cakes Catalog', path: '/cakes', icon: 'cake' },
    { name: 'Custom Cake Quote', path: '/custom-cake', icon: 'auto_awesome' },
    { name: 'Reviews', path: '/reviews', icon: 'star' },
    { name: 'Track Order', path: '/track-order', icon: 'local_shipping' }
  ];

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 glass-nav transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-[#C85A32] text-white flex items-center justify-center shadow-md shadow-orange-900/20 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-2xl">cake</span>
            </div>
            <div>
              <span className="font-serif-display font-black text-xl sm:text-2xl text-[#2C2420] tracking-tight block leading-tight">
                {platformName}
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#C85A32] font-bold block">
                Artisanal Confectionery
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#FAECE5] text-[#C85A32] shadow-sm'
                      : 'text-[#4A3E39] hover:text-[#C85A32] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-3">
            {/* Cart Button with Count Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-white border border-[#E8DFD3] text-[#2C2420] hover:text-[#C85A32] hover:border-[#C85A32] transition-all shadow-sm flex items-center justify-center cursor-pointer"
              title="View Cart"
            >
              <span className="material-symbols-outlined text-2xl">shopping_bag</span>
              {totalItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C85A32] text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* User Account / Portal Gateway */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white border border-[#E8DFD3] hover:border-[#C85A32] transition-all shadow-sm cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#FAECE5] text-[#C85A32] flex items-center justify-center font-bold text-xs">
                    {user?.firstName?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-[#2C2420] max-w-[100px] truncate">
                    {user?.firstName || user?.fullName || 'My Account'}
                  </span>
                  <span className="material-symbols-outlined text-sm text-stone-400">expand_more</span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E8DFD3] py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs text-stone-500">Signed in as</p>
                      <p className="text-sm font-bold text-[#2C2420] truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAECE5] text-[#C85A32] uppercase">
                        {user?.role}
                      </span>
                    </div>

                    {user?.role === 'admin' ? (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#C85A32] hover:bg-[#FAECE5] transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                        <span>Admin Dashboard</span>
                      </Link>
                    ) : (
                      <Link
                        to="/my-orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">receipt_long</span>
                        <span>My Cake Orders</span>
                      </Link>
                    )}

                    <Link
                      to="/track-order"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">search</span>
                      <span>Track an Order</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors border-t border-stone-100"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-full bg-[#C85A32] text-white font-bold text-xs sm:text-sm hover:bg-[#B04B25] transition-all shadow-md shadow-orange-900/15 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#2C2420] hover:bg-[#FAF7F2]"
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E8DFD3] px-4 pt-2 pb-6 space-y-2 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold ${
                location.pathname === link.path
                  ? 'bg-[#FAECE5] text-[#C85A32]'
                  : 'text-[#4A3E39] hover:bg-[#FAF7F2]'
              }`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
