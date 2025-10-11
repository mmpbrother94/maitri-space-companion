import React, { useState, memo, useCallback, useRef, useMemo } from "react";
import {
  Users,
  Headphones,
  Clock,
  AlertTriangle,
  User,
  Wrench,
  FlaskConical,
  CheckCircle,
  X,
  TrendingUp,
  Heart,
  Zap,
  Brain,
  Activity,
} from "lucide-react";
import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

// Optimized chart components
const EmotionalTrendsChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis dataKey="day" stroke="#9CA3AF" />
      <YAxis stroke="#9CA3AF" domain={[0, 100]} />
      <Tooltip 
        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
        labelStyle={{ color: '#93C5FD' }}
      />
      <Line type="monotone" dataKey="stress" stroke="#F97316" strokeWidth={2} />
      <Line type="monotone" dataKey="anxiety" stroke="#EF4444" strokeWidth={2} />
      <Line type="monotone" dataKey="focus" stroke="#10B981" strokeWidth={2} />
      <Line type="monotone" dataKey="mood" stroke="#3B82F6" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
));

const HeartRateChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis dataKey="time" stroke="#9CA3AF" />
      <YAxis stroke="#9CA3AF" domain={[60, 90]} />
      <Tooltip 
        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
        labelStyle={{ color: '#93C5FD' }}
      />
      <Area type="monotone" dataKey="heartRate" stroke="#EF4444" fill="#DC2626" fillOpacity={0.2} />
    </AreaChart>
  </ResponsiveContainer>
));

const SleepQualityChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis dataKey="time" stroke="#9CA3AF" />
      <YAxis stroke="#9CA3AF" domain={[0, 100]} />
      <Tooltip 
        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
        labelStyle={{ color: '#93C5FD' }}
      />
      <Bar dataKey="sleepQuality" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
));

const ActivityBreakdownChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} layout="vertical">
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
      <XAxis type="number" stroke="#9CA3AF" domain={[0, 10]} />
      <YAxis dataKey="activity" type="category" stroke="#9CA3AF" />
      <Tooltip 
        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
        labelStyle={{ color: '#93C5FD' }}
      />
      <Bar dataKey="hours" fill="#60A5FA" radius={[0, 4, 4, 0]} />
    </BarChart>
  </ResponsiveContainer>
));

function MissionClock() {
  const [time, setTime] = React.useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="relative flex w-full max-w-xs flex-col gap-2 overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-[#04142f] via-[#081c40] to-[#031126] px-6 py-5 shadow-[0_0_24px_rgba(34,211,238,0.2)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.25),transparent_65%)] opacity-80" />
      <div className="pointer-events-none absolute -right-10 top-1/3 h-24 w-24 rotate-12 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.18),transparent_70%)] blur-xl" />
      <div className="relative flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.25)]">
          <Clock className="h-6 w-6" />
        </div>
        <div className="text-2xl font-bold tracking-wider text-cyan-100">
          {time.toLocaleTimeString()}
        </div>
      </div>
      <div className="relative text-sm font-semibold text-cyan-300">
        Mission Day 127{" \u2022 "}Orbit 2,048
      </div>
    </div>
  );
}

// Modal component for crew details
const CrewDetailsModal = ({ crewMember, onClose }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (crewMember) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [crewMember]);

  // Memoize chart data to prevent unnecessary re-renders
  const memoizedEmotionalData = useMemo(() => crewMember?.emotionalData || [], [crewMember]);
  const memoizedBiometricData = useMemo(() => crewMember?.biometricData || [], [crewMember]);
  const memoizedActivityData = useMemo(() => crewMember?.activityData || [], [crewMember]);

  // Stable keys for charts to prevent remounting
  const chartKeys = useMemo(() => ({
    emotional: `${crewMember?.id || 'default'}-emotional-${memoizedEmotionalData.length}`,
    heartRate: `${crewMember?.id || 'default'}-heartrate-${memoizedBiometricData.length}`,
    sleep: `${crewMember?.id || 'default'}-sleep-${memoizedBiometricData.length}`,
    activity: `${crewMember?.id || 'default'}-activity-${memoizedActivityData.length}`,
  }), [crewMember, memoizedEmotionalData, memoizedBiometricData, memoizedActivityData]);

  // Optimized scroll container with hardware acceleration
  const scrollContainerRef = useRef(null);

  // Smooth scroll handler with requestAnimationFrame
  const smoothScroll = useCallback((targetY) => {
    const startY = scrollContainerRef.current?.scrollTop || 0;
    const distance = targetY - startY;
    const duration = 500;
    let startTime = null;

    const animation = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Ease-in-out cubic easing
      const easeInOutCubic = progress < 0.5 
        ? 4 * progress * progress * progress 
        : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
      
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = startY + distance * easeInOutCubic;
      }

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }, []);

  // Intersection Observer for lazy loading charts (optional optimization)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => observer.observe(container));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 p-6 border-b border-slate-700 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <div className={`${crewMember.statusColor} p-3 rounded-xl shadow-lg bg-opacity-40 flex items-center justify-center`}>
              {crewMember.name.includes("Commander") && <User className="w-8 h-8" />}
              {crewMember.name.includes("Dr.") && <User className="w-8 h-8" />}
              {crewMember.name.includes("Engineer") && <Wrench className="w-8 h-8" />}
              {crewMember.name.includes("Scientist") && <FlaskConical className="w-8 h-8" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{crewMember.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`${crewMember.statusColor} text-xs font-semibold px-3 py-1 rounded-full text-white shadow-md`}>
                  {crewMember.status}
                </span>
                <span className="text-slate-400">Well-being: {crewMember.progress}%</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-700 transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Scrollable Content with Optimized Smooth Scrolling */}
        <div 
          ref={scrollContainerRef}
          className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-8"
          style={{ 
            scrollBehavior: 'auto', //
            willChange: 'scroll-position',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          {/* Emotional State Section */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-semibold text-white">Emotional State Analysis</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 chart-container">
                <h4 className="text-slate-300 mb-3">Daily Emotional Trends</h4>
                <div className="h-64 min-h-[16rem]">
                  {/* Memoized Chart with Stable Key */}
                  <EmotionalTrendsChart 
                    key={chartKeys.emotional}
                    data={memoizedEmotionalData} 
                    style={{ willChange: 'transform' }}
                  />
                </div>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 chart-container">
                <h4 className="text-slate-300 mb-3">Current Emotional Metrics</h4>
                <div className="space-y-4">
                  {Object.entries(crewMember.emotionalMetrics).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className={`${getColorByKey(key)} font-medium`}>{value}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`${getColorClass(key)} h-2.5 rounded-full transition-all duration-500 ease-out`} 
                          style={{ width: `${value}%`, willChange: 'width' }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Biometric Data Section */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-red-400" />
              <h3 className="text-xl font-semibold text-white">Biometric Monitoring</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 chart-container">
                <h4 className="text-slate-300 mb-3">Heart Rate Variability</h4>
                <div className="h-64 min-h-[16rem]">
                  <HeartRateChart 
                    key={chartKeys.heartRate}
                    data={memoizedBiometricData} 
                    style={{ willChange: 'transform' }}
                  />
                </div>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 chart-container">
                <h4 className="text-slate-300 mb-3">Sleep Quality</h4>
                <div className="h-64 min-h-[16rem]">
                  <SleepQualityChart 
                    key={chartKeys.sleep}
                    data={memoizedBiometricData} 
                    style={{ willChange: 'transform' }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Activity Breakdown */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Daily Activity Breakdown</h3>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 chart-container">
              <div className="h-64 min-h-[16rem]">
                <ActivityBreakdownChart 
                  key={chartKeys.activity}
                  data={memoizedActivityData} 
                  style={{ willChange: 'transform' }}
                />
              </div>
            </div>
          </div>
       
          {/* Recommendations */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xl font-semibold text-white">Recommendations</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <h4 className="text-slate-300 mb-2">Immediate Actions</h4>
                <ul className="space-y-2 text-slate-300">
                  {crewMember.recommendations.immediate.map((item, index) => (
                    <li key={`immediate-${index}`} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <h4 className="text-slate-300 mb-2">Long-term Strategies</h4>
                <ul className="space-y-2 text-slate-300">
                  {crewMember.recommendations.longTerm.map((item, index) => (
                    <li key={`longterm-${index}`} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions (add these at the bottom of your file)
const getColorByKey = (key) => {
  const colorMap = {
    stress: 'text-orange-400',
    anxiety: 'text-red-400',
    focus: 'text-emerald-400',
    mood: 'text-blue-400',
  };
  return colorMap[key.toLowerCase()] || 'text-slate-400';
};

const getColorClass = (key) => {
  const colorMap = {
    stress: 'bg-orange-500',
    anxiety: 'bg-red-500',
    focus: 'bg-emerald-500',
    mood: 'bg-blue-500',
  };
  return colorMap[key.toLowerCase()] || 'bg-slate-500';
};

export default function MissionControl() {
  const [selectedCrew, setSelectedCrew] = useState(null);
  
  const stats = [
    {
      icon: Users,
      value: "4",
      label: "Crew Members",
      change: "+2%",
      color: "cyan",
    },
    {
      icon: Headphones,
      value: "83%",
      label: "Avg Well-being",
      change: "+3%",
      color: "blue",
    },
    {
      icon: Clock,
      value: "24/7",
      label: "Active Monitoring",
      change: "+100%",
      color: "emerald",
    },
    {
      icon: AlertTriangle,
      value: "1",
      label: "Alerts Today",
      change: "+4%",
      color: "orange",
    },
  ];
  
  const statStyleMap = {
    cyan: {
      glow: "from-cyan-500/35 via-cyan-400/10 to-transparent",
      icon: "bg-cyan-500/15 text-cyan-200",
      chip: "border-cyan-400/40 bg-cyan-500/10 text-cyan-200",
    },
    blue: {
      glow: "from-sky-500/35 via-sky-400/10 to-transparent",
      icon: "bg-sky-500/15 text-sky-200",
      chip: "border-sky-400/40 bg-sky-500/10 text-sky-200",
    },
    emerald: {
      glow: "from-emerald-500/40 via-emerald-400/10 to-transparent",
      icon: "bg-emerald-500/15 text-emerald-200",
      chip: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
    },
    orange: {
      glow: "from-orange-500/35 via-orange-400/10 to-transparent",
      icon: "bg-orange-500/15 text-orange-200",
      chip: "border-orange-400/40 bg-orange-500/10 text-orange-200",
    },
  };
  
  const crewStatusStyles = {
    STABLE: {
      chip: "border-cyan-400/40 bg-cyan-500/10 text-cyan-200",
      icon: "bg-cyan-500/15 text-cyan-200",
    },
    GOOD: {
      chip: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
      icon: "bg-emerald-500/15 text-emerald-200",
    },
    ATTENTION: {
      chip: "border-orange-400/40 bg-orange-500/10 text-orange-200",
      icon: "bg-orange-500/15 text-orange-200",
    },
  };
  
  // Define unique data for each crew member
  const crew = [
    {
      name: "Commander Sharma",
      status: "STABLE",
      statusColor: "bg-cyan-600",
      progress: 85,
      progressColor: "from-cyan-600 to-blue-600",
      stats: [
        { label: "Heart Rate", value: "68 bpm" },
        { label: "Sleep", value: "8.0 h" },
        { label: "Stress", value: "Low" },
      ],
      emotionalData: [
        { day: 'Mon', stress: 25, anxiety: 15, focus: 85, mood: 75 },
        { day: 'Tue', stress: 30, anxiety: 20, focus: 80, mood: 70 },
        { day: 'Wed', stress: 35, anxiety: 25, focus: 75, mood: 65 },
        { day: 'Thu', stress: 30, anxiety: 20, focus: 80, mood: 70 },
        { day: 'Fri', stress: 25, anxiety: 15, focus: 85, mood: 75 },
        { day: 'Sat', stress: 20, anxiety: 10, focus: 90, mood: 80 },
        { day: 'Sun', stress: 15, anxiety: 5, focus: 95, mood: 85 },
      ],
      emotionalMetrics: { stress: 25, anxiety: 15, focus: 85, mood: 75 },
      biometricData: [
        { time: '06:00', heartRate: 62, sleepQuality: 85 },
        { time: '09:00', heartRate: 68, sleepQuality: 0 },
        { time: '12:00', heartRate: 72, sleepQuality: 0 },
        { time: '15:00', heartRate: 75, sleepQuality: 0 },
        { time: '18:00', heartRate: 70, sleepQuality: 0 },
        { time: '21:00', heartRate: 65, sleepQuality: 0 },
        { time: '00:00', heartRate: 60, sleepQuality: 80 },
      ],
      activityData: [
        { activity: 'Leadership', hours: 4 },
        { activity: 'Operations', hours: 4 },
        { activity: 'Rest', hours: 8 },
        { activity: 'Exercise', hours: 1 },
        { activity: 'Meals', hours: 1 },
        { activity: 'Leisure', hours: 3 },
        { activity: 'Other', hours: 3 },
      ],
      recommendations: {
        immediate: [
          "Maintain leadership wellness protocols",
          "Continue balanced work-rest schedule",
          "Ensure regular team communication sessions"
        ],
        longTerm: [
          "Develop strategic decision-making simulations",
          "Optimize command center ergonomics",
          "Implement leadership resilience training"
        ]
      }
    },
    {
      name: "Dr. Patel",
      status: "GOOD",
      statusColor: "bg-emerald-600",
      progress: 82,
      progressColor: "from-emerald-600 to-teal-500",
      stats: [
        { label: "Heart Rate", value: "65 bpm" },
        { label: "Sleep", value: "8.5 h" },
        { label: "Stress", value: "Very Low" },
      ],
      emotionalData: [
        { day: 'Mon', stress: 20, anxiety: 10, focus: 90, mood: 80 },
        { day: 'Tue', stress: 25, anxiety: 15, focus: 85, mood: 75 },
        { day: 'Wed', stress: 30, anxiety: 20, focus: 80, mood: 70 },
        { day: 'Thu', stress: 25, anxiety: 15, focus: 85, mood: 75 },
        { day: 'Fri', stress: 20, anxiety: 10, focus: 90, mood: 80 },
        { day: 'Sat', stress: 15, anxiety: 5, focus: 95, mood: 85 },
        { day: 'Sun', stress: 10, anxiety: 5, focus: 95, mood: 90 },
      ],
      emotionalMetrics: { stress: 20, anxiety: 10, focus: 90, mood: 80 },
      biometricData: [
        { time: '06:00', heartRate: 60, sleepQuality: 90 },
        { time: '09:00', heartRate: 65, sleepQuality: 0 },
        { time: '12:00', heartRate: 70, sleepQuality: 0 },
        { time: '15:00', heartRate: 72, sleepQuality: 0 },
        { time: '18:00', heartRate: 68, sleepQuality: 0 },
        { time: '21:00', heartRate: 63, sleepQuality: 0 },
        { time: '00:00', heartRate: 58, sleepQuality: 85 },
      ],
      activityData: [
        { activity: 'Medical', hours: 6 },
        { activity: 'Research', hours: 2 },
        { activity: 'Rest', hours: 8.5 },
        { activity: 'Exercise', hours: 1.5 },
        { activity: 'Meals', hours: 1 },
        { activity: 'Leisure', hours: 2.5 },
        { activity: 'Other', hours: 2.5 },
      ],
      recommendations: {
        immediate: [
          "Maintain current wellness routine",
          "Continue regular exercise schedule",
          "Ensure adequate hydration during medical duties"
        ],
        longTerm: [
          "Develop advanced medical training modules",
          "Optimize sleep environment for deep rest",
          "Implement peer support system for medical staff"
        ]
      }
    },
    {
      name: "Engineer Kumar",
      status: "ATTENTION",
      statusColor: "bg-orange-600",
      progress: 60,
      progressColor: "from-orange-600 to-amber-500",
      stats: [
        { label: "Heart Rate", value: "82 bpm" },
        { label: "Sleep", value: "5.4 h" },
        { label: "Stress", value: "Medium" },
      ],
      emotionalData: [
        { day: 'Mon', stress: 40, anxiety: 30, focus: 70, mood: 60 },
        { day: 'Tue', stress: 50, anxiety: 40, focus: 60, mood: 50 },
        { day: 'Wed', stress: 60, anxiety: 50, focus: 50, mood: 40 },
        { day: 'Thu', stress: 55, anxiety: 45, focus: 55, mood: 45 },
        { day: 'Fri', stress: 45, anxiety: 35, focus: 65, mood: 55 },
        { day: 'Sat', stress: 35, anxiety: 25, focus: 75, mood: 65 },
        { day: 'Sun', stress: 30, anxiety: 20, focus: 80, mood: 70 },
      ],
      emotionalMetrics: { stress: 60, anxiety: 50, focus: 50, mood: 40 },
      biometricData: [
        { time: '06:00', heartRate: 75, sleepQuality: 60 },
        { time: '09:00', heartRate: 80, sleepQuality: 0 },
        { time: '12:00', heartRate: 85, sleepQuality: 0 },
        { time: '15:00', heartRate: 88, sleepQuality: 0 },
        { time: '18:00', heartRate: 82, sleepQuality: 0 },
        { time: '21:00', heartRate: 78, sleepQuality: 0 },
        { time: '00:00', heartRate: 72, sleepQuality: 55 },
      ],
      activityData: [
        { activity: 'Maintenance', hours: 7 },
        { activity: 'Repairs', hours: 3 },
        { activity: 'Rest', hours: 6 },
        { activity: 'Exercise', hours: 1 },
        { activity: 'Meals', hours: 1 },
        { activity: 'Leisure', hours: 2 },
        { activity: 'Other', hours: 4 },
      ],
      recommendations: {
        immediate: [
          "Schedule a stress management session within 24 hours",
          "Recommend 30 minutes of relaxation exercises",
          "Adjust work schedule to include additional rest periods"
        ],
        longTerm: [
          "Implement daily mindfulness practice",
          "Monitor sleep patterns and adjust lighting conditions",
          "Schedule weekly psychological evaluations"
        ]
      }
    },
    {
      name: "Scientist Reddy",
      status: "STABLE",
      statusColor: "bg-blue-600",
      progress: 84,
      progressColor: "from-blue-600 to-indigo-600",
      stats: [
        { label: "Heart Rate", value: "70 bpm" },
        { label: "Sleep", value: "7.3 h" },
        { label: "Stress", value: "Low" },
      ],
      emotionalData: [
        { day: 'Mon', stress: 35, anxiety: 25, focus: 75, mood: 65 },
        { day: 'Tue', stress: 40, anxiety: 30, focus: 70, mood: 60 },
        { day: 'Wed', stress: 45, anxiety: 35, focus: 65, mood: 55 },
        { day: 'Thu', stress: 40, anxiety: 30, focus: 70, mood: 60 },
        { day: 'Fri', stress: 35, anxiety: 25, focus: 75, mood: 65 },
        { day: 'Sat', stress: 30, anxiety: 20, focus: 80, mood: 70 },
        { day: 'Sun', stress: 25, anxiety: 15, focus: 85, mood: 75 },
      ],
      emotionalMetrics: { stress: 45, anxiety: 35, focus: 75, mood: 65 },
      biometricData: [
        { time: '06:00', heartRate: 65, sleepQuality: 75 },
        { time: '09:00', heartRate: 70, sleepQuality: 0 },
        { time: '12:00', heartRate: 75, sleepQuality: 0 },
        { time: '15:00', heartRate: 78, sleepQuality: 0 },
        { time: '18:00', heartRate: 73, sleepQuality: 0 },
        { time: '21:00', heartRate: 68, sleepQuality: 0 },
        { time: '00:00', heartRate: 63, sleepQuality: 70 },
      ],
      activityData: [
        { activity: 'Experiments', hours: 6 },
        { activity: 'Data Analysis', hours: 3 },
        { activity: 'Rest', hours: 7.5 },
        { activity: 'Exercise', hours: 1 },
        { activity: 'Meals', hours: 1 },
        { activity: 'Leisure', hours: 2 },
        { activity: 'Other', hours: 3.5 },
      ],
      recommendations: {
        immediate: [
          "Encourage participation in team social activities",
          "Suggest brief breaks during intense research sessions",
          "Recommend light physical activity to reduce mental fatigue"
        ],
        longTerm: [
          "Develop personalized cognitive enhancement program",
          "Optimize workstation ergonomics for research tasks",
          "Implement regular peer collaboration sessions"
        ]
      }
    },
  ];
  
  const activities = [
    {
      text: "Engineer Kumar completed stress management session",
      time: "2 min ago",
    },
    { text: "Dr. Patel logged daily health metrics", time: "15 min ago" },
    {
      text: "Commander Sharma received motivational intervention",
      time: "1 hour ago",
    },
    { text: "Routine psychological assessment completed", time: "3 hours ago" },
  ];
  const alerts = [
    {
      text: "Engineer Kumar showing stress indicators, intervention recommended",
      severity: "High",
    },
  ];
  const getIconForCrew = (name) => {
    if (name.includes("Commander")) return User;
    if (name.includes("Dr.")) return User;
    if (name.includes("Engineer")) return Wrench;
    if (name.includes("Scientist")) return FlaskConical;
    return User;
  };

  const handleViewDetails = useCallback((member) => {
    setSelectedCrew(member);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#030b24] via-[#041134] to-[#040916] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute bottom-[-26rem] left-1/2 h-[48rem] w-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.12),transparent_70%)]" />
      <div className="relative flex w-full flex-col px-6 py-10 font-sans lg:px-10 lg:py-14">
      {/* Icon floating keyframes only */}
      <style>
        {`
          @keyframes iconfloat {
            0%,100% { transform: translateY(0); }
            50% { transform: translateY(-14px) scale(1.07); }
          }
          .icon-float { animation: iconfloat 4.5s ease-in-out infinite; }
          .icon-delay-0 { animation-delay: .2s; }
          .icon-delay-1 { animation-delay: .6s; }
          .icon-delay-2 { animation-delay: 1.0s; }
          .icon-delay-3 { animation-delay: 1.4s; }
        `}
      </style>
      
      {/* Modal */}
      {selectedCrew && (
        <CrewDetailsModal 
          crewMember={selectedCrew} 
          onClose={() => setSelectedCrew(null)} 
        />
      )}

      {/* Header */}
      <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white lg:text-5xl">
            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
              Mission Control
            </span>
          </h1>
          <p className="mt-2 text-sm text-slate-300 lg:text-base">
            Real-time crew monitoring{" \u2022 "}Bhartiya Antariksh Station
          </p>
        </div>
        <MissionClock />
      </header>

      {/* Stats */}
      <section className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ icon: StatIcon, value, label, change, color }, index) => {
          const accent = statStyleMap[color] ?? statStyleMap.cyan;
          return (
            <div
              key={label}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_22px_45px_rgba(8,20,58,0.4)] backdrop-blur transition-transform duration-500 hover:-translate-y-1"
            >
              <div
                className={`pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-gradient-to-br ${accent.glow}`}
              />
              <div className="pointer-events-none absolute -right-10 top-[-40%] h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_65%)] blur-2xl" />
              <div className="relative flex flex-col gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent.icon} shadow-[0_0_18px_rgba(59,130,246,0.25)]`}>
                  <StatIcon className={`h-6 w-6 icon-float icon-delay-${index}`} />
                </div>
                <div className="text-4xl font-black tracking-tight text-white">
                  {value}
                </div>
                <p className="text-sm font-medium text-slate-300">{label}</p>
                <span className={`inline-flex w-fit items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] ${accent.chip}`}>
                  {change}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Crew */}
      <section className="mb-12 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {crew.map((member) => {
          const CrewIcon = getIconForCrew(member.name);
          const statusStyles = crewStatusStyles[member.status] ?? crewStatusStyles.STABLE;
          return (
            <div
              key={member.name}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_32px_68px_rgba(8,20,58,0.45)] backdrop-blur transition-transform duration-500 hover:-translate-y-1"
            >
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-gradient-to-tr ${member.progressColor}`}
                style={{ filter: "blur(28px)" }}
              />
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${statusStyles.icon} shadow-[0_0_24px_rgba(59,130,246,0.2)]`}>
                      <CrewIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                      <p className="text-sm text-slate-400">{member.status}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${statusStyles.chip}`}>
                    {member.status}
                  </span>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Well-being Score</span>
                    <span>{member.progress}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full border border-white/10 bg-slate-800/60">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${member.progressColor} shadow-[0_0_20px_rgba(59,130,246,0.3)]`}
                      style={{ width: `${member.progress}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {member.stats.map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-3 text-center shadow-[0_10px_24px_rgba(8,20,58,0.35)]"
                    >
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleViewDetails(member)}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition duration-300 hover:bg-cyan-500/20"
                  type="button"
                >
                  View Detailed Analysis
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Recent Activity & Alerts */}
      <section className="mb-12 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_28px_60px_rgba(8,20,58,0.4)] backdrop-blur transition-transform duration-500 hover:-translate-y-1">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-800/50 via-slate-900/0 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
          <div className="relative z-10">
            <h2 className="mb-5 flex items-center gap-3 text-lg font-semibold text-white">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
              Recent Activity
            </h2>
            <ul className="space-y-4 text-sm text-slate-300">
              {activities.map(({ text, time }, activityIndex) => (
                <li key={activityIndex} className="flex items-start gap-3">
                  <span className="mt-1 flex h-2.5 w-2.5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.5)]" />
                  <div>
                    <p className="leading-5">{text}</p>
                    <p className="mt-1 text-xs text-slate-400">{time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-br from-orange-900/80 via-orange-800/60 to-orange-700/60 p-6 shadow-[0_34px_70px_rgba(124,45,18,0.45)] backdrop-blur transition-transform duration-500 hover:-translate-y-1">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/30 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
          <div className="relative z-10">
            <h2 className="mb-5 flex items-center gap-3 text-lg font-semibold text-white">
              <AlertTriangle className="h-6 w-6 text-orange-300" />
              Active Alerts
            </h2>
            <ul className="space-y-4">
              {alerts.map(({ text, severity }, alertIndex) => (
                <li
                  key={alertIndex}
                  className="rounded-2xl border border-orange-400/40 bg-orange-500/10 px-4 py-4 text-orange-100 shadow-[0_18px_32px_rgba(124,45,18,0.4)]"
                >
                  <p className="font-semibold leading-5">{text}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.35em] text-orange-200">
                    {severity}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="grid grid-cols-1 gap-4 pb-8 md:grid-cols-3">
        <NavLink
          to="/dashboard/emotions"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 px-6 py-4 text-center text-sm font-semibold text-white shadow-[0_20px_45px_rgba(8,20,58,0.4)] transition-transform duration-500 hover:-translate-y-1"
        >
          <span className="relative z-10">Start Emotion Scan</span>
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        </NavLink>
        <NavLink
          to="/dashboard/interventions"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 px-6 py-4 text-center text-sm font-semibold text-white shadow-[0_20px_45px_rgba(8,20,58,0.4)] transition-transform duration-500 hover:-translate-y-1"
        >
          <span className="relative z-10">View Interventions</span>
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        </NavLink>
        <NavLink
          to="/dashboard/reports"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 px-6 py-4 text-center text-sm font-semibold text-white shadow-[0_20px_45px_rgba(8,20,58,0.4)] transition-transform duration-500 hover:-translate-y-1"
        >
          <span className="relative z-10">Generate Report</span>
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        </NavLink>
      </section>
    </div>
  </div>
  );
}
