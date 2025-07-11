import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 shadow">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="h-8" />
          <span className="text-xl font-semibold">Excel Analytics</span>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="text-blue-600">Login</Link>
          <Link to="/register" className="bg-blue-600 text-white px-3 py-1 rounded">Sign up</Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="flex flex-col md:flex-row items-center justify-center flex-1 p-8 text-center md:text-left">
        <div className="space-y-4 md:w-1/2">
          <h1 className="text-4xl font-bold">Analyze your Excel data effortlessly</h1>
          <p className="text-gray-600">Upload Excel files and get instant visual insights. Secure, fast, and simple.</p>
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded">Get Started</Link>
            <Link to="/login" className="border border-blue-600 text-blue-600 px-4 py-2 rounded">Login</Link>
          </div>
          <button className="bg-red-500 text-white px-4 py-2 rounded">Sign up with Google</button>
        </div>
        <img src="/screenshot.png" alt="App screenshot" className="mt-8 md:mt-0 md:w-1/2 rounded shadow" />
      </header>

      {/* Features */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <h3 className="font-semibold mb-2">Upload Excel files</h3>
            <p className="text-gray-600">Support for .xls & .xlsx files</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Visualize data instantly</h3>
            <p className="text-gray-600">Charts, tables, and stats</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Secure & fast</h3>
            <p className="text-gray-600">Your data is safe and processed quickly</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-500 py-4 text-sm">
        © 2025 Excel Analytics. All rights reserved.
        <div>
          <Link to="/admin-login" className="text-blue-600">Admin login</Link>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
