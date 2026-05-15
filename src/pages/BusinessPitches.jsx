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
    FileText
} from 'lucide-react';

// Generate payment reference outside to ensure pure render tree
const generatePaymentRef = () => 'CF_' + Math.random().toString(36).substr(2, 9).toUpperCase();

export default function BusinessPitches() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'studio'
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        business_name: '',
        industry: 'Technology',
        headline: '',
        funding_target: '',
        equity_offered: '',
        use_of_funds: '',
        pitch_deck_url: ''
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
                pitch_deck_url: ''
            });
            alert("Pitch saved successfully! You can now proceed to validation.");
        },
        onError: () => {
            alert("Error creating business pitch.");
        }
    });

    const verifyMutation = useMutation({
        mutationFn: ({ id, ref }) => pitchesService.verifyPitch(id, { payment_ref: ref }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['venture-pitches'] });
            alert("Payment verified! Your pitch is now listed live to the elite community.");
        },
        onError: () => {
            alert("Error authorizing payment reference.");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.business_name || !formData.headline || !formData.funding_target) {
            alert("Please fill in core requirements.");
            return;
        }
        createMutation.mutate(formData);
    };

    const handleVerifyAction = (id) => {
        if (window.confirm("Proceed to list your business to active investors? An allocation fee of ₹999 applies via Cashfree Gateway.")) {
            // Mock generation of Cashfree ref for Phase 1
            const mockRef = generatePaymentRef();
            verifyMutation.mutate({ id, ref: mockRef });
        }
    };

    const industryOptions = [
        'Technology', 'Retail & Commerce', 'Healthcare', 'Finance & FinTech', 
        'Manufacturing', 'Food & Beverage', 'Real Estate', 'Other'
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at top left, #f0fdf4 0%, #ffffff 70%)',
            padding: '2.5rem',
            fontFamily: '"Outfit", sans-serif'
        }}>
            
            {/* Header Banner Section */}
            <div style={{
                background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
                borderRadius: '28px',
                padding: '3rem',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 20px 40px -10px rgba(6, 78, 59, 0.2)',
                marginBottom: '3rem'
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
                        <span>CLIKS FUNDRAISING STUDIO</span>
                    </div>
                    <h1 style={{ fontSize: '2.75rem', fontWeight: '900', marginBottom: '0.75rem', lineHeight: 1.2 }}>
                        Venture Marketplace <br /> & Investor Registry
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#d1fae5', maxWidth: '500px', margin: 0, opacity: 0.95 }}>
                        Connect validated SMEs with institutional backers. Standardize your pitch and unlock seamless capital routing.
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
                    <h4 style={{ fontWeight: '800', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Host Your Pitch</h4>
                    <p style={{ fontSize: '0.9rem', color: '#d1fae5', marginBottom: '1.5rem' }}>
                        Unlock elite exposure to 50+ premium investors for ₹999.
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
                        <span>Launch Studio</span>
                    </button>
                </div>
            </div>

            {/* Filtering and Actions */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
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
                        Marketplace Directory
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
                        My Canvas
                    </button>
                </div>
            </div>

            {/* Main Content Switcher */}
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <p style={{ color: '#64748b' }}>Aggregating market pitches...</p>
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
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#334155' }}>No active investor offerings yet</h3>
                            <p style={{ color: '#64748b' }}>Be the first pioneer to structure and publish your expansion requirements!</p>
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
                                            <span>VERIFIED PITCH</span>
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>Review Draft</span>
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
                                            Goal Setup
                                        </div>
                                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>
                                            ₹{(pitch.funding_target || 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '650', marginBottom: '0.25rem' }}>
                                            Equity Exchange
                                        </div>
                                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#059669' }}>
                                            {pitch.equity_offered}%
                                        </div>
                                    </div>
                                </div>

                                {/* Phase 2 Locked Placeholder Demo */}
                                <div style={{
                                    background: '#eff6ff',
                                    borderRadius: '12px',
                                    padding: '0.75rem 1rem',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Lock size={14} color="#3b82f6" />
                                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1d4ed8' }}>
                                            Financial Statements Locked
                                        </span>
                                    </div>
                                    <button style={{ border: 'none', background: 'transparent', color: '#2563eb', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}>
                                        Unlock
                                    </button>
                                </div>

                                <button style={{
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
                                }}>
                                    <span>Access Investor Deck</span>
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
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>My Venture Studio</h2>
                            <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Configure and manage your platform funding lists</p>
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
                            <span>Draft New Profile</span>
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {pitches.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '16px' }}>
                                <p style={{ color: '#64748b' }}>No existing pitch registries found for your business account.</p>
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
                                                background: pitch.is_verified ? '#d1fae5' : '#fef3c7',
                                                color: pitch.is_verified ? '#065f46' : '#92400e',
                                                fontWeight: '750'
                                            }}>
                                                {pitch.listing_status}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                                            Targeting ₹{(pitch.funding_target || 0).toLocaleString()} for {pitch.equity_offered}% Equity
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        {!pitch.is_verified && (
                                            <button 
                                                onClick={() => handleVerifyAction(pitch.id)}
                                                disabled={verifyMutation.isPending}
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
                                                <span>Pay & Verify (₹999)</span>
                                            </button>
                                        )}
                                        {pitch.is_verified && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: '750', fontSize: '0.9rem' }}>
                                                <CheckCircle size={18} />
                                                <span>Active on Marketplace</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

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
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>New Funding Entry</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Define your capital requirement goals</p>
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
                                    Headline / One-Line Memo *
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
                                        Target Capital Req. (₹) *
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
                                        Equity Offered (%)
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
                                    Brief Use of Funds / Expansion Roadmap
                                </label>
                                <textarea 
                                    rows="3"
                                    value={formData.use_of_funds}
                                    onChange={(e) => setFormData({ ...formData, use_of_funds: e.target.value })}
                                    placeholder="Detail operational goals, product hires, or marketing triggers..."
                                    style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.5rem' }}>
                                    External Deck / Document Link (Optional)
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FileText size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input 
                                        type="url"
                                        value={formData.pitch_deck_url}
                                        onChange={(e) => setFormData({ ...formData, pitch_deck_url: e.target.value })}
                                        placeholder="https://drive.google.com/deck.pdf"
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
                                    Discard
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
                                    {createMutation.isPending ? 'Logging...' : 'Draft Venture Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
