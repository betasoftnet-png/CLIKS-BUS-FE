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
    Search,
    Ticket,
    Crown,
    Eye,
    Building,
    Mail,
    QrCode
} from 'lucide-react';
import { meetupsService, profileService } from '../services';
import { QRCodeCanvas } from 'qrcode.react';
import '../App.css';

const BusinessMeetup = () => {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('All Events');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modals & Navigation
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [selectedTicketMeetup, setSelectedTicketMeetup] = useState(null);
    
    const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
    const [rosterMeetupId, setRosterMeetupId] = useState(null);

    const [newEvent, setNewEvent] = useState({ 
        title: '', 
        type: 'Offline', 
        date: '', 
        time: '', 
        location: '', 
        price: 'Free',
        description: '',
        category: 'Networking',
        image_url: '',
        max_seats: 100
    });

    // ── Queries ─────────────────────────────────────────────────────────────
    
    // 1. Fetch user profile to determine hosting rights
    const { data: profileRes } = useQuery({
        queryKey: ['user-profile'],
        queryFn: profileService.getProfile,
        refetchOnWindowFocus: false
    });
    const currentUser = profileRes?.data || profileRes || {};

    // 2. Fetch overall events directory
    const { data: eventsRes = [], isLoading } = useQuery({
        queryKey: ['meetups-list'],
        queryFn: meetupsService.getMeetups,
        refetchOnWindowFocus: false
    });
    const events = eventsRes.data || eventsRes || [];

    // 3. Fetch attendee roster for a specific hosted meetup
    const { data: rosterRes, isLoading: isRosterLoading } = useQuery({
        queryKey: ['meetup-attendees', rosterMeetupId],
        queryFn: () => meetupsService.getAttendees(rosterMeetupId),
        enabled: !!rosterMeetupId && isRosterModalOpen,
        refetchOnWindowFocus: false
    });
    const attendeesList = rosterRes?.data || rosterRes || [];
    const activeRosterEvent = events.find(e => e.id === rosterMeetupId) || {};

    // ── Mutations ───────────────────────────────────────────────────────────
    
    const createMutation = useMutation({
        mutationFn: meetupsService.createMeetup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meetups-list'] });
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
                image_url: '',
                max_seats: 100
            });
            alert('✨ Executive meetup broadcast published successfully!');
        },
        onError: (err) => {
            alert('Failed to schedule event: ' + (err?.response?.data?.message || err.message));
        }
    });

    const joinMutation = useMutation({
        mutationFn: meetupsService.joinMeetup,
        onSuccess: (data, eventId) => {
            queryClient.invalidateQueries({ queryKey: ['meetups-list'] });
            // Instantly locate the freshly joined meetup and present ticket pass overlay
            const targetMeetup = events.find(e => e.id === eventId);
            if (targetMeetup) {
                setSelectedTicketMeetup({ ...targetMeetup, attendees: (targetMeetup.attendees || 0) + 1 });
                setIsTicketModalOpen(true);
            } else {
                alert('🎉 Ticket reserved successfully! Refresh to view your Board Pass.');
            }
        },
        onError: (err) => {
            alert(err?.response?.data?.message || 'Error joining meetup.');
        }
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate(newEvent);
    };

    // ── Custom Filtering & Search ───────────────────────────────────────────
    const filteredEvents = events.filter(event => {
        // Status filter mapping
        const now = new Date();
        const evtDate = new Date(event.date);

        if (filter === 'Upcoming') {
            if (evtDate < now && event.date) return false;
        } else if (filter === 'Workshops') {
            if (event.category !== 'Workshop') return false;
        } else if (filter === 'Webinars') {
            if (event.category !== 'Webinar') return false;
        } else if (filter === 'My Events') {
            // Filter logic: events where current user is host OR has joined
            if (event.user_id !== currentUser.id && event.has_joined !== 1) return false;
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            const titleMatch = event.title?.toLowerCase().includes(term);
            const descMatch = event.description?.toLowerCase().includes(term);
            const locMatch = event.location?.toLowerCase().includes(term);
            return titleMatch || descMatch || locMatch;
        }

        return true;
    });

    // Formatter Helper
    const formatDate = (dateStr) => {
        if (!dateStr) return 'TBA';
        try {
            const options = { day: 'numeric', month: 'short' };
            return new Date(dateStr).toLocaleDateString('en-IN', options);
        } catch {
            return dateStr;
        }
    };

    return (
        <div style={{ padding: '1.25rem 2.5rem', background: '#F0F9F4', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            
            {/* Scrollable Main Content Wrapper */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '2rem' }}>

            {/* Header Presentation Board */}
            <div style={{
                background: 'linear-gradient(135deg, #064E3B 0%, #14532D 100%)',
                borderRadius: '30px',
                padding: '3.5rem 3rem',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 40px -10px rgba(6, 78, 59, 0.3)',
                marginBottom: '2.5rem'
            }}>
                {/* Animated Background Accents */}
                <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(22, 163, 74, 0.15)', filter: 'blur(80px)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-20%', left: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', filter: 'blur(60px)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ maxWidth: '650px' }}>
                        <span style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            padding: '0.6rem 1.1rem',
                            borderRadius: '100px',
                            fontSize: '0.72rem',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            marginBottom: '1.5rem'
                        }}>
                            <Globe size={13} /> Business Networking Hub
                        </span>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '950', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1rem' }}>
                            Founders Meetup <br />& Executive Events
                        </h1>
                    </div>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{
                            background: 'white',
                            color: '#064E3B',
                            border: 'none',
                            padding: '1.1rem 2rem',
                            borderRadius: '16px',
                            fontWeight: '900',
                            fontSize: '1.05rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            boxShadow: '0 15px 30px -5px rgba(0,0,0,0.15)',
                            transition: 'transform 0.2s ease'
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <Plus size={20} strokeWidth={3} /> Schedule Board
                    </button>
                </div>
            </div>

            {/* Search and Control Panel */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.6rem', background: 'white', padding: '0.4rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    {['All Events', 'Upcoming', 'Workshops', 'Webinars', 'My Events'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            style={{
                                padding: '0.7rem 1.3rem',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                border: 'none',
                                background: filter === tab ? '#064E3B' : 'transparent',
                                color: filter === tab ? 'white' : '#64748B',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search events..."
                        style={{
                            width: '100%',
                            padding: '0.85rem 1rem 0.85rem 2.75rem',
                            borderRadius: '16px',
                            border: '1px solid #E2E8F0',
                            outline: 'none',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: '#1E293B',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                        }}
                    />
                </div>
            </div>

            {/* Events List Workspace */}
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '6rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #DCF2E4', borderTopColor: '#059669', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                    <p style={{ color: '#64748B', fontWeight: '700' }}>Aggregating regional meetups...</p>
                </div>
            ) : filteredEvents.length === 0 ? (
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '6rem 2rem', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '24px', background: '#F0FDF4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <Calendar size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '850', color: '#1E293B', marginBottom: '0.5rem' }}>No active panels found</h3>
                    <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto', fontSize: '0.95rem', fontWeight: '500', lineHeight: 1.5 }}>
                        {searchTerm ? "We couldn't locate any sessions matching your search criteria." : "There are no meetups currently configured. Be the catalyst and host a session today!"}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
                    {filteredEvents.map((event) => {
                        const isHost = event.user_id === currentUser.id;
                        const hasJoined = event.has_joined === 1;
                        const maxSeats = event.max_seats || 100;
                        const currentAttendees = event.attendees || 0;
                        const isSoldOut = currentAttendees >= maxSeats;
                        
                        return (
                            <div key={event.id} style={{
                                background: 'white',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                border: '1px solid #E2E8F0',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                            }}>
                                {/* Card Art Cover */}
                                <div style={{
                                    height: '160px',
                                    background: event.gradient || 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    {event.image_url && (
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            backgroundImage: `url(${event.image_url})`,
                                            backgroundSize: 'cover', backgroundPosition: 'center',
                                            opacity: 0.3, filter: 'grayscale(30%)'
                                        }} />
                                    )}
                                    
                                    {/* Category Label */}
                                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.3)', padding: '0.4rem 0.75rem', borderRadius: '8px', backdropFilter: 'blur(6px)', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {event.category || 'Networking'}
                                    </div>

                                    {/* Price Tag */}
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'white', color: '#064E3B', padding: '0.4rem 0.75rem', borderRadius: '8px', fontWeight: '900', fontSize: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                                        {event.price || 'Free'}
                                    </div>

                                    <div style={{ position: 'relative', zIndex: 2, width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)' }}>
                                        <Users size={24} />
                                    </div>
                                </div>

                                {/* Card Detail Panel */}
                                <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            padding: '0.35rem 0.6rem', borderRadius: '6px',
                                            background: '#DCF2E4', color: '#059669', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase'
                                        }}>
                                            {event.type || 'Offline'}
                                        </span>
                                        
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#64748B', fontSize: '0.78rem', fontWeight: '700' }}>
                                            <Calendar size={13} /> {formatDate(event.date)}
                                        </span>
                                    </div>

                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '850', color: '#0F172A', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
                                        {event.title}
                                    </h3>

                                    {event.description && (
                                        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontWeight: '500', lineHeight: 1.5 }}>
                                            {event.description}
                                        </p>
                                    )}

                                    <div style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #F1F5F9', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontWeight: '650' }}>
                                            <MapPin size={13} style={{ color: '#94A3B8' }} />
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.location}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontWeight: '650' }}>
                                            <Clock size={13} style={{ color: '#94A3B8' }} />
                                            <span>{event.time}</span>
                                        </div>
                                        {/* Capacity visualizer */}
                                        <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '0.5rem', fontSize: '0.72rem' }}>
                                            <span style={{ fontWeight: '800', color: '#64748B' }}>Seating Allocation:</span>
                                            <span style={{ fontWeight: '900', color: isSoldOut ? '#DC2626' : '#059669' }}>
                                                {currentAttendees} / {maxSeats} Booked {isSoldOut && '(FULL)'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer Workspace Controls */}
                                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                                        {/* Attendees stacking */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <div style={{ display: 'flex', paddingLeft: '6px' }}>
                                                {Array.from({ length: Math.min(currentAttendees || 1, 3) }).map((_, i) => (
                                                    <div key={i} style={{
                                                        width: '24px', height: '24px', borderRadius: '50%',
                                                        background: '#E2E8F0', border: '2px solid white',
                                                        marginLeft: '-6px', backgroundImage: `url(https://api.dicebear.com/7.x/adventurer/svg?seed=Person${i + event.id})`,
                                                        backgroundSize: 'cover'
                                                    }} />
                                                ))}
                                                {currentAttendees > 3 && (
                                                    <div style={{
                                                        width: '24px', height: '24px', borderRadius: '50%',
                                                        background: '#064E3B', border: '2px solid white', marginLeft: '-6px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.6rem', color: 'white', fontWeight: '800'
                                                    }}>
                                                        +{currentAttendees - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase' }}>Joined</span>
                                        </div>

                                        {/* Dynamic Controls Action Gates */}
                                        {isHost ? (
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <span style={{ background: '#FEF3C7', color: '#D97706', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.4rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>
                                                    <Crown size={12} /> Host
                                                </span>
                                                <button 
                                                    onClick={() => { setRosterMeetupId(event.id); setIsRosterModalOpen(true); }}
                                                    style={{ border: '1px solid #E2E8F0', padding: '0.5rem 0.85rem', borderRadius: '8px', background: 'white', color: '#1F2937', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'background 0.2s' }}
                                                    onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'}
                                                    onMouseOut={e => e.currentTarget.style.background = 'white'}
                                                >
                                                    <Eye size={13} /> Roster
                                                </button>
                                            </div>
                                        ) : hasJoined ? (
                                            <button 
                                                onClick={() => { setSelectedTicketMeetup(event); setIsTicketModalOpen(true); }}
                                                style={{
                                                    padding: '0.55rem 1rem', borderRadius: '8px', border: 'none',
                                                    background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                                                    color: 'white', fontWeight: '850', cursor: 'pointer', fontSize: '0.78rem',
                                                    boxShadow: '0 4px 12px rgba(217,119,6,0.2)', display: 'flex', alignItems: 'center', gap: '4px'
                                                }}
                                            >
                                                <Ticket size={13} /> View Pass
                                            </button>
                                        ) : isSoldOut ? (
                                            <button 
                                                disabled
                                                style={{
                                                    padding: '0.55rem 1rem', borderRadius: '8px', border: '1px solid #F1F5F9',
                                                    background: '#F8FAFC', color: '#94A3B8', fontWeight: '800', fontSize: '0.78rem',
                                                    cursor: 'not-allowed'
                                                }}
                                            >
                                                🚫 Housefull
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => joinMutation.mutate(event.id)}
                                                disabled={joinMutation.isPending}
                                                style={{
                                                    padding: '0.55rem 1.1rem', border: 'none', borderRadius: '8px',
                                                    color: 'white', background: '#1B6B3A', fontWeight: '800',
                                                    cursor: 'pointer', fontSize: '0.82rem', boxShadow: '0 4px 12px rgba(27,107,58,0.15)'
                                                }}
                                            >
                                                Reserve Entry
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            </div>

            {/* ── MODAL: Host Roster Registry Overlay ───────────────────────── */}
            <AnimatePresence>
                {isRosterModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(6, 78, 59, 0.4)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <Motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            style={{ background: 'white', borderRadius: '28px', width: '100%', maxWidth: '500px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}
                        >
                            <button onClick={() => { setIsRosterModalOpen(false); setRosterMeetupId(null); }} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}><X size={16} /></button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#064E3B', marginBottom: '0.5rem' }}>
                                <Crown size={20} />
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0 }}>Attendee Registry</h3>
                            </div>
                            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>Host control list for: <span style={{ color: '#1E293B', fontWeight: '800' }}>{activeRosterEvent.title}</span></p>

                            {isRosterLoading ? (
                                <div style={{ textAlign: 'center', padding: '3rem' }}>
                                    <div style={{ width: '24px', height: '24px', border: '2px solid #DCF2E4', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 0.5rem' }} />
                                    <p style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: '700' }}>Fetching registration records...</p>
                                </div>
                            ) : attendeesList.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8', border: '2px dashed #F1F5F9', borderRadius: '16px' }}>
                                    <Users size={32} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
                                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700' }}>No registrations recorded yet.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
                                    {attendeesList.map((att, index) => (
                                        <div key={att.id || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', border: '1px solid #E2E8F0', borderRadius: '14px', background: '#F8FAFC' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#064E3B', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.85rem' }}>
                                                    {att.username?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <h5 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '850', color: '#1F2937' }}>{att.username}</h5>
                                                    <div style={{ display: 'flex', gap: '8px', marginTop: '0.15rem' }}>
                                                        {att.business_name && <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: '#64748B', fontWeight: '600' }}><Building size={10} /> {att.business_name}</span>}
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: '#64748B', fontWeight: '600' }}><Mail size={10} /> {att.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── MODAL: Cinematic Event Ticket Board Pass ──────────────────── */}
            <AnimatePresence>
                {isTicketModalOpen && selectedTicketMeetup && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(6, 78, 59, 0.4)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <Motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{ width: '100%', maxWidth: '360px', position: 'relative' }}
                        >
                            {/* Ticket Header Branding */}
                            <div style={{ background: '#064E3B', color: 'white', padding: '1.5rem', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', textAlign: 'center', position: 'relative', borderBottom: '1px dashed rgba(255,255,255,0.2)' }}>
                                <button onClick={() => { setIsTicketModalOpen(false); setSelectedTicketMeetup(null); }} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <Globe size={16} />
                                    <span style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.1em', textTransform: 'uppercase' }}>CLIKS NETWORKS</span>
                                </div>
                                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>EXECUTIVE BOARD PASS</h4>
                            </div>

                            {/* Main Ticket Frame */}
                            <div style={{ background: 'white', padding: '2rem 1.75rem', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                                
                                {/* Left and Right Cutouts */}
                                <div style={{ width: '24px', height: '24px', background: 'rgba(6, 78, 59, 0.4)', borderRadius: '50%', position: 'absolute', top: '-12px', left: '-12px' }} />
                                <div style={{ width: '24px', height: '24px', background: 'rgba(6, 78, 59, 0.4)', borderRadius: '50%', position: 'absolute', top: '-12px', right: '-12px' }} />

                                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Event Schedule</div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '950', color: '#0F172A' }}>{selectedTicketMeetup.title}</h3>
                                    <span style={{ background: '#DCF2E4', color: '#059669', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '850', textTransform: 'uppercase' }}>
                                        Confirmed Attendee
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '16px', border: '1px solid #F1F5F9', marginBottom: '1.5rem' }}>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.65rem', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase' }}>Date</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '850', color: '#1E293B' }}>{formatDate(selectedTicketMeetup.date)}</span>
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.65rem', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase' }}>Time</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '850', color: '#1E293B' }}>{selectedTicketMeetup.time}</span>
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <span style={{ display: 'block', fontSize: '0.65rem', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase' }}>Access Details</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '850', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.1rem' }}>
                                            <MapPin size={12} /> {selectedTicketMeetup.location}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ background: 'white', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                                        <QRCodeCanvas 
                                            value={`${window.location.origin}/verify-pass?m=${selectedTicketMeetup.id}&u=${currentUser.id}`} 
                                            size={110}
                                            bgColor={"#ffffff"}
                                            fgColor={"#064E3B"}
                                            level={"H"}
                                        />
                                    </div>
                                    <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: '750', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                                        TXN-PASS-{selectedTicketMeetup.id || 'MUP'}-{currentUser.id || 'USR'}
                                    </span>
                                </div>

                                <button 
                                    onClick={() => alert("Feature Coming Soon: Ticket successfully exported as offline image payload!")}
                                    style={{ width: '100%', marginTop: '1.5rem', padding: '0.9rem', border: 'none', borderRadius: '12px', background: '#064E3B', color: 'white', fontWeight: '850', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                                >
                                    Download Pass
                                </button>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── MODAL: Schedule Meetup Event Modal ─────────────────────────── */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(6, 78, 59, 0.4)', backdropFilter: 'blur(8px)',
                        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                    }}>
                        <Motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            style={{
                                background: 'white', borderRadius: '28px', width: '100%', maxWidth: '520px', padding: '2.5rem',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative', overflowY: 'auto', maxHeight: '90vh'
                            }}
                        >
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
                                <X size={18} />
                            </button>

                            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#064E3B', marginBottom: '1.75rem', letterSpacing: '-0.02em' }}>
                                Host New Executive Meetup
                            </h2>

                            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Board Session Title</label>
                                    <input
                                        type="text" required
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                        placeholder="e.g. Q3 FinTech Founders Huddle"
                                        style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.95rem', fontWeight: '600' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Agenda / Scope Narrative</label>
                                    <textarea
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                        placeholder="Outline critical touchpoints, intended synergy objectives, etc..."
                                        rows={3}
                                        style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: '600' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Platform Format</label>
                                        <select
                                            value={newEvent.type}
                                            onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.95rem', fontWeight: '600' }}
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
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.95rem', fontWeight: '600' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Classification Tag</label>
                                        <select
                                            value={newEvent.category}
                                            onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: 'white', fontSize: '0.95rem', fontWeight: '600' }}
                                        >
                                            <option value="Networking">Networking</option>
                                            <option value="Workshop">Skill Panel</option>
                                            <option value="Webinar">Webcast/AMA</option>
                                            <option value="Social">Mixer/Social</option>
                                            <option value="Masterclass">Board Masterclass</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Maximum Capacity (Seats)</label>
                                        <input
                                            type="number" required min={1}
                                            value={newEvent.max_seats}
                                            onChange={(e) => setNewEvent({...newEvent, max_seats: parseInt(e.target.value) || 100})}
                                            placeholder="e.g. 100"
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.95rem', fontWeight: '700', color: '#064E3B' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Panel Date</label>
                                        <input
                                            type="date" required
                                            value={newEvent.date}
                                            onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.95rem', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Execution Time</label>
                                        <input
                                            type="time" required
                                            value={newEvent.time}
                                            onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                                            style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.95rem', fontWeight: '600' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Venue Address / Virtual Link</label>
                                    <input
                                        type="text" required
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                        placeholder="e.g. ITC Chola OR Zoom link"
                                        style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.95rem', fontWeight: '600' }}
                                    />
                                </div>

                                <button
                                    type="submit" disabled={createMutation.isPending}
                                    style={{
                                        marginTop: '1rem', width: '100%', padding: '1.1rem',
                                        background: 'linear-gradient(135deg, #1B6B3A 0%, #064E3B 100%)',
                                        color: 'white', border: 'none', borderRadius: '16px',
                                        fontWeight: '850', fontSize: '1.1rem', cursor: 'pointer',
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
