'use client';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import UploadSubmitPage from './uploadSubmit';
import FetchDisplayPage from './fetchDisplay';

function Home() {
  const location = useLocation();
  
  return (
    <div>
      <nav className="flex space-x-4 bg-slate-800 p-4 rounded-lg">
        <ul className="flex space-x-4">
          <li>
            <Link 
              to="/" 
              className={`p-2 ${location.pathname === '/' ? 'text-white bg-blue-500 rounded' : 'text-blue-500'}`}
            >
              Upload & Submit
            </Link>
          </li>
          <li>
            <Link 
              to="/fetch" 
              className={`p-2 ${location.pathname === '/fetch' ? 'text-white bg-blue-500 rounded' : 'text-blue-500'}`}
            >
              Fetch Data
            </Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<UploadSubmitPage />} />
        <Route path="/fetch" element={<FetchDisplayPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Home />
    </Router>
  );
}

export default App;
