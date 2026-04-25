import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import logo from '../../assets/logo.png';


const Login = () => {
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(loginValue, password);
    
    if (result.success) {
      const role = result.user?.role;
      if (role === 'super') navigate('/super-admin');
      else if (role === 'showroom') navigate('/showroom-admin');
      else if (role === 'kassa') navigate('/kassa/dashboard');
      else if (role === 'sotuv_manager') navigate('/sotuv-manager/orders');
      else if (role === 'proekt_manager') navigate('/proekt-manager/orders');
      else navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #1a1a1a, #0a0a0a)',
      padding: '20px'
    }}>
      <div className="premium-card" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '48px 40px',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '30px' }}>
          <img 
            src={logo} 
            alt="Express Mebel Logo" 
            style={{ 
              maxWidth: '240px', 
              height: 'auto', 
              marginBottom: '10px' 
            }} 
          />
          <p style={{ color: 'var(--accent-gold)', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Express Mebel ERP
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            padding: '12px',
            borderRadius: '12px',
            fontSize: '14px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Login
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Loginingizni kiriting"
                style={{ width: '100%', paddingLeft: '48px' }}
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Parol
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                style={{ width: '100%', paddingLeft: '48px', paddingRight: '48px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="gold-btn" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px' }}>
            <LogIn size={20} />
            Tizimga kirish
          </button>
        </form>

        <div style={{ marginTop: '40px', color: 'rgba(255,255,255,0.1)', fontSize: '12px' }}>
          &copy; 2026 Express Mebel. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </div>
  );
};

export default Login;
