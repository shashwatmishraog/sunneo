
import React from 'react';

interface LoadingScreenProps {
  logoImage: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ logoImage }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-64 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-lg text-slate-600 animate-pulse">Loading...</p>
    </div>
  );
};

export default LoadingScreen;
