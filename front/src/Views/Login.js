import React, { useState } from 'react';
import '../Style/Login.css';
import { useNavigate } from 'react-router-dom';

const decodeJwt = (token) => {
    try {
        // JWTs have 3 parts: header.payload.signature
        const payload = token.split('.')[1];
        // Decode base64 URL-safe string
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        // Decode and parse the JSON payload
        return JSON.parse(atob(base64));
    } catch (e) {
        console.error("Failed to decode JWT:", e);
        return null;
    }
};


const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const sendUDP = async () => {
    const node_id = 1;
    const command = 3;
    try {
      const res = await fetch('http://172.16.200.237:3001/api/send-udp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_id, command }) // Example UDP message
      });
      const data = await res.json();
      alert(data.message || 'Sent!');
    } catch (err) {
      console.error(err);
      alert('Failed to send UDP');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isLoggingIn) return;

    setIsLoggingIn(true);
    setMessage('Нэвтэрч байна...');

    fetch('http://172.16.200.237:3001/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        setIsLoggingIn(false);
        if (!response.ok) {
            return response.json().then(error => Promise.reject(error));
        }
        return response.json();
      })
      .then((data) => {
        // --- UPGRADED SECURITY LOGIC STARTS HERE ---
        
        // 1. Check for the secure JWT token from the server
        if (data.token) {
            // 2. Store the token (the proof of authentication) securely
            // This replaces localStorage.setItem("authenticated", true);
            localStorage.setItem("authToken", data.token);

            // Optional: Decode the token to get role/user info for client-side routing/display
            const payload = decodeJwt(data.token);
            
            // Assume the backend puts the role and username in the JWT payload
            const userRole = payload?.role || 'user'; 
            const decodedUsername = payload?.username || username.toUpperCase(); 

            // 3. Store the display name (still good for user experience, but not security)
            // This replaces localStorage.setItem("user", username.toUpperCase());
            localStorage.setItem("userDisplayName", decodedUsername); 

            setMessage(data.message || `Амжилттай нэвтэрлээ, ${decodedUsername}!`);

            // 4. Use the secure, server-provided role for routing (instead of checking the username)
            if (userRole === 'admin') {
              navigate("/dashboard");
            } else {
              navigate("/home");
            }
        } else {
            // Login failed, but response was 200 (e.g., wrong credentials message)
            setMessage(data.message || 'Нэвтрэх нэр эсвэл нууц үг буруу байна.');
        }

        setTimeout(() => {
          setMessage('');
        }, 5000);
      })
      .catch((error) => {
        setIsLoggingIn(false);
        console.error('Error:', error);
        const errorMessage = error.message || 'Нэвтрэхэд алдаа гарлаа. Та дахин оролдоно уу?.';
        setMessage(errorMessage);
        setTimeout(() => { setMessage(''); }, 5000);
      });
  };

  return (
    // Note: Tailwind CSS classes are used here for responsive design,
    // assuming they are available, replacing the need for '../Style/Login.css' for layout.
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="flex w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Left Side: Login Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 space-y-8 flex flex-col justify-center">
          <div className="text-center">
            {/* Placeholder for logo, using an inline SVG/Icon or a fallback */}
            <svg className="mx-auto h-12 w-auto text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
              Хяналтын систем
            </h2>
            <p className="mt-2 text-sm text-gray-600">Нэвтэрч орно уу</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                name="username"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ажилтны код"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Нууц үг"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {message && <div className={`text-center p-3 rounded-lg ${isLoggingIn ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:bg-indigo-400"
            >
              {isLoggingIn ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
            </button>
            
            <button
              onClick={sendUDP}
              type="button"
              className="w-full flex justify-center py-3 px-4 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition duration-150 ease-in-out"
            >
              Нууц үгээ мартсан
            </button>
          </form>
          <button
              onClick={sendUDP}
              type="button"
            >
              Нууц үгээ мартсан
            </button>
        </div>

        <div className="hidden lg:block lg:w-1/2 bg-indigo-500 relative">
            <img 
                className="absolute inset-0 h-full w-full object-cover opacity-70" 
                src="../imaged/login.png" alt="chimeg2"
            />
        </div>
      </div>
    </div>
  );
};

export default Login;
