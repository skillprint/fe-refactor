'use client'; // Required for App Router if using useState / onSubmit

import React, { useState, useEffect } from 'react';

export default function CreateGamePage() {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Check for token on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) setAdminToken(token);
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const response = await fetch('http://localhost:8002/users/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setAdminToken(data.token);
        localStorage.setItem('adminToken', data.token);
      } else {
        setLoginError('Invalid credentials or not an admin.');
      }
    } catch (err) {
      setLoginError('Network error connecting to the backend.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('adminToken');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!adminToken) return;

    setLoading(true);
    setMessage(null);

    // Creates a FormData object from all inputs inside the <form>
    const formData = new FormData(e.currentTarget);

    // If you need to append multiple slugs for relationships like 'skills' or 'moods':
    // formData.append('skills', 'action');
    // formData.append('skills', 'puzzle');

    try {
      const response = await fetch('http://localhost:8002/games/api/games/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${adminToken}`,
          // IMPORTANT: Do NOT manually set 'Content-Type': 'multipart/form-data'. 
          // fetch will automatically set it along with the correct boundaries!
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Success! Game created with slug: ${data.slug}`);
        (e.target as HTMLFormElement).reset();
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${JSON.stringify(errorData)}`);
      }
    } catch (err) {
      console.error('Request failed', err);
      setMessage('A network error occurred. Is the Django server running?');
    } finally {
      setLoading(false);
    }
  };

  if (!adminToken) {
    return (
      <div style={{ maxWidth: '400px', margin: '40px auto', fontFamily: 'sans-serif' }}>
        <h1>Admin Login Required</h1>
        <p>Please log in to obtain an admin token to create games.</p>
        
        {loginError && (
          <div style={{ color: 'red', marginBottom: '10px' }}>{loginError}</div>
        )}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            <strong>Email</strong>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            <strong>Password</strong>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </label>
          <button 
            type="submit" 
            disabled={loginLoading} 
            style={{ padding: '10px', fontSize: '16px', cursor: loginLoading ? 'not-allowed' : 'pointer' }}
          >
            {loginLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Create New Game</h1>
        <button 
          onClick={handleLogout} 
          style={{ padding: '5px 10px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
      
      {message && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#f0f0f0' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          <strong>Name *</strong>
          <input name="name" type="text" required />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          <strong>Short Description *</strong>
          <textarea name="short_description" rows={3} required />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          <strong>Thumbnail Image</strong>
          <input name="thumbnail" type="file" accept="image/*" />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          <strong>Game ZIP File</strong>
          <input name="game_zip" type="file" accept=".zip" />
        </label>

        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '10px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Creating...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
