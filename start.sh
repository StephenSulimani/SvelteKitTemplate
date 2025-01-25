#!/bin/sh
bunx prisma migrate dev
bun /usr/src/app/build/index.js