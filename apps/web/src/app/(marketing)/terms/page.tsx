export default function TermsPage() {
  return (
    <div className="py-20">
      <div className="container-narrow">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground mb-6">
            Last updated: January 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using the Maid UAE mobile application and website
              (collectively, the "Service"), you agree to be bound by these Terms of
              Service. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              Maid UAE is a platform that connects customers with licensed recruitment
              offices to find domestic workers including housemaids, nannies, and other
              domestic helpers. We act as an intermediary and do not directly employ any
              domestic workers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground mb-4">
              To use certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update any changes to your information</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. CV Unlock Payments</h2>
            <p className="text-muted-foreground">
              Customers may purchase CV unlocks to view contact information for domestic
              worker profiles. All payments are non-refundable unless otherwise required
              by applicable law. Once a CV is unlocked, it remains accessible indefinitely.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Office Subscriptions</h2>
            <p className="text-muted-foreground">
              Recruitment offices may subscribe to premium plans to list their domestic
              workers. Subscriptions auto-renew unless canceled. Offices are responsible
              for the accuracy of all worker profile information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Prohibited Activities</h2>
            <p className="text-muted-foreground mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Post false, misleading, or fraudulent content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Scrape or collect user data without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Disclaimer</h2>
            <p className="text-muted-foreground">
              Maid UAE does not guarantee the suitability, qualifications, or background
              of any domestic worker. Customers are responsible for conducting their own
              due diligence before hiring. We recommend verifying documents and references
              independently.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, Maid UAE shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages
              arising from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with the laws
              of the United Arab Emirates. Any disputes shall be subject to the exclusive
              jurisdiction of the courts of Dubai.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@maiduae.ae" className="text-primary hover:underline">
                legal@maiduae.ae
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
