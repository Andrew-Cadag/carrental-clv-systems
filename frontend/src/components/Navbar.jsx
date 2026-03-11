import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const styles = {
    navbar: {
      backgroundColor: '#1F3864',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'white'
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      textDecoration: 'none',
      color: 'white'
    },
    links: {
      display: 'flex',
      gap: '1.5rem',
      alignItems: 'center'
    },
    link: {
      color: 'white',
      textDecoration: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '4px'
    },
    button: {
      backgroundColor: 'transparent',
      border: '1px solid white',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      cursor: 'pointer'
    }
  };

  if (!user) return null;

  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.logo}>DriveEase</Link>
      <div style={styles.links}>
        {user.role === 'customer' && (
          <>
            <Link to="/customer/dashboard" style={styles.link}>Dashboard</Link>
            <Link to="/customer/cars" style={styles.link}>Cars</Link>
            <Link to="/customer/bookings" style={styles.link}>My Bookings</Link>
            <Link to="/customer/profile" style={styles.link}>Profile</Link>
          </>
        )}
        {user.role === 'staff' && (
          <>
            <Link to="/staff/dashboard" style={styles.link}>Dashboard</Link>
          </>
        )}
        {user.role === 'admin' && (
          <>
            <Link to="/admin/dashboard" style={styles.link}>Dashboard</Link>
            <Link to="/admin/cars" style={styles.link}>Cars</Link>
            <Link to="/admin/users" style={styles.link}>Users</Link>
            <Link to="/customer/cars" style={styles.link}>View Cars</Link>
          </>
        )}
        <span style={{ marginLeft: '1rem' }}>{user.full_name}</span>
        <button onClick={handleLogout} style={styles.button}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
