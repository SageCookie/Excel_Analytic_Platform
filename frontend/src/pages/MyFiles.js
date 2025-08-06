import React, { useState, useMemo } from 'react';
import axios from 'axios';
import PageContainer from '../components/PageContainer';
import {
  EyeIcon,
  ArrowDownOnSquareIcon as DownloadIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function MyFiles({ history = [], onDelete, onView }) {
  const [search, setSearch]         = useState('');
  const [statusFilter, setFilter]   = useState('');
  const [sortField, setSortField]   = useState('uploadDate');
  const [sortAsc, setSortAsc]       = useState(false);
  const [page, setPage]             = useState(1);
  const pageSize = 10;

  // filter + sort
  const filtered = useMemo(() => {
    return history
      .filter(h => h.fileName.toLowerCase().includes(search.toLowerCase()))
      .filter(h => (statusFilter ? h.analysisStatus === statusFilter : true))
      .sort((a, b) => {
        const av = a[sortField] || '';
        const bv = b[sortField] || '';
        if (av < bv) return sortAsc ? -1 : 1;
        if (av > bv) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [history, search, statusFilter, sortField, sortAsc]);

  const pages = Math.ceil(filtered.length / pageSize);
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  // new download helper
  const handleDownload = async (id, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${process.env.REACT_APP_API}/upload/download/${id}`,
        {
          responseType: 'blob',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // create a link and click it
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a');
      a.href    = url;
      a.download= fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      alert('Download failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <PageContainer title="My Files">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="🔎 Search files…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 border rounded p-2"
        />
        <select
          value={statusFilter}
          onChange={e => setFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <p className="text-gray-500">
          You haven’t uploaded any files yet. Click “Upload File” to get started.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-50">
                {['fileName','uploadDate','rows','analysisStatus','actions'].map((field) => (
                  <th
                    key={field}
                    onClick={() => {
                      if (field !== 'actions') {
                        setSortField(field);
                        setSortAsc(prev => (sortField === field ? !prev : true));
                      }
                    }}
                    className={`px-4 py-2 text-left ${
                      field !== 'actions' ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                  >
                    {field === 'fileName'      ? 'File Name'
                     : field === 'uploadDate'  ? 'Date'
                     : field === 'rows'        ? 'Rows'
                     : field === 'analysisStatus' ? 'Status'
                     : 'Actions'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.map(item => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{item.fileName}</td>
                  <td className="px-4 py-2">
                    {new Date(item.uploadDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{item.rows ?? 'N/A'}</td>
                  <td className="px-4 py-2">{item.analysisStatus || '—'}</td>
                  <td className="px-4 py-2 flex gap-3">
                    <button
                      onClick={() => onView(item)}
                      title="View Analysis"
                      className="hover:text-blue-600"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDownload(item._id, item.fileName)}
                      title="Download File"
                      className="hover:text-green-600"
                    >
                      <DownloadIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(item._id)}
                      title="Delete File"
                      className="hover:text-red-600"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          {[...Array(pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </PageContainer>
  );
}