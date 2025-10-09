import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Info,
  Timer,
  Cloud,
  Waves,
  Mountain,
  Sunrise,
  ChevronRight,
  Volume2,
  VolumeX,
  Eye,
  Compass,
  ArrowLeft,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const GuidedImageryDetail = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [timer, setTimer] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [floatDirection, setFloatDirection] = useState(1);

  const imageryScenes = [
    {
      name: "Opening the Door",
      duration: 60,
      icon: "🚪",
      color: "from-pink-400 to-rose-500",
      description: "Step into your peaceful sanctuary",
      visualization: "Imagine opening a door to tranquility",
    },
    {
      name: "Peaceful Beach",
      duration: 90,
      icon: "🏖️",
      color: "from-rose-400 to-red-500",
      description: "Warm sand beneath your feet",
      visualization: "Feel the ocean breeze on your skin",
    },
    {
      name: "Serene Forest",
      duration: 90,
      icon: "🌲",
      color: "from-red-400 to-orange-500",
      description: "Surrounded by ancient trees",
      visualization: "Hear leaves rustling in the wind",
    },
    {
      name: "Mountain Peak",
      duration: 60,
      icon: "⛰️",
      color: "from-orange-400 to-amber-500",
      description: "Standing above the clouds",
      visualization: "Breathe the crisp mountain air",
    },
    {
      name: "Flowing River",
      duration: 60,
      icon: "🌊",
      color: "from-amber-400 to-yellow-500",
      description: "Crystal clear water flowing",
      visualization: "Watch worries float downstream",
    },
    {
      name: "Starlit Sky",
      duration: 60,
      icon: "🌌",
      color: "from-yellow-400 to-green-500",
      description: "Infinite cosmos above",
      visualization: "Feel connected to the universe",
    },
    {
      name: "Garden Paradise",
      duration: 60,
      icon: "🌺",
      color: "from-green-400 to-teal-500",
      description: "Vibrant flowers blooming",
      visualization: "Smell the sweet fragrance",
    },
    {
      name: "Returning Home",
      duration: 60,
      icon: "🏡",
      color: "from-teal-400 to-cyan-500",
      description: "Bringing peace back with you",
      visualization: "Carry this calm into your day",
    },
  ];

  const instructions = [
    {
      step: 1,
      title: "Create Your Sacred Space",
      description:
        "Find a comfortable position in a quiet room. Dim the lights and eliminate distractions. This is your time.",
      icon: "🕯️",
      gradient: "from-pink-500 to-rose-500",
      technique: "Environment",
    },
    {
      step: 2,
      title: "Close Your Eyes Gently",
      description:
        "Let your eyelids grow heavy and close naturally. Relax the muscles around your eyes and feel tension melting away.",
      icon: "👁️",
      gradient: "from-rose-500 to-red-500",
      technique: "Preparation",
    },
    {
      step: 3,
      title: "Deepen Your Breathing",
      description:
        "Take three slow, deep breaths. With each exhale, feel yourself sinking deeper into relaxation and readiness.",
      icon: "🌬️",
      gradient: "from-red-500 to-orange-500",
      technique: "Breath Work",
    },
    {
      step: 4,
      title: "Set Your Intention",
      description:
        "Choose what you want to experience—peace, healing, confidence, or clarity. Hold this intention gently.",
      icon: "💫",
      gradient: "from-orange-500 to-amber-500",
      technique: "Focus",
    },
    {
      step: 5,
      title: "Build The Scene",
      description:
        "Start with one detail—a color, a sound, or a sensation. Gradually add more details until the scene feels real.",
      icon: "🎨",
      gradient: "from-amber-500 to-yellow-500",
      technique: "Visualization",
    },
    {
      step: 6,
      title: "Engage All Your Senses",
      description:
        "What do you see? Hear? Smell? Feel? Taste? The more senses you involve, the more powerful the experience.",
      icon: "👂",
      gradient: "from-yellow-500 to-green-500",
      technique: "Immersion",
    },
    {
      step: 7,
      title: "Move Through Your Scene",
      description:
        "Walk, float, or fly through your imagined space. Explore freely. Notice how your body feels in this place.",
      icon: "🦋",
      gradient: "from-green-500 to-teal-500",
      technique: "Exploration",
    },
    {
      step: 8,
      title: "Encounter Healing Elements",
      description:
        "Find a healing light, soothing water, or nurturing presence. Allow it to wash over you, bringing peace and renewal.",
      icon: "✨",
      gradient: "from-teal-500 to-cyan-500",
      technique: "Healing",
    },
    {
      step: 9,
      title: "Absorb The Experience",
      description:
        "Spend time simply being in this peaceful state. Let the positive feelings permeate every cell of your body.",
      icon: "🌟",
      gradient: "from-cyan-500 to-blue-500",
      technique: "Integration",
    },
    {
      step: 10,
      title: "Return With Gratitude",
      description:
        "When ready, take three deep breaths. Wiggle your fingers and toes. Open your eyes slowly, carrying the peace with you.",
      icon: "🙏",
      gradient: "from-blue-500 to-indigo-500",
      technique: "Closure",
    },
  ];

  const benefits = [
    {
      icon: Cloud,
      title: "Reduces Stress",
      desc: "Lowers cortisol levels",
      color: "text-pink-400",
    },
    {
      icon: Waves,
      title: "Lowers BP",
      desc: "Improves heart health",
      color: "text-rose-400",
    },
    {
      icon: Mountain,
      title: "Manages Pain",
      desc: "Natural pain relief",
      color: "text-red-400",
    },
    {
      icon: Sunrise,
      title: "Reduces Anxiety",
      desc: "Calms nervous system",
      color: "text-orange-400",
    },
  ];

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev >= imageryScenes[currentScene].duration) {
            setCurrentScene((p) => {
              const next = (p + 1) % imageryScenes.length;
              if (next === 0) setSessionCount((c) => c + 1);
              return next;
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentScene]);

  useEffect(() => {
    if (isPlaying) {
      const directionTimer = setInterval(() => {
        setFloatDirection((prev) => prev * -1);
      }, 3000);
      return () => clearInterval(directionTimer);
    }
  }, [isPlaying]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentScene(0);
    setTimer(0);
    setSessionCount(0);
  };

  const currentItem = imageryScenes[currentScene];
  const progress = (timer / currentItem.duration) * 100;
  const totalTime = imageryScenes.reduce((acc, item) => acc + item.duration, 0);
  const elapsedTotal =
    imageryScenes
      .slice(0, currentScene)
      .reduce((acc, item) => acc + item.duration, 0) + timer;
  const overallProgress = (elapsedTotal / totalTime) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-950 via-rose-950 to-red-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-[float_8s_ease-in-out_infinite]"></div>
        <div
          className="absolute top-1/2 -right-20 w-96 h-96 bg-rose-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-[float_10s_ease-in-out_infinite]"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/3 w-96 h-96 bg-red-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-[float_12s_ease-in-out_infinite]"
          style={{ animationDelay: "4s" }}
        ></div>

        {/* Floating pages/books */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl opacity-10 animate-[floatPages_15s_ease-in-out_infinite]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          >
            📖
          </div>
        ))}

        {/* Dreamy clouds */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`cloud-${i}`}
            className="absolute text-5xl opacity-5 animate-[drift_20s_linear_infinite]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          >
            ☁️
          </div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <NavLink
          to={"/dashboard/interventions"}
          className="flex items-center gap-2 mb-6 text-slate-300 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Interventions</span>
        </NavLink>
        {/* Header */}
        <div className="text-center mb-8 animate-[fadeIn_0.8s_ease-out]">
          <div className="inline-block mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full blur-2xl opacity-50 animate-[pulse_3s_ease-in-out_infinite]"></div>
            <div
              className={`relative w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center shadow-2xl shadow-pink-500/50 transition-transform duration-1000 ${
                floatDirection > 0 ? "translate-y-0" : "-translate-y-2"
              }`}
            >
              <span className="text-5xl animate-[pageTurn_4s_ease-in-out_infinite]">
                📔
              </span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-red-400">
            Guided Imagery
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-4 italic">
            Mental visualization for relaxation and focus
          </p>
          <div className="flex justify-center gap-3">
            <span className="px-4 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm font-semibold border border-pink-500/30 animate-[pulse_2s_ease-in-out_infinite]">
              Relaxation
            </span>
            <span className="px-4 py-1 bg-rose-500/20 text-rose-300 rounded-full text-sm font-semibold border border-rose-500/30">
              8 min
            </span>
            <span className="px-4 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-semibold border border-red-500/30">
              90% Complete
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Scene Display */}
          <div className="space-y-6">
            {/* Main Imagery Display */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-[fadeInLeft_0.8s_ease-out] relative overflow-hidden">
              {/* Swirling gradient effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${currentItem.color} opacity-10 blur-2xl animate-[swirl_8s_ease-in-out_infinite]`}
              ></div>

              <div className="relative flex flex-col items-center">
                {/* Visualization Circle */}
                <div className="relative w-80 h-80 mb-6">
                  {/* Orbiting elements */}
                  <div className="absolute inset-0 animate-[spin_30s_linear_infinite]">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-rose-500 opacity-40"
                        style={{
                          transform: `rotate(${i * 45}deg) translateY(-140px)`,
                          transformOrigin: "center",
                        }}
                      />
                    ))}
                  </div>

                  {/* Inner glow rings */}
                  <div
                    className={`absolute inset-8 rounded-full bg-gradient-to-br ${currentItem.color} opacity-20 blur-xl animate-[breathe_4s_ease-in-out_infinite]`}
                  ></div>
                  <div
                    className={`absolute inset-16 rounded-full bg-gradient-to-br ${currentItem.color} opacity-30 blur-lg animate-[breathe_4s_ease-in-out_infinite]`}
                    style={{ animationDelay: "0.5s" }}
                  ></div>

                  {/* Progress Ring */}
                  <svg
                    className="absolute inset-0 -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="url(#imageryGradient)"
                      strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 42 * (1 - progress / 100)
                      }`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 drop-shadow-lg"
                    />
                    <defs>
                      <linearGradient
                        id="imageryGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="50%" stopColor="#f43f5e" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
                    <div
                      className={`text-7xl mb-4 transition-all duration-1000 ${
                        isPlaying
                          ? "animate-[gentleFloat_6s_ease-in-out_infinite]"
                          : ""
                      }`}
                    >
                      {currentItem.icon}
                    </div>
                    <div className="text-center transition-all duration-700">
                      <div
                        className={`text-2xl font-bold text-white mb-2 leading-tight bg-gradient-to-r ${currentItem.color} bg-clip-text text-transparent`}
                      >
                        {currentItem.name}
                      </div>
                      <p className="text-sm text-slate-300 mb-1 italic">
                        {currentItem.description}
                      </p>
                      <p className="text-xs text-pink-300 mb-3">
                        {currentItem.visualization}
                      </p>
                      <div className="text-4xl font-bold text-white">
                        {formatTime(currentItem.duration - timer)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scene Progress Indicators */}
                <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-md">
                  {imageryScenes.map((scene, idx) => (
                    <div
                      key={idx}
                      className={`transition-all duration-500 ${
                        idx === currentScene
                          ? `w-3 h-3 rounded-full bg-gradient-to-r ${scene.color} shadow-lg animate-[pulse_1.5s_ease-in-out_infinite]`
                          : idx < currentScene
                          ? "w-2 h-2 rounded-full bg-white/40"
                          : "w-2 h-2 rounded-full bg-white/10"
                      }`}
                      title={scene.name}
                    />
                  ))}
                </div>

                {/* Controls */}
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="group relative px-10 py-4 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl font-semibold text-white shadow-lg shadow-pink-500/50 hover:shadow-xl hover:shadow-pink-500/70 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center gap-3">
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                      {isPlaying ? "Pause Journey" : "Begin Journey"}
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
                  <div className="text-center px-4 py-3 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-xl border border-pink-500/30">
                    <div className="text-2xl font-bold text-pink-400">
                      {sessionCount}
                    </div>
                    <div className="text-xs text-slate-400">Journeys</div>
                  </div>
                  <div className="text-center px-4 py-3 bg-gradient-to-r from-rose-500/20 to-red-500/20 rounded-xl border border-rose-500/30">
                    <div className="text-2xl font-bold text-rose-400">
                      {currentScene + 1}/{imageryScenes.length}
                    </div>
                    <div className="text-xs text-slate-400">Scene</div>
                  </div>
                  <div className="text-center px-4 py-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl border border-red-500/30">
                    <div className="text-2xl font-bold text-red-400">
                      {Math.round(overallProgress)}%
                    </div>
                    <div className="text-xs text-slate-400">Progress</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl animate-[fadeInLeft_1s_ease-out]">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-pink-400" />
                Medical Benefits
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105 group cursor-pointer"
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
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl animate-[fadeInRight_0.8s_ease-out] max-h-[800px] overflow-y-auto custom-scrollbar">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 sticky bg-white/5 backdrop-blur-xl pb-4 z-10">
                <Compass className="w-6 h-6 text-pink-400" />
                Visualization Guide
              </h3>

              <div className="space-y-3">
                {instructions.map((instruction, idx) => (
                  <div
                    key={idx}
                    className="group relative bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 rounded-2xl p-4 border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer animate-[fadeInRight_0.8s_ease-out]"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex gap-4">
                      <div
                        className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${instruction.gradient} rounded-xl flex items-center justify-center shadow-lg text-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                      >
                        {instruction.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-bold bg-gradient-to-r ${instruction.gradient} bg-clip-text text-transparent`}
                          >
                            {instruction.technique.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-white font-bold text-base mb-1">
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

            {/* Did You Know */}
            <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-xl rounded-3xl p-6 border border-pink-500/30 shadow-2xl animate-[fadeInRight_1s_ease-out] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full blur-3xl opacity-20 animate-[pulse_3s_ease-in-out_infinite]"></div>
              <div className="relative flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-pink-300 font-bold text-lg mb-2 flex items-center gap-2">
                    💡 Did You Know?
                  </h4>
                  <p className="text-pink-100 text-sm leading-relaxed">
                    Guided imagery helps lower blood pressure, reduce pain, and
                    manage anxiety, validated by multiple medical studies.
                    Research shows that regular practice can decrease surgical
                    recovery time by 40%, reduce chronic pain by 30%, and
                    improve immune function significantly within just 4 weeks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
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
        @keyframes floatPages {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.1; }
          25% { transform: translateY(-30px) translateX(20px) rotate(10deg); opacity: 0.15; }
          50% { transform: translateY(-60px) translateX(-20px) rotate(-10deg); opacity: 0.1; }
          75% { transform: translateY(-30px) translateX(20px) rotate(5deg); opacity: 0.15; }
        }
        @keyframes drift {
          0% { transform: translateX(-10%); }
          100% { transform: translateX(110%); }
        }
        @keyframes pageTurn {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(180deg); }
        }
        @keyframes swirl {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.05); opacity: 0.5; }
        }
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ec4899, #f43f5e);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #db2777, #e11d48);
        }
      `}</style>
    </div>
  );
};

export default GuidedImageryDetail;
