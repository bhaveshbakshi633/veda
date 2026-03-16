"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getOrCreateUid, clearAllLocalData } from "@/lib/storage";

interface HistoryEntry {
  id: string;
  date: string;
  concern: string;
  concern_label: string;
  recommended_count: number;
  caution_count: number;
  avoid_count: number;
  total: number;
}

interface ProfileData {
  age: string | null;
  sex: string | null;
  pregnancy_status: string | null;
  chronic_conditions: string[];
  medications: string[];
  current_herbs: string;
  updated_at: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = getOrCreateUid();

    Promise.all([
      fetch(`/api/profile?uid=${uid}`).then((r) => r.json()).catch(() => ({ profile: null })),
      fetch(`/api/user/history?uid=${uid}`).then((r) => r.json()).catch(() => ({ history: [] })),
    ]).then(([profileRes, historyRes]) => {
      setProfile(profileRes.profile || null);
      setEntries(historyRes.history || []);
      setLoading(false);
    });
  }, []);

  function handleNewAssessment() {
    if (!sessionStorage.getItem("ayurv_disclaimer")) {
      sessionStorage.setItem(
        "ayurv_disclaimer",
        JSON.stringify({ accepted: true, timestamp: new Date().toISOString(), version: "v1.0" })
      );
    }
    router.push("/intake");
  }

  function handleClearProfile() {
    if (!window.confirm("Clear your saved health profile? You'll need to re-enter it next time.")) return;
    const uid = getOrCreateUid();
    fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        age: null,
        sex: null,
        pregnancy_status: null,
        chronic_conditions: [],
        medications: [],
        current_herbs: "",
      }),
    }).then(() => setProfile(null));
  }

  function handleClearAll() {
    if (!window.confirm("Delete ALL your data? This removes your profile and resets your device ID. Cannot be undone.")) return;
    clearAllLocalData();
    setProfile(null);
    setEntries([]);
    router.push("/");
  }

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  function formatProfileField(val: string | null): string {
    if (!val) return "—";
    return val.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function exportCSV() {
    if (entries.length === 0) return;
    const headers = ["Date", "Concern", "Recommended", "Caution", "Avoid", "Total"];
    const rows = entries.map(e => [
      formatDate(e.date),
      e.concern_label || e.concern,
      String(e.recommended_count),
      String(e.caution_count),
      String(e.avoid_count),
      String(e.total),
    ]);
    // profile summary at top
    const profileRows: string[][] = [];
    if (profile) {
      profileRows.push(["Health Profile"]);
      profileRows.push(["Age", profile.age || "—"]);
      profileRows.push(["Sex", formatProfileField(profile.sex)]);
      profileRows.push(["Conditions", (profile.chronic_conditions || []).map(c => formatProfileField(c)).join("; ")]);
      profileRows.push(["Medications", (profile.medications || []).map(m => formatProfileField(m)).join("; ")]);
      profileRows.push([]);
    }
    const csvContent = [...profileRows, headers, ...rows]
      .map(row => row.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ayurv-health-journal-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]" role="status">
        <div className="animate-pulse text-gray-400 text-sm">Loading your data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ayurv-primary">My Assessments</h1>
          <p className="text-sm text-gray-500 mt-1">Your past herb safety checks. Securely stored.</p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="px-3.5 py-2 text-xs font-medium text-ayurv-primary border border-ayurv-primary/20 rounded-xl hover:bg-ayurv-primary hover:text-white transition-all"
        >
          Back to Home
        </button>
      </div>

      {/* Saved Profile Card */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Saved Health Profile</h2>
        {profile ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Age</p>
                  <p className="text-gray-800 font-medium">{profile.age || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Sex</p>
                  <p className="text-gray-800 font-medium">{formatProfileField(profile.sex)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Pregnancy Status</p>
                  <p className="text-gray-800 font-medium">{formatProfileField(profile.pregnancy_status)}</p>
                </div>
                {profile.chronic_conditions.length > 0 && (
                  <div className="col-span-2 sm:col-span-3">
                    <p className="text-xs text-gray-400 font-medium mb-1">Conditions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.chronic_conditions.map((c) => (
                        <span key={c} className="text-xs bg-risk-amber-light text-risk-amber px-2 py-0.5 rounded-full font-medium">
                          {formatProfileField(c)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.medications.length > 0 && (
                  <div className="col-span-2 sm:col-span-3">
                    <p className="text-xs text-gray-400 font-medium mb-1">Medications</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.medications.map((m) => (
                        <span key={m} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          {formatProfileField(m)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50/50">
              <p className="text-[11px] text-gray-400">
                Last updated: {formatDate(profile.updated_at)}
              </p>
              <button
                onClick={handleClearProfile}
                className="text-xs text-gray-400 hover:text-risk-red transition-colors"
              >
                Clear Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center">
            <p className="text-sm text-gray-500">No saved profile. Complete an assessment to auto-save.</p>
          </div>
        )}
      </section>

      {/* Assessment History */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Assessment History
          </h2>
          {entries.length > 0 && (
            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:text-ayurv-primary hover:border-ayurv-primary/20 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export CSV
            </button>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
            <div className="text-center">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-sm font-medium text-gray-600 mb-1">No assessments yet</p>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed max-w-sm mx-auto">
                Your completed herb safety assessments will appear here. Results are stored securely on your device.
              </p>
              <button
                onClick={() => {
                  if (!sessionStorage.getItem("ayurv_disclaimer")) {
                    sessionStorage.setItem(
                      "ayurv_disclaimer",
                      JSON.stringify({ accepted: true, timestamp: new Date().toISOString(), version: "v1.0" })
                    );
                  }
                  router.push("/intake");
                }}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-ayurv-primary rounded-xl hover:bg-ayurv-secondary transition-colors shadow-sm"
              >
                Start Your First Assessment
              </button>
            </div>
            <div className="mt-5 border-t border-gray-200 pt-4 text-center">
              <p className="text-xs text-gray-400 mb-2">Or explore herbs first</p>
              <Link
                href="/herbs"
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-ayurv-primary transition-colors"
              >
                Browse Herb Library
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm card-hover"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1">{formatDate(entry.date)}</p>
                    <p className="text-sm font-medium text-gray-800 mb-1.5">
                      {entry.concern_label || "Assessment"}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-1">
                      {entry.recommended_count > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-risk-green bg-risk-green-light px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-risk-green rounded-full" />
                          {entry.recommended_count} recommended
                        </span>
                      )}
                      {entry.caution_count > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-risk-amber bg-risk-amber-light px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-risk-amber rounded-full" />
                          {entry.caution_count} caution
                        </span>
                      )}
                      {entry.avoid_count > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-risk-red bg-risk-red-light px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-risk-red rounded-full" />
                          {entry.avoid_count} avoid
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{entry.total} herbs with evidence</p>
                  </div>
                  <button
                    onClick={handleNewAssessment}
                    className="px-3 py-1.5 text-xs font-medium text-ayurv-primary border border-ayurv-primary/20 rounded-lg hover:bg-ayurv-primary hover:text-white transition-all shrink-0"
                  >
                    Re-assess
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Data Management */}
      <section className="border-t border-gray-200 pt-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Data Management</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-gray-700 font-medium">Your data is stored securely</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Your health profile is stored encrypted on our servers. Assessment history is linked to an anonymous
                ID — we never collect your name, email, or any personally identifiable information. Your device
                only stores a random ID.
              </p>
              <button
                onClick={handleClearAll}
                className="mt-3 px-4 py-2 text-xs font-medium text-risk-red border border-risk-red/20 rounded-lg hover:bg-risk-red hover:text-white transition-all"
              >
                Delete All My Data
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
