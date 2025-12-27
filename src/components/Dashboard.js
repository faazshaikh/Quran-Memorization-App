import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Dashboard.css';
import { completeQuranData } from '../data/quranData';
import apiService from '../services/api';

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
    surahProgress: {},
    surahGoals: {} // Format: { surahId: { targetLines: number } }
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
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [recognitionError, setRecognitionError] = useState(null);
  const [selectedSurahForGoal, setSelectedSurahForGoal] = useState(null);
  const [surahSearchGoal, setSurahSearchGoal] = useState('');
  const [targetLinesInput, setTargetLinesInput] = useState('');

  // Load progress from backend on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progress = await apiService.getProgress();
        setUserProgress(prev => ({
          ...prev,
          ...progress
        }));
      } catch (error) {
        console.error('Failed to load progress:', error);
        // Fallback to localStorage if backend fails
        const savedProgress = localStorage.getItem(`progress_${user.id}`);
        if (savedProgress) {
          try {
            setUserProgress(JSON.parse(savedProgress));
          } catch (e) {
            console.error('Failed to parse localStorage progress:', e);
          }
        }
      }
    };
    
    loadProgress();
  }, [user.id]);

  // Save progress to backend when it changes (with debounce)
  useEffect(() => {
    // Skip saving on initial load
    const isInitialLoad = !userProgress.totalVerses && Object.keys(userProgress.surahProgress || {}).length === 0;
    if (isInitialLoad) {
      return;
    }
    
    // Debounce saving to avoid too many API calls
    const timeoutId = setTimeout(async () => {
      try {
        await apiService.saveProgress(userProgress);
        // Also save to localStorage as backup
        localStorage.setItem(`progress_${user.id}`, JSON.stringify(userProgress));
      } catch (error) {
        console.error('Failed to save progress to backend:', error);
        // Fallback to localStorage if backend fails
        try {
          localStorage.setItem(`progress_${user.id}`, JSON.stringify(userProgress));
        } catch (e) {
          console.error('Failed to save to localStorage:', e);
        }
      }
    }, 1000); // Wait 1 second after last change before saving
    
    return () => clearTimeout(timeoutId);
  }, [userProgress, user.id]);
  useEffect(() => {
    // Use the complete Quran data from the imported file
    setSurahs(completeQuranData);
  }, []);

  // Use ref to store current values for recognition callback
  const currentSurahDataRef = useRef(currentSurahData);
  const currentLineIndexRef = useRef(currentLineIndex);
  const nextLineRef = useRef(null);
  const recognitionRef = useRef(null);
  const startListeningRef = useRef(null);
  const stopListeningRef = useRef(null);
  
  useEffect(() => {
    currentSurahDataRef.current = currentSurahData;
    currentLineIndexRef.current = currentLineIndex;
  }, [currentSurahData, currentLineIndex]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      // Try Arabic, but if it doesn't work well, we'll handle it
      recognitionInstance.lang = 'ar-SA'; // Arabic (Saudi Arabia)
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        setRecognitionError(null);
      };
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setRecognizedText(transcript);
        setIsListening(false);
        
        // Check the answer using refs
        const surahData = currentSurahDataRef.current;
        const lineIndex = currentLineIndexRef.current;
        
        if (surahData && lineIndex < surahData.lines.length) {
          const currentLine = surahData.lines[lineIndex];
          
          // Log for debugging
          console.log('Recognized:', transcript);
          console.log('Expected:', currentLine.arabic);
          
          // Clean and normalize both texts for comparison
          const transcriptClean = transcript.trim();
          const arabicClean = currentLine.arabic.trim();
          
          // Remove diacritics (tashkeel) from both texts for better comparison
          // Arabic speech recognition often doesn't include diacritics
          const removeDiacritics = (text) => {
            return text.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
          };
          
          const transcriptNormalized = removeDiacritics(transcriptClean);
          const arabicNormalized = removeDiacritics(arabicClean);
          
          // Direct comparison (exact match after normalization)
          const exactMatch = transcriptNormalized === arabicNormalized;
          
          // Similarity comparison using normalized text
          const similarity = calculateSimilarity(transcriptNormalized, arabicNormalized);
          
          // Length-based check - if lengths are very different, it's likely wrong
          const lengthRatio = Math.min(transcriptNormalized.length, arabicNormalized.length) / 
                             Math.max(transcriptNormalized.length, arabicNormalized.length);
          
          // Check if transcript contains Arabic characters
          const hasArabicChars = /[\u0600-\u06FF]/.test(transcript);
          
          // Stricter matching: Need high similarity AND reasonable length match
          // Only accept if similarity is > 0.6 AND length ratio > 0.7, OR exact match
          const isCorrectAnswer = exactMatch || 
                                  (similarity > 0.6 && lengthRatio > 0.7 && hasArabicChars);
          
          console.log('=== Voice Recognition Check ===');
          console.log('Recognized:', transcriptClean);
          console.log('Expected:', arabicClean);
          console.log('Normalized Recognized:', transcriptNormalized);
          console.log('Normalized Expected:', arabicNormalized);
          console.log('Similarity:', (similarity * 100).toFixed(1) + '%');
          console.log('Length Ratio:', (lengthRatio * 100).toFixed(1) + '%');
          console.log('Has Arabic:', hasArabicChars);
          console.log('Exact Match:', exactMatch);
          console.log('Result: ', isCorrectAnswer ? 'CORRECT' : 'INCORRECT');
          console.log('==============================');
          
          setIsCorrect(isCorrectAnswer);
          
          // Auto-advance to next line if correct
          if (isCorrectAnswer && nextLineRef.current) {
            setTimeout(() => {
              nextLineRef.current();
            }, 1500); // Wait 1.5 seconds to show the success message
          }
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          setRecognitionError('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          setRecognitionError('Microphone permission denied. Please allow microphone access.');
        } else {
          setRecognitionError('Speech recognition error. Please try again.');
        }
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
      recognitionRef.current = recognitionInstance;
    } else {
      setRecognitionError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
    }
    
    return () => {
      // Cleanup is handled by the recognition instance itself
    };
  }, []);

  // The surahs are already loaded from the imported complete Quran data above

  // Helper function to get surah progress (defined early so it can be used below)
  const getSurahProgress = (surahId) => {
    return userProgress.surahProgress[surahId] || { completed: false, linesMemorized: 0 };
  };

  // Calculate progress based on surah goals for circular progress bar
  const surahGoalsForProgress = userProgress.surahGoals || {};
  const goalEntries = Object.entries(surahGoalsForProgress);
  
  let totalTargetLines = 0;
  let totalCompletedLines = 0;
  
  if (goalEntries.length > 0) {
    goalEntries.forEach(([surahId, goal]) => {
      const surah = surahs.find(s => s.id === parseInt(surahId));
      if (surah) {
        const targetLines = goal.targetLines || surah.lines?.length || surah.verses;
        const progressData = getSurahProgress(surah.id);
        const currentLines = Math.min(progressData.linesMemorized || 0, targetLines);
        
        totalTargetLines += targetLines;
        totalCompletedLines += currentLines;
      }
    });
  }
  
  // Calculate overall progress percentage based on surah goals
  const progress = totalTargetLines > 0 
    ? Math.round((totalCompletedLines / totalTargetLines) * 100) 
    : 0;
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
      setRecognizedText('');
      setIsCorrect(null);
      setRecognitionError(null);
      
      // Automatically start recording for the next line after a brief delay
      setTimeout(() => {
        const rec = recognitionRef.current;
        const startFunc = startListeningRef.current;
        if (rec && startFunc) {
          try {
            startFunc();
          } catch (error) {
            console.log('Could not auto-start recording:', error);
          }
        }
      }, 800); // Delay to ensure state is updated and UI renders
    } else if (currentSurahData && currentLineIndex >= currentSurahData.lines.length - 1) {
      markSurahCompleted();
    }
  };
  
  // Store nextLine in ref so it's accessible in recognition callback
  useEffect(() => {
    nextLineRef.current = nextLine;
  });

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

  const checkVoiceInput = (transcript) => {
    if (!currentSurahData) return;
    
    const currentLine = currentSurahData.lines[currentLineIndex];
    // Compare the recognized text with the Arabic text
    // Note: Speech recognition for Arabic may not be perfect, so we use similarity matching
    const similarity = calculateSimilarity(transcript.toLowerCase(), currentLine.arabic.toLowerCase());
    const isCorrectAnswer = similarity > 0.5; // Lower threshold for voice recognition
    
    setIsCorrect(isCorrectAnswer);
    setRecognizedText(transcript);
    
    if (isCorrectAnswer) {
      setTimeout(() => {
        nextLine();
        setRecognizedText('');
      }, 2000);
    }
  };

  const startListening = () => {
    const rec = recognition || recognitionRef.current;
    if (rec) {
      setRecognitionError(null);
      setRecognizedText('');
      setIsCorrect(null); // Clear previous result when starting new recording
      try {
        // Try to start recognition
        rec.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        // If already started or invalid state, that's okay - it means it's already running
        if (error.name !== 'InvalidStateError' && error.name !== 'AbortError') {
          setRecognitionError('Could not start voice recognition. Please try again.');
        }
      }
    }
  };
  
  // Store startListening and stopListening in refs
  useEffect(() => {
    startListeningRef.current = startListening;
    stopListeningRef.current = stopListening;
  });

  // Add manual "Mark as Correct" option in case speech recognition fails
  const markAsCorrect = () => {
    setIsCorrect(true);
    setRecognizedText('Marked as correct by user');
  };

  const stopListening = () => {
    const rec = recognition || recognitionRef.current;
    if (rec && isListening) {
      try {
        rec.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
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
    { id: 'goals', icon: '●', label: 'Goals' },
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
                      <div className="progress-label">
                        {goalEntries.length > 0 
                          ? `${totalCompletedLines}/${totalTargetLines} lines`
                          : 'No goals set'}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="modern-subtitle mt-3">
                  {goalEntries.length > 0 
                    ? `Progress towards your ${goalEntries.length} surah goal${goalEntries.length > 1 ? 's' : ''}`
                    : 'Set goals to track your progress'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h3 className="modern-section-title mb-4">Quick Actions</h3>
              <div className="row g-3">
                <div className="col-6">
                  <div className="action-card" onClick={startLearningSession}>
                    <div className="action-icon action-icon-start"></div>
                    <div className="action-text">Start Learning</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="action-card" onClick={() => setActiveTab('review')}>
                    <div className="action-icon action-icon-review">R</div>
                    <div className="action-text">Review</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="action-card" onClick={() => setActiveTab('progress')}>
                    <div className="action-icon action-icon-progress">P</div>
                    <div className="action-text">Progress</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="action-card" onClick={() => setActiveTab('profile')}>
                    <div className="action-icon action-icon-profile"></div>
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
                    <h5>Recite from memory using your voice:</h5>
                    
                    <div className="voice-recognition-container">
                      <button 
                        className={`microphone-button ${isListening ? 'recording' : ''} ${isCorrect !== null && !isListening ? (isCorrect ? 'success-state' : 'error-state') : ''}`}
                        onClick={isListening ? stopListening : startListening}
                        disabled={!recognition}
                      >
                        <span className="microphone-icon">🎤</span>
                        <span className="microphone-text">
                          {isListening ? 'Stop Recording' : isCorrect === true ? '✓ Correct!' : isCorrect === false ? 'Try Again' : 'Click to Recite'}
                        </span>
                      </button>
                      
                      {isListening && (
                        <div className="recording-indicator">
                          <span className="recording-dot"></span>
                          <span>Listening... Please recite the verse now</span>
                        </div>
                      )}
                      
                      {recognizedText && !isListening && (
                        <div className="recognized-text">
                          <strong>What I heard:</strong> {recognizedText}
                          {currentSurahData && currentLineIndex < currentSurahData.lines.length && (
                            <div className="expected-text">
                              <strong>Expected:</strong> {currentSurahData.lines[currentLineIndex].arabic}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {recognitionError && (
                        <div className="recognition-error">
                          {recognitionError}
                        </div>
                      )}
                      
                      {!recognition && (
                        <div className="recognition-warning">
                          Voice recognition not available. Please use Chrome or Edge browser.
                        </div>
                      )}
                    </div>
                    
                    {isCorrect !== null && (
                      <div className={`answer-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? (
                          <div className="feedback-content">
                            <span className="feedback-icon">✓</span>
                            <span className="feedback-text">Excellent! Your recitation is correct. Moving to next line...</span>
                          </div>
                        ) : (
                          <div className="feedback-content">
                            <span className="feedback-icon">✗</span>
                            <span className="feedback-text">Not quite right. Try reciting again, or press "Mark as Correct" if you're sure you said it right.</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {isCorrect === false && (
                      <div className="manual-correction">
                        <button 
                          className="btn-modern-outline btn-small"
                          onClick={markAsCorrect}
                        >
                          Mark as Correct (I said it right)
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="verse-actions">
                    <button 
                      className={`btn-modern ${isCorrect === true ? 'btn-success' : ''}`}
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
                    Click the microphone to recite. If correct, it will automatically move to the next line.
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
        // Calculate total verses from all surahs
        const totalVerses = surahs.reduce((sum, surah) => sum + (surah.verses || surah.lines?.length || 0), 0);
        
        // Calculate goal progress (surah-based)
        const progressCompletedSurahs = Object.values(userProgress.surahProgress || {}).filter(p => p.completed).length;
        const progressDailyGoalProgress = Math.min(userProgress.dailyGoal || 3, progressCompletedSurahs);
        const progressWeeklyGoalProgress = Math.min(userProgress.weeklyGoal || 15, progressCompletedSurahs);
        
        // Get only surahs that have progress (completed or in progress)
        const surahsWithProgress = surahs.filter(surah => {
          const progress = getSurahProgress(surah.id);
          return progress.completed || progress.linesMemorized > 0;
        });
        
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
                <div className="stat-number">{totalVerses}</div>
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
                    <span className="goal-progress">{progressDailyGoalProgress}/{userProgress.dailyGoal || 3}</span>
                  </div>
                  <div className="goal-bar">
                    <div 
                      className="goal-fill" 
                      style={{width: `${Math.min(100, Math.round((progressDailyGoalProgress / (userProgress.dailyGoal || 3)) * 100))}%`}}
                    ></div>
                  </div>
                </div>
                <div className="goal-card">
                  <div className="goal-header">
                    <span className="goal-title">Weekly Goal</span>
                    <span className="goal-progress">{progressWeeklyGoalProgress}/{userProgress.weeklyGoal || 15}</span>
                  </div>
                  <div className="goal-bar">
                    <div 
                      className="goal-fill" 
                      style={{width: `${Math.min(100, Math.round((progressWeeklyGoalProgress / (userProgress.weeklyGoal || 15)) * 100))}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Surah Progress - Only show surahs with progress */}
            {surahsWithProgress.length > 0 && (
              <div className="progress-details mt-4">
                <h3 className="modern-section-title mb-3">Surah Progress</h3>
                <div className="surahs-progress-list">
                  {surahsWithProgress.map(surah => {
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
                            {!progress.completed && progress.linesMemorized > 0 && (
                              <span className="in-progress-indicator">
                                {progress.linesMemorized}/{surah.lines?.length || surah.verses} verses
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="surah-status">
                          {progress.completed ? (
                            <span className="status-memorized">Completed</span>
                          ) : (
                            <span className="status-in-progress">In Progress</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {surahsWithProgress.length === 0 && (
              <div className="no-progress-message mt-4">
                <p>You haven't started memorizing any surahs yet. Start learning to see your progress here!</p>
                <button 
                  className="btn-modern"
                  onClick={() => setActiveTab('home')}
                >
                  Start Learning
                </button>
              </div>
            )}
          </div>
        );

      case 'goals':
        const surahGoals = userProgress.surahGoals || {};
        
        const handleAddSurahGoal = (surah) => {
          setSelectedSurahForGoal(surah);
          setTargetLinesInput(String(surah.lines?.length || surah.verses || ''));
        };
        
        const handleSaveSurahGoal = (surah, targetLines) => {
          const lines = targetLines || surah.lines?.length || surah.verses || 1;
          setUserProgress(prev => ({
            ...prev,
            surahGoals: {
              ...(prev.surahGoals || {}),
              [surah.id]: { targetLines: parseInt(lines) }
            }
          }));
          setSelectedSurahForGoal(null);
          setTargetLinesInput('');
        };
        
        const handleRemoveSurahGoal = (surahId) => {
          setUserProgress(prev => {
            const newGoals = { ...prev.surahGoals };
            delete newGoals[surahId];
            return {
              ...prev,
              surahGoals: newGoals
            };
          });
        };
        
        const filteredSurahsForGoals = surahs.filter(surah => 
          surah.name.toLowerCase().includes(surahSearchGoal.toLowerCase()) ||
          surah.nameArabic.includes(surahSearchGoal)
        );
        
        return (
          <div className="modern-content">
            <h2 className="modern-title mb-4">Goals</h2>
            
            {/* Current Surah Goals */}
            {Object.keys(surahGoals).length > 0 && (
              <div className="goals-section mb-4">
                <h3 className="modern-section-title mb-3">Your Surah Goals</h3>
                <div className="surah-goals-list">
                  {Object.entries(surahGoals).map(([surahId, goal]) => {
                    const surah = surahs.find(s => s.id === parseInt(surahId));
                    if (!surah) return null;
                    const progress = getSurahProgress(surah.id);
                    const currentLines = progress.linesMemorized || 0;
                    const targetLines = goal.targetLines || surah.lines?.length || surah.verses;
                    const progressPercent = targetLines > 0 ? Math.round((currentLines / targetLines) * 100) : 0;
                    
                    return (
                      <div key={surahId} className="surah-goal-item">
                        <div className="surah-goal-info">
                          <div className="surah-goal-title">
                            {surah.name} ({surah.nameArabic})
                          </div>
                          <div className="surah-goal-progress-text">
                            {currentLines} / {targetLines} lines
                          </div>
                        </div>
                        <div className="surah-goal-progress-bar-container">
                          <div className="surah-goal-progress-bar">
                            <div 
                              className="surah-goal-progress-fill" 
                              style={{width: `${Math.min(100, progressPercent)}%`}}
                            ></div>
                          </div>
                          <div className="surah-goal-progress-percent">{progressPercent}%</div>
                        </div>
                        <button 
                          className="btn-remove-goal"
                          onClick={() => handleRemoveSurahGoal(parseInt(surahId))}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Add Surah Goal */}
            {!selectedSurahForGoal ? (
              <div className="goal-settings">
                <h3 className="modern-section-title mb-3">Add Surah Goal</h3>
                <div className="goal-settings-card">
                  <div className="surah-search-goals">
                    <input
                      type="text"
                      className="surah-search-input"
                      placeholder="Search surahs by name..."
                      value={surahSearchGoal}
                      onChange={(e) => setSurahSearchGoal(e.target.value)}
                    />
                  </div>
                  <div className="surahs-goals-grid">
                    {filteredSurahsForGoals
                      .filter(surah => !surahGoals[surah.id]) // Don't show already added surahs
                      .slice(0, 20) // Limit to 20 for performance
                      .map(surah => (
                        <div 
                          key={surah.id} 
                          className="surah-goal-select-card"
                          onClick={() => handleAddSurahGoal(surah)}
                        >
                          <div className="surah-goal-select-header">
                            <h4 className="surah-name">{surah.name}</h4>
                            <span className="surah-arabic">{surah.nameArabic}</span>
                          </div>
                          <div className="surah-goal-select-info">
                            <span>{surah.lines?.length || surah.verses} verses</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="goal-settings">
                <h3 className="modern-section-title mb-3">Set Goal for {selectedSurahForGoal.name}</h3>
                <div className="goal-settings-card">
                  <div className="goal-setting-item">
                    <label className="goal-setting-label">
                      Target Lines (out of {selectedSurahForGoal.lines?.length || selectedSurahForGoal.verses} total)
                    </label>
                    <input
                      type="number"
                      className="goal-setting-input"
                      value={targetLinesInput}
                      onChange={(e) => setTargetLinesInput(e.target.value)}
                      min="1"
                      max={selectedSurahForGoal.lines?.length || selectedSurahForGoal.verses}
                    />
                  </div>
                  <div className="goal-setting-actions">
                    <button 
                      className="btn-modern"
                      onClick={() => {
                        const targetLines = parseInt(targetLinesInput) || (selectedSurahForGoal.lines?.length || selectedSurahForGoal.verses);
                        if (selectedSurahForGoal) {
                          handleSaveSurahGoal(selectedSurahForGoal, targetLines);
                        }
                      }}
                    >
                      Save Goal
                    </button>
                    <button 
                      className="btn-modern-outline"
                      onClick={() => {
                        setSelectedSurahForGoal(null);
                        setTargetLinesInput('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
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
            <div className="header-logo">
              <svg className="logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="1" />
                  </linearGradient>
                </defs>
                {/* Book/Quran shape - cleaner design */}
                <rect x="6" y="8" width="28" height="24" rx="2" fill="url(#logoGradient)"/>
                <rect x="9" y="11" width="22" height="18" rx="1" fill="white"/>
                {/* Pages lines - simpler */}
                <line x1="16" y1="14" x2="16" y2="25" stroke="#10b981" strokeWidth="1" opacity="0.4"/>
                <line x1="20" y1="14" x2="20" y2="25" stroke="#10b981" strokeWidth="1" opacity="0.4"/>
                <line x1="24" y1="14" x2="24" y2="25" stroke="#10b981" strokeWidth="1" opacity="0.4"/>
              </svg>
            </div>
            <div className="header-text-container">
              <span className="header-text">Quran Memorization</span>
              <span className="header-subtitle">Memorize with ease</span>
            </div>
          </div>
          <div className="header-user">
            <span className="user-name">{user.name || user.fullName || 'User'}</span>
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
          transform: `translateX(${tabs.findIndex(tab => tab.id === activeTab) * 100}%)`
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
