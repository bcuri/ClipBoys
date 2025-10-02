# ClipBoy - Top 5 Video Compilation App

ClipBoy is a Whop app that allows content creators to easily create professional "Top 5" compilation videos by uploading 5 video clips and selecting from various templates.

## Features

- 🎬 **Drag & Drop Upload**: Easy video file upload with validation
- 🎨 **Multiple Templates**: Various "Top 5" video templates (Gaming Fails, Funny Moments, Epic Plays, etc.)
- 💳 **Credit System**: Pay-per-use model with free credits
- 🔄 **Real-time Processing**: Background video processing with status updates
- 📊 **Dashboard**: Track projects and manage credits
- 🎵 **Template Customization**: Different intros, outros, transitions, and music

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Whop SDK
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Whop user authentication
- **Payments**: Whop payment processing
- **File Storage**: Cloud storage (configurable)

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Whop Configuration
WHOP_API_KEY=your_whop_api_key
NEXT_PUBLIC_WHOP_APP_ID=your_whop_app_id
NEXT_PUBLIC_WHOP_AGENT_USER_ID=your_agent_user_id
NEXT_PUBLIC_WHOP_COMPANY_ID=your_company_id
WHOP_WEBHOOK_SECRET=your_webhook_secret

# Database
DATABASE_URL=your_postgresql_connection_string

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Whop App Configuration

1. Create a Whop App on your [whop developer dashboard](https://whop.com/dashboard/developer/)
2. Set the following paths in the "Hosting" section:
   - **Base URL**: Your deployment domain
   - **App path**: `/experiences/[experienceId]`
   - **Dashboard path**: `/dashboard/[companyId]`
   - **Discover path**: `/discover`

### 3. Database Setup

```bash
# Install dependencies
pnpm install

# Generate database migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed default templates
pnpm db:seed
```

### 4. Development

```bash
# Start development server
pnpm dev
```

5. Go to a whop created in the same org as your app and add your app in the tools section.

## Database Schema

### Tables

- **projects**: Main project records
- **clips**: Individual video clips for each project
- **templates**: Available video templates
- **purchases**: Payment tracking
- **user_usage**: Credit system and usage limits

## API Endpoints

- `POST /api/upload` - Upload video files
- `POST /api/projects` - Create new project
- `GET /api/projects` - Get user projects
- `GET /api/templates` - Get available templates
- `POST /api/process` - Trigger video processing
- `POST /api/webhooks` - Handle Whop webhooks

## Video Processing

The app includes a basic video processing pipeline that can be extended with:

- FFmpeg integration for video compilation
- Cloud storage for file management
- Queue system for background processing
- Real-time progress updates

## Deployment

1. Upload your code to GitHub
2. Go to [Vercel](https://vercel.com/new) and link the repository
3. Deploy with the environment variables from your `.env.local`
4. Update your "Base Domain" and webhook callback URLs in the Whop dashboard

## Troubleshooting

**App not loading properly?** Make sure to set the "App path" in your Whop developer dashboard to `/experiences/[experienceId]`

**Database issues?** Ensure your `DATABASE_URL` is correctly set and the database is accessible

**Webhook issues?** Verify your `WHOP_WEBHOOK_SECRET` matches the one in your Whop dashboard

For more info, see the [Whop Documentation](https://dev.whop.com/introduction)