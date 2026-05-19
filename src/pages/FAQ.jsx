import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import {
    AccordionRoot,
    AccordionItem,
    AccordionTrigger,
    AccordionContent
} from '../components/ui/accordion';
import { supportService } from '../services/supportService';
import { 
    HelpCircle, 
    Send, 
    MessageSquare, 
    Activity, 
    CheckCircle, 
    AlertTriangle, 
    Clock, 
    User,
    ChevronDown,
    Mail,
    Globe
} from 'lucide-react';

const FAQ = () => {
    const faqs = [
        {
            question: "How do I reset my password?",
            answer: "You can reset your password by going to the Profile page, navigating to the 'Security & Access' tab (if available) or clicking 'Forgot Password' on the login screen. Follow the email instructions to create a new one."
        },
        {
            question: "Can I export my financial data?",
            answer: "Yes! Navigate to the 'Profile' page and select the 'Data & Backup' tab. There you will find options to export your data as CSV or JSON format."
        },
        {
            question: "How do I add a new team member?",
            answer: "Team management features are available in the 'People' section under 'Books'. You can invite members via email and assign them roles such as Admin, Editor, or Viewer."
        },
        {
            question: "Is my data secure?",
            answer: "We use industry-standard encryption for all data transmission and storage. Your financial information is never shared with third parties without your explicit consent."
        },
        {
            question: "Can I use the app offline?",
            answer: "Currently, the application requires an active internet connection to sync data in real-time. An offline mode is planned for future updates."
        }
    ];

    // State parameters
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Ticket filing form state
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await supportService.getUserTickets();
            if (res) {
                setTickets(res);
            }
        } catch (err) {
            console.error("Failed to fetch tickets stream:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!subject.trim() || !description.trim()) {
            setError('Please describe your issue coordinates clearly.');
            return;
        }

        setSaving(true);
        setError('');
        setMessage('');

        try {
            await supportService.createUserTicket({
                subject,
                description,
                priority
            });
            setSubject('');
            setDescription('');
            setPriority('MEDIUM');
            setMessage('Your support ticket has been successfully logged. A specialist will review it shortly.');
            fetchTickets();
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to file support ticket.');
        } finally {
            setSaving(false);
        }
    };

    const getStatusPill = (status) => {
        const clean = (status || 'OPEN').toUpperCase();
        switch(clean) {
            case 'RESOLVED':
                return { bg: '#ECFDF5', color: '#10B981', label: 'RESOLVED', icon: <CheckCircle size={12} /> };
            case 'ESCALATED':
                return { bg: '#FEF2F2', color: '#EF4444', label: 'ESCALATED TO ADMIN', icon: <AlertTriangle size={12} /> };
            case 'OPEN':
            default:
                return { bg: '#FFF7ED', color: '#EA580C', label: 'OPEN TICKET', icon: <Clock size={12} /> };
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', minHeight: '100vh', paddingBottom: '5rem' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <Breadcrumbs />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', marginTop: '0.5rem' }}>
                    <span style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>HELP CENTER</span>
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 850, color: '#0F172A', margin: 0 }}>Help & Customer Support</h1>
                <p style={{ color: '#64748B', margin: '0.5rem 0 0 0', fontWeight: 500 }}>Access common guides or log direct tickets to our dedicated customer support squad.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                
                {/* Left Column: Ticketing & Active Tickets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Log New Ticket Form */}
                    <div style={{ background: 'white', padding: '2.25rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '8px', background: '#F0FDF4', color: '#16A34A', borderRadius: '10px' }}>
                                <MessageSquare size={20} />
                            </div>
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Open a Support Ticket</h2>
                        </div>

                        {message && (
                            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                                {message}
                            </div>
                        )}

                        {error && (
                            <div style={{ background: '#FEF2FE', border: '1px solid #FBCFE8', color: '#9D174D', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Issue Subject</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Invoicing tax breakdown looks wrong"
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', fontWeight: 600 }}
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Severity Priority</label>
                                    <select
                                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', fontWeight: 700, background: 'white' }}
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                    >
                                        <option value="LOW">Low - General Inquiry</option>
                                        <option value="MEDIUM">Medium - Performance/Glitch</option>
                                        <option value="HIGH">High - Critical System Issue</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>Detailed Explanation</label>
                                <textarea 
                                    rows="4"
                                    placeholder="Please describe exactly what you were doing, what went wrong, and how our support specialists can assist you."
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.9rem', fontWeight: 600, resize: 'none' }}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={saving}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem', borderRadius: '12px', background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,130,246,0.25)', fontSize: '0.9rem' }}
                            >
                                {saving ? 'Dispatching...' : <><Send size={16} /> Lodge Support Ticket</>}
                            </button>
                        </form>
                    </div>

                    {/* Active Tickets List */}
                    <div style={{ background: 'white', padding: '2.25rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '8px', background: '#F8FAFC', color: '#64748B', borderRadius: '10px' }}>
                                    <Activity size={20} />
                                </div>
                                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>My Support Log</h2>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', background: '#F1F5F9', padding: '4px 10px', borderRadius: '20px' }}>{tickets.length} logged</span>
                        </div>

                        {loading ? (
                            <div style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600, padding: '2rem 0', textAlign: 'center' }}>
                                Loading support ticket history...
                            </div>
                        ) : tickets.length === 0 ? (
                            <div style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600, padding: '2rem 0', textAlign: 'center' }}>
                                No filed tickets detected in your system history.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxH: '400px', overflowY: 'auto' }}>
                                {tickets.map((t) => {
                                    const badge = getStatusPill(t.status);
                                    return (
                                        <div key={t.id} style={{ border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 850, color: '#0F172A', margin: 0 }}>{t.subject}</h3>
                                                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>Logged on {new Date(t.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, background: badge.bg, color: badge.color }}>
                                                    {badge.icon} {badge.label}
                                                </span>
                                            </div>

                                            <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>{t.description}</p>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.72rem', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                                                    Priority: <span style={{ color: t.priority === 'HIGH' ? '#EF4444' : '#1E293B', fontWeight: 850 }}>{t.priority}</span>
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                                                    <User size={10} /> Specialist: {t.agent_name || <span style={{ color: '#EA580C' }}>Awaiting claim</span>}
                                                </span>
                                            </div>

                                            {t.resolution_notes && (
                                                <div style={{ background: '#F8FAFC', borderLeft: '3px solid #10B981', padding: '0.75rem 1rem', borderRadius: '0 8px 8px 0', fontSize: '0.8rem', color: '#1E293B', fontWeight: 650 }}>
                                                    <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>Resolution Response</div>
                                                    {t.resolution_notes}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>

                {/* Right Column: Frequently Asked Questions & Contact Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Frequently Asked Questions */}
                    <div style={{ background: 'white', padding: '2.25rem', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                            <div style={{ padding: '8px', background: '#EFF6FF', color: '#3B82F6', borderRadius: '10px' }}>
                                <HelpCircle size={20} />
                            </div>
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Frequently Asked Questions</h2>
                        </div>

                        <AccordionRoot>
                            {faqs.map((faq, index) => (
                                <AccordionItem key={index}>
                                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                                    <AccordionContent>
                                        <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>{faq.answer}</p>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </AccordionRoot>
                    </div>

                    {/* Cliks Direct Support Card */}
                    <div style={{ 
                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)', 
                        padding: '2.25rem', 
                        borderRadius: '24px', 
                        color: 'white', 
                        boxShadow: '0 10px 30px rgba(27, 107, 58, 0.1)', 
                        position: 'relative', 
                        overflow: 'hidden' 
                    }}>
                        <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', pointerEvents: 'none' }} />
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <div style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', color: '#A7F3D0', borderRadius: '10px' }}>
                                <Mail size={20} />
                            </div>
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F0FDF4', margin: 0 }}>Direct Support Coordinates</h2>
                        </div>
                        
                        <p style={{ color: '#A7F3D0', fontSize: '0.88rem', lineHeight: '1.6', margin: '0 0 1.5rem 0', fontWeight: 500 }}>
                            Need instant answers or have specialized billing queries? Get in touch directly via our channels below:
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <a 
                                href="mailto:support@beta-softnet.com" 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.75rem', 
                                    textDecoration: 'none', 
                                    color: 'white',
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    transition: 'all 0.25s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.borderColor = '#A7F3D0';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                }}
                            >
                                <Mail size={18} style={{ color: '#A7F3D0' }} />
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: '#A7F3D0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Support</div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 750 }}>support@beta-softnet.com</div>
                                </div>
                            </a>

                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.75rem', 
                                background: 'rgba(255,255,255,0.05)',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <Globe size={18} style={{ color: '#A7F3D0' }} />
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: '#A7F3D0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official Portal</div>
                                    <a href="https://cliksbusiness.com" target="_blank" rel="noreferrer" style={{ fontSize: '0.95rem', fontWeight: 750, color: 'white', textDecoration: 'none' }}>cliksbusiness.com</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default FAQ;
