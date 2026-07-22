import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../services';
import {
    X,
    Edit2,
    Star,
    Check,
    Sparkles
} from 'lucide-react';

// Extensible products definition
const ALL_PRODUCTS = [
    // Public Apps
    {
        name: 'Cliks',
        category: 'Public',
        icon: '/cliks_logo.png',
        color: '#10B981' // Green
    },
    {
        name: 'BNXmail',
        category: 'Public',
        icon: '/bnxmail_logo.png',
        color: '#004aad' // Blue
    },
    {
        name: 'Bit-Tool',
        category: 'Public',
        icon: '/bit_tool_logo.png',
        color: '#2563eb' // Blue
    },
    {
        name: 'B2Auth',
        category: 'Public',
        icon: '/b2auth_logo.png',
        color: '#1e293b' // Slate
    },
    // Business Apps
    {
        name: 'CliksBusiness',
        category: 'Business',
        icon: '/cliksbusiness_logo.png',
        color: '#047857' // Dark Green
    }
];

const ProductLauncher = ({ onClose }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState('BASE'); // 'BASE', 'PUBLIC' or 'BUSINESS'
    const [selectedTab, setSelectedTab] = useState('FAVORITES'); // 'FAVORITES' or 'RECENTS'

    // Fetch recents from localStorage, default to empty array
    const [recents, setRecents] = useState(() => {
        try {
            const saved = localStorage.getItem('launcher_recents');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading recents:', e);
            return [];
        }
    });

    // Fetch user profile to retrieve favorite products configuration
    const { data: user = {} } = useQuery({
        queryKey: ['profile'],
        queryFn: profileService.getProfile,
    });

    // Parse favorites list, default to a pre-defined set if null/undefined
    const getFavorites = () => {
        if (user.favorite_products === undefined || user.favorite_products === null) {
            return ['Cliks', 'BNXmail', 'Bit-Tool', 'B2Auth'];
        }
        try {
            return JSON.parse(user.favorite_products);
        } catch (e) {
            console.error('Error parsing favorite products:', e);
            return ['Cliks', 'BNXmail', 'Bit-Tool', 'B2Auth'];
        }
    };

    const favorites = getFavorites();

    // Mutation to persist user's favorite products configuration in the database
    const mutation = useMutation({
        mutationFn: async (newFavorites) => {
            return await profileService.updateProfile({
                favorite_products: JSON.stringify(newFavorites)
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
    });

    // Append to recents list
    const recordRecent = (name) => {
        setRecents(prev => {
            const filtered = prev.filter(r => r !== name);
            const updated = [name, ...filtered].slice(0, 4);
            try {
                localStorage.setItem('launcher_recents', JSON.stringify(updated));
            } catch (e) {
                console.error('Error saving recents:', e);
            }
            return updated;
        });
    };

    // Toggle product favorite status
    const toggleFavorite = (name) => {
        let updatedFavorites;
        if (favorites.includes(name)) {
            updatedFavorites = favorites.filter(fav => fav !== name);
        } else {
            updatedFavorites = [...favorites, name];
        }
        mutation.mutate(updatedFavorites);
    };

    // Handle card clicks depending on mode
    const handleProductClick = (name) => {
        if (isEditMode) {
            toggleFavorite(name);
        } else {
            console.log(`Opening ${name}`);
            recordRecent(name);
            onClose(); // Close launcher automatically
            // Navigate to selected application in main content area
            if (name === 'Cliks') {
                navigate('/cliks');
            } else if (name === 'BNXmail') {
                navigate('/bnxmail');
            } else if (name === 'Bit-Tool') {
                navigate('/bit-tool');
            } else if (name === 'B2Auth') {
                navigate('/b2auth');
            } else if (name === 'CliksBusiness') {
                navigate('/dashboard');
            }
        }
    };

    return (
        <div className="launcher-panel-content" role="dialog" aria-labelledby="launcher-title">
            {/* Header */}
            <div className="launcher-header-wrapper">
                <div className="launcher-header-left">
                    <h2 id="launcher-title" className="launcher-brand-title" style={{ color: '#1B6B3A' }}>
                        BETA
                    </h2>
                </div>
                <div className="launcher-actions">
                    <button
                        className={`launcher-edit-btn ${isEditMode ? 'active' : ''}`}
                        onClick={() => setIsEditMode(prev => !prev)}
                        aria-label={isEditMode ? "Exit edit mode" : "Enter edit favorites mode"}
                    >
                        {isEditMode ? <Check size={14} /> : <Edit2 size={14} />}
                        {isEditMode ? 'Done' : 'Edit'}
                    </button>
                    <button
                        className="launcher-close-btn"
                        onClick={onClose}
                        aria-label="Close launcher panel"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Scrollable Container */}
            <div className="launcher-scrollable">

                {/* Favorites & Recent View Toggle Container */}
                <div className="launcher-toggle-container">
                    <div className="launcher-toggle-header">
                        <div className="launcher-toggle-half left">
                            <button
                                className={`launcher-toggle-tab ${selectedTab === 'FAVORITES' ? 'active' : ''}`}
                                onClick={() => setSelectedTab('FAVORITES')}
                            >
                                Favorites
                            </button>
                        </div>
                        <span className="launcher-toggle-divider">|</span>
                        <div className="launcher-toggle-half right">
                            <button
                                className={`launcher-toggle-tab ${selectedTab === 'RECENTS' ? 'active' : ''}`}
                                onClick={() => setSelectedTab('RECENTS')}
                            >
                                Recent
                            </button>
                        </div>
                    </div>

                    <div className="launcher-toggle-content-wrapper">
                        {selectedTab === 'FAVORITES' ? (
                            <div className="launcher-toggle-pane">
                                {favorites.length === 0 ? (
                                    <div className="launcher-split-empty">
                                        No favorites
                                    </div>
                                ) : (
                                    <div className="launcher-split-grid">
                                        {favorites.slice(0, 4).map(favName => {
                                            const prod = ALL_PRODUCTS.find(p => p.name === favName);
                                            if (!prod) return null;
                                            const IconComponent = prod.icon;
                                            return (
                                                <div
                                                    key={prod.name}
                                                    className="launcher-mini-item-wrapper"
                                                    onClick={() => handleProductClick(prod.name)}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            handleProductClick(prod.name);
                                                        }
                                                    }}
                                                >
                                                    <div className={`launcher-mini-card ${isEditMode ? 'edit-mode' : ''}`}>
                                                        {isEditMode && (
                                                            <button
                                                                className="launcher-mini-remove-btn"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleFavorite(prod.name);
                                                                }}
                                                                aria-label={`Remove ${prod.name} from favorites`}
                                                            >
                                                                <X size={8} strokeWidth={3} />
                                                            </button>
                                                        )}
                                                        <div style={{ color: prod.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                             <img 
                                                                 src={IconComponent} 
                                                                 alt={prod.name} 
                                                                 className="launcher-mini-img-icon"
                                                             />
                                                        </div>
                                                    </div>
                                                    <span className="launcher-mini-name">{prod.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="launcher-toggle-pane">
                                {recents.length === 0 ? (
                                    <div className="launcher-split-empty">
                                        No recents
                                    </div>
                                ) : (
                                    <div className="launcher-split-grid">
                                        {recents.map(recentName => {
                                            const prod = ALL_PRODUCTS.find(p => p.name === recentName);
                                            if (!prod) return null;
                                            const IconComponent = prod.icon;
                                            return (
                                                <div
                                                    key={prod.name}
                                                    className="launcher-mini-item-wrapper"
                                                    onClick={() => handleProductClick(prod.name)}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            handleProductClick(prod.name);
                                                        }
                                                    }}
                                                >
                                                    <div className="launcher-mini-card">
                                                        <div style={{ color: prod.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                             <img 
                                                                 src={IconComponent} 
                                                                 alt={prod.name} 
                                                                 className="launcher-mini-img-icon"
                                                             />
                                                        </div>
                                                    </div>
                                                    <span className="launcher-mini-name">{prod.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Base Section Header & Tabs */}
                <div className="launcher-base-header">
                    <button
                        className="launcher-base-title"
                        onClick={() => setActiveTab('BASE')}
                        aria-label="Show all products"
                    >
                        BASE
                    </button>
                    <div className="launcher-base-nav">
                        <button
                            className={`launcher-base-link ${activeTab === 'PUBLIC' ? 'active' : ''}`}
                            onClick={() => setActiveTab('PUBLIC')}
                        >
                            PUBLIC
                        </button>
                        <span className="launcher-nav-divider">|</span>
                        <button
                            className={`launcher-base-link ${activeTab === 'BUSINESS' ? 'active' : ''}`}
                            onClick={() => setActiveTab('BUSINESS')}
                        >
                            BUSINESS
                        </button>
                    </div>
                </div>

                {/* Main Product Grid showing only large app icons */}
                <div className="launcher-section" style={{ gap: '1rem' }}>
                    <div className="launcher-main-grid">
                        {(activeTab === 'BASE' ? ALL_PRODUCTS : ALL_PRODUCTS.filter(p => p.category.toUpperCase() === activeTab)).map(prod => {
                            const IconComponent = prod.icon;
                            const isFav = favorites.includes(prod.name);
                            return (
                                <div
                                    key={prod.name}
                                    className={`launcher-all-card ${isEditMode ? 'edit-mode' : ''}`}
                                    style={{ backgroundColor: '#FFFFFF', color: prod.color }}
                                    onClick={() => handleProductClick(prod.name)}
                                    role="button"
                                    tabIndex={0}
                                    data-tooltip={prod.name}
                                    title={prod.name}
                                    aria-label={`Open ${prod.name}`}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleProductClick(prod.name);
                                        }
                                    }}
                                >
                                    <div className="launcher-all-icon-wrapper">
                                        <img 
                                            src={IconComponent} 
                                            alt={prod.name} 
                                            className="launcher-grid-img-icon"
                                        />
                                    </div>
                                    <span className="launcher-all-name">{prod.name}</span>

                                    {/* Star Toggle shown in Edit Mode */}
                                    {isEditMode && (
                                        <button
                                            className="launcher-grid-star-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(prod.name);
                                            }}
                                            aria-label={isFav ? `Remove ${prod.name} from favorites` : `Add ${prod.name} to favorites`}
                                        >
                                            <Star
                                                size={12}
                                                fill={isFav ? "#F59E0B" : "none"}
                                                stroke={isFav ? "#F59E0B" : "#94a3b8"}
                                                strokeWidth={2}
                                            />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="launcher-divider" />

                {/* Coming Soon Section - Beta Labs Showcase */}
                <div className="launcher-labs-container">
                    <div className="launcher-labs-glow" />

                    <div className="launcher-labs-icon-wrapper">
                        <Sparkles size={22} className="launcher-labs-sparkles-icon" />
                    </div>

                    <div className="launcher-labs-badge">
                        <span>BETA LABS RELEASE</span>
                    </div>

                    <h3 className="launcher-labs-title">
                        COMING SOON
                    </h3>

                    <p className="launcher-labs-description">
                        Building the next generation of Beta applications.
                    </p>

                    <div className="launcher-labs-divider" />

                    <div className="launcher-labs-status">
                        <span className="launcher-labs-status-icon">🚀</span>
                        <span>New innovations arriving soon</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="launcher-footer">
                <span>Beta Ecosystem</span>
                <span className="launcher-footer-divider">•</span>
                <span>Future Ready</span>
            </div>

            {/* Premium Styles */}
            <style>{`
                .launcher-panel-content {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    width: 100%;
                    background: #ffffff;
                    font-family: 'Outfit', 'Inter', sans-serif;
                    overflow: hidden;
                    box-sizing: border-box;
                }

                .launcher-panel-content * {
                    box-sizing: border-box;
                }

                /* Header Styling */
                .launcher-header-wrapper {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid #f1f5f9;
                    width: 100%;
                    flex-wrap: nowrap;
                    height: 64px;
                    flex-shrink: 0;
                }
                .launcher-header-left {
                    display: flex;
                    align-items: center;
                    min-width: 0;
                }
                .launcher-brand-title {
                    font-family: 'Saira Stencil One', 'Anton', sans-serif;
                    font-weight: 900;
                    font-size: 28px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    line-height: 1;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    align-items: center;
                }
                .launcher-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-shrink: 0;
                }
                .launcher-edit-btn {
                    border: 1px solid #e2e8f0;
                    background: #ffffff;
                    color: #475569;
                    padding: 0.4rem 0.75rem;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                    font-family: inherit;
                }
                .launcher-edit-btn:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                    color: #0f172a;
                }
                .launcher-edit-btn.active {
                    background: #f0fdf4;
                    border-color: #bbf7d0;
                    color: #166534;
                }
                .launcher-close-btn {
                    border: none;
                    background: #f8fafc;
                    color: #64748b;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .launcher-close-btn:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                    transform: rotate(90deg);
                }

                .launcher-scrollable {
                    padding: 1rem;
                    overflow-y: auto;
                    overflow-x: hidden;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    width: 100%;
                }
                
                .launcher-scrollable::-webkit-scrollbar {
                    width: 6px;
                }
                .launcher-scrollable::-webkit-scrollbar-track {
                    background: transparent;
                }
                .launcher-scrollable::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                .launcher-scrollable::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }

                .launcher-section {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    width: 100%;
                }

                .launcher-toggle-container {
                    display: flex;
                    flex-direction: column;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 0.75rem;
                    width: 100%;
                    gap: 0.75rem;
                    align-items: stretch;
                }
                .launcher-toggle-header {
                    display: flex;
                    align-items: center;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 0.5rem;
                    width: 100%;
                }
                .launcher-toggle-half {
                    flex: 1;
                    display: flex;
                    align-items: center;
                }
                .launcher-toggle-half.left {
                    justify-content: center;
                }
                .launcher-toggle-half.right {
                    justify-content: center;
                }
                .launcher-toggle-tab {
                    font-size: 0.8rem;
                    font-weight: 800;
                    color: #94a3b8;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    padding: 0.2rem 0;
                    transition: all 0.2s ease;
                    border-bottom: 2px solid transparent;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-family: inherit;
                }
                .launcher-toggle-tab:hover {
                    color: #475569;
                }
                .launcher-toggle-tab.active {
                    color: #1B6B3A;
                    border-bottom: 2px solid #1B6B3A;
                }
                .launcher-toggle-divider {
                    color: #cbd5e1;
                    font-size: 0.8rem;
                    user-select: none;
                }
                .launcher-toggle-pane {
                    width: 100%;
                }
                .launcher-split-empty {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 58px;
                    border: 1px dashed #cbd5e1;
                    border-radius: 10px;
                    font-size: 0.75rem;
                    color: #94a3b8;
                    font-weight: 600;
                    padding: 1rem;
                    text-align: center;
                    width: 100%;
                }
                .launcher-split-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.75rem;
                }
                .launcher-mini-item-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    width: 100%;
                }
                .launcher-mini-card {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 58px;
                    height: 58px;
                    border-radius: 16px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    transition: all 0.2s ease;
                    user-select: none;
                }
                .launcher-mini-item-wrapper:hover .launcher-mini-card {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.04);
                    border-color: #cbd5e1;
                }
                .launcher-mini-item-wrapper:active .launcher-mini-card {
                    transform: scale(0.96);
                }
                .launcher-mini-card.edit-mode {
                    animation: launcher-shake 0.3s ease-in-out infinite alternate;
                }
                .launcher-mini-name {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: #000000 !important;
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    width: 100%;
                    padding: 0 2px;
                }
                .launcher-mini-remove-btn {
                    position: absolute;
                    top: -3px;
                    right: -3px;
                    background: #ef4444;
                    color: #ffffff;
                    border: none;
                    border-radius: 50%;
                    width: 16px;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(239, 68, 68, 0.3);
                    transition: transform 0.1s ease;
                    z-index: 10;
                    padding: 0;
                }
                .launcher-mini-remove-btn:hover {
                    transform: scale(1.15);
                }

                @keyframes launcher-shake {
                    0% { transform: rotate(-1deg) translateY(0px); }
                    100% { transform: rotate(1deg) translateY(-0.5px); }
                }

                .launcher-base-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                }
                .launcher-base-title {
                    font-size: 0.85rem;
                    font-weight: 850;
                    color: #475569;
                    letter-spacing: 0.75px;
                    border: none;
                    background: transparent;
                    padding: 0;
                    margin: 0;
                    cursor: pointer;
                    font-family: inherit;
                    user-select: none;
                }
                .launcher-base-nav {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .launcher-base-link {
                    border: none;
                    background: transparent;
                    padding: 2px 4px;
                    font-size: 0.8rem;
                    font-weight: 800;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-family: inherit;
                }
                .launcher-base-link:hover {
                    color: #475569;
                }
                .launcher-base-link.active {
                    color: #1B6B3A;
                    border-bottom: 2px solid #1B6B3A;
                }
                .launcher-nav-divider {
                    color: #cbd5e1;
                    font-size: 0.8rem;
                    user-select: none;
                }

                .launcher-main-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.75rem;
                    width: 100%;
                    justify-items: center;
                    align-items: center;
                }

                .launcher-all-card {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    width: 74px;
                    height: 74px;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    outline: none;
                    user-select: none;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.03);
                    border: 1px solid #f1f5f9;
                    padding: 0.5rem 0.25rem;
                }
                .launcher-all-name {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: #000000 !important;
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    width: 100%;
                    padding: 0 2px;
                }
                .launcher-all-icon-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    width: 34px;
                    height: 34px;
                }
                .launcher-grid-img-icon {
                    width: 34px;
                    height: 34px;
                    object-fit: contain;
                }
                .launcher-mini-img-icon {
                    width: 26px;
                    height: 26px;
                    object-fit: contain;
                }
                .launcher-all-card:hover {
                    transform: scale(1.08);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04);
                    border-color: #e2e8f0;
                }
                .launcher-all-card:active {
                    transform: scale(0.97);
                }
                .launcher-all-card.edit-mode {
                    animation: launcher-shake 0.3s ease-in-out infinite alternate;
                }
                .launcher-grid-star-btn {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justifyContent: center;
                    cursor: pointer;
                    transition: transform 0.1s ease;
                    z-index: 10;
                    padding: 0;
                }
                .launcher-grid-star-btn:hover {
                    transform: scale(1.15);
                }

                .launcher-all-card.coming-soon {
                    opacity: 0.55;
                    cursor: not-allowed;
                }
                .launcher-all-card.coming-soon:hover {
                    transform: none;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.03);
                    border-color: #f1f5f9;
                }

                /* Beta Labs Showcase Styling */
                .launcher-labs-container {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 0.75rem;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(248, 250, 252, 0.85) 100%);
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px -10px rgba(99, 102, 241, 0.05),
                                inset 0 1px 0 rgba(255, 255, 255, 0.6);
                    backdrop-filter: blur(12px);
                    width: 100%;
                    gap: 0.35rem;
                }
                .launcher-labs-glow {
                    position: absolute;
                    top: -20%;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 140px;
                    height: 140px;
                    background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%);
                    pointer-events: none;
                    z-index: 0;
                    animation: labs-pulse 4s ease-in-out infinite alternate;
                }
                @keyframes labs-pulse {
                    0% { transform: translateX(-50%) scale(1); opacity: 0.8; }
                    100% { transform: translateX(-50%) scale(1.2); opacity: 1; }
                }
                .launcher-labs-icon-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 30px;
                    height: 30px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 50%;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
                    z-index: 1;
                    animation: labs-float 3s ease-in-out infinite alternate;
                }
                @keyframes labs-float {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-4px); }
                }
                .launcher-labs-sparkles-icon {
                    color: #6366f1;
                    animation: labs-rotate 6s linear infinite;
                }
                @keyframes labs-rotate {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .launcher-labs-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.12rem 0.45rem;
                    background: linear-gradient(90deg, rgba(99, 102, 241, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%);
                    border: 1px solid rgba(99, 102, 241, 0.15);
                    border-radius: 100px;
                    font-size: 0.56rem;
                    font-weight: 850;
                    color: #4f46e5;
                    letter-spacing: 0.75px;
                    z-index: 1;
                    box-shadow: 0 2px 4px rgba(99, 102, 241, 0.02);
                }
                .launcher-labs-title {
                    font-size: 0.92rem;
                    font-weight: 900;
                    margin: 0;
                    letter-spacing: 1.5px;
                    background: linear-gradient(135deg, #1e1b4b 0%, #4f46e5 50%, #db2777 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    z-index: 1;
                }
                .launcher-labs-description {
                    font-size: 0.7rem;
                    color: #475569;
                    line-height: 1.4;
                    margin: 0;
                    font-weight: 550;
                    max-width: 220px;
                    z-index: 1;
                }
                .launcher-labs-divider {
                    height: 1px;
                    background: linear-gradient(90deg, rgba(226, 232, 240, 0) 0%, rgba(226, 232, 240, 0.8) 50%, rgba(226, 232, 240, 0) 100%);
                    width: 80%;
                    margin: 0.15rem 0;
                    z-index: 1;
                }
                .launcher-labs-status {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.68rem;
                    color: #64748b;
                    font-weight: 700;
                    z-index: 1;
                }

                [data-tooltip] {
                    position: relative;
                }
                [data-tooltip]::after {
                    content: attr(data-tooltip);
                    position: absolute;
                    bottom: 115%;
                    left: 50%;
                    transform: translateX(-50%) scale(0.95);
                    background: #0f172a;
                    color: #ffffff;
                    padding: 0.35rem 0.6rem;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    white-space: nowrap;
                    opacity: 0;
                    visibility: hidden;
                    pointer-events: none;
                    transition: all 0.12s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    z-index: 100;
                }
                [data-tooltip]:hover::after {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(-50%) scale(1);
                }

                .launcher-divider {
                    height: 1px;
                    background: #f1f5f9;
                    width: 100%;
                }

                .launcher-footer {
                    padding: 0.65rem 1rem;
                    background: #f8fafc;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    justifyContent: center;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.68rem;
                    color: #94a3b8;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    width: 100%;
                    flex-shrink: 0;
                    height: 48px;
                }
                .launcher-footer-divider {
                    color: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default ProductLauncher;
