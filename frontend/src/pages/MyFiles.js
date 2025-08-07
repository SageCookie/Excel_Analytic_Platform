import React, { useState, useMemo } from 'react';
import axios from 'axios';
import PageContainer from '../components/PageContainer';
import {
  EyeIcon,
  ArrowDownOnSquareIcon as DownloadIcon,
  TrashIcon,
  ArrowSmallUpIcon,
  ArrowSmallDownIcon
} from '@heroicons/react/24/outline';

// ─── Helpers ─────────────────────────────────────────────────────────
const formatDate = date =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

const formatSize = bytes => {
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + ' KB';
  return bytes + ' B';
};

const fileIcon = name => {
  const ext = name.split('.').pop().toLowerCase();
  return ext === 'xls' || ext === 'xlsx' ? '📄' : '🗂️';
};

// ─── Component ────────────────────────────────────────────────────────
export default function MyFiles({ history = [], onDelete, onView }) {
  const [search, setSearch]       = useState('');
  const [sortField, setSortField] = useState('fileName');
  const [sortAsc, setSortAsc]     = useState(true);
  const [page, setPage]           = useState(1);
  const pageSize = 10;

  // ─── filter + sort ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    return history
      .filter(h => h.fileName.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        let av = a[sortField] ?? '';
        let bv = b[sortField] ?? '';
        // normalize for date fields
        if (sortField === 'uploadDate' || sortField === 'lastAccessed') {
          av = new Date(av).getTime();
          bv = new Date(bv).getTime();
        }
        // normalize for string compare
        if (typeof av === 'string') {
          av = av.toLowerCase();
          bv = bv.toLowerCase();
        }
        if (av < bv) return sortAsc ? -1 : 1;
        if (av > bv) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [history, search, sortField, sortAsc]);

  const pages = Math.ceil(filtered.length / pageSize);
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  // download helper (unchanged)…
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

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <PageContainer title="My Files">
      {/* ─── Controls: Search + Sort ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="🔎 Search files…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200"
        />
        <div className="flex items-center space-x-2">
          <select
            value={sortField}
            onChange={e => { setSortField(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-200"
          >
            <option value="fileName">Name</option>
            <option value="uploadDate">Date</option>
            <option value="rows">Rows</option>
            <option value="fileSize">Size</option>
            <option value="lastAccessed">Last Accessed</option>
          </select>
          <button
            onClick={() => setSortAsc(prev => !prev)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            title="Toggle Asc/Desc"
          >
            {sortAsc
              ? <ArrowSmallUpIcon className="w-4 h-4 text-gray-600"/>
              : <ArrowSmallDownIcon className="w-4 h-4 text-gray-600"/>
            }
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500">
          You haven’t uploaded any files yet. Click “Upload File” to get started.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100">
{/*
  Replace 'analysisStatus' with 'lastAccessed'
*/}
                {['fileName','uploadDate','rows','fileSize','lastAccessed','actions'].map(field => (
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
                    {field === 'fileName'       ? 'File Name'
                     : field === 'uploadDate'   ? 'Date'
                     : field === 'rows'         ? 'Rows'
                     : field === 'fileSize'     ? 'Size'
                     : field === 'lastAccessed' ? 'Last Accessed'
                     : 'Actions'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pageItems.map(item => (
                <tr key={item._id} className="hover:bg-gray-50 odd:bg-white even:bg-gray-50">
{/*
  File icon + clickable name → onView(item)
*/}
                  <td className="px-4 py-2">
                    <button
                      onClick={() => onView(item)}
                      className="flex items-center space-x-1 text-left hover:underline"
                    >
                      <span>{fileIcon(item.fileName)}</span>
                      <span>{item.fileName}</span>
                    </button>
                  </td>
                  <td className="px-4 py-2">{formatDate(item.uploadDate)}</td>
                  <td className="px-4 py-2">{item.rows ?? 'N/A'}</td>
                  <td className="px-4 py-2">{formatSize(item.fileSize)}</td>
                  <td className="px-4 py-2">
                    {item.lastAccessed
                      ? formatDate(item.lastAccessed)
                      : '—'}
                  </td>
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