const fetch = require('node-fetch');
require('dotenv').config();

// Configuration
const API_URL = 'http://localhost:3000/api';
const USER_ID = process.env.TEST_USER_ID || 'test_user_id'; // Get from environment variables if available
const AUTH_TOKEN = process.env.AUTH_TOKEN || ''; // If you have authentication

/**
 * Gets the current subscription status for a user
 * Note: This is a mock function since the actual endpoint would require authentication
 * You would typically need to get an auth token for a test user
 */
async function getSubscriptionStatus() {
  try {
    console.log('Checking subscription status...');
    
    // In a real test, you would call your API endpoint that returns subscription status
    // Since we can't easily authenticate as a test user, this is provided as a reference
    
    // Example of how you would make the request:
    /*
    const response = await fetch(`${API_URL}/user/subscription`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Subscription status:', data);
    return data;
    */
    
    // For now, just query the database directly (you would run this server-side)
    console.log('To check subscription status:');
    console.log('1. Run this SQL query in your Supabase dashboard:');
    console.log(`SELECT * FROM user_subscriptions WHERE user_id = '${USER_ID}';`);
    console.log('2. Check the "status" field to see if it matches expected value');
    console.log('3. Navigate to /account in your app to see if the UI displays correctly');
  } catch (error) {
    console.error('Error checking subscription status:', error);
  }
}

/**
 * Test the account page rendering with subscription data
 */
async function testAccountPage() {
  try {
    console.log('Testing account page rendering...');
    console.log('To test the account page:');
    console.log('1. Sign in to your application');
    console.log('2. Navigate to /account');
    console.log('3. Verify that subscription status is displayed correctly');
    console.log('4. Verify that usage limits are displayed correctly');
  } catch (error) {
    console.error('Error testing account page:', error);
  }
}

/**
 * Run the tests
 */
async function runTests() {
  console.log('Testing Subscription Status...');
  console.log('---------------------------------------------------');
  
  await getSubscriptionStatus();
  console.log('---------------------------------------------------');
  await testAccountPage();
  
  console.log('---------------------------------------------------');
  console.log('Tests completed!');
}

// Run the tests
runTests(); 