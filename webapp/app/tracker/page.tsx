"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/track";

// localStorage key prefix
const TRACKER_KEY = "ayurv_tracker";

interface TrackedHerb {
  id: string;
  name: string;
  dosage: string; // user-entered dose text
  addedAt: string; // ISO date
}

interface DayLog {
  date: string; // YYYY-MM-DD
  herbs: Record<string, boolean>; // herb_id → taken or not
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
}

// streak count — consecutive days with at least 1 herb logged
function calculateStreak(logs: DayLog[]): number {
  if (logs.length === 0) return 0;
  const sorted = [...logs]
    .filter(l => Object.values(l.herbs).some(Boolean))
    .sort((a, b) => b.date.localeCompare(a.date));
  if (sorted.length === 0) return 0;

  let streak = 0;
  const today = todayStr();
  let checkDate = today;

  for (let i = 0; i < 365; i++) {
    const found = sorted.find(l => l.date === checkDate);
    if (found) {
      streak++;
    } else if (checkDate !== today) {
      // missed a day (allow today to be empty)
      break;
    }
    // previous day
    const d = new Date(checkDate + "T12:00:00");
    d.setDate(d.getDate() - 1);
    checkDate = d.toISOString().split("T")[0];
  }
  return streak;
}

export default function TrackerPage() {
  const [herbs, setHerbs] = useState<TrackedHerb[]>([]);
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [newHerbName, setNewHerbName] = useState("");
  const [newHerbDosage, setNewHerbDosage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TRACKER_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setHerbs(data.herbs || []);
        setLogs(data.logs || []);
      }
    } catch { /* fresh start */ }
  }, []);

  // save to localStorage on change
  const save = useCallback((h: TrackedHerb[], l: DayLog[]) => {
    try {
      localStorage.setItem(TRACKER_KEY, JSON.stringify({ herbs: h, logs: l }));
    } catch { /* storage full — ignore */ }
  }, []);

  // toggle herb taken for today
  function toggleHerb(herbId: string) {
    const today = todayStr();
    setLogs(prev => {
      const existing = prev.find(l => l.date === today);
      let updated: DayLog[];
      if (existing) {
        updated = prev.map(l =>
          l.date === today
            ? { ...l, herbs: { ...l.herbs, [herbId]: !l.herbs[herbId] } }
            : l
        );
      } else {
        updated = [...prev, { date: today, herbs: { [herbId]: true } }];
      }
      save(herbs, updated);
      return updated;
    });
  }

  // add new herb to tracker
  function addHerb() {
    if (!newHerbName.trim()) return;
    const id = `custom_${Date.now()}`;
    const newHerb: TrackedHerb = {
      id,
      name: newHerbName.trim(),
      dosage: newHerbDosage.trim() || "As directed",
      addedAt: todayStr(),
    };
    const updated = [...herbs, newHerb];
    setHerbs(updated);
    save(updated, logs);
    setNewHerbName("");
    setNewHerbDosage("");
    setShowAddForm(false);
    trackEvent("herb_tracker_add" as never);
  }

  // remove herb
  function removeHerb(herbId: string) {
    const updated = herbs.filter(h => h.id !== herbId);
    setHerbs(updated);
    save(updated, logs);
  }

  const today = todayStr();
  const todayLog = logs.find(l => l.date === today);
  const takenToday = herbs.filter(h => todayLog?.herbs[h.id]);
  const streak = calculateStreak(logs);

  // last 7 days for mini heatmap
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Herb Tracker</h1>
      <p className="text-sm text-ayurv-muted mb-6">Track your daily Ayurvedic herb intake and build healthy habits.</p>

      {/* stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-ayurv-primary">{herbs.length}</p>
          <p className="text-[11px] text-gray-500">Herbs tracked</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{takenToday.length}/{herbs.length}</p>
          <p className="text-[11px] text-gray-500">Today</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{streak}</p>
          <p className="text-[11px] text-gray-500">Day streak</p>
        </div>
      </div>

      {/* 7-day mini heatmap */}
      {herbs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <p className="text-xs font-medium text-gray-500 mb-2">Last 7 days</p>
          <div className="flex gap-1.5">
            {last7.map(date => {
              const dayLog = logs.find(l => l.date === date);
              const taken = dayLog ? Object.values(dayLog.herbs).filter(Boolean).length : 0;
              const total = herbs.length;
              const pct = total > 0 ? taken / total : 0;
              const bg = pct === 0 ? "bg-gray-100" : pct < 0.5 ? "bg-green-200" : pct < 1 ? "bg-green-400" : "bg-green-600";
              const isToday = date === today;
              return (
                <div key={date} className="flex-1 text-center">
                  <div className={`w-full aspect-square rounded-lg ${bg} ${isToday ? "ring-2 ring-ayurv-primary ring-offset-1" : ""}`} title={`${getDateLabel(date)}: ${taken}/${total}`} />
                  <p className={`text-[9px] mt-1 ${isToday ? "font-bold text-ayurv-primary" : "text-gray-400"}`}>
                    {new Date(date + "T12:00:00").toLocaleDateString("en-IN", { weekday: "narrow" })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* today's checklist */}
      {herbs.length > 0 ? (
        <div className="space-y-2 mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-2">Today&apos;s Check-in</h2>
          {herbs.map(herb => {
            const taken = todayLog?.herbs[herb.id] || false;
            return (
              <div
                key={herb.id}
                className={`flex items-center justify-between bg-white border rounded-xl px-4 py-3 transition-all ${
                  taken ? "border-green-200 bg-green-50/50" : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleHerb(herb.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      taken ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-ayurv-primary"
                    }`}
                    aria-label={taken ? `Mark ${herb.name} as not taken` : `Mark ${herb.name} as taken`}
                  >
                    {taken && (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                  <div>
                    <p className={`text-sm font-medium ${taken ? "text-green-700 line-through" : "text-gray-800"}`}>
                      {herb.name}
                    </p>
                    <p className="text-[11px] text-gray-400">{herb.dosage}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeHerb(herb.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors p-1"
                  aria-label={`Remove ${herb.name} from tracker`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center mb-6">
          <p className="text-sm text-gray-600 mb-2">No herbs tracked yet</p>
          <p className="text-xs text-gray-400 mb-4">Add the herbs you take daily and check them off each day to build consistency.</p>
        </div>
      )}

      {/* add herb form */}
      {showAddForm ? (
        <div className="bg-white border border-ayurv-primary/20 rounded-xl p-4 mb-6 animate-fade-in">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Add a herb to track</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Herb name (e.g. Ashwagandha)"
              value={newHerbName}
              onChange={(e) => setNewHerbName(e.target.value)}
              maxLength={100}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm"
              autoFocus
            />
            <input
              type="text"
              placeholder="Dosage (e.g. 500mg capsule, twice daily)"
              value={newHerbDosage}
              onChange={(e) => setNewHerbDosage(e.target.value)}
              maxLength={200}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addHerb}
                disabled={!newHerbName.trim()}
                className="flex-1 px-4 py-2.5 bg-ayurv-primary text-white text-sm font-semibold rounded-lg hover:bg-ayurv-secondary transition-colors disabled:opacity-50"
              >
                Add Herb
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setNewHerbName(""); setNewHerbDosage(""); }}
                className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-ayurv-primary hover:text-ayurv-primary transition-colors mb-6"
        >
          + Add Herb to Track
        </button>
      )}

      {/* link to herbs page */}
      <div className="text-center">
        <Link href="/herbs" className="text-xs text-ayurv-primary hover:underline">
          Browse herb database for reference
        </Link>
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">
        Data stored locally on your device. Not medical advice — discuss herbs with your doctor.
      </p>
    </div>
  );
}
