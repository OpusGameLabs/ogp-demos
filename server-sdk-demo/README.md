# Server SDK Demo

A monorepo demo showcasing the Open Game Protocol (OGP) Server SDK with a game creation interface and backend server.

## Prerequisites

- Node.js >= 18
- npm 10.9.2 or higher

## Project Structure

This is a Turborepo monorepo containing:

- **apps/game-creator** - Next.js frontend for creating games
- **apps/server** - Express backend server using the OGP Server SDK
- **packages/** - Shared configuration and UI components

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

#### Backend Server (`apps/server/.env`)

Copy the example file and fill in your credentials:

```bash
cp apps/server/.env.example apps/server/.env
```

Required variables:
- `OGP_API_KEY` - Your OGP API key
- `OGP_SECRET_KEY` - Your OGP secret key
- `AWS_ACCESS_KEY_ID` - AWS access key for S3
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for S3
- `AWS_S3_BUCKET` - S3 bucket name

#### Frontend (`apps/game-creator/.env.local`)

```bash
cp apps/game-creator/.env.example apps/game-creator/.env.local
```

The default configuration points to `http://localhost:3001` for the backend API.

### 3. Run Development Servers

Start both the backend server and frontend in development mode:

```bash
npm run dev
```

This will start:
- Backend server at `http://localhost:3001`
- Frontend at `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to `http://localhost:3000` to access the game creator interface.

## Available Scripts

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps for production
- `npm run lint` - Lint all apps
- `npm run check-types` - Type check all TypeScript code

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Express, TypeScript, better-sqlite3
- **OGP Integration**: @opusgamelabs/server-sdk
- **Build Tool**: Turborepo
- **Storage**: AWS S3, SQLite

## Learn More

- [Open Game Protocol Documentation](https://docs.opengameprotocol.com)
- [Turborepo Documentation](https://turbo.build/repo/docs)
