import { useState, useEffect } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const CATEGORIES = [
  { label: "Work", color: "#5B8DEF", bg: "#EEF3FD" },
  { label: "Health", color: "#52C17F", bg: "#EDFAF3" },
  { label: "Learning", color: "#F0A044", bg: "#FEF6EC" },
  { label: "Personal", color: "#E06B8B", bg: "#FDEEF3" },
  { label: "Social", color: "#A278D8", bg: "#F4EFFE" },
  { label: "Other", color: "#8A9BB0", bg: "#EEF1F5" },
];

const getCat = (label) => CATEGORIES.find((c) => c.label === label) || CATEGORIES[5];

const getWeekDates = (offset = 0) => {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7) + offset * 7);
  return DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const initialActivities = [
  { id: 1, day: "Monday", title: "Morning Run", start: "07:00", end: "07:45", category: "Health", notes: "5km park loop", color: "#52C17F", reminder: true, reminderMins: 10, done: false, reminded: false },
  { id: 2, day: "Monday", title: "Team Standup", start: "09:00", end: "09:30", category: "Work", notes: "Daily sync with team", color: "#5B8DEF", reminder: true, reminderMins: 5, done: false, reminded: false },
  { id: 3, day: "Wednesday", title: "React Course", start: "18:00", end: "19:30", category: "Learning", notes: "Complete hooks module", color: "#F0A044", reminder: false, reminderMins: 15, done: false, reminded: false },
  { id: 4, day: "Friday", title: "Dinner with Friends", start: "19:00", end: "21:00", category: "Social", notes: "Reserve at The Terrace", color: "#A278D8", reminder: true, reminderMins: 30, done: false, reminded: false },
  { id: 5, day: "Saturday", title: "Yoga Session", start: "08:00", end: "09:00", category: "Health", notes: "", color: "#52C17F", reminder: false, reminderMins: 10, done: true, reminded: false },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #E8E4DC;
    min-height: 100vh;
  }

  .app-root {
    min-height: 100vh;
    background: linear-gradient(135deg, #EAE6DE 0%, #DDD8CF 40%, #E4DFD5 100%);
    position: relative;
    overflow: hidden;
  }

  .app-root::before {
    content: '';
    position: fixed;
    top: -200px; left: -200px;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(91,141,239,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .app-root::after {
    content: '';
    position: fixed;
    bottom: -150px; right: -150px;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(162,120,216,0.10) 0%, transparent 70%);
    pointer-events: none;
  }

  .topbar {
    position: sticky; top: 0; z-index: 100;
    backdrop-filter: blur(20px) saturate(1.4);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
    background: rgba(255,255,255,0.62);
    border-bottom: 1px solid rgba(255,255,255,0.5);
    box-shadow: 0 2px 20px rgba(0,0,0,0.07);
    padding: 0 32px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .topbar-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 600;
    color: #1A1A2E;
    letter-spacing: -0.3px;
    white-space: nowrap;
  }

  .week-nav {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .week-label {
    font-size: 13px;
    font-weight: 500;
    color: #5A6272;
    min-width: 170px;
    text-align: center;
    letter-spacing: 0.2px;
  }

  .nav-btn {
    width: 32px; height: 32px;
    border-radius: 50%;
    border: 1px solid rgba(0,0,0,0.1);
    background: rgba(255,255,255,0.7);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    color: #3A4255;
    transition: all 0.15s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  }
  .nav-btn:hover { background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }

  .add-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 18px;
    border-radius: 20px;
    border: none;
    background: linear-gradient(135deg, #5B8DEF, #7BA7F5);
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 3px 12px rgba(91,141,239,0.35);
    transition: all 0.2s;
    white-space: nowrap;
  }
  .add-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(91,141,239,0.45); }
  .add-btn:active { transform: translateY(0); }

  .board {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 12px;
    padding: 24px 20px;
    min-height: calc(100vh - 64px);
  }

  @media (max-width: 1100px) {
    .board { grid-template-columns: repeat(4, 1fr); }
  }
  @media (max-width: 700px) {
    .board { grid-template-columns: repeat(2, 1fr); }
  }

  .day-col {
    background: rgba(255,255,255,0.52);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.7);
    box-shadow: 0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 320px;
  }

  .day-col.today {
    border-color: rgba(91,141,239,0.35);
    box-shadow: 0 4px 24px rgba(91,141,239,0.12), inset 0 1px 0 rgba(255,255,255,0.8);
  }

  .day-header {
    padding: 14px 14px 10px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }

  .day-name {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #8A95A8;
  }

  .day-col.today .day-name { color: #5B8DEF; }

  .day-date {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 600;
    color: #1A1A2E;
    line-height: 1;
    margin-top: 2px;
  }

  .day-col.today .day-date {
    color: white;
    background: linear-gradient(135deg, #5B8DEF, #7BA7F5);
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px;
  }

  .day-badges {
    display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end;
  }

  .reminder-badge {
    background: rgba(240,160,68,0.15);
    color: #D4842A;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 8px;
    display: flex; align-items: center; gap: 3px;
  }

  .day-add-btn {
    width: 22px; height: 22px;
    border-radius: 50%;
    border: 1.5px dashed rgba(91,141,239,0.4);
    background: transparent;
    color: #5B8DEF;
    font-size: 14px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .day-add-btn:hover { background: rgba(91,141,239,0.1); border-style: solid; }

  .activities-list {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    gap: 8px;
    color: #B0BAC9;
  }

  .empty-icon {
    font-size: 28px;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 11px;
    text-align: center;
    line-height: 1.5;
  }

  .activity-card {
    border-radius: 12px;
    padding: 10px 12px;
    background: rgba(255,255,255,0.8);
    border: 1px solid rgba(255,255,255,0.9);
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    cursor: default;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .activity-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    border-radius: 3px 0 0 3px;
  }

  .activity-card:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.09); }
  .activity-card.done { opacity: 0.55; }
  .activity-card.done .act-title { text-decoration: line-through; color: #AAB3C0; }

  .act-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 4px;
  }

  .act-check {
    width: 16px; height: 16px;
    border-radius: 50%;
    border: 1.5px solid #CBD2DC;
    cursor: pointer;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    margin-top: 1px;
    transition: all 0.15s;
    font-size: 9px;
    background: transparent;
    color: transparent;
  }
  .act-check.checked { border-color: #52C17F; background: #52C17F; color: white; }
  .act-check:hover { border-color: #52C17F; }

  .act-title {
    font-size: 12px;
    font-weight: 600;
    color: #1E2433;
    flex: 1;
    line-height: 1.3;
  }

  .act-actions {
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .activity-card:hover .act-actions { opacity: 1; }

  .act-icon-btn {
    width: 20px; height: 20px;
    border: none; background: transparent;
    border-radius: 6px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px;
    color: #8A95A8;
    transition: all 0.12s;
    padding: 0;
  }
  .act-icon-btn:hover { background: rgba(0,0,0,0.07); color: #3A4255; }
  .act-icon-btn.del:hover { background: rgba(220,60,60,0.1); color: #DC3C3C; }

  .act-time {
    font-size: 10px;
    color: #8A95A8;
    font-weight: 500;
    margin-top: 3px;
    margin-left: 20px;
  }

  .act-bottom {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 6px;
    margin-left: 20px;
  }

  .cat-chip {
    font-size: 9.5px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 6px;
    letter-spacing: 0.2px;
  }

  .reminder-dot {
    font-size: 10px;
    color: #F0A044;
  }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 500;
    background: rgba(0,0,0,0.25);
    backdrop-filter: blur(6px);
    display: flex; align-items: flex-end; justify-content: center;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal {
    width: 100%;
    max-width: 520px;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(20px);
    border-radius: 24px 24px 0 0;
    padding: 28px 28px 36px;
    box-shadow: 0 -8px 40px rgba(0,0,0,0.15);
    animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    max-height: 92vh;
    overflow-y: auto;
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .modal-handle {
    width: 36px; height: 4px;
    background: rgba(0,0,0,0.15);
    border-radius: 2px;
    margin: 0 auto 20px;
  }

  .modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 600;
    color: #1A1A2E;
    margin-bottom: 20px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .form-group.full { grid-column: 1 / -1; }

  .form-label {
    font-size: 11px;
    font-weight: 600;
    color: #7A8496;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .form-input, .form-select, .form-textarea {
    padding: 9px 13px;
    border-radius: 10px;
    border: 1.5px solid rgba(0,0,0,0.1);
    background: rgba(255,255,255,0.8);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #1E2433;
    outline: none;
    transition: border-color 0.15s;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: #5B8DEF;
    box-shadow: 0 0 0 3px rgba(91,141,239,0.1);
  }

  .form-textarea { resize: vertical; min-height: 70px; }

  .cat-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .cat-btn {
    padding: 5px 11px;
    border-radius: 20px;
    border: 1.5px solid transparent;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }

  .reminder-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: rgba(240,160,68,0.08);
    border-radius: 12px;
    border: 1px solid rgba(240,160,68,0.2);
  }

  .toggle {
    width: 38px; height: 22px;
    border-radius: 11px;
    background: #D0D5DF;
    cursor: pointer;
    position: relative;
    transition: background 0.2s;
    border: none;
    flex-shrink: 0;
  }
  .toggle.on { background: #F0A044; }
  .toggle::after {
    content: '';
    position: absolute;
    width: 16px; height: 16px;
    border-radius: 50%;
    background: white;
    top: 3px; left: 3px;
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .toggle.on::after { left: 19px; }

  .toggle-label {
    font-size: 12px;
    font-weight: 500;
    color: #5A6272;
    flex: 1;
  }

  .mins-select {
    padding: 4px 8px;
    border-radius: 8px;
    border: 1px solid rgba(0,0,0,0.12);
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    background: white;
    color: #3A4255;
    outline: none;
  }

  .modal-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .btn-cancel {
    flex: 1;
    padding: 11px;
    border-radius: 12px;
    border: 1.5px solid rgba(0,0,0,0.1);
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #5A6272;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-cancel:hover { background: rgba(0,0,0,0.04); }

  .btn-save {
    flex: 2;
    padding: 11px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #5B8DEF, #7BA7F5);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: white;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(91,141,239,0.35);
    transition: all 0.2s;
  }
  .btn-save:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(91,141,239,0.4); }

  /* Toast */
  .toast-container {
    position: fixed;
    bottom: 28px; right: 24px;
    z-index: 999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(12px);
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.14);
    border: 1px solid rgba(240,160,68,0.3);
    pointer-events: all;
    animation: toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    min-width: 260px;
    max-width: 340px;
  }

  @keyframes toastIn {
    from { opacity: 0; transform: translateX(60px) scale(0.9); }
    to { opacity: 1; transform: translateX(0) scale(1); }
  }

  .toast-icon { font-size: 22px; }

  .toast-content { flex: 1; }

  .toast-heading {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #D4842A;
    margin-bottom: 2px;
  }

  .toast-msg {
    font-size: 13px;
    font-weight: 500;
    color: #1E2433;
  }

  .toast-dismiss {
    width: 24px; height: 24px;
    border-radius: 50%;
    border: none;
    background: rgba(0,0,0,0.07);
    cursor: pointer;
    font-size: 12px;
    color: #8A95A8;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .toast-dismiss:hover { background: rgba(0,0,0,0.12); color: #3A4255; }
`;

let nextId = 100;

export default function App() {
  const [activities, setActivities] = useState(initialActivities);
  const [weekOffset, setWeekOffset] = useState(0);
  const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', day?, activity? }
  const [toasts, setToasts] = useState([]);
  const [form, setForm] = useState({});
  const weekDates = getWeekDates(weekOffset); 

  // Reminder polling
  useEffect(() => {
    const tick = setInterval(() => {
      const now = new Date();
      const todayName = DAYS[((now.getDay() + 6) % 7)];
      const hh = now.getHours().toString().padStart(2, "0");
      const mm = now.getMinutes().toString().padStart(2, "0");

      setActivities((prev) =>
        prev.map((a) => {
          if (!a.reminder || a.reminded || a.done) return a;
          const [sh, sm] = a.start.split(":").map(Number);
          const startTotal = sh * 60 + sm;
          const nowTotal = now.getHours() * 60 + now.getMinutes();
          const diff = startTotal - nowTotal;
          if (a.day === todayName && diff >= 0 && diff <= a.reminderMins) {
            fireToast(a);
            return { ...a, reminded: true };
          }
          return a;
        })
      );
    }, 30000);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fireToast = (activity) => {
    const id = Date.now();
    setToasts((prev) => [
      ...prev,
      { id, activity },
    ]);
    setTimeout(() => dismissToast(id), 8000);
  };

  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const openAdd = (day = DAYS[0]) => {
    setForm({ day, title: "", start: "09:00", end: "10:00", category: "Work", notes: "", reminder: false, reminderMins: 15 });
    setModal({ mode: "add" });
  };

  const openEdit = (activity) => {
    setForm({ ...activity });
    setModal({ mode: "edit" });
  };

  const closeModal = () => setModal(null);

  const saveActivity = () => {
    if (!form.title?.trim()) return;
    if (modal.mode === "add") {
      const cat = getCat(form.category);
      setActivities((prev) => [...prev, { ...form, id: nextId++, color: cat.color, done: false, reminded: false }]);
    } else {
      setActivities((prev) => prev.map((a) => (a.id === form.id ? { ...form, reminded: false } : a)));
    }
    closeModal();
  };

  const deleteActivity = (id) => setActivities((prev) => prev.filter((a) => a.id !== id));
  const toggleDone = (id) => setActivities((prev) => prev.map((a) => a.id === id ? { ...a, done: !a.done } : a));

  const pendingReminders = (day) => activities.filter((a) => a.day === day && a.reminder && !a.done && !a.reminded).length;

  const today = new Date();
  const todayIdx = (today.getDay() + 6) % 7;

  return (
    <>
      <style>{STYLES}</style>
      <div className="app-root">
        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-title">✦ My Week</div>
          <div className="week-nav">
            <button className="nav-btn" onClick={() => setWeekOffset((o) => o - 1)}>‹</button>
            <div className="week-label">
              {fmt(weekDates[0])} – {fmt(weekDates[6])}
            </div>
            <button className="nav-btn" onClick={() => setWeekOffset((o) => o + 1)}>›</button>
          </div>
          <button className="add-btn" onClick={() => openAdd()}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Activity
          </button>
        </div>

        {/* Board */}
        <div className="board">
          {DAYS.map((day, i) => {
            const isToday = weekOffset === 0 && i === todayIdx;
            const dayActs = activities
              .filter((a) => a.day === day)
              .sort((a, b) => a.start.localeCompare(b.start));
            const pending = pendingReminders(day);

            return (
              <div key={day} className={`day-col${isToday ? " today" : ""}`}>
                <div className="day-header">
                  <div>
                    <div className="day-name">{day.slice(0, 3)}</div>
                    <div className="day-date">{weekDates[i].getDate()}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    {pending > 0 && (
                      <div className="reminder-badge">🔔 {pending}</div>
                    )}
                    <button className="day-add-btn" onClick={() => openAdd(day)}>+</button>
                  </div>
                </div>

                <div className="activities-list">
                  {dayActs.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🌿</div>
                      <div className="empty-text">No activities yet<br />Click + to add one</div>
                    </div>
                  ) : (
                    dayActs.map((act) => {
                      const cat = getCat(act.category);
                      return (
                        <div
                          key={act.id}
                          className={`activity-card${act.done ? " done" : ""}`}
                          style={{ "--card-color": act.color }}
                        >
                          <div style={{
                            position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                            background: act.color, borderRadius: "3px 0 0 3px"
                          }} />
                          <div className="act-top">
                            <div
                              className={`act-check${act.done ? " checked" : ""}`}
                              onClick={() => toggleDone(act.id)}
                            >
                              {act.done && "✓"}
                            </div>
                            <div className="act-title">{act.title}</div>
                            <div className="act-actions">
                              <button className="act-icon-btn" onClick={() => openEdit(act)} title="Edit">✎</button>
                              <button className="act-icon-btn del" onClick={() => deleteActivity(act.id)} title="Delete">✕</button>
                            </div>
                          </div>
                          <div className="act-time">{fmtTime(act.start)} – {fmtTime(act.end)}</div>
                          <div className="act-bottom">
                            <span className="cat-chip" style={{ color: cat.color, background: cat.bg }}>{act.category}</span>
                            {act.reminder && !act.done && <span className="reminder-dot" title={`Reminder: ${act.reminderMins} min before`}>🔔</span>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal */}
        {modal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <div className="modal">
              <div className="modal-handle" />
              <div className="modal-title">{modal.mode === "add" ? "New Activity" : "Edit Activity"}</div>

              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">Title</label>
                  <input
                    className="form-input"
                    placeholder="What are you doing?"
                    value={form.title || ""}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Day</label>
                  <select
                    className="form-select"
                    value={form.day || DAYS[0]}
                    onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
                  >
                    {DAYS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <div className="cat-selector">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.label}
                        className="cat-btn"
                        style={{
                          color: c.color,
                          background: form.category === c.label ? c.bg : "transparent",
                          borderColor: form.category === c.label ? c.color : "rgba(0,0,0,0.1)",
                        }}
                        onClick={() => setForm((f) => ({ ...f, category: c.label }))}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={form.start || "09:00"}
                    onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={form.end || "10:00"}
                    onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
                  />
                </div>

                <div className="form-group full">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Any details..."
                    value={form.notes || ""}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                </div>

                <div className="form-group full">
                  <div className="reminder-row">
                    <button
                      className={`toggle${form.reminder ? " on" : ""}`}
                      onClick={() => setForm((f) => ({ ...f, reminder: !f.reminder }))}
                    />
                    <span className="toggle-label">🔔 Set a reminder</span>
                    {form.reminder && (
                      <select
                        className="mins-select"
                        value={form.reminderMins || 15}
                        onChange={(e) => setForm((f) => ({ ...f, reminderMins: Number(e.target.value) }))}
                      >
                        {[5, 10, 15, 30, 60].map((m) => (
                          <option key={m} value={m}>{m} min before</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button className="btn-save" onClick={saveActivity}>
                  {modal.mode === "add" ? "Add Activity" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toasts */}
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className="toast">
              <div className="toast-icon">🔔</div>
              <div className="toast-content">
                <div className="toast-heading">Upcoming reminder</div>
                <div className="toast-msg">{t.activity.title} starts at {fmtTime(t.activity.start)}</div>
              </div>
              <button className="toast-dismiss" onClick={() => dismissToast(t.id)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
