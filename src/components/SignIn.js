import React, { useState } from 'react';
import './SignIn.css';
import apiService from '../services/api';

const SignIn = ({ onSignIn, onSwitchToSignUp }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    // Clear validation error for this field
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      // Call Spring Boot API
      const response = await apiService.login(formData.email, formData.password);
      
      onSignIn({
        id: response.id,
        email: response.email,
        name: response.fullName,
        firstName: response.firstName,
        lastName: response.lastName
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-2 border-success" style={{borderRadius: '20px'}}>
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <span className="display-4">📖</span>
                  </div>
                  <h2 className="fw-bold text-dark mb-2">Quran Memorization</h2>
                  <p className="text-muted">Sign in to continue your journey</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-medium">Email</label>
                    <input
                      type="email"
                      className={`form-control form-control-lg ${validationErrors.email ? 'is-invalid' : 'border-success'}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      style={{borderRadius: '12px', border: validationErrors.email ? '2px solid #dc3545' : '2px solid #10b981'}}
                    />
                    {validationErrors.email && (
                      <div className="invalid-feedback d-block">
                        {validationErrors.email}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-medium">Password</label>
                    <input
                      type="password"
                      className={`form-control form-control-lg ${validationErrors.password ? 'is-invalid' : 'border-success'}`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      style={{borderRadius: '12px', border: validationErrors.password ? '2px solid #dc3545' : '2px solid #10b981'}}
                    />
                    {validationErrors.password && (
                      <div className="invalid-feedback d-block">
                        {validationErrors.password}
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="btn btn-success btn-lg w-100 fw-semibold"
                    disabled={isLoading}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '16px',
                      fontSize: '16px'
                    }}
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : null}
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>

                <div className="text-center mt-4 pt-3" style={{borderTop: '2px solid #10b981'}}>
                  <p className="text-muted mb-0">
                    Don't have an account? <button 
                      onClick={onSwitchToSignUp} 
                      className="btn btn-link text-success text-decoration-none fw-medium p-0"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
