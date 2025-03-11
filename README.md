# NextJS Typing Game

A typing game built with Next.js that helps users learn English while practicing their typing skills. The game provides real-time feedback, Japanese translations, and tracks user performance.

## Features

- Real-time typing feedback with color-coded characters
- Japanese translations for English words
- User authentication with Clerk
- Performance tracking and statistics
- Leaderboard system
- Personal dashboard with performance graphs
- Mobile-responsive design

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- Clerk Authentication
- Supabase Database
- Yamada UI Components
- Recharts for data visualization
- NextUI Components

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd nextjs-typing-game
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
nextjs-typing-game/
├── src/
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   └── lib/         # Utility functions and configurations
├── public/          # Static assets
└── ...config files
```

## Features in Detail

### Game Component

- Real-time character validation
- Word-by-word progress tracking
- Japanese translations with furigana support
- Performance statistics after completion

### Dashboard

- Personal performance tracking
- Progress graphs
- Word history with accuracy metrics
- Searchable word list with sorting capabilities

### Authentication

- Secure user authentication with Clerk
- Protected routes
- User profile management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Clerk](https://clerk.dev/) for authentication
- [Supabase](https://supabase.com/) for database services
- [Yamada UI](https://yamada-ui.com/) for UI components
