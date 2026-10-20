export const contactIntegrationStatus = "connected" as "pending" | "connected";
export const privacyPublicationStatus = "published" as "hidden" | "draft" | "published";
// Release audit: retain supplied records, but require client-authenticity
// confirmation before presenting generated / unverified copy as endorsements.
export const testimonialsMode = "hidden" as "demo" | "published" | "hidden";

export const clientExperienceConfig = {
  contactIntegrationStatus,
  privacyPublicationStatus,
  testimonialsMode,
} as const;
