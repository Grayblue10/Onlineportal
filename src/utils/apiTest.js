import api from '../services/api';

/**
 * Test API connectivity and endpoints
 */
export const testApiConnectivity = async () => {
  const results = {
    baseUrl: api.defaults.baseURL,
    timestamp: new Date().toISOString(),
    tests: []
  };

  // Test 1: Basic connectivity
  try {
    const response = await api.get('/api/test');
    results.tests.push({
      name: 'Basic Connectivity',
      endpoint: '/api/test',
      status: 'success',
      statusCode: response.status,
      data: response.data
    });
  } catch (error) {
    results.tests.push({
      name: 'Basic Connectivity',
      endpoint: '/api/test',
      status: 'failed',
      error: error.message,
      statusCode: error.response?.status
    });
  }

  // Test 2: Teacher Dashboard (without auth - should fail gracefully)
  try {
    const response = await api.get('/api/teachers/dashboard');
    results.tests.push({
      name: 'Teacher Dashboard',
      endpoint: '/api/teachers/dashboard',
      status: 'success',
      statusCode: response.status,
      hasData: !!response.data
    });
  } catch (error) {
    results.tests.push({
      name: 'Teacher Dashboard',
      endpoint: '/api/teachers/dashboard',
      status: 'expected_auth_error',
      error: error.message,
      statusCode: error.response?.status,
      note: 'Expected to fail without authentication'
    });
  }

  // Test 3: Available Subjects
  try {
    const response = await api.get('/api/teachers/available-subjects');
    results.tests.push({
      name: 'Available Subjects',
      endpoint: '/api/teachers/available-subjects',
      status: 'success',
      statusCode: response.status,
      hasData: !!response.data
    });
  } catch (error) {
    results.tests.push({
      name: 'Available Subjects',
      endpoint: '/api/teachers/available-subjects',
      status: 'expected_auth_error',
      error: error.message,
      statusCode: error.response?.status
    });
  }

  return results;
};

/**
 * Display test results in console
 */
export const displayTestResults = (results) => {
  console.group('🧪 API Connectivity Test Results');
  console.log(`🌐 Base URL: ${results.baseUrl}`);
  console.log(`⏰ Timestamp: ${results.timestamp}`);
  console.log('');
  
  results.tests.forEach((test, index) => {
    const icon = test.status === 'success' ? '✅' : 
                 test.status === 'expected_auth_error' ? '🔐' : '❌';
    
    console.log(`${icon} ${test.name}`);
    console.log(`   Endpoint: ${test.endpoint}`);
    console.log(`   Status: ${test.status}`);
    console.log(`   Status Code: ${test.statusCode || 'N/A'}`);
    
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
    
    if (test.note) {
      console.log(`   Note: ${test.note}`);
    }
    
    console.log('');
  });
  
  console.groupEnd();
  
  const successCount = results.tests.filter(t => t.status === 'success').length;
  const totalCount = results.tests.length;
  
  console.log(`📊 Summary: ${successCount}/${totalCount} tests successful`);
  
  return results;
};
