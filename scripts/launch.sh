#!/bin/bash

# Minimal One-Shot Launch Script for OpenCopilotMoney/Badget

echo "🚀 Starting launch sequence..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Database Setup
echo "🗄️ Setting up database..."
npx prisma generate
npx prisma db push

# 3. Start Development Server
echo "⚡ Starting development server..."
npm run dev
