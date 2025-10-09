import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Info, Timer, Heart, Zap, Shield, Moon, ChevronRight, Volume2, VolumeX, Activity, ArrowLeft } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const ProgressiveMuscleRelaxationDetail = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timer, setTimer] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isIntensity, setIsIntensity] = useState(false);

  // Audio reference
  const audioRef = useRef(null);

  const muscleGroups = [
    { name: 'Hands & Forearms', duration: 90, icon: '✊', color: 'from-emerald-400 to-green-500', instruction: 'Tense then release' },
    { name: 'Upper Arms', duration: 90, icon: '💪', color: 'from-green-400 to-teal-500', instruction: 'Flex and relax' },
    { name: 'Face & Jaw', duration: 120, icon: '😌', color: 'from-teal-400 to-cyan-500', instruction: 'Scrunch and soften' },
    { name: 'Neck & Shoulders', duration: 120, icon: '🦴', color: 'from-cyan-400 to-blue-500', instruction: 'Lift and drop' },
    { name: 'Chest & Back', duration: 90, icon: '🫁', color: 'from-blue-400 to-indigo-500', instruction: 'Arch and settle' },
    { name: 'Abdomen', duration: 90, icon: '🎯', color: 'from-indigo-400 to-purple-500', instruction: 'Tighten and release' },
    { name: 'Thighs', duration: 90, icon: '🦵', color: 'from-purple-400 to-pink-500', instruction: 'Squeeze and loosen' },
    { name: 'Calves & Feet', duration: 120, icon: '👣', color: 'from-pink-400 to-rose-500', instruction: 'Point and flex' },
    { name: 'Full Body Scan', duration: 120, icon: '💚', color: 'from-emerald-400 to-green-500', instruction: 'Complete relaxation' }
  ];

  const instructions = [
    {
      step: 1,
      title: 'Prepare Your Space',
      description: 'Find a quiet, comfortable place to lie down or sit. Loosen any tight clothing and remove glasses or contact lenses.',
      icon: '🛋️',
      gradient: 'from-emerald-500 to-green-500',
      bodyPart: 'Setup'
    },
    {
      step: 2,
      title: 'Hands & Forearms',
      description: 'Make tight fists for 5 seconds, feeling tension in your hands and forearms. Then release suddenly and notice the difference for 10-15 seconds.',
      icon: '✊',
      gradient: 'from-green-500 to-teal-500',
      bodyPart: 'Upper Extremities'
    },
    {
      step: 3,
      title: 'Upper Arms & Biceps',
      description: 'Bend your arms at the elbows and tense your biceps. Hold firmly for 5 seconds, then let your arms fall limp and relaxed.',
      icon: '💪',
      gradient: 'from-teal-500 to-cyan-500',
      bodyPart: 'Upper Extremities'
    },
    {
      step: 4,
      title: 'Face & Jaw',
      description: 'Raise your eyebrows, scrunch your face, and clench your jaw. Hold for 5 seconds, then let everything soften and melt.',
      icon: '😌',
      gradient: 'from-cyan-500 to-blue-500',
      bodyPart: 'Head & Neck'
    },
    {
      step: 5,
      title: 'Neck & Shoulders',
      description: 'Pull your shoulders up toward your ears and press your head back. Hold for 5 seconds, then let shoulders drop heavily.',
      icon: '🦴',
      gradient: 'from-blue-500 to-indigo-500',
      bodyPart: 'Head & Neck'
    },
    {
      step: 6,
      title: 'Chest & Upper Back',
      description: 'Take a deep breath, arch your back slightly, and hold. Then exhale completely, letting your back settle into the surface beneath you.',
      icon: '🫁',
      gradient: 'from-indigo-500 to-purple-500',
      bodyPart: 'Torso'
    },
    {
      step: 7,
      title: 'Abdomen & Core',
      description: 'Tighten your stomach muscles as if preparing for impact. Hold for 5 seconds, then release and breathe naturally.',
      icon: '🎯',
      gradient: 'from-purple-500 to-pink-500',
      bodyPart: 'Torso'
    },
    {
      step: 8,
      title: 'Thighs & Legs',
      description: 'Squeeze your thigh muscles tightly together. Hold the tension, then release and feel your legs become heavy and relaxed.',
      icon: '🦵',
      gradient: 'from-pink-500 to-rose-500',
      bodyPart: 'Lower Extremities'
    },
    {
      step: 9,
      title: 'Calves & Feet',
      description: 'Point your toes away from your body, then curl them under. Hold for 5 seconds, then flex your feet and release completely.',
      icon: '👣',
      gradient: 'from-rose-500 to-orange-500',
      bodyPart: 'Lower Extremities'
    },
    {
      step: 10,
      title: 'Full Body Integration',
      description: 'Mentally scan your entire body from head to toe. Notice areas of remaining tension and consciously release them. Breathe deeply and enjoy total relaxation.',
      icon: '✨',
      gradient: 'from-orange-500 to-amber-500',
      bodyPart: 'Complete'
    }
  ];

  const benefits = [
    { icon: Heart, title: 'Reduces Tension', desc: 'Releases muscle stress', color: 'text-emerald-400' },
    { icon: Moon, title: 'Better Sleep', desc: 'Alleviates insomnia', color: 'text-green-400' },
    { icon: Shield, title: 'Pain Relief', desc: 'Decreases chronic pain', color: 'text-teal-400' },
    { icon: Zap, title: 'Energy Balance', desc: 'Restores vitality', color: 'text-cyan-400' }
  ];

  // Timer logic
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev >= muscleGroups[currentPhase].duration) {
            setCurrentPhase(p => {
              const next = (p + 1) % muscleGroups.length;
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

  // Toggle intensity animation every 5 seconds when playing
  useEffect(() => {
    if (isPlaying) {
      const intensityTimer = setInterval(() => {
        setIsIntensity(prev => !prev);
      }, 5000);
      return () => clearInterval(intensityTimer);
    }
  }, [isPlaying]);

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

  const currentGroup = muscleGroups[currentPhase];
  const progress = (timer / currentGroup.duration) * 100;
  const totalTime = muscleGroups.reduce((acc, group) => acc + group.duration, 0);
  const elapsedTotal = muscleGroups.slice(0, currentPhase).reduce((acc, group) => acc + group.duration, 0) + timer;
  const overallProgress = (elapsedTotal / totalTime) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-950 to-teal-950 relative overflow-hidden">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src="/muscle_relaxation.mp3" // 👈 Place your audio file in public/ folder
        loop
        muted={isMuted}
      />

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-[float_8s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-green-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-[float_10s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-teal-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-[float_12s_ease-in-out_infinite]" style={{ animationDelay: '4s' }}></div>
        
        {/* Pulse waves */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-500/20 animate-[ripple_4s_ease-out_infinite]"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              animationDelay: `${i * 0.8}s`
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
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full blur-2xl opacity-50 animate-[pulse_3s_ease-in-out_infinite]"></div>
            <div className={`relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/50 transition-transform duration-500 ${isIntensity && isPlaying ? 'scale-110' : 'scale-100'}`}>
              <span className={`text-5xl transition-transform duration-500 ${isIntensity && isPlaying ? 'scale-125' : 'scale-100'}`}>💚</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 bg-clip-text  bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400">
            Progressive Muscle Relaxation
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-4">
            Systematic tension and release of muscle groups
          </p>
          <div className="flex justify-center gap-3">
            <span className="px-4 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-semibold border border-emerald-500/30 animate-[pulse_2s_ease-in-out_infinite]">
              Physical Wellness
            </span>
            <span className="px-4 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold border border-green-500/30">
              15 min
            </span>
            <span className="px-4 py-1 bg-teal-500/20 text-teal-300 rounded-full text-sm font-semibold border border-teal-500/30">
              85% Complete
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Muscle Group Display */}
          <div className="space-y-6">
            {/* Main Display Circle */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-[fadeInLeft_0.8s_ease-out] relative overflow-hidden">
              {/* Wave effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent animate-[wave_3s_ease-in-out_infinite]"></div>
              
              <div className="relative flex flex-col items-center">
                {/* Animated Body Visualization */}
                <div className="relative w-80 h-80 mb-6">
                  {/* Pulsing background layers */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${currentGroup.color} opacity-20 blur-xl transition-transform duration-500 ${isIntensity && isPlaying ? 'scale-110' : 'scale-100'}`}></div>
                  <div className={`absolute inset-4 rounded-full bg-gradient-to-br ${currentGroup.color} opacity-30 blur-lg transition-transform duration-500 ${isIntensity && isPlaying ? 'scale-105' : 'scale-100'}`}></div>
                  
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
                      stroke="url(#pmrGradient)"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 drop-shadow-lg"
                    />
                    <defs>
                      <linearGradient id="pmrGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#14b8a6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`text-8xl mb-4 transition-all duration-500 ${isIntensity && isPlaying ? 'scale-125 filter drop-shadow-lg' : 'scale-100'}`}>
                      {currentGroup.icon}
                    </div>
                    <div className={`text-2xl font-bold bg-gradient-to-r ${currentGroup.color} bg-clip-text text-transparent mb-1`}>
                      {currentGroup.name}
                    </div>
                    <div className="text-sm text-slate-400 mb-3">{currentGroup.instruction}</div>
                    <div className="text-5xl font-bold text-white">
                      {formatTime(currentGroup.duration - timer)}
                    </div>
                    {isPlaying && (
                      <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-500 ${
                        isIntensity 
                          ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' 
                          : 'bg-green-500/30 text-green-300 border border-green-500/50'
                      }`}>
                        {isIntensity ? '💪 TENSE' : '😌 RELEASE'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Muscle Group Progress Dots */}
                <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-md">
                  {muscleGroups.map((group, idx) => (
                    <div
                      key={idx}
                      className={`transition-all duration-500 ${
                        idx === currentPhase
                          ? `w-3 h-3 rounded-full bg-gradient-to-r ${group.color} shadow-lg`
                          : idx < currentPhase
                          ? 'w-2 h-2 rounded-full bg-white/40'
                          : 'w-2 h-2 rounded-full bg-white/10'
                      }`}
                      title={group.name}
                    />
                  ))}
                </div>

                {/* Controls */}
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="group relative px-10 py-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl font-semibold text-white shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/70 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center gap-3">
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      {isPlaying ? 'Pause' : 'Start Relaxation'}
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
                  <div className="text-center px-4 py-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl border border-emerald-500/30">
                    <div className="text-2xl font-bold text-emerald-400">{sessionCount}</div>
                    <div className="text-xs text-slate-400">Sessions</div>
                  </div>
                  <div className="text-center px-4 py-3 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-xl border border-green-500/30">
                    <div className="text-2xl font-bold text-green-400">{currentPhase + 1}/{muscleGroups.length}</div>
                    <div className="text-xs text-slate-400">Muscle Group</div>
                  </div>
                  <div className="text-center px-4 py-3 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-xl border border-teal-500/30">
                    <div className="text-2xl font-bold text-teal-400">{Math.round(overallProgress)}%</div>
                    <div className="text-xs text-slate-400">Progress</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl animate-[fadeInLeft_1s_ease-out]">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-emerald-400" />
                Clinical Benefits
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
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 sticky  bg-green-900 w-[70rem] backdrop-blur-xl pb-4 z-10">
                <Info className="w-6 h-6 text-emerald-400" />
                PMR Guide
              </h3>
              
              <div className="space-y-3">
                {instructions.map((instruction, idx) => (
                  <div
                    key={idx}
                    className="group relative bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 rounded-2xl p-4 border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer animate-[fadeInRight_0.8s_ease-out]"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${instruction.gradient} rounded-xl flex items-center justify-center shadow-lg text-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                        {instruction.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold bg-gradient-to-r ${instruction.gradient} bg-clip-text text-transparent`}>
                            {instruction.bodyPart.toUpperCase()}
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
            <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-xl rounded-3xl p-6 border border-emerald-500/30 shadow-2xl animate-[fadeInRight_1s_ease-out] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full blur-3xl opacity-20 animate-[pulse_3s_ease-in-out_infinite]"></div>
              <div className="relative flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-emerald-300 font-bold text-lg mb-2 flex items-center gap-2">
                    💡 Did You Know?
                  </h4>
                  <p className="text-emerald-100 text-sm leading-relaxed">
                    PMR is shown to alleviate insomnia, reduce muscle tension, and promote overall relaxation in clinical trials. Research indicates that regular practice can lower blood pressure by 10%, reduce chronic pain by 40%, and improve sleep quality by 60% within 4 weeks.
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
        @keyframes ripple {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        @keyframes wave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #14b8a6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #059669, #0d9488);
        }
      `}</style>
    </div>
  );
};

export default ProgressiveMuscleRelaxationDetail;