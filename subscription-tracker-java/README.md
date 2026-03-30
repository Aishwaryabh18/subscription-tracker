# Subscription Tracker Java (Spring Boot)

Spring Boot migration of the Node.js backend from `backend/`.

## Features
- Auth APIs: register/login/me/update/change-password
- Subscription APIs: CRUD + stats summary
- JWT-protected routes with `Authorization: Bearer <token>`
- MongoDB persistence
- Daily reminder scheduler (9:00 AM server time) + email notifications
- CORS aligned with frontend URLs from the Node.js app

## Run
```bash
cd subscription-tracker-java
mvn spring-boot:run
```

## Required environment variables
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRE_SECONDS` (optional, default 604800)
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `PORT` (optional, default 5000)

## API base
- `http://localhost:5000`
- Auth: `/api/auth/*`
- Subscriptions: `/api/subscriptions/*`
