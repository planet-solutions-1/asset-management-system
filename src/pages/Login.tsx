import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, User, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { LoginScene } from '../components/3d/LoginScene';

export const Login: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(formData.email, formData.password);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    const handleDemoLogin = (role: 'ADMIN' | 'USER') => {
        if (role === 'ADMIN') {
            setFormData({ email: 'admin@demo.com', password: 'password123' });
        } else {
            setFormData({ email: 'user@demo.com', password: 'password123' });
        }
    };

    return (
        <div className="relative w-full min-h-screen overflow-x-hidden bg-[#0f172a]">
            {/* 3D Background Layer */}
            <div className="fixed inset-0 z-0">
                <LoginScene />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Hero Section with Login Form */}
                <div className="min-h-screen flex items-center justify-center p-4 lg:p-8">
                    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        {/* Left: Hero Text */}
                        <div className="hidden lg:block text-white space-y-6">
                            <h1 className="text-6xl font-bold leading-tight tracking-tighter drop-shadow-2xl">
                                Manage Assets <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 filter drop-shadow-lg">
                                    Like a Pro
                                </span>
                            </h1>
                            <p className="text-lg text-blue-100/90 max-w-lg leading-relaxed drop-shadow-md font-medium">
                                Experience the next generation of asset tracking.
                                Real-time immersive dashboard, seamless interactions, and premium insights.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg hover:bg-black/60 transition-colors">
                                    <ShieldCheck className="text-blue-400" size={20} />
                                    <span className="text-sm font-medium text-white">Enterprise Security</span>
                                </div>
                                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg hover:bg-black/60 transition-colors">
                                    <Zap className="text-yellow-400" size={20} />
                                    <span className="text-sm font-medium text-white">Lightning Fast</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Login Card */}
                        <div className="w-full max-w-md mx-auto relative z-20">
                            <div className="glass-card p-8 backdrop-blur-2xl bg-black/40 border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden">
                                {/* Decorator Blob */}
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
                                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>

                                <div className="text-center mb-8 relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30 transform rotate-3 hover:rotate-6 transition-transform">
                                        <Building2 className="text-white" size={32} />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
                                    <p className="text-blue-200/80 text-sm font-medium">Sign in to your premium dashboard</p>
                                </div>

                                {error && (
                                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm backdrop-blur-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5 relative">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-blue-200/80 uppercase tracking-wider ml-1">Email</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-white transition-colors" size={18} />
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-blue-300/30 focus:outline-none focus:bg-black/50 focus:border-blue-400/50 transition-all font-medium"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-blue-200/80 uppercase tracking-wider ml-1">Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-white transition-colors" size={18} />
                                            <input
                                                type="password"
                                                required
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-blue-300/30 focus:outline-none focus:bg-black/50 focus:border-blue-400/50 transition-all font-medium"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        <span>Sign In</span>
                                        <CheckCircle2 size={18} className="opacity-80" />
                                    </button>
                                </form>

                                <div className="mt-8 pt-6 border-t border-white/10">
                                    <p className="text-xs text-blue-200/50 text-center mb-4 uppercase tracking-widest font-bold">Quick Access</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleDemoLogin('ADMIN')}
                                            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-blue-100 transition-colors"
                                        >
                                            Demo Admin
                                        </button>
                                        <button
                                            onClick={() => handleDemoLogin('USER')}
                                            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-blue-100 transition-colors"
                                        >
                                            Demo User
                                        </button>
                                    </div>

                                    <div className="mt-6 text-center">
                                        <button
                                            onClick={() => navigate('/register')}
                                            className="text-sm text-blue-400 hover:text-white transition-colors font-medium border-b border-transparent hover:border-blue-400/50 pb-0.5"
                                        >
                                            Need an account? Create one
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce flex flex-col items-center gap-2">
                        <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
                        <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center pt-1">
                            <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Scrollytelling Section - Features */}
                <div className="min-h-[50vh] bg-black/80 backdrop-blur-xl relative z-20 py-24 px-4 border-t border-white/10">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-white mb-4">Premium Asset Intelligence</h2>
                            <p className="text-xl text-gray-400">Everything you need to manage your inventory with precision.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 text-white">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6"></div>
                                    <h3 className="text-xl font-bold mb-3">Feature {i}</h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        Advanced tracking capabilities allowing for real-time monitoring and predictive maintenance alerts.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
