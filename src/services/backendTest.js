// Simple backend connectivity test
export const testBackendConnection = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/auth/validate', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Backend connection test - Status:', response.status);
    return response.status !== 0; // Any response means backend is running
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
};

export const checkBackendHealth = async () => {
  try {
    // Try to reach the backend
    const response = await fetch('http://localhost:8080/api/auth/validate', {
      method: 'GET',
      mode: 'no-cors', // This will always succeed but won't give us the response
    });
    return true;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

