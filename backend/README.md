# Quran Memorization App - Backend

Spring Boot REST API backend for the Quran Memorization application.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👤 **User Management** - Registration and login with validation
- 🗄️ **H2 Database** - In-memory database for development
- 🔒 **Password Encryption** - BCrypt password hashing
- 🌐 **CORS Support** - Cross-origin requests for React frontend
- ✅ **Input Validation** - Comprehensive form validation

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security**
- **Spring Data JPA**
- **H2 Database**
- **JWT (JSON Web Tokens)**
- **Maven**

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/validate` - Token validation

### Database Console
- `http://localhost:8080/api/h2-console` - H2 Database Console

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6 or higher

### Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   mvn clean install
   ```

3. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

4. **Access the application:**
   - API Base URL: `http://localhost:8080/api`
   - H2 Console: `http://localhost:8080/api/h2-console`

## API Usage

### Login Request
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Register Request
```json
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

### Response Format
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "fullName": "John Doe"
}
```

## Database Schema

### Users Table
- `id` - Primary key
- `first_name` - User's first name
- `last_name` - User's last name
- `email` - User's email (unique)
- `password` - Encrypted password
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp
- `is_active` - Account status

## Security Features

- **Password Encryption**: BCrypt hashing
- **JWT Tokens**: Secure authentication
- **CORS Configuration**: React frontend support
- **Input Validation**: Comprehensive form validation
- **SQL Injection Protection**: JPA/Hibernate security

## Development

### Running Tests
```bash
mvn test
```

### Building for Production
```bash
mvn clean package
```

### Database Console Access
1. Go to `http://localhost:8080/api/h2-console`
2. Use these credentials:
   - JDBC URL: `jdbc:h2:mem:testdb`
   - Username: `sa`
   - Password: `password`

## Configuration

### Application Properties
- **Server Port**: 8080
- **Database**: H2 In-Memory
- **JWT Secret**: Configured in application.yml
- **CORS**: Enabled for React frontend

### Environment Variables
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRATION` - Token expiration time

## Troubleshooting

### Common Issues
1. **Port 8080 already in use**: Change server port in application.yml
2. **CORS errors**: Ensure CORS configuration is correct
3. **Database connection**: Check H2 console access

### Logs
- Application logs: Console output
- Debug logs: Set logging level in application.yml

