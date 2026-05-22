import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pitchesService } from '../services/pitchesService';
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
    Search
} from 'lucide-react';

export default function BusinessPitches() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'studio'
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedConnectPitch, setSelectedConnectPitch] = useState(null);

    // Location State
    const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
    const [gpsState, setGpsState] = useState(null);
    const [cityName, setCityName] = useState(null);
    const [pincode, setPincode] = useState(null);
    const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

    const requestLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocationPermissionDenied(false);
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
                        .then(res => res.json())
                        .then(data => {
                            const state = data.principalSubdivision;
                            const city = data.city || data.locality || data.village;
                            if (state) {
                                setGpsState(state);
                            }
                            if (city) {
                                setCityName(city);
                            }
                            if (data.postcode) {
                                setPincode(data.postcode);
                            }
                        })
                        .catch(err => {
                            console.warn('Geolocation reverse geocoding request interrupted:', err);
                        });
                },
                (error) => {
                    console.warn('Geolocation access restricted by user:', error.message);
                    setLocationPermissionDenied(true);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setLocationPermissionDenied(true);
        }
    };

    React.useEffect(() => {
        requestLocation();
    }, []);

    // Form State
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
        location: ''
    });

    // API Actions
    const { data: pitches = [], isLoading } = useQuery({
        queryKey: ['venture-pitches'],
        queryFn: pitchesService.getPitches
    });

    const createMutation = useMutation({
        mutationFn: pitchesService.createPitch,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['venture-pitches'] });
            setShowCreateModal(false);
            // Reset form
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
                location: ''
            });
            alert("Venture entry successfully published to the active marketplace!");
        },
        onError: () => {
            alert("Error creating business pitch.");
        }
    });

    const activateMutation = useMutation({
        mutationFn: ({ id }) => pitchesService.verifyPitch(id, { payment_ref: 'OFFLINE_ACTIVATE' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['venture-pitches'] });
            alert("Pitch activated! It is now visible to our investor network.");
        },
        onError: () => {
            alert("Error activating startup pitch.");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.business_name || !formData.headline || !formData.funding_target || !formData.founder_email || !formData.founder_phone) {
            alert("Please supply active founder contact details so investors can reach you.");
            return;
        }
        const payload = {
            ...formData,
            location: formData.location || (cityName ? `${cityName}, ${gpsState}` : 'Chennai, Tamil Nadu')
        };
        createMutation.mutate(payload);
    };

    const handleConnectTrigger = (pitch) => {
        setSelectedConnectPitch(pitch);
    };

    const handleSendInquiry = () => {
        alert("Inquiry Request Delivered! The founder has been notified via Cliks Network.");
        setSelectedConnectPitch(null);
    };

    const industryOptions = [
        'Technology', 'Retail & Commerce', 'Healthcare', 'Finance & FinTech', 
        'Manufacturing', 'Food & Beverage', 'Real Estate', 'Other'
    ];

    // ── Personalization & Location Recommendation Engine ──
    const getRecommendationScore = (pitch) => {
        let score = 0;
        
        // Proximity/Location Based Match Boost
        const profileState = gpsState || 'Tamil Nadu';
        const profileCity = cityName || '';
        
        if (pitch.location && profileState) {
            const pitchLoc = pitch.location.toLowerCase();
            const uState = profileState.toLowerCase();
            const uCity = profileCity.toLowerCase();
            
            if (uCity && pitchLoc.includes(uCity)) {
                score += 150; // City match booster
            } else if (pitchLoc.includes(uState)) {
                score += 100; // State match booster
            }
        }
        
        if (pitch.is_verified) {
            score += 50;
        }

        return score;
    };

    return (
        <div style={{
            height: '100%',
            background: '#f8fafc',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxSizing: 'border-box',
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif'
        }}>
            
            {/* Slim, Beautiful Modern Header */}
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
                overflow: 'hidden'
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
                        <span>VENTURE CONNECT</span>
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '850', marginBottom: '0.25rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        SME Deal Marketplace
                    </h1>
                    <p style={{ fontSize: '0.9rem', color: '#BFDBFE', maxWidth: '500px', margin: 0, opacity: 0.85 }}>
                        Connect directly with verified founders, review pitches, and contact owners instantly.
                    </p>
                    
                    <div style={{ position: 'relative', marginTop: '0.55rem', display: 'inline-block' }}>
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
                            onMouseOver={e => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <MapPin size={13} color="#34D399" />
                            <span>
                                {gpsState ? (
                                    `${cityName ? `${cityName}, ` : ''}${gpsState}${pincode ? `, Pincode: ${pincode}` : ''}`
                                ) : (
                                    'Select Region / Lock GPS'
                                )}
                            </span>
                            <span style={{ fontSize: '0.55rem', opacity: 0.8, marginLeft: '2px' }}>▼</span>
                        </button>

                        {isLocationMenuOpen && (
                            <>
                                <div 
                                    onClick={() => setIsLocationMenuOpen(false)}
                                    style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'transparent' }} 
                                />
                                
                                <div style={{
                                    position: 'absolute',
                                    top: '110%',
                                    left: 0,
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                                    border: '1px solid #E2E8F0',
                                    padding: '0.4rem',
                                    minWidth: '220px',
                                    zIndex: 999,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px'
                                }}>
                                    <div style={{ fontSize: '0.62rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', padding: '0.3rem 0.5rem', borderBottom: '1px solid #F1F5F9', marginBottom: '0.2rem' }}>
                                        Select Matching Region
                                    </div>
                                    
                                    {[
                                        { label: '⚡ Detect GPS Location', city: null, state: 'GPS', plusCode: 'Auto', pincode: null },
                                        { label: '📍 Chennai, Tamil Nadu', city: 'Chennai', state: 'Tamil Nadu', plusCode: '7J5X4W66+F9', pincode: '600001' },
                                        { label: '📍 Trichy, Tamil Nadu', city: 'Trichy', state: 'Tamil Nadu', plusCode: '7J4VQ456+7W', pincode: '620001' },
                                        { label: '📍 Mumbai, Maharashtra', city: 'Mumbai', state: 'Maharashtra', plusCode: '8FVC9G8F+6W', pincode: '400001' },
                                        { label: '📍 Bengaluru, Karnataka', city: 'Bengaluru', state: 'Karnataka', plusCode: '7J4VXH8R+5P', pincode: '560001' },
                                        { label: '📍 Delhi NCR', city: 'Delhi NCR', state: 'Delhi', plusCode: '8F3C4R2V+8Q', pincode: '110001' }
                                    ].map((opt) => (
                                        <button
                                            key={opt.label}
                                            type="button"
                                            onClick={() => {
                                                if (opt.state === 'GPS') {
                                                    requestLocation();
                                                } else {
                                                    setCityName(opt.city);
                                                    setGpsState(opt.state);
                                                    setPincode(opt.pincode);
                                                    setLocationPermissionDenied(false);
                                                }
                                                setIsLocationMenuOpen(false);
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                textAlign: 'left',
                                                padding: '0.5rem 0.6rem',
                                                fontSize: '0.78rem',
                                                fontWeight: '750',
                                                color: '#334155',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '1px',
                                                transition: 'all 0.15s ease',
                                                width: '100%'
                                            }}
                                            onMouseOver={e => {
                                                e.currentTarget.style.background = '#F1F5F9';
                                                e.currentTarget.style.color = '#1E3A8A';
                                            }}
                                            onMouseOut={e => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = '#334155';
                                            }}
                                        >
                                            <span style={{ fontSize: '0.75rem' }}>{opt.label}</span>
                                            <span style={{ fontSize: '0.58rem', color: '#94A3B8', fontWeight: '500' }}>
                                                {opt.pincode ? `Pincode: ${opt.pincode}` : `Plus Code: ${opt.plusCode}`}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <button 
                    onClick={() => setShowCreateModal(true)}
                    style={{
                        position: 'relative',
                        zIndex: 2,
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
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                        transition: 'transform 0.2s, background 0.2s'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = '#059669';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = '#10b981';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <Rocket size={15} />
                    <span>List Your Venture</span>
                </button>
            </div>

            {/* Elegant Compact Sub-Header with Navigation */}
            <div style={{
                flexShrink: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '0.25rem',
                    background: '#e2e8f0',
                    padding: '0.25rem',
                    borderRadius: '12px'
                }}>
                    <button 
                        onClick={() => {
                            setActiveTab('directory');
                            setSearchTerm('');
                        }}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '9px',
                            background: activeTab === 'directory' ? '#ffffff' : 'transparent',
                            boxShadow: activeTab === 'directory' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            color: activeTab === 'directory' ? '#0f172a' : '#64748b',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Active Deals
                    </button>
                    <button 
                        onClick={() => {
                            setActiveTab('studio');
                            setSearchTerm('');
                        }}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '9px',
                            background: activeTab === 'studio' ? '#ffffff' : 'transparent',
                            boxShadow: activeTab === 'studio' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            color: activeTab === 'studio' ? '#0f172a' : '#64748b',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        My Studio
                    </button>
                </div>

                {activeTab === 'directory' && (
                    <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search deals..."
                            style={{
                                width: '100%',
                                padding: '0.55rem 1rem 0.55rem 2.3rem',
                                borderRadius: '10px',
                                border: '1px solid #E2E8F0',
                                outline: 'none',
                                fontSize: '0.82rem',
                                fontWeight: '600',
                                color: '#1E293B',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Scrollable Main Content Wrapper */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '2rem' }}>

            {locationPermissionDenied && (
                <div style={{
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: '#991B1B',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '12px',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.82rem',
                    fontWeight: '750',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.03)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={16} color="#DC2626" />
                        <span>Location services are disabled or blocked. Enable location permissions in your browser to unlock real-time location-based matchmaking.</span>
                    </div>
                    <button 
                        onClick={() => {
                            setLocationPermissionDenied(false);
                            requestLocation();
                        }}
                        style={{
                            background: '#DC2626',
                            color: 'white',
                            border: 'none',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '8px',
                            fontWeight: '800',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#B91C1C'}
                        onMouseOut={e => e.currentTarget.style.background = '#DC2626'}
                    >
                        Enable Location
                    </button>
                </div>
            )}

            {/* Main Content Switcher */}
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <p style={{ color: '#64748b' }}>Aggregating corporate data...</p>
                </div>
            ) : activeTab === 'directory' ? (
                /* PITICHES DIRECTORY */
                (() => {
                    const activePitches = pitches.filter(p => p.listing_status === 'ACTIVE' || p.is_verified);
                    const filteredPitches = activePitches.filter(pitch => {
                        if (!searchTerm.trim()) return true;
                        const term = searchTerm.toLowerCase();
                        return (
                            pitch.business_name?.toLowerCase().includes(term) ||
                            pitch.headline?.toLowerCase().includes(term) ||
                            pitch.industry?.toLowerCase().includes(term) ||
                            pitch.use_of_funds?.toLowerCase().includes(term) ||
                            pitch.location?.toLowerCase().includes(term)
                        );
                    });
                    const sortedPitches = [...filteredPitches].sort((a, b) => {
                        const scoreA = getRecommendationScore(a);
                        const scoreB = getRecommendationScore(b);
                        return scoreB - scoreA;
                    });

                    return (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '1rem'
                        }}>
                            {sortedPitches.length === 0 ? (
                                <div style={{
                                    gridColumn: '1/-1',
                                    textAlign: 'center',
                                    padding: '3rem',
                                    background: 'white',
                                    borderRadius: '16px',
                                    border: '1px dashed #cbd5e1'
                                }}>
                                    <Building size={40} style={{ margin: '0 auto 0.75rem', color: '#94a3b8' }} />
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#334155' }}>
                                        {searchTerm ? "No matching deals found" : "No active deal listings"}
                                    </h3>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                        {searchTerm ? "Try adjusting your search terms or filters." : "Submit your roadmap on My Studio to see it here instantly!"}
                                    </p>
                                </div>
                            ) : (
                                sortedPitches.map(pitch => {
                                    const profileState = gpsState || 'Tamil Nadu';
                                    const profileCity = cityName || '';
                                    const isCityMatch = profileCity && pitch.location && pitch.location.toLowerCase().includes(profileCity.toLowerCase());
                                    const isStateMatch = profileState && pitch.location && pitch.location.toLowerCase().includes(profileState.toLowerCase());

                                    return (
                                        <div 
                                            key={pitch.id}
                                            style={{
                                                background: 'white',
                                                borderRadius: '16px',
                                                padding: '1.25rem',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02)',
                                                border: '1px solid #e2e8f0',
                                                position: 'relative',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.04)';
                                                e.currentTarget.style.borderColor = '#cbd5e1';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02)';
                                                e.currentTarget.style.borderColor = '#e2e8f0';
                                            }}
                                        >
                                            {/* Top Info Badging */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.6rem',
                                                        borderRadius: '6px',
                                                        background: '#ecfdf5',
                                                        color: '#065f46',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '800',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.02em'
                                                    }}>
                                                        {pitch.industry}
                                                    </span>
                                                    
                                                    {isCityMatch && (
                                                        <span style={{
                                                            padding: '0.25rem 0.6rem',
                                                            borderRadius: '6px',
                                                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                                            color: 'white',
                                                            fontSize: '0.7rem',
                                                            fontWeight: '800',
                                                            letterSpacing: '0.02em',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '3px'
                                                        }}>
                                                            🔥 PERFECT MATCH
                                                        </span>
                                                    )}
                                                    {!isCityMatch && isStateMatch && (
                                                        <span style={{
                                                            padding: '0.25rem 0.6rem',
                                                            borderRadius: '6px',
                                                            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                                                            color: 'white',
                                                            fontSize: '0.7rem',
                                                            fontWeight: '800',
                                                            letterSpacing: '0.02em',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '3px'
                                                        }}>
                                                            📍 NEAR YOU
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {pitch.is_verified && (
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                        color: '#10b981',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '800'
                                                    }}>
                                                        <ShieldCheck size={12} />
                                                        <span>VERIFIED</span>
                                                    </div>
                                                )}
                                            </div>

                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem', letterSpacing: '-0.01em' }}>
                                                {pitch.business_name}
                                            </h3>
                                            
                                            <p style={{ 
                                                color: '#64748b', 
                                                fontSize: '0.85rem', 
                                                lineHeight: 1.4, 
                                                flexGrow: 1, 
                                                marginBottom: '0.75rem',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {pitch.headline}
                                            </p>

                                            {/* Location Label */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.78rem', fontWeight: '600', marginBottom: '1rem' }}>
                                                <MapPin size={13} style={{ color: '#94a3b8' }} />
                                                <span>{pitch.location || 'Chennai, Tamil Nadu'}</span>
                                            </div>

                                            {/* Capital Data Banner - Sleek Row */}
                                            <div style={{
                                                background: '#f8fafc',
                                                borderRadius: '10px',
                                                padding: '0.75rem 1rem',
                                                marginBottom: '1rem',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                border: '1px solid #f1f5f9'
                                            }}>
                                                <div>
                                                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.02em', marginBottom: '0.1rem' }}>
                                                        Goal
                                                    </div>
                                                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a' }}>
                                                        ₹{(pitch.funding_target || 0).toLocaleString('en-IN')}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.02em', marginBottom: '0.1rem' }}>
                                                        Equity
                                                    </div>
                                                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#059669' }}>
                                                        {pitch.equity_offered}%
                                                    </div>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => handleConnectTrigger(pitch)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.65rem',
                                                    background: '#0f172a',
                                                    color: 'white',
                                                    borderRadius: '10px',
                                                    fontWeight: '700',
                                                    fontSize: '0.85rem',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.4rem',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = '#1e293b'}
                                                onMouseOut={(e) => e.currentTarget.style.background = '#0f172a'}
                                            >
                                                <span>Connect</span>
                                                <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    );
                })()
            ) : (
                /* MY CANVAS (Listing & Verification Hub) */
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>Studio Setup</h2>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.1rem' }}>Track your fundraising registrations</p>
                        </div>
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            style={{
                                padding: '0.6rem 1rem',
                                borderRadius: '10px',
                                background: '#059669',
                                color: 'white',
                                border: 'none',
                                fontWeight: '700',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                gap: '0.4rem',
                                alignItems: 'center'
                            }}
                        >
                            <Plus size={16} />
                            <span>New Entry</span>
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {pitches.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '12px' }}>
                                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No registered listings detected.</p>
                            </div>
                        ) : (
                            pitches.map(pitch => (
                                <div key={pitch.id} style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <h4 style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>{pitch.business_name}</h4>
                                            <span style={{
                                                fontSize: '0.65rem',
                                                padding: '0.2rem 0.4rem',
                                                borderRadius: '5px',
                                                background: (pitch.is_verified === 1 || pitch.is_verified === true || pitch.listing_status === 'ACTIVE') ? '#d1fae5' : '#fef3c7',
                                                color: (pitch.is_verified === 1 || pitch.is_verified === true || pitch.listing_status === 'ACTIVE') ? '#065f46' : '#92400e',
                                                fontWeight: '800'
                                            }}>
                                                {pitch.listing_status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT'}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                                            ₹{(pitch.funding_target || 0).toLocaleString('en-IN')} for {pitch.equity_offered}% Equity Share
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        {!(pitch.is_verified === 1 || pitch.is_verified === true || pitch.listing_status === 'ACTIVE') && (
                                            <button 
                                                onClick={() => activateMutation.mutate({ id: pitch.id })}
                                                disabled={activateMutation.isPending}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '8px',
                                                    background: '#10b981',
                                                    color: 'white',
                                                    fontWeight: '700',
                                                    fontSize: '0.8rem',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem'
                                                }}
                                            >
                                                <Zap size={13} fill="currentColor" />
                                                <span>Activate</span>
                                            </button>
                                        )}
                                        {(pitch.is_verified === 1 || pitch.is_verified === true || pitch.listing_status === 'ACTIVE') && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontWeight: '800', fontSize: '0.8rem' }}>
                                                <CheckCircle size={16} />
                                                <span>Live</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            </div>

            {/* Studio Drafting Overlay */}
            {showCreateModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '650px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        overflow: 'hidden',
                        animation: 'modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '1.75rem 2rem',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#f8fafc'
                        }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Publish Venture Profile</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Broadcast your capital expansion targets immediately</p>
                            </div>
                            <button 
                                onClick={() => setShowCreateModal(false)}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <form onSubmit={handleSubmit} style={{ padding: '2rem', maxHeight: '70vh', overflowY: 'auto' }}>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>
                                        Registry Business Name *
                                    </label>
                                    <input 
                                        required
                                        type="text"
                                        value={formData.business_name}
                                        onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                        placeholder="e.g., Beta Tech Solutions"
                                        style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>
                                        Core Industry Tag
                                    </label>
                                    <select
                                        value={formData.industry}
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                        style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', background: 'white' }}
                                    >
                                        {industryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>
                                    Headline / Expansion Memo *
                                </label>
                                <input 
                                    required
                                    type="text"
                                    value={formData.headline}
                                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                                    placeholder="e.g., Disrupting regional supply chain with micro-automated routing"
                                    style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>
                                        Funding Request Amount (₹) *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Coins size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input 
                                            required
                                            type="number"
                                            value={formData.funding_target}
                                            onChange={(e) => setFormData({ ...formData, funding_target: e.target.value })}
                                            placeholder="e.g. 5000000"
                                            style={{ width: '100%', padding: '0.85rem 0.85rem 0.85rem 2.5rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>
                                        Equity Transfer (%)
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Target size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input 
                                            type="number"
                                            value={formData.equity_offered}
                                            onChange={(e) => setFormData({ ...formData, equity_offered: e.target.value })}
                                            placeholder="e.g. 10"
                                            style={{ width: '100%', padding: '0.85rem 0.85rem 0.85rem 2.5rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>
                                    Brief Expansion Intent / Roadmap
                                </label>
                                <textarea 
                                    rows="3"
                                    value={formData.use_of_funds}
                                    onChange={(e) => setFormData({ ...formData, use_of_funds: e.target.value })}
                                    placeholder="Briefly detail operational growth goals or capital allocation..."
                                    style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>
                                        Investor Query Email *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input 
                                            type="email"
                                            required
                                            value={formData.founder_email}
                                            onChange={(e) => setFormData({ ...formData, founder_email: e.target.value })}
                                            placeholder="founder@yourbiz.com"
                                            style={{ width: '100%', padding: '0.85rem 0.85rem 0.85rem 2.5rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>
                                        Founder Contact Phone *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input 
                                            type="text"
                                            required
                                            value={formData.founder_phone}
                                            onChange={(e) => setFormData({ ...formData, founder_phone: e.target.value })}
                                            placeholder="+91 99999 99999"
                                            style={{ width: '100%', padding: '0.85rem 0.85rem 0.85rem 2.5rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>
                                    Business Location (Optional - defaults to detected GPS)
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input 
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder={cityName ? `${cityName}, ${gpsState}` : 'e.g. Chennai, Tamil Nadu'}
                                        style={{ width: '100%', padding: '0.85rem 0.85rem 0.85rem 2.5rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>
                                    Deck Link (Optional)
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FileText size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input 
                                        type="url"
                                        value={formData.pitch_deck_url}
                                        onChange={(e) => setFormData({ ...formData, pitch_deck_url: e.target.value })}
                                        placeholder="https://drive.google.com/executive-deck.pdf"
                                        style={{ width: '100%', padding: '0.85rem 0.85rem 0.85rem 2.5rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                                    />
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                borderTop: '1px solid #f1f5f9',
                                paddingTop: '1.5rem',
                                justifyContent: 'flex-end'
                            }}>
                                <button 
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    style={{
                                        padding: '0.85rem 1.5rem',
                                        borderRadius: '12px',
                                        background: 'transparent',
                                        border: '1px solid #cbd5e1',
                                        color: '#475569',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    style={{
                                        padding: '0.85rem 2rem',
                                        borderRadius: '12px',
                                        background: '#064e3b',
                                        color: 'white',
                                        fontWeight: '750',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {createMutation.isPending ? 'Publishing...' : 'Publish Now'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Investor Connector Detail Modal */}
            {selectedConnectPitch && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '500px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        overflow: 'hidden',
                        animation: 'modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        {/* Glassmorphic Header Cover */}
                        <div style={{
                            padding: '2.5rem 2rem',
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            color: 'white',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                        }}>
                            <button 
                                onClick={() => setSelectedConnectPitch(null)}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}
                            >
                                <X size={22} />
                            </button>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#34d399', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase' }}>
                                <ShieldCheck size={15} />
                                <span>Verified Registrant Info</span>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginTop: '0.25rem' }}>
                                {selectedConnectPitch.business_name}
                            </h3>
                            <p style={{ opacity: 0.8, fontSize: '0.9rem', lineHeight: 1.4 }}>
                                {selectedConnectPitch.headline}
                            </p>
                        </div>

                        <div style={{ padding: '2rem' }}>
                            <h4 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.03em', marginBottom: '1rem' }}>
                                Direct Founders Connect
                            </h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                                {/* Registered Owner */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Building size={18} color="#475569" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Corporate Holder</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1e293b' }}>
                                            {selectedConnectPitch.user_biz_name || selectedConnectPitch.business_name}
                                        </div>
                                    </div>
                                </div>

                                {/* Founder Email */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Mail size={18} color="#16a34a" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Email Address</div>
                                        <a href={`mailto:${selectedConnectPitch.founder_email}`} style={{ fontSize: '0.95rem', fontWeight: '800', color: '#059669', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            {selectedConnectPitch.founder_email || 'Unavailable'}
                                            <ArrowUpRight size={14} />
                                        </a>
                                    </div>
                                </div>

                                {/* Founder Phone */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Phone size={18} color="#2563eb" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Registered Contact</div>
                                        <a href={`tel:${selectedConnectPitch.founder_phone}`} style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1d4ed8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            {selectedConnectPitch.founder_phone || 'Unavailable'}
                                            <ArrowUpRight size={14} />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Deck Link Preview */}
                            {selectedConnectPitch.pitch_deck_url && (
                                <a 
                                    href={selectedConnectPitch.pitch_deck_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '1rem',
                                        background: '#fdf2f8',
                                        border: '1px solid #fbcfe8',
                                        borderRadius: '12px',
                                        color: '#be185d',
                                        textDecoration: 'none',
                                        fontWeight: '750',
                                        fontSize: '0.9rem',
                                        marginBottom: '2rem'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileText size={16} />
                                        <span>View Executive Presentation</span>
                                    </div>
                                    <ArrowUpRight size={16} />
                                </a>
                            )}

                            {/* Action Call */}
                            <button 
                                onClick={handleSendInquiry}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: '#059669',
                                    color: 'white',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <span>Submit Connect Request</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
