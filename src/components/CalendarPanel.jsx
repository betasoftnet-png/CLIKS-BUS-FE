import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, StickyNote, Bell } from 'lucide-react';

const fetchCalendarData = async ({ queryKey }) => {
    const [_key, startDate, endDate] = queryKey;
    const token = localStorage.getItem('bnx_auth_token');
    const baseUrl = import.meta.env.VITE_CALENDAR_API_BASE_URL;
    
    const response = await fetch(`${baseUrl}/search?startDate=${startDate}&endDate=${endDate}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch calendar data');
    }
    
    const result = await response.json();
    return result?.data || { events: [], notes: [], reminders: [] };
};

const CalendarPanel = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    // Format dates for API query (e.g. 2026-08-01 to 2026-08-31)
    const startDateStr = new Date(year, month, 1).toISOString().split('T')[0];
    const endDateStr = new Date(year, month, daysInMonth).toISOString().split('T')[0];

    const { data: calendarData, isLoading } = useQuery({
        queryKey: ['calendar-data', startDateStr, endDateStr],
        queryFn: fetchCalendarData
    });

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleDayClick = (day) => {
        setSelectedDate(new Date(year, month, day));
    };

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() && 
               month === today.getMonth() && 
               year === today.getFullYear();
    };
    
    const isSelected = (day) => {
        return day === selectedDate.getDate() && 
               month === selectedDate.getMonth() && 
               year === selectedDate.getFullYear();
    };
    const selectedDateStr = new Date(year, month, selectedDate.getDate()).toISOString().split('T')[0];

    const { data: selectedDateData, isLoading: isSelectedDateLoading } = useQuery({
        queryKey: ['calendar-date-data', selectedDateStr],
        queryFn: async () => {
            const token = localStorage.getItem('bnx_auth_token');
            const baseUrl = import.meta.env.VITE_CALENDAR_API_BASE_URL;
            const response = await fetch(`${baseUrl}/search?date=${selectedDateStr}&allApps=true`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch selected date data');
            const result = await response.json();
            return result?.data || { events: [], notes: [], reminders: [] };
        }
    });

    const getItemsForDate = (dateObj) => {
        if (!calendarData) return { events: [], notes: [], reminders: [] };
        
        const dateStr = dateObj.toISOString().split('T')[0];
        
        return {
            events: (calendarData.events || []).filter(e => e.startTime?.startsWith(dateStr) || e.endTime?.startsWith(dateStr)),
            notes: (calendarData.notes || []).filter(n => n.date?.startsWith(dateStr)),
            reminders: (calendarData.reminders || []).filter(r => r.date?.startsWith(dateStr))
        };
    };

    // To show indicators on days that have items
    const hasItemsOnDay = (day) => {
        const dayDate = new Date(year, month, day);
        const items = getItemsForDate(dayDate);
        return items.events.length > 0 || items.notes.length > 0 || items.reminders.length > 0;
    };

    const renderDays = () => {
        const days = [];
        const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

        // Render days of week headers
        daysOfWeek.forEach(day => {
            days.push(
                <div key={day} style={{ textAlign: 'center', fontWeight: 'bold', color: '#64748B', fontSize: '0.75rem', padding: '0.5rem 0' }}>
                    {day}
                </div>
            );
        });

        // Blank spaces for days before 1st
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`blank-${i}`} style={{ padding: '0.5rem' }}></div>);
        }

        // Days of month
        for (let i = 1; i <= daysInMonth; i++) {
            const today = isToday(i);
            const selected = isSelected(i);
            const hasData = hasItemsOnDay(i);

            let bg = 'transparent';
            let color = '#1E293B';
            
            if (selected) {
                bg = '#1D4ED8';
                color = 'white';
            } else if (today) {
                bg = '#EFF6FF';
                color = '#1D4ED8';
            }

            days.push(
                <div key={i} onClick={() => handleDayClick(i)} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '40px', width: '40px', margin: 'auto', cursor: 'pointer' }}>
                    <div 
                        style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            height: '28px', 
                            width: '28px',
                            fontSize: '0.85rem',
                            fontWeight: today || selected ? 'bold' : 'normal',
                            color,
                            backgroundColor: bg,
                            borderRadius: '50%',
                            transition: 'all 0.2s',
                        }}
                    >
                        {i}
                    </div>
                    <div style={{ height: '4px', width: '4px', borderRadius: '50%', backgroundColor: hasData && !selected ? '#3B82F6' : 'transparent', marginTop: '2px' }} />
                </div>
            );
        }

        return days;
    };

    const selectedItems = selectedDateData || { events: [], notes: [], reminders: [] };
    const hasAnyItems = selectedItems.events.length > 0 || selectedItems.notes.length > 0 || selectedItems.reminders.length > 0;

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC', padding: '1.25rem', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            
            {/* Header / Month Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', flexShrink: 0 }}>
                <button onClick={prevMonth} style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#475569', display: 'flex' }}>
                    <ChevronLeft size={18} />
                </button>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#1E293B' }}>
                    {monthNames[month]} {year}
                </div>
                <button onClick={nextMonth} style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#475569', display: 'flex' }}>
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Calendar Grid */}
            <div style={{ background: 'white', padding: '1rem 0.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', flexShrink: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                    {renderDays()}
                </div>
            </div>

            {/* Selected Day Schedule */}
            <div style={{ marginTop: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Schedule for {selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </h4>
                
                {isSelectedDateLoading ? (
                    <div style={{ textAlign: 'center', padding: '1rem', color: '#94A3B8', fontSize: '0.85rem' }}>Loading schedule...</div>
                ) : !hasAnyItems ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94A3B8', fontSize: '0.85rem', background: 'white', borderRadius: '12px', border: '1px dashed #E2E8F0' }}>
                        No events, notes, or reminders for this day.
                    </div>
                ) : (
                    <>
                        {selectedItems.events.map((event, idx) => (
                            <div key={`event-${event.id || idx}`} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ background: '#EFF6FF', color: '#3B82F6', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <CalendarIcon size={18} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.9rem' }}>{event.title}</div>
                                    <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '4px' }}>
                                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                    </div>
                                    {event.description && <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '6px' }}>{event.description}</div>}
                                </div>
                            </div>
                        ))}
                        
                        {selectedItems.reminders.map((reminder, idx) => (
                            <div key={`rem-${reminder.id || idx}`} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Bell size={18} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.9rem' }}>{reminder.title}</div>
                                    <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '4px' }}>
                                        {formatTime(reminder.date)}
                                    </div>
                                    {reminder.description && <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '6px' }}>{reminder.description}</div>}
                                </div>
                            </div>
                        ))}

                        {selectedItems.notes.map((note, idx) => (
                            <div key={`note-${note.id || idx}`} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ background: '#FEF9C3', color: '#CA8A04', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <StickyNote size={18} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.9rem' }}>{note.title}</div>
                                    {note.content && <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '6px', whiteSpace: 'pre-wrap' }}>{note.content}</div>}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default CalendarPanel;
