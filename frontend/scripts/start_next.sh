#!/bin/bash
cd "$(dirname "$0")/.." || exit 1
PORT=3000 npm run start > /tmp/next-start.log 2>&1 &
echo $! > /tmp/next-start.pid
sleep 0.3
echo started $(cat /tmp/next-start.pid)
