
import { Phone, X, Copy } from "lucide-react";

export default function CallDetailsPopup({ onClose }) {
  const phone = "+919307898468";

  async function copyPhone() {
    try {
      await navigator.clipboard.writeText(phone);
      alert("Phone number copied!");
    } catch {
      alert(`Company phone number: ${phone}`);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="call-details-title"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 390,
          background: "#faf8f4",
          color: "#191817",
          borderRadius: 20,
          padding: 28,
          position: "relative",
          boxShadow: "0 20px 70px rgba(0,0,0,0.25)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close contact details"
          style={{
            position: "absolute",
            right: 16,
            top: 16,
            border: 0,
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <X size={22} />
        </button>

        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#191817",
            color: "#fff",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Phone size={22} />
        </div>

        <h2 id="call-details-title">Contact Atelier Noire</h2>

        <p style={{ color: "#77746e", lineHeight: 1.7 }}>
          Have a project in mind? Contact our studio team for
          project enquiries and consultation details.
        </p>

        <p style={{ fontSize: 19, fontWeight: 600 }}>
          +91 93078 98468
        </p>

        <button
          type="button"
          onClick={copyPhone}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            width: "100%",
            padding: 14,
            borderRadius: 30,
            border: "1px solid #191817",
            background: "#191817",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <Copy size={17} />
          Copy Phone Number
        </button>

        <p style={{ fontSize: 12, color: "#77746e", marginBottom: 0 }}>
          Copy the number to call whenever you choose.
        </p>
      </section>
    </div>
  );
}
