import React from 'react';
import './Dashboard.css';

const Dashboard = ({ user, onSignOut }) => {
  return (
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)'}}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          <div className="navbar-brand d-flex align-items-center">
            <span className="me-2 fs-2">📖</span>
            <span className="fw-bold text-dark fs-4">Quran Memorization</span>
          </div>
          <div className="d-flex align-items-center">
            <span className="text-muted me-3">Welcome, {user.name}</span>
            <button 
              onClick={onSignOut} 
              className="btn btn-outline-secondary btn-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-5">
        {/* Welcome Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-dark mb-3">Welcome to your Quran Memorization Journey</h1>
          <p className="lead text-muted">Start memorizing and strengthen your connection with the Quran</p>
        </div>

        {/* Features Grid */}
        <div className="row g-4 mb-5">
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 shadow-sm" style={{borderRadius: '16px'}}>
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <span className="display-4">📚</span>
                </div>
                <h5 className="card-title fw-bold">Memorization</h5>
                <p className="card-text text-muted">Practice memorizing verses with our interactive tools</p>
                <button className="btn btn-success w-100 fw-semibold" style={{borderRadius: '8px'}}>
                  Start Learning
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 shadow-sm" style={{borderRadius: '16px'}}>
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <span className="display-4">🎯</span>
                </div>
                <h5 className="card-title fw-bold">Progress Tracking</h5>
                <p className="card-text text-muted">Track your memorization progress and achievements</p>
                <button className="btn btn-success w-100 fw-semibold" style={{borderRadius: '8px'}}>
                  View Progress
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 shadow-sm" style={{borderRadius: '16px'}}>
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <span className="display-4">🔄</span>
                </div>
                <h5 className="card-title fw-bold">Review</h5>
                <p className="card-text text-muted">Review previously memorized verses to maintain retention</p>
                <button className="btn btn-success w-100 fw-semibold" style={{borderRadius: '8px'}}>
                  Start Review
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 shadow-sm" style={{borderRadius: '16px'}}>
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <span className="display-4">📊</span>
                </div>
                <h5 className="card-title fw-bold">Statistics</h5>
                <p className="card-text text-muted">View detailed statistics about your learning journey</p>
                <button className="btn btn-success w-100 fw-semibold" style={{borderRadius: '8px'}}>
                  View Stats
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card border-0 shadow-sm" style={{borderRadius: '16px'}}>
          <div className="card-body p-4">
            <h4 className="fw-bold mb-4">Recent Activity</h4>
            <div className="list-group list-group-flush">
              <div className="list-group-item border-0 bg-light rounded-3 mb-2">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <span className="fs-4">✅</span>
                  </div>
                  <div className="flex-grow-1">
                    <p className="mb-1 fw-medium">Completed memorization of Al-Fatiha</p>
                    <small className="text-muted">2 hours ago</small>
                  </div>
                </div>
              </div>
              <div className="list-group-item border-0 bg-light rounded-3 mb-2">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <span className="fs-4">🎯</span>
                  </div>
                  <div className="flex-grow-1">
                    <p className="mb-1 fw-medium">Set new goal: Memorize 5 verses this week</p>
                    <small className="text-muted">1 day ago</small>
                  </div>
                </div>
              </div>
              <div className="list-group-item border-0 bg-light rounded-3">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <span className="fs-4">🔄</span>
                  </div>
                  <div className="flex-grow-1">
                    <p className="mb-1 fw-medium">Reviewed Al-Baqarah verses 1-10</p>
                    <small className="text-muted">2 days ago</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
