# Technical Context

## Technology Stack

### Frontend
- **Framework**: Next.js 14/15 with App Router
- **UI Library**: React 18
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API, Zustand
- **Authentication UI**: Clerk
- **Drag and Drop**: react-beautiful-dnd and @hello-pangea/dnd
- **Text Editor**: TipTap
- **Animation**: Framer Motion
- **Notifications**: Sonner
- **Drawing/Whiteboard**: Konva, React Konva, perfect-freehand
- **Flow Diagrams**: @xyflow/react

### Backend
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with Clerk integration
- **Storage**: Supabase Storage
- **Serverless Functions**: Supabase Edge Functions
- **API**: Next.js API routes + Supabase functions
- **Payment Processing**: Lemon Squeezy
- **Webhooks**: Clerk, Lemon Squeezy

### AI & ML
- **NLP**: OpenAI API (GPT-4)
- **Audio Processing**: OpenAI Whisper API
- **Context Management**: Custom implementation
- **Video Processing**: FFmpeg (WebAssembly via @ffmpeg packages)

### DevOps
- **Version Control**: Git
- **Deployment**: Standard Next.js deployment
- **Environment**: Windows development environment
- **Testing**: Jest, React Testing Library

## Development Setup

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account and CLI
- Clerk account
- OpenAI API key
- Lemon Squeezy account

### Environment Variables
Key environment variables include:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `LEMONSQUEEZY_API_KEY`
- `LEMONSQUEEZY_WEBHOOK_SECRET`
- `NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID`

### Local Development
The project includes several scripts for local development:
- `npm run dev`: Start the development server
- `npm run dev3010`: Start on port 3010
- `npm run dev-safe`: Start on port 3006
- `npm run dev-clean`: Start with PowerShell script
- `npm run build`: Build the production application
- `npm run start`: Start the production server
- `npm run test`: Run Jest tests
- `npm run test:watch`: Run tests in watch mode

Custom PowerShell scripts are also available for Windows users:
- `run-dev.ps1`: Start the development environment
- `start-dev.ps1`: Alternative development startup
- `simple-start.ps1`: Simplified startup process

## Technical Constraints

### Performance
- **API Limits**: OpenAI API rate limits
- **Storage**: Supabase storage quotas based on plan
- **Database**: Row limitations based on Supabase plan
- **Client-Side Performance**: Optimized React rendering with memo and useMemo
- **Chunk Loading**: Enhanced error handling for chunk loading errors
- **Local Storage**: Debounced localStorage operations to reduce writes
- **Usage Limits**: Free plan (5 transcriptions, 5 AI chats), Premium plan (50 transcriptions, 1000 AI chat sessions)

### Security
- **Authentication**: Secure user authentication via Clerk
- **Data Access**: Row Level Security (RLS) in Supabase
- **API Security**: Protection of OpenAI API key and other credentials
- **Webhook Security**: Verification of incoming webhooks
- **Environment Variables**: Careful management to prevent exposure of sensitive keys

### Scalability
- **Database Scaling**: Limited by Supabase plan
- **API Scaling**: Limited by OpenAI rate limits and pricing
- **Storage Scaling**: Limited by Supabase plan
- **Frontend Performance**: Optimized to handle larger datasets through memoization
- **Subscription Model**: Tiered plans with different usage limits

## Dependencies

### Core Dependencies
- `next`: Next.js framework (v14.1.3)
- `react`, `react-dom`: React library (v18.3.1)
- `@clerk/nextjs`: Clerk authentication
- `@supabase/supabase-js`: Supabase client
- `openai`: OpenAI API client (v4.94.0)
- `tailwindcss`: Utility-first CSS framework
- `@radix-ui/*`: UI primitive components
- `lucide-react`: Icon library
- `@tiptap/*`: Rich text editor
- `@ffmpeg/*`: WebAssembly-based video processing
- `framer-motion`: Animation library
- `zustand`: State management
- `uuid`: UUID generation
- `react-beautiful-dnd`, `@hello-pangea/dnd`: Drag and drop functionality
- `react-konva`: Canvas drawing
- `sonner`: Toast notifications

### Development Dependencies
- `typescript`: TypeScript language
- `eslint`: Code linting
- `jest`: Testing framework
- `@testing-library/react`: React component testing
- `tailwindcss-animate`: Animation utilities for Tailwind
- `@tailwindcss/typography`, `@tailwindcss/forms`: Tailwind plugins
- `cross-env`: Cross-environment variable setting

## Project Structure

The project follows a standard Next.js 15 structure with App Router:

- `/app`: Main application code
  - `/api`: API routes (transcribe, chat, projects, notes, subscriptions)
  - `/components`: Reusable UI components
  - `/models`: Data models and types
  - `/utils`: Utility functions and services
    - `/supabase`: Supabase client and server utilities
      - `/client.ts`: Singleton client for browser usage
      - `/server.ts`: Per-request client creation for server components
      - `/admin.ts`: Admin client with service role
  - `/styles`: Global styles
  - `/whiteboard`: Whiteboard feature components and logic
  - `/planner`: Planner feature components and state
  - `/landing`: Landing page components
  - `/account`: User account management

- `/public`: Static assets
- `/supabase`: Supabase configuration and migrations
- `/lib`: Shared libraries and utilities
- `/.cursor`: Cursor configuration and memory bank
- `/components`: Global UI components
- `/middleware.ts`: Authentication middleware for handling redirects

## Key Technical Implementation Patterns

### Authentication Flow
- **Client-Side Authentication**: Clerk for UI and session management
- **Server-Side Authentication**: Middleware for handling redirects
- **Data Security**: Supabase Row Level Security
- **SSO Flow**:
  1. User authenticates with Clerk OAuth provider
  2. Middleware intercepts callback URLs
  3. User is redirected to app after successful authentication

### Supabase Client Strategy
- **Client-Side**: Singleton pattern via `getSupabaseClient()`
  - Maintains a single client instance to prevent multiple GoTrueClient warnings
  - Handles appropriate session persistence and token refresh
- **Server-Side**: Per-request client creation via `createClient()`
  - Creates fresh client for each server component or server action
  - Disables session persistence to prevent SSR issues
  - Properly handles authentication context

### Server Action Pattern
- **Authentication Check**: Using `getUserIdOrThrow()` helper
- **Database Access**: Creating fresh Supabase client for each action
- **Error Handling**: Structured error handling with specific error messages
- **Cache Revalidation**: Using `revalidatePath()` after mutations

### Database Migration Organization
- **Naming Convention**: Timestamped migrations with descriptive names
- **Structure**: Organized by feature and dependency order
- **Version Control**: Tracked in the codebase with the application

## Performance Optimizations

### React Optimizations
- **Component Memoization**: React.memo for heavy components
- **Calculation Caching**: useMemo for expensive calculations
- **Function Stability**: useCallback for event handlers and callbacks
- **Render Optimization**: Custom comparison functions for memoized components
- **State Management**: Optimized state updates with function updaters
- **Drag and Drop**: Optimized drag and drop implementations

### Next.js Optimizations
- **Chunk Error Handling**: Implemented error recovery for chunk loading issues
- **Webpack Configuration**: Optimized chunk sizes and loading timeout in next.config.js
- **Console Logging**: Removed excessive console.log in production builds
- **Server Components**: Using server components where appropriate
- **Middleware Optimization**: Targeted middleware patterns to minimize overhead

### Browser Optimizations
- **LocalStorage**: Debounced writes to reduce performance impact
- **DOM Updates**: Minimized with memoization and careful state management
- **Event Handling**: Optimized with useCallback for stable references
- **Media Processing**: Client-side video/audio processing with WebAssembly

## Testing Approach

- **Unit Tests**: Component and function testing with Jest
- **Integration Tests**: API and data flow testing
- **Manual Testing**: UI and user flow validation
- **Performance Testing**: React DevTools Profiler for component rendering analysis

## Deployment Strategy

- Development: Local development environment
- Production: Standard Next.js deployment
- Database: Supabase hosted PostgreSQL 
- Authentication: Clerk hosted authentication services
- Payment Processing: Lemon Squeezy subscription management 

## Key Technical Implementation Details

### Authentication and Middleware

The application uses a targeted middleware approach to handle authentication redirects:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Handle SSO callback redirects
  if (request.nextUrl.pathname.includes('/sso-callback')) {
    return NextResponse.redirect(new URL('/app', request.url));
  }
  
  // All other routes continue normally
  return new NextResponse();
}

export const config = {
  matcher: ['/sign-in/sso-callback(.*)', '/sign-up/sso-callback(.*)'],
};
```

### Supabase Client Management

For client-side use, a singleton pattern prevents multiple instances:

```typescript
// app/utils/supabase/client.ts
let clientInstance: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (clientInstance) return clientInstance;
  
  clientInstance = createClient<Database>(
    supabaseUrl, 
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    }
  );
  
  return clientInstance;
}
```

For server-side use, a new client is created for each request:

```typescript
// app/utils/supabase/server.ts
export function createClient() {
  return createSupabaseClient<Database>(
    supabaseUrl, 
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
}
```

### Server Actions Pattern

Server actions follow a consistent pattern:

```typescript
// Example from app/planner/actions.ts
export const getPlannerData = async (): Promise<PlannerData> => {
  const userId = await getUserIdOrThrow(); // Get authenticated user
  const supabase = createClient(); // Create fresh client

  // Perform database operations
  const [columnsResult, tasksResult] = await Promise.all([
    supabase.from('planner_columns').select('*')
      .eq('user_id', userId).order('column_order'),
    supabase.from('planner_tasks').select('*')
      .eq('user_id', userId)
  ]);

  // Handle errors and transform data
  // ...

  return { columns: columnsWithTasks };
};
``` 