// import React, { useRef } from "react";
// import html2canvas from "html2canvas";
// import { QRCodeCanvas } from "qrcode.react";

// export default function VisitorPass({ visitor }) {
//   const cardRef = useRef();

//   const downloadImage = async () => {
//     const canvas = await html2canvas(cardRef.current);
//     const image = canvas.toDataURL("image/png");

//     const link = document.createElement("a");
//     link.href = image;
//     link.download = "visitor-pass.png";
//     link.click();
//   };

//   return (
//     <>
//       <div
//         ref={cardRef}
//         style={{
//           backgroundColor: "#fff",
//           borderRadius: "14px",
//           border: "1.5px solid #6F0B14",
//           boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//           padding: "16px",
//           width: "450px",
//           position: "relative",
//           backgroundImage: `url('/backgroundImage.png')`,
//           backgroundSize: "contain",
//           backgroundRepeat: "no-repeat",
//         }}
//       >
//         {/* Header */}
//         <div style={{ display: "flex", justifyContent: "space-between" }}>
//           <img
//             src="/logo.png"
//             alt="Logo"
//             style={{ height: "70px", width: "70px" }}
//           />

//           <QRCodeCanvas value={visitor.visitorId.toString()} size={80} />
//         </div>

//         {/* Info Rows */}
//         <InfoRow label="Society" value={visitor.societyName} />
//         <InfoRow label="Building" value={visitor.buildingName} />
//         <InfoRow label="Flat/Shop/Office" value={visitor.flatNumber} />
//         <InfoRow label="Resident" value={visitor.tenantName} />
//         <InfoRow label="Name" value={visitor.visitorName} />
//         <InfoRow label="Phone Number" value={visitor.visitorPhone} />
//         <InfoRow label="Purpose" value={visitor.purpose} />
//         <InfoRow label="OTP" value={visitor.otp} />

//         <div style={{ marginTop: "8px" }}>
//           <strong style={{ fontSize: "12px", color: "grey" }}>
//             Location :-
//           </strong>{" "}
//           <a
//             href={visitor.location}
//             target="_blank"
//             rel="noopener noreferrer"
//             style={{ color: "blue", fontWeight: "bold" }}
//           >
//             {visitor.location}
//           </a>
//         </div>
//       </div>

//       <button onClick={downloadImage} style={{ marginTop: "20px" }}>
//         Download Visitor Pass
//       </button>
//     </>
//   );
// }

// function InfoRow({ label, value }) {
//   return (
//     <div style={{ display: "flex", marginTop: "6px" }}>
//       <div style={{ width: "50%", fontSize: "13px" }}>
//         <strong>{label} :- </strong>
//         {value || "-"}
//       </div>
//     </div>
//   );
// }
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
