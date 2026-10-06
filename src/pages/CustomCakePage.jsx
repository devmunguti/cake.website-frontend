import React, { useState } from 'react';
import { customCakeApi } from '../api/customCakeApi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function CustomCakePage() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);

  const [formData, setFormData] = useState({
    customerName: user?.fullName || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    eventType: 'Birthday',
    numberOfGuests: 25,
    preferredSize: '2.0 KG',
    preferredFlavour: 'Vanilla & Belgian Chocolate',
    preferredFillings: 'Dark Chocolate Ganache & Salted Caramel',
    preferredColors: 'Rose Gold, Ivory, and Blush Pink',
    designRequirements: '',
    eventDate: '',
    budget: '',
    referenceImages: '',
    specialInstructions: '',
    deliveryMethod: 'DELIVERY',
    deliveryAddress: user?.addresses?.[0]?.street || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      toast.error('Please provide your name, email, and phone number.');
      return;
    }

    if (!formData.designRequirements.trim()) {
      toast.error('Please describe your cake theme and design requirements.');
      return;
    }

    if (!formData.eventDate) {
      toast.error('Please select your celebration date.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        numberOfGuests: Number(formData.numberOfGuests) || 20,
        budget: Number(formData.budget) || 0,
        referenceImages: formData.referenceImages
          ? formData.referenceImages.split(',').map((s) => s.trim()).filter(Boolean)
          : []
      };

      const res = await customCakeApi.submitRequest(payload);
      if (res.success) {
        setSubmittedRequest(res.data);
        toast.success('Your custom cake inquiry has been received!');
      } else {
        toast.error(res.message || 'Failed to submit request.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(err.response?.data?.message || 'Error submitting custom cake request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedRequest) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-16 px-4">
        <div className="max-w-xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-[#E8DFD3] shadow-xl text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#FAECE5] text-[#C85A32] flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl">auto_awesome</span>
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-[#C85A32]">Inquiry Submitted</span>
            <h1 className="font-serif-display text-3xl font-bold text-[#2C2420]">Thank You, {submittedRequest.customerName}!</h1>
            <p className="text-sm text-stone-600">
              We received your custom cake inquiry for <strong>{submittedRequest.eventType}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-stone-500">Inquiry Reference:</span>
              <span className="font-bold text-[#2C2420]">{submittedRequest.requestRef}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Target Event Date:</span>
              <span className="font-bold text-[#2C2420]">{new Date(submittedRequest.eventDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Status:</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase text-[10px]">
                {submittedRequest.status}
              </span>
            </div>
          </div>

          <p className="text-xs text-stone-500">
            Our master baker is reviewing your design specifications and will send a detailed quotation to <strong>{submittedRequest.customerEmail}</strong> within 24 hours.
          </p>

          <div className="flex gap-4 justify-center pt-2">
            <button
              onClick={() => {
                setSubmittedRequest(null);
                setFormData({ ...formData, designRequirements: '', budget: '', referenceImages: '' });
              }}
              className="px-6 py-2.5 rounded-full bg-white border border-[#E8DFD3] text-stone-700 font-bold text-xs hover:border-[#C85A32]"
            >
              Submit Another Inquiry
            </button>
            <Link
              to="/cakes"
              className="px-6 py-2.5 rounded-full bg-[#C85A32] text-white font-bold text-xs hover:bg-[#B04B25]"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-bold tracking-widest text-[#C85A32]">Artisanal Studio</span>
          <h1 className="font-serif-display text-3xl sm:text-5xl font-bold text-[#2C2420] mt-1">
            Request a Bespoke Cake Quote
          </h1>
          <p className="text-sm sm:text-base text-stone-600 mt-2">
            Have a custom theme, tiered wedding cake, or milestone celebration in mind? Tell us your vision.
          </p>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E8DFD3] shadow-md space-y-8"
        >
          {/* 1. Event & Occasion Details */}
          <div className="space-y-4">
            <h2 className="font-serif-display text-lg font-bold text-[#2C2420] border-b border-stone-100 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#C85A32]">celebration</span>
              <span>1. Event Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Occasion / Event Type</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                >
                  <option value="Birthday">Birthday Party</option>
                  <option value="Wedding">Wedding Reception</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Baby Shower">Baby Shower / Gender Reveal</option>
                  <option value="Graduation">Graduation Milestone</option>
                  <option value="Corporate">Corporate / Brand Event</option>
                  <option value="Other">Other Celebration</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Number of Guests (Serves)</label>
                <input
                  type="number"
                  min="5"
                  max="500"
                  name="numberOfGuests"
                  value={formData.numberOfGuests}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Celebration Date *</label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  min={new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0]}
                  required
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Flavor & Design Vision */}
          <div className="space-y-4">
            <h2 className="font-serif-display text-lg font-bold text-[#2C2420] border-b border-stone-100 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#C85A32]">palette</span>
              <span>2. Flavor & Theme Vision</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Preferred Sponge Flavor(s)</label>
                <input
                  type="text"
                  name="preferredFlavour"
                  value={formData.preferredFlavour}
                  onChange={handleChange}
                  placeholder="e.g. Red Velvet, Chocolate Ganache, Vanilla Bean"
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Preferred Fillings & Frosting</label>
                <input
                  type="text"
                  name="preferredFillings"
                  value={formData.preferredFillings}
                  onChange={handleChange}
                  placeholder="e.g. Cream Cheese, Salted Caramel, Passion Fruit Curd"
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Color Palette & Theme</label>
                <input
                  type="text"
                  name="preferredColors"
                  value={formData.preferredColors}
                  onChange={handleChange}
                  placeholder="e.g. Gold and Emerald Green, Pastel Floral, Safari Theme"
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Estimated Budget (KES)</label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="e.g. 8000"
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Detailed Design & Structural Description *
              </label>
              <textarea
                rows={4}
                name="designRequirements"
                value={formData.designRequirements}
                onChange={handleChange}
                required
                placeholder="Describe your vision in detail: tier counts, 3D fondant figurines, floral placements, custom lettering, structural elements..."
                className="w-full p-3.5 rounded-2xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Reference Image Links (Optional, comma-separated URLs)
              </label>
              <input
                type="text"
                name="referenceImages"
                value={formData.referenceImages}
                onChange={handleChange}
                placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
                className="w-full p-3 rounded-xl border border-[#E8DFD3] text-xs bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
              />
            </div>
          </div>

          {/* 3. Contact & Delivery Info */}
          <div className="space-y-4">
            <h2 className="font-serif-display text-lg font-bold text-[#2C2420] border-b border-stone-100 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#C85A32]">person</span>
              <span>3. Your Contact Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  placeholder="Samantha Kariuki"
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  required
                  placeholder="samantha@gmail.com"
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">M-Pesa Phone Number *</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  required
                  placeholder="0712 345 678"
                  className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Delivery Address or Neighborhood (Nairobi)</label>
              <input
                type="text"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleChange}
                placeholder="e.g. Westlands, Riverside Drive, Apt 3B"
                className="w-full p-3 rounded-xl border border-[#E8DFD3] text-sm bg-[#FAF7F2] focus:border-[#C85A32] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-full bg-[#C85A32] text-white font-bold text-base hover:bg-[#B04B25] transition-all shadow-xl shadow-orange-900/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting Your Vision...</span>
              </>
            ) : (
              <>
                <span>Submit Custom Cake Inquiry</span>
                <span className="material-symbols-outlined text-lg">send</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
