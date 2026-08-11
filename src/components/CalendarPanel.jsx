import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

const CalendarPanel = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() && 
               currentDate.getMonth() === today.getMonth() && 
               currentDate.getFullYear() === today.getFullYear();
    };

    const renderDays = () => {
        const days = [];
        const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

        // Render days of week headers
        daysOfWeek.forEach(day => {
            days.push(
                <div key={day} style={{ textAlign: 'center', fontWeight: 'bold', color: '#64748B', fontSize: '0.8rem', padding: '0.5rem 0' }}>
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
            const todayStyles = isToday(i) ? {
                backgroundColor: '#1B6B3A',
                color: 'white',
                borderRadius: '50%',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px -1px rgba(27, 107, 58, 0.4)'
            } : {
                cursor: 'pointer',
                borderRadius: '50%',
                transition: 'background-color 0.2s',
            };

            days.push(
                <div key={i} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '36px', width: '36px', margin: 'auto' }}>
                    <div 
                        style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            height: '32px', 
                            width: '32px',
                            fontSize: '0.9rem',
                            color: isToday(i) ? 'white' : '#1E293B',
                            ...todayStyles 
                        }}
                        onMouseOver={(e) => {
                            if (!isToday(i)) e.currentTarget.style.backgroundColor = '#F1F5F9';
                        }}
                        onMouseOut={(e) => {
                            if (!isToday(i)) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        {i}
                    </div>
                </div>
            );
        }

        return days;
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC', padding: '1.25rem', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            
            {/* Header / Month Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <button onClick={prevMonth} style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#475569', display: 'flex' }}>
                    <ChevronLeft size={18} />
                </button>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#1E293B' }}>
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </div>
                <button onClick={nextMonth} style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#475569', display: 'flex' }}>
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Calendar Grid */}
            <div style={{ background: 'white', padding: '1.25rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                    {renderDays()}
                </div>
            </div>

            {/* Events/Schedule Placeholder */}
            <div style={{ marginTop: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upcoming Schedule</h4>
                
                <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: '#ECFDF5', color: '#10B981', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={18} />
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.9rem' }}>Team Sync Meeting</div>
                        <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '2px' }}>Today at 2:00 PM</div>
                    </div>
                </div>

                <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: '#EFF6FF', color: '#3B82F6', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CalendarIcon size={18} />
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.9rem' }}>Client Review</div>
                        <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '2px' }}>Tomorrow at 10:30 AM</div>
                    </div>
                </div>
                
                <div style={{ textAlign: 'center', marginTop: 'auto', padding: '1rem', color: '#94A3B8', fontSize: '0.8rem' }}>
                    Calendar integration coming soon
                </div>
            </div>
        </div>
    );
};

export default CalendarPanel;
