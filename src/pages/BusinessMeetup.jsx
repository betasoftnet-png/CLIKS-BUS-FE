import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, 
    Plus, 
    Briefcase, 
    Target, 
    Globe, 
    TrendingUp, 
    Bitcoin, 
    PiggyBank, 
    MapPin, 
    Users, 
    Clock, 
    X,
    Tag,
    Search
} from 'lucide-react';
import { meetupsService } from '../services/meetupsService';
import '../App.css';

const BusinessMeetup = () => {
    const [filter, setFilter] = useState('All Events');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ 
        title: '', 
        type: 'Offline', 
        date: '', 
        time: '', 
        location: '', 
        price: 'Free',
        description: '',
        category: 'Networking',
        image_url: ''
    });
    const queryClient = useQueryClient();

    // ── Queries ─────────────────────────────────────────────────────────────
    const { data: eventsRes = [], isLoading } = useQuery({
        queryKey: ['meetups-list'],
        queryFn: meetupsService.getMeetups,
        refetchOnWindowFocus: false
    });

    const events = eventsRes.data || eventsRes || [];

    // ── Mutations ───────────────────────────────────────────────────────────
    const createMutation = useMutation({
        mutationFn: meetupsService.createMeetup,
        onSuccess: () => {
            queryClient.invalidateQueries(['meetups-list']);
            setIsCreateModalOpen(false);
            setNewEvent({ 
                title: '', 
                type: 'Offline', 
                date: '', 
                time: '', 
                location: '', 
                price: 'Free',
                description: '',
                category: 'Networking',
                image_url: ''
            });
            alert('New meetup scheduled successfully!');
        },
        onError: (err) => {
            alert('Failed to schedule event: ' + (err?.response?.data?.message || err.message));
        }
    });

    const joinMutation = useMutation({
        mutationFn: meetupsService.joinMeetup,
        onSuccess: () => {
            queryClient.invalidateQueries(['meetups-list']);
            alert('Successfully joined the event! See you there.');
        },
        onError: (err) => {
            alert(err?.response?.data?.message || 'Error joining meetup.');
        }
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate(newEvent);
    };

    const renderIcon = (iconName) => {
        switch (iconName) {
            case 'Briefcase': return <Briefcase size={32} />;
            case 'Target': return <Target size={32} />;
            case 'Globe': return <Globe size={32} />;
            case 'TrendingUp': return <TrendingUp size={32} />;
            case 'Bitcoin': return <Bitcoin size={32} />;
            case 'PiggyBank': return <PiggyBank size={32} />;
            case 'MapPin': return <MapPin size={32} />;
            default: return <Users size={32} />;
        }
    };

    const filteredEvents = events.filter(ev => {
        const matchesSearch = ev.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              ev.description.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        if (filter === 'All Events') return true;
        if (filter === 'Upcoming') return new Date(ev.date) >= new Date();
        if (filter === 'Workshops') return ev.category === 'Workshop' || ev.category === 'Masterclass';
        if (filter === 'Webinars') return ev.type === 'Online';
        if (filter === 'My Events') return ev.is_joined || false; // Handles joined flag if API supports
        return true;
    });

    return (
        <div style={{ padding: '2.5rem', background: '#F0F9F4', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Top Hero Area */}
            <div style={{
                background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)',
                borderRadius: '32px',
                padding: '3.5rem',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 20px 30px -10px rgba(6, 78, 59, 0.25)',
                marginBottom: '3rem'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(255, 255, 255, 0.12)',
                        borderRadius: '999px',
                        backdropFilter: 'blur(12px)',
                        marginBottom: '1.25rem',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <Briefcase size={14} />
                        <span>Business Networking HUB</span>
                    </div>
                    <h1 style={{ fontSize: '2.75rem', fontWeight: '900', marginBottom: '1rem', lineHeight: 1.15, letterSpacing: '-0.03em' }}>
                        Founders Meetup <br />& Executive Events
                    </h1>
                    <p style={{
                        fontSize: '1.15rem',
                        color: '#D1FAE5',
                        maxWidth: '520px',
                        lineHeight: 1.6,
                        margin: 0,
                        opacity: 0.9
                    }}>
                        Build synergy with regional builders, organize custom corporate panels, and fast-track strategic ventures through structured network channels.
                    </p>
                </div>

                {/* Glow Abstract */}
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(52, 211, 153, 0.2) 0%, rgba(6, 78, 59, 0) 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }} />

                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    style={{
                        position: 'relative',
                        zIndex: 2,
                        padding: '1.1rem 2.25rem',
                        background: 'white',
                        color: '#064E3B',
                        border: 'none',
                        borderRadius: '16px',
                        fontWeight: '800',
                        fontSize: '1.05rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Plus size={20} />
                    Schedule Board
                </button>
            </div>

            {/* Toolbar Filters & Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {['All Events', 'Upcoming', 'Workshops', 'Webinars', 'My Events'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '999px',
                                background: filter === tab ? '#064E3B' : 'white',
                                color: filter === tab ? 'white' : '#64748B',
                                fontWeight: '750',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                boxShadow: filter === tab ? '0 8px 16px rgba(6, 78, 59, 0.12)' : '0 2px 4px rgba(0,0,0,0.02)',
                                border: '1px solid',
                                borderColor: filter === tab ? '#064E3B' : '#E2E8F0',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div style={{ position: 'relative', width: '320px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input 
                        type="text" 
                        placeholder="Search specific events..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.8rem 1rem 0.8rem 3.2rem',
                            borderRadius: '16px',
                            border: '1px solid #E2E8F0',
                            outline: 'none',
                            background: 'white',
                            fontSize: '0.95rem'
                        }}
                    />
                </div>
            </div>

            {/* Dynamic Events Grid Display */}
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '6rem 0', color: '#64748B' }}>
                    <div className="premium-loader" style={{ width: '40px', height: '40px', margin: '0 auto 1.5rem auto', border: '4px solid #DCF2E4', borderTopColor: '#1B6B3A', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>Locating dynamic founder nodes...</p>
                </div>
            ) : filteredEvents.length === 0 ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6rem 2rem',
                    background: 'white',
                    borderRadius: '32px',
                    border: '2px dashed #CBD5E1',
                    textAlign: 'center',
                    gap: '1.25rem'
                }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '24px',
                        background: '#ECFDF5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#059669'
                    }}>
                        <Calendar size={36} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: '850', color: '#1E293B', marginBottom: '0.5rem' }}>Zero Active Events Found</h3>
                        <p style={{ color: '#64748B', maxWidth: '420px', margin: '0 auto', fontSize: '0.95rem', fontWeight: '500', lineHeight: 1.5 }}>No events match the current criteria. Why not host the first business board session yourself?</p>
                    </div>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ background: '#064E3B', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '750', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
                    >
                        <Plus size={16} /> Host Panel Session
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                    {filteredEvents.map((event, idx) => (
                        <div
                            key={idx}
                            style={{
                                background: 'white',
                                borderRadius: '24px',
                                border: '1px solid #E2E8F0',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.25s',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)'
                            }}
                            className="event-hover-card"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.06)';
                                e.currentTarget.style.borderColor = '#A7F3D0';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.01)';
                                e.currentTarget.style.borderColor = '#E2E8F0';
                            }}
                        >
                            {/* Header Graphic Cover */}
                            <div style={{
                                height: '180px',
                                background: event.image_url ? `url(${event.image_url})` : 'linear-gradient(135deg, #1B6B3A 0%, #22C55E 100%)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {!event.image_url && (
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        background: 'rgba(255,255,255,0.22)',
                                        backdropFilter: 'blur(12px)',
                                        borderRadius: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                        border: '1.5px solid rgba(255,255,255,0.2)'
                                    }}>
                                        {renderIcon(event.icon)}
                                    </div>
                                )}

                                <div style={{
                                    position: 'absolute',
                                    top: '1.25rem',
                                    left: '1.25rem',
                                    padding: '0.35rem 0.85rem',
                                    background: 'rgba(6, 78, 59, 0.88)',
                                    color: 'white',
                                    borderRadius: '999px',
                                    fontSize: '0.72rem',
                                    fontWeight: '800',
                                    backdropFilter: 'blur(4px)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.02em'
                                }}>
                                    {event.category || 'General Panel'}
                                </div>

                                <span style={{
                                    position: 'absolute',
                                    top: '1.25rem',
                                    right: '1.25rem',
                                    padding: '0.35rem 0.85rem',
                                    background: 'white',
                                    color: '#064E3B',
                                    borderRadius: '999px',
                                    fontSize: '0.8rem',
                                    fontWeight: '900',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                }}>
                                    {event.price}
                                </span>
                            </div>

                            {/* Context details */}
                            <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '850',
                                        color: event.type === 'Online' ? '#9333EA' : '#059669',
                                        background: event.type === 'Online' ? '#F3E8FF' : '#ECFDF5',
                                        padding: '0.3rem 0.75rem',
                                        borderRadius: '8px',
                                        textTransform: 'uppercase',
                                        border: '1px solid',
                                        borderColor: event.type === 'Online' ? '#E9D5FF' : '#A7F3D0'
                                    }}>
                                        {event.type}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={12} /> {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: '1.3rem', fontWeight: '850', color: '#0F172A', marginBottom: '0.6rem', lineHeight: 1.3 }}>
                                    {event.title}
                                </h3>

                                {event.description && (
                                    <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '1.5rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontWeight: '500' }}>
                                        {event.description}
                                    </p>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#475569', fontSize: '0.85rem', marginBottom: '1.75rem', background: '#F8FAFC', padding: '1rem', borderRadius: '14px', border: '1px solid #F1F5F9' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '650' }}>
                                        <MapPin size={14} style={{ color: '#94A3B8' }} />
                                        <span>{event.location}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '650' }}>
                                        <Clock size={14} style={{ color: '#94A3B8' }} />
                                        <span>{event.time}</span>
                                    </div>
                                </div>

                                {/* Footer Action bar */}
                                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                                    {/* Stacked Attendees */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', paddingLeft: '8px' }}>
                                            {Array.from({ length: Math.min(event.attendees || 1, 3) }).map((_, i) => (
                                                <div key={i} style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    background: '#E2E8F0',
                                                    border: '2px solid white',
                                                    marginLeft: '-8px',
                                                    backgroundImage: `url(https://api.dicebear.com/7.x/adventurer/svg?seed=Person${i + (event.id || 0)})`,
                                                    backgroundSize: 'cover'
                                                }} />
                                            ))}
                                            {(event.attendees || 1) > 3 && (
                                                <div style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    background: '#064E3B',
                                                    border: '2px solid white',
                                                    marginLeft: '-8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.65rem',
                                                    color: 'white',
                                                    fontWeight: '800'
                                                }}>
                                                    +{(event.attendees || 1) - 3}
                                                </div>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase' }}>Builders Joined</span>
                                    </div>

                                    <button 
                                        onClick={() => joinMutation.mutate(event.id)}
                                        disabled={joinMutation.isPending}
                                        style={{
                                            padding: '0.65rem 1.5rem',
                                            border: 'none',
                                            borderRadius: '12px',
                                            color: 'white',
                                            background: '#1B6B3A',
                                            fontWeight: '800',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            boxShadow: '0 6px 12px rgba(27, 107, 58, 0.15)'
                                        }}
                                    >
                                        Reserve Entry
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Meetup Event Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(6, 78, 59, 0.4)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem'
                    }}>
                        <Motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{
                                background: 'white',
                                borderRadius: '28px',
                                width: '100%',
                                maxWidth: '520px',
                                padding: '2.5rem',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                position: 'relative',
                                overflowY: 'auto',
                                maxHeight: '90vh'
                            }}
                        >
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                style={{
                                    position: 'absolute',
                                    top: '1.5rem',
                                    right: '1.5rem',
                                    background: '#F1F5F9',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#64748B'
                                }}
                            >
                                <X size={18} />
                            </button>

                            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#064E3B', marginBottom: '1.75rem', letterSpacing: '-0.02em' }}>
                                Host New Executive Meetup
                            </h2>

                            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Board Session Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                        placeholder="e.g. Q3 FinTech Founders Huddle"
                                        style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.95rem' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Agenda / Scope Narrative</label>
                                    <textarea
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                        placeholder="Outline critical touchpoints, intended synergy objectives, etc..."
                                        rows={3}
                                        style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: '0.95rem' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Platform Format</label>
                                        <select
                                            value={newEvent.type}
                                            onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.95rem' }}
                                        >
                                            <option value="Offline">Offline Venue</option>
                                            <option value="Online">Virtual Broadcast</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Access Seat Price</label>
                                        <input
                                            type="text"
                                            value={newEvent.price}
                                            onChange={(e) => setNewEvent({...newEvent, price: e.target.value})}
                                            placeholder="e.g. Free or ₹1,500"
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Classification Tag</label>
                                        <select
                                            value={newEvent.category}
                                            onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.95rem' }}
                                        >
                                            <option value="Networking">Networking</option>
                                            <option value="Workshop">Skill Panel</option>
                                            <option value="Webinar">Webcast/AMA</option>
                                            <option value="Social">Mixer/Social</option>
                                            <option value="Masterclass">Board Masterclass</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Cover Image URL</label>
                                        <input
                                            type="text"
                                            value={newEvent.image_url}
                                            onChange={(e) => setNewEvent({...newEvent, image_url: e.target.value})}
                                            placeholder="https://unsplash..."
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Panel Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={newEvent.date}
                                            onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Execution Time</label>
                                        <input
                                            type="time"
                                            required
                                            value={newEvent.time}
                                            onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Venue Address / Virtual Link</label>
                                    <input
                                        type="text"
                                        required
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                        placeholder="e.g. ITC Chola OR Zoom link"
                                        style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.95rem' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    style={{
                                        marginTop: '1rem',
                                        width: '100%',
                                        padding: '1.1rem',
                                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '16px',
                                        fontWeight: '850',
                                        fontSize: '1.1rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 10px 20px rgba(27, 107, 58, 0.2)'
                                    }}
                                >
                                    {createMutation.isPending ? 'Distributing Session...' : 'Authorize Panel Broadcast'}
                                </button>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BusinessMeetup;
