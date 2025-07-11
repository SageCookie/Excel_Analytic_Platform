import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,PointElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement,PointElement, ArcElement, Title, Tooltip, Legend);

function Dashboard() {
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartType, setChartType] = useState('bar');

  // handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
      setExcelData(data);

      if (data.length > 0) {
        setColumns(Object.keys(data[0]));
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

  // Clear dashboard handler
  const handleClear = () => {
    setExcelData([]);
    setColumns([]);
    setXAxis('');
    setYAxis('');
  };

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold mb-4">📊 Dashboard: Upload & Visualize Excel Data</h2>

      {/* Upload & Clear */}
      <div className="flex items-center gap-4 mb-4">
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="mb-0" />
        <button
          onClick={handleClear}
          className="bg-gray-300 text-gray-800 px-3 py-1 rounded"
        >
          Clear
        </button>
      </div>

      {/* Show dropdowns if columns found */}
      {columns.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <select
            value={xAxis}
            onChange={e => setXAxis(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">Select X-axis</option>
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>

          <select
            value={yAxis}
            onChange={e => setYAxis(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">Select Y-axis</option>
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>

          {/* Chart type dropdown */}
          <select
            value={chartType}
            onChange={e => setChartType(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
          </select>
        </div>
      )}

      {/* Show chart only when both axes are selected */}
      {(xAxis && yAxis) && (
        <div>
          <h3 className="text-xl font-semibold mb-2">
            {chartType.toUpperCase()} Chart: {yAxis} vs {xAxis}
          </h3>
          <div id="chartContainer" className="bg-white p-4 rounded shadow max-w-4xl">
            {chartType === 'bar' && <Bar data={chartData} />}
            {chartType === 'line' && <Line data={chartData} />}
            {chartType === 'pie' && <Pie data={chartData} />}
          </div>
          <div className="flex space-x-4 mt-2">
            <button onClick={exportAsImage} className="bg-green-600 text-white px-3 py-1 rounded">Export PNG</button>
            <button onClick={exportAsPDF} className="bg-red-600 text-white px-3 py-1 rounded">Export PDF</button>
          </div>
        </div>
      )}

      {/* Show raw data preview (optional, for debug) */}
      {excelData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border mt-6">
            <thead className="bg-gray-200">
              <tr>
                {columns.map(col => (
                  <th key={col} className="px-2 py-1 border">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {excelData.slice(0, 5).map((row, i) => (
                <tr key={i}>
                  {columns.map(col => (
                    <td key={col} className="px-2 py-1 border">{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-xs text-gray-500 mt-1">Showing first 5 rows</div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
