import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogIn, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate('/admin');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        console.log('Attempting login for:', email);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful');
            const from = (location.state as any)?.from?.pathname || '/admin';
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error('Full Login Error:', err);
            console.error('Error Code:', err.code);
            console.error('Error Message:', err.message);

            // Handle common Firebase Auth errors
            if (err.code === 'auth/operation-not-allowed') {
                setError(`Provider disabled: ${err.message}`);
                return;
            }

            if (err.code === 'auth/network-request-failed') {
                setError('Network error: Browser cannot reach Firebase. Please check your internet, disable Ad-blockers/VPN, and ensure your system time is correct.');

                // Diagnostic 1: Check if we can reach Google Identity Toolkit sign-in endpoint manually
                fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBNaXtT-KK1BwydGIfY6DImoxVXwFAdnQY`, {
                    method: 'POST',
                    body: JSON.stringify({ email: email, password: password, returnSecureToken: true }),
                    headers: { 'Content-Type': 'application/json' }
                })
                    .then(r => r.json().then(data => console.log('Diagnostic (Manual Sign-in):', data)))
                    .catch(dErr => console.error('Diagnostic (Manual Sign-in Unreachable):', dErr));

                return;
            }

            // Logic to auto-create admin if it doesn't exist
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-email') {
                console.log('Checking for account auto-recreation conditions...');
                try {
                    if (email === 'admin@aparda.gov.in' && password === 'admin1234') {
                        console.log('Triggering admin auto-creation...');
                        await createUserWithEmailAndPassword(auth, email, password);
                        console.log('Admin account created successfully');
                        navigate('/admin');
                        return;
                    }
                } catch (createErr: any) {
                    console.error('Auto-create failed:', createErr);
                    setError(`Auto-creation failed [${createErr.code}]: ${createErr.message}`);
                    return;
                }
            }

            setError(`Login Failed [${err.code}]: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#001f3f] overflow-hidden relative">
            {/* Abstract Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-600 rounded-full blur-[120px] opacity-10 animate-pulse" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            </div>

            <div className="m-auto w-full max-w-md p-8 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-2xl p-10 relative overflow-hidden group"
                >
                    {/* Logo Section */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                            <img src="/image.png" alt="AP-ARDA Logo" className="h-32 w-32 object-contain relative z-10 drop-shadow-2xl" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight text-center">
                            AP-ARDA <span className="text-yellow-400 block text-xs mt-1 uppercase tracking-[0.3em]">Administrator</span>
                        </h1>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-blue-200 ml-1 uppercase tracking-wider">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300 group-focus-within:text-yellow-400 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-blue-200 ml-1 uppercase tracking-wider">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300 group-focus-within:text-yellow-400 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 hover:text-yellow-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm"
                            >
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-blue-900 font-bold py-4 rounded-2xl shadow-lg shadow-yellow-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    <span>Sign In to Dashboard</span>
                                    <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-blue-200/50 text-xs">
                            &copy; 2024 AP-ARDA Regulatory Authority.<br />Authorized Personnel Only.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
