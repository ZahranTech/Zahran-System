import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Smartphone, Trash2, LogOut, CheckCircle,
    Clock, AlertCircle, Plus, Settings
} from 'lucide-react';
import { authService } from '../services/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const data = await authService.getDevices();
            setDevices(data);
        } catch (err) {
            console.error('Failed to fetch devices:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDevice = async (deviceId) => {
        if (!confirm('Are you sure you want to remove this device?')) return;

        setDeletingId(deviceId);
        try {
            await authService.deleteDevice(deviceId);
            setDevices(devices.filter((d) => d.id !== deviceId));
        } catch (err) {
            alert('Failed to delete device');
        } finally {
            setDeletingId(null);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen gradient-bg p-4 md:p-8 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.4, 0.2, 0.4],
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center glow">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">Security Dashboard</h1>
                            <p className="text-white/80">Manage your two-factor authentication devices</p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden md:inline">Logout</span>
                    </motion.button>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card-glass p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm mb-1">Active Devices</p>
                                <p className="text-3xl font-bold text-white">{devices.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <Smartphone className="w-6 h-6 text-green-400" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card-glass p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm mb-1">Security Status</p>
                                <p className="text-xl font-bold text-green-400 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Protected
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card-glass p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm mb-1">Last Activity</p>
                                <p className="text-sm font-medium text-white">
                                    {devices[0]?.last_used_at ? formatDate(devices[0].last_used_at) : 'N/A'}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-purple-400" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Devices List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card-glass p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Smartphone className="w-6 h-6" />
                            Your Devices
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/setup-2fa')}
                            className="btn-secondary flex items-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Device
                        </motion.button>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-white/80">Loading devices...</p>
                        </div>
                    ) : devices.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
                            <p className="text-white/80 mb-4">No devices found</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/setup-2fa')}
                                className="btn-primary"
                            >
                                Setup Your First Device
                            </motion.button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {devices.map((device, index) => (
                                    <motion.div
                                        key={device.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                                    <Smartphone className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-semibold">{device.name}</h3>
                                                    <p className="text-white/60 text-sm">
                                                        Added: {formatDate(device.created_at)}
                                                    </p>
                                                    {device.last_used_at && (
                                                        <p className="text-white/60 text-sm">
                                                            Last used: {formatDate(device.last_used_at)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                                                    Active
                                                </span>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDeleteDevice(device.id)}
                                                    disabled={deletingId === device.id}
                                                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {deletingId === device.id ? (
                                                        <div className="w-5 h-5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-5 h-5 text-red-400" />
                                                    )}
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>

                {/* Security Tips */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 card-glass p-6"
                >
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Security Tips
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-white font-medium">Keep your device secure</p>
                                <p className="text-white/60 text-sm">Use a strong password and biometric lock</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-white font-medium">Backup your codes</p>
                                <p className="text-white/60 text-sm">Save recovery codes in a safe place</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-white font-medium">Review devices regularly</p>
                                <p className="text-white/60 text-sm">Remove devices you no longer use</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-white font-medium">Use trusted apps</p>
                                <p className="text-white/60 text-sm">Google or Microsoft Authenticator recommended</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
