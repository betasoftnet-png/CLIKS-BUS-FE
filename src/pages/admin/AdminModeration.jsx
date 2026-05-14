import React, { useState, useEffect } from 'react';
import { 
    ShieldAlert, 
    Trash2, 
    Search, 
    Filter, 
    RefreshCw,
    User,
    MessageSquare,
    ThumbsUp,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import '../../App.css';

const AdminModeration = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const data = await adminService.getPublicPosts();
            setPosts(data || []);
        } catch (err) {
            console.error("Failed to load moderation feed:", err);
            // Fallback data for demo purposes
            setPosts([
                { id: 1, username: 'john_doe', email: 'john@company.com', business_name: 'Acme Corp', content: 'Extremely thrilled to share our Q2 revenue growth using the new accounting dashboard!', type: 'update', likes: 12, created_at: new Date().toISOString() },
                { id: 2, username: 'hacker_99', email: 'fake@spam.com', business_name: 'None', content: 'BUY TOKEN XYZ NOW!!! UNBELIEVABLE GAINS Guaranteed!!! LINK HERE', type: 'spam', likes: 0, created_at: new Date().toISOString() },
                { id: 3, username: 'samantha_v', email: 'sam@vance.io', business_name: 'Vance Logistics', content: 'Just provisioned 3 new warehouses today. Scaling up fast!', type: 'update', likes: 45, created_at: new Date().toISOString() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to purge this public post from the network feed?")) return;
        
        setDeletingId(id);
        try {
            await adminService.deletePublicPost(id);
            setPosts(prev => prev.filter(p => p.id !== id));
        } catch {
            alert("Error deleting post");
        } finally {
            setDeletingId(null);
        }
    };

    const filteredPosts = posts.filter(p => 
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.business_name && p.business_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="premium-container" style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
            <style>{`
                .post-card {
                    background: white;
                    border-radius: 20px;
                    padding: 1.5rem;
                    border: 1px solid #E2E8F0;
                    transition: all 0.25s ease;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    position: relative;
                }
                .post-card:hover {
                    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
                    transform: translateY(-2px);
                    border-color: #C7D2FE;
                }
                .tag {
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 2px 8px;
                    border-radius: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .tag-update { background: #ECFDF5; color: #059669; }
                .tag-spam { background: #FEF2F2; color: #DC2626; border: 1px solid #FEE2E2; }
                
                .moderate-btn {
                    position: absolute;
                    top: 1.25rem;
                    right: 1.25rem;
                    padding: 0.5rem;
                    border-radius: 10px;
                    background: #FEF2F2;
                    border: 1px solid #FCA5A5;
                    color: #DC2626;
                    cursor: pointer;
                    transition: all 0.2s;
                    opacity: 0.7;
                }
                .moderate-btn:hover {
                    opacity: 1;
                    background: #DC2626;
                    color: white;
                    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
                }
                .moderate-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .grid-feed {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 1.5rem;
                    margin-top: 1.5rem;
                }
            `}</style>

            {/* Header */}
            <div className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
                <div className="dashboard-header-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>SECURITY & CONTENT</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '850', color: '#0F172A', margin: 0 }}>Global Feed Monitor</h1>
                    <p style={{ color: '#64748B', margin: '0.5rem 0 0 0', fontWeight: 500 }}>Moderate public business timeline updates and mitigate cluster network spam.</p>
                </div>
                <div className="dashboard-header-actions">
                    <button 
                        onClick={fetchPosts} 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', borderRadius: '12px', background: 'white', border: '1px solid #E2E8F0', color: '#0F172A', fontWeight: '700', cursor: 'pointer' }}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Sync Feed
                    </button>
                </div>
            </div>

            {/* Controls Bar */}
            <div style={{ 
                background: 'white', 
                borderRadius: '20px', 
                padding: '1.25rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                border: '1px solid #E2E8F0',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)'
            }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                    <div className="dashboard-search-wrapper" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', maxWidth: '400px', width: '100%', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input 
                            type="text" 
                            placeholder="Scan feed keyword, user handle..." 
                            className="dashboard-search-input"
                            style={{ background: 'transparent' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1.25rem', borderRadius: '12px', background: 'white', border: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
                        <Filter size={16} /> Content Heuristic
                    </button>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748B' }}>
                    Watching <span style={{ color: '#0F172A' }}>{filteredPosts.length}</span> global payloads
                </div>
            </div>

            {/* State Rendering */}
            {loading ? (
                <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#4F46E5', fontWeight: '700' }}>
                    <RefreshCw className="animate-spin" style={{ marginRight: '10px' }} /> Scanning Global Payload Cluster...
                </div>
            ) : filteredPosts.length === 0 ? (
                <div style={{ background: 'white', borderRadius: '24px', border: '1px dashed #CBD5E1', padding: '4rem', textAlign: 'center', color: '#64748B' }}>
                    <AlertCircle size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                    <h3 style={{ fontWeight: 800, color: '#1F2937', marginBottom: '4px' }}>Feed Isolated & Clean</h3>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>No records matching parameters found on active timeline shard.</p>
                </div>
            ) : (
                <div className="grid-feed">
                    {filteredPosts.map((p) => {
                        const isSpamSuspect = p.type === 'spam' || p.content.toLowerCase().includes('buy') || p.content.toLowerCase().includes('guaranteed');
                        
                        return (
                            <div key={p.id} className="post-card" style={{ borderLeft: isSpamSuspect ? '4px solid #EF4444' : '1px solid #E2E8F0' }}>
                                <button 
                                    className="moderate-btn" 
                                    onClick={() => handleDelete(p.id)}
                                    disabled={deletingId === p.id}
                                    title="Purge Payload"
                                >
                                    <Trash2 size={16} />
                                </button>

                                {/* User Context */}
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F1F5F9', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                                        {p.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: '800', color: '#0F172A' }}>@{p.username}</span>
                                            <span className={`tag tag-${isSpamSuspect ? 'spam' : 'update'}`}>
                                                {isSpamSuspect ? 'High Suspect' : 'Clean'}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>{p.business_name || 'Entity Void'} • {p.email}</span>
                                    </div>
                                </div>

                                {/* Post Body */}
                                <div style={{ 
                                    background: '#F8FAFC', 
                                    borderRadius: '14px', 
                                    padding: '1rem', 
                                    fontSize: '0.9rem', 
                                    lineHeight: 1.5, 
                                    color: '#334155',
                                    fontWeight: '500',
                                    flex: 1
                                }}>
                                    {p.content}
                                </div>

                                {/* Metadata Block */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94A3B8', fontWeight: '700', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ThumbsUp size={12} /> {p.likes || 0}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageSquare size={12} /> 0 threads</span>
                                    </div>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={12} /> 
                                        {new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminModeration;
