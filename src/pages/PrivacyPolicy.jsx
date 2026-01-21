import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-md">
        {/* Header */}
        <div className="border-b px-6 py-6">
          <h1 className="text-3xl font-bold text-[#6F0B14]">
            Privacy Policy
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Last updated: January 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 px-6 py-8 text-gray-700 leading-relaxed">
          <p>
            This Privacy Policy explains how information is collected, used, and
            protected within the Society Management Application.
          </p>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#6F0B14]">
              1. Information We Collect
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>User profile details based on assigned role.</li>
              <li>Authentication and login information.</li>
              <li>Visitor name, visit time, and photograph.</li>
              <li>App usage and device-related logs.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#6F0B14]">
              2. Purpose of Data Collection
            </h2>
            <p>
              Data is collected strictly for visitor verification, access
              control, record keeping, and improving system reliability.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#6F0B14]">
              3. Visitor Photographs
            </h2>
            <p>
              Visitor photos are captured only for security and identification
              purposes and are visible only to authorized users.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#6F0B14]">
              4. Data Sharing
            </h2>
            <p>
              Personal and visitor data is shared only within the society
              ecosystem and is not sold or publicly disclosed.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#6F0B14]">
              5. Data Security
            </h2>
            <p>
              Appropriate technical and organizational measures are applied to
              protect stored data. However, no system can guarantee absolute
              security.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#6F0B14]">
              6. Data Retention
            </h2>
            <p>
              Data is retained as per society policies or applicable legal
              requirements and may be removed when no longer required.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#6F0B14]">
              7. Acceptance
            </h2>
            <p>
              By using the App, you acknowledge and accept this Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
