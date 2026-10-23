type GoogleAdsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

/** Called once per confirmed enquiry; tracking must never interrupt the form. */
export function reportContactConversion(): void {
  if (typeof window === "undefined") return;
  try {
    const gtag = (window as GoogleAdsWindow).gtag;
    if (typeof gtag !== "function") return;
    gtag("event", "conversion", {
      send_to: "AW-18530491505/Phc_CPDUmKcdEPG4g4RF",
      value: 1.0,
      currency: "UAH",
    });
  } catch {
    // A blocked or unavailable tracker does not change successful delivery.
  }
}
