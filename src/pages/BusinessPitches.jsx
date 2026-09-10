import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pitchesService } from '../services/pitchesService';
import { useCurrency } from '../context';
import { 
    TrendingUp, 
    ShieldCheck, 
    Lock, 
    Award, 
    Plus, 
    Rocket, 
    CheckCircle, 
    Building, 
    ArrowRight, 
    X,
    Zap,
    Target,
    Coins,
    FileText,
    Mail,
    Phone,
    MessageSquare,
    ArrowUpRight,
    MapPin,
    Search,
    User,
    Bell,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Crown,
    ChevronRight,
    Edit3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BusinessPitches({ openAuthModal = null }) {
    const navigate = useNavigate();
    const { currency, formatCurrency } = useCurrency();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'studio' | 'admin'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSector, setSelectedSector] = useState('ALL');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showFounderAuthModal, setShowFounderAuthModal] = useState(openAuthModal === 'founder');
    const [showInvestorAuthModal, setShowInvestorAuthModal] = useState(openAuthModal === 'investor');
    const [showAdminAuthModal, setShowAdminAuthModal] = useState(openAuthModal === 'admin');
    const [selectedConnectPitch, setSelectedConnectPitch] = useState(null);

    // Quota & Unlocked Pitches State
    const [unlockedMap, setUnlockedMap] = useState({});
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [resubmitPitch, setResubmitPitch] = useState(null);
    const [adminReviewPitch, setAdminReviewPitch] = useState(null);
    const [adminRemarksInput, setAdminRemarksInput] = useState('');
    const [showNotifDrawer, setShowNotifDrawer] = useState(false);

    // Form Errors & Validation State
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        business_name: '',
        industry: 'Technology',
        headline: '',
        funding_target: '',
        equity_offered: '',
        use_of_funds: '',
        pitch_deck_url: '',
        founder_phone: '',
        founder_email: '',
        problem: '',
        solution: '',
        location: ''
    });

    // Location State
    const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
    const [gpsState, setGpsState] = useState(null);
    const [cityName, setCityName] = useState(null);
    const [pincode, setPincode] = useState(null);
    const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [locationErrorMsg, setLocationErrorMsg] = useState(null);
    const [userCoords, setUserCoords] = useState(null);

    useEffect(() => {
        if (openAuthModal === 'admin') {
            setShowAdminAuthModal(true);
        } else if (openAuthModal === 'founder') {
            setShowFounderAuthModal(true);
        } else if (openAuthModal === 'investor') {
            setShowInvestorAuthModal(true);
        }
    }, [openAuthModal]);

    // ── Queries & Mutations ──────────────────────────────────────────────────
    const { data: marketplacePitches = [], isLoading: isMarketplaceLoading } = useQuery({
        queryKey: ['marketplace-pitches', searchTerm, selectedSector],
        queryFn: () => pitchesService.getMarketplacePitches({ search: searchTerm, sector: selectedSector })
    });

    const { data: studioPitches = [], isLoading: isStudioLoading } = useQuery({
        queryKey: ['studio-pitches'],
        queryFn: pitchesService.getMyStudioPitches
    });

    const { data: adminPitches = [], isLoading: isAdminLoading } = useQuery({
        queryKey: ['admin-pitches'],
        queryFn: pitchesService.getAdminPitches,
        enabled: activeTab === 'admin' || showAdminAuthModal
    });

    const { data: quotaStatus, refetch: refetchQuota } = useQuery({
        queryKey: ['quota-status'],
        queryFn: pitchesService.getQuotaStatus
    });

    const { data: notifications = [], refetch: refetchNotifs } = useQuery({
        queryKey: ['user-notifications'],
        queryFn: pitchesService.getNotifications
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const createMutation = useMutation({
        mutationFn: pitchesService.createPitch,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studio-pitches'] });
            queryClient.invalidateQueries({ queryKey: ['marketplace-pitches'] });
            setShowCreateModal(false);
            setFormErrors({});
            setFormData({
                business_name: '',
                industry: 'Technology',
                headline: '',
                funding_target: '',
                equity_offered: '',
                use_of_funds: '',
                pitch_deck_url: '',
                founder_phone: '',
                founder_email: '',
                problem: '',
                solution: '',
                location: ''
            });
            alert("Pitch submitted successfully! Status set to Under Admin Review.");
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Error submitting pitch.");
        }
    });

    const resubmitMutation = useMutation({
        mutationFn: ({ id, data }) => pitchesService.resubmitPitch(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studio-pitches'] });
            setResubmitPitch(null);
            alert("Pitch updated and resubmitted for admin review!");
        },
        onError: () => {
            alert("Failed to resubmit pitch.");
        }
    });

    const adminReviewMutation = useMutation({
        mutationFn: ({ id, status, admin_remarks }) => pitchesService.reviewPitch(id, { status, admin_remarks }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-pitches'] });
            queryClient.invalidateQueries({ queryKey: ['marketplace-pitches'] });
            queryClient.invalidateQueries({ queryKey: ['studio-pitches'] });
            setAdminReviewPitch(null);
            setAdminRemarksInput('');
            alert(data?.message || "Pitch review status updated!");
        },
        onError: () => {
            alert("Failed to update pitch status.");
        }
    });

    // Location Request
    const requestLocation = () => {
        if (!navigator.geolocation) {
            setLocationPermissionDenied(true);
            setLocationErrorMsg("Geolocation is unsupported by your browser.");
            return;
        }
        setIsLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setIsLocationLoading(false);
                setLocationPermissionDenied(false);
                setUserCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
                setCityName('Chennai');
                setGpsState('Tamil Nadu');
                setPincode('600001');
            },
            () => {
                setIsLocationLoading(false);
                setLocationPermissionDenied(true);
                setLocationErrorMsg("Location permission denied. Please select a region manually.");
            }
        );
    };

    // Validation Rules
    const validateFundingTarget = (val) => {
        const num = Number(val);
        if (val === '' || isNaN(num) || num < 0) return 'Funding target must be a non-negative number.';
        return null;
    };

    const validateEquityOffered = (val) => {
        const num = Number(val);
        if (val === '' || isNaN(num) || num < 0 || num > 100) return 'Equity offered must be between 0% and 100%.';
        return null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const fundingErr = validateFundingTarget(formData.funding_target);
        const equityErr = validateEquityOffered(formData.equity_offered);

        if (fundingErr || equityErr || !formData.business_name || !formData.headline) {
            setFormErrors({ funding_target: fundingErr, equity_offered: equityErr });
            alert(fundingErr || equityErr || "Please supply all required venture details.");
            return;
        }

        const payload = {
            title: formData.business_name,
            business_name: formData.business_name,
            sector: formData.industry,
            headline: formData.headline,
            description: formData.use_of_funds || formData.headline,
            problem: formData.problem,
            solution: formData.solution,
            funding_target: Number(formData.funding_target),
            goal_amount: Number(formData.funding_target),
            equity_offered: Number(formData.equity_offered),
            use_of_funds: formData.use_of_funds,
            pitch_deck_url: formData.pitch_deck_url,
            founder_phone: formData.founder_phone,
            founder_email: formData.founder_email,
            location: formData.location || (cityName ? `${cityName}, ${gpsState}` : 'Chennai, Tamil Nadu')
        };
        createMutation.mutate(payload);
    };

    // Quota & Unlock Trigger
    const handleConnectTrigger = async (pitch) => {
        if (unlockedMap[pitch.id]) {
            setSelectedConnectPitch({ ...pitch, ...unlockedMap[pitch.id] });
            return;
        }

        try {
            const res = await pitchesService.unlockPitch(pitch.id);
            if (res.success && res.unlocked) {
                setUnlockedMap(prev => ({ ...prev, [pitch.id]: res.data }));
                refetchQuota();
                setSelectedConnectPitch({ ...pitch, ...res.data });
            } else {
                setShowUpgradeModal(true);
            }
        } catch (error) {
            if (error.response?.data?.status === 'QUOTA_EXCEEDED' || error.response?.status === 403) {
                setShowUpgradeModal(true);
            } else {
                setSelectedConnectPitch(pitch);
            }
        }
    };

    const industryOptions = [
        'ALL', 'Technology', 'Retail & Commerce', 'Healthcare', 'Finance & FinTech', 
        'Manufacturing', 'Food & Beverage', 'Real Estate', 'Other'
    ];

    const getStatusBadge = (status) => {
        switch(status) {
            case 'ACCEPTED':
            case 'ACTIVE':
                return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800' }}>
                        <CheckCircle2 size={13} /> Accepted / Published
                    </span>
                );
            case 'REJECTED':
                return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#b91c1c', padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800' }}>
                        <AlertTriangle size={13} /> Needs Revision
                    </span>
                );
            case 'PENDING_REVIEW':
            default:
                return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#b45309', padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800' }}>
                        <Clock size={13} /> Under Admin Review
                    </span>
                );
        }
    };

    return (
        <div style={{
            height: '100%',
            width: '100%',
            background: '#f8fafc',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            boxSizing: 'border-box',
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif'
        }}>
            
            {/* Top Dark-Blue Banner */}
            <div style={{
                flexShrink: 0,
                background: '#1E3A8A',
                borderRadius: '20px',
                padding: '1.5rem 2rem',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.15)',
                marginBottom: '1.25rem',
                position: 'relative',
                overflow: 'visible'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.35rem 0.75rem',
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '999px',
                        backdropFilter: 'blur(8px)',
                        marginBottom: '0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        letterSpacing: '0.05em',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#60A5FA'
                    }}>
                        <TrendingUp size={13} />
                        <span>CAPITAL MATRIX & VENTURE CONNECT</span>
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '850', marginBottom: '0.25rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        SME Deal Marketplace
                    </h1>
                    <p style={{ fontSize: '0.9rem', color: '#BFDBFE', maxWidth: '520px', margin: 0, opacity: 0.85 }}>
                        Connect directly with verified founders, review pitch decks, and unlock investment deals.
                    </p>
                    
                    {/* Location & Region Dropdown */}
                    <div style={{ position: 'relative', marginTop: '0.55rem', display: 'inline-block', zIndex: 50 }}>
                        <button 
                            onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.12)',
                                border: '1px solid rgba(255, 255, 255, 0.22)',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '8px',
                                fontSize: '0.72rem',
                                fontWeight: '800',
                                color: 'white',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}
                        >
                            <MapPin size={13} color="#34D399" />
                            <span>
                                {isLocationLoading ? 'Detecting GPS Location...' : (gpsState ? `${cityName ? `${cityName}, ` : ''}${gpsState}` : 'Select Region / Lock GPS')}
                            </span>
                            <span style={{ fontSize: '0.55rem', opacity: 0.8, marginLeft: '2px' }}>▼</span>
                        </button>

                        {isLocationMenuOpen && (
                            <>
                                <div onClick={() => setIsLocationMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'transparent' }} />
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 6px)',
                                    left: 0,
                                    background: '#FFFFFF',
                                    borderRadius: '14px',
                                    boxShadow: '0 14px 35px rgba(0,0,0,0.22)',
                                    border: '1px solid #E2E8F0',
                                    padding: '0.5rem',
                                    minWidth: '260px',
                                    zIndex: 9999,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '3px'
                                }}>
                                    {[
                                        { label: '⚡ Detect GPS Location', state: 'GPS' },
                                        { label: '📍 Chennai, Tamil Nadu', city: 'Chennai', state: 'Tamil Nadu' },
                                        { label: '📍 Mumbai, Maharashtra', city: 'Mumbai', state: 'Maharashtra' },
                                        { label: '📍 Bengaluru, Karnataka', city: 'Bengaluru', state: 'Karnataka' },
                                        { label: '📍 Delhi NCR', city: 'Delhi NCR', state: 'Delhi' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.label}
                                            type="button"
                                            onClick={() => {
                                                if (opt.state === 'GPS') requestLocation();
                                                else { setCityName(opt.city); setGpsState(opt.state); }
                                                setIsLocationMenuOpen(false);
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                textAlign: 'left',
                                                padding: '0.55rem 0.65rem',
                                                fontSize: '0.8rem',
                                                fontWeight: '750',
                                                color: '#1E293B',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Banner Right Buttons */}
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    
                    {/* Notification Bell */}
                    <button 
                        onClick={() => setShowNotifDrawer(true)}
                        style={{
                            padding: '0.75rem',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.12)',
                            color: '#FFFFFF',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            cursor: 'pointer',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#EF4444', color: 'white', fontSize: '0.65rem', fontWeight: '800', borderRadius: '999px', padding: '0.15rem 0.4rem' }}>
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <button 
                        type="button"
                        onClick={() => { if (navigate) navigate('/auth/founder-login'); setShowFounderAuthModal(true); }}
                        style={{
                            padding: '0.75rem 1.25rem',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.12)',
                            color: '#FFFFFF',
                            fontWeight: '700',
                            fontSize: '0.875rem',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            backdropFilter: 'blur(8px)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <User size={15} />
                        <span>FOUNDER login</span>
                    </button>

                    <button 
                        type="button"
                        onClick={() => { if (navigate) navigate('/auth/investor-login'); setShowInvestorAuthModal(true); }}
                        style={{
                            padding: '0.75rem 1.25rem',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.12)',
                            color: '#FFFFFF',
                            fontWeight: '700',
                            fontSize: '0.875rem',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            backdropFilter: 'blur(8px)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <TrendingUp size={15} />
                        <span>INVESTOR login</span>
                    </button>

                    <button 
                        onClick={() => setShowCreateModal(true)}
                        style={{
                            padding: '0.75rem 1.25rem',
                            borderRadius: '12px',
                            background: '#10b981',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '0.875rem',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        <Rocket size={15} />
                        <span>List Your Venture</span>
                    </button>
                </div>
            </div>

            {/* Sub-Header Navigation Tabs & Search */}
            <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem', background: '#e2e8f0', padding: '0.25rem', borderRadius: '12px' }}>
                    <button 
                        onClick={() => { setActiveTab('directory'); setSearchTerm(''); }}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '9px',
                            background: activeTab === 'directory' ? '#ffffff' : 'transparent',
                            boxShadow: activeTab === 'directory' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            color: activeTab === 'directory' ? '#0f172a' : '#64748b',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Active Deals Marketplace
                    </button>
                    <button 
                        onClick={() => { setActiveTab('studio'); setSearchTerm(''); }}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '9px',
                            background: activeTab === 'studio' ? '#ffffff' : 'transparent',
                            boxShadow: activeTab === 'studio' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            color: activeTab === 'studio' ? '#0f172a' : '#64748b',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        My Studio (Founder View)
                    </button>
                    {(openAuthModal === 'admin' || activeTab === 'admin') && (
                        <button 
                            onClick={() => { setActiveTab('admin'); setSearchTerm(''); }}
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: '9px',
                                background: activeTab === 'admin' ? '#7C3AED' : 'transparent',
                                color: activeTab === 'admin' ? '#ffffff' : '#7C3AED',
                                fontWeight: '800',
                                fontSize: '0.85rem',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            🛡️ Admin Review Desk
                        </button>
                    )}
                </div>

                {/* Quota Counter Indicator for Investors */}
                {quotaStatus && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.35rem 0.85rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '750', color: '#1e40af' }}>
                        <Coins size={15} color="#2563eb" />
                        <span>Unlocked Deals: <strong>{quotaStatus.quota_used} / {quotaStatus.quota_limit}</strong></span>
                        {quotaStatus.quota_remaining <= 2 && (
                            <button onClick={() => setShowUpgradeModal(true)} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}>
                                Upgrade
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                        type="text" 
                        placeholder="Search deals by title, sector, problem, or keywords..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.65rem 1rem 0.65rem 2.5rem',
                            borderRadius: '12px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.875rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>
                <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    style={{
                        padding: '0.65rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                        outline: 'none',
                        background: 'white',
                        fontWeight: '700',
                        color: '#334155',
                        cursor: 'pointer'
                    }}
                >
                    {industryOptions.map(opt => (
                        <option key={opt} value={opt}>{opt === 'ALL' ? 'All Sectors' : opt}</option>
                    ))}
                </select>
            </div>

            {/* ── ACTIVE DEALS MARKETPLACE ──────────────────────────────────────── */}
            {activeTab === 'directory' && (
                <div>
                    {isMarketplaceLoading ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Loading verified SME deal marketplace...</div>
                    ) : marketplacePitches.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                            <Building size={44} style={{ margin: '0 auto 0.75rem', color: '#94a3b8' }} />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#334155' }}>No Active Published Deals</h3>
                            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Only Admin-accepted pitches appear in the active marketplace.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                            {marketplacePitches.map(pitch => {
                                const isUnlocked = !!unlockedMap[pitch.id];
                                return (
                                    <div 
                                        key={pitch.id}
                                        style={{
                                            background: 'white',
                                            borderRadius: '16px',
                                            padding: '1.25rem',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                <span style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', background: '#eff6ff', color: '#2563eb', fontSize: '0.75rem', fontWeight: '800' }}>
                                                    {pitch.sector || pitch.industry || 'Technology'}
                                                </span>
                                                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>
                                                    📍 {pitch.location || 'India'}
                                                </span>
                                            </div>

                                            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                                                {pitch.title || pitch.company_name}
                                            </h3>
                                            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.4, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {pitch.description || pitch.problem || 'Verified SME venture seeking capital expansion.'}
                                            </p>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', marginBottom: '1rem' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>GOAL TARGET</div>
                                                    <div style={{ fontSize: '1rem', fontWeight: '850', color: '#059669' }}>
                                                        ₹{(pitch.goal_amount || pitch.funding_target || 0).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>EQUITY OFFERED</div>
                                                    <div style={{ fontSize: '1rem', fontWeight: '850', color: '#1e40af' }}>
                                                        {pitch.equity_offered || 0}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => handleConnectTrigger(pitch)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                borderRadius: '12px',
                                                background: isUnlocked ? '#059669' : '#1E3A8A',
                                                color: 'white',
                                                fontWeight: '800',
                                                fontSize: '0.875rem',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            {isUnlocked ? <CheckCircle2 size={16} /> : <Lock size={15} />}
                                            <span>{isUnlocked ? 'Unlocked — View Deal' : 'Connect / View Pitch (1 Quota)'}</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── MY STUDIO (FOUNDER VIEW) ────────────────────────────────────── */}
            {activeTab === 'studio' && (
                <div>
                    {isStudioLoading ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Loading founder studio pitches...</div>
                    ) : studioPitches.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                            <Rocket size={44} style={{ margin: '0 auto 0.75rem', color: '#10b981' }} />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#334155' }}>No Pitches Submitted Yet</h3>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>List your venture pitch to request admin review and publish to investors.</p>
                            <button onClick={() => setShowCreateModal(true)} style={{ background: '#10b981', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                                + Submit Your Venture
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                            {studioPitches.map(pitch => (
                                <div 
                                    key={pitch.id}
                                    style={{
                                        background: 'white',
                                        borderRadius: '16px',
                                        padding: '1.25rem',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            {getStatusBadge(pitch.status)}
                                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                                {pitch.sector || 'Technology'}
                                            </span>
                                        </div>

                                        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                                            {pitch.title || pitch.company_name}
                                        </h3>
                                        <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                                            {pitch.description || pitch.use_of_funds}
                                        </p>

                                        {/* Admin Remarks Display if Rejected */}
                                        {pitch.status === 'REJECTED' && (
                                            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#991b1b', marginBottom: '0.2rem' }}>
                                                    ⚠️ Admin Audit Remarks:
                                                </div>
                                                <p style={{ fontSize: '0.825rem', color: '#7f1d1d', margin: 0 }}>
                                                    {pitch.admin_remarks || 'Please update your funding target and deck details.'}
                                                </p>
                                            </div>
                                        )}

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', marginBottom: '1rem' }}>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>GOAL TARGET</div>
                                                <div style={{ fontSize: '1rem', fontWeight: '850', color: '#059669' }}>
                                                    ₹{(pitch.goal_amount || pitch.funding_target || 0).toLocaleString()}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>EQUITY OFFERED</div>
                                                <div style={{ fontSize: '1rem', fontWeight: '850', color: '#1e40af' }}>
                                                    {pitch.equity_offered || 0}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {pitch.status === 'REJECTED' && (
                                        <button 
                                            onClick={() => setResubmitPitch(pitch)}
                                            style={{
                                                width: '100%',
                                                padding: '0.65rem',
                                                borderRadius: '10px',
                                                background: '#dc2626',
                                                color: 'white',
                                                fontWeight: '800',
                                                fontSize: '0.85rem',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.4rem'
                                            }}
                                        >
                                            <Edit3 size={15} /> Edit & Resubmit Pitch
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── ADMIN REVIEW DESK ───────────────────────────────────────────── */}
            {activeTab === 'admin' && (
                <div>
                    <div style={{ background: '#7C3AED', color: 'white', padding: '1rem 1.5rem', borderRadius: '16px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '850', margin: 0 }}>Capital Matrix — Admin Review Desk</h2>
                            <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: 0 }}>Review submitted SME ventures, leave audit remarks, and publish pitches.</p>
                        </div>
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.35rem 0.85rem', borderRadius: '999px', fontWeight: '800', fontSize: '0.8rem' }}>
                            {adminPitches.length} Total Submissions
                        </span>
                    </div>

                    {isAdminLoading ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Loading pitches for admin audit...</div>
                    ) : adminPitches.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px' }}>No venture submissions found.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {adminPitches.map(pitch => (
                                <div 
                                    key={pitch.id}
                                    style={{
                                        background: 'white',
                                        borderRadius: '16px',
                                        padding: '1.25rem 1.5rem',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '1rem'
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: '280px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '850', color: '#0f172a', margin: 0 }}>
                                                {pitch.title || pitch.company_name}
                                            </h3>
                                            {getStatusBadge(pitch.status)}
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                                            Founder: <strong>{pitch.founder_name || 'Founder'}</strong> ({pitch.founder_email || 'N/A'}) • Sector: <strong>{pitch.sector || 'Technology'}</strong>
                                        </p>
                                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#334155' }}>
                                            <span>Goal Target: <strong>₹{(pitch.goal_amount || pitch.funding_target || 0).toLocaleString()}</strong></span>
                                            <span>Equity: <strong>{pitch.equity_offered || 0}%</strong></span>
                                        </div>
                                        {pitch.admin_remarks && (
                                            <div style={{ fontSize: '0.78rem', color: '#7c3aed', background: '#f5f3ff', padding: '0.35rem 0.65rem', borderRadius: '6px', marginTop: '0.5rem' }}>
                                                Remarks: {pitch.admin_remarks}
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        onClick={() => { setAdminReviewPitch(pitch); setAdminRemarksInput(pitch.admin_remarks || ''); }}
                                        style={{
                                            padding: '0.65rem 1.25rem',
                                            borderRadius: '10px',
                                            background: '#7C3AED',
                                            color: 'white',
                                            fontWeight: '800',
                                            fontSize: '0.85rem',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Audit & Review Pitch
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── CREATE VENTURE MODAL ────────────────────────────────────────── */}
            {showCreateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '650px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>List Your Venture</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Submit your roadmap for Admin Review & Investor Connect</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}><X size={22} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '2rem', maxHeight: '70vh', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '750', color: '#475569', marginBottom: '0.4rem' }}>Business / Venture Name *</label>
                                    <input type="text" required value={formData.business_name} onChange={e => setFormData({ ...formData, business_name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '750', color: '#475569', marginBottom: '0.4rem' }}>Sector *</label>
                                    <select value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', boxSizing: 'border-box' }}>
                                        {industryOptions.filter(o => o !== 'ALL').map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '750', color: '#475569', marginBottom: '0.4rem' }}>Headline Pitch *</label>
                                <input type="text" required value={formData.headline} onChange={e => setFormData({ ...formData, headline: e.target.value })} placeholder="e.g. Next-gen AI inventory platform for retail SMEs" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '750', color: '#475569', marginBottom: '0.4rem' }}>Funding Goal Target (₹) *</label>
                                    <input type="number" min="0" required value={formData.funding_target} onChange={e => setFormData({ ...formData, funding_target: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                                    {formErrors.funding_target && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.funding_target}</span>}
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '750', color: '#475569', marginBottom: '0.4rem' }}>Equity Offered (0-100%) *</label>
                                    <input type="number" min="0" max="100" required value={formData.equity_offered} onChange={e => setFormData({ ...formData, equity_offered: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                                    {formErrors.equity_offered && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.equity_offered}</span>}
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '750', color: '#475569', marginBottom: '0.4rem' }}>Pitch Deck URL</label>
                                <input type="url" value={formData.pitch_deck_url} onChange={e => setFormData({ ...formData, pitch_deck_url: e.target.value })} placeholder="https://drive.google.com/..." style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: '#10b981', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}>
                                Submit Pitch for Admin Review
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── ADMIN ACTION MODAL ───────────────────────────────────────────── */}
            {adminReviewPitch && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', background: '#7C3AED', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '850', margin: 0 }}>Audit & Review Pitch</h3>
                            <button onClick={() => setAdminReviewPitch(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'white' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem 0' }}>{adminReviewPitch.title || adminReviewPitch.company_name}</h4>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>{adminReviewPitch.description}</p>
                            
                            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '750', color: '#334155', marginBottom: '0.4rem' }}>Audit Remarks / Feedback</label>
                            <textarea 
                                rows={3} 
                                value={adminRemarksInput} 
                                onChange={e => setAdminRemarksInput(e.target.value)} 
                                placeholder="Enter review notes, compliance checks, or required revisions..."
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', marginBottom: '1.5rem', boxSizing: 'border-box' }} 
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button 
                                    onClick={() => adminReviewMutation.mutate({ id: adminReviewPitch.id, status: 'REJECTED', admin_remarks: adminRemarksInput })}
                                    style={{ padding: '0.85rem', borderRadius: '12px', background: '#dc2626', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer' }}
                                >
                                    Reject / Request Revisions
                                </button>
                                <button 
                                    onClick={() => adminReviewMutation.mutate({ id: adminReviewPitch.id, status: 'ACCEPTED', admin_remarks: adminRemarksInput })}
                                    style={{ padding: '0.85rem', borderRadius: '12px', background: '#059669', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer' }}
                                >
                                    Accept & Publish
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── UPGRADE WORKSPACE TIER MODAL ────────────────────────────────── */}
            {showUpgradeModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.75rem 2rem', background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                    <Crown size={22} color="#FBBF24" />
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', margin: 0 }}>Upgrade Workspace Tier</h3>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#BFDBFE', margin: 0 }}>You have reached your unlocked deal quota limit.</p>
                            </div>
                            <button onClick={() => setShowUpgradeModal(false)} style={{ border: 'none', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: '0.35rem', cursor: 'pointer', color: 'white' }}><X size={18} /></button>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
                                <div style={{ fontWeight: '800', color: '#1e40af', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Basic Investor Plan (Limit: 20 Deals)</div>
                                <p style={{ fontSize: '0.8rem', color: '#3b82f6', margin: 0 }}>Access up to 20 verified startup pitches & founder contact channels.</p>
                            </div>
                            <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ fontWeight: '800', color: '#6d28d9', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Pro Investor Plan (Limit: 50 Deals)</div>
                                <p style={{ fontSize: '0.8rem', color: '#7c3aed', margin: 0 }}>Expanded access for active investors with 50 unique deal unlocks.</p>
                            </div>
                            <button 
                                onClick={() => { setShowUpgradeModal(false); if (navigate) navigate('/subscription'); }}
                                style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)', color: 'white', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}
                            >
                                Upgrade Plan Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── NOTIFICATION DRAWER ────────────────────────────────────────── */}
            {showNotifDrawer && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '400px', height: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 25px rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Bell size={20} color="#1E3A8A" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '850', margin: 0 }}>In-App Notifications</h3>
                            </div>
                            <button onClick={() => setShowNotifDrawer(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {notifications.length === 0 ? (
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No notifications received yet.</p>
                            ) : (
                                notifications.map(notif => (
                                    <div key={notif.id} style={{ background: notif.is_read ? '#f8fafc' : '#eff6ff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.2rem' }}>{notif.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>{notif.message}</div>
                                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.4rem' }}>{new Date(notif.created_at).toLocaleString()}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* FOUNDER Login Modal */}
            {showFounderAuthModal && (
                <div 
                    onClick={() => { setShowFounderAuthModal(false); if (navigate) navigate('/social/betaclub', { replace: true }); }}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
                >
                    <div onClick={(e) => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.75rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'linear-gradient(135deg, #1E3A8A 0%, #1e40af 100%)', color: 'white' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                    <User size={20} color="#60A5FA" />
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', margin: 0 }}>FOUNDER Login</h3>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#BFDBFE', margin: 0 }}>Access your venture dashboard and investor connections.</p>
                            </div>
                            <button onClick={() => { setShowFounderAuthModal(false); if (navigate) navigate('/social/betaclub', { replace: true }); }} style={{ border: 'none', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', padding: '0.35rem', cursor: 'pointer', color: 'white' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); alert("Founder login successful!"); setShowFounderAuthModal(false); }} style={{ padding: '2rem' }}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '750', color: '#334155', marginBottom: '0.4rem' }}>Founder Email / Phone</label>
                                <input type="text" placeholder="founder@company.com" required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '750', color: '#334155', marginBottom: '0.4rem' }}>Password</label>
                                <input type="password" placeholder="••••••••" required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: '#1E3A8A', color: 'white', fontWeight: '750', fontSize: '0.95rem', border: 'none', cursor: 'pointer' }}>
                                Login to Founder Hub
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* INVESTOR Login Modal */}
            {showInvestorAuthModal && (
                <div 
                    onClick={() => { setShowInvestorAuthModal(false); if (navigate) navigate('/social/betaclub', { replace: true }); }}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
                >
                    <div onClick={(e) => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.75rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: 'white' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                    <TrendingUp size={20} color="#34D399" />
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', margin: 0 }}>INVESTOR Login</h3>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>Access verified SME deal marketplace & private pitch rooms.</p>
                            </div>
                            <button onClick={() => { setShowInvestorAuthModal(false); if (navigate) navigate('/social/betaclub', { replace: true }); }} style={{ border: 'none', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', padding: '0.35rem', cursor: 'pointer', color: 'white' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); alert("Investor login successful!"); setShowInvestorAuthModal(false); }} style={{ padding: '2rem' }}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '750', color: '#334155', marginBottom: '0.4rem' }}>Investor ID / Email</label>
                                <input type="text" placeholder="investor@capital.com" required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '750', color: '#334155', marginBottom: '0.4rem' }}>Password / Key</label>
                                <input type="password" placeholder="••••••••" required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: '#0F172A', color: 'white', fontWeight: '750', fontSize: '0.95rem', border: 'none', cursor: 'pointer' }}>
                                Login to Investor Portal
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ADMIN Login Modal */}
            {showAdminAuthModal && (
                <div 
                    onClick={() => { setShowAdminAuthModal(false); if (navigate) navigate('/social/betaclub', { replace: true }); }}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
                >
                    <div onClick={(e) => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.45)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.75rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)', color: 'white' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                    <ShieldCheck size={22} color="#DDD6FE" />
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '850', margin: 0 }}>Capital Matrix — Admin Portal</h3>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#E9D5FF', margin: 0 }}>Platform administration & marketplace oversight</p>
                            </div>
                            <button onClick={() => { setShowAdminAuthModal(false); if (navigate) navigate('/social/betaclub', { replace: true }); }} style={{ border: 'none', background: 'rgba(255,255,255,0.18)', borderRadius: '50%', padding: '0.35rem', cursor: 'pointer', color: 'white' }}><X size={18} /></button>
                        </div>
                        <form 
                            onSubmit={(e) => { 
                                e.preventDefault(); 
                                alert("Admin credentials verified."); 
                                setShowAdminAuthModal(false); 
                                setActiveTab('admin');
                            }} 
                            style={{ padding: '2rem' }}
                        >
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '750', color: '#334155', marginBottom: '0.4rem' }}>Admin Email (@bnxmail.com)</label>
                                <input type="email" placeholder="admin@bnxmail.com" required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '750', color: '#334155', marginBottom: '0.4rem' }}>Password</label>
                                <input type="password" placeholder="••••••••" required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', color: 'white', fontWeight: '750', fontSize: '0.95rem', border: 'none', cursor: 'pointer' }}>
                                Verify & Enter Admin Console
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
