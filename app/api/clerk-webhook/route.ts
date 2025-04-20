import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabase } from '../../../utils/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error: Missing svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new NextResponse('Error verifying webhook', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Create initial data structures for the user
    try {
      // Create empty kanban board
      await supabase.from('kanban_board').insert({
        id,
        user_id: id,
        data: {
          tasks: {},
          columns: {
            'column-1': {
              id: 'column-1',
              title: 'To Do',
              taskIds: []
            },
            'column-2': {
              id: 'column-2',
              title: 'In Progress',
              taskIds: []
            },
            'column-3': {
              id: 'column-3',
              title: 'Done',
              taskIds: []
            }
          },
          columnOrder: ['column-1', 'column-2', 'column-3']
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Create empty whiteboard
      await supabase.from('whiteboard_data').insert({
        id,
        user_id: id,
        data: {
          elements: [],
          appState: {}
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      console.log(`Created initial data for user ${id}`);
    } catch (error) {
      console.error('Error creating initial data:', error);
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    // Delete all user data
    try {
      // Delete kanban board
      await supabase.from('kanban_board').delete().eq('user_id', id);
      
      // Delete whiteboard data
      await supabase.from('whiteboard_data').delete().eq('user_id', id);
      
      // Delete projects
      const { data: projects } = await supabase.from('projects').select('id').eq('user_id', id);
      if (projects && projects.length > 0) {
        const projectIds = projects.map(p => p.id);
        
        // Delete transcripts
        await supabase.from('transcripts').delete().in('project_id', projectIds);
        
        // Delete projects
        await supabase.from('projects').delete().eq('user_id', id);
      }

      console.log(`Deleted all data for user ${id}`);
    } catch (error) {
      console.error('Error deleting user data:', error);
    }
  }

  return new NextResponse('Webhook processed successfully', {
    status: 200
  });
} 