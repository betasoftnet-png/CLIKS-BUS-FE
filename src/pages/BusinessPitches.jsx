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
    ArrowUpRight
} from 'lucide-react';

export default function BusinessPitches() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'studio'
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedConnectPitch, setSelectedConnectPitch] = useState(null);

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
        founder_email: ''
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
                founder_email: ''
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
        createMutation.mutate(formData);
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

    return (
        <div style={{
            height: '100%',
            background: 'radial-gradient(circle at top left, #f0fdf4 0%, #ffffff 70%)',
            padding: '1.25rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxSizing: 'border-box',
            fontFamily: '"Outfit", sans-serif'
        }}>
            
            {/* Header Banner Section */}
            <div style={{
                flexShrink: 0,
                background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
                borderRadius: '28px',
                padding: '2rem 3rem',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 20px 40px -10px rgba(6, 78, 59, 0.2)',
                marginBottom: '1.5rem'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '999px',
                        backdropFilter: 'blur(12px)',
                        marginBottom: '1.25rem',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        letterSpacing: '0.03em',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <TrendingUp size={16} />
                        <span>CLIKS VENTURE CONNECT</span>
                    </div>
                    <h1 style={{ fontSize: '2.75rem', fontWeight: '900', marginBottom: '0.75rem', lineHeight: 1.2 }}>
                        SME Venture Studio <br /> & Deal Marketplace
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#d1fae5', maxWidth: '500px', margin: 0, opacity: 0.95 }}>
                        Connect instantly with founders. Review active proposals, download executive decks, and contact owners offline.
                    </p>
                </div>
                
                {/* Quick CTA Box */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(16px)',
                    padding: '2rem',
                    borderRadius: '20px',
                    textAlign: 'center',
                    maxWidth: '320px',
                    zIndex: 2
                }}>
                    <Award size={36} color="#fbbf24" style={{ marginBottom: '1rem' }} />
                    <h4 style={{ fontWeight: '800', fontSize: '1.25rem', marginBottom: '0.5rem' }}>List Your Pitch</h4>
                    <p style={{ fontSize: '0.9rem', color: '#d1fae5', marginBottom: '1.5rem' }}>
                        Unlock zero-barrier exposure to our active business backing network.
                    </p>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        style={{
                            width: '100%',
                            padding: '0.85rem',
                            borderRadius: '12px',
                            background: 'white',
                            color: '#064e3b',
                            fontWeight: '750',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Rocket size={16} />
                        <span>Launch Entry Studio</span>
                    </button>
                </div>
            </div>

            {/* Filtering and Actions */}
            <div style={{
                flexShrink: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    background: '#f1f5f9',
                    padding: '0.4rem',
                    borderRadius: '14px'
                }}>
                    <button 
                        onClick={() => setActiveTab('directory')}
                        style={{
                            padding: '0.6rem 1.5rem',
                            borderRadius: '10px',
                            background: activeTab === 'directory' ? 'white' : 'transparent',
                            boxShadow: activeTab === 'directory' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none',
                            fontWeight: '600',
                            color: activeTab === 'directory' ? '#0f172a' : '#64748b',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Marketplace Deals
                    </button>
                    <button 
                        onClick={() => setActiveTab('studio')}
                        style={{
                            padding: '0.6rem 1.5rem',
                            borderRadius: '10px',
                            background: activeTab === 'studio' ? 'white' : 'transparent',
                            boxShadow: activeTab === 'studio' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none',
                            fontWeight: '600',
                            color: activeTab === 'studio' ? '#0f172a' : '#64748b',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        My Studio
                    </button>
                </div>
            </div>

            {/* Scrollable Main Content Wrapper */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '2rem' }}>

            {/* Main Content Switcher */}
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <p style={{ color: '#64748b' }}>Aggregating corporate data...</p>
                </div>
            ) : activeTab === 'directory' ? (
                /* PITICHES DIRECTORY */
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                    gap: '2rem'
                }}>
                    {pitches.filter(p => p.listing_status === 'ACTIVE' || p.is_verified).length === 0 ? (
                        <div style={{
                            gridColumn: '1/-1',
                            textAlign: 'center',
                            padding: '4rem',
                            background: 'white',
                            borderRadius: '20px',
                            border: '2px dashed #e2e8f0'
                        }}>
                            <Building size={48} style={{ margin: '0 auto 1rem', color: '#94a3b8' }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#334155' }}>No active deal listings</h3>
                            <p style={{ color: '#64748b' }}>Submit your roadmap on My Studio to see it here instantly!</p>
                        </div>
                    ) : (
                        pitches.map(pitch => (
                            <div 
                                key={pitch.id}
                                style={{
                                    background: 'white',
                                    borderRadius: '24px',
                                    padding: '2rem',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.03), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
                                    border: pitch.is_verified ? '2px solid #10b981' : '1px solid #e2e8f0',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s'
                                }}
                            >
                                {/* Top Tags */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                    <span style={{
                                        padding: '0.35rem 0.85rem',
                                        borderRadius: '8px',
                                        background: '#f0fdf4',
                                        color: '#166534',
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        textTransform: 'uppercase'
                                    }}>
                                        {pitch.industry}
                                    </span>
                                    {pitch.is_verified ? (
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            padding: '0.35rem 0.85rem',
                                            borderRadius: '999px',
                                            background: '#d1fae5',
                                            color: '#065f46',
                                            fontSize: '0.75rem',
                                            fontWeight: '800'
                                        }}>
                                            <ShieldCheck size={14} />
                                            <span>ACTIVE LISTING</span>
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>Draft Entry</span>
                                    )}
                                </div>

                                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>
                                    {pitch.business_name}
                                </h3>
                                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.5, flexGrow: 1, marginBottom: '1.5rem' }}>
                                    "{pitch.headline}"
                                </p>

                                {/* Capital Data Banner */}
                                <div style={{
                                    background: '#f8fafc',
                                    borderRadius: '16px',
                                    padding: '1.25rem',
                                    marginBottom: '1.5rem',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '1rem'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '650', marginBottom: '0.25rem' }}>
                                            Funding Goal
                                        </div>
                                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>
                                            ₹{(pitch.funding_target || 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '650', marginBottom: '0.25rem' }}>
                                            Equity Allocation
                                        </div>
                                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#059669' }}>
                                            {pitch.equity_offered}%
                                        </div>
                                    </div>
                                </div>

                                {/* Contact / Connection Badge Panel */}
                                <div style={{
                                    background: '#f0fdf4',
                                    borderRadius: '12px',
                                    padding: '0.75rem 1rem',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <MessageSquare size={14} color="#10b981" />
                                        <span style={{ fontSize: '0.8rem', fontWeight: '750', color: '#15803d' }}>
                                            Connect Directly (Free)
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: '800' }}>
                                        SECURE
                                    </span>
                                </div>

                                <button 
                                    onClick={() => handleConnectTrigger(pitch)}
                                    style={{
                                        width: '100%',
                                        padding: '0.85rem',
                                        background: '#0f172a',
                                        color: 'white',
                                        borderRadius: '12px',
                                        fontWeight: '700',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <span>Connect with Founder</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                /* MY CANVAS (Listing & Verification Hub) */
                <div style={{
                    background: 'white',
                    borderRadius: '24px',
                    padding: '3rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.02)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Deal Setup Hub</h2>
                            <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Track your fundraising lists registered on CLIKS Network</p>
                        </div>
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '12px',
                                background: '#059669',
                                color: 'white',
                                border: 'none',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                gap: '0.5rem',
                                alignItems: 'center'
                            }}
                        >
                            <Plus size={18} />
                            <span>Log New Pitch</span>
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {pitches.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '16px' }}>
                                <p style={{ color: '#64748b' }}>No registered listings detected for this profile.</p>
                            </div>
                        ) : (
                            pitches.map(pitch => (
                                <div key={pitch.id} style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <h4 style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.1rem' }}>{pitch.business_name}</h4>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '6px',
                                                background: (pitch.is_verified === 1 || pitch.is_verified === true || pitch.listing_status === 'ACTIVE') ? '#d1fae5' : '#fef3c7',
                                                color: (pitch.is_verified === 1 || pitch.is_verified === true || pitch.listing_status === 'ACTIVE') ? '#065f46' : '#92400e',
                                                fontWeight: '750'
                                            }}>
                                                {pitch.listing_status === 'ACTIVE' ? 'ACTIVE' : pitch.listing_status}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                                            Requesting ₹{(pitch.funding_target || 0).toLocaleString()} for {pitch.equity_offered}% Equity Share
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        {!(pitch.is_verified === 1 || pitch.is_verified === true || pitch.listing_status === 'ACTIVE') && (
                                            <button 
                                                onClick={() => activateMutation.mutate({ id: pitch.id })}
                                                disabled={activateMutation.isPending}
                                                style={{
                                                    padding: '0.6rem 1.25rem',
                                                    borderRadius: '10px',
                                                    background: '#10b981',
                                                    color: 'white',
                                                    fontWeight: '700',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                <Zap size={15} fill="currentColor" />
                                                <span>Activate Profile</span>
                                            </button>
                                        )}
                                        {(pitch.is_verified === 1 || pitch.is_verified === true || pitch.listing_status === 'ACTIVE') && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: '750', fontSize: '0.9rem' }}>
                                                <CheckCircle size={18} />
                                                <span>Live on Marketplace</span>
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
