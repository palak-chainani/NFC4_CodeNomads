// src/pages/Login.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Github, Lock, Mail, Loader2 } from "lucide-react"; // Added Loader2 for spinner
import axios from "axios"; // Import axios

export default function LoginPage() {
  const navigate = useNavigate();

  // State for input fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State for loading and error messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false); // New state for Google button loading

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const loginUrl = 'http://127.0.0.1:8000/api/auth/login/';
    const loginData = {
        email: email,
        password: password,
    };

    try {
        const response = await axios.post(loginUrl, loginData);
        console.log('Login successful!', response.data);
        
        // console.log('Token:', response.data.token);
        // Store the token if it exists in the response
        localStorage.setItem('token', response.data.key);
        localStorage.setItem('role', response.data.profile.role);
        // localStorage.setItem('user', JSON.stringify(response.data.user));
        // if (response.data.token) {
        //     localStorage.setItem('token', response.data.token);
        // }
        
        // // Store user data if available
        // if (response.data.user) {
        //     localStorage.setItem('user', JSON.stringify(response.data.user));
        // }
        
        alert('Login Successful!');
        // Navigate to dashboard after successful login
        if (response.data.profile.role === 'admin') {
            navigate('/dashboard'); // Redirect to admin dashboard
        }
        else if (response.data.profile.role === 'member') {
            navigate('/mycomplaints'); // Redirect to user complaints page
        } else {
            navigate('/workerdashboard'); // Default redirect
        }
    } catch (error) {
        console.error('Login error:', error);
        if (error.response) {
            // Try to show a more specific error from backend
            const detail =
                error.response.data.detail ||
                (error.response.data.non_field_errors && error.response.data.non_field_errors[0]) ||
                (error.response.data.email && error.response.data.email[0]) ||
                (error.response.data.password && error.response.data.password[0]) ||
                'Invalid credentials';
            setError(`Login Failed: ${detail}`);
        } else if (error.request) {
            setError('Server is not responding. Please try again later.');
        } else {
            setError('An unexpected error occurred.');
        }
    } finally {
        setLoading(false);
    }
};

  // Function to handle Google login for the LoginPage
  const handleGoogleLogin = async () => {
    setLoadingGoogle(true); // Set loading state for Google button
    try {
      // Make a request to your Django backend to get the Google authorization URL
      // Using the endpoint provided in the previous turn: /api/auth/social/google/login-url/
      const response = await axios.get("http://127.0.0.1:8000/api/auth/social/google/login-url/"); 
      
      const authorizationUrl = response.data.login_url; // Assuming your Django endpoint returns 'login_url'
      if (authorizationUrl) {
        window.location.href = authorizationUrl; // Redirect the user to Google's login page
      } else {
        alert("Could not get Google login URL from server.");
      }
    } catch (error) {
      console.error("Google login initiation failed:", error);
      alert("Failed to initiate Google login. Please try again.");
    } finally {
      setLoadingGoogle(false); // Reset loading state
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0A400C] p-4">
      <div className="w-full max-w-md rounded-xl bg-[#FEFAE0] p-6 shadow-lg sm:p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#0A400C]">Welcome back</h1>
          <p className="mt-2 text-sm text-[#819067]">
            Login to access your account
          </p>
        </div>

        {/* Display error message if it exists */}
        {error && (
          <div className="mt-4 rounded-md border border-red-400 bg-red-50 p-3 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="mt-6 grid gap-4" onSubmit={handleLoginSubmit}>
          <div className="grid gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-[#0A400C]"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#819067]" />
              <input
                id="email"
                type="email"
                placeholder="admin@flatconnect.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-10 w-full rounded-md border border-[#B1AB86] bg-transparent pl-10 pr-3 py-2 text-sm text-[#0A400C] placeholder:text-[#819067] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#819067]"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#0A400C]"
              >
                Password
              </label>
              <a
                href="#"
                className="ml-auto inline-block text-sm text-[#0A400C] hover:underline"
              >
                Forgot your password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#819067]" />
              <input
                id="password"
                type="password"
                placeholder="password123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-[#B1AB86] bg-transparent pl-10 pr-3 py-2 text-sm text-[#0A400C] placeholder:text-[#819067] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#819067]"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 w-full h-10 inline-flex items-center justify-center rounded-md bg-[#0A400C] text-sm font-medium text-[#FEFAE0] transition-colors hover:bg-[#819067] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login"}
          </button>
        </form>

        {/* Separator and Social Logins... */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#B1AB86]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#FEFAE0] px-2 text-[#819067]">
              Or login with
            </span> {/* Changed text for login page */}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-md border border-[#B1AB86] bg-transparent text-sm font-medium text-[#0A400C] transition-colors hover:bg-[#B1AB86]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Login with Google"
            onClick={handleGoogleLogin} // Attach the handler
            disabled={loadingGoogle} // Disable while loading
          >
            {loadingGoogle ? <Loader2 className="h-5 w-5 animate-spin" /> : "Google"} {/* Show spinner when loading */}
          </button>
          <button
            type="button"
            className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-md border border-[#B1AB86] bg-transparent text-sm font-medium text-[#0A400C] transition-colors hover:bg-[#B1AB86]/20"
            aria-label="Login with Apple"
          >
            Apple
          </button>
          <button
            type="button"
            className="w-full h-10 inline-flex items-center justify-center rounded-md border border-[#B1AB86] bg-transparent text-sm font-medium text-[#0A400C] transition-colors hover:bg-[#B1AB86]/20"
            aria-label="Login with GitHub"
          >
            <Github className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-[#819067]">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-[#0A400C] hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}