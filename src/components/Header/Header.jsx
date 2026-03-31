import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [sticky, setSticky]       = useState(false);
  const [dropdown, setDropdown]   = useState(false);
  const { user } = useAuth();
  const navigate  = useNavigate();
  const dropRef   = useRef(null);

  useEffect(() => {
    const handleScroll = () => setSticky(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setDropdown(false);
    navigate('/login');
  };

  return (
    <header className={sticky ? 'header sticky' : 'header'}>
      <div className="container">

        <div className="logo">
          <Link to="/">MovieApp</Link>
        </div>

        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/Movies">Movies</Link>

          {user ? (
            <div className="nav-user" ref={dropRef}>
             
              <button
                className="nav-user-btn"
                onClick={() => setDropdown((d) => !d)}
              >
                <div className="nav-avatar">
                  {(user.displayName || user.email)?.[0].toUpperCase()}
                </div>
                <span className="nav-username">
                  {user.displayName || user.email}
                </span>
                <span className={`nav-chevron ${dropdown ? 'open' : ''}`}>
                  ▾
                </span>
              </button>

          
              {dropdown && (
                <div className="nav-dropdown">
                  <div className="nav-dropdown-info">
                    <div className="nav-dropdown-avatar">
                      {(user.displayName || user.email)?.[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="nav-dropdown-name">
                        {user.displayName || 'Пользователь'}
                      </p>
                      <p className="nav-dropdown-email">{user.email}</p>
                    </div>
                  </div>

                  <div className="nav-dropdown-divider" />

                  <button className="nav-dropdown-logout" onClick={handleLogout}>
                    <span>⎋</span> Выйти из аккаунта
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/Register">Register</Link>
          )}
        </nav>

      </div>
    </header>
  );
};

export default Header;