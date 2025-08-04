import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Bar } from 'react-chartjs-2';

// import the other views
import RecentUploads from '../components/RecentUploads';
import SavedAnalyses  from '../components/SavedAnalyses';
import Profile        from '../components/Profile';
import Upload         from './Upload';        // your Upload page/component

// small reusable KPI card
const MetricCard = ({ icon, label, value }) => (
  <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-gray-500 mt-1">{label}</div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user'));
  
  // ─── state ──────────────────────────────────────────────
  const [history, setHistory]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [active, setActive]             = useState('Dashboard');
  // ────────────────────────────────────────────────────────

  // ─── fetch history ──────────────────────────────────────
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${process.env.REACT_APP_API}/history/${user.id}`,
          { headers:{ Authorization:`Bearer ${token}` } }
        );
        setHistory(res.data.history || []);
      } catch {
        setError('Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user.id]);
  // ────────────────────────────────────────────────────────

  // ─── compute metrics ────────────────────────────────────
  const totalUploads    = history.length;
  const totalRows       = history.reduce((sum,h)=>sum+(h.rows||0),0);
  const lastUpload      = history[0]?.uploadDate 
                           ? new Date(history[0].uploadDate).toLocaleDateString() 
                           : 'N/A';
  const savedAnalyses   = history.filter(h=>h.chartType).length;
  const avgRows         = totalUploads ? Math.round(totalRows/totalUploads) : 0;
  const totalSizeKB     = ((history.reduce((s,h)=>s+(h.fileSize||0),0)/1024) || 0).toFixed(2);
  const now             = new Date();
  const thisWeekUploads = history.filter(h=>{
    const d=new Date(h.uploadDate); 
    return (now-d)/(1000*60*60*24)<=7;
  }).length;
  const thisMonthUploads= history.filter(h=>{
    const d=new Date(h.uploadDate);
    return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  }).length;
  // ────────────────────────────────────────────────────────

  // ── prepare trend chart (uploads per day) ──────────────
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  const uploadsPerDay = days.map(day=>{
    return history.filter(h=>{
      const d=new Date(h.uploadDate).toLocaleDateString('en-US',{month:'short',day:'numeric'});
      return d===day;
    }).length;
  });
  const trendData = { labels:days, datasets:[{ data:uploadsPerDay, backgroundColor:'#3b82f6' }] };
  // ────────────────────────────────────────────────────────

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  // ─── Delete saved-analysis handler ────────────────────────────────
  const handleDeleteHistory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.REACT_APP_API}/history/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // remove deleted record from state
      setHistory(prev => prev.filter(h => h._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete, please try again.');
    }
  };
  // ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar active={active} setActive={setActive}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* header */}
        <header className="flex items-center justify-between bg-white shadow px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{user?.name || user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-6 py-8">
          {/* ─── Dashboard tab ──────────────────────────────────────────── */}
          {active === 'Dashboard' && (
            <>
              {/* KPI grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard icon="📁" label="Total Uploads"      value={totalUploads} />
                <MetricCard icon="🔢" label="Total Rows"         value={totalRows} />
                <MetricCard icon="📆" label="Last Upload Date"   value={lastUpload} />
                <MetricCard icon="💾" label="Saved Analyses"     value={savedAnalyses} />
                <MetricCard icon="📈" label="Avg Rows/Upload"    value={avgRows} />
                <MetricCard icon="📦" label="Total Size (KB)"    value={totalSizeKB} />
                <MetricCard icon="📅" label="Uploads This Week"  value={thisWeekUploads} />
                <MetricCard icon="🗓️" label="Uploads This Month" value={thisMonthUploads} />
              </div>

              {/* two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* recent uploads */}
                <section className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Recent Uploads</h2>
                  {loading ? (
                    <p className="text-gray-500">Loading...</p>
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left">File</th>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Rows</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {history.slice(0,5).map((h,i)=>
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-2">{h.fileName}</td>
                              <td className="px-4 py-2">
                                {new Date(h.uploadDate).toLocaleDateString()||'N/A'}
                              </td>
                              <td className="px-4 py-2">{h.rows ?? 'N/A'}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                {/* uploads trend & quick actions */}
                <aside className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Uploads Trend</h2>
                    <Bar data={trendData} options={{ plugins:{ legend:{ display:false } } }} />
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="flex flex-col space-y-3">
                      <button
                        onClick={()=>navigate('/upload')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-left"
                      >
                        📤 Upload New File
                      </button>
                      <button
                        onClick={()=>navigate('/history')}
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-left"
                      >
                        📁 View All Files
                      </button>
                      <button
                        onClick={()=>navigate('/saved-analyses')}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded text-left"
                      >
                        💾 Saved Analyses
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}

          {/* ─── Upload File tab ───────────────────────────────────────── */}
          {active === 'Upload File' && (
            <Upload />
          )}

          {/* ─── My Files tab ──────────────────────────────────────────── */}
          {active === 'My Files' && (
            <RecentUploads history={history}/>
          )}

          {/* ─── Saved Analyses tab ───────────────────────────────────── */}
          {active === 'Saved Analyses' && (
            <SavedAnalyses history={history} onDelete={handleDeleteHistory}/>
          )}

          {/* ─── Profile tab ───────────────────────────────────────────── */}
          {active === 'Profile' && (
            <Profile user={user}/>
          )}
        </main>
      </div>
    </div>
  );
}
