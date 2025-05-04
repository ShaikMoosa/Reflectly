# Technical Context

## Technology Stack

### Frontend
- **Framework**: Next.js 15
- **UI Library**: React
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **Authentication UI**: Clerk

### Backend
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with Clerk integration
- **Storage**: Supabase Storage
- **Serverless Functions**: Supabase Edge Functions
- **API**: Next.js API routes + Supabase functions

### AI & ML
- **NLP**: OpenAI API (GPT-4)
- **Audio Processing**: OpenAI Whisper API
- **Context Management**: Custom implementation

### DevOps
- **Version Control**: Git
- **Deployment**: Standard Next.js deployment
- **Environment**: Windows development environment

## Development Setup

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account and CLI
- Clerk account
- OpenAI API key

### Environment Variables
Key environment variables include:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### Local Development
The project includes several scripts for local development:
- `npm run dev`: Start the development server
- `npm run build`: Build the production application
- `npm run start`: Start the production server

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

### Security
- **Authentication**: Secure user authentication via Clerk
- **Data Access**: Row Level Security (RLS) in Supabase
- **API Security**: Protection of OpenAI API key and other credentials

### Scalability
- **Database Scaling**: Limited by Supabase plan
- **API Scaling**: Limited by OpenAI rate limits and pricing
- **Storage Scaling**: Limited by Supabase plan
- **Frontend Performance**: Optimized to handle larger datasets through memoization

## Dependencies

### Core Dependencies
- `next`: Next.js framework
- `react`, `react-dom`: React library
- `@clerk/nextjs`: Clerk authentication
- `@supabase/supabase-js`: Supabase client
- `openai`: OpenAI API client
- `tailwindcss`: Utility-first CSS framework
- `shadcn/ui`: UI component library based on Radix UI
- `react-beautiful-dnd`: Drag and drop functionality

### Development Dependencies
- `typescript`: TypeScript language
- `eslint`: Code linting
- `jest`: Testing framework
- `@types/*`: TypeScript type definitions
- `cross-env`: Cross-environment variable setting

## Project Structure

The project follows a standard Next.js 15 structure with App Router:

- `/app`: Main application code
  - `/api`: API routes
  - `/components`: Reusable UI components
  - `/models`: Data models and types
  - `/utils`: Utility functions
  - `/styles`: Global styles

- `/public`: Static assets
- `/supabase`: Supabase configuration and migrations
- `/lib`: Shared libraries and utilities
- `/.cursor`: Cursor configuration and rules

## Performance Optimizations

### React Optimizations
- **Component Memoization**: React.memo for heavy components
- **Calculation Caching**: useMemo for expensive calculations
- **Function Stability**: useCallback for event handlers and callbacks
- **Render Optimization**: Custom comparison functions for memoized components
- **State Management**: Optimized state updates with function updaters

### Next.js Optimizations
- **Chunk Error Handling**: Implemented error recovery for chunk loading issues
- **Webpack Configuration**: Optimized chunk sizes and loading timeout in next.config.js
- **Console Logging**: Removed excessive console.log in production builds

### Browser Optimizations
- **LocalStorage**: Debounced writes to reduce performance impact
- **DOM Updates**: Minimized with memoization and careful state management
- **Event Handling**: Optimized with useCallback for stable references

## Testing Approach

- **Unit Tests**: Component and function testing with Jest
- **Integration Tests**: API and data flow testing
- **Manual Testing**: UI and user flow validation
- **Performance Testing**: React DevTools Profiler for component rendering analysis

## Deployment Strategy

- Development: Local development environment
- Production: Standard Next.js deployment
- Database: Supabase hosted PostgreSQL 