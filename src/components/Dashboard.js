import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { completeQuranData } from '../data/quranData';

const Dashboard = ({ user, onSignOut }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [userProgress, setUserProgress] = useState({
    totalVerses: 0,
    memorizedVerses: 0,
    currentSurah: null,
    currentLine: 0,
    streak: 0,
    totalTime: 0,
    achievements: [],
    lastStudyDate: null,
    dailyGoal: 3,
    weeklyGoal: 15,
    surahProgress: {}
  });
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [currentSurahData, setCurrentSurahData] = useState(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [learningSession, setLearningSession] = useState({
    startTime: null,
    currentSurah: null,
    currentLine: 0,
    practiceCount: 0,
    sessionTime: 0
  });
  const [showTranslation, setShowTranslation] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showSurahSelection, setShowSurahSelection] = useState(false);
  const [surahSearchTerm, setSurahSearchTerm] = useState('');
  const [surahCompleted, setSurahCompleted] = useState(false);

  useEffect(() => {
    const savedProgress = localStorage.getItem(`progress_${user.id}`);
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, [user.id]);

  useEffect(() => {
    localStorage.setItem(`progress_${user.id}`, JSON.stringify(userProgress));
  }, [userProgress, user.id]);
  useEffect(() => {
    // Use the complete Quran data from the imported file
    setSurahs(completeQuranData);
  }, []);

  // The surahs are already loaded from the imported complete Quran data above

  const progress = userProgress.totalVerses > 0 ? 
    Math.round((userProgress.memorizedVerses / userProgress.totalVerses) * 100) : 0;
  const selectSurah = (surah) => {
    setSelectedSurah(surah);
    setCurrentSurahData(surah);
    setCurrentLineIndex(0);
    setShowSurahSelection(false);
    startLearningSurah(surah);
    setActiveTab('memorize');
  };

  const startLearningSurah = (surah) => {
    setLearningSession({
      startTime: Date.now(),
      currentSurah: surah,
      currentLine: 0,
      practiceCount: 0,
      sessionTime: 0
    });
    setShowTranslation(true);
    setUserInput('');
    setIsCorrect(null);
  };

  const startLearningSession = () => {
    console.log('startLearningSession called');
    setShowSurahSelection(true);
    setSurahSearchTerm('');
    console.log('showSurahSelection set to true');
  };

  const practiceCurrentLine = () => {
    setLearningSession(prev => ({
      ...prev,
      practiceCount: prev.practiceCount + 1
    }));
  };

  const nextLine = () => {
    if (currentSurahData && currentLineIndex < currentSurahData.lines.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
      setUserInput('');
      setIsCorrect(null);
    } else if (currentSurahData && currentLineIndex >= currentSurahData.lines.length - 1) {
      markSurahCompleted();
    }
  };

  const markSurahCompleted = () => {
    if (!currentSurahData) return;
    
    const today = new Date().toDateString();
    const lastStudyDate = userProgress.lastStudyDate;
    const isNewDay = lastStudyDate !== today;
    
    setUserProgress(prev => ({
      ...prev,
      memorizedVerses: prev.memorizedVerses + currentSurahData.lines.length,
      totalVerses: prev.totalVerses + currentSurahData.lines.length,
      streak: isNewDay ? prev.streak + 1 : prev.streak,
      lastStudyDate: today,
      totalTime: prev.totalTime + Math.floor((Date.now() - learningSession.startTime) / 60000),
      surahProgress: {
        ...prev.surahProgress,
        [currentSurahData.id]: {
          completed: true,
          completedDate: today,
          linesMemorized: currentSurahData.lines.length
        }
      }
    }));
    
    setSurahCompleted(true);
    showAchievement('surah_completed');
    
    setTimeout(() => {
      endLearningSession();
      setSurahCompleted(false);
      setActiveTab('home');
    }, 3000);
  };

  const checkUserInput = () => {
    if (!userInput.trim() || !currentSurahData) return;
    
    const currentLine = currentSurahData.lines[currentLineIndex];
    const similarity = calculateSimilarity(userInput.toLowerCase(), currentLine.arabic.toLowerCase());
    const isCorrectAnswer = similarity > 0.7;
    
    setIsCorrect(isCorrectAnswer);
    
    if (isCorrectAnswer) {
      setTimeout(() => {
        nextLine();
      }, 1000);
    }
    
    setUserInput('');
  };

  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const getCurrentLine = () => {
    if (!currentSurahData || currentLineIndex >= currentSurahData.lines.length) return null;
    return currentSurahData.lines[currentLineIndex];
  };

  const getSurahProgress = (surahId) => {
    return userProgress.surahProgress[surahId] || { completed: false, linesMemorized: 0 };
  };
  
  const getFilteredSurahs = () => {
    if (!surahSearchTerm.trim()) return surahs;
    return surahs.filter(surah => 
      surah.name.toLowerCase().includes(surahSearchTerm.toLowerCase()) ||
      surah.nameArabic.includes(surahSearchTerm)
    );
  };

  const showAchievement = (type) => {
    const messages = {
      'surah_completed': 'Well done! You finished memorizing this surah.',
      'first_surah': 'Great job on your first surah!',
      'streak_7': 'Nice work! 7 days in a row.',
      'streak_30': 'Outstanding! 30 days straight.'
    };
    
    console.log(messages[type] || 'Good progress!');
  };

  const endLearningSession = () => {
    if (learningSession.startTime) {
      const sessionTime = Math.floor((Date.now() - learningSession.startTime) / 60000);
      setUserProgress(prev => ({
        ...prev,
        totalTime: prev.totalTime + sessionTime
      }));
    }
    
    setLearningSession({
      startTime: null,
      currentSurah: null,
      currentLine: 0,
      practiceCount: 0,
      sessionTime: 0
    });
    setCurrentSurahData(null);
    setCurrentLineIndex(0);
    setSelectedSurah(null);
  };

  const tabs = [
    { id: 'home', icon: '●', label: 'Home' },
    { id: 'memorize', icon: '●', label: 'Memorize' },
    { id: 'progress', icon: '●', label: 'Progress' },
    { id: 'review', icon: '●', label: 'Review' },
    { id: 'profile', icon: '●', label: 'Profile' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="modern-content">
            {/* Progress Section */}
            <div className="progress-section mb-5">
              <div className="text-center">
                <h2 className="modern-title mb-4">Your Progress</h2>
                <div className="progress-circle-container">
                  <div className="progress-circle">
                    <svg className="progress-ring" width="200" height="200">
                      <circle
                        className="progress-ring-circle-bg"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="transparent"
                        r="90"
                        cx="100"
                        cy="100"
                      />
                      <circle
                        className="progress-ring-circle"
                        stroke="#10b981"
                        strokeWidth="8"
                        fill="transparent"
                        r="90"
                        cx="100"
                        cy="100"
                        style={{
                          strokeDasharray: `${2 * Math.PI * 90}`,
                          strokeDashoffset: `${2 * Math.PI * 90 * (1 - progress / 100)}`
                        }}
                      />
                    </svg>
                    <div className="progress-text">
                      <div className="progress-percentage">{progress}%</div>
                      <div className="progress-label">Complete</div>
                    </div>
                  </div>
                </div>
                <p className="modern-subtitle mt-3">Keep up the good work</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h3 className="modern-section-title mb-4">Quick Actions</h3>
              <div className="row g-3">
                <div className="col-6">
                  <div className="action-card" onClick={startLearningSession}>
                    <div className="action-icon">📖</div>
                    <div className="action-text">Start Learning</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="action-card" onClick={() => setActiveTab('review')}>
                    <div className="action-icon">🔄</div>
                    <div className="action-text">Review</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="action-card" onClick={() => setActiveTab('progress')}>
                    <div className="action-icon">📊</div>
                    <div className="action-text">Progress</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="action-card" onClick={() => setActiveTab('profile')}>
                    <div className="action-icon">👤</div>
                    <div className="action-text">Profile</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Surah Selection */}
            {showSurahSelection && (
              <div className="surah-selection mt-4">
                <div className="surah-selection-header">
                  <h3 className="modern-section-title mb-4">Choose a Surah to Memorize</h3>
                  <button 
                    className="btn-modern-outline"
                    onClick={() => setShowSurahSelection(false)}
                  >
                    Close
                  </button>
                </div>
                
                <div className="surah-search">
                  <input
                    type="text"
                    className="surah-search-input"
                    placeholder="Search surahs by name (e.g., Fatiha, Baqarah)..."
                    value={surahSearchTerm}
                    onChange={(e) => setSurahSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="surahs-grid">
                  {getFilteredSurahs().map(surah => {
                    const progress = getSurahProgress(surah.id);
                    return (
                      <div 
                        key={surah.id} 
                        className="surah-card"
                        onClick={() => selectSurah(surah)}
                      >
                        <div className="surah-header">
                          <h4 className="surah-name">{surah.name}</h4>
                          <span className="surah-arabic">{surah.nameArabic}</span>
                        </div>
                        <div className="surah-info">
                          <span className="surah-verses">{surah.verses} verses</span>
                          {progress.completed && (
                            <span className="surah-completed">Completed</span>
                          )}
                        </div>
                        {progress.completed && (
                          <div className="surah-progress-bar">
                            <div className="surah-progress-fill" style={{width: '100%'}}></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {getFilteredSurahs().length === 0 && (
                  <div className="no-surahs-found">
                    <p>No surahs found matching "{surahSearchTerm}"</p>
                    <button 
                      className="btn-modern-outline"
                      onClick={() => setSurahSearchTerm('')}
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        );

      case 'memorize':
        const currentLine = getCurrentLine();
        const sessionTime = learningSession.startTime ? 
          Math.floor((Date.now() - learningSession.startTime) / 1000) : 0;
        
        return (
          <div className="modern-content">
            <h2 className="modern-title mb-4">Memorization</h2>
            
            {surahCompleted ? (
              <div className="completion-content">
                <div className="completion-card">
                  <div className="completion-icon">✓</div>
                  <h3 className="completion-title">Done!</h3>
                  <p className="completion-message">
                    You finished memorizing {currentSurahData?.name}.
                  </p>
                  <p className="completion-note">
                    Going back to home...
                  </p>
                </div>
              </div>
            ) : currentSurahData && currentLine ? (
              <div className="memorization-content">
                <div className="verse-card">
                  <div className="verse-info">
                    <h4 className="verse-surah">{currentSurahData.name} - Line {currentLineIndex + 1} of {currentSurahData.lines.length}</h4>
                    <div className="progress-indicator">
                      <span>Progress: {currentLineIndex + 1}/{currentSurahData.lines.length}</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{width: `${((currentLineIndex + 1) / currentSurahData.lines.length) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                    <div className="session-info">
                      <span>Practice Count: {learningSession.practiceCount}</span>
                      <span>Session Time: {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                  
                  <div className="verse-text">
                    {currentLine.arabic}
                  </div>
                  
                  <div className="translation-section">
                    <button 
                      className="btn-modern-outline"
                      onClick={() => setShowTranslation(!showTranslation)}
                    >
                      {showTranslation ? 'Hide Translation' : 'Show Translation'}
                    </button>
                    {showTranslation && (
                      <div className="verse-translation">
                        {currentLine.translation}
                      </div>
                    )}
                  </div>
                  
                  <div className="learning-input">
                    <h5>Try to recite from memory:</h5>
                    <textarea
                      className="verse-input"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type the line in Arabic..."
                      rows="3"
                    />
                    <div className="input-actions">
                      <button 
                        className="btn-modern"
                        onClick={checkUserInput}
                        disabled={!userInput.trim()}
                      >
                        Check Answer
                      </button>
                      <button 
                        className="btn-modern-outline"
                        onClick={() => setUserInput('')}
                      >
                        Clear
                      </button>
                    </div>
                    
                    {isCorrect !== null && (
                      <div className={`answer-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? 'Good job! Moving to next line...' : 'Try again, you\'re close.'}
                      </div>
                    )}
                  </div>
                  
                  <div className="verse-actions">
                    <button 
                      className="btn-modern"
                      onClick={nextLine}
                    >
                      Finished Line
                    </button>
                    <button 
                      className="btn-modern-outline"
                      onClick={startLearningSession}
                    >
                      Choose Different Surah
                    </button>
                    <button 
                      className="btn-modern-outline"
                      onClick={endLearningSession}
                    >
                      End Session
                    </button>
                  </div>
                  
                  <p className="learning-note">
                    Type the line correctly to move forward automatically.
                  </p>
                </div>
              </div>
            ) : (
              <div className="no-verse-content">
                <h3>Pick a surah</h3>
                <p>Select a surah to begin learning</p>
                <button 
                  className="btn-modern"
                  onClick={() => {
                    setActiveTab('home');
                    startLearningSession();
                  }}
                >
                  Choose Surah
                </button>
              </div>
            )}
          </div>
        );

      case 'progress':
        const dailyProgress = userProgress.memorizedVerses || 0;
        const weeklyProgress = Math.min(userProgress.weeklyGoal || 15, userProgress.memorizedVerses || 0);
        const dailyGoalProgress = Math.min(userProgress.dailyGoal || 3, dailyProgress);
        
        return (
          <div className="modern-content">
            <h2 className="modern-title mb-4">Your Progress</h2>
            
            {/* Main Statistics */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{userProgress.memorizedVerses || 0}</div>
                <div className="stat-label">Verses Memorized</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{userProgress.streak || 0}</div>
                <div className="stat-label">Day Streak</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{userProgress.totalTime || 0}</div>
                <div className="stat-label">Minutes Studied</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{surahs.length * 5}</div>
                <div className="stat-label">Total Verses</div>
              </div>
            </div>
            
            {/* Goals Progress */}
            <div className="goals-section mt-4">
              <h3 className="modern-section-title mb-3">Goals Progress</h3>
              <div className="goals-grid">
                <div className="goal-card">
                  <div className="goal-header">
                    <span className="goal-title">Daily Goal</span>
                    <span className="goal-progress">{dailyGoalProgress}/{userProgress.dailyGoal || 3}</span>
                  </div>
                  <div className="goal-bar">
                    <div 
                      className="goal-fill" 
                      style={{width: `${Math.min(100, (dailyGoalProgress / (userProgress.dailyGoal || 3)) * 100)}%`}}
                    ></div>
                  </div>
                </div>
                <div className="goal-card">
                  <div className="goal-header">
                    <span className="goal-title">Weekly Goal</span>
                    <span className="goal-progress">{weeklyProgress}/{userProgress.weeklyGoal || 15}</span>
                  </div>
                  <div className="goal-bar">
                    <div 
                      className="goal-fill" 
                      style={{width: `${Math.min(100, (weeklyProgress / (userProgress.weeklyGoal || 15)) * 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Learning Analytics */}
            <div className="analytics-section mt-4">
              <h3 className="modern-section-title mb-3">Learning Analytics</h3>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <div className="analytics-title">Average Study Time</div>
                  <div className="analytics-value">
                    {(userProgress.memorizedVerses || 0) > 0 ? 
                      Math.round((userProgress.totalTime || 0) / (userProgress.memorizedVerses || 1)) : 0} min/verse
                  </div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-title">Completion Rate</div>
                  <div className="analytics-value">
                    {surahs.length > 0 ? 
                      Math.round(((userProgress.memorizedVerses || 0) / (surahs.length * 5)) * 100) : 0}%
                  </div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-title">Learning Streak</div>
                  <div className="analytics-value">{userProgress.streak} days</div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-title">Last Study</div>
                  <div className="analytics-value">
                    {userProgress.lastStudyDate ? 
                      new Date(userProgress.lastStudyDate).toLocaleDateString() : 'Never'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Surah Progress */}
            <div className="progress-details mt-4">
              <h3 className="modern-section-title mb-3">Surah Progress</h3>
              <div className="surahs-progress-list">
                {surahs.map(surah => {
                  const progress = getSurahProgress(surah.id);
                  return (
                    <div key={surah.id} className="surah-progress-item">
                      <div className="surah-info">
                        <div className="surah-title">
                          {surah.name} ({surah.nameArabic})
                        </div>
                        <div className="surah-details">
                          <span>{surah.verses} verses</span>
                          {progress.completed && progress.completedDate && (
                            <span className="completion-date">
                              Completed: {new Date(progress.completedDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="surah-status">
                        {progress.completed ? (
                          <span className="status-memorized">Completed</span>
                        ) : (
                          <span className="status-not-started">Not Started</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="progress-actions mt-4">
              <button 
                className="btn-modern"
                onClick={() => setActiveTab('memorize')}
              >
                Continue Learning
              </button>
              <button 
                className="btn-modern-outline"
                onClick={() => setActiveTab('review')}
              >
                Review Verses
              </button>
            </div>
          </div>
        );

      case 'review':
        const completedSurahs = surahs.filter(surah => getSurahProgress(surah.id).completed);
        return (
          <div className="modern-content">
            <h2 className="modern-title mb-4">Review</h2>
            <div className="review-content">
              {completedSurahs.length > 0 ? (
                <div className="review-cards">
                  {completedSurahs.map(surah => {
                    const progress = getSurahProgress(surah.id);
                    return (
                      <div key={surah.id} className="review-card">
                        <div className="review-title">{surah.name} ({surah.nameArabic})</div>
                        <div className="review-info">
                          <span>{surah.verses} verses completed</span>
                          {progress.completedDate && (
                            <span>Completed: {new Date(progress.completedDate).toLocaleDateString()}</span>
                          )}
                        </div>
                        <button 
                          className="btn-modern"
                          onClick={() => {
                            selectSurah(surah);
                            startLearningSurah(surah);
                          }}
                        >
                          Review This Surah
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-review-content">
                  <p className="no-review-text">No surahs completed yet. Start learning to build your review list!</p>
                <button 
                  className="btn-modern"
                  onClick={() => {
                    setActiveTab('home');
                    startLearningSession();
                  }}
                >
                  Start Learning
                </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="modern-content">
            <h2 className="modern-title mb-4">Profile</h2>
            <div className="profile-content">
              <div className="profile-card">
                <div className="profile-avatar">
                  <span className="avatar-text">{(user.name || 'U').charAt(0).toUpperCase()}</span>
                </div>
                <div className="profile-info">
                  <h4 className="profile-name">{user.name || 'User'}</h4>
                  <p className="profile-email">{user.email || 'No email'}</p>
                </div>
                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-label">Surahs Completed</span>
                    <span className="stat-value">
                      {Object.values(userProgress.surahProgress || {}).filter(p => p.completed).length}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Study Time</span>
                    <span className="stat-value">{userProgress.totalTime || 0} min</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Learning Streak</span>
                    <span className="stat-value">{userProgress.streak || 0} days</span>
                  </div>
                </div>
                <button 
                  onClick={onSignOut} 
                  className="btn-modern-outline"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modern-dashboard">
      {/* Header */}
      <div className="modern-header">
        <div className="header-content">
          <div className="header-title">
            <span className="header-icon">Q</span>
            <span className="header-text">Quran Memorization</span>
          </div>
          <div className="header-user">
            <span className="user-name">{user.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="modern-main">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="modern-bottom-nav">
        <div className="nav-slider" style={{
          transform: `translateX(${(tabs.findIndex(tab => tab.id === activeTab) * 100)}%)`
        }}></div>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
