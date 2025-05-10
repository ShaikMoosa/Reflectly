import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SubscriptionPanel } from '@/app/components/subscription/subscription-panel';
import { useSubscription } from '@/app/hooks/use-subscription';

// Mock the custom hook
jest.mock('@/app/hooks/use-subscription');

// Mock fetch globally
global.fetch = jest.fn();
global.window.open = jest.fn();

describe('SubscriptionPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeleton when subscription is loading', () => {
    // Mock the hook to return loading state
    (useSubscription as jest.Mock).mockReturnValue({
      status: null,
      isLoading: true,
      isPremium: false,
    });

    const { getAllByTestId } = render(<SubscriptionPanel />);

    // Check for skeleton elements
    expect(getAllByTestId('skeleton')).toHaveLength(6);
  });

  it('renders error alert when subscription status is unavailable', () => {
    // Mock the hook to return error state
    (useSubscription as jest.Mock).mockReturnValue({
      status: null, 
      isLoading: false,
      isPremium: false,
    });

    const { getByText } = render(<SubscriptionPanel />);

    // Check for error alert
    expect(getByText('Error')).toBeInTheDocument();
    expect(getByText('Unable to load subscription information. Please try refreshing the page.')).toBeInTheDocument();
  });

  it('renders free plan details correctly', () => {
    // Mock the hook to return free plan
    (useSubscription as jest.Mock).mockReturnValue({
      status: {
        status: 'free',
        usageStats: {
          transcriptions: { used: 2, limit: 5, percentage: 40 },
          aiChat: { used: 3, limit: 5, percentage: 60 },
        },
      },
      isLoading: false,
      isPremium: false,
    });

    const { getByText } = render(<SubscriptionPanel />);

    // Check for free plan elements
    expect(getByText('Free Plan')).toBeInTheDocument();
    expect(getByText('Upgrade to premium for unlimited access to all features.')).toBeInTheDocument();
    
    // Check for usage stats
    expect(getByText('2 / 5')).toBeInTheDocument();
    expect(getByText('3 / 5')).toBeInTheDocument();
    
    // Check for premium benefits
    expect(getByText('Premium Benefits')).toBeInTheDocument();
    expect(getByText('• 50 transcriptions per month (10x more)')).toBeInTheDocument();
    
    // Check for upgrade button
    expect(getByText('Upgrade to Premium')).toBeInTheDocument();
  });

  it('renders premium plan details correctly', () => {
    const renewDate = new Date('2023-12-31').toISOString();
    
    // Mock the hook to return premium plan
    (useSubscription as jest.Mock).mockReturnValue({
      status: {
        status: 'active',
        renewsAt: renewDate,
        usageStats: {
          transcriptions: { used: 10, limit: 50, percentage: 20 },
          aiChat: { used: 100, limit: 1000, percentage: 10 },
        },
      },
      isLoading: false,
      isPremium: true,
    });

    const { getByText } = render(<SubscriptionPanel />);

    // Check for premium plan elements
    expect(getByText('Premium Subscription')).toBeInTheDocument();
    expect(getByText('Your premium subscription is active. Renews on 12/31/2023.')).toBeInTheDocument();
    
    // Check for usage stats
    expect(getByText('10 / 50')).toBeInTheDocument();
    expect(getByText('100 / 1000')).toBeInTheDocument();
    
    // Check for manage subscription button
    expect(getByText('Manage Subscription')).toBeInTheDocument();
  });

  it('renders cancelled subscription details correctly', () => {
    // Mock the hook to return cancelled subscription
    (useSubscription as jest.Mock).mockReturnValue({
      status: {
        status: 'cancelled',
        usageStats: {
          transcriptions: { used: 10, limit: 50, percentage: 20 },
          aiChat: { used: 100, limit: 1000, percentage: 10 },
        },
      },
      isLoading: false,
      isPremium: true,
    });

    const { getByText } = render(<SubscriptionPanel />);

    // Check for cancelled subscription elements
    expect(getByText('Premium Subscription')).toBeInTheDocument();
    expect(getByText('Subscription Cancelled')).toBeInTheDocument();
    expect(getByText('Your subscription has been cancelled and will not renew.')).toBeInTheDocument();
    
    // Check for reactivate button
    expect(getByText('Reactivate Subscription')).toBeInTheDocument();
  });

  it('handles upgrade click correctly', async () => {
    // Mock fetch to return a successful response
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({ url: 'https://checkout.example.com' }),
    });

    // Mock the hook to return free plan
    (useSubscription as jest.Mock).mockReturnValue({
      status: {
        status: 'free',
        usageStats: {
          transcriptions: { used: 2, limit: 5, percentage: 40 },
          aiChat: { used: 3, limit: 5, percentage: 60 },
        },
      },
      isLoading: false,
      isPremium: false,
    });

    const { getByText } = render(<SubscriptionPanel />);
    const user = userEvent.setup();

    // Click the upgrade button
    await user.click(getByText('Upgrade to Premium'));

    // Verify loading state
    expect(getByText('Loading...')).toBeInTheDocument();

    // Verify the API was called
    expect(global.fetch).toHaveBeenCalledWith('/api/subscription/checkout-url');
  });
}); 