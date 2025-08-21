import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:7000/api/v1';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  confirmPassword: 'password123',
  address: '123 Test St, Test City'
};

let authToken = '';

// Helper function to make requests
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    },
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    
    console.log(`\n${options.method || 'GET'} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { response, data };
  } catch (error) {
    console.error(`Error in ${endpoint}:`, error.message);
    return { response: null, data: null };
  }
}

// Test functions
async function testSignup() {
  console.log('\n🔐 Testing User Signup...');
  const { data } = await makeRequest('/users/signup', {
    method: 'POST',
    body: JSON.stringify(testUser)
  });
  
  if (data.status === 'success' && data.data.token) {
    authToken = data.data.token;
    console.log('✅ Signup successful, token received');
  }
}

async function testLogin() {
  console.log('\n🔐 Testing User Login...');
  const { data } = await makeRequest('/users/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password
    })
  });
  
  if (data.status === 'success' && data.data.token) {
    authToken = data.data.token;
    console.log('✅ Login successful, token received');
  }
}

async function testGetCategories() {
  console.log('\n📂 Testing Get Categories...');
  await makeRequest('/movies/categories');
}

async function testGetMovies() {
  console.log('\n🎬 Testing Get Movies...');
  await makeRequest('/movies');
}

async function testGetMoviesWithFilters() {
  console.log('\n🔍 Testing Get Movies with Filters...');
  await makeRequest('/movies?category=Action&search=action&sort=rating');
}

async function testGetProfile() {
  console.log('\n👤 Testing Get Profile...');
  await makeRequest('/users/me');
}

async function testUpdateProfile() {
  console.log('\n✏️ Testing Update Profile...');
  await makeRequest('/users/updateProfile', {
    method: 'PATCH',
    body: JSON.stringify({
      name: 'Updated Test User',
      address: '456 Updated St, Updated City',
      dateOfBirth: '1990-01-01'
    })
  });
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  try {
    // Test public endpoints first
    await testGetCategories();
    await testGetMovies();
    await testGetMoviesWithFilters();
    
    // Test authentication
    await testSignup();
    await testLogin();
    
    // Test protected endpoints
    await testGetProfile();
    await testUpdateProfile();
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests };
