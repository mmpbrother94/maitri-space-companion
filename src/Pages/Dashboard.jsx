import { Camera, FileText, Heart, Home, LayoutGrid } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import Starfield from "../utils/Starfield";

export default function Dashboard() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "maitri",
      text: "👋 Namaste, Commander. I can chat, track vitals, and suggest interventions.",
    },
  ]);

  const loc=useLocation().pathname
  console.log('location---->',loc)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [input, setInput] = useState("");
  const [isActive, setIsActive] = useState(loc);
  useEffect(() => {
    console.log("is Active-->", isActive);
    setIsActive(loc)
  }, [loc]);

  const logRef = useRef(null);
  const navItems = [
    { to: "/", label: "Home", icon: <Home className="w-5 h-5 mr-1" /> },
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: <LayoutGrid className="w-5 h-5 mr-1" />,
    },
    {
      to: "/dashboard/emotions",
      label: "Detection",
      icon: <Camera className="w-5 h-5 mr-1" />,
    },
    {
      to: "/dashboard/interventions",
      label: "Interventions",
      icon: <Heart className="w-5 h-5 mr-1" />,
    },
    {
      to: "/dashboard/reports",
      label: "Reports",
      icon: <FileText className="w-5 h-5 mr-1" />,
    },
  ];

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, chatOpen]);

  function replyTo(t) {
    const text = t.toLowerCase();
    if (text.includes("stress"))
      return "Breathing 5 min + Mindfulness 10 min are recommended. Start session?";
    if (text.includes("family") || text.includes("home"))
      return "I'm here with you. Want me to play a family-style message and soft music?";
    if (text.includes("sleep"))
      return "Target 7–8h sleep. I can dim UI and queue a soundscape.";
    return "Logged. I can also open Interventions or start an Emotion Scan.";
  }

  function sendMessage(msg) {
    if (!msg) return;
    setMessages((m) => [...m, { from: "you", text: msg }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { from: "maitri", text: replyTo(msg) }]);
    }, 700);
  }

  const chips = ["I'm stressed", "I miss my family", "I can't sleep"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 relative overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; box-shadow: 0 0 20px rgba(56, 189, 248, 0.3); }
          50% { opacity: 1; box-shadow: 0 0 40px rgba(56, 189, 248, 0.6); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes typing-dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60%, 100% { content: '...'; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-slide-in { animation: slide-in 0.4s ease-out; }
        .animate-slide-up { animation: slide-up 0.5s ease-out; }
        
        .gradient-text {
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glass-nav {
          background: linear-gradient(145deg, rgba(15,23,42,0.8), rgba(30,41,59,0.8));
          backdrop-filter: blur(16px);
          border: 1px solid rgba(56,189,248,0.2);
        }
        
        .glass-chat {
          background: linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(56,189,248,0.3);
        }
        
        .nav-link {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #38bdf8, #0ea5e9);
          transition: width 0.3s ease;
        }
        
        .nav-link:hover::after,
        .nav-link-active::after {
          width: 100%;
        }
        
        .chat-message {
          animation: slide-up 0.3s ease-out;
        }
        
        .shimmer-bg {
          background: linear-gradient(
            90deg,
            rgba(15,23,42,0) 0%,
            rgba(56,189,248,0.15) 50%,
            rgba(15,23,42,0) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite linear;
        }
        
        .floating-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          animation: float 8s ease-in-out infinite;
        }
        
        .glow-button {
          position: relative;
          overflow: hidden;
        }
        
        .glow-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        .glow-button:hover::before {
          width: 300px;
          height: 300px;
        }
      `}</style>
      
     <Starfield 
        density={1.5} 
        speed={1.0} 
        color="#38bdf8" 
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Animated Background Orbs */}
      {/* <div
        className="floating-orb w-96 h-96 bg-cyan-500 -top-20 -right-20"
        style={{ animationDelay: "0s" }}
      ></div>
      <div
        className="floating-orb w-80 h-80 bg-blue-500 bottom-0 -left-20"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="floating-orb w-64 h-64 bg-sky-500 top-1/3 right-1/3"
        style={{ animationDelay: "4s" }}
      ></div> */}

      {/* Navigation */}
      <nav className="p-3 px-8 z-20 w-full border-b border-white/10 backdrop-blur-md">
        <style>
          {`
          @keyframes float {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-8px);}
          }
          .animate-float { animation: float 4s ease-in-out infinite;}
        `}
        </style>
        <div className="flex items-center  justify-between max-w-7xl mx-auto">
          {/* Logo block */}
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-sky-400 to-blue-700 shadow-[0_0_22px_8px_rgba(0,191,255,0.4)] animate-float">
              <span className="text-white text-2xl">🧠</span>
            </div>
            <div>
              <span className="font-extrabold text-xl text-cyan-200">
                MAITRI
              </span>
              <div className="text-xs text-cyan-400 mt-0.5 tracking-wide">
                ONLINE
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8 font-medium text-base">
            {navItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => {
                  setIsActive(to);
                }}
                className={
                  isActive?.endsWith(to)
                    ? "flex items-center px-6 py-2 rounded-xl bg-gradient-to-br from-blue-500 via-sky-400 to-cyan-400 text-white font-semibold shadow-lg shadow-cyan-500/40"
                    : "flex items-center px-6 py-2 rounded-xl text-cyan-200 hover:text-white transition"
                }
                end={to === "/"}
              >
                {icon}
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className=" relative z-10">
        {/* This is where nested routes would render */}
        <Outlet context={{chatOpen, setChatOpen}} />
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setChatOpen((o) => !o)}
        aria-label="Open MAITRI Companion"
        className="fixed right-14 bottom-14 z-50  w-32 h-32 rounded-full flex items-center justify-center text-2xl shadow-2xl  hover:scale-110 cursor-pointer"
      >
        <img src="/discord-clyde-bot.gif" alt="" />
      </button>

      {/* Chat Panel */}
      {chatOpen && (
        <div className=" fixed right-8 bottom-4 z-50">
          <img
            src="/pom-bot-creatives.gif"
            alt=""
            className="absolute -z-20 -top-36 right-48  animate-slide-in"
          />
          <div className=" z-50 w-96 max-h-[75vh] glass-chat rounded-2xl p-5 shadow-2xl flex flex-col animate-slide-in">
            {/* Chat Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="text-2xl animate-float">🫶</div>
                <div>
                  <strong className="gradient-text text-lg">
                    MAITRI Companion
                  </strong>
                  <div className="text-xs text-emerald-400 flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    Online
                  </div>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-slate-400 hover:text-white text-2xl transition-colors hover:rotate-90 duration-300 cursor-pointer"
              >
                ✖
              </button>
            </div>

            {/* Messages */}
            <div
              ref={logRef}
              className="overflow-auto flex-1 text-sm space-y-3 mb-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`chat-message flex ${
                    m.from === "you" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                      m.from === "you"
                        ? "bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-lg"
                        : "glass-nav text-slate-100 border border-slate-700/50"
                    }`}
                  >
                    <div className="text-xs opacity-70 mb-1 font-semibold">
                      {m.from === "you" ? "You" : "MAITRI"}
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: m.text }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Reply Chips */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {chips.map((c) => (
                <button
                  key={c}
                  onClick={() => sendMessage(c)}
                  className="glass-nav px-3 py-1.5 rounded-full text-xs font-semibold text-cyan-400 hover:bg-slate-700/50 transition-all duration-300 border border-cyan-500/30 hover:border-cyan-500/60 hover:scale-105"
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage(input);
                }}
                className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 transition-colors"
                placeholder="Type a message…"
              />
              <button
                onClick={() => sendMessage(input)}
                className="glow-button bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 px-5 py-3 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105  cursor-pointer"
              >
                <span className="relative z-10">Send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
