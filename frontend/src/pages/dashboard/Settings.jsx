import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSettings, updateSettings, getDashboardSummary, getBusinesses, uploadLogo, deleteLogo, uploadCoverImage, deleteCoverImage } from '../../services/business.service';
import { uploadAvatar, deleteAvatar } from '../../services/user.service';
import MediaUploader from '../../components/dashboard/MediaUploader';
import { CheckCircle, AlertCircle, Save, X, Loader2, ArrowLeft } from 'lucide-react';

const CATEGORIES = ['Restaurant', 'Salon', 'Clinic', 'Gym', 'Retail', 'Real Estate', 'Education', 'Other'];
const BRAND_VOICES = ['Professional', 'Friendly', 'Luxury', 'Casual', 'Modern', 'Playful'];
const LANGUAGES = ['English', 'Hindi', 'Marathi'];
const TIMEZONES = ['Asia/Kolkata'];

const initialFormState = {
  name: '', category: '', industry: '', description: '',
  email: '', phone: '', 'socialLinks.website': '',
  'location.address': '', 'location.city': '', 'location.state': '', 'location.country': '',
  'settings.tone': '', 'settings.language': '', 'settings.timezone': '',
  primaryColor: '#D4AF37', secondaryColor: '#0A0A0B',
  'socialLinks.instagram': '', 'socialLinks.facebook': '', 'socialLinks.linkedin': ''
};

// Force Vite HMR
export default function Settings() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [business, setBusiness] = useState(null);
  const [fullBusiness, setFullBusiness] = useState(null);
  
  const [formData, setFormData] = useState(initialFormState);
  const [originalData, setOriginalData] = useState(initialFormState);

  const [avatarFile, setAvatarFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  
  const [deleteAvatarFlag, setDeleteAvatarFlag] = useState(false);
  const [deleteLogoFlag, setDeleteLogoFlag] = useState(false);
  const [deleteCoverFlag, setDeleteCoverFlag] = useState(false);

  // Upload States (now used during save)
  const [completion, setCompletion] = useState({ percent: 0, configured: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const fetchBusinessAndSettings = async () => {
      try {
        setLoading(true);
        const { data: { data: businesses } } = await getBusinesses();
        if (businesses && businesses.length > 0) {
          setBusiness(businesses[0]);
          await loadData(businesses[0]._id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch business for settings", err);
        setLoading(false);
      }
    };
    
    fetchBusinessAndSettings();
  }, []);

  const loadData = async (businessId) => {
    try {
      setError(null);
      
      const [settingsRes, summaryRes] = await Promise.all([
        getSettings(businessId),
        getDashboardSummary(businessId)
      ]);

      const data = settingsRes.data.data;
      const summary = summaryRes.data.data;

      const mappedData = {
        name: data.name || '',
        category: data.category || '',
        industry: data.industry || '',
        description: data.description || '',
        email: data.email || '',
        phone: data.phone || '',
        'socialLinks.website': data.settings?.socialLinks?.website || '',
        'location.address': data.location?.address || '',
        'location.city': data.location?.city || '',
        'location.state': data.location?.state || '',
        'location.country': data.location?.country || '',
        'settings.tone': data.settings?.tone || 'Friendly', // mapping to brandVoice
        'settings.language': data.settings?.language || 'English',
        'settings.timezone': data.settings?.timezone || 'Asia/Kolkata',
        primaryColor: data.settings?.brandColors?.[0] || '#D4AF37',
        secondaryColor: data.settings?.brandColors?.[1] || '#0A0A0B',
        'socialLinks.instagram': data.settings?.socialLinks?.instagram || '',
        'socialLinks.facebook': data.settings?.socialLinks?.facebook || '',
        'socialLinks.linkedin': data.settings?.socialLinks?.linkedin || ''
      };

      setFormData(mappedData);
      setOriginalData(mappedData);
      setFullBusiness(data);
      setCompletion({
        percent: summary.completionPercentage || 0,
        configured: summary.businessConfigured || false
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSuccess(false);
    setValidationError('');
  };

  const handleDiscard = () => {
    setFormData(originalData);
    setValidationError('');
    setSuccess(false);
    setAvatarFile(null);
    setLogoFile(null);
    setCoverFile(null);
    setDeleteAvatarFlag(false);
    setDeleteLogoFlag(false);
    setDeleteCoverFlag(false);
  };

  // Media Handlers
  const handleAvatarUpload = (file) => {
    setAvatarFile(file);
    setDeleteAvatarFlag(false);
  };

  const handleAvatarDelete = () => {
    if (avatarFile) {
      setAvatarFile(null);
    } else if (user?.avatar?.publicId) {
      setDeleteAvatarFlag(true);
    }
  };

  const handleLogoUpload = (file) => {
    setLogoFile(file);
    setDeleteLogoFlag(false);
  };

  const handleLogoDelete = () => {
    if (logoFile) {
      setLogoFile(null);
    } else if (business?.logo?.publicId) {
      setDeleteLogoFlag(true);
    }
  };

  const handleCoverUpload = (file) => {
    setCoverFile(file);
    setDeleteCoverFlag(false);
  };

  const handleCoverDelete = () => {
    if (coverFile) {
      setCoverFile(null);
    } else if (business?.coverImage?.publicId) {
      setDeleteCoverFlag(true);
    }
  };

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) return 'Invalid email format';
    
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (formData['socialLinks.website'] && !urlRegex.test(formData['socialLinks.website'])) return 'Invalid website URL';
    if (formData['socialLinks.instagram'] && !urlRegex.test(formData['socialLinks.instagram'])) return 'Invalid Instagram URL';
    if (formData['socialLinks.facebook'] && !urlRegex.test(formData['socialLinks.facebook'])) return 'Invalid Facebook URL';
    if (formData['socialLinks.linkedin'] && !urlRegex.test(formData['socialLinks.linkedin'])) return 'Invalid LinkedIn URL';

    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (formData.primaryColor && !hexRegex.test(formData.primaryColor)) return 'Invalid primary hex color';
    if (formData.secondaryColor && !hexRegex.test(formData.secondaryColor)) return 'Invalid secondary hex color';

    const phoneRegex = /^(\+\d{1,3}\s?)?\d{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      return 'Phone must be a valid 10-digit number (with optional country code)';
    }

    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      setValidationError(err);
      return;
    }

    try {
      setSaving(true);
      setValidationError('');
      
      // Upload/Delete pending files first
      if (deleteAvatarFlag && !avatarFile) {
        await deleteAvatar();
        setUser({ ...user, avatar: null });
        setDeleteAvatarFlag(false);
      }
      
      if (avatarFile) {
        const fd = new FormData(); fd.append('image', avatarFile);
        const res = await uploadAvatar(fd);
        setUser(res.data.data.user);
        setAvatarFile(null);
      }
      
      if (deleteLogoFlag && !logoFile) {
        const res = await deleteLogo(business._id);
        setFullBusiness(res.data.data.business);
        setBusiness(prev => ({ ...prev, logo: res.data.data.business.logo }));
        setDeleteLogoFlag(false);
      }

      if (logoFile) {
        const fd = new FormData(); fd.append('image', logoFile);
        const res = await uploadLogo(business._id, fd);
        setFullBusiness(res.data.data.business);
        setBusiness(prev => ({ ...prev, logo: res.data.data.business.logo }));
        setLogoFile(null);
      }

      if (deleteCoverFlag && !coverFile) {
        const res = await deleteCoverImage(business._id);
        setFullBusiness(res.data.data.business);
        setBusiness(prev => ({ ...prev, coverImage: res.data.data.business.coverImage }));
        setDeleteCoverFlag(false);
      }

      if (coverFile) {
        const fd = new FormData(); fd.append('image', coverFile);
        const res = await uploadCoverImage(business._id, fd);
        setFullBusiness(res.data.data.business);
        setBusiness(prev => ({ ...prev, coverImage: res.data.data.business.coverImage }));
        setCoverFile(null);
      }

      const payload = {
        name: formData.name,
        category: formData.category,
        industry: formData.industry,
        description: formData.description,
        email: formData.email,
        phone: formData.phone,
        location: {
          address: formData['location.address'],
          city: formData['location.city'],
          state: formData['location.state'],
          country: formData['location.country']
        },
        settings: {
          tone: formData['settings.tone'],
          language: formData['settings.language'],
          timezone: formData['settings.timezone'],
          brandColors: [formData.primaryColor, formData.secondaryColor].filter(Boolean),
          socialLinks: {
            website: formData['socialLinks.website'],
            instagram: formData['socialLinks.instagram'],
            facebook: formData['socialLinks.facebook'],
            linkedin: formData['socialLinks.linkedin']
          }
        }
      };

      await updateSettings(business._id, payload);
      
      // Refresh summary to update completion stats
      const summaryRes = await getDashboardSummary(business._id);
      setCompletion({
        percent: summaryRes.data.data.completionPercentage || 0,
        configured: summaryRes.data.data.businessConfigured || false
      });
      
      
      setOriginalData(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setValidationError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const isDirty = JSON.stringify(formData) !== JSON.stringify(originalData) || avatarFile || logoFile || coverFile || deleteAvatarFlag || deleteLogoFlag || deleteCoverFlag;

  if (!business && !loading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-muted-foreground">
        No business selected. Please select a business from the dashboard.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-5xl mx-auto">
        <div className="h-24 glass rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 glass rounded-2xl animate-pulse" />
          <div className="h-96 glass rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="glass border-red-500/20 p-6 rounded-2xl flex items-center gap-4 text-red-400">
          <AlertCircle className="h-6 w-6" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const inputClass = "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#D4AF37]/50 placeholder:text-white/30";
  const labelClass = "block text-xs font-medium text-white/70 mb-1.5";
  const cardClass = "glass rounded-2xl p-6 space-y-4";
  const cardTitle = "font-display text-lg font-semibold text-white mb-2 flex items-center justify-between";

  return (
    <div className="relative min-h-[calc(100vh-80px)] pb-32">
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-start gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="mt-1 p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">Business Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your business profile, branding, and preferences.</p>
          </div>
        </div>

        {/* Profile Completion Card */}
        <div className="glass rounded-2xl p-6 flex items-center justify-between bg-gradient-to-r from-[#D4AF37]/10 to-transparent border-[#D4AF37]/20">
          <div>
            <h3 className="font-display font-semibold text-white text-lg">Profile Completion</h3>
            <p className="text-sm text-white/60 mt-1">Complete your profile to generate better AI content.</p>
          </div>
          <div className="flex items-center gap-4">
            {completion.configured ? (
              <div className="flex items-center gap-2 text-[#D4AF37] font-semibold bg-[#D4AF37]/10 px-4 py-2 rounded-xl">
                <CheckCircle className="h-5 w-5" />
                Business Profile Complete
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4AF37] transition-all duration-500" style={{ width: `${completion.percent}%` }} />
                </div>
                <span className="text-white font-semibold">{completion.percent}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm animate-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5" />
            {validationError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Profile Media */}
            <div className={cardClass}>
              <h2 className={cardTitle}>Profile</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="glass-strong rounded-2xl p-6 border border-white/5 relative group h-full">
                  <div className="absolute top-0 right-0 bottom-0 w-1/2 bg-gradient-to-l from-[#D4AF37]/5 to-transparent pointer-events-none rounded-r-2xl" />
                  <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                    <div className="w-full">
                      <label className={labelClass + " text-center"}>User Avatar</label>
                      <MediaUploader 
                        media={avatarFile ? [{ url: URL.createObjectURL(avatarFile), publicId: 'local' }] : (user?.avatar?.url && !deleteAvatarFlag ? [user.avatar] : [])}
                        maxFiles={1}
                        label="Avatar"
                        onUpload={handleAvatarUpload}
                        onDelete={handleAvatarDelete}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="glass-strong rounded-2xl p-6 border border-white/5 relative group h-full">
                  <div className="absolute top-0 right-0 bottom-0 w-1/2 bg-gradient-to-l from-[#D4AF37]/5 to-transparent pointer-events-none rounded-r-2xl" />
                  <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                    <div className="w-full">
                      <label className={labelClass + " text-center"}>Business Logo</label>
                      <MediaUploader 
                        media={logoFile ? [{ url: URL.createObjectURL(logoFile), publicId: 'local' }] : (business?.logo?.url && !deleteLogoFlag ? [business.logo] : [])}
                        maxFiles={1}
                        label="Logo"
                        onUpload={handleLogoUpload}
                        onDelete={handleLogoDelete}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full">
              <div className="glass-strong rounded-2xl p-6 border border-white/5 relative group h-full">
                <div className="absolute top-0 right-0 bottom-0 w-1/3 bg-gradient-to-l from-[#D4AF37]/5 to-transparent pointer-events-none rounded-r-2xl" />
                <div className="relative z-10 flex flex-col space-y-4">
                  <div className="w-full">
                    <label className={labelClass}>Business Cover Image (16:9)</label>
                    <MediaUploader 
                      media={coverFile ? [{ url: URL.createObjectURL(coverFile), publicId: 'local' }] : (business?.coverImage?.url && !deleteCoverFlag ? [business.coverImage] : [])}
                      maxFiles={1}
                      label="Cover Image"
                      isCover={true}
                      onUpload={handleCoverUpload}
                      onDelete={handleCoverDelete}
                    />
                  </div>
                </div>
              </div>
            </div>
            </div>
            
            {/* Business Information */}
            <div className={cardClass}>
              <h2 className={cardTitle}>Business Information</h2>
              
              <div>
                <label className={labelClass}>Business Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} className={`${inputClass} appearance-none bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg fill="none" height="24" stroke="rgba(255,255,255,0.5)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"/></svg>')] bg-[position:calc(100%-12px)_center]`}>
                    <option value="" className="bg-[#111114]">Select Category</option>
                    {formData.category && !CATEGORIES.includes(formData.category) && (
                      <option value={formData.category} className="bg-[#111114]">{formData.category}</option>
                    )}
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#111114]">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Industry</label>
                  <input type="text" name="industry" value={formData.industry} onChange={handleChange} className={inputClass} placeholder="e.g. Fine Dining" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Description *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className={`${inputClass} resize-none`} placeholder="Tell us about your business..." />
              </div>
            </div>

            {/* AI Preferences */}
            <div className={cardClass}>
              <h2 className={cardTitle}>AI Preferences</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Brand Voice *</label>
                  <select name="settings.tone" value={formData['settings.tone']} onChange={handleChange} className={`${inputClass} appearance-none bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg fill="none" height="24" stroke="rgba(255,255,255,0.5)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"/></svg>')] bg-[position:calc(100%-12px)_center]`}>
                    <option value="" className="bg-[#111114]">Select Voice</option>
                    {formData['settings.tone'] && !BRAND_VOICES.map(v=>v.toLowerCase()).includes(formData['settings.tone'].toLowerCase()) && (
                      <option value={formData['settings.tone']} className="bg-[#111114]">{formData['settings.tone'].charAt(0).toUpperCase() + formData['settings.tone'].slice(1)}</option>
                    )}
                    {BRAND_VOICES.map(v => <option key={v} value={v.toLowerCase()} className="bg-[#111114]">{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Language *</label>
                  <select name="settings.language" value={formData['settings.language']} onChange={handleChange} className={`${inputClass} appearance-none bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg fill="none" height="24" stroke="rgba(255,255,255,0.5)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"/></svg>')] bg-[position:calc(100%-12px)_center]`}>
                    <option value="" className="bg-[#111114]">Select Language</option>
                    {formData['settings.language'] && !LANGUAGES.map(l=>l.toLowerCase()).includes(formData['settings.language'].toLowerCase()) && (
                      <option value={formData['settings.language']} className="bg-[#111114]">{formData['settings.language'].charAt(0).toUpperCase() + formData['settings.language'].slice(1)}</option>
                    )}
                    {LANGUAGES.map(l => <option key={l} value={l.toLowerCase()} className="bg-[#111114]">{l}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className={labelClass}>Timezone *</label>
                <select name="settings.timezone" value={formData['settings.timezone']} onChange={handleChange} className={`${inputClass} appearance-none bg-no-repeat bg-[url('data:image/svg+xml;utf8,<svg fill="none" height="24" stroke="rgba(255,255,255,0.5)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"/></svg>')] bg-[position:calc(100%-12px)_center]`}>
                  {formData['settings.timezone'] && !TIMEZONES.includes(formData['settings.timezone']) && (
                    <option value={formData['settings.timezone']} className="bg-[#111114]">{formData['settings.timezone']}</option>
                  )}
                  {TIMEZONES.map(t => <option key={t} value={t} className="bg-[#111114]">{t}</option>)}
                </select>
              </div>
            </div>
            
            {/* Branding */}
            <div className={cardClass}>
              <h2 className={cardTitle}>Branding</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Primary Color</label>
                  <div className="flex gap-3 items-center">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 shadow-sm cursor-pointer">
                      <input type="color" name="primaryColor" value={formData.primaryColor || '#D4AF37'} onChange={handleChange} className="absolute -top-2 -left-2 h-14 w-14 cursor-pointer" />
                    </div>
                    <input type="text" name="primaryColor" value={formData.primaryColor} onChange={handleChange} className={inputClass} placeholder="#D4AF37" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Secondary Color</label>
                  <div className="flex gap-3 items-center">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 shadow-sm cursor-pointer">
                      <input type="color" name="secondaryColor" value={formData.secondaryColor || '#0A0A0B'} onChange={handleChange} className="absolute -top-2 -left-2 h-14 w-14 cursor-pointer" />
                    </div>
                    <input type="text" name="secondaryColor" value={formData.secondaryColor} onChange={handleChange} className={inputClass} placeholder="#0A0A0B" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Contact Information */}
            <div className={cardClass}>
              <h2 className={cardTitle}>Contact Information</h2>
              
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="contact@business.com" />
              </div>
              
              <div>
                <label className={labelClass}>Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="+91 98765 43210" />
              </div>

              <div>
                <label className={labelClass}>Website</label>
                <input type="url" name="socialLinks.website" value={formData['socialLinks.website']} onChange={handleChange} className={inputClass} placeholder="https://business.com" />
              </div>
            </div>

            {/* Location */}
            <div className={cardClass}>
              <h2 className={cardTitle}>Location</h2>
              
              <div>
                <label className={labelClass}>Address</label>
                <input type="text" name="location.address" value={formData['location.address']} onChange={handleChange} className={inputClass} placeholder="Street address" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>City *</label>
                  <input type="text" name="location.city" value={formData['location.city']} onChange={handleChange} className={inputClass} placeholder="Mumbai" />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input type="text" name="location.state" value={formData['location.state']} onChange={handleChange} className={inputClass} placeholder="Maharashtra" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Country *</label>
                <input type="text" name="location.country" value={formData['location.country']} onChange={handleChange} className={inputClass} placeholder="India" />
              </div>
            </div>

            {/* Social Links */}
            <div className={cardClass}>
              <h2 className={cardTitle}>Social Links</h2>
              
              <div>
                <label className={labelClass}>Instagram URL</label>
                <input type="url" name="socialLinks.instagram" value={formData['socialLinks.instagram']} onChange={handleChange} className={inputClass} placeholder="https://instagram.com/..." />
              </div>
              
              <div>
                <label className={labelClass}>Facebook URL</label>
                <input type="url" name="socialLinks.facebook" value={formData['socialLinks.facebook']} onChange={handleChange} className={inputClass} placeholder="https://facebook.com/..." />
              </div>
              
              <div>
                <label className={labelClass}>LinkedIn URL</label>
                <input type="url" name="socialLinks.linkedin" value={formData['socialLinks.linkedin']} onChange={handleChange} className={inputClass} placeholder="https://linkedin.com/..." />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-[260px] right-0 p-4 z-40 pointer-events-none">
        <div className="max-w-6xl mx-auto glass rounded-2xl border-white/10 p-4 flex items-center justify-between bg-[#111114]/95 backdrop-blur-xl shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-3">
            {success && (
              <span className="text-[#D4AF37] flex items-center gap-2 text-sm font-medium animate-in fade-in">
                <CheckCircle className="h-4 w-4" /> Saved successfully
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDiscard}
              disabled={!isDirty || saving}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <X className="h-4 w-4" /> Discard
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty || saving}
              className="btn-cta px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
