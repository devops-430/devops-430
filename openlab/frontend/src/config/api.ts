interface ApiConfig {
  baseURL: string;
  endpoints: {
    subscribe: string;
    login: string;
    register: string;
    verify: string;
    resources: string;
  };
}

const apiConfig: ApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  endpoints: {
    subscribe: '/auth/subscribe',
    login: '/auth/login',
    register: '/auth/register',
    verify: '/auth/verify',
    resources: '/resources',
  },
};

export default apiConfig; 