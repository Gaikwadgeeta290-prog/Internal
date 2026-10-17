// Centralized Studio Configuration & Contact Channels
export const STUDIO_WHATSAPP_NUMBER = "919307898468";
export const STUDIO_PHONE_DISPLAY = "+91 93078 98468";
export const STUDIO_PHONE_TEL = "+919307898468";
export const STUDIO_EMAIL = "hello@ateliernoire.in";
export const STUDIO_ADMIN_WHATSAPP = "919307898468";

/**
 * Generates an instant WhatsApp chat URL for client or admin
 */
export function getWhatsAppUrl(message, phone = STUDIO_WHATSAPP_NUMBER) {
  const cleanPhone = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Creates Google Calendar link for confirmed consultations
 */
export function getGoogleCalendarUrl({ title, description, location, date, time }) {
  try {
    // Basic calendar event link generator
    const details = encodeURIComponent(description || "Private Consultation with Atelier Noire Design Directors");
    const loc = encodeURIComponent(location || "Atelier Noire Studio / Video Consultation");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${details}&location=${loc}`;
  } catch {
    return "#";
  }
}
