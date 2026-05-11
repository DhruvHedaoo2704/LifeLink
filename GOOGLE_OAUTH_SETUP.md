# Google OAuth Setup Guide for LifeLink

## Overview
This guide helps you set up Google OAuth authentication for the LifeLink blood donation application. Users can now sign in and register using their Google accounts.

## Features Added
- ✅ Google Sign-In on Login page
- ✅ Google Sign-Up on Register page
- ✅ Automatic user profile creation for Google OAuth users
- ✅ Linking Google accounts to existing email addresses
- ✅ Backend token verification using Google Auth Library

## Step 1: Get Google OAuth Credentials

### 1. Go to Google Cloud Console
- Visit [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project (or select an existing one)
- Name it "LifeLink" or similar

### 2. Enable Google+ API
- In the Console, go to **APIs & Services** > **Library**
- Search for "Google+ API"
- Click on it and press **Enable**

### 3. Create OAuth 2.0 Credentials
- Go to **APIs & Services** > **Credentials**
- Click **+ Create Credentials**
- Select **OAuth client ID**
- Choose **Web application**
- Add authorized JavaScript origins:
  - `http://localhost:5173` (for local development with Vite)
  - `http://localhost:3000` (if using different dev port)
  - Your production domain (e.g., `https://myapp.com`)
- Add authorized redirect URIs:
  - `http://localhost:5173` (or your dev URL)
  - `http://localhost:5000/api/auth/google-callback` (backend endpoint)
  - Your production URLs

### 4. Copy Your Client ID
- Copy the **Client ID** from the credentials page
- You'll need this for both frontend and backend

## Step 2: Configure Frontend

### 1. Set Environment Variable
Edit `.env` file in the root directory:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

Replace `your_google_client_id_here` with your actual Client ID from Step 1.

### 2. Vite Configuration
The frontend is already configured to use the environment variable. The GoogleOAuthProvider wrapper is set up in `src/App.tsx`.
- Environment variable uses `VITE_` prefix (Vite convention)
- Accessed via `import.meta.env.VITE_GOOGLE_CLIENT_ID`

## Step 3: Configure Backend

### 1. Set Environment Variable
Edit `backend/.env` file:
```
GOOGLE_CLIENT_ID=your_google_client_id_here
```

Replace `your_google_client_id_here` with the same Client ID.

### 2. Backend Routes
The following endpoint has been added:
- **POST** `/api/auth/google-login`
  - Accepts Google ID token
  - Verifies token using Google Auth Library
  - Creates or updates user profile
  - Returns JWT token

## Step 4: Update User Model

The User model has been updated with:
- `googleId` field: Stores the Google user ID
- `password` field: Made optional for OAuth users
- Geospatial indexing: For location-based queries

## Step 5: Testing Google OAuth

### Local Testing
1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start your frontend dev server:
   ```bash
   cd ..
   npm run dev
   ```

3. Visit `http://localhost:5173/login` or `/register`
4. Click the Google Sign-In/Sign-Up button
5. Complete the OAuth flow

### Expected Behavior
- **New Google User**: Creates a new account with default values
  - Blood Type: O+ (user can update later)
  - Phone: Empty (user will add during onboarding)
  - Location: Default coordinates (user will add during onboarding)
  - User Type: Donor (selected from radio buttons)

- **Existing Email User**: Automatically links Google account to existing profile
- **After Login**: User is redirected to dashboard

## How Google Login Works

### Frontend Flow
1. User clicks Google Sign-In button
2. Google OAuth popup appears
3. User authenticates with Google
4. Frontend receives ID token
5. Token is sent to backend

### Backend Flow
1. Backend receives ID token
2. Token is verified using Google Auth Library
3. User is created or fetched from database
4. JWT token is issued
5. User is logged in

## Security Features

✅ **Token Verification**: Google tokens are verified server-side
✅ **JWT Authentication**: Backend uses JWT for session management
✅ **No Password Storage**: OAuth users don't need passwords
✅ **Email Verification**: Google handles email verification
✅ **Secure Token Exchange**: HTTPS required in production

## Troubleshooting

### "Google login failed" error
- Check that `REACT_APP_GOOGLE_CLIENT_ID` is set in `.env`
- Verify Client ID is correct
- Clear browser cache and try again
- Check browser console for detailed error messages

### "Invalid Google token" error
- Backend cannot verify token
- Check `GOOGLE_CLIENT_ID` in `backend/.env`
- Ensure backend has `google-auth-library` installed
- Verify Network tab shows request to backend

### CORS Issues
- If you see CORS errors, backend needs CORS headers
- Check that backend is running on `http://localhost:5000`
- Ensure request URL is correct

### User Not Created
- Check MongoDB connection in backend
- Verify `MONGO_URI` in `backend/.env` is correct
- Check backend console for errors

## Files Modified/Created

### Frontend
- ✅ `src/App.tsx` - Added GoogleOAuthProvider wrapper
- ✅ `src/pages/Login.tsx` - Added Google Sign-In button
- ✅ `src/pages/Register.tsx` - Added Google Sign-Up button
- ✅ `src/context/AuthContext.tsx` - Added googleLogin method
- ✅ `src/types/index.ts` - Added googleLogin to AuthContextType
- ✅ `src/components/UI/GoogleLoginButton.tsx` - Google button component
- ✅ `.env` - Environment configuration
- ✅ `.env.example` - Configuration template

### Backend
- ✅ `backend/models/User.js` - Updated User schema with googleId
- ✅ `backend/routes/auth.js` - Added `/google-login` endpoint
- ✅ `backend/.env` - Added GOOGLE_CLIENT_ID

## Next Steps

1. **Get Google OAuth Credentials** (if not done already)
2. **Update Environment Variables** in `.env` files
3. **Test Google OAuth** locally
4. **Update Onboarding Flow** for Google users to add required fields
5. **Deploy** with proper environment variables

## Optional: Enhanced Onboarding

Google users currently get default values. Consider adding:
- Onboarding wizard for blood type selection
- Location setup during first login
- Phone number input during registration
- Profile photo sync from Google

## Security Checklist

- [ ] Google Client ID is kept secret (not in git)
- [ ] `.env` files are added to `.gitignore`
- [ ] Backend verifies all tokens server-side
- [ ] HTTPS is enabled in production
- [ ] Password field validation updated for optional passwords
- [ ] Database backups configured

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
3. Check browser console and network tab for errors
4. Review backend logs
