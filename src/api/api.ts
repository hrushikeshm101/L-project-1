import axios, { AxiosError } from 'axios';
import { auth } from '@/lib/firebase/client';
import { ApiRequest } from '@/types';


export const apiClient = axios.create({
  baseURL: '/api',
});

apiClient.interceptors.request.use(
  async (config) => {
    // Wait for the initial authentication state to settle before proceeding
    // This prevents 401s when the page is refreshed and Firebase is re-authenticating
    if ('authStateReady' in auth) {
      await (auth as any).authStateReady();
    }

    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export const api = async ({
  endpoint,
  method,
  data
} : ApiRequest) => {
  try {
    const response = await apiClient({
      url: endpoint,
      method,
      data
    });
    return response;
  } catch (error) {
    const response = (error as AxiosError)?.response as any;
    if (response) {
      console.error('API Error:', response.status, response.data);
``
    } else {
      console.error('Network or unexpected error:', error);
    }
  }
}