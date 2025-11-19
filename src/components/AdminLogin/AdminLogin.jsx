// src/components/AdminLogin.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import logo from '../../assets/Two Seas Logo.png';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const adminsRef = collection(db, 'admin-login');
      const q = query(adminsRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid email or password');
        return;
      }

      const adminDoc = querySnapshot.docs[0];
      const adminData = adminDoc.data();

      if (adminData.password !== password) {
        setError('Invalid email or password');
        return;
      }

      // ✅ Save admin info to localStorage
      localStorage.setItem('adminUser', JSON.stringify({
        adminId: adminDoc.id,
        email: adminData.email,
        adminName: adminData.adminName,
        loginTime: Date.now()
      }));

      navigate('/admin-dashboard');

    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-content-wrapper">
        {/* Logo in circular white shape */}
        <div className="logo-circle">
          <img src={logo} alt="Two Seas Logo" className="logo-image" />
        </div>

        {/* Vertical divider line */}
        <div className="vertical-divider"></div>

        {/* Login form */}
        <div className="login-form-container">
          <h2 className="login-title">Login to Admin Panel</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="admin-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="admin-input"
              />
            </div>
            <button type="submit" className="admin-login-button">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;