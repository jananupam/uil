import React, { useState } from 'react';
import { CloseIcon, KeyIcon } from './icons';

interface LoginModalProps {
    onClose: () => void;
    onSubmit: (password: string) => void;
    error?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSubmit, error }) => {
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(password);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity animate-fade-in"
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-sm m-4 transform transition-all animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">Admin Authentication</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 transition-colors" aria-label="Close modal">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-slate-600">Please enter the admin password to access the dashboard.</p>
                        <div>
                            <label htmlFor="admin-password" className="sr-only">Password</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <KeyIcon className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    id="admin-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`block w-full rounded-md border-slate-300 pl-10 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm ${error ? 'border-red-500 ring-red-500' : ''}`}
                                    placeholder="Password"
                                    autoFocus
                                />
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
                    </div>
                    <div className="px-6 py-4 bg-slate-50 flex justify-end rounded-b-lg">
                        <button 
                            type="submit"
                            className="inline-flex justify-center rounded-md border border-transparent bg-slate-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }

                @keyframes slide-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default LoginModal;