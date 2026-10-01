export const applyPrivacyPolicy = (profile: any, relationStatus: string) => {
  const visibility = profile.privacySettings?.profileVisibility || 'PUBLIC';

  // Do not strip if user is viewing their own profile
  if (relationStatus === 'SELF' || profile.relation?.status === 'SELF') {
    return profile;
  }

  if (
    visibility === 'PRIVATE' ||
    (visibility === 'FRIENDS' && relationStatus !== 'FRIEND')
  ) {
    return {
      ...profile,
      bio: null,
      location: null,
      jobTitle: null,
      company: null,
      school: null,
      interests: [],
    };
  }
  return profile;
};
