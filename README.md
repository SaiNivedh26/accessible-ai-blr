# Sign Language Extension Landing Page

This is the landing page and web application for the Sign Language Extension project, which converts digital content into sign language videos.

## Features

- User authentication with Supabase
- Profile management
- Content conversion to sign language
- History tracking
- Saved translations
- Dark mode support
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- A Supabase account

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/SignLanguageExtension-Landing.git
cd SignLanguageExtension-Landing
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Database Setup

1. Create a new Supabase project

2. Initialize the database schema:
   - Go to the SQL editor in your Supabase dashboard
   - Copy the contents of `supabase/migrations/00-init.sql`
   - Run the SQL script to create the necessary tables and set up Row Level Security

### Development

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/src/app/*` - Pages and routing
- `/src/components/*` - Reusable components
- `/src/contexts/*` - React context providers
- `/src/lib/*` - Utilities and configuration
- `/src/types/*` - TypeScript type definitions
- `/supabase/*` - Database migrations and schema

## Database Schema

### Profiles
- Stores user profile information
- Created automatically when a user signs up
- RLS enabled to allow users to only update their own profile

### Conversions
- Tracks content conversion requests
- Stores input text and output video URL
- RLS enabled to allow users to only see their own conversions

### Saved Translations
- Allows users to save and organize their translations
- Links to conversions for reference
- RLS enabled to allow users to only see their own saved translations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
