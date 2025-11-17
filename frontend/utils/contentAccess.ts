// Content Access Control based on user role

export const canAccessFullContent = (user: any): boolean => {
  if (!user) return false;
  return user.role === 'subscriber' || user.role === 'admin' || user.role === 'creator';
};

export const canAccessShortContent = (user: any): boolean => {
  if (!user) return false;
  return !!user.email; // Has email = signed up
};

export const needsEmailSignup = (user: any): boolean => {
  return !user || !user.email;
};

export const needsSubscription = (user: any): boolean => {
  if (!user) return true;
  return user.role === 'explorer' || user.role === 'guest';
};

export const getAccessMessage = (user: any): string => {
  if (!user || !user.email) {
    return 'Sign up with email to access short clips';
  }
  if (user.role === 'explorer') {
    return 'Subscribe to access full-length content';
  }
  return 'Full access unlocked';
};
