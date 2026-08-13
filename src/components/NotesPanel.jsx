import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pin, Trash2, Edit2, Palette, X, Save } from 'lucide-react';

const COLORS = [
    '#ffffff',
    '#f8d7da',
    '#fff3cd',
    '#d4edda',
    '#d1ecf1',
    '#cce5ff',
    '#e2e3e5',
    '#f5c6cb',
    '#ffeeba',
    '#b8daff',
];

const fetchNotes = async () => {
    const token = localStorage.getItem('bnx_auth_token');
    const baseUrl = import.meta.env.VITE_NOTES_API_BASE_URL;
    const response = await fetch(`${baseUrl}/?allApps=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch notes');
    const result = await response.json();
    return result?.data || [];
};

const createNote = async (data) => {
    const token = localStorage.getItem('bnx_auth_token');
    const baseUrl = import.meta.env.VITE_NOTES_API_BASE_URL;
    const response = await fetch(`${baseUrl}/create`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create note');
    return response.json();
};

const updateNote = async ({ id, data }) => {
    const token = localStorage.getItem('bnx_auth_token');
    const baseUrl = import.meta.env.VITE_NOTES_API_BASE_URL;
    const response = await fetch(`${baseUrl}/update/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update note');
    return response.json();
};

const deleteNote = async (id) => {
    const token = localStorage.getItem('bnx_auth_token');
    const baseUrl = import.meta.env.VITE_NOTES_API_BASE_URL;
    const response = await fetch(`${baseUrl}/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete note');
    return response.json();
};

const NotesPanel = () => {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [formData, setFormData] = useState({ title: '', content: '', color: '#ffffff', isPinned: false });

    const { data: notes, isLoading, error } = useQuery({
        queryKey: ['global-notes'],
        queryFn: fetchNotes,
    });

    const createMutation = useMutation({
        mutationFn: createNote,
        onSuccess: () => {
            queryClient.invalidateQueries(['global-notes']);
            setIsAdding(false);
            setFormData({ title: '', content: '', color: '#ffffff', isPinned: false });
        }
    });

    const updateMutation = useMutation({
        mutationFn: updateNote,
        onSuccess: () => {
            queryClient.invalidateQueries(['global-notes']);
            setEditingNoteId(null);
            setIsAdding(false);
            setFormData({ title: '', content: '', color: '#ffffff', isPinned: false });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteNote,
        onSuccess: () => {
            queryClient.invalidateQueries(['global-notes']);
        }
    });

    const handleSave = () => {
        if (!formData.title.trim() && !formData.content.trim()) return;
        
        if (editingNoteId) {
            updateMutation.mutate({ id: editingNoteId, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (note) => {
        setFormData({ title: note.title || '', content: note.content || '', color: note.color || '#ffffff', isPinned: note.isPinned || false });
        setEditingNoteId(note.id);
        setIsAdding(true);
    };

    const handleQuickAction = (note, actionData) => {
        updateMutation.mutate({ id: note.id, data: actionData });
    };

    const activeNotes = notes?.filter(n => !n.isArchived) || [];
    const pinnedNotes = activeNotes.filter(n => n.isPinned);
    const regularNotes = activeNotes.filter(n => !n.isPinned);

    const renderNoteCard = (note) => (
        <div key={note.id} style={{
            background: note.color !== '#ffffff' ? note.color : 'white',
            padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0',
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', position: 'relative', transition: 'all 0.2s'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#1E293B', fontWeight: '700', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {note.title || 'Untitled Note'}
                </h4>
                <button 
                    onClick={() => handleQuickAction(note, { isPinned: !note.isPinned })}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: note.isPinned ? '#3B82F6' : '#94A3B8', padding: '0.25rem' }}
                >
                    <Pin size={16} style={{ fill: note.isPinned ? 'currentColor' : 'none' }} />
                </button>
            </div>
            
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', whiteSpace: 'pre-wrap', maxHeight: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {note.content}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <span style={{ 
                    padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase',
                    background: note.applicationName === 'Cliks Business' ? '#DCF2E4' : note.applicationName === 'Bit Tool' ? '#DBEAFE' : '#F1F5F9',
                    color: note.applicationName === 'Cliks Business' ? '#1B6B3A' : note.applicationName === 'Bit Tool' ? '#1D4ED8' : '#475569',
                    whiteSpace: 'nowrap'
                }}>
                    {note.applicationName || 'Unknown App'}
                </span>
                
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button 
                        onClick={() => handleEdit(note)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', padding: '0.25rem' }}
                    >
                        <Edit2 size={14} />
                    </button>
                    <button 
                        onClick={() => deleteMutation.mutate(note.id)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '0.25rem' }}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', background: '#F8FAFC', padding: '1.25rem', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexShrink: 0 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1E293B', fontWeight: '800' }}>My Notes</h3>
                <button 
                    onClick={() => {
                        setFormData({ title: '', content: '', color: '#ffffff', isPinned: false });
                        setEditingNoteId(null);
                        setIsAdding(true);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#3B82F6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                >
                    <Plus size={16} /> New Note
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B', fontSize: '0.9rem' }}>Loading notes...</div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#EF4444', fontSize: '0.9rem' }}>Error loading notes</div>
                ) : activeNotes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B', fontSize: '0.9rem', background: 'white', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                        No notes yet. Click the button above to create one.
                    </div>
                ) : (
                    <>
                        {pinnedNotes.length > 0 && (
                            <div>
                                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Pinned</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                    {pinnedNotes.map(renderNoteCard)}
                                </div>
                            </div>
                        )}
                        {regularNotes.length > 0 && (
                            <div>
                                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>{pinnedNotes.length > 0 ? 'Others' : 'All Notes'}</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                    {regularNotes.map(renderNoteCard)}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add / Edit Form Overlay */}
            {isAdding && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
                    <div style={{ background: formData.color !== '#ffffff' ? formData.color : 'white', width: '100%', maxWidth: '400px', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1E293B', fontWeight: '800' }}>{editingNoteId ? 'Edit Note' : 'New Note'}</h3>
                            <button onClick={() => setIsAdding(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', padding: '0.25rem' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <input 
                            type="text" 
                            placeholder="Title" 
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            style={{ width: '100%', border: 'none', outline: 'none', fontSize: '1rem', fontWeight: '700', color: '#1E293B', background: 'transparent' }}
                        />
                        
                        <textarea 
                            placeholder="Take a note..." 
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.9rem', color: '#475569', background: 'transparent', minHeight: '120px', resize: 'vertical', fontFamily: 'inherit' }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', gap: '0.35rem' }}>
                                    {COLORS.map(c => (
                                        <div 
                                            key={c} 
                                            onClick={() => setFormData({...formData, color: c})}
                                            style={{ 
                                                width: '20px', height: '20px', borderRadius: '50%', background: c, cursor: 'pointer',
                                                border: formData.color === c ? '2px solid #3B82F6' : '1px solid #CBD5E1'
                                            }} 
                                        />
                                    ))}
                                </div>
                            </div>
                            <button 
                                onClick={() => setFormData({...formData, isPinned: !formData.isPinned})}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: formData.isPinned ? '#3B82F6' : '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: '600' }}
                            >
                                <Pin size={16} style={{ fill: formData.isPinned ? 'currentColor' : 'none' }} /> Pinned
                            </button>
                        </div>

                        <button 
                            onClick={handleSave}
                            disabled={createMutation.isLoading || updateMutation.isLoading}
                            style={{ width: '100%', padding: '0.75rem', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', marginTop: '0.5rem', cursor: 'pointer', opacity: (createMutation.isLoading || updateMutation.isLoading) ? 0.7 : 1 }}
                        >
                            {(createMutation.isLoading || updateMutation.isLoading) ? 'Saving...' : 'Save Note'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotesPanel;
