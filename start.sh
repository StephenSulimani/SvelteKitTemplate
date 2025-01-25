#!/bin/sh
cd /usr/src/app/build && bun i -D prisma
bun /usr/src/app/build/index.js