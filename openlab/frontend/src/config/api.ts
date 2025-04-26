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
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://openlab.nnine.training',
  endpoints: {
    subscribe: '/api/auth/subscribe',
    login: '/api/auth/login',
    register: '/api//auth/register',
    verify: '/api/auth/verify',
    resources: '/api/resources',
  },
};

export default apiConfig; 