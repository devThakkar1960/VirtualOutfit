import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';
import { Link } from 'react-router-dom';

function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) {
        setIsCollapsed(false); 
      } else {
        setIsCollapsed(true); 
      }
    };

    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleNavbar = () => {
    if (isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
  <nav
  className="navbar navbar-expand-lg custom-navbar px-4 font-poppins sticky top-0 left-0 w-full z-50 shadow-md"
  style={{
    background: 'linear-gradient(90deg, #000000, #3254a8)',
    borderBottom: '1px solid #6e6ce0',                      
  }}
>
      <div className="container-fluid d-flex align-items-center justify-content-between w-100">
        <Link
          to="/"
          className="navbar-brand fw-bold fs-3 text-decoration-none glowing-border"
          style={{
            fontFamily: "'Poppins', sans-serif",
            color: 'white',
            position: 'relative',
            padding: '0 8px',
            borderRadius: '8px',
            border: '2px solid transparent',
            animation: 'glow-border 3s ease-in-out infinite alternate',
          }}
        >
          <span style={{ color: '#cbb8ff' }}>Virtual</span>
          <span style={{ color: '#9f8cff' }}>Outfit</span>
        </Link>

        <button
          className="navbar-toggler bg-white"
          type="button"
          onClick={toggleNavbar}
          aria-controls="navbarNav"
          aria-expanded={!isCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`navbar-collapse ${isCollapsed && isMobile ? 'collapse' : 'show'}`} id="navbarNav">
          <ul className="navbar-nav ms-auto d-flex align-items-center gap-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <li className="nav-item">
              <Link
                to="/"
                className="nav-link fw-bold text-decoration-none"
                onClick={() => isMobile && setIsCollapsed(true)} // Close only on mobile
                style={{ color: 'white' }}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/try"
                className="nav-link try-here-btn fw-bold text-decoration-none glowing-border"
                onClick={() => isMobile && setIsCollapsed(true)} // Close only on mobile
                style={{
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '2px solid transparent',
                  animation: 'glow-border 3s ease-in-out infinite alternate',
                }}
              >
                Try Here
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
