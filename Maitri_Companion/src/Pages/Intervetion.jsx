import React, { useRef, useEffect, useState } from "react";
import { NavLink, useOutletContext } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// Main page programs
const mainPrograms = [
  {
    icon: "➡️",
    title: "Breathing Exercise",
    desc: "Guided deep breathing to reduce stress and anxiety",
    ref: "/dashboard/interventions/breathing",
    tag: "Stress Relief",
    tagColor: "text-cyan-300",
    barColor: "from-cyan-400 via-blue-400 to-blue-500",
    percent: 92,
    time: "5 min",
    key: "breathing",
    iconBg: "from-cyan-500 to-blue-500",
  },
  {
    icon: "⚛️",
    title: "Mindfulness Meditation",
    desc: "Focus on present moment awareness and mental clarity",
    ref: "/dashboard/interventions/mindfullness",
    tag: "Mental Health",
    tagColor: "text-indigo-300",
    barColor: "from-indigo-400 via-purple-400 to-purple-500",
    percent: 88,
    time: "10 min",
    key: "mindfulness",
    iconBg: "from-indigo-500 to-purple-500",
  },
  {
    icon: "💚",
    title: "Progressive Muscle Relaxation",
    desc: "Systematic tension & release of muscle groups",
    ref: "/dashboard/interventions/progressmuscle",
    tag: "Physical Wellness",
    tagColor: "text-emerald-300",
    barColor: "from-emerald-400 via-green-400 to-green-500",
    percent: 85,
    time: "15 min",
    key: "pmr",
    iconBg: "from-emerald-500 to-green-500",
  },
  {
    icon: "☺️",
    title: "Positive Affirmations",
    desc: "Boost confidence and maintain positive mindset",
    ref: "/dashboard/interventions/positiveaffirmation",
    tag: "Motivation",
    tagColor: "text-amber-300",
    barColor: "from-amber-400 via-orange-400 to-orange-500",
    percent: 78,
    time: "3 min",
    key: "affirmations",
    iconBg: "from-amber-500 to-orange-500",
  },
  {
    icon: "📔",
    title: "Guided Imagery",
    desc: "Mental visualization for relaxation and focus",
    ref: "/dashboard/interventions/guideimagery",
    tag: "Relaxation",
    tagColor: "text-pink-300",
    barColor: "from-pink-400 via-rose-400 to-rose-500",
    percent: 90,
    time: "8 min",
    key: "imagery",
    iconBg: "from-pink-500 to-rose-500",
  },
  {
    icon: "💬",
    title: "Supportive Conversation",
    desc: "AI-guided empathetic dialogue and emotional support",
    ref: "/dashboard/interventions",
    tag: "Emotional Support",
    tagColor: "text-violet-300",
    barColor: "from-violet-400 via-purple-400 to-purple-500",
    percent: 94,
    time: "15 min",
    key: "conversation",
    iconBg: "from-violet-500 to-purple-500",
  },
];

// Different programs for the modal details
const detailedPrograms = [
  {
    icon: "🌌",
    title: "Cosmic Visualization",
    desc: "Space-themed guided imagery for deep relaxation and cosmic connection",
    tag: "Deep Relaxation",
    tagColor: "text-purple-300",
    barColor: "from-purple-400 via-indigo-400 to-blue-500",
    percent: 96,
    time: "12 min",
    iconBg: "from-purple-500 to-blue-600",
  },
  {
    icon: "🧘",
    title: "Zero-G Yoga",
    desc: "Adapted yoga poses for microgravity environments to maintain flexibility",
    tag: "Physical Health",
    tagColor: "text-green-300",
    barColor: "from-green-400 via-emerald-400 to-teal-500",
    percent: 89,
    time: "20 min",
    iconBg: "from-green-500 to-teal-600",
  },
  {
    icon: "🎵",
    title: "Therapeutic Sound Bath",
    desc: "Healing frequencies and space ambient sounds for mental restoration",
    tag: "Sensory Therapy",
    tagColor: "text-blue-300",
    barColor: "from-blue-400 via-cyan-400 to-teal-500",
    percent: 93,
    time: "18 min",
    iconBg: "from-blue-500 to-teal-600",
  },
  {
    icon: "📚",
    title: "Astronaut Journaling",
    desc: "Structured reflective writing to process experiences and emotions",
    tag: "Emotional Processing",
    tagColor: "text-amber-300",
    barColor: "from-amber-400 via-orange-400 to-red-500",
    percent: 87,
    time: "10 min",
    iconBg: "from-amber-500 to-red-600",
  },
  {
    icon: "🤝",
    title: "Crew Bonding Exercises",
    desc: "Interactive activities to strengthen team cohesion and communication",
    tag: "Team Building",
    tagColor: "text-pink-300",
    barColor: "from-pink-400 via-rose-400 to-fuchsia-500",
    percent: 91,
    time: "25 min",
    iconBg: "from-pink-500 to-fuchsia-600",
  },
  {
    icon: "🎯",
    title: "Mission Focus Training",
    desc: "Concentration exercises to enhance task performance and attention",
    tag: "Cognitive Enhancement",
    tagColor: "text-indigo-300",
    barColor: "from-indigo-400 via-purple-400 to-violet-500",
    percent: 95,
    time: "15 min",
    iconBg: "from-indigo-500 to-violet-600",
  },
];

// Generate 24 session records using main programs
const generateSessionData = () => {
  const sessions = [];
  const programNames = mainPrograms.map((p) => p.title);
  const baseDate = new Date();

  for (let i = 0; i < 24; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    const formattedDate = date.toISOString().split("T")[0];
    const randomProgram =
      programNames[Math.floor(Math.random() * programNames.length)];
    const program = mainPrograms.find((p) => p.title === randomProgram);

    sessions.push({
      id: i + 1,
      date: formattedDate,
      program: randomProgram,
      duration: program?.time || "10 min",
      effectiveness: program?.percent ? `${program.percent}%` : "85%",
      progress: program?.percent || 85,
    });
  }

  return sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Effectiveness chart data using main programs
const effectivenessData = [
  { program: "Breathing Exercise", effectiveness: 92 },
  { program: "Mindfulness Meditation", effectiveness: 88 },
  { program: "Progressive Muscle Relaxation", effectiveness: 85 },
  { program: "Positive Affirmations", effectiveness: 78 },
  { program: "Guided Imagery", effectiveness: 90 },
  { program: "Supportive Conversation", effectiveness: 94 },
];

const KPIModal = ({ kpiData, onClose }) => {
  const sessionData = generateSessionData();

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Render different content based on KPI type
  const renderContent = () => {
    switch (kpiData.label) {
      case "Sessions Completed":
        return (
          <div
            className="space-y-6"
            style={{
              scrollBehavior: "auto", //
              willChange: "scroll-position",
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
            }}
          >
            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-pink-600/20 to-rose-600/20 p-4 rounded-xl border border-pink-500/30">
                <div className="text-pink-300 text-sm">Total Sessions</div>
                <div className="text-2xl font-bold text-white">24</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 p-4 rounded-xl border border-cyan-500/30">
                <div className="text-cyan-300 text-sm">This Week</div>
                <div className="text-2xl font-bold text-white">6</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 p-4 rounded-xl border border-emerald-500/30">
                <div className="text-emerald-300 text-sm">Avg Duration</div>
                <div className="text-2xl font-bold text-white">8.5 min</div>
              </div>
              <div className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 p-4 rounded-xl border border-violet-500/30">
                <div className="text-violet-300 text-sm">Completion Rate</div>
                <div className="text-2xl font-bold text-white">98%</div>
              </div>
            </div>

            {/* Sessions List */}
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700">
              <h4 className="text-lg font-semibold text-white mb-4">
                Recent Sessions
              </h4>
              <div
                className="space-y-3 max-h-96 overflow-y-auto"
                style={{
                  scrollBehavior: "auto", //
                  willChange: "scroll-position",
                  WebkitOverflowScrolling: "touch",
                  overscrollBehavior: "contain",
                }}
              >
                {sessionData.map((session) => (
                  <div
                    key={session.id}
                    className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-white">
                          {session.program}
                        </div>
                        <div className="text-sm text-slate-400">
                          {session.date}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-400">
                          {session.duration}
                        </div>
                        <div className="text-sm font-medium text-emerald-400">
                          {session.effectiveness}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${session.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "Avg Effectiveness":
        return (
          <div
            className="space-y-6"
            style={{
              scrollBehavior: "auto", //
              willChange: "scroll-position",
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
            }}
          >
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 p-6 rounded-xl border border-cyan-500/30 text-center">
                <div className="text-cyan-300 text-sm mb-2">Current Avg</div>
                <div className="text-4xl font-bold text-white">89%</div>
                <div className="text-sm text-emerald-400 mt-1">
                  ↑ +2% this week
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 p-6 rounded-xl border border-emerald-500/30 text-center">
                <div className="text-emerald-300 text-sm mb-2">
                  Best Program
                </div>
                <div className="text-xl font-bold text-white">
                  Supportive Conversation
                </div>
                <div className="text-2xl font-bold text-emerald-400">94%</div>
              </div>
              <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 p-6 rounded-xl border border-amber-500/30 text-center">
                <div className="text-amber-300 text-sm mb-2">Target</div>
                <div className="text-4xl font-bold text-white">90%</div>
                <div className="text-sm text-slate-400 mt-1">1% to target</div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700">
              <h4 className="text-lg font-semibold text-white mb-4">
                Program Effectiveness
              </h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={effectivenessData} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      horizontal={false}
                    />
                    <XAxis type="number" stroke="#9CA3AF" domain={[70, 100]} />
                    <YAxis
                      dataKey="program"
                      type="category"
                      stroke="#9CA3AF"
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        borderColor: "#374151",
                      }}
                      labelStyle={{ color: "#93C5FD" }}
                      formatter={(value) => [`${value}%`, "Effectiveness"]}
                    />
                    <Bar
                      dataKey="effectiveness"
                      fill="#60A5FA"
                      radius={[0, 4, 4, 0]}
                    >
                      {effectivenessData.map((entry, index) => (
                        <rect
                          key={`rect-${index}`}
                          fill={
                            mainPrograms
                              .find((p) => p.title === entry.program)
                              ?.barColor?.split(" ")[0] || "#60A5FA"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700">
              <h4 className="text-lg font-semibold text-white mb-4">
                Effectiveness Trends
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {effectivenessData.map((item, index) => {
                  const program = mainPrograms.find(
                    (p) => p.title === item.program
                  );
                  return (
                    <div
                      key={index}
                      className="bg-slate-900/50 p-4 rounded-lg border border-slate-700"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`bg-gradient-to-br ${program?.iconBg} p-2 rounded-lg`}
                        >
                          <span className="text-lg">{program?.icon}</span>
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {item.program}
                          </div>
                          <div className="text-sm text-slate-400">
                            {program?.tag}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-2xl font-bold text-white">
                          {item.effectiveness}%
                        </div>
                        <div className="w-24 bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${program?.barColor}`}
                            style={{ width: `${item.effectiveness}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "Available Programs":
        return (
          <div className="space-y-6">
            {/* Stats Summary */}
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              style={{
                scrollBehavior: "auto", //
                willChange: "scroll-position",
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
              }}
            >
              <div className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 p-4 rounded-xl border border-violet-500/30">
                <div className="text-violet-300 text-sm">Total Programs</div>
                <div className="text-2xl font-bold text-white">6</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 p-4 rounded-xl border border-indigo-500/30">
                <div className="text-indigo-300 text-sm">Categories</div>
                <div className="text-2xl font-bold text-white">4</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 p-4 rounded-xl border border-cyan-500/30">
                <div className="text-cyan-300 text-sm">Avg Duration</div>
                <div className="text-2xl font-bold text-white">16.5 min</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 p-4 rounded-xl border border-emerald-500/30">
                <div className="text-emerald-300 text-sm">
                  Avg Effectiveness
                </div>
                <div className="text-2xl font-bold text-white">92.2%</div>
              </div>
            </div>

            {/* Programs Grid - Using detailedPrograms instead of mainPrograms */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              style={{
                scrollBehavior: "auto", //
                willChange: "scroll-position",
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
              }}
            >
              {detailedPrograms.map((program, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl p-6 border border-slate-700 hover:border-purple-500/30 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`bg-gradient-to-br ${program.iconBg} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <span className="text-2xl">{program.icon}</span>
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg">
                        {program.title}
                      </div>
                      <div
                        className={`text-xs ${program.tagColor} font-semibold mt-1`}
                      >
                        {program.tag}
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm mb-4">{program.desc}</p>

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-400 text-sm">
                      Duration: {program.time}
                    </span>
                    <span className="text-slate-400 text-sm">
                      Effectiveness
                    </span>
                  </div>

                  <div className="w-full bg-slate-700/50 rounded-full h-2.5 mb-3">
                    <div
                      className={`h-2.5 rounded-full bg-gradient-to-r ${program.barColor} relative`}
                      style={{ width: `${program.percent}%` }}
                    >
                      <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">
                      {program.percent}%
                    </span>
                    <button className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs rounded-lg font-medium hover:from-purple-500 hover:to-indigo-500 transition-colors">
                      Start
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="text-2xl font-bold text-white mb-4">
              KPI Details
            </div>
            <div className="text-slate-400">No detailed data available</div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/90 p-6 border-b border-slate-700 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <div
              className={`bg-gradient-to-br ${kpiData.bg} p-3 rounded-xl shadow-lg w-16 h-16 flex items-center justify-center`}
            >
              <span className="text-3xl">{kpiData.icon}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{kpiData.label}</h2>
              <div className="text-slate-400 text-lg">
                Value: {kpiData.value}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-full hover:bg-slate-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          className="overflow-y-auto max-h-[calc(90vh-140px)] p-6"
          style={{ scrollBehavior: "smooth" }}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default function Intervention() {
  const [effectiveness, setEffectiveness] = useState(89);
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const [selectedKPI, setSelectedKPI] = useState(null);

  const { chatOpen, setChatOpen } = useOutletContext();
  useEffect(() => {
    if (chatOpen) console.log("Chat opened");
  }, [chatOpen]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const icons = [
    {
      icon: "💗",
      label: "Sessions Completed",
      value: 24,
      color: "text-pink-400",
      bg: "from-pink-500 to-rose-500",
    },
    {
      icon: "📈",
      label: "Avg Effectiveness",
      value: effectiveness + "%",
      color: "text-cyan-400",
      bg: "from-cyan-500 to-blue-500",
    },
    {
      icon: "🧠",
      label: "Available Programs",
      value: 6,
      color: "text-violet-400",
      bg: "from-violet-500 to-purple-500",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setEffectiveness(() =>
        Math.round(89 + Math.sin(Date.now() / 4000) * 1.0)
      );
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  function push(sender, text) {
    const log = logRef.current;
    if (!log) return;
    const d = document.createElement("div");
    d.style.margin = "8px 0";
    d.style.padding = "10px";
    d.style.background = sender.includes("MAITRI")
      ? "rgba(99,102,241,0.1)"
      : "rgba(139,92,246,0.1)";
    d.style.borderRadius = "12px";
    d.innerHTML = sender + ": " + text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }

  function typing() {
    const log = logRef.current;
    if (!log) return null;
    const n = document.createElement("div");
    n.id = "typing";
    n.style.opacity = ".7";
    n.style.fontStyle = "italic";
    n.innerHTML = "MAITRI is typing...";
    log.appendChild(n);
    log.scrollTop = log.scrollHeight;
    return n;
  }

  function reply(t) {
    t = (t || "").toLowerCase();
    if (t.includes("stress"))
      return "Breathing 5 min + Mindfulness 10 min are recommended. Start session?";
    if (t.includes("family") || t.includes("home"))
      return "I'm here with you. Want me to play a family-style message and soft music?";
    if (t.includes("sleep"))
      return "Target 7-8h sleep. I can dim UI and queue a soundscape.";
    return "Logged. I can also open Interventions or start an Emotion Scan.";
  }

  function sendNow() {
    const input = inputRef.current;
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;
    push("<strong>You</strong>", val);
    const tip = typing();
    setTimeout(() => {
      if (tip) tip.remove();
      push("<strong>MAITRI</strong>", reply(val));
    }, 700);
    input.value = "";
  }

  function handleChip(msg) {
    if (!inputRef.current) return;
    inputRef.current.value = msg;
    sendNow();
  }

  function handleInputKey(e) {
    if (e.key === "Enter") sendNow();
  }

  function showToast(msg) {
    const t = document.createElement("div");
    t.textContent = msg;
    Object.assign(t.style, {
      position: "fixed",
      left: "50%",
      bottom: "32px",
      transform: "translateX(-50%)",
      background:
        "linear-gradient(135deg, rgba(99,102,241,0.95), rgba(139,92,246,0.95))",
      padding: "14px 24px",
      borderRadius: "24px",
      color: "#fff",
      zIndex: 9999,
      fontSize: "15px",
      fontWeight: "600",
      boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
    });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1600);
  }

  const rows = [mainPrograms.slice(0, 3), mainPrograms.slice(3, 6)];

  return (
    <div className="min-h-screen text-white font-sans select-none">
      <style>{`
        @keyframes icon-float {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1);}
          25% { transform: translateY(-2px) rotate(2deg) scale(1.05);}
          50% { transform: translateY(-5px) rotate(-2deg) scale(1.08);}
          75% { transform: translateY(-2px) rotate(1deg) scale(1.05);}
        }
        .animate-icon-float {
          animation: icon-float 4s ease-in-out infinite;
        }
        @keyframes card-in {
          from { opacity:0; transform: translateY(40px) scale(.95);}
          to { opacity:1; transform: translateY(0) scale(1);}
        }
        .card-in {
          animation: card-in 0.7s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          transform: translateX(-100%);
        }
        .shimmer-effect:hover::before {
          animation: shimmer 1.5s ease-in-out;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }
          50% { box-shadow: 0 0 35px rgba(139, 92, 246, 0.8); }
        }
        .pulse-glow {
          animation: pulse-glow 2.5s ease-in-out infinite;
        }
        .progress-glow {
          position: relative;
        }
        .progress-glow::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 4px;
          height: 100%;
          background: rgba(255,255,255,0.9);
          border-radius: 2px;
          box-shadow: 0 0 10px rgba(255,255,255,0.8);
        }
      `}</style>

      {/* KPI Modal */}
      {selectedKPI && (
        <KPIModal kpiData={selectedKPI} onClose={() => setSelectedKPI(null)} />
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <section className="mb-10">
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Psychological Interventions
          </h1>
          <div className="flex items-center gap-3 text-cyan-300 text-base">
            <span className="animate-icon-float text-3xl">🧬</span>
            <span className="font-medium">
              Evidence-based techniques for emotional and physical well-being
            </span>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {icons.map(({ icon, label, value, color, bg }, idx) => (
            <div
              key={label}
              className="relative group card-in overflow-hidden cursor-pointer"
              style={{ animationDelay: `${0.05 * idx}s` }}
              onClick={() => setSelectedKPI({ icon, label, value, color, bg })}
            >
              <div
                className={`bg-gradient-to-br ${bg} backdrop-blur-sm rounded-2xl p-6 border border-white/5 hover:border-white/20 transition-all duration-500 hover:scale-105`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`text-4xl ${color}`}
                    style={{ animationDelay: `${0.2 * idx}s` }}
                  >
                    {icon}
                  </div>
                </div>
                <div className="text-sm text-slate-400 font-medium mb-1">
                  {label}
                </div>
                <div className="text-4xl font-black text-white">{value}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Program Cards - Using mainPrograms */}
        {rows.map((row, rIdx) => (
          <section className="grid md:grid-cols-3 gap-6 mb-6" key={rIdx}>
            {row.map((prog, i) => (
              <article
                className="relative group card-in shimmer-effect overflow-hidden"
                key={prog.key}
                style={{ animationDelay: `${0.08 * (i + rIdx * 3)}s` }}
              >
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 border border-slate-700/50 hover:border-slate-600 transition-all duration-500 hover:scale-[1.02]">
                  {/* Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`bg-gradient-to-br ${prog.iconBg} rounded-2xl p-4 shadow-lg`}
                    >
                      <span
                        className="text-3xl animate-icon-float block"
                        style={{ animationDelay: `${0.15 * (i + rIdx * 3)}s` }}
                      >
                        {prog.icon}
                      </span>
                    </div>
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">
                      {prog.time}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="font-bold mb-2 text-xl text-white">
                    {prog.title}
                  </h3>
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed min-h-[40px]">
                    {prog.desc}
                  </p>

                  {/* Tag */}
                  <div className="flex justify-between items-center mb-3">
                    <span
                      className={`text-xs ${prog.tagColor} font-bold uppercase tracking-wider`}
                    >
                      {prog.tag}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      Effectiveness
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative w-full bg-slate-700/30 h-2.5 rounded-full overflow-hidden mb-4 shadow-inner">
                    <div
                      className={`progress-glow h-full rounded-full bg-gradient-to-r ${prog.barColor} transition-all duration-1000`}
                      style={{ width: `${prog.percent}%` }}
                    ></div>
                  </div>

                  {/* Percentage */}
                  <div className="text-right mb-5">
                    <span className="text-2xl font-black text-white">
                      {prog.percent}%
                    </span>
                  </div>

                  {/* Button */}
                  <NavLink
                    to={prog.ref}
                    className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white px-5 py-3 rounded-2xl font-bold transition-all duration-300 border border-slate-600/50"
                    onClick={() => {
                      showToast("Starting " + prog.title + " session...");
                      if(prog.title === "Supportive Conversation") {
                        console.log("Opening chat for Supportive Conversation");
                        setTimeout(() => setChatOpen(true), 800);
                      }
                    }}
                    type="button"
                  >
                    Start Session
                  </NavLink>
                </div>
              </article>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
