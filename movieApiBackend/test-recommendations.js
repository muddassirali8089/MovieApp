// Test file for Movie Recommendation APIs
// Run this with: node test-recommendations.js

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:7000/api/v1';
let authToken = '';

// Test user credentials (you'll need to create this user first)
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

// Helper function to make authenticated requests
async function makeAuthRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      ...options.headers
    }
  });
  return response.json();
}

// Test the recommendation APIs
async function testRecommendations() {
  console.log('🎬 Testing Movie Recommendation APIs...\n');

  try {
    // 1. Test basic recommendations
    console.log('1️⃣ Testing Basic Recommendations:');
    const basicRecs = await makeAuthRequest(`${BASE_URL}/movies/recommendations`);
    console.log(`✅ Basic recommendations: ${basicRecs.results} movies found`);
    if (basicRecs.data?.recommendations?.length > 0) {
      console.log(`   Top recommendation: ${basicRecs.data.recommendations[0].title} (Score: ${basicRecs.data.recommendations[0].recommendationScore})`);
    }
    console.log('');

    // 2. Test advanced collaborative filtering
    console.log('2️⃣ Testing Advanced Collaborative Filtering:');
    const advancedRecs = await makeAuthRequest(`${BASE_URL}/movies/recommendations/advanced`);
    console.log(`✅ Advanced recommendations: ${advancedRecs.results} movies found`);
    if (advancedRecs.data?.recommendations?.length > 0) {
      console.log(`   Method: ${advancedRecs.data.method}`);
      console.log(`   Similar users found: ${advancedRecs.data.similarUsersFound}`);
    }
    console.log('');

    // 3. Test category-based recommendations
    console.log('3️⃣ Testing Category-Based Recommendations:');
    const categoryRecs = await makeAuthRequest(`${BASE_URL}/movies/recommendations/category`);
    console.log(`✅ Category recommendations: ${categoryRecs.results} movies found`);
    if (categoryRecs.data?.categoryAnalysis) {
      console.log(`   Categories analyzed: ${Object.keys(categoryRecs.data.categoryAnalysis).length}`);
      console.log(`   Under-explored categories: ${categoryRecs.data.underExploredCategories?.length || 0}`);
    }
    console.log('');

    // 4. Test comprehensive recommendations
    console.log('4️⃣ Testing Comprehensive Recommendations:');
    const comprehensiveRecs = await makeAuthRequest(`${BASE_URL}/movies/recommendations/comprehensive`);
    console.log(`✅ Comprehensive recommendations: ${comprehensiveRecs.results} movies found`);
    if (comprehensiveRecs.data?.methodStats) {
      console.log(`   Method breakdown:`);
      console.log(`     - Basic: ${comprehensiveRecs.data.methodStats.basic}`);
      console.log(`     - Advanced: ${comprehensiveRecs.data.methodStats.advanced}`);
      console.log(`     - Category: ${comprehensiveRecs.data.methodStats.category}`);
      console.log(`     - Total: ${comprehensiveRecs.data.methodStats.total}`);
    }
    console.log('');

    // 5. Test with custom limit
    console.log('5️⃣ Testing with Custom Limit (5 movies):');
    const limitedRecs = await makeAuthRequest(`${BASE_URL}/movies/recommendations?limit=5`);
    console.log(`✅ Limited recommendations: ${limitedRecs.results} movies found (requested: 5)`);
    console.log('');

    console.log('🎉 All recommendation API tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing recommendations:', error.message);
  }
}

// Test authentication first
async function testAuth() {
  console.log('🔐 Testing Authentication...');
  
  try {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    if (data.status === 'success' && data.token) {
      authToken = data.token;
      console.log('✅ Authentication successful!');
      return true;
    } else {
      console.log('❌ Authentication failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Movie Recommendation API Tests\n');
  
  const authSuccess = await testAuth();
  if (!authSuccess) {
    console.log('❌ Cannot proceed without authentication. Please create a test user first.');
    return;
  }

  await testRecommendations();
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testRecommendations, testAuth };
