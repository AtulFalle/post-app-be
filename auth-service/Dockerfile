FROM node:20-alpine

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Install global dependencies (if any)
RUN npm install -g @nestjs/cli

# Step 4: Copy package.json and package-lock.json (or yarn.lock) to install dependencies
COPY package*.json ./
COPY .env .env

# Step 5: Install project dependencies
RUN npm install --force

# Step 6: Copy the rest of the application code
COPY . .


# Step 7: Build the app
RUN npm run build

RUN npm run prisma:generate


# Step 8: Expose the port that the app will run on
EXPOSE 3003
EXPOSE 3004

# Step 9: Start the app
CMD ["npm", "run", "start"]