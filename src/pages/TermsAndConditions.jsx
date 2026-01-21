import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-md">
        {/* Header */}
        <div className="border-b px-6 py-6">
          <h1 className="text-3xl font-bold text-[#6F0B14]">
            Terms & Conditions
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Last updated: January 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 px-6 py-8 text-gray-700 leading-relaxed">
          <p>
            This Society Management Application (“App”) is built to manage
            society operations involving society administrators, security
            guards, residents, and visitors. By accessing or using this App,
            you agree to the following Terms & Conditions.
          </p>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#6F0B14]">
              1. User Roles
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Society Admin manages society configurations and users.</li>
              <li>Security Guard records visitor entries and captures photos.</li>
              <li>Resident verifies and approves visitor access.</li>
              <li>Visitor entry depends on resident approval.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#6F0B14]">
              2. Visitor Entry Process
            </h2>
            <p>
              Visitor details such as name, visit purpose, and photograph may be
              collected at entry points. Approval from the respective resident
              is required before allowing access.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#6F0B14]">
              3. User Responsibilities
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Provide accurate and valid information.</li>
              <li>Maintain confidentiality of login credentials.</li>
              <li>Avoid misuse or unauthorized access.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#6F0B14]">
              4. Liability Disclaimer
            </h2>
            <p>
              The App only facilitates digital record keeping and verification.
              Physical security decisions remain the responsibility of the
              society management.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#6F0B14]">
              5. Service Availability
            </h2>
            <p>
              Features may be modified, updated, or temporarily unavailable due
              to maintenance or system improvements.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#6F0B14]">
              6. Termination
            </h2>
            <p>
              Access may be restricted or terminated if these Terms are violated
              or if misuse is detected.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#6F0B14]">
              7. Changes to Terms
            </h2>
            <p>
              Continued use of the App after updates implies acceptance of the
              revised Terms & Conditions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
