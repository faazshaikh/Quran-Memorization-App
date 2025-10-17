#!/bin/bash

echo "🚀 Starting Spring Boot Backend..."
echo "📁 Navigating to backend directory..."

cd backend

echo "🔧 Installing Maven dependencies..."
mvn clean install -DskipTests

echo "🌱 Starting Spring Boot application..."
echo "📍 Backend will be available at: http://localhost:8080"
echo "🗄️ H2 Database Console: http://localhost:8080/api/h2-console"
echo ""
echo "Press Ctrl+C to stop the backend"
echo ""

mvn spring-boot:run

