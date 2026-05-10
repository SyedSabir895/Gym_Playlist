import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { useGoogleLogin } from '@react-oauth/google';

interface GoogleUserInfo {
  email: string;
  name: string;
  sub: string;
}

interface GoogleAuthResult {
  accessToken: string;
  userInfo: GoogleUserInfo;
}

/**
 * Platform-aware Google login hook.
 * - On Android/iOS (Capacitor native): uses the native GoogleAuth plugin.
 * - On Web/Electron: uses @react-oauth/google popup flow.
 */
export function useGoogleAuth(
  onSuccess: (result: GoogleAuthResult) => void,
  onError: (error: string) => void
) {
  const isNative = Capacitor.isNativePlatform();

  // Web/Electron popup flow
  const webGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then((res) => res.json());

        onSuccess({
          accessToken: tokenResponse.access_token,
          userInfo: {
            email: userInfo.email,
            name: userInfo.name,
            sub: userInfo.sub,
          },
        });
      } catch {
        onError('Failed to fetch Google user info.');
      }
    },
    onError: () => onError('Google Login failed. Please try again.'),
    scope: 'https://www.googleapis.com/auth/drive.file',
  });

  // Native Android/iOS flow
  const nativeGoogleLogin = async () => {
    try {
      // Initialize GoogleAuth with the client ID from env
      await GoogleAuth.initialize({
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        // @ts-ignore - type definitions are outdated but plugin supports this
        serverClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scopes: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file'],
        // @ts-ignore - type definitions are outdated but plugin supports this
        grantOfflineAccess: true,
      });

      const googleUser = await GoogleAuth.signIn();

      const accessToken =
        googleUser.authentication?.accessToken ||
        googleUser.authentication?.idToken ||
        '';

      onSuccess({
        accessToken,
        userInfo: {
          email: googleUser.email,
          name: googleUser.name || '',
          sub: googleUser.id,
        },
      });
    } catch (err: any) {
      // User cancelled or error occurred
      if (err?.error !== 'popup_closed_by_user') {
        console.error('Native Google Sign-In error:', err);
        onError('Google Sign-In failed. Please try again.');
      }
    }
  };

  return isNative ? nativeGoogleLogin : webGoogleLogin;
}
