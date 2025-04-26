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
  baseURL: isServer ? 'https://openlab.nnine.training' : process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  endpoints: {
    subscribe: '/api/auth/subscribe',
    login: '/api/auth/login',
    register: '/api//auth/register',
    verify: '/api/auth/verify',
    resources: '/api/resources',
  },
};

export default apiConfig; 