import React, { useState, useEffect, useRef, useCallback } from "react";
import CalendarScheduler from "./CalendarScheduler";
import { Navigate, NavLink, useNavigate } from "react-router-dom";

export default function Report() {
  const [activeRange, setActiveRange] = useState("week");
  const [crew, setCrew] = useState("All Crew Members");
  const [genLoading, setGenLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const reportContentRef = useRef(null);

  // New state for scheduling
  const [showCalendarOpen, setshowCalendarOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const calendarRef = useRef(null);
  useEffect(() => {
    if (showCalendarOpen) console.log("Calendar Opened");
    else console.log("Calendar Closed");
  }, [showCalendarOpen]);

  // Handle clicks outside calendar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setshowCalendarOpen(false);
      }
    };

    if (showCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendarOpen]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Crew-specific data
  const getCrewData = (crewName, timePeriod) => {
    const baseData = {
      crew: crewName,
      timePeriod: timePeriod,
      metrics: [],
      insights: [],
      stats: [],
      emotions: [],
    };

    switch (crewName) {
      case "Commander Sharma":
        return {
          ...baseData,
          metrics: [
            { label: "Physical Well-being", value: 92 },
            { label: "Mental Health", value: 88 },
            { label: "Emotional Stability", value: 85 },
            { label: "Sleep Quality", value: 80 },
            { label: "Stress Management", value: 89 },
          ],
          insights: [
            {
              type: "positive",
              title: "Excellent Leadership Metrics",
              description: "Team cohesion at 94% - highest this quarter",
            },
            {
              type: "info",
              title: "Sleep Pattern Analysis",
              description: "Consistent 7.5h sleep with minimal disruptions",
            },
          ],
          stats: [
            { value: "42", change: "+5%", label: "Team Check-ins" },
            { value: "18", change: "+12%", label: "Interventions Led" },
            { value: "98%", change: "+3%", label: "Mission Readiness" },
            { value: "1.2min", change: "-8%", label: "Avg Response Time" },
          ],
          emotions: [
            {
              label: "Focused",
              value: 52,
              color: "from-indigo-400 to-indigo-700",
            },
            { label: "Calm", value: 38, color: "from-cyan-400 to-cyan-600" },
            { label: "Happy", value: 35, color: "from-sky-400 to-sky-700" },
            {
              label: "Stressed",
              value: 12,
              color: "from-orange-400 to-orange-700",
            },
            { label: "Anxious", value: 5, color: "from-red-400 to-red-700" },
            { label: "Sad", value: 3, color: "from-purple-400 to-purple-700" },
          ],
        };

      case "Dr. Patel":
        return {
          ...baseData,
          metrics: [
            { label: "Physical Well-being", value: 78 },
            { label: "Mental Health", value: 85 },
            { label: "Emotional Stability", value: 82 },
            { label: "Sleep Quality", value: 70, warn: true },
            { label: "Stress Management", value: 76, warn: true },
          ],
          insights: [
            {
              type: "warning",
              title: "Sleep Quality Concern",
              description: "Average sleep duration 6.2h - below recommended 7h",
            },
            {
              type: "positive",
              title: "High Cognitive Performance",
              description: "Problem-solving metrics 22% above baseline",
            },
          ],
          stats: [
            { value: "89", change: "+15%", label: "Medical Scans" },
            { value: "32", change: "+20%", label: "Interventions" },
            { value: "15", change: "+8%", label: "Alerts Resolved" },
            { value: "0.8min", change: "-15%", label: "Avg Response Time" },
          ],
          emotions: [
            {
              label: "Focused",
              value: 48,
              color: "from-indigo-400 to-indigo-700",
            },
            { label: "Happy", value: 42, color: "from-sky-400 to-sky-700" },
            { label: "Calm", value: 35, color: "from-cyan-400 to-cyan-600" },
            {
              label: "Stressed",
              value: 25,
              color: "from-orange-400 to-orange-700",
            },
            { label: "Anxious", value: 18, color: "from-red-400 to-red-700" },
            { label: "Sad", value: 7, color: "from-purple-400 to-purple-700" },
          ],
        };

      case "Engineer Kumar":
        return {
          ...baseData,
          metrics: [
            { label: "Physical Well-being", value: 88 },
            { label: "Mental Health", value: 80 },
            { label: "Emotional Stability", value: 78 },
            { label: "Sleep Quality", value: 72 },
            { label: "Stress Management", value: 82 },
          ],
          insights: [
            {
              type: "positive",
              title: "Exceptional System Maintenance",
              description: "Critical system uptime at 99.98%",
            },
            {
              type: "warning",
              title: "Workload Imbalance",
              description: "15% above optimal task load threshold",
            },
          ],
          stats: [
            { value: "124", change: "+18%", label: "System Checks" },
            { value: "28", change: "+10%", label: "Interventions" },
            { value: "22", change: "+25%", label: "Alerts Resolved" },
            { value: "1.5min", change: "-5%", label: "Avg Response Time" },
          ],
          emotions: [
            {
              label: "Focused",
              value: 55,
              color: "from-indigo-400 to-indigo-700",
            },
            { label: "Happy", value: 40, color: "from-sky-400 to-sky-700" },
            { label: "Calm", value: 32, color: "from-cyan-400 to-cyan-600" },
            {
              label: "Stressed",
              value: 20,
              color: "from-orange-400 to-orange-700",
            },
            { label: "Anxious", value: 12, color: "from-red-400 to-red-700" },
            { label: "Sad", value: 5, color: "from-purple-400 to-purple-700" },
          ],
        };

      case "Scientist Reddy":
        return {
          ...baseData,
          metrics: [
            { label: "Physical Well-being", value: 82 },
            { label: "Mental Health", value: 90 },
            { label: "Emotional Stability", value: 85 },
            { label: "Sleep Quality", value: 78 },
            { label: "Stress Management", value: 87 },
          ],
          insights: [
            {
              type: "positive",
              title: "Breakthrough Research Progress",
              description: "Data analysis efficiency increased by 30%",
            },
            {
              type: "info",
              title: "Collaboration Metrics",
              description: "Cross-team knowledge sharing at all-time high",
            },
          ],
          stats: [
            { value: "210", change: "+25%", label: "Data Scans" },
            { value: "18", change: "+5%", label: "Interventions" },
            { value: "12", change: "+10%", label: "Alerts Resolved" },
            { value: "0.9min", change: "-18%", label: "Avg Response Time" },
          ],
          emotions: [
            { label: "Happy", value: 50, color: "from-sky-400 to-sky-700" },
            {
              label: "Focused",
              value: 45,
              color: "from-indigo-400 to-indigo-700",
            },
            { label: "Calm", value: 40, color: "from-cyan-400 to-cyan-600" },
            {
              label: "Stressed",
              value: 15,
              color: "from-orange-400 to-orange-700",
            },
            { label: "Anxious", value: 8, color: "from-red-400 to-red-700" },
            { label: "Sad", value: 4, color: "from-purple-400 to-purple-700" },
          ],
        };

      default: // All Crew Members
        return {
          ...baseData,
          metrics: [
            { label: "Physical Well-being", value: 87 },
            { label: "Mental Health", value: 82 },
            { label: "Emotional Stability", value: 79 },
            { label: "Sleep Quality", value: 75 },
            { label: "Stress Management", value: 84, warn: true },
          ],
          insights: [
            {
              type: "positive",
              title: "Improved Team Morale",
              description: "Overall crew well-being increased by 12%",
            },
            {
              type: "warning",
              title: "Sleep Disruption Detected",
              description: "2 crew members showing irregular sleep",
            },
            {
              type: "positive",
              title: "Successful Interventions",
              description: "24 sessions completed with 94% satisfaction",
            },
            {
              type: "info",
              title: "Routine Assessment Due",
              description: "Next week: Quarterly evaluation",
            },
          ],
          stats: [
            { value: "156", change: "+22%", label: "Total Scans" },
            { value: "24", change: "+8%", label: "Interventions" },
            { value: "18", change: "+15%", label: "Alerts Resolved" },
            { value: "<2min", change: "-12%", label: "Avg Response Time" },
          ],
          emotions: [
            { label: "Happy", value: 45, color: "from-sky-400 to-sky-700" },
            { label: "Calm", value: 32, color: "from-cyan-400 to-cyan-600" },
            {
              label: "Focused",
              value: 28,
              color: "from-indigo-400 to-indigo-700",
            },
            {
              label: "Stressed",
              value: 18,
              color: "from-orange-400 to-orange-700",
            },
            { label: "Anxious", value: 12, color: "from-red-400 to-red-700" },
            { label: "Sad", value: 8, color: "from-purple-400 to-purple-700" },
          ],
        };
    }
  };

  const handleGenerate = () => {
    setGenLoading(true);
    setTimeout(() => {
      setGenLoading(false);
      const report = getCrewData(crew, activeRange);
      setReportData(report);
      setShowReport(true);
    }, 1200);
  };

  const handleModalClose = () => {
    setShowReport(false);
  };

  useEffect(() => {
    document.title = "MAITRI • Reports";
  }, []);

  const formatTimePeriod = (range) => {
    switch (range) {
      case "24h":
        return "Last 24 Hours";
      case "week":
        return "Last Week";
      case "month":
        return "Last Month";
      case "quarter":
        return "Last Quarter";
      default:
        return range;
    }
  };

  const smoothScroll = useCallback((targetY) => {
    const startY = reportContentRef.current?.scrollTop || 0;
    const distance = targetY - startY;
    const duration = 500;
    let startTime = null;

    const animation = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Ease-in-out cubic easing
      const easeInOutCubic =
        progress < 0.5
          ? 4 * progress * progress * progress
          : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;

      if (reportContentRef.current) {
        reportContentRef.current.scrollTop = startY + distance * easeInOutCubic;
      }

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }, []);

  const handleDownloadReport = () => {
    // Format the data for readability
    const reportText = JSON.stringify(reportData, null, 2);

    // Create a Blob with the data
    const blob = new Blob([reportText], { type: "application/json" });

    // Create a temporary URL
    const url = URL.createObjectURL(blob);

    // Create a temporary <a> element
    const a = document.createElement("a");
    a.href = url;
    a.download = `mission-report-${new Date().toISOString().slice(0, 10)}.json`; // e.g., mission-report-2024-06-15.json

    // Trigger the download
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // PDF Export Implementation
  const handleExportPDF = () => {
    // In a real app, you'd use a library like jsPDF
    // For this demo, we'll show an alert
    alert("PDF export would be implemented here using a library like jsPDF");
  };

  // CSV Export Implementation
  const handleExportCSV = () => {
    if (!reportData) {
      alert("No report data to export");
      return;
    }

    // Prepare CSV content
    let csvContent = "text/csv;charset=utf-8,";

    // Add metrics
    csvContent += "METRICS\n";
    csvContent += "Label,Value,Warning\n";
    reportData.metrics.forEach((metric) => {
      csvContent += `"${metric.label}",${metric.value},${
        metric.warn ? "Yes" : "No"
      }\n`;
    });

    // Add stats
    csvContent += "\nSTATISTICS\n";
    csvContent += "Value,Change,Label\n";
    reportData.stats.forEach((stat) => {
      csvContent += `"${stat.value}","${stat.change}","${stat.label}"\n`;
    });

    // Add emotions
    csvContent += "\nEMOTIONS\n";
    csvContent += "Label,Value\n";
    reportData.emotions.forEach((emotion) => {
      csvContent += `"${emotion.label}",${emotion.value}\n`;
    });

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `mission-report-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const navigate = useNavigate();
  // Schedule Report Implementation
  const handleScheduleReport = () => {
    navigate("/calendar");
  };
  return (
    <>
      {/* Global smooth scrolling styles */}
      <style>{`
        /* Enable smooth scrolling for entire page */
        html {
          scroll-behavior: smooth !important;
        }

        /* Smooth scrolling for modal content */
        .report-content {
          scroll-behavior: smooth !important;
          scrollbar-width: thin;
          scrollbar-color: #334155 #0f172a;
        }

        .report-content::-webkit-scrollbar {
          width: 8px;
        }

        .report-content::-webkit-scrollbar-track {
          background: #0f172a;
          border-radius: 4px;
        }

        .report-content::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }

        .report-content::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>

      {/* Main Content */}
      <div className="font-inter text-[#e8f6ff] min-h-screen p-8">
        <style>{`
          @keyframes floatGlow {
            0%, 100% { 
              transform: translateY(0) scale(1); 
              filter: drop-shadow(0 0 8px rgba(96,165,250,0.8)); 
            }
            50% { 
              transform: translateY(-10px) scale(1.08); 
              filter: drop-shadow(0 0 20px rgba(96,165,250,1)); 
            }
          }
          .icon-float {
            animation: floatGlow 3.2s ease-in-out infinite;
          }
          .icon-delay-0 { animation-delay: 0s; }
          .icon-delay-1 { animation-delay: 0.6s; }
          .icon-delay-2 { animation-delay: 1.2s; }

          @keyframes progressGlow {
            0%, 100% {
              box-shadow: 0 0 8px rgba(96,165,250,0.6);
            }
            50% {
              box-shadow: 0 0 15px rgba(96,165,250,1);
            }
          }
          .progress-bar-glow {
            animation: progressGlow 3.2s infinite ease-in-out;
            transition: width 0.6s ease;
          }

          .card-hover:hover {
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(96,165,250,0.3);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .report-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
          }
          
          .report-content {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            border-radius: 1.5rem;
            max-width: 1200px;
            width: 95%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(148, 163, 184, 0.2);
            padding: 2rem;
            position: relative;
          }
          
          .close-btn {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            background: rgba(30, 41, 59, 0.7);
            border: 1px solid rgba(148, 163, 184, 0.3);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: all 0.2s ease;
            color: #e8f6ff;
            font-weight: bold;
            font-size: 1.2rem;
          }
          
          .close-btn:hover {
            background: rgba(56, 189, 248, 0.2);
            transform: rotate(90deg);
          }
          
          .download-btn {
            background: linear-gradient(to right, #3b82f6, #0ea5e9);
            padding: 0.75rem 1.5rem;
            border-radius: 0.75rem;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s ease;
            border: none;
            color: white;
            cursor: pointer;
            margin-top: 1.5rem;
          }
          
          .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
          }
        `}</style>

        <header className="px-4">
          <h1 className="text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-500 animate-pulse select-none">
            Mission Reports
          </h1>
          <p className="text-sky-300 select-none">
            📊 Comprehensive well-being analysis and insights
          </p>
        </header>

        <main className="mt-8 space-y-8">
          {/* Generate Report Panel */}
          <section className="bg-[#141b24]/80 backdrop-blur-md rounded-xl p-8 border border-slate-700 shadow-lg shadow-blue-500/20 max-w-7xl mx-auto card-hover transform-gpu transition-transform">
            <h3 className="flex items-center gap-2 text-xl mb-4 font-semibold select-none">
              <span className="text-2xl icon-float icon-delay-0 select-none">
                📄
              </span>{" "}
              Generate Report
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="opacity-80 mb-2 select-none">Time Period</div>
                <div className="flex flex-wrap gap-3">
                  {["24h", "week", "month", "quarter"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setActiveRange(r)}
                      className={`px-4 py-2 rounded-full transition-transform transform hover:scale-105 select-none ${
                        activeRange === r
                          ? "bg-gradient-to-r from-blue-400 to-indigo-400 text-white shadow-lg"
                          : "border border-slate-600 hover:border-slate-400 hover:bg-slate-700/30"
                      }`}
                    >
                      {formatTimePeriod(r)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="opacity-80 mb-2 select-none">Crew Member</div>
                <select
                  value={crew}
                  onChange={(e) => setCrew(e.target.value)}
                  className="w-full bg-[#121820]/70 border border-slate-700 rounded-xl p-3 focus:ring focus:ring-sky-500/40 text-white"
                >
                  <option>All Crew Members</option>
                  <option>Commander Sharma</option>
                  <option>Dr. Patel</option>
                  <option>Engineer Kumar</option>
                  <option>Scientist Reddy</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className="mt-6 w-full bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-xl py-4 font-semibold hover:brightness-110 hover:scale-[1.02] transition transform select-none cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={genLoading}
            >
              {genLoading
                ? "Preparing report…"
                : "⬇️ Generate & Download Report"}
            </button>
          </section>

          {/* Overall Health Metrics and Key Insights */}
          <section className="grid lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {/* Overall Health Metrics */}
            <div className="bg-[#141b24]/80 backdrop-blur-md rounded-xl p-8 border border-slate-700 shadow-lg shadow-blue-500/10 card-hover transform-gpu transition-transform">
              <h3 className="flex items-center gap-2 text-xl mb-4 font-semibold select-none">
                <span className="icon-float icon-delay-0 text-xl select-none">
                  🧪
                </span>{" "}
                Overall Health Metrics
              </h3>
              {[
                ["Physical Well-being", 87],
                ["Mental Health", 82],
                ["Emotional Stability", 79],
                ["Sleep Quality", 75],
                ["Stress Management", 84, true],
              ].map(([label, val, warn], i) => (
                <div
                  key={label}
                  className="flex items-center justify-between my-3 select-none"
                >
                  <span>{label}</span>
                  <div className="flex-1 mx-3 h-2 rounded-full bg-slate-800 relative overflow-hidden">
                    <span
                      className={`absolute left-0 top-0 h-full rounded-full progress-bar-glow ${
                        warn
                          ? "bg-gradient-to-r from-amber-400 to-orange-500"
                          : "bg-gradient-to-r from-sky-400 to-blue-500"
                      }`}
                      style={{ width: `${val}%` }}
                      aria-label={`${label} progress bar at ${val} percent`}
                    ></span>
                  </div>
                  <strong>{val}%</strong>
                </div>
              ))}
            </div>

            {/* Key Insights */}
            <div className="bg-[#141b24]/80 backdrop-blur-md rounded-xl p-8 border border-slate-700 shadow-lg shadow-blue-500/10 card-hover transform-gpu transition-transform">
              <h3 className="flex items-center gap-2 text-xl mb-4 font-semibold select-none">
                <span className="icon-float icon-delay-1 text-xl select-none">
                  🧭
                </span>{" "}
                Key Insights
              </h3>
              <div className="space-y-3 text-sm">
                <div className="p-4 rounded-xl border border-slate-700 bg-gradient-to-b from-slate-800/60 to-slate-700/30 select-none">
                  ✅ Improved Team Morale
                  <div className="text-gray-400">
                    Overall crew well-being increased by 12%
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-amber-500/40 bg-gradient-to-b from-amber-900/40 to-amber-700/30 select-none">
                  ⚠️ Sleep Disruption Detected
                  <div className="text-amber-300">
                    2 crew members showing irregular sleep
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-teal-400/20 bg-gradient-to-b from-slate-800/60 to-slate-700/30 select-none">
                  ✅ Successful Interventions
                  <div className="text-gray-400">
                    24 sessions completed with 94% satisfaction
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-700 bg-gradient-to-b from-slate-800/60 to-slate-700/30 select-none">
                  📆 Routine Assessment Due
                  <div className="text-gray-400">
                    Next week: Quarterly evaluation
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Detailed Stats */}
          <section className="bg-[#141b24]/80 backdrop-blur-md rounded-xl p-8 border border-slate-700 shadow-lg shadow-blue-500/10 max-w-7xl mx-auto card-hover transform-gpu transition-transform">
            <h3 className="flex items-center gap-2 text-xl mb-6 font-semibold select-none">
              <span className="icon-float icon-delay-2 select-none">📈</span>{" "}
              Detailed Statistics
            </h3>
            <div className="grid grid-cols-4 gap-6 text-center select-none">
              <div className="bg-gradient-to-br from-blue-500/40 to-blue-700/70 rounded-lg p-6 shadow-md">
                <div className="text-3xl font-semibold">156</div>
                <small className="text-green-400 font-semibold inline-block mt-1">
                  +22%
                </small>
                <div className="mt-1 text-gray-300 font-medium">
                  Total Scans
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/40 to-purple-700/70 rounded-lg p-6 shadow-md">
                <div className="text-3xl font-semibold">24</div>
                <small className="text-green-400 font-semibold inline-block mt-1">
                  +8%
                </small>
                <div className="mt-1 text-gray-300 font-medium">
                  Interventions
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500/40 to-green-700/70 rounded-lg p-6 shadow-md">
                <div className="text-3xl font-semibold">18</div>
                <small className="text-green-400 font-semibold inline-block mt-1">
                  +15%
                </small>
                <div className="mt-1 text-gray-300 font-medium">
                  Alerts Resolved
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-400/40 to-orange-600/70 rounded-lg p-6 shadow-md">
                <div className="text-3xl font-semibold">{"<2min"}</div>
                <small className="text-green-400 font-semibold inline-block mt-1">
                  -12%
                </small>
                <div className="mt-1 text-gray-300 font-medium">
                  Avg Response Time
                </div>
              </div>
            </div>
          </section>

          {/* Emotion Trends */}
          <section className="max-w-7xl mx-auto rounded-xl p-8 bg-[#141b24]/80 backdrop-blur-md border border-slate-700 shadow-lg shadow-blue-500/10 select-none">
            <h3 className="mb-4 text-xl font-semibold">
              Emotion Trends (Last 7 Days)
            </h3>
            {[
              ["Happy", 45, "from-sky-400 to-sky-700"],
              ["Calm", 32, "from-cyan-400 to-cyan-600"],
              ["Focused", 28, "from-indigo-400 to-indigo-700"],
              ["Stressed", 18, "from-orange-400 to-orange-700"],
              ["Anxious", 12, "from-red-400 to-red-700"],
              ["Sad", 8, "from-purple-400 to-purple-700"],
            ].map(([label, val, gradient], idx) => (
              <div
                key={label}
                className="flex items-center mb-2 last:mb-0"
                aria-label={`${label} ${val} percent`}
              >
                <span className="w-20">{label}</span>
                <div className="flex-1 h-3 rounded-full bg-slate-700 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${gradient} progress-bar-glow`}
                    style={{ width: `${val}%` }}
                  ></div>
                </div>
                <span className="w-10 text-right ml-4 font-semibold">
                  {val}%
                </span>
              </div>
            ))}
          </section>

          {/* Export Buttons */}
          <section className="max-w-7xl mx-auto grid grid-cols-3 gap-6 mt-12 px-4">
            {[
              { label: "Export as PDF", icon: "🖨", onClick: handleExportPDF },
              { label: "Export as CSV", icon: "📄", onClick: handleExportCSV },
            ].map(({ label, icon, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="flex justify-center bg-blue-800 items-center gap-3 border border-slate-700 rounded-lg py-3 hover:bg-blue-900 cursor-pointer  font-semibold transition select-none"
              >
                <span>{icon}</span> {label}
              </button>
            ))}
            <NavLink to={'/dashboard/reports/calendar'}
              className="flex justify-center bg-blue-800 items-center gap-3 border border-slate-700 rounded-lg py-3 hover:bg-blue-900 cursor-pointer  font-semibold transition select-none"
            >
              <span>🗓</span> Schedule Report
            </NavLink>
          </section>
        </main>
        <div className="h-8"></div>
      </div>

      {/* Report Modal */}
      {showReport && reportData && (
        <div className="report-modal " onClick={handleModalClose}>
          <div
            className="report-content "
            onClick={(e) => e.stopPropagation()}
            style={{
              scrollBehavior: "auto", //
              willChange: "scroll-position",
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
            }}
          >
            <div className="close-btn" onClick={handleModalClose}>
              ✕
            </div>

            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">
                  Mission Report
                </h2>
                <div className="text-sky-300">
                  <span className="font-semibold">Crew:</span> {reportData.crew}{" "}
                  •<span className="font-semibold ml-2">Period:</span>{" "}
                  {formatTimePeriod(reportData.timePeriod)}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Health Metrics */}
              <section className="bg-[#141b24]/80 backdrop-blur-md rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-xl">🧪</span> Overall Health Metrics
                </h3>
                {reportData.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex items-center justify-between my-3"
                  >
                    <span>{metric.label}</span>
                    <div className="flex-1 mx-3 h-2 rounded-full bg-slate-800 relative overflow-hidden">
                      <span
                        className={`absolute left-0 top-0 h-full rounded-full ${
                          metric.warn
                            ? "bg-gradient-to-r from-amber-400 to-orange-500"
                            : "bg-gradient-to-r from-sky-400 to-blue-500"
                        }`}
                        style={{ width: `${metric.value}%` }}
                      ></span>
                    </div>
                    <strong>{metric.value}%</strong>
                  </div>
                ))}
              </section>

              {/* Key Insights */}
              <section className="bg-[#141b24]/80 backdrop-blur-md rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-xl">🧭</span> Key Insights
                </h3>
                <div className="space-y-3">
                  {reportData.insights.map((insight, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl ${
                        insight.type === "warning"
                          ? "border border-amber-500/40 bg-gradient-to-b from-amber-900/40 to-amber-700/30"
                          : "border border-slate-700 bg-gradient-to-b from-slate-800/60 to-slate-700/30"
                      }`}
                    >
                      {insight.type === "warning" ? "⚠️" : "✅"} {insight.title}
                      <div
                        className={
                          insight.type === "warning"
                            ? "text-amber-300"
                            : "text-gray-400"
                        }
                      >
                        {insight.description}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Detailed Stats */}
              <section className="bg-[#141b24]/80 backdrop-blur-md rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-xl">📈</span> Detailed Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {reportData.stats.map((stat, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-blue-500/40 to-blue-700/70 rounded-lg p-4 text-center"
                    >
                      <div className="text-2xl font-semibold">{stat.value}</div>
                      <small className="text-green-400 font-semibold block mt-1">
                        {stat.change}
                      </small>
                      <div className="mt-1 text-gray-300">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Emotion Trends */}
              <section className="bg-[#141b24]/80 backdrop-blur-md rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold mb-4">Emotion Trends</h3>
                {reportData.emotions.map((emotion) => (
                  <div key={emotion.label} className="flex items-center mb-3">
                    <span className="w-24">{emotion.label}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-slate-700 overflow-hidden relative">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${emotion.color}`}
                        style={{ width: `${emotion.value}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-right ml-4 font-semibold">
                      {emotion.value}%
                    </span>
                  </div>
                ))}
              </section>
            </div>

            <div className="flex justify-center mt-10 pb-4">
              <button className="download-btn" onClick={handleDownloadReport}>
                <span className="mr-2">⬇️</span> Download Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
