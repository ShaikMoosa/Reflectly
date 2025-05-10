# Supabase Setup for Reflectly

This document outlines the steps needed to set up Supabase for the Reflectly application.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com) if you don't have one already
2. Create a new Supabase project
3. Save your Supabase URL and public anon key for later

## Environment Variables

Create a `.env.local` file in the root of your project and add the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Replace `your-supabase-url` and `your-supabase-anon-key` with the values from your Supabase project.

## Database Setup

There are two ways to set up the required database tables and policies:

### Option 1: Using the SQL Editor

1. Go to your Supabase dashboard
2. Click on the SQL Editor tab
3. Create a new query
4. Copy and paste the contents of the following files and run the queries in this order:
   - `supabase/migrations/20240601000000_whiteboard_setup.sql`
   - `supabase/schema.sql` (if not already applied)

### Option 2: Using Migrations (Recommended)

If you have the Supabase CLI installed, you can run migrations directly:

1. Install the Supabase CLI: [Instructions](https://supabase.com/docs/guides/cli)
2. Link your project: `supabase link --project-ref <your-project-ref>`
3. Run migrations: `supabase db push`

## Authentication Setup

This project uses Supabase Auth to authenticate users. Set up authentication:

1. Go to your Supabase dashboard
2. Click on the Authentication tab
3. Under "Providers", enable the authentication methods you want to use (Email, Google, GitHub, etc.)
4. For Email authentication, you may want to disable email confirmation for easier testing

## Testing Database Connection

To test if your connection to Supabase is working correctly:

1. Run the app: `npm run dev`
2. Sign in with one of the enabled authentication methods
3. Navigate to the whiteboard page
4. Draw something on the whiteboard
5. Check your Supabase database to see if data is being saved in the `whiteboard_data` table

## Database Structure

The project requires the following tables:

1. `projects` - Stores project information
2. `transcripts` - Stores transcript data linked to projects
3. `whiteboard_data` - Stores whiteboard drawings for each user
4. `kanban_board` - Stores kanban board data for each user

Each table has Row Level Security (RLS) policies configured to ensure users can only access their own data.

## Common Issues and Troubleshooting

### Data not saving to Supabase

- Check that your environment variables are correctly set
- Ensure the user is authenticated before attempting to save data
- Check the browser console for any errors
- Verify that the tables and RLS policies are correctly set up

### Authentication issues

- Make sure the authentication providers are enabled in Supabase
- Check that your redirect URLs are correctly configured
- For local development, use `localhost` URLs in your Supabase auth settings

### RLS Policy errors

- Ensure the RLS policies are correctly applied
- Test queries directly in the Supabase SQL editor to verify policies
- Remember that policies require the user to be authenticated via `auth.uid()` 