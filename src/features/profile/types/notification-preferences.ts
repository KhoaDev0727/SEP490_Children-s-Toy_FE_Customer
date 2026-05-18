export type CustomerNotificationPreferences = {
  emailOptIn: boolean;
  webPushOptIn: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  stockAlerts: boolean;
  blogAlerts: boolean;
};

export type UpdateCustomerNotificationPreferencesPayload = CustomerNotificationPreferences;
