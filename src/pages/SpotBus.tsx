import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SpotBus: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page where CreatePostModal can be triggered
    navigate('/');
  }, [navigate]);

  return null;
};

export default SpotBus;
