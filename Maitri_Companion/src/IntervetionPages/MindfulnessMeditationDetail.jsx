import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Info, Timer, Brain, Heart, Sparkles, Focus, ChevronRight, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const MindfulnessMeditationDetail = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timer, setTimer] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Audio reference
  const audioRef = useRef(null);

  const phases = [
    { name: 'Ground Yourself', duration: 60, icon: '🌍', color: 'from-indigo-400 to-purple-500', description: 'Notice your surroundings' },
    { name: 'Body Scan', duration: 120, icon: '🧘‍♀️', color: 'from-purple-400 to-pink-500', description: 'Feel each part of your body' },
    { name: 'Breath Focus', duration: 180, icon: '⚛️', color: 'from-pink-400 to-rose-500', description: 'Follow your natural breath' },
    { name: 'Gentle Awareness', duration: 120, icon: '✨', color: 'from-rose-400 to-orange-500', description: 'Observe thoughts without judgment' },
    { name: 'Return & Reflect', duration: 120, icon: '🙏', color: 'from-orange-400 to-amber-500', description: 'Come back to the present' }
  ];

  const instructions = [
    {
      step: 1,
      title: 'Find Your Space',
      description: 'Choose a quiet spot where you won\'t be disturbed. Sit comfortably on a chair or cushion with your back straight but not rigid.',
      icon: '🪷',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      step: 2,
      title: 'Set Your Intention',
      description: 'Take a moment to acknowledge why you\'re here. Set a gentle intention to be present and kind to yourself during this practice.',
      icon: '💭',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      step: 3,
      title: 'Close Your Eyes',
      description: 'Gently close your eyes or maintain a soft gaze downward. Allow your facial muscles to relax completely.',
      icon: '👁️',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      step: 4,
      title: 'Notice Your Breath',
      description: 'Bring attention to your natural breathing. Don\'t try to change it—just observe the rhythm, the sensation of air flowing in and out.',
      icon: '🌬️',
      gradient: 'from-rose-500 to-orange-500'
    },
    {
      step: 5,
      title: 'Accept Wandering Thoughts',
      description: 'When your mind wanders (and it will!), gently acknowledge the thought without judgment and return focus to your breath.',
      icon: '🧠',
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      step: 6,
      title: 'Expand Awareness',
      description: 'Gradually expand your awareness to include sounds, sensations, and emotions. Notice everything with curiosity and acceptance.',
      icon: '🌟',
      gradient: 'from-amber-500 to-yellow-500'
    },
    {
      step: 7,
      title: 'Close with Gratitude',
      description: 'Before opening your eyes, take three deep breaths. Thank yourself for taking this time. Slowly return to your day.',
      icon: '🙏',
      gradient: 'from-yellow-500 to-green-500'
    }
  ];

  const benefits = [
    { icon: Brain, title: 'Mental Clarity', desc: 'Increases gray matter', color: 'text-indigo-400' },
    { icon: Heart, title: 'Emotional Balance', desc: 'Reduces anxiety & stress', color: 'text-purple-400' },
    { icon: Focus, title: 'Better Focus', desc: 'Improves attention span', color: 'text-pink-400' },
    { icon: Sparkles, title: 'Self-Awareness', desc: 'Deepens understanding', color: 'text-rose-400' }
  ];

  // Timer logic
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev >= phases[currentPhase].duration) {
            setCurrentPhase(p => {
              const next = (p + 1) % phases.length;
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
  }, [isPlaying, currentPhase]);

  // Audio control effect
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(e => console.warn("Audio play failed:", e));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentPhase(0);
    setTimer(0);
    setSessionCount(0);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const currentPhaseData = phases[currentPhase];
  const progress = (timer / currentPhaseData.duration) * 100;
  const totalTime = phases.reduce((acc, phase) => acc + phase.duration, 0);
  const elapsedTotal = phases.slice(0, currentPhase).reduce((acc, phase) => acc + phase.duration, 0) + timer;
  const overallProgress = (elapsedTotal / totalTime) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 relative overflow-hidden">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src="/relaxation_music.mp3" // 👈 Place your audio file in public/ folder
        loop
        muted={isMuted}
      />

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-[float_8s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-[float_10s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-[float_12s_ease-in-out_infinite]" style={{ animationDelay: '4s' }}></div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-[floatParticle_15s_ease-in-out_infinite]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <NavLink to={'/dashboard/interventions'} className="flex items-center gap-2 mb-6 text-slate-300 hover:text-white transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Interventions</span>
        </NavLink>

        {/* Header */}
        <div className="text-center mb-8 animate-[fadeIn_0.8s_ease-out]">
          <div className="inline-block mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-2xl opacity-50 animate-[pulse_3s_ease-in-out_infinite]"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/50 animate-[float_3s_ease-in-out_infinite]">
              <span className="text-5xl animate-[spin_20s_linear_infinite]">⚛️</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Mindfulness Meditation
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-4">
            Focus on present moment awareness and mental clarity
          </p>
          <div className="flex justify-center gap-3">
            <span className="px-4 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-semibold border border-indigo-500/30 animate-[pulse_2s_ease-in-out_infinite]">
              Mental Health
            </span>
            <span className="px-4 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold border border-purple-500/30">
              10 min
            </span>
            <span className="px-4 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm font-semibold border border-pink-500/30">
              88% Complete
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Meditation Circle */}
          <div className="space-y-6">
            {/* Main Meditation Circle */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-[fadeInLeft_0.8s_ease-out] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_3s_ease-in-out_infinite]"></div>
              
              <div className="relative flex flex-col items-center">
                <div className="relative w-80 h-80 mb-6">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${currentPhaseData.color} opacity-20 animate-[breathe_4s_ease-in-out_infinite] blur-xl`}></div>
                  <div className={`absolute inset-4 rounded-full bg-gradient-to-br ${currentPhaseData.color} opacity-30 animate-[breathe_4s_ease-in-out_infinite_0.5s] blur-lg`}></div>
                  
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="url(#meditationGradient)"
                      strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 drop-shadow-lg"
                    />
                    <defs>
                      <linearGradient id="meditationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="50%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000`}>
                    <div className={`text-8xl mb-4 ${isPlaying ? 'animate-[breathe_4s_ease-in-out_infinite]' : ''}`}>
                      {currentPhaseData.icon}
                    </div>
                    <div className={`text-2xl font-bold bg-gradient-to-r ${currentPhaseData.color} bg-clip-text text-transparent mb-1`}>
                      {currentPhaseData.name}
                    </div>
                    <div className="text-sm text-slate-400 mb-3">{currentPhaseData.description}</div>
                    <div className="text-5xl font-bold text-white">
                      {formatTime(currentPhaseData.duration - timer)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mb-6">
                  {phases.map((phase, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-all duration-500 ${
                        idx === currentPhase
                          ? `w-12 bg-gradient-to-r ${phase.color}`
                          : idx < currentPhase
                          ? 'w-8 bg-white/30'
                          : 'w-8 bg-white/10'
                      }`}
                    />
                  ))}
                </div>

                {/* Controls */}
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={togglePlay}
                    className="group relative px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl font-semibold text-white shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/70 transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      {isPlaying ? 'Pause' : 'Begin Journey'}
                    </div>
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-4 bg-white/10 backdrop-blur-sm rounded-2xl font-semibold text-white border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="px-6 py-4 bg-white/10 backdrop-blur-sm rounded-2xl font-semibold text-white border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 w-full">
                  <div className="text-center px-4 py-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30">
                    <div className="text-2xl font-bold text-indigo-400">{sessionCount}</div>
                    <div className="text-xs text-slate-400">Sessions</div>
                  </div>
                  <div className="text-center px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                    <div className="text-2xl font-bold text-purple-400">{currentPhase + 1}/{phases.length}</div>
                    <div className="text-xs text-slate-400">Phase</div>
                  </div>
                  <div className="text-center px-4 py-3 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-xl border border-pink-500/30">
                    <div className="text-2xl font-bold text-pink-400">{Math.round(overallProgress)}%</div>
                    <div className="text-xs text-slate-400">Progress</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl animate-[fadeInLeft_1s_ease-out]">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-400" />
                Proven Benefits
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105 group cursor-pointer"
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
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl animate-[fadeInRight_0.8s_ease-out]">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Info className="w-6 h-6 text-indigo-400" />
                Mindfulness Guide
              </h3>
              
              <div className="space-y-3">
                {instructions.map((instruction, idx) => (
                  <div
                    key={idx}
                    className="group relative bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 rounded-2xl p-4 border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
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
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl rounded-3xl p-6 border border-indigo-500/30 shadow-2xl animate-[fadeInRight_1s_ease-out] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-3xl opacity-20 animate-[pulse_3s_ease-in-out_infinite]"></div>
              <div className="relative flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-indigo-300 font-bold text-lg mb-2 flex items-center gap-2">
                    💡 Did You Know?
                  </h4>
                  <p className="text-indigo-100 text-sm leading-relaxed">
                    Mindfulness practice is proven to reduce rumination and anxiety, increasing brain gray matter and attention span. Studies show just 10 minutes daily can improve focus by 30% and reduce stress hormones by 25% within 8 weeks.
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
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-50px) translateX(20px); opacity: 0.4; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default MindfulnessMeditationDetail;