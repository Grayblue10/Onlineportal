import api from './api';

// Track if we're currently refreshing token
let isRefreshing = false;
let refreshQueue = [];

const transformUserData = (user) => {
  if (!user) return null;
  
  return {
    id: user._id || user.id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    email: user.email || '',
    role: user.role || 'student',
    isActive: user.isActive !== false,
    ...(user.studentId && { studentId: user.studentId }),
    ...(user.employeeId && { employeeId: user.employeeId }),
    ...(typeof user.yearLevel !== 'undefined' ? { yearLevel: user.yearLevel } : {})
  };
};

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config || {};

    // Do not attempt refresh for requests explicitly opting out
    if (originalRequest.headers && originalRequest.headers['x-skip-auth-refresh']) {
      return Promise.reject(error);
    }

    // Only attempt refresh on 401 errors and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const newToken = await refreshToken();
        
        // Update the original request with new token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Process queued requests
        refreshQueue.forEach(({ resolve }) => resolve(newToken));
        refreshQueue = [];
        
        return api(originalRequest);
      } catch (refreshError) {
        // Clear auth data if refresh fails
        refreshQueue.forEach(({ reject }) => reject(refreshError));
        refreshQueue = [];
        logout();
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

const refreshToken = async () => {
  try {
    const existingToken = localStorage.getItem('token');
    const response = await api.post(
      '/api/auth/refresh',
      {},
      {
        withCredentials: true,
        headers: {
          'x-skip-auth-refresh': 'true',
          ...(existingToken ? { Authorization: `Bearer ${existingToken}` } : {}),
        },
      }
    );
    const newToken = response.data?.data?.token || response.data?.token;
    if (!newToken) {
      throw new Error('No token returned from refresh');
    }
    localStorage.setItem('token', newToken);
    return newToken;
  } catch (error) {
    console.error('Refresh token failed:', error);
    throw error;
  }
};

const register = async (userData) => {
  try {
    const response = await api.post('/api/auth/register', userData);
    
    console.log('Registration response:', response.data);
    
    let userResponse, token;
    
    // Handle the response format: { success, data: { user, token }, message }
    if (response.data?.data?.user && response.data?.data?.token) {
      userResponse = response.data.data.user;
      token = response.data.data.token;
    } 
    // Handle any other potential response formats
    else if (response.data?.user && response.data?.token) {
      userResponse = response.data.user;
      token = response.data.token;
    } else {
      console.error('Unexpected response format:', response.data);
      throw new Error('Invalid response format from server');
    }
    
    if (!token) {
      console.error('No token received in response');
      throw new Error('Authentication token not received');
    }
    
    localStorage.setItem('token', token);
    const user = transformUserData(userResponse);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { user, token };
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error.response?.status === 409 ? 'Email already exists' :
                        error.response?.status === 400 ? (error.response.data?.message || 'Invalid registration data') :
                        error.response?.data?.message || error.message || 'Registration failed. Please try again.';
    const e = new Error(errorMessage);
    // Preserve axios response/status so UI can branch on it (e.g., 403 admin cap)
    e.response = error.response;
    e.status = error.response?.status;
    throw e;
  }
};

const login = async ({ email, password }) => {
  try {
    const response = await api.post('/api/auth/login', { 
      email: email.trim().toLowerCase(), 
      password 
    }, { withCredentials: true });
    
    console.log('Full response:', response);
    console.log('Response data:', response.data);
    
    const data = response.data || response;
    
    console.log('Processed data:', data);
    console.log('Token exists:', !!data?.token);
    console.log('User exists:', !!data?.user);
    console.log('Data.data exists:', !!data?.data);
    
    // Backend returns { success: true, data: { token, user } }
    const actualData = data.data || data;
    
    console.log('Actual data:', actualData);
    console.log('Actual token exists:', !!actualData?.token);
    console.log('Actual user exists:', !!actualData?.user);
    
    if (!actualData?.token || !actualData?.user) {
      console.error('Missing token or user in response:', { 
        hasToken: !!actualData?.token, 
        hasUser: !!actualData?.user,
        fullData: actualData 
      });
      throw new Error('Invalid response from server');
    }

    localStorage.setItem('token', actualData.token);
    const user = transformUserData(actualData.user);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { 
      user,
      token: actualData.token
    };
  } catch (error) {
    console.error('Login error details:', error);
    console.error('Error response:', error.response);
    const errorMessage = error.response?.status === 401 ? (error.response?.data?.message || 'Invalid email or password') :
                        error.response?.status === 403 ? (error.response?.data?.message || 'Account not verified') :
                        error.response?.status === 404 ? (error.response?.data?.message || 'Account not found') :
                        error.response?.data?.message || error.message || 'Login failed. Please try again.';
    const e = new Error(errorMessage);
    // Preserve axios response/status so UI can branch on it
    e.response = error.response;
    e.status = error.response?.status;
    throw e;
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Optionally call logout endpoint
  return api.post('/api/auth/logout', {}, { withCredentials: true });
};

const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/auth/me');
    const data = response.data || response;
    
    if (!data?.data && !data?.user) {
      logout();
      return null;
    }
    
    const userData = data.data || data.user || data;
    const user = transformUserData(userData);
    
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    if (error.response?.status === 401) {
      logout();
    }
    return null;
  }
};

const forgotPassword = async (email) => {
  try {
    const response = await api.post('/api/auth/forgot-password', { 
      email: email.trim().toLowerCase() 
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.status === 404 ? 'Email not found' :
                        error.response?.data?.message || 'Password reset request failed. Please try again.';
    throw new Error(errorMessage);
  }
};

const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post(`/api/auth/reset-password/${encodeURIComponent(token)}`,
      { password: newPassword }
    );
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.status === 400 ? 'Invalid or expired token' :
                        error.response?.status === 401 ? 'Unauthorized request' :
                        error.response?.data?.message || 'Password reset failed. Please try again.';
    throw new Error(errorMessage);
  }
};

export { 
  register, 
  login, 
  logout,
  getCurrentUser,
  refreshToken,
  forgotPassword,
  resetPassword
};