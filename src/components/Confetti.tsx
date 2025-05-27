
import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  animationDuration: number;
}

export const Confetti: React.FC = () => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  
  useEffect(() => {
    // Colors for confetti
    const colors = [
      '#f97316', // orange
      '#f59e0b', // amber
      '#84cc16', // lime
      '#06b6d4', // cyan
      '#8b5cf6', // violet
      '#ec4899', // pink
    ];
    
    // Create confetti pieces
    const pieces: ConfettiPiece[] = [];
    const pieceCount = 100;
    
    for (let i = 0; i < pieceCount; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100, // random x position (0-100%)
        y: -10 - Math.random() * 10, // start slightly above viewport
        size: 5 + Math.random() * 10, // random size between 5-15px
        rotation: Math.random() * 360, // random initial rotation
        color: colors[Math.floor(Math.random() * colors.length)], // random color
        animationDuration: 1 + Math.random() * 3, // random duration between 1-4s
      });
    }
    
    setConfetti(pieces);
    
    // Clean up confetti after animation
    const timer = setTimeout(() => {
      setConfetti([]);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {confetti.map(piece => (
        <div
          key={piece.id}
          style={{
            position: 'absolute',
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            animation: `confetti ${piece.animationDuration}s ease-in-out forwards`,
          }}
        />
      ))}
    </div>
  );
};
