# Movie Club Web Application

A web application for managing movie clubs where friends take turns selecting movies, rating them, and tracking favorites over time.

## Features

### Core Features

- **Authentication & User Management**
  - Secure user registration and login using NextAuth.js
  - Password-based authentication with bcrypt hashing
  - Session management with JWT

- **Group Management**
  - Create movie club groups
  - Join groups via unique join codes
  - Commissioner role with special permissions
  - Member rotation system

- **Commissioner Controls**
  - Set announcement day (Monday-Sunday)
  - Configure movie duration (weekly, bi-weekly, monthly)
  - Shuffle member order randomly
  - Skip member turns
  - Remove members from group

- **Movie Selection**
  - Search movies using TMDB API
  - Lock in movie selections
  - Movies hidden until announcement day
  - Turn-based rotation system

- **Rating & Review System**
  - Rate movies from 0.5 to 5.0 stars (half stars supported)
  - Write optional text reviews
  - Ratings hidden until rating period ends
  - Automatic reveal at end of period
  - Edit or delete your own ratings

- **Movie Details**
  - Display comprehensive movie information from TMDB
  - Show movie posters and backdrops
  - View group average ratings
  - Track movie status (locked, published, rating period, completed)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (via Vercel Postgres)
- **ORM:** Prisma
- **Authentication:** NextAuth.js v5
- **UI Components:** Shadcn UI + Tailwind CSS
- **Movie Data:** TMDB API
- **Hosting:** Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or Vercel Postgres)
- TMDB API key ([Get one here](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Vex-Cinema-Clubs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -base64 32

   # TMDB API
   TMDB_API_KEY="your-tmdb-api-key-here"
   TMDB_API_BASE_URL="https://api.themoviedb.org/3"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses the following main models:

- **User** - User accounts with authentication
- **Account** - OAuth accounts (NextAuth)
- **Session** - User sessions (NextAuth)
- **Group** - Movie club groups
- **GroupMember** - Group membership with roles and rotation order
- **GroupSettings** - Group configuration (announcement day, duration, etc.)
- **Movie** - Selected movies with status tracking
- **Rating** - User ratings and reviews for movies

## Deployment

### Vercel Deployment

1. Push your code to GitHub

2. Import your repository on [Vercel](https://vercel.com)

3. Configure environment variables in Vercel dashboard

4. Deploy!

### Database Setup on Vercel

1. Create a Vercel Postgres database
2. Copy the database URL to your environment variables
3. Run migrations:
   ```bash
   npx prisma db push
   ```

## Usage Guide

### For Commissioners

1. **Create a Group**
   - Navigate to Dashboard
   - Click "Create Group"
   - Enter group name

2. **Share Join Code**
   - Go to your group page
   - Copy the join code
   - Share with friends

3. **Configure Settings**
   - Set announcement day
   - Choose movie duration
   - Shuffle member order if needed

4. **Manage Members**
   - Skip turns for inactive members
   - Remove members if necessary

### For Members

1. **Join a Group**
   - Click "Join Group" from dashboard
   - Enter the join code provided by commissioner

2. **Select Your Movie** (When it's your turn)
   - Navigate to your group
   - Click "Select Movie"
   - Search for a movie
   - Lock in your selection

3. **Rate Movies**
   - View published movies
   - Click on a movie
   - Submit your rating and review

## API Routes

- `POST /api/auth/register` - User registration
- `POST /api/groups/create` - Create a group
- `POST /api/groups/join` - Join a group
- `PATCH /api/groups/[groupId]/settings` - Update group settings
- `POST /api/groups/[groupId]/shuffle` - Shuffle member order
- `DELETE /api/groups/[groupId]/members/[memberId]` - Remove member
- `PATCH /api/groups/[groupId]/members/[memberId]/skip` - Skip member turn
- `POST /api/groups/[groupId]/select-movie` - Select a movie
- `GET /api/tmdb/search` - Search movies
- `POST /api/groups/[groupId]/movies/[movieId]/rate` - Submit rating
- `DELETE /api/groups/[groupId]/movies/[movieId]/rate` - Delete rating

## Future Enhancements

- Automatic movie publishing on announcement day
- Automatic rating reveal at end of period
- Automatic rotation advancement
- Year-end archives and favorites
- Movie of the year tracking
- Email notifications
- Watch provider integration
- Movie suggestions based on group preferences

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
