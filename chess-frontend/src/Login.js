import React from 'react';

const API_URL = 'http://localhost:3000'; // Cambia si tu backend está en otro puerto

function Login() {
  const handleLogin = (provider) => {
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 100 }}>
      <h2>Iniciar sesión</h2>
      <button onClick={() => handleLogin('google')} style={{ margin: 10 }}>Login con Google</button>
      <button onClick={() => handleLogin('facebook')} style={{ margin: 10 }}>Login con Facebook</button>
    </div>
  );
}

export default Login;