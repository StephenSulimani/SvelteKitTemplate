#!/bin/sh
cd /usr/src/app/build && bunx prisma generate || exit 1
bun /usr/src/app/build/index.js