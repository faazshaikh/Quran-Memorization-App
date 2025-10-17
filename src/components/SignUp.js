import React, { useState } from 'react';
import './SignIn.css';
import apiService from '../services/api';

const SignUp = ({ onSignUp, onSwitchToSignIn }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // Password must be at least 8 characters, contain uppercase, lowercase, and number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
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
      const response = await apiService.register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        formData.confirmPassword
      );
      
      onSignUp({
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
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-2 border-success" style={{borderRadius: '20px'}}>
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <span className="display-4">📖</span>
                  </div>
                  <h2 className="fw-bold text-dark mb-2">Create Account</h2>
                  <p className="text-muted">Join the Quran Memorization community</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="firstName" className="form-label fw-medium">First Name</label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${validationErrors.firstName ? 'is-invalid' : 'border-success'}`}
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                        required
                        style={{borderRadius: '12px', border: validationErrors.firstName ? '2px solid #dc3545' : '2px solid #10b981'}}
                      />
                      {validationErrors.firstName && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.firstName}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="lastName" className="form-label fw-medium">Last Name</label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${validationErrors.lastName ? 'is-invalid' : 'border-success'}`}
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        required
                        style={{borderRadius: '12px', border: validationErrors.lastName ? '2px solid #dc3545' : '2px solid #10b981'}}
                      />
                      {validationErrors.lastName && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.lastName}
                        </div>
                      )}
                    </div>
                  </div>

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

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-medium">Password</label>
                    <input
                      type="password"
                      className={`form-control form-control-lg ${validationErrors.password ? 'is-invalid' : 'border-success'}`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      required
                      style={{borderRadius: '12px', border: validationErrors.password ? '2px solid #dc3545' : '2px solid #10b981'}}
                    />
                    {validationErrors.password && (
                      <div className="invalid-feedback d-block">
                        {validationErrors.password}
                      </div>
                    )}
                    <div className="form-text">
                      Password must contain at least 8 characters with uppercase, lowercase, and number
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label fw-medium">Confirm Password</label>
                    <input
                      type="password"
                      className={`form-control form-control-lg ${validationErrors.confirmPassword ? 'is-invalid' : 'border-success'}`}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                      style={{borderRadius: '12px', border: validationErrors.confirmPassword ? '2px solid #dc3545' : '2px solid #10b981'}}
                    />
                    {validationErrors.confirmPassword && (
                      <div className="invalid-feedback d-block">
                        {validationErrors.confirmPassword}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        className={`form-check-input ${validationErrors.agreeToTerms ? 'is-invalid' : ''}`}
                        type="checkbox"
                        id="agreeToTerms"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-check-label" htmlFor="agreeToTerms">
                        I agree to the <a href="#" className="text-success">Terms and Conditions</a> and <a href="#" className="text-success">Privacy Policy</a>
                      </label>
                      {validationErrors.agreeToTerms && (
                        <div className="invalid-feedback d-block">
                          {validationErrors.agreeToTerms}
                        </div>
                      )}
                    </div>
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
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>

                <div className="text-center mt-4 pt-3" style={{borderTop: '2px solid #10b981'}}>
                  <p className="text-muted mb-0">
                    Already have an account? <button 
                      onClick={onSwitchToSignIn} 
                      className="btn btn-link text-success text-decoration-none fw-medium p-0"
                    >
                      Sign in
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

export default SignUp;
