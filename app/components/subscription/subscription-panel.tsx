'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSubscription } from '@/app/hooks/use-subscription';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExternalLink, AlertCircle } from 'lucide-react';

export function SubscriptionPanel() {
  const { status, isLoading, isPremium } = useSubscription();
  const [upgradeUrl, setUpgradeUrl] = useState<string>('');

  // Function to get checkout URL from backend
  async function getCheckoutUrl() {
    try {
      setUpgradeUrl('#loading');
      const response = await fetch('/api/subscription/checkout-url');
      const data = await response.json();
      if (data.url) {
        setUpgradeUrl(data.url);
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error getting checkout URL:', error);
      setUpgradeUrl('#error');
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" data-testid="skeleton" />
          <Skeleton className="h-4 w-full" data-testid="skeleton" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" data-testid="skeleton" />
            <Skeleton className="h-4 w-full" data-testid="skeleton" />
            <Skeleton className="h-8 w-full" data-testid="skeleton" />
            <Skeleton className="h-8 w-full" data-testid="skeleton" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Alert variant="destructive" className="w-full max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Unable to load subscription information. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {isPremium ? 'Premium Subscription' : 'Free Plan'}
        </CardTitle>
        <CardDescription>
          {isPremium
            ? `Your premium subscription is ${status.status}. ${
                status.renewsAt
                  ? `Renews on ${new Date(status.renewsAt).toLocaleDateString()}.`
                  : ''
              }`
            : 'Upgrade to premium for unlimited access to all features.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Transcriptions</span>
            <span className="text-sm text-muted-foreground">
              {status.usageStats.transcriptions.used} / {status.usageStats.transcriptions.limit}
            </span>
          </div>
          <Progress value={status.usageStats.transcriptions.percentage} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">AI Chat Messages</span>
            <span className="text-sm text-muted-foreground">
              {status.usageStats.aiChat.used} / {status.usageStats.aiChat.limit}
            </span>
          </div>
          <Progress value={status.usageStats.aiChat.percentage} className="h-2" />
        </div>

        {isPremium && status.status === 'cancelled' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Subscription Cancelled</AlertTitle>
            <AlertDescription>
              Your subscription has been cancelled and will not renew.
            </AlertDescription>
          </Alert>
        )}

        {!isPremium && (
          <div className="bg-primary/10 rounded-lg p-4 mt-4">
            <h3 className="font-medium mb-2">Premium Benefits</h3>
            <ul className="text-sm space-y-1">
              <li>• 50 transcriptions per month (10x more)</li>
              <li>• 1,000 AI chat messages (200x more)</li>
              <li>• Advanced AI features</li>
              <li>• Priority customer support</li>
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!isPremium ? (
          <Button onClick={getCheckoutUrl} disabled={upgradeUrl === '#loading'}>
            {upgradeUrl === '#loading' ? 'Loading...' : 'Upgrade to Premium'}
          </Button>
        ) : status.status === 'cancelled' ? (
          <Button onClick={getCheckoutUrl} variant="outline">
            Reactivate Subscription
          </Button>
        ) : (
          <Link href="/account/cancel-subscription" passHref>
            <Button variant="outline">Manage Subscription</Button>
          </Link>
        )}
        
        <Link href="https://reflectly.io/pricing" target="_blank" passHref>
          <Button variant="ghost" size="sm">
            See Plans <ExternalLink className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 