import React, { useState, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import PageContainer from '../components/PageContainer';
import RecentUploads from '../components/RecentUploads';
import { Bar, Line, Pie, Doughnut, PolarArea, Radar } from 'react-chartjs-2';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

// ─── Register Chart.js scales, elements & controllers ─────────────────
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  DoughnutController,
  PolarAreaController,
  RadarController,
} from 'chart.js';

ChartJS.register(
  // controllers
  DoughnutController,
  PolarAreaController,
  RadarController,
  // elements & scales
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  // plugins
  Title,
  Tooltip,
  Legend
);
// ────────────────────────────────────────────────────────────────

export default function Upload({ history }) {
  const [file, setFile]             = useState(null);
  const [message, setMessage]       = useState('');
  const [columns, setColumns]       = useState([]);
  const [jsonData, setJsonData]     = useState([]);
  const [xAxis, setXAxis]           = useState('');
  const [yAxis, setYAxis]           = useState('');
  const [chartType, setChartType]   = useState('bar');
  const [previewData, setPreviewData] = useState(null);
  const [uploading, setUploading]   = useState(false);

  // parse Excel file to JSON + extract columns
  const parseFile = f => {
    const reader = new FileReader();
    reader.onload = e => {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      setJsonData(json);
      if (json.length) setColumns(Object.keys(json[0]));
    };
    reader.readAsArrayBuffer(f);
  };

  const handleChange = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setMessage('');
    parseFile(f);
  };

  const handleDrag   = useCallback(e => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDrop   = useCallback(e => {
    e.preventDefault(); e.stopPropagation();
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(f);
      setMessage('');
      parseFile(f);
    }
  }, []);

  // build chart data when user picks axes
  useEffect(() => {
    if (jsonData.length && xAxis && yAxis) {
      const labels = jsonData.map(r => r[xAxis]);
      const data   = jsonData.map(r => r[yAxis]);

      // a palette of vibrant colors
      const baseColors = [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)'
      ];
      const borderColors = baseColors.map(c => c.replace(/0\.6\)$/, '1)'));

      setPreviewData({
        labels,
        datasets: [{
          label: yAxis,
          data,
          backgroundColor: labels.map((_, i) => baseColors[i % baseColors.length]),
          borderColor:      labels.map((_, i) => borderColors[i % borderColors.length]),
          borderWidth:      2,
          fill:             chartType === 'line' ? false : true,
          tension:          chartType === 'line' ? 0.4 : 0
        }]
      });
    }
  }, [jsonData, xAxis, yAxis, chartType]);

  // optionally send to backend
  const handleUpload = async () => {
    if (!file) {
      setMessage('⚠️ Please select a file first.');
      return;
    }
    setUploading(true);
    const token = localStorage.getItem('token');
    const form  = new FormData();
    form.append('file', file);
    form.append('xAxis', xAxis);
    form.append('yAxis', yAxis);
    form.append('chartType', chartType);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API}/upload`, form, {
        headers: { 'Content-Type':'multipart/form-data', Authorization:`Bearer ${token}` }
      });
      setMessage(`✅ ${res.data.message}`);
    } catch {
      setMessage('❌ Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const ChartComponent = ({ data }) => {
    if (!data) return null;

    const commonOptions = {
      responsive: true,
      plugins: { legend: { position: 'right' } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.1)' } },
        x: { grid: { color: 'rgba(0,0,0,0.1)' } }
      }
    };

    switch (chartType) {
      case 'line':
        return <Line
          data={data}
          options={{
            ...commonOptions,
            plugins: { legend: { display: false } },
            elements: { line: { borderWidth: 3, borderColor: '#3b82f6', tension: 0.3 }, point: { radius: 4 } }
          }}
        />;

      case 'pie':
        return <Pie
          data={data}
          options={{
            ...commonOptions,
            plugins: { legend: { position: 'left' }, tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed}` } } }
          }}
        />;

      case 'doughnut':
        return <Doughnut data={data} options={commonOptions} />;

      case 'polarArea':
        return <PolarArea data={data} options={commonOptions} />;

      case 'radar':
        return <Radar data={data} options={commonOptions} />;

      default:  // bar
        return <Bar
          data={data}
          options={{
            ...commonOptions,
            plugins: { legend: { display: false } },
            scales: { ...commonOptions.scales, x: { ...commonOptions.scales.x, barPercentage: 0.6, categoryPercentage: 0.5 } }
          }}
        />;
    }
  };

  return (
    <PageContainer title="Upload File">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Upload Form ───────────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-8 space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Select Your Excel File</h3>
          
          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center h-56 border-2 border-dashed rounded-lg 
              ${file ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'} 
              transition-colors`}
          >
            <input
              id="file-input"
              type="file"
              accept=".xls,.xlsx"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-2 pointer-events-none" />
            <p className="text-gray-600 pointer-events-none">
              {file ? file.name : 'Drag & drop, or click to browse'}
            </p>
          </div>

          {/* Axis & Chart Type Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                X-Axis Column
              </label>
              <select
                value={xAxis}
                onChange={e => setXAxis(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
              >
                <option value="">Choose column…</option>
                {columns.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Y-Axis Column
              </label>
              <select
                value={yAxis}
                onChange={e => setYAxis(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
              >
                <option value="">Choose column…</option>
                {columns.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chart Type
              </label>
              <select
                value={chartType}
                onChange={e => setChartType(e.target.value)}
                className="block w-full border-gray-300 rounded-md p-2"
              >
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="pie">Pie</option>
                <option value="doughnut">Doughnut</option>
                <option value="polarArea">Polar Area</option>
                <option value="radar">Radar</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => { setFile(null); setJsonData([]); setPreviewData(null); setMessage(''); }}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-700"
            >
              Clear
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !previewData}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>

          {/* Message */}
          {message && (
            <p className="mt-4 text-center text-sm text-gray-800">
              {message}
            </p>
          )}
        </div>

        {/* ─── Recent Uploads ───────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Uploads</h3>
          <RecentUploads history={history} limit={5} />
        </div>
      </div>

      {/* ─── Chart Preview ─────────────────────────────────────── */}
      {previewData && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Chart Preview</h3>
          <ChartComponent data={previewData} />
        </div>
      )}
    </PageContainer>
  );
}
