import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const BackendStatus = () => {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const isConnected = await apiService.testConnection();
      if (isConnected) {
        setStatus('connected');
        setMessage('✅ Backend is running and accessible');
      } else {
        setStatus('disconnected');
        setMessage('❌ Cannot connect to backend. Please start the Spring Boot server.');
      }
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-success';
      case 'disconnected': return 'text-danger';
      case 'error': return 'text-danger';
      default: return 'text-warning';
    }
  };

  return (
    <div className="alert alert-info" role="alert">
      <h6 className="alert-heading">🔧 Backend Status</h6>
      <p className={`mb-2 ${getStatusColor()}`}>
        {status === 'checking' ? '🔄 Checking connection...' : message}
      </p>
      {status !== 'connected' && (
        <div className="mt-2">
          <small className="text-muted">
            <strong>To fix this:</strong><br/>
            1. Open terminal and run: <code>cd backend && mvn spring-boot:run</code><br/>
            2. Wait for "Started QuranMemorizationAppApplication" message<br/>
            3. Refresh this page
          </small>
        </div>
      )}
      <button 
        className="btn btn-sm btn-outline-primary mt-2" 
        onClick={checkBackendStatus}
        disabled={status === 'checking'}
      >
        {status === 'checking' ? 'Checking...' : 'Test Again'}
      </button>
    </div>
  );
};

export default BackendStatus;

