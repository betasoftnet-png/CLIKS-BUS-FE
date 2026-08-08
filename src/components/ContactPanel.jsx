import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, Phone, Search } from 'lucide-react';

const fetchContacts = async () => {
    const token = localStorage.getItem('bnx_auth_token');
    const baseUrl = import.meta.env.VITE_CONTACT_API_BASE_URL;
    const response = await fetch(`${baseUrl}/get-all`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch contacts');
    }
    const result = await response.json();
    return result?.data?.rows || [];
};

const ContactPanel = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: contacts, isLoading, error } = useQuery({
        queryKey: ['global-contacts'],
        queryFn: fetchContacts,
    });

    const filteredContacts = contacts?.filter(contact => 
        (contact.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.phonenumber || '').includes(searchTerm)
    ) || [];

    const getAppColor = (appName) => {
        if (appName === 'Cliks Business') return { bg: '#DCF2E4', color: '#1B6B3A' };
        if (appName === 'Bit Tool') return { bg: '#DBEAFE', color: '#1D4ED8' };
        return { bg: '#F1F5F9', color: '#475569' };
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC', padding: '1.25rem', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            {/* Search Bar */}
            <div style={{ 
                display: 'flex', alignItems: 'center', background: 'white', padding: '0.75rem 1rem', 
                borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.25rem', flexShrink: 0,
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
                <Search size={18} color="#64748B" />
                <input 
                    type="text"
                    placeholder="Search global contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        border: 'none', outline: 'none', width: '100%', marginLeft: '0.75rem', 
                        fontSize: '0.9rem', color: '#1E293B', background: 'transparent'
                    }}
                />
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B', fontSize: '0.9rem' }}>Loading contacts...</div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#EF4444', fontSize: '0.9rem' }}>Error loading contacts</div>
                ) : filteredContacts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B', fontSize: '0.9rem' }}>No contacts found.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {filteredContacts.map(contact => (
                            <div key={contact.id} style={{
                                background: 'white', padding: '1rem', borderRadius: '12px', 
                                border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.75rem',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ 
                                            width: '38px', height: '38px', borderRadius: '10px', 
                                            background: '#F1F5F9', display: 'flex', alignItems: 'center', 
                                            justifyContent: 'center', color: '#475569', fontWeight: '800', fontSize: '1rem' 
                                        }}>
                                            {(contact.name || '?')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#1E293B', fontWeight: '700' }}>{contact.name}</h4>
                                            <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'capitalize', fontWeight: '500' }}>{contact.role || 'Contact'}</span>
                                        </div>
                                    </div>
                                    <span style={{ 
                                        padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase',
                                        background: getAppColor(contact.applicationName).bg,
                                        color: getAppColor(contact.applicationName).color,
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {contact.applicationName || 'Unknown App'}
                                    </span>
                                </div>
                                
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.25rem' }}>
                                    {contact.email && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569', fontSize: '0.8rem', fontWeight: '500' }}>
                                            <Mail size={14} />
                                            <span style={{ wordBreak: 'break-all' }}>{contact.email}</span>
                                        </div>
                                    )}
                                    {contact.phonenumber && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569', fontSize: '0.8rem', fontWeight: '500' }}>
                                            <Phone size={14} />
                                            <span>{contact.phonenumber}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactPanel;
