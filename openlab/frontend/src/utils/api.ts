import apiConfig from '../config/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface ApiError {
  message: string;
  status?: number;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();
  
  if (!response.ok) {
    throw {
      message: data.message || 'An error occurred',
      status: response.status,
    };
  }
  
  return { data };
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${apiConfig.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    return handleResponse<T>(response);
  } catch (error) {
    const apiError = error as ApiError;
    return {
      error: apiError.message || 'An unexpected error occurred',
    };
  }
}

export async function authenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return {
      error: 'Authentication required',
    };
  }
  
  return apiRequest<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
} 