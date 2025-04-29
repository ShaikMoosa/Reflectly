import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabaseAdminClient } from '@/app/utils/supabase/admin';
import { handleSupabaseError } from '@/app/utils/supabase/error-handler';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no Svix headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('Missing CLERK_WEBHOOK_SECRET environment variable');
    return new Response('Error: Missing webhook secret', {
      status: 500
    });
  }

  // Create a new Svix instance
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error: Invalid webhook signature', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  try {
    if (eventType === 'user.created' || eventType === 'user.updated') {
      // Extract user data from the webhook
      const { id, email_addresses, username, first_name, last_name, image_url } = evt.data;
      
      const primaryEmail = email_addresses?.[0]?.email_address;
      
      // Sync user data to Supabase
      const { error } = await supabaseAdminClient
        .from('users')
        .upsert({
          id,
          email: primaryEmail,
          username: username || primaryEmail?.split('@')[0],
          first_name: first_name || '',
          last_name: last_name || '',
          avatar_url: image_url,
          updated_at: new Date().toISOString()
        }, 
        { 
          onConflict: 'id' 
        });
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to sync user to Supabase');
      }
    }
    
    if (eventType === 'user.deleted') {
      // Delete user data from Supabase
      const { id } = evt.data;
      
      const { error } = await supabaseAdminClient
        .from('users')
        .update({ 
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .match({ id });
      
      if (error) {
        throw handleSupabaseError(error, 'Failed to mark user as deleted in Supabase');
      }
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { 
      status: 500 
    });
  }
} 