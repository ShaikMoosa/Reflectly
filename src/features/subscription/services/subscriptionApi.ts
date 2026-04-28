import { SubscriptionRepository } from './subscription-repository';
import { SubscriptionAdminRepository } from './subscription-admin-repository';

export const subscriptionApi = {
  async getUserSubscription(userId: string) {
    return SubscriptionRepository.getByUserId(userId);
  },

  async createCheckoutUrl(params: any) {
    return SubscriptionRepository.createCheckoutUrl(params);
  },

  async cancelSubscription(userId: string) {
    return SubscriptionRepository.cancel(userId);
  },

  async getUsage(userId: string) {
    return SubscriptionRepository.getUsage(userId);
  },

  async trackUsage(userId: string, type: string) {
    return SubscriptionRepository.trackUsage(userId, type);
  }
};

export const adminApi = {
  async getAllSubscriptions() {
    return SubscriptionAdminRepository.getAll();
  },

  async updateSubscription(id: string, params: any) {
    return SubscriptionAdminRepository.update(id, params);
  }
};
