import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Search,
  Settings,
  ShieldCheck,
  LayoutDashboard,
  Clock,
  Link as LinkIcon,
  User,
  Power,
  FileQuestion,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Filter,
  ArrowUpRight,
  TrendingUp,
  History,
  Info,
  ChevronLeft,
  Calendar,
  Layers,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Smartphone,
  QrCode,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCcw,
  X,
  Lock,
  Smartphone as SmartphoneIcon,
  Check as CheckIcon,
  Copy as CopyIcon
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;
console.log('🔌 Backend URL Configured:', API_URL);
console.log('🌍 Environment:', import.meta.env.MODE);

const API_BASE = `${API_URL}/api`;
const AUTH_URL = `${API_BASE}/auth/login/`;

// Global axios configuration
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem('role'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [invoices, setInvoices] = useState([]);
  const [authStep, setAuthStep] = useState('login');
  const [tempToken, setTempToken] = useState(null);

  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const fetchInvoices = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const response = await axios.get(`${API_BASE}/invoices/`);
      setInvoices(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
      }
    }
  };

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchInvoices();
    }
  }, [isLoggedIn]);

  const [totalStats, setTotalStats] = useState({ total: 0, frozen: 0, pending: 0, accepted: 0, rejected: 0 });

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/invoices/stats/`);
      setTotalStats(res.data);
    } catch (e) { console.error("Stats error", e); }
  };

  React.useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthSuccess = (tokens, username = null) => {
    localStorage.setItem('token', tokens.access);
    localStorage.setItem('refresh', tokens.refresh);
    if (username) localStorage.setItem('username', username);

    // Default role logic (can be improved by backend response)
    const storedUsername = username || localStorage.getItem('username');
    let role = 'Admin';
    if (storedUsername === 'data_entry') role = 'DataEntry';
    if (storedUsername === 'supervisor') role = 'Supervisor';
    localStorage.setItem('role', role);
    setUserRole(role);
    setIsLoggedIn(true);
    setAuthStep('dashboard');
  };

  if (!isLoggedIn) {
    if (authStep === 'setup-2fa') {
      return <Setup2FAView onComplete={(tokens) => handleAuthSuccess(tokens)} onBack={() => setAuthStep('login')} />;
    }
    if (authStep === 'verify-otp') {
      return <VerifyOTPView onComplete={(tokens) => handleAuthSuccess(tokens)} onBack={() => setAuthStep('login')} />;
    }
    return <LoginView onProceed={(type, data, username) => {
      if (type === 'SUCCESS') handleAuthSuccess(data.tokens, username);
      if (type === 'SETUP_REQUIRED') {
        localStorage.setItem('token', data.tokens.access);
        localStorage.setItem('username', username);
        setAuthStep('setup-2fa');
      }
      if (type === '2FA_REQUIRED') {
        setTempToken(data.temp_token);
        localStorage.setItem('token', data.temp_token);
        localStorage.setItem('username', username);
        setAuthStep('verify-otp');
      }
    }} />;
  }

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="logo">
          <ShieldCheck size={32} />
          <span>G-Invoice</span>
        </div>

        <nav className="nav-links">
          <div className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} />
            <span>لوحة التحكم</span>
          </div>
          <div className={`nav-link ${activeTab === 'invoices' ? 'active' : ''}`} onClick={() => setActiveTab('invoices')}>
            <FileText size={20} />
            <span>الفواتير</span>
          </div>
          <div className={`nav-link ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
            <Search size={20} />
            <span>بحث متقدم</span>
          </div>
          <div className={`nav-link ${activeTab === 'inquiry' ? 'active' : ''}`} onClick={() => setActiveTab('inquiry')}>
            <FileQuestion size={20} />
            <span>استعلام عن فاتورة</span>
          </div>
          <div className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <BarChart3 size={20} />
            <span>التقارير والتحليلات</span>
          </div>
          <div className={`nav-link ${activeTab === 'setup' ? 'active' : ''}`} onClick={() => setActiveTab('setup')}>
            <Settings size={20} />
            <span>إعدادات الربط</span>
          </div>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div className="nav-link" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '10px', height: 'auto', padding: '10px' }}>
            <User size={20} />
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right', marginRight: '10px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>{localStorage.getItem('username')}</span>
              <span style={{ fontSize: '0.65rem', color: userRole === 'Admin' ? '#00f2fe' : userRole === 'Supervisor' ? '#22c55e' : '#fbbf24' }}>
                {userRole === 'Admin' ? 'المدير العام (الكل)' : userRole === 'Supervisor' ? 'مشرف (فك التجميد)' : 'مدخل بيانات (تجميد)'}
              </span>
            </div>
          </div>
          <div className="nav-link" style={{ color: '#ef4444', cursor: 'pointer' }} onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            setIsLoggedIn(false);
          }}>
            <Power size={20} />
            <span>تسجيل الخروج</span>
          </div>
        </div>
      </div>

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            {t.type === 'success' && <CheckCircle2 size={20} color="#22c55e" />}
            {t.type === 'error' && <XCircle size={20} color="#ef4444" />}
            {t.type === 'warning' && <AlertCircle size={20} color="#fbbf24" />}
            <span style={{ fontSize: '0.9rem' }}>{t.message}</span>
          </div>
        ))}
      </div>

      <main className="main-content">
        <div className="content-container">
          {activeTab === 'dashboard' && <DashboardView invoices={invoices} onRefresh={fetchInvoices} userRole={userRole} addToast={addToast} stats={totalStats} />}
          {activeTab === 'setup' && <SetupView userRole={userRole} addToast={addToast} />}
          {activeTab === 'invoices' && <InvoicesView invoices={invoices} onRefresh={fetchInvoices} userRole={userRole} addToast={addToast} />}
          {activeTab === 'analytics' && <AnalyticsView stats={totalStats} invoices={invoices} />}
          {activeTab === 'search' && <SearchView addToast={addToast} />}
          {activeTab === 'inquiry' && <InquiryView addToast={addToast} />}
        </div>
      </main>
    </div>
  );
};

const InquiryView = () => {
  const [target, setTarget] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deepSearch, setDeepSearch] = useState(false);
  const [error, setError] = useState(null);

  const handleCheck = async () => {
    if (!target) return alert('يرجى إدخال الرابط أو الكود');
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await axios.post(`${API_BASE}/invoices/check_status/`, {
        url: target,
        deep_search: deepSearch
      });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ في الاستعلام');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>نظام الاستعلام المزدوج</h1>
        <p style={{ color: 'var(--text-muted)' }}>ابحث في سجلاتنا وفي منظومة الحوكمة الخارجية (eFinance)</p>
      </header>

      <div className="premium-card">
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              placeholder="ضع رابط الفاتورة أو الـ UUID الخاص بها هنا..."
              style={{ flex: 1 }}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <button className="btn-primary" onClick={handleCheck} disabled={loading}>
              {loading ? 'جاري الفحص المزدوج...' : 'فحص الحالة'}
            </button>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={deepSearch}
              onChange={e => setDeepSearch(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '0.9rem' }}>تفعيل البحث العميق في المنظومة الخارجية (Deep Inquiry)</span>
          </label>
        </div>
      </div>

      {data && (
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', marginTop: '2rem' }}>
          <History size={20} color="var(--primary)" />
          نتائج الاستعلام
        </h2>
      )}
      <div className="form-grid">
        <div className="premium-card animate-fade-in" style={{ borderTop: data?.local?.found_locally ? '4px solid #22c55e' : '1px solid var(--glass-border)' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LayoutDashboard size={20} color="var(--primary)" /> السجل المحلي
          </h3>
          {data?.local ? (
            data.local.found_locally ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '0.8rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', border: '1px solid #22c55e' }}>
                  <p style={{ color: '#22c55e', fontWeight: '700', fontSize: '0.9rem' }}>تم العثور: مسجلة محلياً</p>
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <p><span style={{ color: 'var(--text-muted)' }}>الحالة:</span> {data.local.status}</p>
                  <p><span style={{ color: 'var(--text-muted)' }}>الجهة:</span> {data.local.governed_by}</p>
                  <p><span style={{ color: 'var(--text-muted)' }}>التاريخ:</span> {data.local.governance_date}</p>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>لا يوجد سجل لهذه الفاتورة محلياً.</p>
            )
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>بانتظار بدء الفحص...</p>
          )}
        </div>

        <div className="premium-card animate-fade-in" style={{ borderTop: data?.external?.status === 'success' ? '4px solid #eab308' : '1px solid var(--glass-border)' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} color="#eab308" /> منظومة eFinance
          </h3>
          {data?.external ? (
            data.external.status === 'success' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  padding: '0.8rem',
                  background: data.external.external_status === 'accepted' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                  borderRadius: '12px',
                  border: `1px solid ${data.external.external_status === 'accepted' ? '#22c55e' : '#eab308'}`
                }}>
                  <p style={{ color: data.external.external_status === 'accepted' ? '#22c55e' : '#eab308', fontWeight: '700', fontSize: '0.9rem' }}>
                    الحالة: {data.external.external_status === 'accepted' ? 'مقبولة' : data.external.external_status === 'rejected' ? 'مرفوضة' : 'غير مكتشفة'}
                  </p>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>رقم التسجيل: {data.external.rin}</p>
              </div>
            ) : (
              <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{data.external.message || 'فشل الفحص الخارجي'}</p>
            )
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{deepSearch ? 'جاري الفحص العميق...' : 'البحث العميق غير مفعل'}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="premium-card" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
          {error}
        </div>
      )}
    </div>
  );
};

const SearchView = () => {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState({ rin: '', invoice_id: '', status: '' });
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.rin) params.append('rin', query.rin);
      if (query.invoice_id) params.append('invoice_id', query.invoice_id);
      if (query.status) params.append('status', query.status);

      const response = await axios.get(`${API_BASE}/invoices/?${params.toString()}`);
      setResults(response.data);
    } catch (error) {
      alert('خطأ في البحث');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>البحث المتقدم</h1>
        <p style={{ color: 'var(--text-muted)' }}>استعلم عن الفواتير بكل دقة</p>
      </header>

      <div className="premium-card">
        <div className="form-grid">
          <div className="input-group">
            <label>رقم التسجيل الضريبي</label>
            <input
              type="text"
              placeholder="مثال: 123456789"
              value={query.rin}
              onChange={e => setQuery({ ...query, rin: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label>رقم الفاتورة (UUID)</label>
            <input
              type="text"
              placeholder="ابحث برقم الفاتورة..."
              value={query.invoice_id}
              onChange={e => setQuery({ ...query, invoice_id: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label>الحالة</label>
            <select
              value={query.status}
              onChange={e => setQuery({ ...query, status: e.target.value })}
            >
              <option value="">الكل</option>
              <option value="accepted">مقبولة</option>
              <option value="rejected">مرفوضة</option>
              <option value="processing">قيد المعالجة</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={handleSearch} disabled={loading}>
            {loading ? 'جاري البحث...' : 'بدء البحث'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="premium-card">
          <h3>نتائج البحث ({results.length})</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.5rem' }}>رقم الفاتورة</th>
                <th style={{ padding: '0.5rem' }}>الشركة</th>
                <th style={{ padding: '0.5rem' }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {results.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem' }}>{inv.invoice_id}</td>
                  <td style={{ padding: '1rem' }}>{inv.company_name}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`status-badge status-${inv.status}`}>
                      {inv.status === 'accepted' ? 'مقبولة' : 'أخرى'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AnalyticsView = ({ stats, invoices }) => {
  const pieData = [
    { name: 'مجمدة', value: stats.frozen, color: '#ef4444' },
    { name: 'مقبولة', value: stats.accepted, color: '#22c55e' },
    { name: 'بانتظار الحوكمة', value: stats.pending, color: '#fbbf24' },
    { name: 'مرفوضة', value: stats.rejected, color: '#64748b' }
  ].filter(d => d.value > 0);

  const barData = [
    { name: 'مجمدة', count: stats.frozen },
    { name: 'مقبولة', count: stats.accepted },
    { name: 'بانتظار', count: stats.pending }
  ];

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>التقارير والتحليلات 📊</h1>
        <p style={{ color: 'var(--text-muted)' }}>نظرة شاملة على أداء المنظومة وحالة الفواتير</p>
      </header>

      <div className="form-grid" style={{ marginBottom: '3rem' }}>
        <div className="premium-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>توزيع حالات الفواتير</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>معدلات الحوكمة</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="premium-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>أحدث الفواتير المسجلة</h3>
          <TrendingUp color="var(--primary)" size={20} />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <th style={{ padding: '1rem' }}>رقم الفاتورة</th>
                <th style={{ padding: '1rem' }}>الشركة</th>
                <th style={{ padding: '1rem' }}>الحالة</th>
                <th style={{ padding: '1rem' }}>تاريخ الإضافة</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 5).map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--glass-border)', fontSize: '0.85rem' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{inv.invoice_id}</td>
                  <td style={{ padding: '1rem' }}>{inv.company_name}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`status-badge status-${inv.status}`}>
                      {inv.status === 'frozen' ? 'مجمدة 🔒' : inv.status === 'accepted' ? 'مقبولة ✅' : inv.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                    {new Date(inv.created_at).toLocaleString('ar-EG')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DashboardView = ({ invoices, onRefresh, userRole, addToast, stats }) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [urlList, setUrlList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const addToQueue = () => {
    if (!currentUrl.trim()) return;
    if (urlList.includes(currentUrl.trim())) return addToast('هذا الرابط مضاف مسبقاً', 'warning');
    setUrlList([...urlList, currentUrl.trim()]);
    setCurrentUrl('');
    addToast('تمت إضافة الرابط لقائمة الانتظار', 'success');
  };

  const removeFromQueue = (url) => {
    setUrlList(urlList.filter(u => u !== url));
  };


  const startBatchGovernance = async () => {
    if (urlList.length === 0) return addToast('يرجى إضافة روابط للقائمة أولاً', 'warning');
    setLoading(true);
    setResults(urlList.map(u => ({ url: u, status: 'pending', message: 'في الانتظار...' })));

    for (let i = 0; i < urlList.length; i++) {
      const currentUrlVal = urlList[i];
      setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'processing', message: 'جاري البحث...' } : r));
      try {
        const response = await axios.post(`${API_BASE}/invoices/start_governance/`, { url: currentUrlVal });
        const resultCode = response.data.result_code;
        addToast(response.data.message, resultCode === 'already_frozen' ? 'warning' : 'success');
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: resultCode === 'already_frozen' ? 'warning' : 'success', message: response.data.message } : r));
      } catch (error) {
        const isNotFound = error.response?.status === 404;
        addToast(isNotFound ? 'لم يسفر البحث عن شيء' : 'خطأ فني', 'error');
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'error', message: isNotFound ? 'لم يسفر البحث عن شيء' : '❌ خطأ' } : r));
      }
      onRefresh();
    }
    setLoading(false);
    setUrlList([]); // Clear queue after finish
  };

  const [processedMobileIds, setProcessedMobileIds] = React.useState(new Set());

  React.useEffect(() => {
    const pollMobile = async () => {
      try {
        const response = await axios.get(`${API_BASE}/mobile-sync/pull/`);
        if (response.data && response.data.length > 0) {
          // Use ref or functional state to check against current set without making it a dependency
          setProcessedMobileIds(prevSet => {
            const newItems = response.data.filter(item => !prevSet.has(item.id));
            if (newItems.length > 0) {
              const newUrls = newItems.map(item => item.url);
              const newIds = newItems.map(item => item.id);

              setUrlList(prevUrls => {
                const uniqueUrls = newUrls.filter(u => !prevUrls.includes(u));
                if (uniqueUrls.length > 0) {
                  addToast(`تم استلام ${uniqueUrls.length} روابط جديدة من الموبايل`, 'success');
                  return [...prevUrls, ...uniqueUrls];
                }
                return prevUrls;
              });

              return new Set([...prevSet, ...newIds]);
            }
            return prevSet;
          });
        }
      } catch (e) { console.error("Polling error", e); }
    };
    const interval = setInterval(pollMobile, 2000);
    return () => clearInterval(interval);
  }, [addToast]);

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>لوحة القيادة الذكية</h1>
          <p style={{ color: 'var(--text-muted)' }}>متابعة فورية لنشاط الحوكمة والتجميدات</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="premium-card" style={{ padding: '10px 20px', margin: 0, textAlign: 'center' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>إجمالي اليوم</p>
            <p style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>{invoices.length}</p>
          </div>
        </div>
      </header>

      <div className="form-grid" style={{ marginBottom: '3rem' }}>
        <div className="premium-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>مقبولة (جاهزة)</p><h2>{stats.accepted}</h2></div>
            <CheckCircle2 color="#22c55e" size={24} />
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', marginTop: '15px' }}>
            <div style={{ width: `${(stats.accepted / stats.total || 0) * 100}%`, height: '100%', background: '#22c55e' }}></div>
          </div>
        </div>
        <div className="premium-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>مجمدة (مؤمنة)</p><h2>{stats.frozen}</h2></div>
            <ShieldCheck color="#ef4444" size={24} />
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '15px' }}>
            <div style={{ width: `${(stats.frozen / stats.total || 0) * 100}%`, height: '100%', background: '#ef4444' }}></div>
          </div>
        </div>
        <div className="premium-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>بانتظار الحوكمة</p><h2>{stats.pending}</h2></div>
            <Clock color="#fbbf24" size={24} />
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '1px' }}>
            <div style={{ width: `${(stats.pending / stats.total || 0) * 100}%`, height: '100%', background: '#fbbf24' }}></div>
          </div>
        </div>
      </div>

      <div className="form-grid">
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
          <Smartphone size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>المزامنة مع الموبايل</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>امسح الكود لتوصيل هاتفك وإرسال الروابط فوراً</p>
          <div style={{ background: 'white', padding: '10px', borderRadius: '15px', marginBottom: '1rem' }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${API_BASE}/mobile-sync/push_page/`)}`}
              alt="Mobile Sync QR"
              style={{ width: '120px', height: '120px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: 'var(--primary)' }}>
              <div className="dot" style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></div>
              <span>المنظومة تستمع للروابط (HTTP)</span>
            </div>
            <button
              onClick={async () => {
                const res = await axios.get(`${API_BASE}/mobile-sync/pull/`);
                if (res.data.length > 0) {
                  const newUrls = res.data.map(item => item.url);
                  setUrlList(prev => [...new Set([...prev, ...newUrls])]);
                  addToast(`تم جلب ${res.data.length} روابط`, 'success');
                } else {
                  addToast('لا توجد روابط جديدة حالياً', 'info');
                }
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.65rem', textDecoration: 'underline', cursor: 'pointer' }}
            >
              تحديث يدوي الآن
            </button>
          </div>
          <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '8px' }}>Server: {API_URL.replace(/^https?:\/\//, '')}</p>
        </div>

        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Layers size={18} /> تجميع الروابط للحوكمة</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={currentUrl}
              onChange={e => setCurrentUrl(e.target.value)}
              placeholder="ضع رابط الفاتورة هنا..."
              style={{ flex: 1 }}
              onKeyPress={e => e.key === 'Enter' && addToQueue()}
            />
            <button onClick={addToQueue} className="btn-primary" style={{ padding: '12px', minWidth: '45px' }}>
              <Plus size={20} />
            </button>
          </div>
          <div style={{
            minHeight: '120px',
            maxHeight: '250px',
            overflowY: 'auto',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            padding: '10px'
          }}>
            {urlList.length === 0 ? (
              <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                القائمة فارغة.. أضف روابط للبدء
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {urlList.map((url, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    fontSize: '0.75rem'
                  }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{url}</span>
                    <Trash2 size={14} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => removeFromQueue(url)} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            className="btn-primary"
            onClick={startBatchGovernance}
            disabled={loading || urlList.length === 0}
            style={{ width: '100%', opacity: (loading || urlList.length === 0) ? 0.6 : 1 }}
          >
            {loading ? 'جاري التنفيذ...' : `بدء حوكمة القائمة (${urlList.length})`}
          </button>
          {results.length > 0 && (
            <div style={{ marginTop: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
              {results.map((r, i) => (
                <div key={i} style={{ fontSize: '0.7rem', padding: '8px', borderBottom: '1px solid var(--glass-border)', color: r.status === 'error' ? '#ef4444' : r.status === 'warning' ? '#fbbf24' : '#22c55e', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {r.status === 'success' ? <CheckCircle2 size={12} /> : r.status === 'error' ? <XCircle size={12} /> : <AlertCircle size={12} />}
                  {r.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SetupView = ({ userRole, addToast }) => {
  const handleLaunch = async () => {
    try {
      const response = await axios.post(`${API_BASE}/invoices/launch_session/`);
      addToast(response.data.message, 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'فشل بدء الجلسة', 'error');
    }
  };
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}><h1>إعدادات الربط</h1></header>
      {(userRole === 'Admin' || userRole === 'Supervisor') ? (
        <div className="premium-card" style={{ border: '1px solid var(--primary)', background: 'rgba(0, 242, 254, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><h3>تفعيل الجلسة اليومية</h3><p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>يجب تسجيل الدخول بالـ OTP لبدء العمل.</p></div>
            <button onClick={handleLaunch} className="btn-primary"><Power size={18} /> ابدأ الجلسة</button>
          </div>
        </div>
      ) : (
        <div className="premium-card" style={{ opacity: 0.7, border: '1px dashed var(--text-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ color: 'var(--text-muted)' }}>تفعيل الجلسة اليومية</h3>
              <p style={{ fontSize: '0.8rem', color: '#ef4444' }}>⚠️ هذه الخاصية متاحة للمشرفين والمدراء فقط.</p>
            </div>
            <button disabled className="btn-primary" style={{ background: '#334155', cursor: 'not-allowed' }}>
              <Power size={18} /> غير مصرح
            </button>
          </div>
        </div>
      )}
      <div className="premium-card">
        <div className="form-grid">
          <div className="input-group"><label>رابط الدخول</label><input type="text" readOnly value="https://auth.efinance.com.eg/..." /></div>
          <div className="input-group"><label>رابط الحوكمة</label><input type="text" readOnly value="https://gfn-spgs.efinance.com.eg/..." /></div>
        </div>
      </div>
    </div>
  );
};

const Setup2FAView = ({ onComplete, onBack }) => {
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
      const response = await axios.get(`${API_BASE}/auth/setup-2fa/`);
      setQrData(response.data);
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
    if (e) e.preventDefault();
    setError('');
    setVerifying(true);
    try {
      const resp = await axios.post(`${API_BASE}/auth/setup-2fa/`, { otp_code: otpCode });
      if (resp.data.status === 'SUCCESS') {
        onComplete(resp.data.tokens);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP code');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading Setup...</div>;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-dark)', padding: '20px' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="premium-card" style={{ maxWidth: '700px', width: '100%', padding: '2.5rem' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
          <ChevronLeft size={18} /> العودة لتسجيل الدخول
        </button>
        <h2 style={{ textAlign: 'center', marginBottom: '2.5rem', fontWeight: '800' }}>إعداد المصادقة الثنائية (2FA)</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '3rem',
          alignItems: 'start',
          padding: '1rem'
        }}>
          <div>
            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><QrCode size={18} /> خطوة 1: امسح الكود</h4>
            {qrData && (
              <div style={{ background: 'white', padding: '10px', borderRadius: '10px', marginBottom: '1rem' }}>
                <img src={qrData.qr_code} alt="QR" style={{ width: '100%' }} />
              </div>
            )}
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>أو أدخل الكود يدوياً:</p>
            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
              <code style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: '5px', flex: 1, overflow: 'hidden' }}>{qrData?.secret}</code>
              <button onClick={handleCopySecret} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
              </button>
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckIcon size={18} /> خطوة 2: تأكيد الرمز</h4>
            <div className="input-group">
              <label style={{ fontSize: '0.8rem' }}>أدخل الرمز المكون من 6 أرقام</label>
              <input
                type="text"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '5px' }}
                placeholder="000000"
              />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '10px' }}>{error}</p>}
            <button
              className="btn-primary"
              style={{ width: '100%', marginTop: '1.5rem' }}
              onClick={handleVerify}
              disabled={verifying || otpCode.length !== 6}
            >
              {verifying ? 'جاري التفعيل...' : 'تفعيل المصادقة'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const VerifyOTPView = ({ onComplete, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pushStatus, setPushStatus] = useState(null);
  const inputRefs = useRef([]);
  const pollInterval = useRef(null);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    return () => { if (pollInterval.current) clearInterval(pollInterval.current); };
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== '') && index === 5) handleVerify(newOtp.join(''));
  };

  const handleVerify = async (code) => {
    setError('');
    setLoading(true);
    try {
      const resp = await axios.post(`${API_BASE}/auth/verify-2fa/`, { otp_code: code || otp.join('') });
      if (resp.data.status === 'SUCCESS') {
        onComplete(resp.data.tokens);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'رمز غير صحيح');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const handlePushAuth = async () => {
    setPushStatus('PENDING');
    try {
      const resp = await axios.post(`${API_BASE}/auth/push-auth/initiate/`);
      const reqId = resp.data.request_id;
      pollInterval.current = setInterval(async () => {
        try {
          const statusResp = await axios.get(`${API_BASE}/auth/push-auth/status/${reqId}/`);
          if (statusResp.data.status === 'APPROVED') {
            clearInterval(pollInterval.current);
            setPushStatus('APPROVED');
            setTimeout(() => onComplete(statusResp.data.tokens), 1000);
          } else if (statusResp.data.status === 'DENIED') {
            clearInterval(pollInterval.current);
            setPushStatus('DENIED');
            setTimeout(() => setPushStatus(null), 2000);
          }
        } catch (e) { }
      }, 2000);
    } catch (e) {
      setError('فشل بدء المصادقة اللحظية');
      setPushStatus(null);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-dark)', padding: '20px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card"
        style={{ width: '100%', maxWidth: '450px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 8px 16px rgba(0, 242, 254, 0.2)'
          }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '0.5rem' }}>تأكيد الهوية</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>أدخل الرمز أو استخدم تطبيق الموبايل</p>
        </div>

        <AnimatePresence mode="wait">
          {pushStatus === 'PENDING' ? (
            <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div className="loader" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
              <p>برجاء فحص هاتفك والضغط على "سماح"</p>
              <button onClick={() => { clearInterval(pollInterval.current); setPushStatus(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', textDecoration: 'underline', marginTop: '1rem', cursor: 'pointer' }}>إلغاء والمحاولة بالرمز</button>
            </motion.div>
          ) : pushStatus === 'APPROVED' ? (
            <motion.div key="success" initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle2 color="#22c55e" size={50} style={{ margin: '0 auto 1rem' }} />
              <p>تم قبول الدخول! جاري التحويل...</p>
            </motion.div>
          ) : (
            <div key="otp" style={{ padding: '0 20px' }}>
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginBottom: '2.5rem' }}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    maxLength={1}
                    value={d}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => { if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1].focus(); }}
                    style={{ width: '45px', height: '55px', textAlign: 'center', fontSize: '1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white' }}
                  />
                ))}
              </div>
              {error && <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
              <button className="btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading || otp.some(d => !d)} onClick={() => handleVerify()}>
                {loading ? 'جاري التحقق...' : 'تأكيد الرمز'}
              </button>

              <div style={{ position: 'relative', margin: '2.5rem 0', textAlign: 'center' }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--glass-border)' }}></div>
                <span style={{ position: 'relative', background: '#1e293b', padding: '0 16px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600' }}>أو استخدم تطبيق الموبايل</span>
              </div>

              <button
                onClick={handlePushAuth}
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}
              >
                <SmartphoneIcon size={20} color="var(--primary)" />
                إرسال طلب موافقة للموبايل
              </button>
            </div>
          )}
        </AnimatePresence>

        <button onClick={onBack} style={{ display: 'block', margin: '2rem auto 0', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>العودة لتسجيل الدخول</button>
      </motion.div>
    </div>
  );
};
const InvoicesView = ({ invoices, onRefresh, userRole, addToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAudit, setShowAudit] = useState(null);

  const handleAction = async (id, action) => {
    try {
      const response = await axios.post(`${API_BASE}/invoices/${id}/${action}/`);
      addToast(response.data.message, 'success');
      onRefresh();
    } catch (err) {
      addToast(err.response?.data?.error || 'خطأ', 'error');
    }
  };

  const filtered = invoices.filter(inv =>
    inv.invoice_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>سجل الفواتير الذكي</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => window.open(`${API_BASE}/invoices/export_csv/`, '_blank')} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '5px 12px' }}>
              <Download size={14} /> تصدير CSV
            </button>
            <button onClick={() => window.open(`${API_BASE}/invoices/export_excel/`, '_blank')} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '5px 12px' }}>
              <Download size={14} /> تصدير Excel
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', right: '10px', top: '10px', color: 'var(--text-muted)' }} size={18} />
            <input type="text" placeholder="بحث سريع..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingRight: '35px', width: '250px' }} />
          </div>
          <button className="btn-primary" onClick={onRefresh}><RefreshCcw size={16} /></button>
        </div>
      </header>
      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1.2rem' }}>رقم الفاتورة</th>
              <th>الشركة</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
              <th>التفاصيل</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id} className={inv.status === 'frozen' ? 'row-frozen' : ''} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{inv.invoice_id}</td>
                <td>{inv.company_name}</td>
                <td><span className={`status-badge status-${inv.status}`}>{inv.status === 'accepted' ? 'مقبولة' : inv.status === 'frozen' ? 'مجمدة' : inv.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {inv.status !== 'frozen' && (userRole === 'DataEntry' || userRole === 'Admin') && (
                      <button onClick={() => handleAction(inv.id, 'freeze')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer' }}><ShieldCheck size={14} /> تجميد</button>
                    )}
                    {inv.status === 'frozen' && (userRole === 'Supervisor' || userRole === 'Admin') && (
                      <button onClick={() => handleAction(inv.id, 'unfreeze')} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer' }}><Info size={14} /> فك التجميد</button>
                    )}
                  </div>
                </td>
                <td><button onClick={() => setShowAudit(inv)} style={{ background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer' }}><History size={14} /> سجل العمليات</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAudit && (
        <div className="modal-overlay" onClick={() => setShowAudit(null)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3>سجل تاريخ الفاتورة: {showAudit.invoice_id}</h3>
              <XCircle style={{ cursor: 'pointer' }} onClick={() => setShowAudit(null)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>آخر تحديث</p>
                <p style={{ fontWeight: 'bold' }}>{new Date(showAudit.updated_at).toLocaleString('ar-EG')}</p>
              </div>
              {showAudit.frozen_by_name && (
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <p style={{ fontSize: '0.8rem', color: '#f87171' }}>تم التجميد بواسطة</p>
                  <p style={{ fontWeight: 'bold' }}>{showAudit.frozen_by_name}</p>
                </div>
              )}
              {showAudit.unfrozen_by_name && (
                <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <p style={{ fontSize: '0.8rem', color: '#4ade80' }}>تم فك التجميد بواسطة</p>
                  <p style={{ fontWeight: 'bold' }}>{showAudit.unfrozen_by_name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LoginView = ({ onProceed }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(AUTH_URL, { username, password });
      onProceed(response.data.status, response.data, username);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'خطأ في الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-dark)', padding: '20px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="premium-card"
        style={{ width: '100%', maxWidth: '450px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 8px 16px rgba(0, 242, 254, 0.2)'
          }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', background: 'linear-gradient(to right, white, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>تسجيل الدخول</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>نظام حوكمة وإدارة الفواتير</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', marginBottom: '2rem', border: '1px solid var(--glass-border)' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '12px', color: 'var(--primary)', fontSize: '0.85rem' }}>حسابات النظام المتاحة:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 20px', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: '600' }}>المدير العام:</span>
            <span style={{ color: 'var(--text-muted)' }}>admin / admin</span>
            <span style={{ fontWeight: '600' }}>المشرف:</span>
            <span style={{ color: 'var(--text-muted)' }}>supervisor / super123</span>
            <span style={{ fontWeight: '600' }}>مدخل البيانات:</span>
            <span style={{ color: 'var(--text-muted)' }}>data_entry / entry123</span>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ color: '#ef4444', marginBottom: '1.5rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.08)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem' }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="اسم المستخدم"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                style={{ width: '100%', padding: '14px 16px', paddingRight: '44px' }}
              />
              <User size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>
          <div className="input-group">
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '14px 16px', paddingRight: '44px' }}
              />
              <Lock size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '14px', fontSize: '1rem', marginTop: '0.5rem' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <RefreshCcw size={18} className="animate-spin" />
                جاري التحقق...
              </div>
            ) : 'دخول المنظومة'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default App;
