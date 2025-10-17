import React, { useState, useEffect } from 'react';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import apiService from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = apiService.getStoredUser();
    const token = apiService.getToken();
    
    if (storedUser && token) {
      // Validate token with backend
      apiService.validateToken()
        .then(() => {
          setUser(storedUser);
        })
        .catch(() => {
          // Token is invalid, clear storage
          apiService.logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleSignIn = (userData) => {
    setUser(userData);
  };

  const handleSignUp = (userData) => {
    setUser(userData);
  };

  const handleSignOut = () => {
    apiService.logout();
    setUser(null);
    setIsSignUp(false);
  };

  const switchToSignIn = () => {
    setIsSignUp(false);
  };

  const switchToSignUp = () => {
    setIsSignUp(true);
  };

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (isSignUp) {
      return <SignUp onSignUp={handleSignUp} onSwitchToSignIn={switchToSignIn} />;
    }
    return <SignIn onSignIn={handleSignIn} onSwitchToSignUp={switchToSignUp} />;
  }

  return (
    <div className="app">
      <Dashboard user={user} onSignOut={handleSignOut} />
    </div>
  );
}

export default App;
