import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiMode } from '../context/UiModeContext';
import { ShieldCheck, Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setUiMode } = useUiMode();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Mock login - in a real app this would call an API
        // For development purpose, accepting basic credentials
        setTimeout(() => {
            if (email.toLowerCase() === 'admin@civicfix.com' && password === 'admin123') {
                setUiMode('admin');
                navigate('/admin');
            } else {
                setError('Invalid credentials (try admin@civicfix.com / admin123)');
                setIsLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-blue-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 opacity-90"></div>
                    <div className="relative z-10">
                        <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/30 shadow-lg">
                            <ShieldCheck className="text-white w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h2>
                        <p className="text-blue-100 mt-2 text-sm">Secure Access for CivicFix Administrators</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm text-center animate-in fade-in slide-in-from-top-1">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 text-slate-700 bg-slate-50 focus:bg-white"
                                placeholder="admin@civicfix.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 text-slate-700 bg-slate-50 focus:bg-white"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-500 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all transform active:scale-[0.98] shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-4"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5" />
                                Signing in...
                            </>
                        ) : (
                            'Sign In to Dashboard'
                        )}
                    </button>

                    <div className="text-center text-xs text-slate-400 mt-6 flex flex-col gap-1">
                        <span>Protected by CivicFix Secure Access</span>
                        <span className="opacity-50">v1.0.0</span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
