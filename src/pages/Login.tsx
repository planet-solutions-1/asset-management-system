import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, User } from 'lucide-react';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md glass-card p-10 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-10">
                    <div className="mx-auto w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-4">
                        <Building2 size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-500 text-sm">Sign in to your asset management dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium text-sm"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-semibold text-gray-700">Password</label>
                            <a href="#" className="text-xs font-semibold text-gray-500 hover:text-gray-800">Forgot password?</a>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium text-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-70 shadow-lg shadow-gray-200"
                    >
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 p-4 bg-white/40 rounded-xl text-sm border border-white/50">
                    <p className="font-bold text-gray-900 mb-2 text-xs uppercase tracking-wide">Demo Credentials</p>
                    <div className="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2 -mx-2 rounded-lg transition-colors" onClick={() => setEmail('admin@planet.com')}>
                        <div>
                            <span className="font-medium text-gray-900 block">Super Admin</span>
                            <span className="font-mono text-xs text-gray-500">admin@planet.com</span>
                        </div>
                        <span className="text-xs font-mono bg-white border border-gray-200 px-2 py-1 rounded">pass: admin123</span>
                    </div>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-black font-bold hover:underline">
                        Create Company
                    </Link>
                </div>
            </div>
        </div>
    );
};
