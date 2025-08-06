import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Github, Lock, Mail, Loader2 } from "lucide-react";
import axios from "axios";

export default function SignupPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingSignup, setLoadingSignup] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState(null);

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    setLoadingSignup(true);
    setError(null);
    
    // Clear any existing data to start fresh
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('profileCompleted');
    console.log("Signup - Cleared previous localStorage data");

    const signupUrl = "http://127.0.0.1:8000/api/auth/registration/";

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoadingSignup(false);
      return;
    }

    const username = email.split("@")[0];

    const signupData = {
      username: username,
      email: email,
      password1: password,
      password2: confirmPassword,
    };

    try {
      const signupResponse = await axios.post(signupUrl, signupData);
      console.log("Signup successful!", signupResponse.data);
      console.log("Signup response structure:", {
        key: signupResponse.data.key,
        user: signupResponse.data.user,
        profile: signupResponse.data.profile
      });
      
      // Automatically log in the user after successful signup
      const loginUrl = 'http://127.0.0.1:8000/api/auth/login/';
      const loginData = {
        email: email,
        password: password,
      };
      
      console.log("Attempting auto-login with:", loginData);
      const loginResponse = await axios.post(loginUrl, loginData);
      console.log('Auto-login successful!', loginResponse.data);
      console.log('Auto-login response structure:', {
        key: loginResponse.data.key,
        user: loginResponse.data.user,
        profile: loginResponse.data.profile
      });

      // Clear any previous data to avoid conflicts
      localStorage.removeItem('user');
      localStorage.removeItem('profileCompleted');
      
      // Store the token - backend returns 'key' for token
      if (loginResponse.data.key) {
        localStorage.setItem('token', loginResponse.data.key);
        console.log("Signup - Token stored:", loginResponse.data.key);
      }
      
      // Store user data if available
      if (loginResponse.data.user) {
        localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
        console.log("Signup - User data stored:", loginResponse.data.user);
      }
      
      // Store profile data if available
      if (loginResponse.data.profile) {
        localStorage.setItem('role', loginResponse.data.profile.role);
        console.log("Signup - Profile data stored:", loginResponse.data.profile);
      }
      
      console.log("Signup - Navigating to profile-completion");
      console.log("Signup - Final localStorage check:");
      console.log("Token:", localStorage.getItem('token'));
      console.log("User:", localStorage.getItem('user'));
      console.log("Role:", localStorage.getItem('role'));
      alert('Account created successfully! You are now logged in.');
      
      // Small delay to ensure localStorage is set
      setTimeout(() => {
        console.log("Signup - About to navigate to profile-completion");
        console.log("Signup - Final localStorage check before navigation:");
        console.log("Token:", localStorage.getItem('token'));
        console.log("User:", localStorage.getItem('user'));
        console.log("Role:", localStorage.getItem('role'));
        navigate("/profile-completion");
      }, 200);
      
    } catch (error) {
      console.error("Signup/Login error:", error);
      let errorMessage = "An unexpected error occurred during signup or login.";

      if (error.response) {
        // Handle errors from the server response
        const errorData = error.response.data;

        if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`;
        } else if (errorData.username) {
          errorMessage = `Username: ${errorData.username[0]}`;
        } else if (errorData.password) {
          errorMessage = `Password: ${errorData.password[0]}`;
        } else if (errorData.password2) {
          errorMessage = `Confirm Password: ${errorData.password2[0]}`;
        } else if (errorData.password1) {
          errorMessage = `Password: ${errorData.password1[0]}`;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors[0];
        } else if (errorData.detail) { // For login errors like "Invalid credentials"
          errorMessage = errorData.detail;
        }
      } else if (error.request) {
        // No response received (network error)
        errorMessage = "Server is not responding. Please try again later.";
      } else {
        // Other unexpected errors
        errorMessage = error.message;
      }
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoadingSignup(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setError(null);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/auth/social/google/login-url/");
      const authorizationUrl = response.data.login_url;
      if (authorizationUrl) {
        window.location.href = authorizationUrl;
      } else {
        setError("Could not get Google login URL from server.");
      }
    } catch (error) {
      console.error("Google login initiation failed:", error);
      setError("Failed to initiate Google login. Please try again.");
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0A400C] p-4">
      <div className="w-full max-w-md rounded-xl bg-[#FEFAE0] p-6 shadow-lg sm:p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#0A400C]">Create an account</h1>
          <p className="mt-2 text-sm text-[#819067]">
            Enter your information to get started
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-400 bg-red-50 p-3 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="mt-8 grid gap-4" onSubmit={handleSignupSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="first-name" className="text-sm font-medium text-[#0A400C]">First Name</label>
              <input
                id="first-name"
                placeholder="John"
                className="flex h-10 w-full rounded-md border border-[#B1AB86] bg-transparent px-3 py-2 text-sm text-[#0A400C] placeholder:text-[#819067] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#819067]"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={loadingSignup}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="last-name" className="text-sm font-medium text-[#0A400C]">Last Name</label>
              <input
                id="last-name"
                placeholder="Doe"
                className="flex h-10 w-full rounded-md border border-[#B1AB86] bg-transparent px-3 py-2 text-sm text-[#0A400C] placeholder:text-[#819067] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#819067]"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loadingSignup}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium text-[#0A400C]">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#819067]" />
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="flex h-10 w-full rounded-md border border-[#B1AB86] bg-transparent pl-10 pr-3 py-2 text-sm text-[#0A400C] placeholder:text-[#819067] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#819067]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loadingSignup}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-medium text-[#0A400C]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#819067]" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="flex h-10 w-full rounded-md border border-[#B1AB86] bg-transparent pl-10 pr-3 py-2 text-sm text-[#0A400C] placeholder:text-[#819067] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#819067]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loadingSignup}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="confirm-password" className="text-sm font-medium text-[#0A400C]">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#819067]" />
              <input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                className="flex h-10 w-full rounded-md border border-[#B1AB86] bg-transparent pl-10 pr-3 py-2 text-sm text-[#0A400C] placeholder:text-[#819067] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#819067]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loadingSignup}
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 w-full h-10 inline-flex items-center justify-center rounded-md bg-[#0A400C] text-sm font-medium text-[#FEFAE0] transition-colors hover:bg-[#819067] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#819067] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loadingSignup}
          >
            {loadingSignup ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign Up"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#B1AB86]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#FEFAE0] px-2 text-[#819067]">Or sign up with</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-md border border-[#B1AB86] bg-transparent text-sm font-medium text-[#0A400C] transition-colors hover:bg-[#B1AB86]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Sign up with Google"
            onClick={handleGoogleLogin}
            disabled={loadingGoogle || loadingSignup}
          >
            {loadingGoogle ? <Loader2 className="h-5 w-5 animate-spin" /> : "Google"}
          </button>
          <button
            type="button"
            className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-md border border-[#B1AB86] bg-transparent text-sm font-medium text-[#0A400C] transition-colors hover:bg-[#B1AB86]/20"
            aria-label="Sign up with Apple"
          >
            Apple
          </button>
          <button
            type="button"
            className="w-full h-10 inline-flex items-center justify-center rounded-md border border-[#B1AB86] bg-transparent text-sm font-medium text-[#0A400C] transition-colors hover:bg-[#B1AB86]/20"
            aria-label="Sign up with GitHub"
          >
            <Github className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-[#819067]">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-[#0A400C] hover:underline">
            Login
          </Link>
        </div>
      </div>

      <p className="absolute bottom-6 px-8 text-center text-xs text-[#B1AB86]">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline hover:text-[#FEFAE0]">Terms of Service</a> and{" "}
        <a href="#" className="underline hover:text-[#FEFAE0]">Privacy Policy</a>.
      </p>
    </div>
  );
}