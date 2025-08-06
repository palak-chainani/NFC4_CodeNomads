#!/usr/bin/env python3
"""
Test script to debug login issues
Run this script to test different login request formats
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/api/auth/login/"
DEBUG_URL = f"{BASE_URL}/api/auth/social/debug-login/"

def test_debug_endpoint():
    """Test the debug endpoint to see what the frontend is sending"""
    print("=== Testing Debug Endpoint ===")
    
    # Test with JSON
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
    
    data = {
        'email': 'test@example.com',
        'password': 'testpassword'
    }
    
    try:
        response = requests.post(DEBUG_URL, json=data, headers=headers)
        print(f"Debug endpoint response: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def test_login_json():
    """Test login with JSON format"""
    print("\n=== Testing Login with JSON ===")
    
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
    
    data = {
        'email': 'test@example.com',
        'password': 'testpassword'
    }
    
    try:
        response = requests.post(LOGIN_URL, json=data, headers=headers)
        print(f"Login response: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def test_login_form():
    """Test login with form data"""
    print("\n=== Testing Login with Form Data ===")
    
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
    }
    
    data = {
        'email': 'test@example.com',
        'password': 'testpassword'
    }
    
    try:
        response = requests.post(LOGIN_URL, data=data, headers=headers)
        print(f"Login response: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def test_login_without_content_type():
    """Test login without specifying content type"""
    print("\n=== Testing Login without Content-Type ===")
    
    headers = {
        'Accept': 'application/json',
    }
    
    data = {
        'email': 'test@example.com',
        'password': 'testpassword'
    }
    
    try:
        response = requests.post(LOGIN_URL, json=data, headers=headers)
        print(f"Login response: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Login Debug Test Script")
    print("=" * 50)
    
    # Test debug endpoint first
    test_debug_endpoint()
    
    # Test different login formats
    test_login_json()
    test_login_form()
    test_login_without_content_type()
    
    print("\n" + "=" * 50)
    print("Test completed. Check the responses above.")
    print("\nTo use this with your frontend:")
    print("1. First test the debug endpoint with your frontend request")
    print("2. Compare the request format with the working Postman request")
    print("3. Make sure your frontend sends the same format as Postman") 