import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Smartphone, Check, ArrowRight, Copy, CheckCircle } from 'lucide-react';
import { authService } from '../services/api';

const Setup2FA = () => {
    const navigate = useNavigate();
    const [qrData, setQrData] = useState(null);
    const [otpCode, setOtpCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchQRCode();
    }, []);

    const fetchQRCode = async () => {
        try {
            const data = await authService.setup2FA();
            setQrData(data);
        } catch (err) {
            setError('Failed to generate QR code');
        } finally {
            setLoading(false);
        }
    };

    const handleCopySecret = () => {
        navigator.clipboard.writeText(qrData.secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setVerifying(true);

        try {
            await authService.verify2FASetup(otpCode);
            // Success! Navigate to dashboard
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP code');
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen gradient-bg flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p>Generating QR Code...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 7, repeat: Infinity }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-2xl"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-4 glow"
                    >
                        <Smartphone className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-4xl font-bold text-white mb-2">Setup Two-Factor Authentication</h1>
                    <p className="text-white/80">Scan the QR code with your authenticator app</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* QR Code Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card-glass p-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <QrCode className="w-5 h-5 text-blue-400" />
                            <h2 className="text-xl font-semibold text-white">Step 1: Scan QR Code</h2>
                        </div>

                        {qrData && (
                            <div className="space-y-4">
                                {/* QR Code Image */}
                                <div className="bg-white p-4 rounded-xl">
                                    <img
                                        src={qrData.qr_code}
                                        alt="QR Code"
                                        className="w-full h-auto"
                                    />
                                </div>

                                {/* Secret Key */}
                                <div>
                                    <p className="text-white/80 text-sm mb-2">Or enter this key manually:</p>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 bg-white/10 px-3 py-2 rounded-lg text-white font-mono text-sm break-all">
                                            {qrData.secret}
                                        </code>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleCopySecret}
                                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                        >
                                            {copied ? (
                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                            ) : (
                                                <Copy className="w-5 h-5 text-white" />
                                            )}
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
                                    <p className="text-blue-200 text-sm">
                                        Use Google Authenticator, Microsoft Authenticator, or any TOTP-compatible app
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Verification Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="card-glass p-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Check className="w-5 h-5 text-green-400" />
                            <h2 className="text-xl font-semibold text-white">Step 2: Verify Code</h2>
                        </div>

                        <form onSubmit={handleVerify} className="space-y-4">
                            <div>
                                <label className="block text-white/90 font-medium mb-2">
                                    Enter 6-digit code from your app
                                </label>
                                <input
                                    type="text"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="input-glass text-center text-2xl font-mono tracking-widest"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                />
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <motion.button
                                type="submit"
                                disabled={verifying || otpCode.length !== 6}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {verifying ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Verifying...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Activate 2FA</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                )}
                            </motion.button>
                        </form>

                        {/* Info Box */}
                        <div className="mt-6 space-y-3">
                            <div className="flex items-start gap-3 text-white/80 text-sm">
                                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-400 font-bold text-xs">1</span>
                                </div>
                                <p>Open your authenticator app</p>
                            </div>
                            <div className="flex items-start gap-3 text-white/80 text-sm">
                                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-400 font-bold text-xs">2</span>
                                </div>
                                <p>Scan the QR code or enter the key</p>
                            </div>
                            <div className="flex items-start gap-3 text-white/80 text-sm">
                                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-400 font-bold text-xs">3</span>
                                </div>
                                <p>Enter the 6-digit code to verify</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Setup2FA;
