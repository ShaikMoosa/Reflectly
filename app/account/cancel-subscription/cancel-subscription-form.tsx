'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/components/ui/toast';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardFooter } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Textarea } from '@/app/components/ui/textarea';
import { LoaderCircle } from 'lucide-react';

const CANCELLATION_REASONS = [
  { id: 'too_expensive', label: 'Too expensive' },
  { id: 'not_using', label: 'Not using enough' },
  { id: 'missing_features', label: 'Missing features I need' },
  { id: 'poor_experience', label: 'Poor user experience' },
  { id: 'switching', label: 'Switching to another service' },
  { id: 'other', label: 'Other reason' },
];

export function CancelSubscriptionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // First step: select reason and provide feedback
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) {
      toast({
        title: 'Please select a reason',
        description: 'Please let us know why you are cancelling',
        variant: 'destructive',
      });
      return;
    }
    setShowConfirmation(true);
  }

  // Second step: confirm cancellation
  async function handleConfirmCancellation() {
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason,
          feedback,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      toast({
        title: 'Subscription cancelled',
        description: 'Your subscription has been cancelled successfully',
      });
      
      // Redirect to subscription page after short delay
      setTimeout(() => {
        router.push('/account/subscription');
        router.refresh();
      }, 1500);

    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: 'Error',
        description: 'There was a problem cancelling your subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (showConfirmation) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Are you sure you want to cancel?</h3>
            <p className="text-muted-foreground">
              This will cancel your premium subscription. Your subscription will remain active until the end of your current billing period.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button
            variant="outline"
            onClick={() => setShowConfirmation(false)}
            disabled={isSubmitting}
          >
            Go Back
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmCancellation}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Confirm Cancellation'
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div>
            <Label htmlFor="reason" className="text-base font-medium mb-3 block">
              Why are you cancelling your subscription?
            </Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {CANCELLATION_REASONS.map((r) => (
                <div key={r.id} className="flex items-center space-x-2 py-2">
                  <RadioGroupItem value={r.id} id={r.id} />
                  <Label htmlFor={r.id} className="font-normal">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="feedback" className="text-base font-medium mb-3 block">
              Any additional feedback? (optional)
            </Label>
            <Textarea
              id="feedback"
              placeholder="Please tell us how we can improve..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/account/subscription')}
          >
            Cancel
          </Button>
          <Button type="submit" variant="destructive">
            Continue
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
} 