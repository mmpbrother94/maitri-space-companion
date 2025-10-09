import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import Starfield from "../utils/Starfield";

// Simple chart component for performance
const MiniChart = ({ data, type = "line", color = "#38bdf8" }) => {
  if (!data || data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="w-full h-32 relative">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {type === "area" && (
          <polygon 
            points={`0,100 ${points} 100,100`} 
            fill={color} 
            fillOpacity="0.2" 
            stroke="none"
          />
        )}
        <polyline 
          points={points} 
          fill="none" 
          stroke={color} 
          strokeWidth="0.8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        {data.map((d, i) => (
          <circle 
            key={i} 
            cx={(i / (data.length - 1)) * 100} 
            cy={100 - ((d.value - minValue) / range) * 100} 
            r="1.2" 
            fill={color} 
          />
        ))}
      </svg>
    </div>
  );
};

// Radial progress component
const RadialProgress = ({ value, max = 100, color = "#38bdf8", size = 120 }) => {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value, max) / max;
  const strokeDashoffset = circumference * (1 - progress);
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(56,189,248,0.2)"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold gradient-text">{value}%</span>
        <span className="text-sky-400 text-sm">Accuracy</span>
      </div>
    </div>
  );
};

// Health metric card
// Health metric card — FIXED to accept real miniData
const HealthMetricCard = ({ title, value, unit, trend, color = "#38bdf8", miniData }) => {
  // Fallback to mock data only if miniData is missing
  const chartData = miniData || [...Array(10)].map((_, i) => ({
    value: value + (Math.random() - 0.5) * 10 * (trend > 0 ? 1 : -1)
  }));

  return (
    <div className="glass-card rounded-xl p-4 border border-slate-700/50">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sky-300 text-sm font-medium">{title}</h4>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold" style={{ color }}>{value}</span>
            {unit && <span className="text-slate-400 ml-1">{unit}</span>}
          </div>
        </div>
        <div className={`flex items-center px-2 py-1 rounded-full text-xs ${trend > 0 ? 'bg-emerald-900/30 text-emerald-400' : 'bg-rose-900/30 text-rose-400'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      </div>
      <MiniChart 
        data={chartData} 
        color={color} 
        type="area" 
      />
    </div>
  );
};

export default function Index() {
  const [activeFeature, setActiveFeature] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    document.title = "MAITRI • Home";
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  const createRipple = (event) => {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add("ripple");
    button.appendChild(circle);
    setTimeout(() => {
      circle.remove();
    }, 650);
  };

  const openFeatureModal = (feature) => {
    setActiveFeature(feature);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setActiveFeature(null), 300);
  };

  // Feature data with enhanced details and visualizations
  const features = [
    {
      icon: "🧠",
      title: "Neural Analysis",
      desc: "AI-powered emotion detection from facial expressions and voice patterns",
      gradient: "from-cyan-500/20 to-blue-500/20",
      details: {
        description: "Our advanced neural analysis system uses deep learning algorithms to detect subtle emotional states through facial micro-expressions and vocal patterns. This technology enables real-time psychological monitoring without intrusive sensors.",
        keyPoints: [
          "Real-time emotion detection with 99.2% accuracy",
          "Non-invasive monitoring through existing camera systems",
          "Adaptive learning based on individual astronaut profiles",
          "Privacy-preserving data processing on-device"
        ],
        stats: [
          { value: "99.2%", label: "Detection Accuracy" },
          { value: "<100ms", label: "Processing Time" },
          { value: "24/7", label: "Continuous Monitoring" }
        ],
        visualization: "radial",
        radialData: { value: 99.2 },
        chartData: [
          { label: "Happy", value: 98.7 },
          { label: "Calm", value: 99.1 },
          { label: "Stressed", value: 97.8 },
          { label: "Fatigued", value: 96.5 },
          { label: "Anxious", value: 95.2 }
        ]
      }
    },
    {
      icon: "💙",
      title: "Adaptive Care",
      desc: "Personalized psychological interventions based on crew member needs",
      gradient: "from-blue-500/20 to-indigo-500/20",
      details: {
        description: "MAITRI provides personalized psychological support through adaptive interventions tailored to each astronaut's emotional state, personality profile, and mission phase. Our system dynamically adjusts its approach based on real-time feedback.",
        keyPoints: [
          "Personalized intervention strategies for each crew member",
          "Context-aware support based on mission phase and workload",
          "Evidence-based therapeutic techniques adapted for space",
          "Progress tracking and adaptive adjustment of care plans"
        ],
        stats: [
          { value: "94%", label: "User Satisfaction" },
          { value: "37%", label: "Stress Reduction" },
          { value: "24/7", label: "Support Availability" }
        ],
        visualization: "intervention",
        interventionData: [
          { type: "Mindfulness", usage: 42, effectiveness: 92 },
          { type: "Cognitive", usage: 28, effectiveness: 88 },
          { type: "Social", usage: 18, effectiveness: 95 },
          { type: "Physical", usage: 12, effectiveness: 85 }
        ]
      }
    },
    {
      icon: "📈",
      title: "Vital Monitoring",
      desc: "Continuous tracking of physical and mental health indicators",
      gradient: "from-sky-500/20 to-cyan-500/20",
      details: {
        description: "Our comprehensive monitoring system tracks both physiological and psychological indicators to provide a holistic view of astronaut well-being. Data is analyzed in real-time to detect early signs of stress, fatigue, or health issues.",
        keyPoints: [
          "Multi-parameter health tracking (HRV, sleep quality, cognitive performance)",
          "Early warning system for potential health issues",
          "Seamless integration with existing spacecraft systems",
          "Automated reporting to ground control when necessary"
        ],
        stats: [
          { value: "12", label: "Health Metrics" },
          { value: "99.8%", label: "Data Reliability" },
          { value: "24/7", label: "Monitoring" }
        ],
        visualization: "vitals",
        vitalsData: [
          { name: "Heart Rate", value: 72, unit: "bpm", trend: -2, color: "#38bdf8" },
          { name: "HRV", value: 68, unit: "ms", trend: 5, color: "#0ea5e9" },
          { name: "Sleep Quality", value: 85, unit: "%", trend: 3, color: "#3b82f6" },
          { name: "Cognitive Score", value: 92, unit: "%", trend: 1, color: "#8b5cf6" },
          { name: "Stress Level", value: 18, unit: "%", trend: -4, color: "#ec4899" }
        ]
      }
    },
    {
      icon: "🛡️",
      title: "Mission Safety",
      desc: "Automatic alerts to ground control for critical situations",
      gradient: "from-indigo-500/20 to-purple-500/20",
      details: {
        description: "MAITRI serves as the first line of defense for astronaut safety by automatically detecting critical situations and alerting ground control. Our system prioritizes alerts based on severity and provides contextual information for rapid response.",
        keyPoints: [
          "Real-time anomaly detection for psychological and physical health",
          "Automated emergency protocols activation",
          "Secure communication channels with ground control",
          "Fail-safe mechanisms for system reliability"
        ],
        stats: [
          { value: "<5s", label: "Alert Response" },
          { value: "100%", label: "System Uptime" },
          { value: "24/7", label: "Monitoring" }
        ],
        visualization: "safety",
        safetyData: {
          alerts: [
            { type: "Psychological", count: 12, severity: "Medium" },
            { type: "Physiological", count: 8, severity: "High" },
            { type: "Environmental", count: 3, severity: "Critical" }
          ],
          timeline: [
            { day: "Day 1", alerts: 2 },
            { day: "Day 2", alerts: 1 },
            { day: "Day 3", alerts: 3 },
            { day: "Day 4", alerts: 0 },
            { day: "Day 5", alerts: 2 },
            { day: "Day 6", alerts: 1 },
            { day: "Day 7", alerts: 4 }
          ]
        }
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-sans relative overflow-visible">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-5px) translateX(5px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes modal-fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modal-scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.6s ease-out forwards; }
        .animate-slide-in-right { animation: slide-in-right 0.8s ease-out forwards; }
        
        .feature-card { animation: slide-up 0.8s ease-out forwards; opacity: 0; }
        .feature-card:nth-child(1) { animation-delay: 0.1s; }
        .feature-card:nth-child(2) { animation-delay: 0.2s; }
        .feature-card:nth-child(3) { animation-delay: 0.3s; }
        .feature-card:nth-child(4) { animation-delay: 0.4s; }
        
        .kpi-card { animation: scale-in 0.6s ease-out forwards; opacity: 0; }
        .kpi-card:nth-child(1) { animation-delay: 0.5s; }
        .kpi-card:nth-child(2) { animation-delay: 0.6s; }
        .kpi-card:nth-child(3) { animation-delay: 0.7s; }
        
        .tech-card { animation: slide-up 0.8s ease-out forwards; opacity: 0; }
        .tech-card:nth-child(1) { animation-delay: 0.2s; }
        .tech-card:nth-child(2) { animation-delay: 0.4s; }
        .tech-card:nth-child(3) { animation-delay: 0.6s; }
        
        .gradient-text {
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glass-card {
          background: linear-gradient(145deg, rgba(15,23,42,0.6), rgba(30,41,59,0.6));
          backdrop-filter: blur(12px);
          border: 1px solid rgba(56,189,248,0.2);
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
        
        .glow-border {
          position: relative;
        }
        .glow-border::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(45deg, #38bdf8, #0ea5e9, #3b82f6);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .glow-border:hover::before {
          opacity: 1;
        }
        
        .ripple {
          position: absolute;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.4);
          transform: scale(0);
          animation: ripple 0.65s linear;
          pointer-events: none;
          z-index: 9999;
        }
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        .floating-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          animation: float 8s ease-in-out infinite;
        }
        
        /* Modal styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          z-index: 1000;
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .modal-overlay.open {
          opacity: 1;
          pointer-events: all;
        }
        .modal-content {
          background: linear-gradient(145deg, rgba(15,23,42,0.85), rgba(30,41,59,0.85));
          border: 1px solid rgba(56,189,248,0.3);
          border-radius: 24px;
          max-width: 900px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          transform: scale(0.95);
          opacity: 0;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .modal-overlay.open .modal-content {
          transform: scale(1);
          opacity: 1;
          animation: modal-scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .modal-header {
          padding: 24px 32px 16px;
          border-bottom: 1px solid rgba(56,189,248,0.2);
        }
        .modal-body {
          padding: 24px 32px;
        }
        .modal-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
          margin-top: 24px;
        }
        .stat-card {
          background: rgba(15,23,42,0.6);
          border: 1px solid rgba(56,189,248,0.2);
          border-radius: 16px;
          padding: 16px;
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px -5px rgba(56,189,248,0.2);
        }
        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          background: linear-gradient(135deg, #38bdf8, #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .close-button {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(15,23,42,0.7);
          border: 1px solid rgba(56,189,248,0.3);
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }
        .close-button:hover {
          background: rgba(56,189,248,0.2);
          transform: rotate(90deg);
        }
        .close-icon {
          width: 20px;
          height: 2px;
          background: linear-gradient(90deg, #38bdf8, #0ea5e9);
          position: relative;
        }
        .close-icon::before,
        .close-icon::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 2px;
          background: linear-gradient(90deg, #38bdf8, #0ea5e9);
          top: 0;
        }
        .close-icon::before {
          transform: rotate(45deg);
        }
        .close-icon::after {
          transform: rotate(-45deg);
        }
        .key-points {
          margin-top: 24px;
        }
        .key-point {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
          padding-left: 8px;
          border-left: 2px solid rgba(56,189,248,0.3);
          transition: all 0.3s ease;
        }
        .key-point:hover {
          border-left-color: #38bdf8;
          transform: translateX(4px);
        }
        .key-point-icon {
          min-width: 24px;
          height: 24px;
          background: linear-gradient(135deg, rgba(56,189,248,0.2), rgba(14,165,233,0.2));
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 2px;
        }
        .key-point-text {
          flex: 1;
        }
        
        /* Visualization styles */
        .chart-container {
          margin-top: 24px;
          padding: 20px;
          border-radius: 16px;
          background: rgba(15,23,42,0.4);
          border: 1px solid rgba(56,189,248,0.2);
        }
        .chart-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 16px;
          color: #e0f2fe;
        }
        .radial-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 20px 0;
        }
        .emotion-bars {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }
        .emotion-bar {
          background: rgba(15,23,42,0.6);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }
        .bar-value {
          height: 8px;
          background: linear-gradient(90deg, #38bdf8, #0ea5e9);
          border-radius: 4px;
          margin: 8px 0;
          position: relative;
          overflow: hidden;
        }
        .bar-fill {
          height: 100%;
          width: 0;
          background: linear-gradient(90deg, #38bdf8, #0ea5e9);
          border-radius: 4px;
          animation: fill-bar 1.5s ease-out forwards;
        }
        @keyframes fill-bar {
          to { width: var(--width); }
        }
        .intervention-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }
        .intervention-card {
          glass-card;
          border-radius: 16px;
          padding: 16px;
          text-align: center;
        }
        .intervention-usage {
          height: 8px;
          background: rgba(56,189,248,0.2);
          border-radius: 4px;
          margin: 12px 0;
          position: relative;
        }
        .intervention-fill {
          height: 100%;
          border-radius: 4px;
          background: linear-gradient(90deg, #38bdf8, #0ea5e9);
          width: 0;
          animation: fill-bar 1.5s ease-out 0.3s forwards;
        }
        .vitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }
        .safety-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-top: 20px;
        }
        .alert-card {
          glass-card;
          border-radius: 16px;
          padding: 16px;
        }
        .alert-severity {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .severity-critical { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
        .severity-high { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }
        .severity-medium { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
        .timeline-container {
          margin-top: 24px;
        }
        .timeline-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 16px;
          color: #e0f2fe;
        }
        .timeline-bars {
          display: flex;
          align-items: flex-end;
          height: 100px;
          gap: 8px;
          padding: 0 10px;
        }
        .timeline-bar {
          flex: 1;
          background: linear-gradient(to top, #38bdf8, #0ea5e9);
          border-radius: 4px 4px 0 0;
          position: relative;
          min-width: 30px;
        }
        .timeline-label {
          text-align: center;
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 8px;
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
      <div className="floating-orb w-96 h-96 bg-cyan-500 top-0 right-0" style={{animationDelay: '0s'}}></div>
      <div className="floating-orb w-80 h-80 bg-blue-500 bottom-0 left-0" style={{animationDelay: '2s'}}></div>
      <div className="floating-orb w-64 h-64 bg-sky-500 top-1/2 left-1/2" style={{animationDelay: '4s'}}></div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-slate-700/50 backdrop-blur-lg bg-slate-900/30">
        <div className="flex items-center gap-3 animate-slide-in-right">
          <div className="text-3xl animate-float">🧠</div>
          <div>
            <div className="font-extrabold text-xl gradient-text">MAITRI</div>
            <div className="text-xs text-slate-400 -mt-1">
              ASTRONAUT AI COMPANION
            </div>
          </div>
        </div>

        <NavLink to={'/dashboard'}
          onClick={createRipple}
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 text-white rounded-full px-6 py-3 font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2 group"
        >
          <span  style={{ filter: "drop-shadow(0 0 8px rgba(56,189,248,0.6))" }}>
            🚀
          </span>
          <span className="relative z-10">Launch Mission Control</span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        </NavLink>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 text-center px-6 py-20 max-w-5xl mx-auto space-y-8">
        <div className="animate-scale-in">
          <h1 className="text-7xl font-extrabold leading-tight mb-4">
            Guardian of <span className="gradient-text">Deep Space</span>
          </h1>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 rounded-full"></div>
        </div>
        
        <p className="animate-slide-up max-w-2xl mx-auto text-sky-200 text-xl leading-relaxed" style={{animationDelay: '0.2s', opacity: 0}}>
          Advanced multimodal AI system monitoring psychological and physical
          well-being aboard <strong className="text-cyan-400">Bhartiya Antariksh Station</strong>.
          Real-time emotion detection, adaptive interventions, and 24/7 mission support.
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 animate-slide-up" style={{animationDelay: '0.4s', opacity: 0}}>
          <NavLink to={'/dashboard/emotions'}
            onClick={createRipple}
            className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-full px-8 py-4 font-semibold shadow-lg hover:shadow-sky-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-3"
          >
            <span className="text-2xl" style={{ filter: "drop-shadow(0 0 8px rgba(56,189,248,0.6))" }}>
              ⚡
            </span>
            <span className="relative z-10">Activate Detection System</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </NavLink>
          
          <NavLink
          to={'/dashboard/interventions'}
            onClick={createRipple}
            className="glow-border group glass-card text-sky-400 rounded-full px-8 py-4 font-semibold hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 flex items-center gap-3"
          >
            <span className="text-2xl" style={{ filter: "drop-shadow(0 0 8px rgba(56,189,248,0.4))" }}>
              💙
            </span>
            View Interventions
          </NavLink>
        </div>
      </header>

      {/* Feature Cards */}
      <section className="relative z-10 px-8 py-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, i) => (
          <article
            key={i}
            onClick={() => openFeatureModal(feature)}
            className={`feature-card glow-border group glass-card p-8 rounded-2xl flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            <div className="shimmer-bg absolute inset-0 opacity-0 group-hover:opacity-100"></div>
            <div className="relative z-10">
              <div className="text-5xl mb-4 animate-float" style={{animationDelay: `${i * 0.5}s`}}>{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{feature.title}</h3>
              <p className="text-sky-300 leading-relaxed">{feature.desc}</p>
            </div>
          </article>
        ))}
      </section>

      {/* KPI Tiles */}
      <section className="relative z-10 px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
        {[
          {
            icon: "🧠",
            val: "99.2%",
            label: "Emotion Detection Accuracy"
          },
          {
            icon: "🛰️",
            val: "24/7",
            label: "Continuous Monitoring"
          },
          {
            icon: "⚡",
            val: "<100ms",
            label: "Response Time"
          },
        ].map(({ icon, val, label }, i) => (
          <article
            key={i}
            className={`kpi-card glow-border group glass-card p-8 rounded-2xl flex items-center gap-6 relative overflow-hidden transition-all duration-300 hover:scale-105`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            <div className="shimmer-bg absolute inset-0 opacity-0 group-hover:opacity-100"></div>
            <div className="relative z-10 flex items-center gap-6 w-full">
              <div className={`text-6xl animate-float bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 p-4 rounded-2xl`} style={{animationDelay: `${i * 0.5}s`}}>{icon}</div>
              <div>
                <div className={`text-5xl font-extrabold leading-tight gradient-text`}>{val}</div>
                <div className="text-sky-300 font-medium mt-1">{label}</div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Technology Section */}
      <section className="relative z-10 px-8 max-w-7xl mx-auto text-center space-y-12 my-20">
        <div className="animate-slide-up">
          <h2 className="text-6xl font-extrabold mb-4">
            <span className="gradient-text">Advanced Space Technology</span>
          </h2>
          <p className="text-sky-300 text-xl max-w-2xl mx-auto">
            Powered by cutting-edge AI and space-grade systems
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "📡",
              title: "Multimodal Fusion",
              desc: "Combines audio, video, and physiological data for comprehensive crew assessment",
              list: ["Voice Analysis", "Facial Recognition", "Biometric Sensors"],
            },
            {
              icon: "🚀",
              title: "Offline Operation",
              desc: "Fully autonomous system designed for deep space missions without Earth connectivity",
              list: ["Standalone AI", "Local Processing", "Zero Latency"],
            },
            {
              icon: "🛡️",
              title: "Evidence-Based",
              desc: "Interventions grounded in space psychology research and clinical best practices",
              list: ["Clinical Validation", "NASA Standards", "ISRO Certified"],
            },
          ].map(({ icon, title, desc, list }, i) => (
            <article
              key={i}
              className={`tech-card glow-border group glass-card rounded-2xl p-8 text-left relative overflow-hidden transition-all duration-300 hover:scale-105`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="shimmer-bg absolute inset-0 opacity-0 group-hover:opacity-100"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4 animate-float" style={{animationDelay: `${i * 0.5}s`}}>{icon}</div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{title}</h3>
                <p className="mb-4 text-sky-300 leading-relaxed">{desc}</p>
                <ul className="space-y-2">
                  {list.map((item, ix) => (
                    <li key={ix} className="flex items-center gap-2 text-sky-400">
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full" style={{animation: 'pulse-glow 2s ease-in-out infinite', animationDelay: `${ix * 0.2}s`}}></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Readiness CTA */}
      <section className="relative z-10 px-8 max-w-5xl mx-auto my-20">
        <div className="glow-border glass-card rounded-3xl p-12 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="shimmer-bg absolute inset-0 opacity-0 group-hover:opacity-100"></div>
          <div className="relative z-10">
            <div className="flex justify-center mb-6 text-6xl animate-float">🚀</div>
            <h2 className="text-5xl font-extrabold mb-4 gradient-text">
              Ready for Bhartiya Antariksh Station
            </h2>
            <p className="text-sky-300 text-lg max-w-3xl mx-auto mb-8 leading-relaxed">
              MAITRI is mission-ready to serve as the trusted AI companion for
              Indian astronauts, ensuring optimal mental and physical health during
              extended space missions. Designed to meet ISRO's stringent
              requirements for crew safety and mission success.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {["ISRO Compatible", "Space-Grade AI", "Mission Critical", "Crew Certified"].map((chip, i) => (
                <span
                  key={i}
                  className="glass-card text-cyan-400 rounded-full px-5 py-2 text-sm font-semibold border border-cyan-500/30"
                >
                  {chip}
                </span>
              ))}
            </div>
            <NavLink to={'/dashboard'}
              onClick={createRipple}
              className="relative overflow-hidden group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 text-white rounded-full px-10 py-5 text-lg font-bold shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105"
            >
              <span className="text-2xl animate-float" style={{ filter: "drop-shadow(0 0 8px rgba(56,189,248,0.6))" }}>
                🌐
              </span>
              <span className="relative z-10">Enter Mission Control</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </NavLink>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 glass-card flex justify-between items-center px-8 py-6 max-w-7xl mx-auto my-12 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="text-3xl animate-float">🧠</div>
          <div>
            <strong className="text-xl gradient-text">MAITRI AI System</strong>
            <br />
            <span className="text-sky-400">Astronaut Well-Being Guardian</span>
          </div>
        </div>
        <div className="text-right text-slate-400">
          <div className="text-sky-300 font-semibold">Indian Space Research Organisation (ISRO)</div>
          <small>Smart India Hackathon 2025 • Department of Space (DoS)</small>
        </div>
      </footer>

      {/* Feature Modal */}
      {isModalOpen && activeFeature && (
        <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`}>
          <div className="modal-content" ref={modalRef}>
            <div className="modal-header">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{activeFeature.icon}</div>
                <h2 className="text-3xl font-bold gradient-text">{activeFeature.title}</h2>
              </div>
            </div>
            <div className="modal-body">
              <p className="text-sky-200 text-lg leading-relaxed mb-6">
                {activeFeature.details.description}
              </p>
              
              <div className="key-points">
                <h3 className="text-xl font-bold mb-4 gradient-text">Key Features</h3>
                {activeFeature.details.keyPoints.map((point, idx) => (
                  <div className="key-point" key={idx}>
                    <div className="key-point-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="key-point-text text-sky-300">{point}</div>
                  </div>
                ))}
              </div>
              
              <div className="modal-stats">
                {activeFeature.details.stats.map((stat, idx) => (
                  <div className="stat-card" key={idx}>
                    <div className="stat-value">{stat.value}</div>
                    <div className="text-sky-400 text-sm mt-2">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              {/* Visualization Section */}
              <div className="chart-container">
                {activeFeature.details.visualization === "radial" && (
                  <>
                    <h3 className="chart-title">Emotion Detection Accuracy</h3>
                    <div className="radial-container">
                      <RadialProgress 
                        value={activeFeature.details.radialData.value} 
                        color="#38bdf8" 
                        size={180} 
                      />
                    </div>
                    <div className="emotion-bars">
                      {activeFeature.details.chartData.map((item, idx) => (
                        <div className="emotion-bar" key={idx}>
                          <div className="text-sky-300 text-sm">{item.label}</div>
                          <div className="bar-value">
                            <div 
                              className="bar-fill" 
                              style={{ '--width': `${item.value}%` }}
                            ></div>
                          </div>
                          <div className="text-cyan-400 font-bold">{item.value}%</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {activeFeature.details.visualization === "intervention" && (
                  <>
                    <h3 className="chart-title">Intervention Effectiveness</h3>
                    <div className="intervention-grid">
                      {activeFeature.details.interventionData.map((item, idx) => (
                        <div className="intervention-card" key={idx}>
                          <div className="text-sky-300 font-medium">{item.type}</div>
                          <div className="text-cyan-400 text-2xl font-bold mt-2">{item.effectiveness}%</div>
                          <div className="intervention-usage">
                            <div 
                              className="intervention-fill" 
                              style={{ width: `${item.usage}%` }}
                            ></div>
                          </div>
                          <div className="text-slate-400 text-sm">{item.usage}% usage</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {activeFeature.details.visualization === "vitals" && (
                  <>
                    <h3 className="chart-title">Real-time Health Metrics</h3>
                    <div className="vitals-grid">
                      {activeFeature.details.vitalsData.map((metric, idx) => (
                        <HealthMetricCard 
                          key={idx}
                          title={metric.name}
                          value={metric.value}
                          unit={metric.unit}
                          trend={metric.trend}
                          color={metric.color}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                {activeFeature.details.visualization === "safety" && (
                  <>
                    <h3 className="chart-title">Safety Alert System</h3>
                    <div className="safety-grid">
                      <div>
                        <h4 className="text-sky-300 text-lg font-medium mb-4">Alert Types</h4>
                        <div className="space-y-4">
                          {activeFeature.details.safetyData.alerts.map((alert, idx) => (
                            <div className="alert-card" key={idx}>
                              <div className="flex justify-between items-center">
                                <div className="text-sky-300 font-medium">{alert.type}</div>
                                <span className={`alert-severity severity-${alert.severity.toLowerCase()}`}>
                                  {alert.severity}
                                </span>
                              </div>
                              <div className="text-cyan-400 font-bold mt-2">{alert.count} alerts</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="timeline-container">
                          <h4 className="timeline-title">Alert Timeline (Last 7 Days)</h4>
                          <div className="timeline-bars">
                            {activeFeature.details.safetyData.timeline.map((day, idx) => (
                              <div key={idx} className="flex flex-col items-center">
                                <div 
                                  className="timeline-bar" 
                                  style={{ height: `${(day.alerts / 5) * 100}%` }}
                                ></div>
                                <div className="timeline-label">{day.day}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <button className="close-button" onClick={closeModal}>
              <div className="close-icon"></div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}