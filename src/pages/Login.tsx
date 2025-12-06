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
            setError('Invalid email. Try admin@system.com');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="premium-card w-full max-w-md p-10 animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#667eea] mb-2 flex items-center justify-center gap-2">
                        <Building2 size={32} />
                        Asset Management
                    </h1>
                    <p className="text-gray-500">Multi-Company Asset Tracking System</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Username / Email</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#667eea] transition-colors"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#667eea] transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-bold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                    <p className="font-bold text-[#667eea] mb-2">Demo Credentials:</p>
                    <div className="grid grid-cols-1 gap-1">
                        <div className="flex justify-between cursor-pointer hover:text-[#667eea]" onClick={() => setEmail('admin@planet.com')}>
                            <span>Super Admin:</span>
                            <span className="font-mono">admin@planet.com</span>
                            <span className="text-xs text-gray-400">(pass: admin123)</span>
                        </div>
                    </div>
                    <div className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-[#667eea] font-bold hover:underline">
                            Register your company
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
