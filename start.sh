#!/bin/sh
bunx prisma migrate deploy
bun /usr/src/app/build/index.js