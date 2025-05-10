# Active Context

## Current Focus

The project is currently in active development, with several key features implemented and others being enhanced. The main areas of active development are:

1. **Authentication and Middleware Optimization**
   - Fixed SSO callback redirects with focused middleware
   - Improved Clerk integration with proper configuration
   - Resolved auth-related navigation issues
   - Standardized authentication flows

2. **Supabase Client Architecture**
   - Implemented singleton pattern for client-side Supabase client
   - Optimized server-side Supabase client creation per request
   - Fixed multiple GoTrueClient instances warnings
   - Properly separated client and server authentication contexts

3. **Subscription and Monetization**
   - Refining subscription management with Lemon Squeezy
   - Optimizing usage tracking and limits enforcement
   - Improving subscription-related user interfaces
   - Setting up proper webhook validation and processing

4. **Enhanced AI Capabilities**
   - Improving context management in AI chat
   - Optimizing transcription accuracy and processing
   - Developing more intelligent content analysis
   - Creating summarization features for transcripts

5. **Whiteboard and Visual Tools**
   - Enhancing the Konva-based drawing canvas
   - Optimizing performance for complex drawings
   - Implementing collaborative features
   - Adding more sophisticated drawing tools

6. **Project and Notes Organization**
   - Refining the relationship between projects, notes, and transcripts
   - Improving search and filtering capabilities
   - Enhancing the note editor experience
   - Creating better organization systems for content

7. **User Experience Improvements**
   - Streamlining navigation flows
   - Creating consistent loading and error states
   - Optimizing for mobile devices
   - Enhancing accessibility

8. **Performance Optimization**
   - Addressing performance issues in complex components
   - Optimizing database queries
   - Reducing client-side processing overhead
   - Improving media handling performance

## Recent Changes

1. **Authentication Improvements**
   - Fixed SSO callback redirects with optimized middleware
   - Updated Clerk component props for consistency
   - Resolved navigation issues after authentication
   - Improved error handling in auth flows

2. **Supabase Integration Optimization**
   - Implemented singleton pattern for client-side Supabase
   - Created per-request context for server-side Supabase
   - Fixed `supabaseServerClient` usage in server actions
   - Resolved multiple GoTrueClient instances warnings

3. **Database Migration Standardization**
   - Created scripts to standardize migration filenames
   - Renamed placeholder files with proper timestamps
   - Improved migration organization
   - Updated database schema documentation

4. **Deployment and Production Readiness**
   - Created verification script for detecting development API keys
   - Added comprehensive deployment checks documentation
   - Fixed environment variable handling
   - Improved error logging and monitoring

5. **Subscription System Implementation**
   - Integrated Lemon Squeezy for payment processing
   - Created user_subscriptions and user_usage tables
   - Implemented usage tracking and feature limitations
   - Set up webhooks for subscription event handling

6. **Transcription System Enhancement**
   - Improved OpenAI Whisper API integration
   - Added support for video files with FFmpeg processing
   - Implemented synchronized playback with transcript
   - Created efficient storage format for transcript data

7. **Whiteboard Feature Development**
   - Created Konva-based drawing canvas
   - Implemented basic drawing tools and shapes
   - Added data persistence in Supabase
   - Set up undo/redo functionality

8. **UI/UX Improvements**
   - Enhanced landing page with modern design
   - Implemented consistent dark/light mode
   - Created better navigation structure
   - Added more feedback mechanisms for users

## Recent Code Changes

1. **Authentication Middleware** (middleware.ts)
   ```typescript
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

2. **Supabase Client Singleton** (app/utils/supabase/client.ts)
   ```typescript
   // Use a singleton pattern for the client
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

   // For backward compatibility
   export const supabaseClient = getSupabaseClient();
   ```

3. **Server Context Supabase Client** (app/utils/supabase/server.ts)
   ```typescript
   // Server-side client should NOT be a singleton since it needs to be created 
   // for each request context in a server component
   export function createClient() {
     // Get Supabase URL and anon key from environment variables
     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || dummyUrl;
     const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || dummyKey;
     
     // Create and return the client with a unique context for this request
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

4. **Updated Server Actions** (app/planner/actions.ts)
   ```typescript
   import { createClient } from '../utils/supabase/server'; // Updated import
   
   // Example of updated function using createClient()
   export const getPlannerData = async (): Promise<PlannerData> => {
     const userId = await getUserIdOrThrow(); // Await the helper
     const supabase = createClient();
     
     // ... rest of the function
   }
   ```

## Next Steps

1. **Enhance Collaboration Features**
   - Implement real-time collaborative editing
   - Create team workspaces and permissions
   - Build commenting and feedback tools
   - Develop sharing capabilities

2. **Mobile Experience Optimization**
   - Enhance responsive design
   - Optimize touch interactions
   - Improve performance on mobile devices
   - Create mobile-specific UI adjustments

3. **Advanced Analytics**
   - Implement user activity tracking
   - Create content insights dashboards
   - Add usage visualization tools
   - Develop AI-powered recommendations

4. **Feature Refinement**
   - Polish existing features based on user feedback
   - Fix outstanding issues and bugs
   - Optimize workflows and user journeys
   - Add requested enhancements

5. **API Key Security**
   - Resolve GitHub sensitive key issues
   - Implement better environment variable management
   - Set up proper key rotation practices
   - Add additional security checks

## Active Decisions

1. **Data Structure Optimization**
   - How to optimize the relationship between notes, projects, and transcripts
   - Whether to implement more advanced tagging/categorization systems
   - How to structure data for efficient searching and filtering
   - Best approach for handling media files and transcriptions

2. **Performance Tradeoffs**
   - Whether to process more on the server or client side
   - How to balance feature richness with performance
   - Approach to handling large data sets in the UI
   - Strategies for optimizing media processing

3. **Monetization Strategy**
   - Refinement of pricing tiers and feature limits
   - Consideration of additional premium features
   - Approach to handling subscription upgrades/downgrades
   - Implementation of usage-based vs. tier-based limits

4. **AI Integration Enhancement**
   - Strategies for improving context management
   - Methods for enhancing response quality
   - Approaches to handling rate limits and costs
   - Integration of additional AI capabilities

## Current Challenges

1. **Technical Complexity**
   - Managing the complexity of real-time collaborative features
   - Handling large media files efficiently
   - Optimizing database queries for complex relationships
   - Balancing client and server processing

2. **User Experience Consistency**
   - Creating consistent loading and error states
   - Maintaining performance across different devices
   - Providing clear feedback for subscription limits
   - Ensuring accessibility throughout the application

3. **AI Performance and Costs**
   - Managing OpenAI API costs
   - Optimizing token usage for better efficiency
   - Handling rate limits gracefully
   - Balancing accuracy with processing speed

4. **Database Performance**
   - Optimizing queries for large datasets
   - Managing relationship complexity
   - Ensuring proper indexing for common operations
   - Handling concurrent operations efficiently

5. **Security and Configuration Management**
   - Securing sensitive API keys and credentials
   - Managing environment variables across environments
   - Implementing proper security checks
   - Preventing accidental exposure of sensitive data

## Implementation Considerations

1. **Scalability**
   - Designing for increased user load
   - Planning for growth in data storage needs
   - Preparing for expanded feature set
   - Considering multi-tenant architecture

2. **Security**
   - Ensuring proper authentication across features
   - Maintaining Row Level Security effectiveness
   - Protecting sensitive user data
   - Securing subscription and payment information

3. **Maintainability**
   - Establishing consistent coding patterns
   - Improving documentation coverage
   - Setting up more comprehensive testing
   - Creating clear boundaries between components

## Current Implementation Details

### Authentication Flow

The authentication flow now includes:
- Clerk for authentication UI and user management
- Optimized middleware specifically handling SSO callbacks
- Proper integration with Supabase for data access control
- Consistent redirect handling after authentication

### Supabase Client Architecture

The Supabase client architecture includes:
- Singleton pattern for client-side usage via `getSupabaseClient()`
- Per-request context creation for server components
- Separate authentication contexts for client and server
- Proper session and token handling

### Subscription System

The subscription system includes:
- Database tables: `user_subscriptions` and `user_usage`
- Lemon Squeezy webhook handler for processing events
- Helper functions for checking status and tracking usage
- UI components for displaying subscription details
- Feature limitations based on subscription tier:
  - Free: 5 transcriptions, 5 AI chat queries
  - Premium: 50 transcriptions, 1000 AI chat sessions

### Transcription Processing

The transcription process flow:
1. User uploads audio/video file
2. File is processed (FFmpeg for video) if needed
3. Content is sent to OpenAI Whisper API
4. Response is transformed into segment format
5. Transcription is stored in Supabase
6. Usage count is incremented
7. Transcript is displayed with synchronized playback

### Project and Notes Organization

The data structure includes:
- `projects` table for project organization
- `video_transcripts` table for transcription storage
- `user_notes` table for notes management
- `ai_chat_history` table for conversation storage
- Row Level Security policies for data protection
- Indexes for optimized querying

### Whiteboard Feature

The whiteboard implementation includes:
- Konva-based drawing canvas
- Various drawing tools and shapes
- Data persistence in Supabase
- Undo/redo functionality
- Initial sharing capabilities 