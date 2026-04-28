import { useState, useEffect } from 'react';
import { subscriptionApi } from '../services/subscriptionApi';

export function useSubscription(userId: string) {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchSubscription() {
      setLoading(true);
      setError(null);
      
      try {
        const data = await subscriptionApi.getUserSubscription(userId);
        setSubscription(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [userId]);

  const createCheckout = async (params: any) => {
    return subscriptionApi.createCheckoutUrl(params);
  };

  const cancelSubscription = async () => {
    await subscriptionApi.cancelSubscription(userId);
    setSubscription(null);
  };

  return { subscription, loading, error, createCheckout, cancelSubscription };
}
