#!/bin/sh
bunx prisma generate deploy
bun /usr/src/app/build/index.js