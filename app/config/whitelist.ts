export const whitelistedUserIds = [
  'player01@demo.skillprint.co'
];

export const isUserWhitelisted = (userId: string | null): boolean => {
  if (!userId) return false;
  return whitelistedUserIds.includes(userId);
};
