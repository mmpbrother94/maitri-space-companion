import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Info, Timer, Heart, Star, Zap, Sun, ChevronRight, Volume2, VolumeX, Sparkles, TrendingUp, ArrowLeft } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const PositiveAffirmationsDetail = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [timer, setTimer] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showAffirmation, setShowAffirmation] = useState(true);

  const affirmations = [
    { 
      text: 'I am worthy of love and respect', 
      duration: 20, 
      icon: '💖', 
      color: 'from-amber-400 to-orange-500',
      category: 'Self-Love'
    },
    { 
      text: 'I am capable and strong', 
      duration: 20, 
      icon: '💪', 
      color: 'from-orange-400 to-red-500',
      category: 'Strength'
    },
    { 
      text: 'I choose happiness and peace', 
      duration: 20, 
      icon: '☺️', 
      color: 'from-red-400 to-pink-500',
      category: 'Joy'
    },
    { 
      text: 'I trust in my journey', 
      duration: 20, 
      icon: '🌟', 
      color: 'from-pink-400 to-purple-500',
      category: 'Faith'
    },
    { 
      text: 'I am enough exactly as I am', 
      duration: 20, 
      icon: '✨', 
      color: 'from-purple-400 to-indigo-500',
      category: 'Acceptance'
    },
    { 
      text: 'I release what I cannot control', 
      duration: 20, 
      icon: '🕊️', 
      color: 'from-indigo-400 to-blue-500',
      category: 'Peace'
    },
    { 
      text: 'I am growing and learning', 
      duration: 20, 
      icon: '🌱', 
      color: 'from-blue-400 to-cyan-500',
      category: 'Growth'
    },
    { 
      text: 'I attract positive energy', 
      duration: 20, 
      icon: '⚡', 
      color: 'from-cyan-400 to-teal-500',
      category: 'Energy'
    },
    { 
      text: 'I am grateful for this moment', 
      duration: 20, 
      icon: '🙏', 
      color: 'from-teal-400 to-green-500',
      category: 'Gratitude'
    }
  ];

  const instructions = [
    {
      step: 1,
      title: 'Find Your Comfortable Space',
      description: 'Sit or stand in a relaxed position. Take three deep breaths and center yourself in the present moment.',
      icon: '🧘',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      step: 2,
      title: 'Speak With Conviction',
      description: 'Say each affirmation out loud with confidence and belief. Let the words resonate through your body and mind.',
      icon: '🗣️',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      step: 3,
      title: 'Visualize Your Truth',
      description: 'As you speak, visualize yourself embodying the affirmation. See yourself living this truth in vivid detail.',
      icon: '👁️',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      step: 4,
      title: 'Feel The Emotion',
      description: 'Connect with the positive emotion each affirmation brings. Allow yourself to truly feel joy, confidence, and peace.',
      icon: '💕',
      gradient: 'from-pink-500 to-purple-500'
    },
    {
      step: 5,
      title: 'Repeat With Intention',
      description: 'Say each affirmation 3 times, pausing between repetitions to let the message sink deeper into your consciousness.',
      icon: '🔄',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      step: 6,
      title: 'Place Your Hand On Your Heart',
      description: 'Physical touch enhances emotional connection. Feel your heartbeat as you affirm your worth and potential.',
      icon: '❤️',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      step: 7,
      title: 'Look In The Mirror',
      description: 'If possible, practice affirmations while looking at yourself. Make eye contact and speak directly to yourself.',
      icon: '🪞',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      step: 8,
      title: 'Write Them Down',
      description: 'After speaking, write your favorite affirmations in a journal. This reinforces neural pathways and commitment.',
      icon: '📝',
      gradient: 'from-cyan-500 to-teal-500'
    },
    {
      step: 9,
      title: 'Practice Daily Consistency',
      description: 'Set a specific time each day for affirmations. Morning and evening work best for lasting mindset shifts.',
      icon: '⏰',
      gradient: 'from-teal-500 to-green-500'
    },
    {
      step: 10,
      title: 'Believe & Embody',
      description: 'The key is genuine belief. Start with affirmations you can believe, then grow into bigger ones as your confidence builds.',
      icon: '🌈',
      gradient: 'from-green-500 to-amber-500'
    }
  ];

  const benefits = [
    { icon: TrendingUp, title: 'Boosts Confidence', desc: 'Rewires neural pathways', color: 'text-amber-400' },
    { icon: Heart, title: 'Reduces Stress', desc: 'Lowers cortisol levels', color: 'text-orange-400' },
    { icon: Sparkles, title: 'Positive Mindset', desc: 'Shifts thought patterns', color: 'text-red-400' },
    { icon: Zap, title: 'Increases Energy', desc: 'Elevates motivation', color: 'text-pink-400' }
  ];

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev >= affirmations[currentAffirmation].duration) {
            setCurrentAffirmation(p => {
              const next = (p + 1) % affirmations.length;
              if (next === 0) setSessionCount(c => c + 1);
              return next;
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentAffirmation]);

  // Fade affirmation text in/out
  useEffect(() => {
    if (isPlaying) {
      setShowAffirmation(false);
      const fadeTimer = setTimeout(() => setShowAffirmation(true), 100);
      return () => clearTimeout(fadeTimer);
    }
  }, [currentAffirmation, isPlaying]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentAffirmation(0);
    setTimer(0);
    setSessionCount(0);
  };

  const currentItem = affirmations[currentAffirmation];
  const progress = (timer / currentItem.duration) * 100;
  const totalTime = affirmations.reduce((acc, item) => acc + item.duration, 0);
  const elapsedTotal = affirmations.slice(0, currentAffirmation).reduce((acc, item) => acc + item.duration, 0) + timer;
  const overallProgress = (elapsedTotal / totalTime) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-950 to-red-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-amber-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-[float_8s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-orange-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-[float_10s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-red-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-[float_12s_ease-in-out_infinite]" style={{ animationDelay: '4s' }}></div>
        
        {/* Sparkles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-[twinkle_3s_ease-in-out_infinite]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              fontSize: `${Math.random() * 20 + 10}px`
            }}
          >
            ⭐
          </div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
           {/* Back Button */}
                <NavLink to={'/dashboard/interventions'}  className="flex items-center gap-2 mb-6 text-slate-300 hover:text-white transition-colors group">
                          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                          <span className="font-medium">Back to Interventions</span>
                        </NavLink>
        {/* Header */}
        <div className="text-center mb-8 animate-[fadeIn_0.8s_ease-out]">
          <div className="inline-block mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full blur-2xl opacity-50 animate-[pulse_3s_ease-in-out_infinite]"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/50 animate-[bounce_2s_ease-in-out_infinite]">
              <span className="text-5xl animate-[wiggle_1s_ease-in-out_infinite]">☺️</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 animate-[shimmer_3s_ease-in-out_infinite]">
            Positive Affirmations
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-4">
            Boost confidence and maintain positive mindset
          </p>
          <div className="flex justify-center gap-3">
            <span className="px-4 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm font-semibold border border-amber-500/30 animate-[pulse_2s_ease-in-out_infinite]">
              Motivation
            </span>
            <span className="px-4 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm font-semibold border border-orange-500/30">
              3 min
            </span>
            <span className="px-4 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-semibold border border-red-500/30">
              78% Complete
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Affirmation Display */}
          <div className="space-y-6">
            {/* Main Affirmation Display */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-[fadeInLeft_0.8s_ease-out] relative overflow-hidden">
              {/* Radial glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${currentItem.color} opacity-10 blur-3xl animate-[pulse_2s_ease-in-out_infinite]`}></div>
              
              <div className="relative flex flex-col items-center">
                {/* Affirmation Circle */}
                <div className="relative w-80 h-80 mb-6">
                  {/* Rotating rays */}
                  <div className="absolute inset-0 animate-[spin_20s_linear_infinite]">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className={`absolute top-1/2 left-1/2 w-1 h-20 bg-gradient-to-t ${currentItem.color} opacity-30`}
                        style={{
                          transform: `rotate(${i * 30}deg) translateY(-50%)`,
                          transformOrigin: 'top center'
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Progress Ring */}
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="url(#affirmationGradient)"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 drop-shadow-lg"
                    />
                    <defs>
                      <linearGradient id="affirmationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="50%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
                    <div className={`text-7xl mb-4 transition-all duration-500 ${isPlaying ? 'animate-[bounce_1s_ease-in-out_infinite]' : ''}`}>
                      {currentItem.icon}
                    </div>
                    <div className={`text-center transition-opacity duration-500 ${showAffirmation ? 'opacity-100' : 'opacity-0'}`}>
                      <div className="text-xs text-amber-400 font-semibold mb-2 uppercase tracking-wide">
                        {currentItem.category}
                      </div>
                      <p className={`text-2xl font-bold text-white mb-3 leading-tight bg-gradient-to-r ${currentItem.color} bg-clip-text text-transparent`}>
                        {currentItem.text}
                      </p>
                      <div className="text-4xl font-bold text-white">
                        {formatTime(currentItem.duration - timer)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Affirmation Progress Dots */}
                <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-md">
                  {affirmations.map((item, idx) => (
                    <div
                      key={idx}
                      className={`transition-all duration-500 ${
                        idx === currentAffirmation
                          ? `w-3 h-3 rounded-full bg-gradient-to-r ${item.color} shadow-lg animate-[pulse_1s_ease-in-out_infinite]`
                          : idx < currentAffirmation
                          ? 'w-2 h-2 rounded-full bg-white/40'
                          : 'w-2 h-2 rounded-full bg-white/10'
                      }`}
                      title={item.text}
                    />
                  ))}
                </div>

                {/* Controls */}
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="group relative px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl font-semibold text-white shadow-lg shadow-amber-500/50 hover:shadow-xl hover:shadow-amber-500/70 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center gap-3">
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      {isPlaying ? 'Pause' : 'Start Affirming'}
                    </div>
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-4 bg-white/10 backdrop-blur-sm rounded-2xl font-semibold text-white border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 w-full">
                  <div className="text-center px-4 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30">
                    <div className="text-2xl font-bold text-amber-400">{sessionCount}</div>
                    <div className="text-xs text-slate-400">Sessions</div>
                  </div>
                  <div className="text-center px-4 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30">
                    <div className="text-2xl font-bold text-orange-400">{currentAffirmation + 1}/{affirmations.length}</div>
                    <div className="text-xs text-slate-400">Affirmation</div>
                  </div>
                  <div className="text-center px-4 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl border border-red-500/30">
                    <div className="text-2xl font-bold text-red-400">{Math.round(overallProgress)}%</div>
                    <div className="text-xs text-slate-400">Progress</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl animate-[fadeInLeft_1s_ease-out]">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-400 animate-[spin_3s_linear_infinite]" />
                Science-Backed Benefits
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105 group cursor-pointer"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <benefit.icon className={`w-8 h-8 ${benefit.color} mb-2 group-hover:scale-110 transition-transform`} />
                    <div className="text-white font-semibold text-sm">{benefit.title}</div>
                    <div className="text-slate-400 text-xs">{benefit.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Instructions */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl animate-[fadeInRight_0.8s_ease-out] max-h-[800px] overflow-y-auto custom-scrollbar">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 sticky  bg-white/5 backdrop-blur-xl pb-4 z-10">
                <Info className="w-6 h-6 text-amber-400" />
                Affirmation Practice Guide
              </h3>
              
              <div className="space-y-3">
                {instructions.map((instruction, idx) => (
                  <div
                    key={idx}
                    className="group relative bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 rounded-2xl p-4 border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer animate-[fadeInRight_0.8s_ease-out]"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${instruction.gradient} rounded-xl flex items-center justify-center shadow-lg text-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                        {instruction.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold bg-gradient-to-r ${instruction.gradient} bg-clip-text text-transparent`}>
                            STEP {instruction.step}
                          </span>
                        </div>
                        <h4 className="text-white font-bold text-base mb-1">{instruction.title}</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{instruction.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Did You Know */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl rounded-3xl p-6 border border-amber-500/30 shadow-2xl animate-[fadeInRight_1s_ease-out] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full blur-3xl opacity-20 animate-[pulse_3s_ease-in-out_infinite]"></div>
              <div className="relative flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Sun className="w-6 h-6 text-white animate-[spin_10s_linear_infinite]" />
                  </div>
                </div>
                <div>
                  <h4 className="text-amber-300 font-bold text-lg mb-2 flex items-center gap-2">
                    💡 Did You Know?
                  </h4>
                  <p className="text-amber-100 text-sm leading-relaxed">
                    Consistent positive affirmations can rewire thought patterns and reduce stress, supported by neuroscience research. Studies show that daily affirmations activate reward centers in the brain, increase self-worth by 35%, and reduce negative self-talk by 50% within just 21 days of practice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #f59e0b, #f97316);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #d97706, #ea580c);
        }
      `}</style>
    </div>
  );
};

export default PositiveAffirmationsDetail;