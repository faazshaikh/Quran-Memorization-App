#!/bin/bash

echo "🚀 Starting Express.js Backend..."
echo "📁 Navigating to backend-express directory..."

cd backend-express

echo "📦 Installing dependencies..."
npm install

echo "🌱 Starting Express server..."
echo "📍 Backend will be available at: http://localhost:8080"
echo "🗄️ Database: SQLite (quran_memorization.db)"
echo ""
echo "Press Ctrl+C to stop the backend"
echo ""

npm start

