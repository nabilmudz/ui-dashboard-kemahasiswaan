import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('access_token') || null);
  const refreshToken = ref(localStorage.getItem('refresh_token') || null);
  const user = ref(JSON.parse(localStorage.getItem('user_profile')) || null);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!accessToken.value);

  function setTokens(tokens) {
    accessToken.value = tokens.access_token;
    refreshToken.value = tokens.refresh_token;
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);

    try {
      // Decode JWT token to extract user profile
      const decoded = jwtDecode(tokens.access_token);
      console.log('Decoded JWT payload:', decoded);
      
      user.value = {
        id: decoded.sub,
        nama: decoded.name || 'Farras Kuy',
        username: decoded.username || 'farraskuy',
        role: decoded.role || 'Super Admin',
        foto: decoded.foto || 'default.png',
      };
      
      localStorage.setItem('user_profile', JSON.stringify(user.value));
    } catch (e) {
      console.error('Failed to decode JWT access token:', e);
      // Set default fallback values
      user.value = {
        id: '1',
        nama: 'Farras Kuy',
        username: 'farraskuy',
        role: 'Super Admin',
        foto: 'default.png'
      };
      localStorage.setItem('user_profile', JSON.stringify(user.value));
    }
  }

  function clearAuth() {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_profile');
  }

  async function handleSSOCallback(code) {
    loading.value = true;
    try {
      const tokens = await SSO.exchangeCodeForToken(code);
      setTokens(tokens);
    } finally {
      loading.value = false;
    }
  }

  async function refreshJWT() {
    // Simulating call to token refresh endpoint
    if (!refreshToken.value) throw new Error('No refresh token available');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock new access token with extended expiration
    const newAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkZhcnJhcyBLdXkiLCJ1c2VybmFtZSI6ImZhcnJhc2t1eSIsInJvbGUiOiJTdXBlciBBZG1pbiIsImZvdG8iOiJkZWZhdWx0LnBuZyIsImV4cCI6MTgwNzkwMDYwMH0.signature';
    
    const tokens = {
      access_token: newAccessToken,
      refresh_token: refreshToken.value
    };
    
    setTokens(tokens);
    return tokens;
  }

  function logout() {
    clearAuth();
    window.location.href = '/login';
  }

  return {
    accessToken,
    refreshToken,
    user,
    loading,
    isAuthenticated,
    setTokens,
    clearAuth,
    handleSSOCallback,
    refreshJWT,
    logout,
  };
});
