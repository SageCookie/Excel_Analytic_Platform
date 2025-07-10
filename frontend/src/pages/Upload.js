import React, { useState } from 'react';
import axios from 'axios';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('⚠️ Please select a file first.');
      return;
    }

    const token = localStorage.getItem('token'); // get your saved token

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // send the token
        }
      });
      setMessage(`✅ ${response.data.message}`);
      console.log(response.data);
    } catch (error) {
      console.error(error);
      setMessage('❌ Upload failed.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Excel File</h1>
      <input
        type="file"
        accept=".xls,.xlsx"
        onChange={handleChange}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Upload
      </button>
      {message && (
        <p className="mt-4 text-center">{message}</p>
      )}
    </div>
  );
};

export default Upload;
