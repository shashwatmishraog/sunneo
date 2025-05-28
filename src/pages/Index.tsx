
import React from 'react';
import Game from '../components/Game';

const Index = () => {
  return (
    <div className="min-h-screen py-8 px-4 flex flex-col items-center justify-center relative">
      {/* Logo in top left corner */}
      <div className="absolute top-4 left-4 z-10">
        <img 
          src="/lovable-uploads/15a95632-ec1f-4533-94bd-31891c74f53c.png" 
          alt="SunNeo Logo" 
          className="w-24 h-24 object-contain"
        />
      </div>
      
      <div className="w-full max-w-lg">
        <Game logoImage="/lovable-uploads/8db31573-1a6b-448f-b1a8-53f0d088c0f4.png" />
      </div>
      
      <footer className="mt-8 text-center text-slate-500 text-sm">
        <p>&copy; 2025 Tile Puzzle Challenge</p>
      </footer>
    </div>
  );
};

export default Index;
