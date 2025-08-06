// src/components/RecentUploads.js
import React from 'react';

function RecentUploads({ history = [], limit = 5 }) {
  const items = history.slice(0, limit);

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-2">📂 Recent Uploads</h3>
      {items.length === 0 ? (
        <p className="text-gray-500">No uploads yet.</p>
      ) : (
        <table className="min-w-full text-sm text-left border mt-2">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-2 py-1 border">File</th>
              <th className="px-2 py-1 border">Date</th>
              <th className="px-2 py-1 border">Rows</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="odd:bg-white even:bg-gray-50">
                <td className="px-2 py-1 border">{item.fileName}</td>
                <td className="px-2 py-1 border">
                  {new Date(item.uploadDate).toLocaleDateString()}
                </td>
                <td className="px-2 py-1 border">{item.rows ?? 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RecentUploads;
