import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();
  const platformName = settings?.platformName || 'Sweet Delights Bakery';
  const phone = settings?.supportPhone || '+254 700 123 456';
  const email = settings?.supportEmail || 'orders@sweetdelightsbakery.co.ke';
  const address = settings?.storeAddress || '1st Avenue, Parklands / Westlands, Nairobi, Kenya';
  const openingHours = `${settings?.openingTime || '08:00 AM'} - ${settings?.closingTime || '07:00 PM'}`;

  return (
    <footer className="bg-[#2C2420] text-[#FAF7F2] pt-16 pb-12 border-t border-[#4A3E39]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C85A32] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">cake</span>
              </div>
              <span className="font-serif-display font-bold text-xl text-white tracking-tight">
                {platformName}
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Handcrafting luxury celebration cakes, wedding centerpieces, and gourmet pastries with premium ingredients and unparalleled culinary devotion.
            </p>
            <div className="flex items-center gap-3 text-stone-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 text-xs font-semibold text-amber-400">
                <span className="material-symbols-outlined text-sm">verified</span>
                Verified M-Pesa Merchant
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif-display font-bold text-base text-white">Explore Catalog</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link to="/cakes?category=birthday-cakes" className="hover:text-[#C85A32] transition-colors">
                  Birthday Cakes
                </Link>
              </li>
              <li>
                <Link to="/cakes?category=wedding-anniversary" className="hover:text-[#C85A32] transition-colors">
                  Wedding & Anniversary
                </Link>
              </li>
              <li>
                <Link to="/cakes?category=chocolate-truffle" className="hover:text-[#C85A32] transition-colors">
                  Belgian Chocolate Truffle
                </Link>
              </li>
              <li>
                <Link to="/cakes?category=cupcakes-mini-treats" className="hover:text-[#C85A32] transition-colors">
                  Gourmet Cupcakes Box
                </Link>
              </li>
              <li>
                <Link to="/custom-cake" className="hover:text-[#C85A32] transition-colors font-semibold text-amber-400">
                  Bespoke Custom Cake Inquiry →
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-serif-display font-bold text-base text-white">Customer Care</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link to="/track-order" className="hover:text-[#C85A32] transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-[#C85A32] transition-colors">
                  Customer Reviews
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-[#C85A32] transition-colors">
                  Order History & Invoices
                </Link>
              </li>
              <li>
                <span className="text-xs text-stone-400 block pt-1">
                  M-Pesa Till: <strong className="text-white">{settings?.paymentMethods?.mpesaTillNumber || '8995354'}</strong>
                </span>
              </li>
            </ul>
          </div>

          {/* Bakery Shop & Hours */}
          <div className="space-y-4">
            <h4 className="font-serif-display font-bold text-base text-white">Visit Our Kitchen</h4>
            <p className="text-xs text-stone-400 flex items-start gap-2">
              <span className="material-symbols-outlined text-base text-[#C85A32]">location_on</span>
              <span>{address}</span>
            </p>
            <p className="text-xs text-stone-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#C85A32]">schedule</span>
              <span>Open Daily: {openingHours}</span>
            </p>
            <p className="text-xs text-stone-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#C85A32]">call</span>
              <span>{phone}</span>
            </p>
            <p className="text-xs text-stone-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#C85A32]">mail</span>
              <span>{email}</span>
            </p>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} {platformName}. All rights reserved. Handcrafted in Nairobi, Kenya.</p>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-stone-300">Admin Portal</Link>
            <Link to="/track-order" className="hover:text-stone-300">Order Lookup</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
