# 🔧 Troubleshooting Guide

## "Failed to Fetch" Error Solutions

### 1. **Check if Backend is Running**

**Step 1: Start the Spring Boot Backend**
```bash
# Option 1: Use the startup script
./start-backend.sh

# Option 2: Manual start
cd backend
mvn spring-boot:run
```

**Step 2: Verify Backend is Running**
- Open browser and go to: `http://localhost:8080/api/h2-console`
- You should see the H2 Database Console
- If you get "connection refused", the backend isn't running

### 2. **Check Port Conflicts**

**Check if port 8080 is already in use:**
```bash
# On macOS/Linux
lsof -i :8080

# On Windows
netstat -ano | findstr :8080
```

**If port 8080 is busy, change it in `backend/src/main/resources/application.yml`:**
```yaml
server:
  port: 8081  # Change to different port
```

### 3. **Java Version Issues**

**Check Java version:**
```bash
java -version
```

**Should be Java 17 or higher. If not:**
- Install Java 17+ from Oracle or OpenJDK
- Set JAVA_HOME environment variable

### 4. **Maven Issues**

**If Maven commands fail:**
```bash
# Install Maven if not installed
# On macOS with Homebrew
brew install maven

# On Ubuntu/Debian
sudo apt install maven

# On Windows
# Download from https://maven.apache.org/download.cgi
```

### 5. **Database Connection Issues**

**H2 Console Access:**
- URL: `http://localhost:8080/api/h2-console`
- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: `password`

### 6. **CORS Issues**

**If you see CORS errors in browser console:**
- Check that the backend is running on port 8080
- Verify CORS configuration in `SecurityConfig.java`
- Make sure React is running on port 3000

### 7. **Network Issues**

**Test backend connectivity:**
```bash
# Test if backend responds
curl http://localhost:8080/api/auth/validate

# Should return some response (even if error)
```

### 8. **React Frontend Issues**

**Clear browser cache and localStorage:**
```javascript
// Open browser console and run:
localStorage.clear();
```

**Check browser console for errors:**
- Open Developer Tools (F12)
- Look for network errors in Console tab
- Check Network tab for failed requests

### 9. **Common Error Messages**

**"Cannot connect to server"**
- Backend not running
- Wrong port number
- Firewall blocking connection

**"CORS error"**
- Backend CORS configuration issue
- Port mismatch between frontend/backend

**"Invalid credentials"**
- User doesn't exist in database
- Password doesn't match
- Database not initialized

### 10. **Quick Fixes**

**Restart everything:**
1. Stop React app (Ctrl+C)
2. Stop Spring Boot (Ctrl+C)
3. Clear browser cache
4. Start backend: `cd backend && mvn spring-boot:run`
5. Start frontend: `npm start`

**Reset database:**
- Stop backend
- Delete any database files
- Restart backend (will recreate database)

### 11. **Testing the Setup**

**Test 1: Backend Health**
```bash
curl -X GET http://localhost:8080/api/auth/validate
```

**Test 2: Registration**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@test.com","password":"Password123","confirmPassword":"Password123"}'
```

**Test 3: Login**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Password123"}'
```

### 12. **Still Having Issues?**

**Check logs:**
- Backend logs in terminal where you ran `mvn spring-boot:run`
- Browser console for JavaScript errors
- Network tab in browser DevTools

**Common solutions:**
1. Restart both applications
2. Clear browser cache
3. Check firewall settings
4. Verify Java and Maven installation
5. Try different ports if 8080 is busy

**Need help?**
- Check the terminal output for error messages
- Look at browser console for detailed error information
- Verify all dependencies are installed correctly
