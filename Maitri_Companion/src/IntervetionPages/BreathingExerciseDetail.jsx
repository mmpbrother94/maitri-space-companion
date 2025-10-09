import React, { useState, useEffect, useRef } from "react";
import {
  Wind,
  Play,
  Pause,
  RotateCcw,
  Info,
  Timer,
  Target,
  Brain,
  Heart,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Volume2,
  VolumeX,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const BreathingExerciseDetail = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timer, setTimer] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Audio and interval refs
  const inhaleAudioRef = useRef(null);
  const exhaleAudioRef = useRef(null);
  const intervalRef = useRef(null);

  const phases = [
    {
      name: "Inhale",
      duration: 4,
      icon: "🌬️",
      color: "from-cyan-400 to-blue-500",
      sound: "inhale",
    },
    {
      name: "Hold",
      duration: 4,
      icon: "⏸️",
      color: "from-blue-400 to-purple-500",
      sound: null,
    },
    {
      name: "Exhale",
      duration: 4,
      icon: "💨",
      color: "from-purple-400 to-pink-500",
      sound: "exhale",
    },
    {
      name: "Hold",
      duration: 4,
      icon: "⏸️",
      color: "from-pink-400 to-rose-500",
      sound: null,
    },
  ];

  const instructions = [
    {
      step: 1,
      title: "Find Your Position",
      description:
        "Sit comfortably with your back straight and feet flat on the floor. Rest your hands on your lap.",
      icon: "🧘‍♀️",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      step: 2,
      title: "Inhale Deeply",
      description:
        "Breathe in slowly through your nose for 4 seconds. Feel your belly expand as you fill your lungs.",
      icon: "🌬️",
      gradient: "from-blue-500 to-purple-500",
    },
    {
      step: 3,
      title: "Hold Your Breath",
      description:
        "Hold the air in your lungs for 4 seconds. Stay relaxed and maintain your posture.",
      icon: "⏸️",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      step: 4,
      title: "Exhale Slowly",
      description:
        "Release the breath through your mouth for 4 seconds. Let all tension leave your body.",
      icon: "💨",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      step: 5,
      title: "Hold Again",
      description:
        "Keep your lungs empty for 4 seconds before starting the next cycle. Stay present.",
      icon: "⏹️",
      gradient: "from-rose-500 to-orange-500",
    },
    {
      step: 6,
      title: "Repeat & Relax",
      description:
        "Continue this pattern for 5-10 minutes. Notice how your body and mind become calmer.",
      icon: "🔄",
      gradient: "from-orange-500 to-amber-500",
    },
  ];

  const benefits = [
    {
      icon: Brain,
      title: "Reduces Stress",
      desc: "Lowers cortisol levels",
      color: "text-cyan-400",
    },
    {
      icon: Heart,
      title: "Calms Heart Rate",
      desc: "Regulates blood pressure",
      color: "text-purple-400",
    },
    {
      icon: Target,
      title: "Improves Focus",
      desc: "Enhances concentration",
      color: "text-pink-400",
    },
    {
      icon: Sparkles,
      title: "Boosts Energy",
      desc: "Increases oxygen flow",
      color: "text-amber-400",
    },
  ];

  // Stop all audio playback immediately
  const stopAllAudio = () => {
    if (inhaleAudioRef.current) {
      inhaleAudioRef.current.pause();
      inhaleAudioRef.current.currentTime = 0;
    }
    if (exhaleAudioRef.current) {
      exhaleAudioRef.current.pause();
      exhaleAudioRef.current.currentTime = 0;
    }
  };

  const playSound = (type) => {
    if (isMuted || !type) return;

    const audio = type === "inhale" ? inhaleAudioRef.current : exhaleAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.warn("Audio play failed:", e));
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopAllAudio();
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev >= phases[currentPhase].duration) {
            const nextPhaseIndex = (currentPhase + 1) % phases.length;
            const nextPhase = phases[nextPhaseIndex];

            if (nextPhase.sound) {
              playSound(nextPhase.sound);
            }

            setCurrentPhase(nextPhaseIndex);
            if (nextPhaseIndex === 0) {
              setBreathCount((c) => c + 1);
            }
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentPhase, isMuted]);

  const handleStart = () => {
    if (isPlaying) {
      // Pausing: stop audio immediately
      stopAllAudio();
    } else {
      // Starting: play initial inhale if not muted
      if (!isMuted) {
        playSound("inhale");
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentPhase(0);
    setTimer(0);
    setBreathCount(0);
    stopAllAudio(); // Ensure audio stops
  };

  const currentPhaseData = phases[currentPhase];
  const progress = (timer / currentPhaseData.duration) * 100;

  return (
    <div className="w-full bg-gradient-to-br from-slate-950 via-cyan-800 to-slate-950 relative overflow-hidden">
      {/* Hidden audio elements — both use the same file */}
      <audio ref={inhaleAudioRef} src="/muscle_relaxation.mp3" preload="auto" />
      <audio ref={exhaleAudioRef} src="/muscle_relaxation.mp3" preload="auto" />

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-[float_8s_ease-in-out_infinite]"></div>
        <div
          className="absolute top-1/2 -right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-[float_10s_ease-in-out_infinite]"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-[float_12s_ease-in-out_infinite]"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <NavLink
          to={'/dashboard/interventions'}
          className="flex items-center gap-2 mb-6 text-slate-300 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Interventions</span>
        </NavLink>

        {/* Header */}
        <div className="text-center mb-8 animate-[fadeIn_0.8s_ease-out]">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-cyan-500/50 animate-[float_3s_ease-in-out_infinite]">
              <Wind className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
            Box Breathing
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            A powerful technique used by Navy SEALs to stay calm under pressure
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <span className="px-4 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-semibold border border-cyan-500/30">
              5 min
            </span>
            <span className="px-4 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold border border-purple-500/30">
              Beginner
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Breathing Circle */}
          <div className="space-y-6">
            {/* Main Breathing Circle */}
            <div className="bg-slate-800 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-[fadeInLeft_0.8s_ease-out]">
              <div className="flex flex-col items-center">
                {/* Animated Circle */}
                <div className="relative w-80 h-80 mb-6">
                  <svg
                    className="absolute inset-0 -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 45 * (1 - progress / 100)
                      }`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${
                      isPlaying ? "scale-100" : "scale-95"
                    }`}
                  >
                    <div className="text-7xl mb-4 animate-[pulse_2s_ease-in-out_infinite]">
                      {currentPhaseData.icon}
                    </div>
                    <div
                      className={`text-3xl font-bold bg-gradient-to-r ${currentPhaseData.color} bg-clip-text text-transparent`}
                    >
                      {currentPhaseData.name}
                    </div>
                    <div className="text-6xl font-bold text-white mt-2">
                      {currentPhaseData.duration - timer}
                    </div>
                    <div className="text-slate-400 text-sm mt-2">seconds</div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={handleStart}
                    className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-semibold text-white shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center gap-2">
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                      {isPlaying ? "Pause" : "Start"}
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
                <div className="flex gap-6 text-center">
                  <div className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
                    <div className="text-2xl font-bold text-cyan-400">
                      {breathCount}
                    </div>
                    <div className="text-xs text-slate-400">Cycles</div>
                  </div>
                  <div className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                    <div className="text-2xl font-bold text-purple-400">
                      {Math.floor((breathCount * 16 + timer) / 60)}
                    </div>
                    <div className="text-xs text-slate-400">Minutes</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-slate-800 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl animate-[fadeInLeft_1s_ease-out]">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-400" />
                Key Benefits
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105 group"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <benefit.icon
                      className={`w-8 h-8 ${benefit.color} mb-2 group-hover:scale-110 transition-transform`}
                    />
                    <div className="text-white font-semibold text-sm">
                      {benefit.title}
                    </div>
                    <div className="text-slate-400 text-xs">{benefit.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Instructions */}
          <div className="space-y-6">
            <div className="bg-slate-800 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl animate-[fadeInRight_0.8s_ease-out]">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Info className="w-6 h-6 text-cyan-400" />
                Step-by-Step Guide
              </h3>

              <div className="space-y-4">
                {instructions.map((instruction, idx) => (
                  <div
                    key={idx}
                    className="group relative bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 rounded-2xl p-5 border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer animate-[fadeInRight_0.8s_ease-out]"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex gap-4">
                      <div
                        className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${instruction.gradient} rounded-xl flex items-center justify-center shadow-lg text-2xl group-hover:scale-110 transition-transform`}
                      >
                        {instruction.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-bold bg-gradient-to-r ${instruction.gradient} bg-clip-text text-transparent`}
                          >
                            STEP {instruction.step}
                          </span>
                        </div>
                        <h4 className="text-white font-bold text-lg mb-1">
                          {instruction.title}
                        </h4>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {instruction.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl rounded-3xl p-6 border border-amber-500/30 shadow-2xl animate-[fadeInRight_1s_ease-out]">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Timer className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-amber-300 font-bold text-lg mb-2">
                    💡 Pro Tip
                  </h4>
                  <p className="text-amber-100 text-sm leading-relaxed">
                    Practice this technique for 5 minutes daily. Studies show
                    that consistent box breathing can reduce stress by 40% and
                    improve focus by 25% within just 2 weeks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
      `}</style>
    </div>
  );
};

export default BreathingExerciseDetail;