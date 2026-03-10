#!/bin/bash
# ayurv.sh — quick start/stop for local dev server

PORT=3000
APP_DIR="$(cd "$(dirname "$0")" && pwd)"

case "$1" in
  start)
    cd "$APP_DIR"
    # check if already running
    if curl -s --max-time 2 http://localhost:$PORT >/dev/null 2>&1; then
      echo "Server already running on port $PORT"
      exit 0
    fi
    echo "Starting Ayurv dev server on http://localhost:$PORT ..."
    nohup npm run dev > /tmp/ayurv-dev.log 2>&1 &
    echo $! > /tmp/ayurv-dev.pid
    # wait for server to be ready (up to 15 seconds)
    for i in $(seq 1 15); do
      if curl -s --max-time 1 http://localhost:$PORT >/dev/null 2>&1; then
        echo "Server started! http://localhost:$PORT"
        echo "Logs: tail -f /tmp/ayurv-dev.log"
        exit 0
      fi
      sleep 1
    done
    echo "Server process started but not responding yet. Check: tail -f /tmp/ayurv-dev.log"
    ;;

  stop)
    if [ -f /tmp/ayurv-dev.pid ]; then
      PID=$(cat /tmp/ayurv-dev.pid)
      kill $PID 2>/dev/null
      # also kill any child node processes on the port
      lsof -i :$PORT -sTCP:LISTEN -t 2>/dev/null | xargs -r kill 2>/dev/null
      rm -f /tmp/ayurv-dev.pid
      echo "Server stopped."
    else
      # fallback: kill anything on the port
      PIDS=$(lsof -i :$PORT -sTCP:LISTEN -t 2>/dev/null)
      if [ -n "$PIDS" ]; then
        echo "$PIDS" | xargs kill 2>/dev/null
        echo "Server stopped."
      else
        echo "No server running on port $PORT"
      fi
    fi
    ;;

  status)
    if curl -s --max-time 2 http://localhost:$PORT >/dev/null 2>&1; then
      echo "Server RUNNING on http://localhost:$PORT"
    else
      echo "Server NOT running"
    fi
    ;;

  logs)
    tail -f /tmp/ayurv-dev.log
    ;;

  voice-start)
    cd "$APP_DIR"
    if curl -s --max-time 2 http://localhost:8100/health >/dev/null 2>&1; then
      echo "Voice service already running on port 8100"
      exit 0
    fi
    echo "Starting voice service on port 8100..."
    nohup python3 "$APP_DIR/services/voice/server.py" > /tmp/ayurv-voice.log 2>&1 &
    echo $! > /tmp/ayurv-voice.pid
    for i in $(seq 1 10); do
      if curl -s --max-time 1 http://localhost:8100/health >/dev/null 2>&1; then
        echo "Voice service started! http://localhost:8100"
        exit 0
      fi
      sleep 1
    done
    echo "Voice service starting... Check: tail -f /tmp/ayurv-voice.log"
    ;;

  voice-stop)
    if [ -f /tmp/ayurv-voice.pid ]; then
      kill $(cat /tmp/ayurv-voice.pid) 2>/dev/null
      rm -f /tmp/ayurv-voice.pid
      echo "Voice service stopped."
    else
      pkill -f "services/voice/server.py" 2>/dev/null
      echo "Voice service stopped."
    fi
    ;;

  all)
    # start everything
    bash "$0" start
    bash "$0" voice-start
    ;;

  all-stop)
    bash "$0" stop
    bash "$0" voice-stop
    ;;

  deploy)
    cd "$APP_DIR"
    npx vercel --prod
    ;;

  *)
    echo "Usage: ayurv {start|stop|status|logs|deploy|voice-start|voice-stop|all|all-stop}"
    echo ""
    echo "  start       — Start dev server in background"
    echo "  stop        — Stop dev server"
    echo "  status      — Check if server is running"
    echo "  logs        — Tail server logs"
    echo "  voice-start — Start voice TTS service"
    echo "  voice-stop  — Stop voice TTS service"
    echo "  all         — Start everything (dev + voice)"
    echo "  all-stop    — Stop everything"
    echo "  deploy      — Deploy to Vercel (production)"
    ;;
esac
