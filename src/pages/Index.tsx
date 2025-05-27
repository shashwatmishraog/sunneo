
import React from 'react';
import Game from '../components/Game';

const Index = () => {
  return (
    <div className="min-h-screen py-8 px-4 flex flex-col items-center justify-center relative">
      {/* Logo in top left corner */}
      <div className="absolute top-4 left-4 z-10">
        <img 
          src="/lovable-uploads/91bb2958-0589-4771-b5d2-573ec5234e10.png" 
          alt="SunNeo Logo" 
          className="w-16 h-16 object-contain rounded-lg shadow-md bg-white/80 backdrop-blur-sm p-2"
        />
      </div>
      
      <div className="w-full max-w-md">
        <Game logoImage="/lovable-uploads/91bb2958-0589-4771-b5d2-573ec5234e10.png" />
      </div>
      
      <footer className="mt-8 text-center text-slate-500 text-sm">
        <p>&copy; 2025 Tile Puzzle Challenge</p>
      </footer>
    </div>
  );
};

export default Index;
