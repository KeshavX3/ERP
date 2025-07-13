import React from 'react';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

const GoogleAuthButton = ({ onSuccess, onError, buttonText = "Continue with Google", disabled = false }) => {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  // Don't render if no Google Client ID is configured
  if (!googleClientId || googleClientId === 'your-google-client-id-here') {
    return (
      <div className="google-auth-placeholder">
        <Button variant="outline-secondary" className="w-100" disabled>
          <i className="fas fa-cog me-2"></i>
          Google OAuth Not Configured
        </Button>
        <small className="text-muted mt-1 d-block text-center">
          Please configure REACT_APP_GOOGLE_CLIENT_ID in .env file
        </small>
      </div>
    );
  }
  const handleGoogleLogin = () => {
    try {
      // Initialize Google Identity Services
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Prompt the one-tap UI or redirect to login
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // One-tap was not displayed, show the button login
            window.google.accounts.id.renderButton(
              document.getElementById("google-signin-button"),
              {
                theme: "outline",
                size: "large",
                width: "100%",
                text: "continue_with",
                shape: "rectangular"
              }
            );
          }
        });
      } else {
        toast.error('Google authentication not available');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Failed to initialize Google login');
    }
  };

  const handleCredentialResponse = async (response) => {
    try {
      console.log("Google credential response:", response);
      
      if (response.credential) {
        // Send the credential to your backend for verification
        const result = await fetch('http://localhost:5000/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential: response.credential
          })
        });

        const data = await result.json();
        
        if (result.ok) {
          onSuccess(data);
        } else {
          throw new Error(data.message || 'Google authentication failed');
        }
      }
    } catch (error) {
      console.error('Google credential processing error:', error);
      if (onError) {
        onError(error);
      } else {
        toast.error('Google authentication failed');
      }
    }
  };

  return (
    <div className="google-auth-container">
      <Button
        variant="outline-danger"
        className="google-auth-btn w-100"
        onClick={handleGoogleLogin}
        disabled={disabled}
      >
        <div className="d-flex align-items-center justify-content-center">
          <svg width="18" height="18" viewBox="0 0 24 24" className="me-2">
            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {buttonText}
        </div>
      </Button>
      
      {/* Hidden div for Google button rendering */}
      <div id="google-signin-button" style={{ display: 'none' }}></div>
    </div>
  );
};

export default GoogleAuthButton;
