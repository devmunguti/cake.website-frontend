import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { cakeApi } from '../api/cakeApi';
import { reviewApi } from '../api/reviewApi';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

export default function CakeDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [cake, setCake] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [reviews, setReviews] = useState([]);

  // Customization state
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedFlavour, setSelectedFlavour] = useState(null);
  const [selectedFilling, setSelectedFilling] = useState(null);
  const [selectedDecoration, setSelectedDecoration] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadCake() {
      try {
        setLoading(true);
        const res = await cakeApi.getCakeBySlug(slug);
        if (res.success && res.data) {
          const cakeData = res.data;
          setCake(cakeData);
          setSelectedImage(cakeData.images?.[0] || '');

          // Set default selections
          const defSize = cakeData.sizes?.find((s) => s.isDefault) || cakeData.sizes?.[0];
          const defFlav = cakeData.flavours?.find((f) => f.isDefault) || cakeData.flavours?.[0];
          const defFill = cakeData.fillings?.find((f) => f.isDefault) || cakeData.fillings?.[0];
          const defDeco = cakeData.decorationOptions?.[0];

          setSelectedSize(defSize || null);
          setSelectedFlavour(defFlav || null);
          setSelectedFilling(defFill || null);
          setSelectedDecoration(defDeco || null);

          // Fetch cake reviews
          reviewApi.getReviews({ cakeId: cakeData._id }).then((rRes) => {
            if (rRes.success) setReviews(rRes.data || []);
          });
        }
      } catch (err) {
        console.error('Error loading cake:', err);
        toast.error('Could not load cake details.');
      } finally {
        setLoading(false);
      }
    }
    loadCake();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 bg-[#FAF7F2]">
        <div className="w-12 h-12 border-4 border-[#C85A32] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif-display font-semibold text-stone-600">Loading cake creation...</p>
      </div>
    );
  }

  if (!cake) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center">
        <span className="material-symbols-outlined text-6xl text-stone-400 mb-4">cake</span>
        <h2 className="font-serif-display text-2xl font-bold text-[#2C2420] mb-2">Cake Not Found</h2>
        <p className="text-stone-500 mb-6">This cake may have been moved or is currently unavailable.</p>
        <Link to="/cakes" className="px-6 py-2.5 rounded-full bg-[#C85A32] text-white font-bold text-sm">
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Calculate live authoritative unit price
  const unitPrice =
    (cake.basePrice || 0) +
    (selectedSize?.priceAdjustment || 0) +
    (selectedFlavour?.priceAdjustment || 0) +
    (selectedFilling?.priceAdjustment || 0) +
    (selectedDecoration?.priceAdjustment || 0);

  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(
      cake,
      {
        size: selectedSize,
        flavour: selectedFlavour,
        filling: selectedFilling,
        decoration: selectedDecoration,
        customMessage,
        specialInstructions
      },
      quantity
    );
    toast.success(`Added ${cake.name} (${selectedSize?.name}) to your basket!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-8">
          <Link to="/" className="hover:text-[#C85A32]">Home</Link>
          <span>/</span>
          <Link to="/cakes" className="hover:text-[#C85A32]">Cakes Catalog</Link>
          <span>/</span>
          <span className="text-[#2C2420] font-bold truncate max-w-xs">{cake.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-white border-2 border-[#E8DFD3] shadow-lg">
              <img
                src={selectedImage || cake.images?.[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80'}
                alt={cake.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            {cake.images && cake.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {cake.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all ${
                      selectedImage === img ? 'border-[#C85A32] shadow-md' : 'border-[#E8DFD3] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Lead Time & Guarantee Banner */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8DFD3] flex items-center gap-4 text-xs text-stone-600">
              <span className="material-symbols-outlined text-2xl text-[#C85A32]">schedule</span>
              <div>
                <p className="font-bold text-[#2C2420]">Preparation Lead Time: {cake.preparationTimeText || '24-48 hours'}</p>
                <p className="text-stone-500">Baked fresh on order day to guarantee maximum tenderness and aroma.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Customization & Pricing Engine */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#FAECE5] text-[#C85A32] text-xs font-bold uppercase tracking-wider">
                  {cake.categoryName || 'Signature Cake'}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                  <span>★</span> {cake.rating || '5.0'} ({cake.reviewsCount || 0} reviews)
                </div>
              </div>

              <h1 className="font-serif-display text-3xl sm:text-4xl font-extrabold text-[#2C2420] tracking-tight">
                {cake.name}
              </h1>

              <p className="text-sm text-stone-600 leading-relaxed pt-1">
                {cake.description}
              </p>
            </div>

            {/* Pricing Summary Box */}
            <div className="p-5 rounded-2xl bg-white border border-[#E8DFD3] shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-400 uppercase font-bold block">Current Calculated Price</span>
                <span className="font-serif-display font-extrabold text-3xl text-[#C85A32]">
                  KES {totalPrice.toLocaleString()}
                </span>
                {quantity > 1 && (
                  <span className="text-xs text-stone-500 block">KES {unitPrice.toLocaleString()} each</span>
                )}
              </div>

              <div className="flex items-center gap-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD3] p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-700 hover:bg-white transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <span className="font-bold text-sm px-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-700 hover:bg-white transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>

            {/* Customization Options */}
            <div className="space-y-6 bg-white p-6 rounded-3xl border border-[#E8DFD3]">
              {/* 1. Size Selector */}
              {cake.sizes && cake.sizes.length > 0 && (
                <div className="space-y-2">
                  <label className="font-serif-display text-sm font-bold text-[#2C2420] block">
                    1. Select Weight / Size: <span className="text-[#C85A32]">{selectedSize?.name}</span> ({selectedSize?.serves})
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {cake.sizes.map((s) => {
                      const isSelected = selectedSize?.name === s.name;
                      return (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#C85A32] bg-[#FAECE5] shadow-sm ring-1 ring-[#C85A32]'
                              : 'border-[#E8DFD3] bg-[#FAF7F2]/50 hover:bg-[#FAF7F2]'
                          }`}
                        >
                          <p className="font-bold text-xs text-[#2C2420]">{s.name}</p>
                          <p className="text-[10px] text-stone-500">{s.serves}</p>
                          <p className="text-[11px] font-semibold text-[#C85A32] mt-1">
                            {s.priceAdjustment > 0 ? `+ KES ${s.priceAdjustment}` : 'Included'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Flavour Selector */}
              {cake.flavours && cake.flavours.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <label className="font-serif-display text-sm font-bold text-[#2C2420] block">
                    2. Select Sponge Flavour: <span className="text-[#C85A32]">{selectedFlavour?.name}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {cake.flavours.map((f) => {
                      const isSelected = selectedFlavour?.name === f.name;
                      return (
                        <button
                          key={f.name}
                          type="button"
                          onClick={() => setSelectedFlavour(f)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#C85A32] bg-[#C85A32] text-white shadow-sm'
                              : 'border-[#E8DFD3] bg-[#FAF7F2] text-stone-700 hover:border-[#C85A32]'
                          }`}
                        >
                          {f.name} {f.priceAdjustment > 0 && `(+KES ${f.priceAdjustment})`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Filling Selector */}
              {cake.fillings && cake.fillings.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <label className="font-serif-display text-sm font-bold text-[#2C2420] block">
                    3. Select Cream / Filling: <span className="text-[#C85A32]">{selectedFilling?.name}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {cake.fillings.map((fill) => {
                      const isSelected = selectedFilling?.name === fill.name;
                      return (
                        <button
                          key={fill.name}
                          type="button"
                          onClick={() => setSelectedFilling(fill)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#C85A32] bg-[#C85A32] text-white shadow-sm'
                              : 'border-[#E8DFD3] bg-[#FAF7F2] text-stone-700 hover:border-[#C85A32]'
                          }`}
                        >
                          {fill.name} {fill.priceAdjustment > 0 && `(+KES ${fill.priceAdjustment})`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Decoration Style */}
              {cake.decorationOptions && cake.decorationOptions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <label className="font-serif-display text-sm font-bold text-[#2C2420] block">
                    4. Decoration Style: <span className="text-[#C85A32]">{selectedDecoration?.name}</span>
                  </label>
                  <div className="space-y-2">
                    {cake.decorationOptions.map((d) => {
                      const isSelected = selectedDecoration?.name === d.name;
                      return (
                        <button
                          key={d.name}
                          type="button"
                          onClick={() => setSelectedDecoration(d)}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#C85A32] bg-[#FAECE5] text-[#C85A32] font-bold'
                              : 'border-[#E8DFD3] text-stone-700 hover:bg-[#FAF7F2]'
                          }`}
                        >
                          <span>{d.name}</span>
                          <span className="font-semibold">
                            {d.priceAdjustment > 0 ? `+ KES ${d.priceAdjustment}` : 'Included'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Custom Cake Message (Piping) */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="font-serif-display text-sm font-bold text-[#2C2420] block">
                  5. Message on Cake (Piping on board or cake):
                </label>
                <input
                  type="text"
                  maxLength={60}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="e.g. Happy 30th Birthday David! 🎉"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                />
                <p className="text-[11px] text-stone-400">Max 60 characters. Leave blank if you prefer no writing.</p>
              </div>

              {/* 6. Special Instructions */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="font-serif-display text-sm font-bold text-[#2C2420] block">
                  6. Special Dietary or Baker Instructions:
                </label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Less sugar on frosting, nut allergy precautions, candle preferences..."
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-xs bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 rounded-full bg-white border-2 border-[#C85A32] text-[#C85A32] font-bold text-sm hover:bg-[#FAECE5] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                <span>Add to Basket</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 py-4 rounded-full bg-[#C85A32] text-white font-bold text-sm hover:bg-[#B04B25] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-900/15"
              >
                <span>Checkout Now</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Customer Reviews for this Cake */}
        {reviews.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#E8DFD3]">
            <h2 className="font-serif-display text-2xl font-bold text-[#2C2420] mb-6">
              Reviews for {cake.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-6 rounded-3xl bg-white border border-[#E8DFD3] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#2C2420]">{rev.customerName}</span>
                    <div className="flex text-amber-400 text-xs">{'★'.repeat(rev.rating)}</div>
                  </div>
                  <p className="text-xs text-stone-600 italic">"{rev.comment}"</p>
                  {rev.adminReply?.text && (
                    <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] text-xs text-stone-700 mt-2">
                      <span className="font-bold text-[#C85A32] block">Bakery Chef Response:</span>
                      {rev.adminReply.text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
