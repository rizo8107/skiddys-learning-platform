# Skiddy's Learning Platform

A modern learning management system built with React, Vite, and PocketBase.

## Features

- User authentication and authorization
- Course management
- Lesson tracking
- Admin dashboard
- Settings management
- Responsive design

## Tech Stack

- Frontend:
  - React
  - Vite
  - TypeScript
  - Zustand (State Management)
  - React Query
  - React Hook Form

- Backend:
  - PocketBase

## Docker Deployment

The application can be deployed using Docker and Docker Compose.

### Prerequisites

- Docker
- Docker Compose
- Domain name pointed to your server

### Deployment Steps

1. Clone the repository:
```bash
git clone https://github.com/rizo8107/skiddys-learning-platform.git
cd skiddys-learning-platform
```

2. Build the frontend:
```bash
npm install
npm run build
```

3. Deploy using the deployment script:
```bash
chmod +x deploy-docker.sh
./deploy-docker.sh
```

The script will:
- Set up Docker on your server
- Deploy the application
- Configure SSL certificates

Your application will be available at:
- Frontend: https://skiddytamil.in
- PocketBase Admin: https://skiddytamil.in/_/

### Manual Deployment

If you prefer to deploy manually:

1. Copy the required files to your server:
```bash
docker-compose.yml
Dockerfile
nginx.conf
```

2. Start the containers:
```bash
docker-compose up -d
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Run PocketBase:
```bash
./pocketbase serve
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
