import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { contactsService } from '../../services';
import { Plus, Send } from 'lucide-react';

const TheSquadTile = () => {
    const { data: contacts = [], isLoading } = useQuery({
        queryKey: ['contacts'],
        queryFn: contactsService.getContacts,
        select: (res) => res.data
    });

    if (isLoading) return <div style={{ color: '#64748B', fontSize: '0.9rem' }}>Loading contacts...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {contacts.slice(0, 5).map(contact => (
                    <div key={contact.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid #E2E8F0', padding: '2px' }}>
                            <img 
                                src={contact.avatar_url || `https://i.pravatar.cc/150?u=${contact.id}`} 
                                alt={contact.name} 
                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                            />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>{contact.name.split(' ')[0]}</span>
                    </div>
                ))}

                <button style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    border: '2px dashed #CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94A3B8',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#1B6B3A'; e.currentTarget.style.color = '#1B6B3A'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#94A3B8'; }}
                >
                    <Plus size={24} />
                </button>
            </div>

            <button style={{
                width: '100%',
                padding: '0.85rem',
                background: '#1B6B3A',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(27, 107, 58, 0.3)',
                marginTop: 'auto'
            }}>
                <Send size={18} />
                QUICK SEND
            </button>
        </div>
    );
};

export default TheSquadTile;
