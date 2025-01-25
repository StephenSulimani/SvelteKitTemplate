#!/bin/sh
cd /usr/src/app/build && bunx prisma generate || exit 1
cd /usr/src/app/build && bun i -D prisma
bun /usr/src/app/build/index.js