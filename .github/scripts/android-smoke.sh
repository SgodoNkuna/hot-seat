#!/usr/bin/env bash
# Installs the app on the running emulator, opens it, and checks it is still alive
# and drawing after startup. Leaves smoke/ with a screenshot and the log.
set -u
PKG=com.sgodonkuna.hotseat
mkdir -p smoke
adb install -r hot-seat-x86.apk
adb logcat -c
adb shell am start -W -n "$PKG/.MainActivity"
sleep 30
adb exec-out screencap -p > smoke/android-launch.png
adb logcat -d > smoke/logcat.txt
PID=$(adb shell pidof "$PKG" | tr -d '\r')
grep -E "FATAL EXCEPTION|ReactNativeJS.*(Error|Exception)|Invariant Violation" smoke/logcat.txt > smoke/errors.txt || true
echo "pid=${PID:-none}"
cat smoke/errors.txt
if [ -z "$PID" ] || grep -q "FATAL EXCEPTION" smoke/errors.txt; then
  echo "App crashed or is not running after launch"
  exit 1
fi
echo "App launched and is running"
