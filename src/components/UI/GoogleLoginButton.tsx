import React, { useCallback } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Mail } from 'lucide-react';

interface GoogleLoginButtonProps {
  onSuccess: (credentialResponse: any) => void;
  onError?: () => void;
  text?: 'signin_with' | 'signup_with' | 'signin' | 'signup';
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ 
  onSuccess, 
  onError,
  text = 'signin_with'
}) => {
  const handleError = useCallback(() => {
    console.error('Google login failed');
    onError?.();
  }, [onError]);

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={handleError}
        text={text}
        size="large"
        width="100"
      />
    </div>
  );
};

export default GoogleLoginButton;
