import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen">
      {isLogin ? (
        <LoginForm onToggleMode={toggleMode} />
      ) : (
        <RegisterForm onToggleMode={toggleMode} />
      )}
    </div>
  );
};

export default AuthPage;
