import React, { useState, useRef, useEffect } from "react";

export default function CalendarScheduler() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [frequency, setFrequency] = useState("once");
  const [reportType, setReportType] = useState("comprehensive");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [scheduledReports, setScheduledReports] = useState([]);
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr);
  };

  const handleScheduleSubmit = () => {
    if (selectedDate) {
      const newSchedule = {
        id: Date.now(),
        date: selectedDate,
        time: selectedTime,
        frequency: frequency,
        reportType: reportType,
        fullDateTime: `${selectedDate} ${selectedTime}`,
      };
      setScheduledReports([...scheduledReports, newSchedule]);

      // Reset form
      setSelectedDate(null);
      setSelectedTime("09:00");
      setFrequency("once");
      setReportType("comprehensive");
    }
  };

  const handleDeleteSchedule = (id) => {
    setScheduledReports(scheduledReports.filter((report) => report.id !== id));
  };

  const navigateMonth = (direction) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === selectedDate;
      const hasSchedule = scheduledReports.some(
        (report) => report.date === dateStr
      );
      const isPast = new Date(dateStr) < new Date(todayStr);

      days.push(
        <div
          key={day}
          className={`p-2 text-center rounded-lg transition-all relative ${
            isPast ? "text-slate-600 cursor-not-allowed" : "cursor-pointer"
          } ${
            isSelected
              ? "bg-blue-500 text-white font-bold shadow-lg scale-105"
              : isToday
              ? "bg-blue-500/30 text-blue-300 font-semibold ring-2 ring-blue-400"
              : "hover:bg-slate-700 text-slate-200"
          }`}
          onClick={() => !isPast && handleDateSelect(dateStr)}
        >
          {day}
          {hasSchedule && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getMonthName = (month) => {
    return new Date(currentYear, month).toLocaleString("default", {
      month: "long",
    });
  };

  return (
    <div className="scheduler-theme relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1b0a2f] via-[#2c0f3a] to-[#0a051a] px-6 py-10 text-white lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute -left-32 top-1/2 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.15),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.18),transparent_70%)] blur-3xl" />
      <style>{`
        .scheduler-theme .bg-slate-700,
        .scheduler-theme .border-slate-700,
        .scheduler-theme .border-slate-600,
        .scheduler-theme .border-slate-500 {
          border-color: rgba(251, 146, 60, 0.35) !important;
          background-color: rgba(60, 16, 83, 0.55) !important;
        }
        .scheduler-theme .hover\\:bg-slate-600:hover {
          background-color: rgba(249, 115, 22, 0.45) !important;
        }
        .scheduler-theme .bg-slate-800\\/50 {
          background-color: rgba(36, 7, 64, 0.65) !important;
        }
        .scheduler-theme .text-slate-300,
        .scheduler-theme .text-slate-400 {
          color: #f9d6ff !important;
        }
        .scheduler-theme .text-sky-400 {
          color: #fb923c !important;
        }
        .scheduler-theme .bg-blue-500,
        .scheduler-theme .bg-blue-500\\/30 {
          background-color: rgba(59, 130, 246, 0.65) !important;
        }
        .scheduler-theme .ring-blue-400 {
          --tw-ring-color: rgba(249, 115, 22, 0.5) !important;
        }
        .scheduler-theme .bg-blue-800 {
          background-color: rgba(99, 102, 241, 0.6) !important;
        }
        .scheduler-theme .hover\\:bg-blue-900:hover {
          background-color: rgba(76, 29, 149, 0.75) !important;
        }
        .scheduler-theme .bg-gradient-to-r.from-sky-400.to-blue-500 {
          background-image: linear-gradient(90deg, #f97316, #ec4899) !important;
        }
      `}</style>

      {/* content container */}
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">
            📅 Report Scheduler
          </h1>
          <p className="text-slate-300">
            Schedule automated mission reports for your team
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {getMonthName(currentMonth)} {currentYear}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-3">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm text-sky-400 font-semibold py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">{renderCalendar()}</div>

            <div className="flex items-center gap-4 text-sm text-slate-400 mt-4 pt-4 border-t border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500/30 ring-2 ring-blue-400 rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-700 rounded relative">
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                </div>
                <span>Scheduled</span>
              </div>
            </div>
          </div>

          {/* Scheduling Options */}
          <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Schedule Details</h3>

            {selectedDate ? (
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-300 font-semibold">
                    {formatDate(selectedDate)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Report Type
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="comprehensive">Comprehensive Report</option>
                    <option value="health">Health Metrics Only</option>
                    <option value="emotional">Emotional Analysis</option>
                    <option value="performance">Performance Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <button
                  onClick={handleScheduleSubmit}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Schedule Report
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <div className="text-4xl mb-2">📅</div>
                <p>Select a date to schedule a report</p>
              </div>
            )}
          </div>
        </div>

        {/* Scheduled Reports List */}
        {scheduledReports.length > 0 && (
          <div className="mt-8 bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📋</span> Scheduled Reports ({scheduledReports.length})
            </h3>
            <div className="space-y-3">
              {scheduledReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-900/70 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-blue-400 font-semibold">
                        {formatDate(report.date)}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300">{report.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                        {report.reportType}
                      </span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                        {report.frequency}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSchedule(report.id)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
