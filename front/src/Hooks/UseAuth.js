import { useState, useEffect } from 'react';

const decodeJwt = (token) => {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

export default function UseAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 new

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = decodeJwt(token);
      const currentTime = Date.now() / 1000;
      if (decoded && decoded.exp > currentTime) {
        setAuthenticated(true);
        setUser(decoded.id);
      } else {
        localStorage.removeItem('authToken');
        setAuthenticated(false);
      }
    } else {
      setAuthenticated(false);
    }
    setLoading(false); // ✅ done checking
  }, []);

  return { authenticated, user, loading, setAuthenticated, setUser };
}
