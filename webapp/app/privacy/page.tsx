import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Ayurv",
  description: "How Ayurv handles your data. DPDPA 2023 compliant privacy practices.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-ayurv-primary mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: March 2026</p>

      <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
        {/* Intro */}
        <section>
          <p>
            Ayurv (&quot;we&quot;, &quot;us&quot;, &quot;the tool&quot;) is an educational herb-safety
            checking tool built for Indian users. We take your privacy seriously and are committed to
            compliance with the Digital Personal Data Protection Act, 2023 (DPDPA). This policy explains
            what data we collect, how we handle it, and your rights.
          </p>
        </section>

        {/* Data Collected */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">1. What Data We Collect</h2>
          <p className="mb-2">
            During an assessment session, you may voluntarily provide the following information:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Health conditions (e.g. diabetes, hypertension, liver disease)</li>
            <li>Current medications (prescription and over-the-counter)</li>
            <li>Pregnancy or breastfeeding status</li>
            <li>Age range</li>
            <li>Biological sex</li>
            <li>Herbs you wish to check</li>
          </ul>
          <p className="mt-2">
            We do <strong>not</strong> collect your name, email address, phone number, Aadhaar number,
            or any other personally identifiable information.
          </p>
        </section>

        {/* Storage */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">2. How Data Is Stored</h2>

          <h3 className="font-medium text-gray-800 mt-3 mb-1">Client-side (your browser)</h3>
          <p>
            Your intake data (conditions, medications, preferences) is stored in your
            browser&apos;s <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">sessionStorage</code>.
            This data exists only for the duration of your browser tab session and is automatically cleared
            when you close the tab. We do <strong>not</strong> use cookies or localStorage.
          </p>

          <h3 className="font-medium text-gray-800 mt-3 mb-1">Server-side audit logs</h3>
          <p>
            For safety monitoring and system reliability, we maintain server-side audit logs of assessment
            requests. These logs have a <strong>24-hour time-to-live (TTL)</strong> and are automatically
            deleted after that period. Logs contain the assessment parameters but no directly identifying
            information.
          </p>
        </section>

        {/* IP Addresses */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">3. IP Address Handling</h2>
          <p>
            If IP addresses are processed for rate-limiting or abuse prevention, they
            are <strong>SHA-256 hashed</strong> before any storage. We never store raw IP addresses. The
            hashed values cannot be reversed to recover the original IP address.
          </p>
        </section>

        {/* No Accounts */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">4. No User Accounts or Persistent Profiles</h2>
          <p>
            Ayurv does not require user registration, login, or account creation. There are no persistent
            user profiles. Each session is independent and anonymous.
          </p>
        </section>

        {/* Data Sharing */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">5. Data Sharing &amp; Third Parties</h2>
          <p>
            We do <strong>not</strong> sell, share, rent, or transfer your data to any third party for
            marketing, analytics, advertising, or any other purpose. Your health information stays between
            you and the tool.
          </p>
        </section>

        {/* Retention */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">6. Data Retention</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Client-side session data:</strong> Cleared automatically when you close the browser
              tab (sessionStorage).
            </li>
            <li>
              <strong>Server-side audit logs:</strong> Auto-deleted after 24 hours.
            </li>
            <li>
              <strong>No long-term data storage:</strong> We do not maintain any persistent database of
              user sessions or health information.
            </li>
          </ul>
        </section>

        {/* Cookies */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">7. Cookies</h2>
          <p>
            Ayurv does <strong>not</strong> use cookies of any kind — no tracking cookies, no analytics
            cookies, no session cookies. We use only browser sessionStorage, which is not accessible to
            other websites and is not transmitted to any server automatically.
          </p>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">8. Your Rights Under DPDPA 2023</h2>
          <p className="mb-2">As a Data Principal under the DPDPA, you have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Know what personal data is being processed and how</li>
            <li>Request correction or erasure of your personal data</li>
            <li>Nominate another individual to exercise your rights</li>
            <li>File a grievance and seek redressal</li>
          </ul>
          <p className="mt-2">
            Given that Ayurv does not store persistent personal data and all session data is automatically
            purged within 24 hours, most data-subject requests are fulfilled by design.
          </p>
        </section>

        {/* Children */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">9. Children&apos;s Data</h2>
          <p>
            Ayurv is intended for use by adults (18 years and older). We do not knowingly collect or
            process data from children. If you are under 18, please use this tool only under the
            supervision of a parent or guardian.
          </p>
        </section>

        {/* Governing Law */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">10. Governing Law</h2>
          <p>
            This Privacy Policy is governed by the laws of India, including the Digital Personal Data
            Protection Act, 2023 and the Information Technology Act, 2000. Any disputes shall be subject
            to the exclusive jurisdiction of courts in India.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">11. Contact Us</h2>
          <p>
            For privacy-related questions, concerns, or data requests, please contact us at:
          </p>
          <p className="mt-2 font-medium text-ayurv-primary">
            [Contact email to be added before launch]
          </p>
        </section>

        {/* Changes */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with
            an updated &quot;Last updated&quot; date. Continued use of Ayurv after changes constitutes
            acceptance of the revised policy.
          </p>
        </section>
      </div>

      {/* Navigation */}
      <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between text-sm">
        <Link href="/terms" className="text-ayurv-primary hover:text-ayurv-accent underline">
          Terms of Service
        </Link>
        <Link href="/" className="text-ayurv-primary hover:text-ayurv-accent underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
