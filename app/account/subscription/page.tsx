import { Metadata } from 'next';
import { SubscriptionPanel } from '@/app/components/subscription/subscription-panel';

export const metadata: Metadata = {
  title: 'Subscription Management | Reflectly',
  description: 'Manage your Reflectly subscription and view usage statistics',
};

export default function SubscriptionPage() {
  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-muted-foreground">
          Manage your subscription and view your usage statistics.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-1">
        <SubscriptionPanel />
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium">How do I upgrade my subscription?</h3>
            <p className="text-muted-foreground mt-1">
              Click the "Upgrade to Premium" button above to subscribe to our premium plan. You'll be taken to our secure payment provider to complete the transaction.
            </p>
          </div>

          <div>
            <h3 className="font-medium">How do I cancel my subscription?</h3>
            <p className="text-muted-foreground mt-1">
              Click the "Manage Subscription" button, then select "Cancel Subscription". Your subscription will remain active until the end of your current billing period.
            </p>
          </div>

          <div>
            <h3 className="font-medium">What happens when I reach my usage limit?</h3>
            <p className="text-muted-foreground mt-1">
              You won't be able to use the respective features until your usage resets at the beginning of the next billing cycle, or you upgrade to a premium plan.
            </p>
          </div>

          <div>
            <h3 className="font-medium">When does my usage reset?</h3>
            <p className="text-muted-foreground mt-1">
              Usage limits reset at the beginning of each billing cycle. For free users, this is the first day of each month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 