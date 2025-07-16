import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Sidebar from '../components/Sidebar'; // 🧩 remember to create Sidebar.js

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [history, setHistory] = useState([]);
  const [active, setActive] = useState('Dashboard'); // for sidebar navigation
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Fetch upload history
  const fetchHistory = async () => {
    setLoadingHistory(true);
    setHistoryError('');
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await axios.get(`http://localhost:5000/api/history/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data.history); // Note: backend returns { success, history }
    } catch (err) {
      setHistoryError('❌ Failed to fetch history');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // handle file upload
  const handleFileUpload = async (e) => {
    setUploadError('');
    const file = e.target.files[0];
    if (!file) {
      setUploadError('Please select a file.');
      return;
    }
    const allowedTypes = ['.xls', '.xlsx'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      setUploadError('Only .xls and .xlsx files are allowed.');
      return;
    }
    setUploading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
        setExcelData(data);

        if (data.length > 0) {
          setColumns(Object.keys(data[0]));
        }

        // Save upload history
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        await axios.post('http://localhost:5000/api/history/save', {
          userId: user.id,
          fileName: file.name,
          xAxis: '',
          yAxis: '',
          chartType: '',
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchHistory();
      } catch (err) {
        setUploadError('❌ Failed to upload or save history');
      } finally {
        setUploading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Export as PNG
  const exportAsImage = () => {
    const chartContainer = document.getElementById('chartContainer');
    html2canvas(chartContainer).then(canvas => {
      const link = document.createElement('a');
      link.download = 'chart.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  // Export as PDF
  const exportAsPDF = () => {
    const chartContainer = document.getElementById('chartContainer');
    html2canvas(chartContainer).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 10, 10, 180, 100); // Adjust size as needed
      pdf.save('chart.pdf');
    });
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Clear dashboard handler
  const handleClear = () => {
    setExcelData([]);
    setColumns([]);
    setXAxis('');
    setYAxis('');
  };

  // Save chart history
  const saveChartHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.post('http://localhost:5000/api/history/save', {
        userId: user.id,
        fileName: '', // You can store the file name if available
        xAxis,
        yAxis,
        chartType,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchHistory();
    } catch (err) {
      console.error('Failed to save chart history:', err);
    }
  };

  // Chart.js data with NaN protection
  const chartData = {
    labels: excelData.map(row => row[xAxis]),
    datasets: [
      {
        label: `${yAxis} vs ${xAxis}`,
        data: excelData.map(row => Number(row[yAxis]) || 0), // NaN protection
        backgroundColor: [
          'rgba(37, 99, 235, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(251, 191, 36, 0.6)',
          'rgba(239, 68, 68, 0.6)',
          'rgba(168, 85, 247, 0.6)'
        ],
      },
    ],
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar active={active} setActive={setActive} />
      
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Welcome, {user?.name || user?.email}!</h2>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
        </div>

        {/* Dashboard content based on sidebar */}
        {active === 'Dashboard' && (
          <>
            <h3 className="text-xl font-semibold mb-2">📈 Quick Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 shadow p-4 rounded text-center">
                <div className="text-xl font-bold">{history.length}</div>
                <div className="text-sm">Total Uploads</div>
              </div>
              {/* Add more summary cards here if needed */}
            </div>
          </>
        )}

        {active === 'Upload File' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">📤 Upload New Excel File</h3>
            <div className="flex items-center gap-4 mb-4">
              <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
              <button onClick={handleClear} className="bg-gray-300 text-gray-800 px-3 py-1 rounded">Clear</button>
            </div>
            {columns.length > 0 && (
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <select value={xAxis} onChange={e => setXAxis(e.target.value)} className="border px-3 py-2 rounded">
                  <option value="">Select X-axis</option>
                  {columns.map(col => <option key={col}>{col}</option>)}
                </select>
                <select value={yAxis} onChange={e => setYAxis(e.target.value)} className="border px-3 py-2 rounded">
                  <option value="">Select Y-axis</option>
                  {columns.map(col => <option key={col}>{col}</option>)}
                </select>
                <select value={chartType} onChange={e => setChartType(e.target.value)} className="border px-3 py-2 rounded">
                  <option value="bar">Bar</option>
                  <option value="line">Line</option>
                  <option value="pie">Pie</option>
                </select>
              </div>
            )}
            {(xAxis && yAxis) && (
              <>
                <div id="chartContainer" className="bg-white p-4 rounded shadow max-w-4xl">
                  {chartType === 'bar' && <Bar data={chartData} />}
                  {chartType === 'line' && <Line data={chartData} />}
                  {chartType === 'pie' && <Pie data={chartData} />}
                </div>
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={exportAsImage}
                    disabled={!xAxis || !yAxis}
                    className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                  >
                    Export PNG
                  </button>
                  <button onClick={exportAsPDF} className="bg-red-600 text-white px-3 py-1 rounded">Export PDF</button>
                  <button onClick={saveChartHistory} className="bg-blue-500 text-white px-3 py-1 rounded">Save Chart</button>
                </div>
              </>
            )}
            {uploading && <div className="text-blue-500 mb-2">Uploading file...</div>}
            {uploadError && <div className="text-red-500 mb-2">{uploadError}</div>}
          </div>
        )}

        {active === 'My Files' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">📂 My Uploaded Files</h3>
            {history.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No files uploaded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border mt-2">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-2 py-1 border">File</th>
                      <th className="px-2 py-1 border">Date</th>
                      <th className="px-2 py-1 border">Rows</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-1 border">{item.filename}</td>
                        <td className="px-2 py-1 border">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="px-2 py-1 border">{item.rows}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {loadingHistory && <div className="text-blue-500 mb-2">Loading history...</div>}
            {historyError && <div className="text-red-500 mb-2">{historyError}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
