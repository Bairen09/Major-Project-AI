import React, { useState } from 'react';
import { X, ArrowRight, Building, MapPin, Tag } from 'lucide-react';
import { createBusiness } from '../../services/business.service';

const CATEGORIES = [
  { value: 'salon', label: 'Salon' },
  { value: 'spa', label: 'Spa' },
  { value: 'gym', label: 'Gym' },
  { value: 'fitness_studio', label: 'Fitness Studio' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'dental_clinic', label: 'Dental Clinic' },
  { value: 'medical_clinic', label: 'Medical Clinic' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'home_services', label: 'Home Services' },
  { value: 'retail', label: 'Retail' },
  { value: 'other', label: 'Other' },
];

export default function CreateBusinessModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'salon',
    industry: '',
    description: '',
    location: { city: '', state: '', country: '' },
    services: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['city', 'state', 'country'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...formData };
      if (typeof payload.services === 'string' && payload.services.trim() !== '') {
        payload.services = payload.services.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        payload.services = [];
      }

      await createBusiness(payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create business.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg glass-strong rounded-[28px] p-6 md:p-8 shadow-2xl border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent pointer-events-none opacity-50" />
        
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-white/40 hover:text-white transition z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-10">
          <h2 className="font-display text-2xl font-bold text-white tracking-tight">Create your business</h2>
          <p className="mt-2 text-sm text-white/60 mb-6">Setup your business profile to get started.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-white/80">Business Name *</label>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 transition group-focus-within:text-[#D4AF37]" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="LocalBoost Agency"
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-10 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]/50 focus:bg-white/10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-white/80">Category *</label>
                <div className="relative group">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 transition group-focus-within:text-[#D4AF37]" />
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-2xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white outline-none transition focus:border-[#D4AF37]/50 focus:bg-[#1a1612] appearance-none"
                    required
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value} className="bg-[#1a1612]">{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-white/80">Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="e.g. Health & Beauty"
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]/50 focus:bg-white/10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-white/80">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="A short description of what you do..."
                rows="3"
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]/50 focus:bg-white/10 resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-white/80">City</label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 transition group-focus-within:text-[#D4AF37]" />
                  <input
                    type="text"
                    name="city"
                    value={formData.location.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 py-2.5 text-xs text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]/50 focus:bg-white/10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-white/80">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.location.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]/50 focus:bg-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-white/80">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.location.country}
                  onChange={handleChange}
                  placeholder="Country"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]/50 focus:bg-white/10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-white/80">Services (Comma separated)</label>
              <input
                type="text"
                name="services"
                value={formData.services}
                onChange={handleChange}
                placeholder="e.g. Haircut, Coloring, Styling"
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#D4AF37]/50 focus:bg-white/10"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-cta w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 mt-2 text-sm font-bold shadow-[0_10px_30px_-10px_rgba(212,175,55,0.4)] transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Business"} {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
