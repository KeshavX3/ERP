# Google OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API or Google Identity API

## Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Configure the OAuth consent screen:
   - Application type: **Web application**
   - Application name: **ERP System**
   - Authorized domains: `localhost` (for development)

4. Set up OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: **ERP Web Client**
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:5000`
   - Authorized redirect URIs:
     - `http://localhost:3000`
     - `http://localhost:5000/api/auth/google/callback`

## Step 3: Configure Environment Variables

### Client (.env in /client folder):
```
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

### Server (.env in root folder):
```
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

## Step 4: Test the Integration

1. Start both server and client
2. Go to the login page
3. Click "Sign in with Google"
4. You should see a Google authentication popup
5. After successful authentication, you'll be logged into the ERP system

## Important Notes

- The Google Client ID should be the same for both client and server
- For production, update the authorized domains and redirect URIs
- Make sure to enable the Google Identity API in your Google Cloud project
- The user's Google profile information will be used to create/update their account

## Troubleshooting

- **Error: "Invalid client"**: Check if the Client ID is correct
- **Error: "Unauthorized"**: Check authorized domains and redirect URIs
- **Error: "Token verification failed"**: Ensure server and client have the same Client ID

## Security Considerations

- Never expose your Google Client Secret in client-side code
- Use HTTPS in production
- Regularly rotate your JWT secrets
- Implement proper CORS policies
