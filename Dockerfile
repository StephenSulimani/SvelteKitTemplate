# Build stage
FROM oven/bun:1 AS sk-build
WORKDIR /usr/src/app
ARG TZ=America/New_York
# Copy the source code into the build container
COPY . /usr/src/app
# Set the timezone (optional)
RUN cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
# Install dependencies

# # Install NodeJS
# ENV NODE_VERSION=23.4.0
# RUN apt install -y curl
# RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/refs/heads/master/install.sh | bash
# ENV NVM_DIR=/root/.nvm
# RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
# RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
# RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
# ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
# RUN node --version
# RUN npm --version

RUN bun install

RUN bunx prisma generate --schema=src/prisma/schema.prisma

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
COPY --from=sk-build /usr/src/app/node_modules /usr/src/app/build/node_modules
# Expose the application port
RUN chmod +x start.sh

# Expose the application port
EXPOSE 3000

# Start the Bun web server (this will not run in the background, it will block as expected)
# CMD ["bun", "/usr/src/app/build/index.js"]
CMD ["./start.sh"]