import React, { useState } from 'react';
import '../Style/Login.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
        if (data.type !== undefined) {
          localStorage.setItem("user", username.toUpperCase());
          localStorage.setItem("authenticated", true);
          if (username.toUpperCase().includes('AD')) {
            navigate("/dashboard")
          } else {
            navigate("/home")
          }
        }

        setTimeout(() => {
          setMessage('');
        }, 5000);
      })
      .catch((error) => {
        console.error('Error:', error);
        setMessage('Нэтрэхэд алдаа гарлаа. Та дахин оролдоно уу?.');
      });
  };

  return (
      <div className="background">
        <div className="loginform">
          <img className="logo" src="/Images/logo.png" alt="Logo" />
          <p style={{margin:'2.5rem'}}>Хяналтын систем</p>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />

            <br />
            {message && <div className="alert">{message}</div>}
            <button type="submit" id="login_button" className="button login">
              Нэвтрэх
            </button>
            <button type="button" id="forget_button" className="button forget">
              Нууц үгээ мартсан
            </button>
          </form>
        </div>
        <img style={{ width: '55%', left: '45%' }} src="../Images/login.png" alt="chimeg2" />
      </div>
  );
};

export default Login;