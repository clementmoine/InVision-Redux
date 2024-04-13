export interface User {
  avatarID: string;
  avatarUrl: string;
  name: string;
  id: number;
}

export interface UserDetails extends User {
  emailNotificationFrequency: number;
  createdAt: number; // Timestamp (ms)
  hasSeenCommentToolTip: boolean;
  lastRequestAt: number; // Timestamp (ms)
  timezoneOffsetInMinutes: number;
  wantsNewsletterEmails: boolean;
  isAnonymous: boolean;
  updatedAt: number; // Timestamp (ms)
  lastKnownIpAddress: string; // WTF (GDPR compliant huh ?) ?
  email: string;
}
