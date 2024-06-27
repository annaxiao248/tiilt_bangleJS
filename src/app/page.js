'use client'
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import UploadSubmitPage from './uploadSubmit';
import FetchDisplayPage from './fetchDisplay';

function Home() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Upload & Submit</Link>
            </li>
            <li>
              <Link to="/fetch">Fetch Data</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<UploadSubmitPage />} />
          <Route path="/fetch" element={<FetchDisplayPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default Home;
