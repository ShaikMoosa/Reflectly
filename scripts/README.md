# Lemon Squeezy Webhook Tester

This script allows you to test your Lemon Squeezy webhook integration locally by simulating webhook events.

## Setup

1. Make sure you have Node.js installed
2. Install dependencies:
   ```
   cd scripts
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the scripts directory with:
     ```
     LEMON_SQUEEZY_WEBHOOK_SECRET=your_secret_here
     ```
   - **IMPORTANT**: Never commit this file to version control
4. Update the `USER_ID` constant in `test-lemonsqueezy-webhook.js` to a valid user ID in your system

## Usage

1. Make sure your application is running locally (e.g., `npm run dev`)
2. Run the test script:
   ```
   npm test
   ```

## What the test does

The script will send the following test webhook events to your application:

1. `order_created`: Simulates a new order being created
2. `subscription_created`: Simulates a new subscription being created
3. `subscription_updated`: Simulates an existing subscription being updated
4. `subscription_cancelled`: Simulates a subscription being cancelled

All events will be signed with the proper HMAC signature to pass verification.

## Security Note

This test script uses your webhook secret to generate valid signatures. The script has been updated to:
- Read the secret from environment variables instead of hardcoding it
- Provide clear error messages if the environment variable is not set
- Avoid exposing your secret in the code

## Checking results

The test script will log the response from your webhook handler. Additionally, you can check:

1. Your application logs for any errors
2. Your database to confirm that user subscription data was updated correctly
3. Your application UI to verify that subscription status is displayed correctly

## Troubleshooting

- If you get a connection error, make sure your application is running locally
- If you get signature verification errors, make sure the environment variable has the correct secret value
- If no user is found, update the `USER_ID` constant to a valid user ID in your system 