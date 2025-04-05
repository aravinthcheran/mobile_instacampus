// Authentication API functions
import { storage } from '@/utils/storage';

const API_URL = 'http://localhost:5000'; // Replace with your actual API URL

// Send OTP to email
export async function sendOtp(email: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/send_otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
}

// Verify OTP
export async function verifyOtp(email: string, otp: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/verify_otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify OTP');
    }
    
    return data.verified;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
}

// Register a new user
export async function register(email: string, password: string, name: string, profilePic?: string) {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password, 
        name,
        profile_pic: profilePic || '',
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    // Store the token using our cross-platform storage
    await storage.setItem('authToken', data.token);
    
    return {
      userData: {
        name: data.name,
        email: data.email,
        profilePic: data.profile_pic,
      },
      token: data.token
    };
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
}

// Login with email and password
export async function login(email: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/login_email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Store the token using our cross-platform storage
    await storage.setItem('authToken', data.token);
    
    return {
      userData: {
        name: data.name,
        email: data.email,
        profilePic: data.profile_pic,
      },
      token: data.token
    };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

// Logout
export async function logout() {
  // Clear the auth token using our cross-platform storage
  await storage.removeItem('authToken');
}
