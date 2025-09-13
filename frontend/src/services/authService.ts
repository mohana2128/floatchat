import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/auth';

export interface User {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
  preferences?: any;
}

export interface LoginCredentials {
  username: string; // email
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('access_token');
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await axios.post(`${API_BASE_URL}/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const authData = response.data;
    this.setToken(authData.access_token);
    return authData;
  }

  async register(userData: RegisterData): Promise<User> {
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await axios.get(`${API_BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    return response.data;
  }

  async verifyToken(): Promise<boolean> {
    try {
      await axios.get(`${API_BASE_URL}/verify-token`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }
}

export const authService = new AuthService();
