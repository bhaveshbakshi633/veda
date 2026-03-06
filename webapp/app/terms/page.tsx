import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Ayurv",
  description: "Terms and conditions for using Ayurv herb safety intelligence tool.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-ayurv-primary mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: March 2026</p>

      <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
        {/* Intro */}
        <section>
          <p>
            By using Ayurv (&quot;the tool&quot;, &quot;the service&quot;), you agree to the following
            terms and conditions. If you do not agree, please do not use the tool.
          </p>
        </section>

        {/* Nature of Service */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">1. Nature of the Service</h2>
          <p>
            Ayurv provides <strong>educational information only</strong>. It is designed to help users
            explore published clinical evidence about Ayurvedic herbs, including safety data, potential
            drug interactions, and contraindications. The information presented is sourced from published
            scientific literature and pharmacological references.
          </p>
          <div className="bg-amber-50 border-l-4 border-risk-amber p-4 mt-3 text-sm text-gray-700">
            <p className="font-medium text-risk-amber mb-1">This tool does NOT:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Diagnose any medical condition</li>
              <li>Prescribe any treatment, herb, or medication</li>
              <li>Treat, cure, or prevent any disease</li>
              <li>Replace professional medical advice or consultation</li>
            </ul>
          </div>
        </section>

        {/* Not a Medical Device */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">2. Not a Medical Device</h2>
          <p>
            Ayurv is <strong>not</strong> a medical device as defined under Indian regulations, including
            the Medical Devices Rules, 2017 (under the Drugs &amp; Cosmetics Act, 1940). It is not
            registered, certified, or approved as a medical device by the Central Drugs Standard Control
            Organisation (CDSCO) or any regulatory body.
          </p>
        </section>

        {/* Not Telemedicine */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">3. Not a Telemedicine Service</h2>
          <p>
            Ayurv is <strong>not</strong> a telemedicine service. Using this tool does not create a
            doctor-patient relationship, practitioner-client relationship, or any therapeutic relationship
            of any kind. No licensed medical professional is involved in generating the results you see.
          </p>
        </section>

        {/* Dosage Information */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">4. Dosage &amp; Herb Information</h2>
          <p>
            Where dosage ranges are shown, they are drawn from published scientific and traditional
            literature. These figures are provided <strong>strictly for informational purposes</strong> —
            as a reference point for discussion with your qualified healthcare provider. They are not
            recommendations or prescriptions. Individual dosage requirements vary based on numerous
            factors that this tool cannot assess.
          </p>
        </section>

        {/* Disclaimer Acceptance */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">5. Mandatory Disclaimer Acceptance</h2>
          <p>
            Before accessing the assessment feature, users must accept a 3-point disclaimer acknowledging
            that:
          </p>
          <ol className="list-decimal pl-5 space-y-1 mt-2">
            <li>The information is educational only, not medical advice or a prescription.</li>
            <li>
              They will consult a qualified healthcare professional before acting on any information
              provided.
            </li>
            <li>
              They accept full responsibility for their health decisions and understand the tool does not
              diagnose, prescribe, or treat any condition.
            </li>
          </ol>
          <p className="mt-2">
            Use of Ayurv without accepting these conditions is not permitted. Acceptance is recorded
            per-session and is not persistent.
          </p>
        </section>

        {/* Limitations */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">6. Limitations &amp; Completeness</h2>
          <p>
            Ayurv covers a curated set of herbs, conditions, and interactions. It does <strong>not</strong>{" "}
            claim to be exhaustive. The tool may not include:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>All Ayurvedic or herbal products available in India or globally</li>
            <li>All possible drug-herb interactions</li>
            <li>All medical conditions, allergies, or contraindications</li>
            <li>Interactions with specific brands, formulations, or proprietary blends</li>
            <li>Recent research published after the last database update</li>
          </ul>
          <p className="mt-2">
            Absence of a warning does <strong>not</strong> mean absence of risk. Always verify with a
            qualified healthcare practitioner.
          </p>
        </section>

        {/* No Warranty */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">7. No Warranty</h2>
          <p>
            Ayurv is provided on an <strong>&quot;as-is&quot;</strong> and{" "}
            <strong>&quot;as-available&quot;</strong> basis. We make no warranties, express or implied,
            regarding:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>The accuracy, completeness, or reliability of the information</li>
            <li>The availability or uninterrupted operation of the service</li>
            <li>The suitability of the information for any specific health situation</li>
            <li>The timeliness of the clinical data presented</li>
          </ul>
        </section>

        {/* User Responsibility */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">8. User Responsibility</h2>
          <p>
            You are solely responsible for your health decisions. By using Ayurv, you acknowledge that:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              You will not rely solely on this tool for health or medication-related decisions.
            </li>
            <li>
              You will consult a qualified healthcare professional (doctor, pharmacist, or licensed
              practitioner) before starting, stopping, or modifying any herbal supplement or medication.
            </li>
            <li>
              You understand that herbal products can have serious interactions with prescription
              medications and medical conditions.
            </li>
            <li>
              You will provide accurate health information during the intake process, as inaccurate
              inputs may lead to incomplete safety assessments.
            </li>
          </ul>
        </section>

        {/* Limitation of Liability */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable Indian law, Ayurv and its creators shall not be
            liable for any direct, indirect, incidental, special, consequential, or punitive damages
            arising from:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Your use of or reliance on information provided by the tool</li>
            <li>Any health decisions made based on the tool&apos;s output</li>
            <li>Any errors, omissions, or inaccuracies in the information</li>
            <li>Any adverse health outcomes related to herbal products or interactions</li>
            <li>Inability to access or use the service</li>
          </ul>
          <p className="mt-2">
            This limitation applies regardless of the legal theory under which damages are sought.
          </p>
        </section>

        {/* Indemnification */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">10. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Ayurv and its creators from any claims, damages,
            losses, or expenses (including legal fees) arising from your use of the tool or violation of
            these terms.
          </p>
        </section>

        {/* Changes */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">11. Changes to These Terms</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Changes will be posted on
            this page with an updated &quot;Last updated&quot; date. Your continued use of Ayurv after
            any changes constitutes acceptance of the revised terms. We encourage you to review this page
            periodically.
          </p>
        </section>

        {/* Governing Law */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">12. Governing Law &amp; Jurisdiction</h2>
          <p>
            These Terms of Service are governed by and construed in accordance with the laws of India. Any
            disputes arising from or related to the use of Ayurv shall be subject to the exclusive
            jurisdiction of the courts in India.
          </p>
        </section>

        {/* Severability */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">13. Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid under applicable law,
            the remaining provisions shall continue in full force and effect.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-lg font-semibold text-ayurv-primary mb-3">14. Contact</h2>
          <p>
            For questions about these Terms of Service, please contact us at:
          </p>
          <p className="mt-2 font-medium text-ayurv-primary">
            legal@ayurv.in
          </p>
        </section>
      </div>

      {/* Navigation */}
      <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between text-sm">
        <Link href="/privacy" className="text-ayurv-primary hover:text-ayurv-accent underline">
          Privacy Policy
        </Link>
        <Link href="/" className="text-ayurv-primary hover:text-ayurv-accent underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
