import React, { useState } from 'react';
import '../Style/Login.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const decodeJwt = (token) => {
      try {
          const payload = token.split('.')[1];
          const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
          return JSON.parse(atob(base64));
      } catch (e) {
          console.error("Failed to decode JWT:", e);
          return null;
      }
  };
  const sendUDP = async () => {
    const node_id = 1;
    const command = 3;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/send-udp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_id, command }) // Example UDP message
      });
      const data = await res.json();
      alert(data.message);
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

    fetch(`${process.env.REACT_APP_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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
        if (data.token) {
            localStorage.setItem("authToken", data.token);

            const payload = decodeJwt(data.token);
            const userRole = payload?.role;
          localStorage.setItem("type", userRole);

          const decodedUsername = payload?.id;
          localStorage.setItem("userDisplayName", decodedUsername);

          setMessage(data.message || `Амжилттай нэвтэрлээ, ${decodedUsername}!`);
          if (userRole === 0) {
              navigate("/dashboard");
            } else {
              navigate("/home");
            }
        } else {
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
    <div className="background">
      <div className="loginform">
        <img className="logo" src="/images/logo.png" alt="Logo" />
        <p style={{ margin: '2.5rem' }}>Хяналтын систем</p>
        <form onSubmit={handleSubmit} id="login_form">
          <input
            className="inp"
            type="text"
            name="username"
            placeholder="Ажилтны код"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="inp"
            type="password"
            name="password"
            placeholder="Нууц үг"
            id="pass"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          {message && <div className="alert">{message}</div>}
          <button
            type="submit"
            disabled={isLoggingIn}
            className='button login'
          >
            {isLoggingIn ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
          </button>

          <button
            onClick={sendUDP}
            type="button"
            className="button forget"
          >
            Нууц үгээ мартсан
          </button>
        </form>
      </div >

      <img style={{ width: '55%', left: '45%' }} src="../images/login.png" alt="chimeg2" />
    </div >
  );
};

export default Login;
