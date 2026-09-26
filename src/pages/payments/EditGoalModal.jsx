import React, { useState, useEffect, useMemo } from 'react';
import { X, AlertCircle } from 'lucide-react';

export const EditGoalModal = ({
    isOpen = true,
    onClose,
    wallet,
    goal,
    savedAllocated: propSavedAllocated,
    savedAmount: propSavedAmount,
    onSubmit,
    onSave
}) => {
    const targetWallet = wallet || goal || {};
    const savedAllocated = propSavedAllocated ?? propSavedAmount ?? parseFloat(targetWallet.current_amount || targetWallet.savedAllocated || targetWallet.savedAmount || 0);

    const [targetAmount, setTargetAmount] = useState(() => {
        const rounded = Math.round(parseFloat(targetWallet.target_amount || 0));
        return rounded > 0 ? rounded.toString() : '';
    });
    const [name, setName] = useState(targetWallet.name || '');
    const [description, setDescription] = useState(targetWallet.description || '');
    const [error, setError] = useState('');

    useEffect(() => {
        if (targetWallet) {
            const rounded = Math.round(parseFloat(targetWallet.target_amount || 0));
            setTargetAmount(rounded > 0 ? rounded.toString() : '');
            setName(targetWallet.name || '');
            setDescription(targetWallet.description || '');
            setError('');
        }
    }, [targetWallet]);

    const numTarget = Number(targetAmount);
    const isTargetLessThanSaved = Boolean(targetAmount !== '' && numTarget < savedAllocated);
    const isSubmitDisabled = !targetAmount || numTarget <= 0 || isTargetLessThanSaved;

    const handleKeyDown = (e) => {
        if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
            e.preventDefault();
        }
    };

    const handleChange = (e) => {
        let val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length > 1 && val.startsWith('0')) {
            val = val.replace(/^0+/, '') || '0';
        }
        setTargetAmount(val);
        const numVal = Number(val);
        if (val !== '' && numVal < savedAllocated) {
            setError('The target amount cannot be less than the amount already saved.');
        } else if (val && numVal > 0) {
            setError('');
        } else if (val !== '') {
            setError('Target amount must be greater than 0');
        } else {
            setError('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSubmitDisabled) return;
        if (numTarget < savedAllocated) {
            setError('The target amount cannot be less than the amount already saved.');
            return;
        }
        const handler = onSubmit || onSave;
        if (handler) {
            handler({
                ...targetWallet,
                name,
                target_amount: parseInt(targetAmount, 10),
                description
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-emerald-950/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-[460px] rounded-[28px] p-10 border border-slate-200 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-emerald-900 m-0">Edit Target Wallet</h3>
                    {onClose && (
                        <button onClick={onClose} className="border-0 bg-slate-100 text-slate-500 p-2 rounded-xl cursor-pointer">
                            <X size={20} />
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-xs font-extrabold text-slate-500 mb-2 uppercase">Purpose / Item Name</label>
                        <input 
                            required 
                            placeholder="e.g. Office Printer, Future Stock" 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            className="w-full py-3.5 px-4 rounded-xl border border-slate-200 outline-none font-semibold text-slate-800"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-extrabold text-slate-500 mb-2 uppercase">Target Cap Amount</label>
                        <div className="relative">
                            <input 
                                required 
                                type="number" 
                                min={savedAllocated}
                                step="1"
                                placeholder="0" 
                                value={targetAmount} 
                                onKeyDown={handleKeyDown}
                                onChange={handleChange}
                                className={`w-full py-3.5 px-4 rounded-xl outline-none font-extrabold text-lg text-slate-900 border ${
                                    isTargetLessThanSaved || error ? 'border-red-500' : 'border-slate-200'
                                }`}
                            />
                        </div>
                        {(isTargetLessThanSaved || error) && (
                            <div className="validation-alert flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5 mt-2 font-semibold">
                                <AlertCircle size={14} className="shrink-0" />
                                <span>
                                    {isTargetLessThanSaved 
                                        ? "The target amount cannot be less than the amount already saved." 
                                        : error}
                                </span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-extrabold text-slate-500 mb-2 uppercase">Descriptive Notes</label>
                        <textarea 
                            rows="3"
                            placeholder="Brief rationale for this segregation..." 
                            value={description} 
                            onChange={e => setDescription(e.target.value)}
                            className="w-full py-3.5 px-4 rounded-xl border border-slate-200 outline-none resize-none text-slate-600"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitDisabled}
                        className={`p-4 rounded-xl border-0 font-extrabold text-base text-white mt-2 transition-all ${
                            isSubmitDisabled 
                                ? 'bg-slate-400 opacity-50 cursor-not-allowed' 
                                : 'bg-emerald-700 hover:bg-emerald-800 cursor-pointer shadow-lg shadow-emerald-700/20'
                        }`}
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditGoalModal;
