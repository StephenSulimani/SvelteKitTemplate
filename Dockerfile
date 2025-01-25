# Build stage
FROM oven/bun:1 AS sk-build
WORKDIR /usr/src/app

ARG TZ=America/New_York

# Copy the source code into the build container
COPY . /usr/src/app

# Set the timezone (optional)
RUN cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install dependencies
RUN bun install

RUN bunx prisma migrate deploy

# Build the project
RUN bun --bun run build

# Final stage
FROM oven/bun:1
WORKDIR /usr/src/app

ARG TZ=America/New_York

# Copy the source code into the final container
COPY . /usr/src/app

# Set the timezone (optional)
RUN cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copy built files from the build stage
COPY --from=sk-build /usr/src/app/package.json /usr/src/app/package.json
COPY --from=sk-build /usr/src/app/build /usr/src/app/build

# Expose the application port
EXPOSE 3000

# Start the Bun web server (this will not run in the background, it will block as expected)
CMD ["bun", "/usr/src/app/build/index.js"]
