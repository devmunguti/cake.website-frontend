import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cakeApi } from '../api/cakeApi';
import { categoryApi } from '../api/categoryApi';
import { reviewApi } from '../api/reviewApi';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export default function HomePage() {
  const [featuredCakes, setFeaturedCakes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [cakesRes, catRes, revRes] = await Promise.all([
          cakeApi.getFeaturedCakes().catch(() => ({ data: [] })),
          categoryApi.getCategories().catch(() => ({ data: [] })),
          reviewApi.getReviews({ limit: 4 }).catch(() => ({ data: [] }))
        ]);

        if (cakesRes.success) setFeaturedCakes(cakesRes.data || []);
        if (catRes.success) setCategories(catRes.data || []);
        if (revRes.success) setReviews(revRes.data || []);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const platformName = settings?.platformName || 'Sweet Delights Bakery';

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#E8DFD3] bg-gradient-to-b from-[#FDF4F0] via-[#FAF7F2] to-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAECE5] text-[#C85A32] text-xs font-bold uppercase tracking-wider shadow-sm">
                <span className="material-symbols-outlined text-sm">award_star</span>
                <span>Nairobi’s Premier Artisanal Bakery</span>
              </div>

              <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#2C2420] leading-[1.15] tracking-tight">
                Handcrafted Cakes For Life’s Most <span className="text-[#C85A32] italic">Delicious</span> Moments.
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
                From velvety Belgian chocolate centerpieces to majestic multi-tiered wedding creations, every cake is baked from scratch using pure butter, Belgian cocoa, and organic Madagascar vanilla.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/cakes"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#C85A32] text-white font-bold text-base hover:bg-[#B04B25] transition-all shadow-xl shadow-orange-900/15 flex items-center justify-center gap-2"
                >
                  <span>Order Cakes Online</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>

                <Link
                  to="/custom-cake"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-[#E8DFD3] text-[#2C2420] font-bold text-base hover:border-[#C85A32] hover:text-[#C85A32] transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[#C85A32]">auto_awesome</span>
                  <span>Request Custom Cake</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#E8DFD3]/80">
                <div className="text-center lg:text-left">
                  <p className="font-serif-display font-extrabold text-2xl text-[#2C2420]">100%</p>
                  <p className="text-xs text-stone-500">Baked Fresh Daily</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="font-serif-display font-extrabold text-2xl text-[#2C2420]">24hr</p>
                  <p className="text-xs text-stone-500">Express Delivery</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="font-serif-display font-extrabold text-2xl text-[#2C2420]">5.0 ★</p>
                  <p className="text-xs text-stone-500">500+ Happy Clients</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80"
                    alt="Artisanal Belgian Chocolate Cake"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Floating Highlight Card */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#E8DFD3] shadow-xl max-w-[240px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      ★
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#2C2420]">Chef's Special</p>
                      <p className="text-[11px] text-stone-500">Belgian Truffle Ganache</p>
                      <p className="text-xs font-bold text-[#C85A32] mt-0.5">From KES 2,800</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Showcase */}
      <section className="py-16 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#2C2420]">
              Explore Our Cake Collections
            </h2>
            <p className="text-sm sm:text-base text-stone-600 mt-2">
              Browse tailored creations designed for birthdays, weddings, anniversaries, and personal indulgences.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/cakes?category=${cat.slug}`}
                className="group p-4 rounded-2xl bg-white border border-[#EFE8DE] hover:border-[#C85A32] hover:shadow-lg transition-all text-center flex flex-col items-center"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 border-2 border-[#FAF7F2] group-hover:scale-105 transition-transform">
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=300&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-serif-display font-bold text-sm sm:text-base text-[#2C2420] group-hover:text-[#C85A32] transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-stone-400 mt-1">View Collection →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Cakes Grid */}
      <section className="py-16 bg-white border-y border-[#E8DFD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#C85A32]">Handcrafted Highlights</span>
              <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#2C2420] mt-1">
                Signature Chef Creations
              </h2>
            </div>
            <Link
              to="/cakes"
              className="px-6 py-2.5 rounded-full bg-[#FAECE5] text-[#C85A32] font-bold text-sm hover:bg-[#F5D8CC] transition-colors flex items-center gap-1.5"
            >
              <span>View All Cakes</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCakes.map((cake) => (
              <div key={cake._id} className="cake-card flex flex-col overflow-hidden group">
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={cake.images?.[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'}
                    alt={cake.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#C85A32] shadow-sm">
                    {cake.categoryName || 'Signature'}
                  </div>
                  <div className="absolute top-3 right-3 bg-[#2C2420]/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
                    <span className="text-amber-400">★</span> {cake.rating || '5.0'}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif-display font-bold text-xl text-[#2C2420] group-hover:text-[#C85A32] transition-colors line-clamp-1">
                      {cake.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
                      {cake.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-stone-400 uppercase font-semibold block">Starting from</span>
                      <span className="font-serif-display font-extrabold text-xl text-[#2C2420]">
                        KES {cake.basePrice?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(cake)}
                        className="p-2.5 rounded-full bg-[#FAECE5] text-[#C85A32] hover:bg-[#C85A32] hover:text-white transition-colors cursor-pointer"
                        title="Quick Add Default 1kg"
                      >
                        <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                      </button>
                      <Link
                        to={`/cakes/${cake.slug}`}
                        className="px-4 py-2.5 rounded-full bg-[#C85A32] text-white font-bold text-xs hover:bg-[#B04B25] transition-colors"
                      >
                        Customize
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How Ordering Works */}
      <section className="py-20 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-[#C85A32]">Seamless Experience</span>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#2C2420] mt-1">
              How Ordering Works
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-2">
              Simple, transparent, and completely customized for your celebration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-[#E8DFD3] text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FAECE5] text-[#C85A32] flex items-center justify-center font-bold text-xl">
                1
              </div>
              <h3 className="font-serif-display font-bold text-lg text-[#2C2420]">Choose Your Cake</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Select from our signature catalog or request a bespoke custom cake theme with reference photos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E8DFD3] text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FAECE5] text-[#C85A32] flex items-center justify-center font-bold text-xl">
                2
              </div>
              <h3 className="font-serif-display font-bold text-lg text-[#2C2420]">Customize Flavours</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Pick your weight (0.5kg to 5kg), gourmet fillings, sponge flavours, and add your custom cake writing message.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E8DFD3] text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FAECE5] text-[#C85A32] flex items-center justify-center font-bold text-xl">
                3
              </div>
              <h3 className="font-serif-display font-bold text-lg text-[#2C2420]">Pay via M-Pesa</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Instant checkout with automatic M-Pesa STK push prompt on your phone with zero hidden fees.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E8DFD3] text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FAECE5] text-[#C85A32] flex items-center justify-center font-bold text-xl">
                4
              </div>
              <h3 className="font-serif-display font-bold text-lg text-[#2C2420]">Fresh Hand Delivery</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Our chef bakes, decorates, and delivers your delicate cake in a protective temperature-safe carrier.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bespoke Custom Cake CTA Banner */}
      <section className="py-16 bg-[#2C2420] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                Bespoke Cake Studio
              </span>
              <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Have a Unique Dream Cake in Mind?
              </h2>
              <p className="text-sm sm:text-base text-stone-300 max-w-2xl leading-relaxed">
                Send us your design ideas, theme photos, color palettes, and guest count. Our master baker will craft a bespoke quote and bring your culinary fantasy to life.
              </p>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <Link
                to="/custom-cake"
                className="px-8 py-4 rounded-full bg-[#C85A32] text-white font-bold text-base hover:bg-[#B04B25] transition-all shadow-xl shadow-black/40 flex items-center gap-2"
              >
                <span>Request Custom Quote</span>
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section className="py-16 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-[#C85A32]">Client Praise</span>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#2C2420] mt-1">
              Loved by Celebration Hosts
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((rev) => (
              <div key={rev._id} className="p-6 rounded-3xl bg-white border border-[#E8DFD3] space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex text-amber-400 text-sm">
                    {'★'.repeat(rev.rating || 5)}
                  </div>
                  <p className="text-xs text-stone-600 italic leading-relaxed">
                    "{rev.comment || 'Spectacular cake! Looked gorgeous and tasted divine.'}"
                  </p>
                </div>
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-[#2C2420]">{rev.customerName}</p>
                    <p className="text-[10px] text-[#C85A32] font-semibold">{rev.occasion || 'Verified Order'}</p>
                  </div>
                  <span className="material-symbols-outlined text-stone-300 text-lg">verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
