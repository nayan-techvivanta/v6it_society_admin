import React, { forwardRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

const VisitorPass = forwardRef(({ visitor = {} }, ref) => {
  if (!visitor) return null;

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: "#fff",
        borderRadius: "14px",
        border: "1.5px solid #6F0B14",
        padding: "16px",
        width: "450px",
        backgroundImage: `url('/backgroundImage.png')`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <img
          src="/logo.png"
          alt="Logo"
          style={{ height: "70px", width: "70px" }}
        />

        <QRCodeCanvas
          value={
            visitor?.visitorId?.toString() || visitor?.id?.toString() || ""
          }
          size={80}
        />
      </div>

      <InfoRow label="Society" value={visitor.societyName} />
      <InfoRow label="Building" value={visitor.buildingName} />
      <InfoRow label="Flat" value={visitor.flatNumber} />
      <InfoRow label="Resident" value={visitor.tenantName} />
      <InfoRow label="Name" value={visitor.visitorName} />
      <InfoRow label="Phone" value={visitor.visitorPhone} />
      <InfoRow label="Purpose" value={visitor.purpose} />
      <InfoRow label="OTP" value={visitor.otp} />

      {visitor.location && (
        <div style={{ marginTop: "8px" }}>
          <strong style={{ fontSize: "12px", color: "grey" }}>Location:</strong>{" "}
          <a
            href={visitor.location}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "blue", fontWeight: "bold" }}
          >
            View
          </a>
        </div>
      )}
    </div>
  );
});

function InfoRow({ label, value }) {
  return (
    <div style={{ marginTop: "6px", fontSize: "13px" }}>
      <strong>{label} :- </strong>
      {value || "-"}
    </div>
  );
}

export default VisitorPass;
