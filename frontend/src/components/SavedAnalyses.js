// src/components/SavedAnalyses.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PageContainer from './PageContainer';

function SavedAnalyses({ onView }) {
  const [list, setList] = useState([]);
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

  if (!list.length) {
    return (
      <PageContainer title="Saved Analyses">
        <p>No analyses saved yet.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Saved Analyses">
      <ul className="space-y-4">
        {list.map(a => (
          <li key={a._id} className="p-4 bg-white rounded shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">{a.historyId.fileName}</div>
              <div className="text-sm text-gray-500">
                {new Date(a.createdAt).toLocaleString()} – {a.chartType}
              </div>
            </div>
            <button
              onClick={() => onView(a)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View
            </button>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}

export default SavedAnalyses;
