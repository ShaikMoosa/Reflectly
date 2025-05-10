import { Metadata } from 'next';
import Link from 'next/link';
import { CancelSubscriptionForm } from './cancel-subscription-form';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cancel Subscription | Reflectly',
  description: 'Cancel your Reflectly subscription',
};

export default function CancelSubscriptionPage() {
  return (
    <div className="container max-w-2xl py-8">
      <Link href="/account/subscription" passHref>
        <Button variant="ghost" className="mb-6 pl-0 flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Subscription
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cancel Subscription</h1>
        <p className="text-muted-foreground">
          We're sorry to see you go. Please let us know why you're cancelling so we can improve our service.
        </p>
      </div>

      <div className="bg-muted/50 border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Important Information</h2>
        <ul className="space-y-2 list-disc list-inside text-muted-foreground">
          <li>Your subscription will remain active until the end of your current billing period.</li>
          <li>You'll still have access to premium features until your subscription expires.</li>
          <li>After cancellation, your account will revert to the free tier with limited usage.</li>
          <li>Any data you've created will remain accessible even after downgrading.</li>
        </ul>
      </div>

      <CancelSubscriptionForm />
    </div>
  );
} 