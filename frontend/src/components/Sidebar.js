// src/components/Sidebar.js
import React from 'react';

function Sidebar({ active, setActive }) {
  return (
    <div className="w-60 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen shadow">
      <div className="p-4 text-xl font-bold">📊 Excel Analytics</div>
      <nav className="flex flex-col space-y-2 p-2">
        {['Dashboard', 'Upload File', 'My Files', 'Saved Analyses', 'Profile'].map(section => (
          <button
            key={section}
            onClick={() => setActive(section)}
            className={`text-left px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-gray-700 ${
              active === section ? 'bg-blue-500 text-white' : ''
            }`}
          >
            {section}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
