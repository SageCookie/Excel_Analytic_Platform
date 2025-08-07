// src/components/SavedAnalyses.js
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import PageContainer from './PageContainer';
import {
  ArrowSmallUpIcon,
  ArrowSmallDownIcon,
  ArrowDownOnSquareIcon  // for Download
} from '@heroicons/react/24/outline';

// ─── Helpers ─────────────────────────────────────────────────────────
const formatDate = date =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

// Chart‐type icons for labels
const chartTypeIcons = {
  bar: '📊',
  line: '📈',
  pie: '🧮',
  doughnut: '🍩',
  polarArea: '🌐',
  radar: '📡'
};

// ─── Component ────────────────────────────────────────────────────────
export default function SavedAnalyses({ onView }) {
  const [list, setList]           = useState([]);
  const [search, setSearch]       = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortAsc, setSortAsc]     = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName]     = useState('');

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${process.env.REACT_APP_API}/analysis`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setList(res.data.analyses);
    })();
  }, []);

  // filter & sort
  const filtered = useMemo(() => {
    return list
      .filter(a =>
        a.historyId.fileName.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        let av, bv;
        if (sortField === 'fileName') {
          av = a.historyId.fileName.toLowerCase();
          bv = b.historyId.fileName.toLowerCase();
        } else if (sortField === 'chartType') {
          av = a.chartType.toLowerCase();
          bv = b.chartType.toLowerCase();
        } else {
          // createdAt
          av = new Date(a[sortField]).getTime();
          bv = new Date(b[sortField]).getTime();
        }
        if (av < bv) return sortAsc ? -1 : 1;
        if (av > bv) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [list, search, sortField, sortAsc]);

  const handleDelete = async id => {
    if (!window.confirm('Delete this saved analysis?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.REACT_APP_API}/analysis/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setList(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete analysis');
    }
  };

  // rename handler
  const handleRename = async id => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${process.env.REACT_APP_API}/analysis/${id}`,
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setList(list.map(a => a._id === id
        ? { ...a, historyId: { ...a.historyId, fileName: newName } }
        : a
      ));
      setEditingId(null);
    } catch (err) {
      console.error('Rename failed', err);
      alert('Could not rename analysis');
    }
  };

  // export handler (PNG/PDF)
  const handleExport = (id, fmt) => {
    window.open(
      `${process.env.REACT_APP_API}/analysis/${id}/export?format=${fmt}`,
      '_blank'
    );
  };

  // Empty state
  if (!filtered.length) {
    return (
      <PageContainer title="Saved Analyses">
        <div className="text-center py-16 text-gray-500">
          You haven’t saved any analyses yet.<br/>
          Go to <span className="font-medium">Upload File</span> to begin.
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Saved Analyses"
      className="flex-1 px-6 py-4"
    >
      <div className="flex flex-col h-full">
        {/* ─── Search & Sort ───────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 bg-white p-4 rounded-lg shadow">
          <input
            type="text"
            placeholder="🔎 Filter by filename…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200"
          />
          <select
            value={sortField}
            onChange={e => setSortField(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-200"
          >
            <option value="fileName">Name</option>
            <option value="createdAt">Date</option>
            <option value="chartType">Type</option>
          </select>
          <button
            onClick={() => setSortAsc(prev => !prev)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            title={`Toggle ${sortField} sort`}
          >
            {sortAsc
              ? <ArrowSmallUpIcon className="w-5 h-5 text-gray-600"/>
              : <ArrowSmallDownIcon className="w-5 h-5 text-gray-600"/>
            }
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ul className="space-y-4">
            {filtered.map(a => (
              <li
                key={a._id}
                className="flex flex-col sm:flex-row sm:justify-between p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  {editingId === a._id ? (
                    <>
                      <input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="border rounded px-2 py-1"
                      />
                      <button
                        onClick={() => handleRename(a._id)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-semibold truncate max-w-xs"
                          title={a.historyId.fileName}
                        >
                          {a.historyId.fileName}
                        </div>
                        <div className="text-sm text-gray-500">{formatDate(a.createdAt)}</div>
                      </div>
                      <span
                        className={`mt-2 sm:mt-0 inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          a.chartType === 'bar'     ? 'bg-blue-100 text-blue-800' :
                          a.chartType === 'line'    ? 'bg-green-100 text-green-800' :
                          a.chartType === 'pie'     ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                        title={a.chartType.charAt(0).toUpperCase() + a.chartType.slice(1)}
                      >
                        {chartTypeIcons[a.chartType] || ''}&nbsp;
                        {a.chartType.charAt(0).toUpperCase() + a.chartType.slice(1)}
                      </span>
                    </>
                  )}
                </div>

                <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                  <button
                    onClick={() => onView(a)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleExport(a._id, 'png')}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center space-x-1"
                  >
                    <ArrowDownOnSquareIcon className="w-5 h-5 text-gray-700"/>
                    <span className="text-sm">PNG</span>
                  </button>
                  <button
                    onClick={() => handleExport(a._id, 'pdf')}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center space-x-1"
                  >
                    <ArrowDownOnSquareIcon className="w-5 h-5 text-gray-700"/>
                    <span className="text-sm">PDF</span>
                  </button>
                  <button
                    onClick={() => handleDelete(a._id)}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageContainer>
  );
}
