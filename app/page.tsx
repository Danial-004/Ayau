"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Heart, Sparkles, Coffee, Volume2 } from 'lucide-react';

interface ScratchCardProps {
  onScratchComplete: () => void;
  resetTrigger: number;
}

const ScratchCard: React.FC<ScratchCardProps> = ({ onScratchComplete, resetTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const moveCount = useRef<number>(0);
  const isDone = useRef<boolean>(false);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.globalCompositeOperation = 'source-over'; 
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#f472b6';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Тілекті оқу үшін осы жерді сүрт ✨', canvas.width / 2, canvas.height / 2);
    
    moveCount.current = 0;
    isDone.current = false;
  };

  useEffect(() => {
    initCanvas();
  }, [resetTrigger]);

  const handleScratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || isDone.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent<HTMLCanvasElement>).clientX;
      clientY = (e as React.MouseEvent<HTMLCanvasElement>).clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    moveCount.current += 1;
    
    if (moveCount.current % 15 === 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let clearPixels = 0;
      const totalPixels = canvas.width * canvas.height;
      
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] < 128) {
          clearPixels++;
        }
      }
      
      const clearedPercentage = (clearPixels / totalPixels) * 100;
      
      if (clearedPercentage > 75) {
        isDone.current = true;
        onScratchComplete();
      }
    }
  };

  return (
    <div className="relative w-full max-w-md h-48 mx-auto rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center p-6 border border-pink-500/40 shadow-[0_0_20px_rgba(236,72,153,0.2)] text-center">
      <p className="text-pink-300 font-medium leading-relaxed px-2">
        Мұғалімдер күнімен! 🍂 Оқу мен сессиялар кейде шаршатса да, ешқашан берілме. Сенен болашақта оқушылары қатты жақсы көретін, ең мейірімді әрі ең мықты мұғалім шығатынына сенімдімін! 💖
      </p>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="absolute top-0 left-0 w-full h-full cursor-pointer touch-none"
        onMouseMove={handleScratch}
        onTouchMove={handleScratch}
      />
    </div>
  );
};

interface ClickEffect {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

export default function TeacherGiftApp() {
  const [stage, setStage] = useState<number>(0); 
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [compliment, setCompliment] = useState<string>("Шаршаған кезде осында бас 🪄");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [secretTab, setSecretTab] = useState<'video' | 'photos'>('video'); 
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0); 
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [clicks, setClicks] = useState<ClickEffect[]>([]);
  const [isScratched, setIsScratched] = useState<boolean>(false);
  const [resetScratchCount, setResetScratchCount] = useState<number>(0);

  const hour = new Date().getHours();
  let greeting = 'Қайырлы күн';
  if (hour < 12) greeting = 'Қайырлы таң';
  else if (hour > 18) greeting = 'Қайырлы кеш';

  const complimentsList: string[] = [
    "Сен әлемдегі ең әдемі мұғалімсің! 😍",
    "Конспектілер күте тұрады, өзіңе жақсылап демалыс бер! ☕️",
    "Сенің күлкің кез келген қиын сабақты жеңілдетеді! ✨",
    "Бүгін сенің күнің! Күлімдеп жүр! 💖",
    "Сен өте ақылдысың, бәрін бұйырса өтесің! 🤍"
  ];

// Барлық 21 фотоны браузер жадына алдын ала жүктеп алу (Preload)
  useEffect(() => {
    for (let i = 1; i <= 21; i++) {
      const img = new Image();
      img.src = `/photos/${i}.png`;
    }
  }, []);

  useEffect(() => {
    if (stage === 0) {
      const interval = setInterval(() => {
        setLoadingProgress((prev: number) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStage(1), 800);
            return 100;
          }
          return prev + 3;
        });
      }, 420);
      return () => clearInterval(interval);
    }
  }, [stage]);

  useEffect(() => {
    let photoInterval: ReturnType<typeof setInterval>;
    if (showSecret && secretTab === 'photos') {
      photoInterval = setInterval(() => {
        setCurrentPhotoIndex((prev: number) => (prev + 1) % 21);
      }, 420);
    } else {
      setCurrentPhotoIndex(0);
    }
    return () => clearInterval(photoInterval);
  }, [showSecret, secretTab]);

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const newClick: ClickEffect = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
      emoji: ['💖', '🤍', '💗'][Math.floor(Math.random() * 3)]
    };
    setClicks((prev: ClickEffect[]) => [...prev, newClick]);
    setTimeout(() => {
      setClicks((prev: ClickEffect[]) => prev.filter((c: ClickEffect) => c.id !== newClick.id));
    }, 1000);
  };

  const handleAntiStress = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setResetScratchCount((prev: number) => prev + 1);
    setIsScratched(false);
    const random = Math.floor(Math.random() * complimentsList.length);
    setCompliment(complimentsList[random]);
  };

  const toggleAudio = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setResetScratchCount((prev: number) => prev + 1);
    setIsScratched(false);

    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  return (
    
    <div 
      className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans"
      onClick={handleScreenClick}
    >
      {/* Сайт ашылған бетте видео мен аудионы жасырын жүктеп алу (Лездік ашылу үшін) */}
      <div className="hidden">
        <video src="/Ayau.mp4" preload="auto" />
        <audio src="/audio.mp3" preload="auto" />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatUp {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
          100% { transform: translate(-50%, -150px) scale(1.5); opacity: 0; }
        }
        .click-animation {
          animation: floatUp 1s ease-out forwards;
          pointer-events: none;
        }
        @keyframes fallDown {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        .confetti-fall {
          animation: fallDown linear forwards;
          pointer-events: none;
        }
      `}} />

      {clicks.map((click: ClickEffect) => (
        <div key={click.id} className="fixed z-50 text-2xl click-animation" style={{ left: click.x, top: click.y }}>
          {click.emoji}
        </div>
      ))}

      {isScratched && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {Array.from({ length: 60 }).map((_: unknown, i: number) => (
            <div
              key={i}
              className="absolute text-2xl confetti-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-5%`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 1.5}s`,
              }}
            >
              {['💖', '💕', '🤍', '💖'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/30 to-[#020617]" />
        {Array.from({ length: 30 }).map((_: unknown, i: number) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              top: `${(i * 19) % 100}%`,
              left: `${(i * 27) % 100}%`,
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              opacity: (i % 4) * 0.2 + 0.3,
              boxShadow: '0 0 10px #f472b6',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        {stage === 0 && (
          <div className="flex flex-col items-center space-y-4">
            <Heart className="w-12 h-12 text-pink-500 animate-pulse drop-shadow-[0_0_15px_#ec4899]" />
            <h2 className="text-lg font-medium text-pink-300 text-center">
              {loadingProgress < 100 ? 'Әлемдегі ең сүйкімді болашақ мұғалімді іздеу...' : 'Табылды! 🌸'}
            </h2>
            <div className="w-64 h-3 bg-slate-900 rounded-full overflow-hidden border border-pink-500/30">
              <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300" style={{ width: `${loadingProgress}%` }} />
            </div>
          </div>
        )}

        {stage === 1 && (
          <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-pink-500/40 text-center z-10">
            <h2 className="text-2xl font-bold text-pink-400 mb-4">Кішкене тест 👩🏻‍🏫</h2>
            <p className="text-base text-slate-300 mb-6">Болашақта оқушың дәптерін ұмытып келсе, не істейсің?</p>
            <div className="space-y-3">
              {['Басыңды ұмытып келмедің бе? ', 'Ештеңе етпейді, мә, мына параққа жаз ', 'Күнделікке екі! Ата-анаңды шақыр! '].map((answer: string, index: number) => (
                <button
                  key={index}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); setStage(2); }}
                  className="w-full p-4 bg-slate-800/80 hover:bg-pink-950/60 text-pink-200 border border-pink-500/30 rounded-xl transition-all font-medium text-sm text-left shadow-md cursor-pointer"
                >
                  {answer}
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === 2 && (
          <div className="w-full max-w-md flex flex-col items-center space-y-6 pb-10 z-10">
            <div className="text-center space-y-2 mt-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-pink-400">
                {greeting}, болашақ маман! <Coffee className="inline w-7 h-7 pb-1 text-pink-300" />
              </h1>
            </div>

            <ScratchCard 
              onScratchComplete={() => setIsScratched(true)} 
              resetTrigger={resetScratchCount} 
            />

            <div className="w-full bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-pink-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center text-pink-400 border border-pink-500/30">
                  <Volume2 className="w-5 h-5" />
                </div>
                {/*<div>
                  <p className="font-medium text-slate-200 text-sm">Жеке тілек</p>
                  <p className="text-xs text-slate-400">0:15</p>
                </div>*/}
              </div>
              <button 
                onClick={toggleAudio}
                className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:scale-105 transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
              </button>
              <audio ref={audioRef} src="/your-voice-message.mp3" onEnded={() => setIsPlaying(false)} />
            </div>

            <div className="w-full flex flex-col items-center mt-2">
              <button
                onClick={handleAntiStress}
                className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-medium hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 border border-pink-400/30 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
                <span>{compliment === "Шаршаған кезде осында бас 🪄" ? compliment : "Тағы бас!"}</span>
              </button>
              {compliment !== "Шаршаған кезде осында бас 🪄" && (
                <p className="mt-4 text-center text-base font-medium text-pink-300 animate-bounce">
                  {compliment}
                </p>
              )}
            </div>

            <button 
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); setShowSecret(true); }}
              className="mt-4 opacity-60 hover:opacity-100 transition-opacity cursor-pointer text-xs text-pink-300 flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Құпия ✨</span>
            </button>
          </div>
        )}
      </div>

      {showSecret && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-slate-900 border border-pink-500/50 rounded-3xl p-5 text-center flex flex-col items-center space-y-4 shadow-[0_0_50px_rgba(236,72,153,0.4)]">
            
           {/* <h3 className="text-xl font-bold text-pink-400">💖 Кішігірім! 💖</h3> */}

            <div className="flex space-x-2 bg-slate-950 p-1 rounded-xl border border-pink-500/30 w-full">
              <button
                onClick={() => setSecretTab('video')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  secretTab === 'video' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'text-slate-400'
                }`}
              >
                📹 Видео
              </button>
              <button
                onClick={() => setSecretTab('photos')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  secretTab === 'photos' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'text-slate-400'
                }`}
              >
                📸 Фото
              </button>
            </div>

            <div className="w-full max-w-[260px] aspect-[9/16] rounded-2xl overflow-hidden border border-pink-500/40 bg-slate-950 flex items-center justify-center relative shadow-[0_0_20px_rgba(236,72,153,0.3)]">
              {secretTab === 'video' ? (
                <video 
                  src="/Ayau.mp4" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  controls 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full relative">
                  {/* 21 фотоны алдын ала жүктеп, бір-бірінің үстіне қоямыз (телефон қатпай, лезде ауысуы үшін) */}
                  {Array.from({ length: 21 }).map((_, idx) => (
                    <img
                      key={idx}
                      src={`/photos/${idx + 1}.png`}
                      alt={`Фото ${idx + 1}`}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                        idx === currentPhotoIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    />
                  ))}
                  <div className="absolute bottom-2 right-2 bg-black/60 px-2.5 py-1 rounded-full text-[10px] text-pink-300 border border-pink-500/30 z-20">
                    {currentPhotoIndex + 1} / 21
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowSecret(false)}
              className="py-2.5 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:scale-105 transition-all cursor-pointer text-sm"
            >
              Жабу ✖
            </button>

            {secretTab === 'photos' && <audio src="/audio.mp3" autoPlay loop />}
          </div>
        </div>
      )}
    </div>
  );
}