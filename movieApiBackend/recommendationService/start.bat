@echo off
echo 🎯 Starting Movie Recommendation Microservice...
echo.
echo 📍 Port: 5000
echo 🔗 Health Check: http://localhost:5000/health
echo 📝 Endpoint: POST http://localhost:5000/get-recommendations
echo.
echo Press Ctrl+C to stop the service
echo.

npm start
