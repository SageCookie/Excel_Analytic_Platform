import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Login from './Login';
import Register from './Register';

function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setDarkMode(!darkMode);
  };

  return (
    <GoogleOAuthProvider clientId="1063717237880-sp354llroovpd6g49e4e4h1e6uh4bs4i.apps.googleusercontent.com">
      <div className={`${darkMode ? 'dark' : ''}`}>
        <div className="flex flex-col min-h-screen relative bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100">

          {/* Navbar */}
          <nav className="flex justify-between items-center px-6 py-4 shadow dark:bg-gray-800">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Logo" className="h-12" />
              <span className="text-2xl font-bold">Excel Analytics</span>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowLogin(true)} className="text-blue-600 dark:text-blue-400 hover:underline transition">Login</button>
              <button onClick={() => setShowRegister(true)} className="bg-blue-600 dark:bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition">Sign up</button>
              <button onClick={toggleDarkMode} className="text-xs text-gray-500 dark:text-gray-300 border px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </nav>

          {/* Hero */}
          <header className="flex flex-col md:flex-row items-center justify-center flex-1 p-8 text-center md:text-left relative overflow-hidden">
            {/* Optional background shape */}
            <div className="absolute -z-10 w-[400px] h-[400px] bg-blue-100 dark:bg-blue-900 rounded-full top-10 -left-40 blur-3xl opacity-50"></div>
            <div className="space-y-4 md:w-1/2">
              <h1 className="text-4xl font-bold">Analyze your Excel data effortlessly</h1>
              <p className="text-gray-600 dark:text-gray-300 font-light">Upload Excel files and get instant visual insights. Secure, fast, and simple.</p>
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
                <button onClick={() => setShowRegister(true)} className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded w-48 transform hover:scale-105 transition">Get Started</button>
                <button onClick={() => setShowLogin(true)} className="border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-6 py-2 rounded w-48 hover:bg-blue-50 dark:hover:bg-gray-700 transition">Login</button>
              </div>
              <div className="flex justify-center md:justify-start">
                <GoogleLogin
                  width="192"
                  onSuccess={credentialResponse => console.log('Google login success:', credentialResponse)}
                  onError={() => console.log('Google login failed')}
                />
              </div>
            </div>
            <img src="/screenshot.png" alt="App screenshot" className="mt-8 md:mt-0 md:w-1/2 rounded shadow-lg max-w-md" />
          </header>

          {/* Features */}
          <section className="py-12 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="font-semibold mb-2">Upload Excel files</h3>
                <p className="text-gray-600 dark:text-gray-400">Support for .xls & .xlsx files</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Visualize data instantly</h3>
                <p className="text-gray-600 dark:text-gray-400">Charts, tables, and stats</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Secure & fast</h3>
                <p className="text-gray-600 dark:text-gray-400">Your data is safe and processed quickly</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm space-y-2">
            <div>© 2025 Excel Analytics. All rights reserved.</div>
            <div className="flex justify-center space-x-4">
              <button className="text-blue-600 dark:text-blue-400 hover:underline bg-transparent border-none p-0 cursor-pointer">Privacy Policy</button>
              <button className="text-blue-600 dark:text-blue-400 hover:underline bg-transparent border-none p-0 cursor-pointer">Contact</button>
              <a href="/admin-login" className="text-blue-600 dark:text-blue-400 hover:underline">Admin login</a>
            </div>
          </footer>

          {/* Modal popups */}
          {showLogin && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 rounded shadow max-w-md w-full relative">
                <button onClick={() => setShowLogin(false)} className="absolute top-2 right-2 text-gray-500 dark:text-gray-300">&times;</button>
                <Login />
              </div>
            </div>
          )}
          {showRegister && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 rounded shadow max-w-md w-full relative">
                <button onClick={() => setShowRegister(false)} className="absolute top-2 right-2 text-gray-500 dark:text-gray-300">&times;</button>
                <Register />
              </div>
            </div>
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default LandingPage;
