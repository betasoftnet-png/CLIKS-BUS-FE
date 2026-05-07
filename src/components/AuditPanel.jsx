import React, { useState } from 'react';
import {
    Send,
    Bot,
    X,
    ChevronLeft,
    AlertTriangle,
    Calendar,
    MessageSquare,
    CheckCircle2
} from 'lucide-react';
import '../App.css';

const AuditPanel = ({ isOpen, onClose }) => {
    const [view, setView] = useState('chat'); // 'chat', 'recent', 'findings'
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: "Hello! I'm your AI Auditor. I can help you analyze financial records, detect anomalies, or review compliance. How would you like to start?" }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { id: Date.now(), sender: 'user', text: input }]);
        setInput('');

        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'ai',
                text: "Scanning your latest ledgers... Found 12 high-priority findings in the Q1 period."
            }]);
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="audit-overlay" onClick={onClose} />
            <div className="audit-panel shadow-2xl">
                {/* Fixed Header */}
                <div className="panel-header">
                    <div className="header-content">
                        {view !== 'chat' && (
                            <button className="nav-back" onClick={() => setView('chat')}>
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        <Bot size={22} className="text-slate-600" />
                        <span className="text-lg font-bold text-slate-800 ml-2">AI Audit</span>
                    </div>
                    <button className="panel-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="panel-body">
                    {view === 'chat' && (
                        <div className="chat-interface">
                            <div className="chip-container">
                                <button className="audit-action-chip" onClick={() => setView('recent')}>
                                    <Calendar size={14} />
                                    <span>Recent Audits</span>
                                </button>
                                <button className="audit-action-chip" onClick={() => setView('findings')}>
                                    <AlertTriangle size={14} />
                                    <span>Findings</span>
                                </button>
                            </div>

                            <div className="messages-area">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`msg-wrapper ${msg.sender}`}>
                                        <div className="msg-bubble">
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="input-area">
                                <div className="input-box">
                                    <input
                                        type="text"
                                        placeholder="Ask AI..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    />
                                    <button
                                        className={`send-btn ${input.trim() ? 'enabled' : ''}`}
                                        onClick={handleSend}
                                        disabled={!input.trim()}
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'recent' && (
                        <div className="audit-view">
                            <h2 className="view-title">Recent Audits</h2>
                            <div className="audit-rows">
                                {[
                                    { title: 'Q1 Financial Review', date: 'Oct 21', status: 'IN PROGRESS', findings: 2 },
                                    { title: 'Q2 Financial Review', date: 'Oct 22', status: 'DONE', findings: 4 },
                                    { title: 'Q3 Financial Review', date: 'Oct 23', status: 'DONE', findings: 6 },
                                ].map((item, i) => (
                                    <div key={i} className="audit-row-item">
                                        <div className="row-main">
                                            <div className="row-title">{item.title}</div>
                                            <div className="row-meta">
                                                <span className={`status-tag ${item.status.replace(' ', '-').toLowerCase()}`}>
                                                    {item.status}
                                                </span>
                                                <span className="findings-count">{item.findings} Findings</span>
                                            </div>
                                        </div>
                                        <div className="row-date">{item.date}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {view === 'findings' && (
                        <div className="audit-view">
                            <div className="stats-header">
                                <div className="stat-box">
                                    <div className="val">12</div>
                                    <div className="lab">High</div>
                                </div>
                                <div className="stat-box">
                                    <div className="val">28</div>
                                    <div className="lab">Med</div>
                                </div>
                            </div>

                            <h3 className="sub-title">Critical Issues</h3>
                            <div className="issues-stack">
                                {[
                                    { id: '202401', title: 'Unreconciled Transaction' },
                                    { id: '202402', title: 'Unreconciled Transaction' },
                                ].map((issue, i) => (
                                    <div key={i} className="issue-row">
                                        <AlertTriangle size={20} className="text-slate-500" />
                                        <div className="issue-info">
                                            <div className="issue-head">{issue.title}</div>
                                            <div className="issue-sub">Order #{issue.id} lacks matching invoice.</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <style>{`
                    .audit-overlay {
                        position: fixed;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.15);
                        backdrop-filter: blur(2px);
                        z-index: 1000;
                    }

                    .audit-panel {
                        position: fixed;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        width: 400px;
                        background: white;
                        z-index: 1001;
                        display: flex;
                        flex-direction: column;
                        animation: slidePanel 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    }

                    @keyframes slidePanel {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }

                    .panel-header {
                        height: 64px;
                        padding: 0 24px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        border-bottom: 1px solid #f1f5f9;
                        flex-shrink: 0;
                    }

                    .header-content {
                        display: flex;
                        align-items: center;
                    }

                    .nav-back, .panel-close {
                        background: none;
                        border: none;
                        color: #94a3b8;
                        cursor: pointer;
                        padding: 6px;
                        border-radius: 6px;
                        display: flex;
                        align-items: center;
                    }

                    .nav-back:hover, .panel-close:hover {
                        background: #f8fafc;
                        color: #475569;
                    }

                    .nav-back { margin-right: 12px; }

                    .panel-body {
                        flex: 1;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                    }

                    .chat-interface {
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                    }

                    .chip-container {
                        padding: 12px 24px;
                        display: flex;
                        gap: 10px;
                        align-items: flex-start;
                        flex-shrink: 0;
                    }

                    .audit-action-chip {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 8px 16px;
                        background: #f1f5f9;
                        border: none;
                        border-radius: 100px;
                        color: #475569;
                        font-size: 0.85rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                        height: 36px;
                    }

                    .audit-action-chip:hover {
                        background: #e2e8f0;
                        color: #1e293b;
                    }

                    .messages-area {
                        flex: 1;
                        overflow-y: auto;
                        padding: 24px;
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                        background: #ffffff;
                    }

                    .msg-wrapper { display: flex; width: 100%; }
                    .msg-wrapper.ai { justify-content: flex-start; }
                    .msg-wrapper.user { justify-content: flex-end; }

                    .msg-bubble {
                        max-width: 80%;
                        padding: 12px 16px;
                        border-radius: 16px;
                        font-size: 0.95rem;
                        line-height: 1.5;
                    }

                    .ai .msg-bubble {
                        background: #f8fafc;
                        color: #334155;
                        border: 1px solid #f1f5f9;
                        border-bottom-left-radius: 4px;
                    }

                    .user .msg-bubble {
                        background: #1B6B3A;
                        color: white;
                        border-bottom-right-radius: 4px;
                    }

                    .input-area {
                        padding: 20px 24px;
                        border-top: 1px solid #f1f5f9;
                        background: white;
                    }

                    .input-box {
                        display: flex;
                        gap: 12px;
                        background: #f8fafc;
                        padding: 8px 12px;
                        border-radius: 12px;
                        border: 1px solid #e2e8f0;
                    }

                    .input-box input {
                        flex: 1;
                        background: transparent;
                        border: none;
                        outline: none;
                        font-size: 0.95rem;
                        color: #1e293b;
                    }

                    .send-btn {
                        width: 36px;
                        height: 36px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #e2e8f0;
                        color: #94a3b8;
                        border: none;
                        border-radius: 8px;
                        cursor: not-allowed;
                        transition: all 0.2s;
                    }

                    .send-btn.enabled {
                        background: #1B6B3A;
                        color: white;
                        cursor: pointer;
                    }

                    .audit-view {
                        padding: 32px 24px;
                        overflow-y: auto;
                        height: 100%;
                    }

                    .view-title {
                        font-size: 1.5rem;
                        font-weight: 800;
                        color: #1e293b;
                        margin-bottom: 32px;
                    }

                    .audit-rows { display: flex; flex-direction: column; gap: 24px; }

                    .audit-row-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                    }

                    .row-title {
                        font-weight: 700;
                        font-size: 1rem;
                        color: #1e293b;
                        margin-bottom: 4px;
                    }

                    .row-meta { display: flex; align-items: center; gap: 12px; }

                    .status-tag {
                        font-size: 0.7rem;
                        font-weight: 800;
                        letter-spacing: 0.05em;
                    }

                    .status-tag.in-progress { color: #d97706; }
                    .status-tag.done { color: #64748b; }

                    .findings-count { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }
                    .row-date { font-size: 0.85rem; color: #64748b; font-weight: 600; }

                    .stats-header { display: flex; gap: 48px; margin-bottom: 40px; }
                    .val { font-size: 2rem; font-weight: 800; color: #1e293b; line-height: 1; }
                    .lab { font-size: 0.95rem; font-weight: 700; color: #64748b; margin-top: 4px; }

                    .sub-title { font-size: 1rem; font-weight: 800; color: #1e293b; margin-bottom: 20px; }
                    .issues-stack { display: flex; flex-direction: column; gap: 24px; }
                    .issue-row { display: flex; gap: 16px; align-items: flex-start; }
                    .issue-head { font-weight: 700; font-size: 1rem; color: #1e293b; margin-bottom: 2px; }
                    .issue-sub { font-size: 0.85rem; color: #64748b; line-height: 1.4; }
                `}</style>
            </div>
        </>
    );
};

export default AuditPanel;
