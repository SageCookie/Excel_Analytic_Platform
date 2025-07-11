// src/components/UploadSection.js
import React from 'react';

function UploadSection({ handleFileUpload }) {
  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-2">Upload New Excel File</h3>
      <div className="border-dashed border-2 border-gray-400 p-6 rounded text-center">
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        <p className="text-gray-500 mt-2">Drag & drop or click to upload</p>
      </div>
    </div>
  );
}

export default UploadSection;
