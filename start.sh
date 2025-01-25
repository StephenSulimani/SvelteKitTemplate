#!/bin/sh
bunx prisma migrate dev --name init
bun /usr/src/app/build/index.js