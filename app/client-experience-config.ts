export const contactIntegrationStatus = "connected" as "pending" | "connected";
export const privacyPublicationStatus = "published" as "hidden" | "draft" | "published";

export const clientExperienceConfig = {
  contactIntegrationStatus,
  privacyPublicationStatus,
} as const;
