// src/components/Sidebar.js
import React from 'react';

export default function Sidebar({ active, setActive }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const sections = ['Dashboard', 'Upload File', 'My Files', 'Saved Analyses', 'Profile'];
  if (user?.role === 'admin') sections.unshift('Admin Dashboard');

  return (
    <div className="w-60 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen shadow">
      <div className="p-4 text-xl font-bold">📊 Excel Analytics</div>
      <nav className="flex flex-col space-y-2 p-2">
        {sections.map(sec => (
          <button
            key={sec}
            onClick={() => setActive(sec)}
            className={`text-left px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-gray-700 ${
              active === sec ? 'bg-blue-500 text-white' : ''
            }`}
          >
            {sec}
          </button>
        ))}
      </nav>
    </div>
  );
}
