import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Confetti } from "./Confetti";
import LoadingScreen from "./LoadingScreen";

interface Tile {
  id: number;
  correctPos: number;
  currentPos: number;
}

interface GameProps {
  logoImage: string;
}

const Game: React.FC<GameProps> = ({ logoImage }) => {
  // Game states  
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [timeLeft, setTimeLeft] = useState(30); // Changed to 30 seconds
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [movingTileId, setMovingTileId] = useState<number | null>(null);
  const [gameInitialized, setGameInitialized] = useState(false);
  const [showJoinAnimation, setShowJoinAnimation] = useState(false);
  const [showCompleteImage, setShowCompleteImage] = useState(false);

  // Fixed difficulty to 2x2
  const difficulty = 2;

  // Touch tracking
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchTileIdRef = useRef<number | null>(null);

  // Load the logo and get its dimensions when component mounts
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      setImageLoaded(true);
    };
    img.src = logoImage;
  }, [logoImage]);

  // Initialize the game
  const initGame = useCallback(() => {
    if (!imageLoaded) return; // Don't start until image is loaded
    
    // Number of tiles based on 2x2 grid
    const totalTiles = 4;
    
    // Create initial tiles in correct positions
    const initialTiles: Tile[] = [];
    for (let i = 0; i < totalTiles; i++) {
      initialTiles.push({ 
        id: i, 
        correctPos: i, 
        currentPos: i 
      });
    }
    
    // Shuffle positions (ensure it's solvable)
    let positions = Array.from({ length: totalTiles }, (_, i) => i);
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    
    // Assign shuffled positions
    const shuffledTiles = initialTiles.map((tile, index) => ({
      ...tile,
      currentPos: positions[index]
    }));
    
    setTiles(shuffledTiles);
    setTimeLeft(30); // Changed to 30 seconds
    setGameStarted(true);
    setGameOver(false);
    setIsWin(false);
    setShowConfetti(false);
    setShowJoinAnimation(false);
    setShowCompleteImage(false);
    setGameInitialized(true);
    
    toast({
      title: "Game Started!",
      description: "Rearrange the tiles to solve the puzzle.",
    });
  }, [imageLoaded]);
  
  // Check if the puzzle is solved
  const checkWin = useCallback(() => {
    if (tiles.length === 0) return false;
    
    const isCorrect = tiles.every(tile => tile.currentPos === tile.correctPos);
    
    if (isCorrect) {
      setIsWin(true);
      setGameOver(true);
      
      // Start joining animation sequence
      setShowJoinAnimation(true);
      
      // After join animation, show complete image with pop-out
      setTimeout(() => {
        setShowJoinAnimation(false);
        setShowCompleteImage(true);
        setShowConfetti(true);
      }, 1000);
      
      toast({
        title: "Congratulations!",
        description: "You solved the puzzle!",
        variant: "default",
      });
    }
    
    return isCorrect;
  }, [tiles]);
  
  // Move a tile in the specified direction
  const moveTile = useCallback((tileId: number, direction: 'up' | 'down' | 'left' | 'right') => {
    if (!gameStarted || gameOver) return;
    
    // Find the selected tile
    const tileIndex = tiles.findIndex(tile => tile.id === tileId);
    if (tileIndex === -1) return;
    
    const currentPos = tiles[tileIndex].currentPos;
    let targetPos;
    
    // Calculate the target position based on direction and grid size
    switch (direction) {
      case 'up':
        targetPos = currentPos - difficulty; // Move up one row
        if (targetPos < 0) return; // Can't move up from top row
        break;
      case 'down':
        targetPos = currentPos + difficulty; // Move down one row
        if (targetPos >= difficulty * difficulty) return; // Can't move down from bottom row
        break;
      case 'left':
        if (currentPos % difficulty === 0) return; // Can't move left from leftmost column
        targetPos = currentPos - 1; // Move left one column
        break;
      case 'right':
        if (currentPos % difficulty === difficulty - 1) return; // Can't move right from rightmost column
        targetPos = currentPos + 1; // Move right one column
        break;
      default:
        return;
    }
    
    // Find the tile at the target position
    const targetTileIndex = tiles.findIndex(tile => tile.currentPos === targetPos);
    if (targetTileIndex === -1) return;
    
    // Set the moving tile ID to trigger animation
    setMovingTileId(tileId);
    
    // Swap positions
    const newTiles = [...tiles];
    const tempPos = newTiles[tileIndex].currentPos;
    newTiles[tileIndex].currentPos = newTiles[targetTileIndex].currentPos;
    newTiles[targetTileIndex].currentPos = tempPos;
    
    // Update tiles after a short delay to allow animation to complete
    setTimeout(() => {
      setTiles(newTiles);
      setMovingTileId(null);
      
      // Check for win
      setTimeout(checkWin, 100);
    }, 150); // Match this with the transition duration
  }, [tiles, gameStarted, gameOver, checkWin]);
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Calculate progress percentage
  const timeProgress = (timeLeft / 30) * 100; // Changed to 30 seconds
  
  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;
      
      // Get the focused tile
      const focusedElement = document.activeElement as HTMLElement;
      if (!focusedElement || !focusedElement.dataset.tileId) return;
      
      const tileId = parseInt(focusedElement.dataset.tileId);
      
      switch (e.key) {
        case 'ArrowUp':
          moveTile(tileId, 'up');
          e.preventDefault();
          break;
        case 'ArrowDown':
          moveTile(tileId, 'down');
          e.preventDefault();
          break;
        case 'ArrowLeft':
          moveTile(tileId, 'left');
          e.preventDefault();
          break;
        case 'ArrowRight':
          moveTile(tileId, 'right');
          e.preventDefault();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver, moveTile]);
  
  // Countdown timer
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setGameOver(true);
          toast({
            title: "Time's Up!",
            description: "You ran out of time. Try again!",
            variant: "destructive",
          });
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);
  
  // Touch handlers for mobile users
  const handleTouchStart = (e: React.TouchEvent, tileId: number) => {
    if (!gameStarted || gameOver) return;
    
    // Record starting touch position
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    touchTileIdRef.current = tileId;
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!gameStarted || gameOver || touchTileIdRef.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    // Calculate swipe distance
    const deltaX = touchEndX - touchStartRef.current.x;
    const deltaY = touchEndY - touchStartRef.current.y;
    
    // Minimum swipe distance to detect movement
    const swipeThreshold = 30;
    
    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
      // Horizontal swipe
      moveTile(touchTileIdRef.current, deltaX > 0 ? 'right' : 'left');
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > swipeThreshold) {
      // Vertical swipe
      moveTile(touchTileIdRef.current, deltaY > 0 ? 'down' : 'up');
    }
    
    touchTileIdRef.current = null;
  };
  
  // Get grid position style from tile position
  const getPositionStyle = (position: number) => {
    const row = Math.floor(position / difficulty);
    const col = position % difficulty;
    
    return {
      gridRowStart: row + 1,
      gridColumnStart: col + 1,
      gridRowEnd: row + 2,
      gridColumnEnd: col + 2,
    };
  };
  
  // Get background position for a specific tile ID based on grid size
  const getBackgroundPosition = (tileId: number) => {
    const row = Math.floor(tileId / difficulty);
    const col = tileId % difficulty;
    
    // Calculate position as percentage based on grid size
    const xPercent = (col * (100 / (difficulty - 1)));
    const yPercent = (row * (100 / (difficulty - 1)));
    
    return `${xPercent}% ${yPercent}%`;
  };

  const getBackgroundSize = () => {
    return `${difficulty * 100}% ${difficulty * 100}%`;
  };
  
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
      <Card className="w-full p-6 shadow-lg bg-white/90 backdrop-blur-sm border-2 border-orange-100 animate-slide-in">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Tile Puzzle Challenge
          </h1>
          
          <div className="mt-2 flex items-center justify-center gap-2 text-slate-600">
            <span className="inline-block animate-pulse">⏱️</span>
            <span className="text-xl font-semibold">{formatTime(timeLeft)}</span>
          </div>
          
          <Progress value={timeProgress} className="mt-2 h-2 bg-slate-200" />
        </div>
        
        {!imageLoaded ? (
          <LoadingScreen logoImage={logoImage} />
        ) : !gameStarted ? (
          <div className="flex flex-col space-y-4 items-center">
            <Button
              onClick={initGame}
              className="w-full py-6 text-lg font-bold"
              variant="default"
            >
              Start Game
            </Button>
          </div>
        ) : (
          <div 
            className={`puzzle-container select-none ${gameInitialized ? 'animate-scale-in' : ''}`}
            onTouchEnd={handleTouchEnd}
          >
            {showCompleteImage ? (
              <div className="puzzle-grid aspect-square w-full border-2 border-slate-200 rounded-md overflow-hidden shadow-inner bg-white animate-[scale-in_0.8s_ease-out]">
                <div 
                  className="w-full h-full bg-cover bg-center bg-no-repeat animate-[pop-out_0.6s_ease-out]"
                  style={{
                    backgroundImage: `url(${logoImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </div>
            ) : (
              <div 
                className="puzzle-grid aspect-square w-full border-2 border-slate-200 rounded-md overflow-hidden shadow-inner bg-white"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${difficulty}, 1fr)`,
                  gridTemplateRows: `repeat(${difficulty}, 1fr)`,
                  gap: '2px'
                }}
              >
                {tiles.map(tile => (
                  <div
                    key={tile.id}
                    style={{
                      ...getPositionStyle(tile.currentPos),
                    }}
                    className={`
                      puzzle-tile relative overflow-hidden bg-white border border-slate-100
                      hover:shadow-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary
                      ${tile.id === movingTileId ? 'animate-tile-move' : ''}
                      ${gameInitialized ? 'animate-tile-appear' : ''}
                      ${showJoinAnimation ? 'animate-[join-tiles_1s_ease-out]' : ''}
                    `}
                    tabIndex={0}
                    data-tile-id={tile.id}
                    onTouchStart={(e) => handleTouchStart(e, tile.id)}
                  >
                    <div 
                      className="absolute inset-0 tile-image"
                      style={{
                        backgroundImage: `url(${logoImage})`,
                        backgroundPosition: getBackgroundPosition(tile.id),
                        backgroundSize: getBackgroundSize(),
                        backgroundRepeat: 'no-repeat',
                        transitionProperty: 'transform',
                        transitionDuration: '0.15s',
                        transitionTimingFunction: 'ease-out',
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {gameOver && (
          <div className="text-center mt-6 animate-scale-in">
            <div className={`text-2xl font-bold mb-3 ${isWin ? 'text-green-500' : 'text-red-500'}`}>
              {isWin ? '🎉 Congratulations! You won! 🎉' : '⌛ Time\'s up! Try again! ⌛'}
            </div>
            <Button
              onClick={initGame}
              className="w-full"
              variant={isWin ? "default" : "outline"}
            >
              Play Again
            </Button>
          </div>
        )}
      </Card>
      
      {showConfetti && isWin && <Confetti />}
    </div>
  );
};

export default Game;
