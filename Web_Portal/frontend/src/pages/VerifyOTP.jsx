import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, RefreshCw, Smartphone, CheckCircle, XCircle } from 'lucide-react';
import { authService } from '../services/api';

const VerifyOTP = () => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(30);
    const [pushLoading, setPushLoading] = useState(false);
    const [pushStatus, setPushStatus] = useState(null); // 'PENDING', 'APPROVED', 'DENIED'
    const inputRefs = useRef([]);
    const pollInterval = useRef(null);

    useEffect(() => {
        inputRefs.current[0]?.focus();
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => {
            clearInterval(timer);
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, []);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
        if (newOtp.every((digit) => digit !== '') && index === 5) handleVerify(newOtp.join(''));
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = pastedData.split('');
        setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
        if (newOtp.length === 6) handleVerify(pastedData);
    };

    const handleVerify = async (code) => {
        setError('');
        setLoading(true);
        try {
            const response = await authService.verifyOTP(code || otp.join(''));
            if (response.status === 'SUCCESS') {
                authService.saveTokens(response.tokens);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP code');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handlePushAuth = async () => {
        setPushLoading(true);
        setError('');
        setPushStatus('PENDING');
        try {
            const response = await authService.initiatePushAuth();
            const requestId = response.request_id;

            // Start polling
            pollInterval.current = setInterval(async () => {
                try {
                    const statusRes = await authService.checkPushAuthStatus(requestId);
                    if (statusRes.status === 'APPROVED') {
                        clearInterval(pollInterval.current);
                        setPushStatus('APPROVED');
                        authService.saveTokens(statusRes.tokens);
                        setTimeout(() => navigate('/dashboard'), 1500);
                    } else if (statusRes.status === 'DENIED') {
                        clearInterval(pollInterval.current);
                        setPushStatus('DENIED');
                        setTimeout(() => {
                            setPushStatus(null);
                            setPushLoading(false);
                        }, 3000);
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                }
            }, 2000);
        } catch (err) {
            setError('Failed to initiate push authentication');
            setPushLoading(false);
            setPushStatus(null);
        }
    };

    return (
        <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 6, repeat: Infinity }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4 glow"
                    >
                        <Lock className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-4xl font-bold text-white mb-2">Two-Factor Auth</h1>
                    <p className="text-white/80">Secure your account with 2FA</p>
                </div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-glass p-8">
                    <AnimatePresence mode="wait">
                        {pushStatus === 'PENDING' ? (
                            <motion.div
                                key="pending"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-center py-8"
                            >
                                <div className="relative w-20 h-20 mx-auto mb-6">
                                    <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full" />
                                    <motion.div
                                        className="absolute inset-0 border-4 border-t-blue-500 rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    <Smartphone className="absolute inset-0 m-auto w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Check your phone</h3>
                                <p className="text-white/60">We've sent a notification to your registered device.</p>
                                <button
                                    onClick={() => {
                                        if (pollInterval.current) clearInterval(pollInterval.current);
                                        setPushStatus(null);
                                        setPushLoading(false);
                                    }}
                                    className="mt-6 text-white/40 hover:text-white/60 text-sm underline"
                                >
                                    Cancel and use OTP code
                                </button>
                            </motion.div>
                        ) : pushStatus === 'APPROVED' ? (
                            <motion.div
                                key="approved"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white">Login Approved!</h3>
                                <p className="text-white/60">Redirecting to dashboard...</p>
                            </motion.div>
                        ) : pushStatus === 'DENIED' ? (
                            <motion.div
                                key="denied"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white">Login Denied</h3>
                                <p className="text-white/60">The request was rejected from your mobile.</p>
                            </motion.div>
                        ) : (
                            <div key="otp-form">
                                <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className={`w-14 h-14 text-center text-2xl font-bold bg-white/10 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${digit ? 'border-blue-400 text-white' : 'border-white/20 text-white/60'}`}
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm text-center mb-4">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={() => handleVerify()}
                                    disabled={loading || otp.some((d) => !d)}
                                    className="btn-primary w-full h-12 mb-4 font-bold tracking-wide"
                                >
                                    {loading ? "VERIFYING..." : "VERIFY CODE"}
                                </button>

                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                                    <div className="relative flex justify-center text-sm"><span className="px-4 bg-transparent text-white/40 uppercase tracking-tighter">Or use push auth</span></div>
                                </div>

                                <button
                                    onClick={handlePushAuth}
                                    disabled={pushLoading}
                                    className="w-full h-12 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all"
                                >
                                    <Smartphone className="w-5 h-5 text-blue-400" />
                                    Send Prompt to Phone
                                </button>
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <div className="mt-8 flex justify-center gap-6">
                    <button onClick={() => navigate('/login')} className="text-white/40 hover:text-white text-sm">Back to Login</button>
                    <div className="w-px h-4 bg-white/10" />
                    <button disabled={timeLeft > 0} onClick={() => setTimeLeft(30)} className="text-white/40 hover:text-white text-sm">Resend OTP</button>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyOTP;
