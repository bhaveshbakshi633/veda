#!/usr/bin/env python3
"""
Ayurv Control Panel — server-side management GUI
Handles: Dev server, Supabase, Ollama, Git, Vercel deploy
"""

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import subprocess
import threading
import os
import signal
import json
from pathlib import Path
from datetime import datetime

# project root
PROJECT_DIR = Path(__file__).resolve().parent.parent
os.chdir(PROJECT_DIR)

# ── process tracking ──
processes: dict[str, subprocess.Popen] = {}


def run_cmd(cmd: str, timeout: int = 15) -> tuple[str, bool]:
    """Run a shell command, return (output, success)."""
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True,
            timeout=timeout, cwd=PROJECT_DIR
        )
        output = (result.stdout + result.stderr).strip()
        return output, result.returncode == 0
    except subprocess.TimeoutExpired:
        return "Timeout", False
    except Exception as e:
        return str(e), False


class AyurvPanel(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Ayurv Control Panel")
        self.geometry("780x680")
        self.configure(bg="#f8faf8")
        self.resizable(True, True)

        # style
        style = ttk.Style(self)
        style.theme_use("clam")
        style.configure("TFrame", background="#f8faf8")
        style.configure("TLabelframe", background="#f8faf8", font=("Inter", 10, "bold"))
        style.configure("TLabelframe.Label", background="#f8faf8", foreground="#2d6a4f")
        style.configure("TLabel", background="#f8faf8", font=("Inter", 9))
        style.configure("TButton", font=("Inter", 9), padding=6)
        style.configure("Status.TLabel", font=("Inter", 9, "bold"))

        # green theme buttons
        style.configure("Green.TButton", foreground="white", background="#2d6a4f")
        style.map("Green.TButton", background=[("active", "#1b4332")])
        style.configure("Red.TButton", foreground="white", background="#d32f2f")
        style.map("Red.TButton", background=[("active", "#b71c1c")])
        style.configure("Blue.TButton", foreground="white", background="#1565c0")
        style.map("Blue.TButton", background=[("active", "#0d47a1")])

        # header
        header = tk.Frame(self, bg="#2d6a4f", height=50)
        header.pack(fill="x")
        header.pack_propagate(False)
        tk.Label(
            header, text="Ayurv Control Panel", font=("Inter", 14, "bold"),
            fg="white", bg="#2d6a4f"
        ).pack(side="left", padx=15)
        tk.Label(
            header, text=str(PROJECT_DIR), font=("Inter", 8),
            fg="#a7c4a0", bg="#2d6a4f"
        ).pack(side="right", padx=15)

        # main container with scroll
        main = ttk.Frame(self)
        main.pack(fill="both", expand=True, padx=10, pady=8)

        # ── top row: Dev Server + Supabase ──
        top_row = ttk.Frame(main)
        top_row.pack(fill="x", pady=(0, 6))

        self._build_dev_server(top_row)
        self._build_supabase(top_row)

        # ── mid row: Ollama + Git ──
        mid_row = ttk.Frame(main)
        mid_row.pack(fill="x", pady=(0, 6))

        self._build_ollama(mid_row)
        self._build_git(mid_row)

        # ── deploy row ──
        deploy_row = ttk.Frame(main)
        deploy_row.pack(fill="x", pady=(0, 6))

        self._build_deploy(deploy_row)
        self._build_quick_actions(deploy_row)

        # ── log area ──
        log_frame = ttk.LabelFrame(main, text="Logs")
        log_frame.pack(fill="both", expand=True, pady=(0, 4))

        self.log_area = scrolledtext.ScrolledText(
            log_frame, height=10, font=("Consolas", 9), bg="#1a1a2e",
            fg="#e0e0e0", insertbackground="white", wrap="word",
            borderwidth=0, highlightthickness=0
        )
        self.log_area.pack(fill="both", expand=True, padx=4, pady=4)

        # log tag colors
        self.log_area.tag_configure("info", foreground="#81c784")
        self.log_area.tag_configure("error", foreground="#ef5350")
        self.log_area.tag_configure("warn", foreground="#ffb74d")
        self.log_area.tag_configure("cmd", foreground="#64b5f6")
        self.log_area.tag_configure("dim", foreground="#666680")

        # initial status check
        self.log("Ayurv Control Panel started", "info")
        self.after(500, self.refresh_all_status)

        # cleanup on close
        self.protocol("WM_DELETE_WINDOW", self.on_close)

    # ── Dev Server Section ──
    def _build_dev_server(self, parent):
        frame = ttk.LabelFrame(parent, text="Dev Server (Next.js)")
        frame.pack(side="left", fill="both", expand=True, padx=(0, 4))

        row = ttk.Frame(frame)
        row.pack(fill="x", padx=8, pady=6)

        self.dev_status = ttk.Label(row, text="Unknown", style="Status.TLabel")
        self.dev_status.pack(side="left")

        ttk.Button(row, text="Stop", style="Red.TButton",
                   command=self.stop_dev).pack(side="right", padx=2)
        ttk.Button(row, text="Start", style="Green.TButton",
                   command=self.start_dev).pack(side="right", padx=2)
        ttk.Button(row, text="Check", command=self.check_dev).pack(side="right", padx=2)

    def check_dev(self):
        out, ok = run_cmd("lsof -i :3000 -t 2>/dev/null")
        if ok and out.strip():
            self.dev_status.config(text="Running (port 3000)", foreground="#2d6a4f")
            self.log(f"Dev server running — PID {out.strip()}", "info")
        else:
            self.dev_status.config(text="Stopped", foreground="#d32f2f")
            self.log("Dev server not running", "warn")

    def start_dev(self):
        if "dev" in processes and processes["dev"].poll() is None:
            self.log("Dev server already running", "warn")
            return
        self.log("Starting dev server...", "cmd")
        proc = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=PROJECT_DIR, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            text=True, preexec_fn=os.setsid
        )
        processes["dev"] = proc
        self.dev_status.config(text="Starting...", foreground="#f57c00")

        def stream_logs():
            for line in proc.stdout:
                self.log(line.rstrip(), "dim")
                if "Ready" in line or "ready" in line:
                    self.after(0, lambda: self.dev_status.config(
                        text="Running (port 3000)", foreground="#2d6a4f"
                    ))
            self.after(0, lambda: self.dev_status.config(text="Stopped", foreground="#d32f2f"))

        threading.Thread(target=stream_logs, daemon=True).start()

    def stop_dev(self):
        if "dev" in processes and processes["dev"].poll() is None:
            os.killpg(os.getpgid(processes["dev"].pid), signal.SIGTERM)
            self.log("Dev server stopped", "warn")
            self.dev_status.config(text="Stopped", foreground="#d32f2f")
        else:
            # kill any process on port 3000
            run_cmd("lsof -i :3000 -t | xargs -r kill")
            self.log("Killed process on port 3000", "warn")
            self.dev_status.config(text="Stopped", foreground="#d32f2f")

    # ── Supabase Section ──
    def _build_supabase(self, parent):
        frame = ttk.LabelFrame(parent, text="Supabase (Local)")
        frame.pack(side="left", fill="both", expand=True, padx=(4, 0))

        row = ttk.Frame(frame)
        row.pack(fill="x", padx=8, pady=6)

        self.supa_status = ttk.Label(row, text="Unknown", style="Status.TLabel")
        self.supa_status.pack(side="left")

        ttk.Button(row, text="Stop", style="Red.TButton",
                   command=self.stop_supabase).pack(side="right", padx=2)
        ttk.Button(row, text="Start", style="Green.TButton",
                   command=self.start_supabase).pack(side="right", padx=2)
        ttk.Button(row, text="Check", command=self.check_supabase).pack(side="right", padx=2)

    def check_supabase(self):
        self.log("Checking Supabase...", "cmd")
        def _check():
            out, ok = run_cmd("npx supabase status 2>&1", timeout=20)
            if ok and "API URL" in out:
                self.after(0, lambda: self.supa_status.config(
                    text="Running", foreground="#2d6a4f"
                ))
                self.log("Supabase is running", "info")
            else:
                # fallback: check docker
                out2, ok2 = run_cmd("docker ps --filter name=supabase --format '{{.Names}}' 2>/dev/null")
                if ok2 and out2.strip():
                    self.after(0, lambda: self.supa_status.config(
                        text="Running (Docker)", foreground="#2d6a4f"
                    ))
                    self.log(f"Supabase containers: {out2.strip()}", "info")
                else:
                    self.after(0, lambda: self.supa_status.config(
                        text="Stopped", foreground="#d32f2f"
                    ))
                    self.log("Supabase not running", "warn")
        threading.Thread(target=_check, daemon=True).start()

    def start_supabase(self):
        self.log("Starting Supabase (this takes ~30s)...", "cmd")
        self.supa_status.config(text="Starting...", foreground="#f57c00")
        def _start():
            out, ok = run_cmd("npx supabase start 2>&1", timeout=120)
            self.log(out[-500:] if len(out) > 500 else out, "info" if ok else "error")
            self.after(0, self.check_supabase)
        threading.Thread(target=_start, daemon=True).start()

    def stop_supabase(self):
        self.log("Stopping Supabase...", "cmd")
        self.supa_status.config(text="Stopping...", foreground="#f57c00")
        def _stop():
            out, ok = run_cmd("npx supabase stop 2>&1", timeout=60)
            self.log(out, "info" if ok else "error")
            self.after(0, lambda: self.supa_status.config(
                text="Stopped", foreground="#d32f2f"
            ))
        threading.Thread(target=_stop, daemon=True).start()

    # ── Ollama Section ──
    def _build_ollama(self, parent):
        frame = ttk.LabelFrame(parent, text="Ollama LLM")
        frame.pack(side="left", fill="both", expand=True, padx=(0, 4))

        row = ttk.Frame(frame)
        row.pack(fill="x", padx=8, pady=6)

        self.ollama_status = ttk.Label(row, text="Unknown", style="Status.TLabel")
        self.ollama_status.pack(side="left")

        ttk.Button(row, text="Restart", style="Blue.TButton",
                   command=self.restart_ollama).pack(side="right", padx=2)
        ttk.Button(row, text="Check", command=self.check_ollama).pack(side="right", padx=2)

        row2 = ttk.Frame(frame)
        row2.pack(fill="x", padx=8, pady=(0, 6))

        self.ollama_model = ttk.Label(row2, text="", style="Status.TLabel")
        self.ollama_model.pack(side="left")

    def check_ollama(self):
        def _check():
            out, ok = run_cmd("curl -s http://localhost:11434/api/tags 2>/dev/null", timeout=5)
            if ok and out.strip():
                try:
                    data = json.loads(out)
                    models = [m["name"] for m in data.get("models", [])]
                    model_str = ", ".join(models[:3]) if models else "no models"
                    self.after(0, lambda: (
                        self.ollama_status.config(text="Running", foreground="#2d6a4f"),
                        self.ollama_model.config(text=f"Models: {model_str}", foreground="#555")
                    ))
                    self.log(f"Ollama running — {model_str}", "info")
                except json.JSONDecodeError:
                    self.after(0, lambda: self.ollama_status.config(
                        text="Running (parse error)", foreground="#f57c00"
                    ))
            else:
                self.after(0, lambda: (
                    self.ollama_status.config(text="Not reachable", foreground="#d32f2f"),
                    self.ollama_model.config(text="")
                ))
                self.log("Ollama not reachable at localhost:11434", "error")
        threading.Thread(target=_check, daemon=True).start()

    def restart_ollama(self):
        self.log("Restarting Ollama...", "cmd")
        def _restart():
            run_cmd("systemctl --user restart ollama 2>/dev/null || ollama serve &", timeout=10)
            import time; time.sleep(3)
            self.after(0, self.check_ollama)
        threading.Thread(target=_restart, daemon=True).start()

    # ── Git Section ──
    def _build_git(self, parent):
        frame = ttk.LabelFrame(parent, text="Git")
        frame.pack(side="left", fill="both", expand=True, padx=(4, 0))

        row = ttk.Frame(frame)
        row.pack(fill="x", padx=8, pady=6)

        self.git_status = ttk.Label(row, text="", style="Status.TLabel")
        self.git_status.pack(side="left")

        ttk.Button(row, text="Status", command=self.check_git).pack(side="right", padx=2)

        row2 = ttk.Frame(frame)
        row2.pack(fill="x", padx=8, pady=(0, 6))

        self.git_branch = ttk.Label(row2, text="", foreground="#555")
        self.git_branch.pack(side="left")

    def check_git(self):
        def _check():
            branch, _ = run_cmd("git branch --show-current")
            status, _ = run_cmd("git status --short")
            ahead, _ = run_cmd("git rev-list --count @{u}..HEAD 2>/dev/null")

            changes = len(status.strip().split("\n")) if status.strip() else 0
            ahead_n = ahead.strip() if ahead.strip().isdigit() else "0"

            status_text = f"{changes} changes" if changes > 0 else "Clean"
            if int(ahead_n) > 0:
                status_text += f", {ahead_n} unpushed"

            self.after(0, lambda: (
                self.git_branch.config(text=f"Branch: {branch.strip()}"),
                self.git_status.config(
                    text=status_text,
                    foreground="#2d6a4f" if changes == 0 else "#f57c00"
                )
            ))
            self.log(f"Git: {branch.strip()} — {status_text}", "info")
            if status.strip():
                self.log(status.strip(), "dim")
        threading.Thread(target=_check, daemon=True).start()

    # ── Deploy Section ──
    def _build_deploy(self, parent):
        frame = ttk.LabelFrame(parent, text="Deploy (Vercel)")
        frame.pack(side="left", fill="both", expand=True, padx=(0, 4))

        row = ttk.Frame(frame)
        row.pack(fill="x", padx=8, pady=6)

        self.deploy_status = ttk.Label(row, text="", style="Status.TLabel")
        self.deploy_status.pack(side="left")

        ttk.Button(row, text="Push & Deploy", style="Green.TButton",
                   command=self.deploy).pack(side="right", padx=2)
        ttk.Button(row, text="Build", style="Blue.TButton",
                   command=self.build).pack(side="right", padx=2)

    def build(self):
        self.log("Running npm build...", "cmd")
        self.deploy_status.config(text="Building...", foreground="#f57c00")
        def _build():
            out, ok = run_cmd("npm run build 2>&1", timeout=180)
            # show last 15 lines
            lines = out.strip().split("\n")
            for line in lines[-15:]:
                tag = "info" if ok else "error"
                self.log(line, tag)
            self.after(0, lambda: self.deploy_status.config(
                text="Build OK" if ok else "Build FAILED",
                foreground="#2d6a4f" if ok else "#d32f2f"
            ))
        threading.Thread(target=_build, daemon=True).start()

    def deploy(self):
        # confirm first
        if not messagebox.askyesno("Deploy", "Push to remote and trigger Vercel deploy?"):
            return
        self.log("Pushing to remote...", "cmd")
        self.deploy_status.config(text="Pushing...", foreground="#f57c00")
        def _deploy():
            out, ok = run_cmd("git push origin HEAD 2>&1", timeout=30)
            self.log(out, "info" if ok else "error")
            self.after(0, lambda: self.deploy_status.config(
                text="Pushed — deploying on Vercel" if ok else "Push failed",
                foreground="#2d6a4f" if ok else "#d32f2f"
            ))
        threading.Thread(target=_deploy, daemon=True).start()

    # ── Quick Actions ──
    def _build_quick_actions(self, parent):
        frame = ttk.LabelFrame(parent, text="Quick Actions")
        frame.pack(side="left", fill="both", expand=True, padx=(4, 0))

        row = ttk.Frame(frame)
        row.pack(fill="x", padx=8, pady=6)

        ttk.Button(row, text="Refresh All", command=self.refresh_all_status).pack(side="left", padx=2)
        ttk.Button(row, text="Clear Logs", command=self.clear_logs).pack(side="left", padx=2)
        ttk.Button(row, text="Open Site", command=self.open_site).pack(side="left", padx=2)
        ttk.Button(row, text="DB Studio", command=self.open_studio).pack(side="left", padx=2)

    def open_site(self):
        run_cmd("xdg-open https://webapp-self-rho.vercel.app 2>/dev/null &")
        self.log("Opening site in browser", "info")

    def open_studio(self):
        run_cmd("xdg-open http://127.0.0.1:54323 2>/dev/null &")
        self.log("Opening Supabase Studio", "info")

    # ── Utilities ──
    def refresh_all_status(self):
        self.log("Refreshing all status...", "cmd")
        self.check_dev()
        self.check_supabase()
        self.check_ollama()
        self.check_git()

    def log(self, msg: str, tag: str = "info"):
        ts = datetime.now().strftime("%H:%M:%S")
        self.log_area.insert("end", f"[{ts}] ", "dim")
        self.log_area.insert("end", f"{msg}\n", tag)
        self.log_area.see("end")

    def clear_logs(self):
        self.log_area.delete("1.0", "end")

    def on_close(self):
        # kill dev server if we started it
        if "dev" in processes and processes["dev"].poll() is None:
            if messagebox.askyesno("Exit", "Dev server is running. Stop it before closing?"):
                self.stop_dev()
        self.destroy()


if __name__ == "__main__":
    app = AyurvPanel()
    app.mainloop()
