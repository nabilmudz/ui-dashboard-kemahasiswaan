import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('access_token') || null);
  const refreshToken = ref(localStorage.getItem('refresh_token') || null);
  const loading = ref(false);
  const hasFetchedUser = ref(false);

  const isAuthenticated = computed(() => !!user.value);

  function mapAccessibleApps(apps) {
    if (!apps) return [];
    return apps.map(app => {
      const source = typeof app === 'string' ? app : app.appSource;
      const isAvailable = typeof app === 'string' ? true : (app.isAvailable !== undefined ? app.isAvailable : true);
      
      let deepLinkUrl = '';
      switch (source) {
        case 'PKM': deepLinkUrl = 'https://pkm.andiputraw.my.id/pkm'; break;
        case 'PMW': deepLinkUrl = 'https://pmw.andiputraw.my.id/pmw/'; break;
        case 'BEASISWA': deepLinkUrl = 'https://proposal.andiputraw.my.id/'; break;
        case 'PRESTASI': deepLinkUrl = 'https://kompetisi-prestasi.andiputraw.my.id/kompetisi'; break;
        case 'KA_ORMAWA': deepLinkUrl = 'https://ka-ormawa.andiputraw.my.id/'; break;
        case 'SARPRAS': deepLinkUrl = 'https://proposal.andiputraw.my.id/'; break;
        default: deepLinkUrl = typeof app === 'object' && app.deepLinkUrl ? app.deepLinkUrl : '#';
      }
      return {
        appSource: source,
        canViewTimeline: source !== 'PRESTASI' && source !== 'SARPRAS',
        canViewSubmission: true,
        deepLinkUrl: deepLinkUrl,
        isAvailable: isAvailable
      };
    });
  }

  const loadStoredUser = () => {
    const raw = localStorage.getItem('user_profile');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed) {
        if (!parsed.username || parsed.username === 'user') {
          parsed.username = parsed.nim || parsed.npa || 'user';
        }
        parsed.accessibleApps = mapAccessibleApps(parsed.accessibleApps || []);
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse stored user:', e);
    }
    return null;
  };

  const user = ref(loadStoredUser());

  function setTokens(tokens) {
    if (tokens && tokens.access_token) {
      accessToken.value = tokens.access_token;
      localStorage.setItem('access_token', tokens.access_token);
    } else {
      accessToken.value = null;
      localStorage.removeItem('access_token');
    }
    if (tokens && tokens.refresh_token) {
      refreshToken.value = tokens.refresh_token;
      localStorage.setItem('refresh_token', tokens.refresh_token);
    } else {
      refreshToken.value = null;
      localStorage.removeItem('refresh_token');
    }
  }

  function setUserProfile(profile) {
    user.value = profile;
    localStorage.setItem('user_profile', JSON.stringify(profile));
  }

  function clearAuth() {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    hasFetchedUser.value = false;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_profile');
  }

  // SSO Token login integration
  async function login({ identifier, password }) {
    loading.value = true;
    try {
      // Clear any existing session details to prevent cross-contamination of access tokens
      clearAuth();

      const payload = { password };
      
      // Determine if numeric (NIM) or otherwise (NPA)
      const isNumeric = /^\d+$/.test(identifier);
      if (isNumeric) {
        payload.nim = identifier;
        payload.npa = null;
      } else {
        payload.npa = identifier;
        payload.nim = null;
      }

      // API call to /auth/sso/token
      const response = await api.post('/auth/sso/token', payload);
      const data = response.data;
      
      // Handle fallback token if returned by backend
      if (data.access_token) {
        setTokens({
          access_token: data.access_token,
          refresh_token: data.refresh_token || null
        });
      }

      // Build user profile from response or token claims
      const profile = {
        id: data.userId || data.sub,
        nama: data.name || data.nama,
        nim: data.nim || null,
        npa: data.npa || null,
        username: data.nim || data.npa || 'user',
        role: data.role || 'MAHASISWA',
        accessibleApps: mapAccessibleApps(data.accessibleApps || [])
      };

      setUserProfile(profile);
      hasFetchedUser.value = true;
      return profile;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCurrentUser() {
    try {
      const response = await api.get('/dashboard/me');
      const data = response.data?.data || response.data;
      
      const profile = {
        id: data.userId || data.sub || user.value?.id,
        nama: data.name || data.nama || user.value?.nama,
        nim: data.nim || null,
        npa: data.npa || null,
        username: data.nim || data.npa || user.value?.username || 'user',
        role: data.role || user.value?.role,
        accessibleApps: mapAccessibleApps(data.accessibleApps || [])
      };
      
      setUserProfile(profile);
      hasFetchedUser.value = true;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  }

  // Logout & revoke SSO token
  async function logout() {
    try {
      await api.post('/auth/sso/revoke');
    } catch (error) {
      console.error('Revocation failed or offline:', error);
    } finally {
      clearAuth();
      window.location.href = '/login';
    }
  }

  async function handleSSOCallback(code) {
    loading.value = true;
    try {
      // SSO callback verification simulation / endpoint
      const response = await api.post('/auth/sso/callback', { code });
      setTokens(response.data);
      await fetchCurrentUser();
    } catch (error) {
      console.error('SSO Callback failed:', error);
    } finally {
      loading.value = false;
    }
  }

  async function refreshJWT() {
    if (!refreshToken.value) throw new Error('No refresh token available');
    
    const response = await api.post('/auth/sso/refresh', { refresh_token: refreshToken.value });
    setTokens(response.data);
    return response.data;
  }

  return {
    accessToken,
    refreshToken,
    user,
    loading,
    hasFetchedUser,
    isAuthenticated,
    setTokens,
    clearAuth,
    login,
    fetchCurrentUser,
    handleSSOCallback,
    refreshJWT,
    logout,
  };
});
