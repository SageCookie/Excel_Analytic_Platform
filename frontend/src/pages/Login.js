import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // NEW

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setMessage('❌ All fields are required.');
      return;
    }
    setLoading(true); // NEW
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setMessage('✅ Logged in successfully!');
      navigate('/dashboard');
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Login failed'));
    } finally {
      setLoading(false); // NEW
    }
  };

  // Google login success handler
  const handleGoogleSuccess = async (response) => {
    setLoading(true); // NEW
    try {
      const res = await axios.post('http://localhost:5000/api/auth/google', {
        token: response.credential,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setMessage('❌ Google login failed');
    } finally {
      setLoading(false); // NEW
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow">
      <h2 className="text-gray-900 dark:text-gray-100 text-xl font-semibold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="mt-4">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setMessage('❌ Google login failed')}
          disabled={loading}
        />
      </div>
      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{message}</p>
      {loading && <div className="text-center mt-2 text-blue-500">Loading...</div>}
    </div>
  );
}

export default Login;
