import { LegalPage } from "@/components";
import companyInfo from "../../../data/company-info.json";

const { contact } = companyInfo;
const { email, privacy_email, address } = contact;
const { street, city, state, zip } = address || {};

export default function Privacy() {
  return (
    <LegalPage>
      <h1 className="text-xl sm:text-3xl font-bold text-center border-b pb-4 mb-6 uppercase tracking-wider">
        www.wedefendit.com Privacy Policy
      </h1>

      <p className="text-center mb-4">
        <strong>Type of website:</strong> Service-based business website
        offering IT support, cybersecurity services, and technology consulting
        for residential and small business clients
        <br />
        <br />
        <strong>Effective date:</strong> 26th day of March, 2026
      </p>

      <p className="mb-6">
        www.wedefendit.com (the &quot;Site&quot;) is owned and operated by
        Defend I.T. Solutions&trade; LLC.
        <br />
        <br />
        Contact:{" "}
        <a href={`mailto:${email}`} className="text-blue-600 underline">
          {email}
        </a>
        <br />
        {street}, {city}, {state} {zip}
      </p>

      <h2 className="text-xl font-bold uppercase border-b my-4">Purpose</h2>
      <p>
        The purpose of this privacy policy (&quot;Privacy Policy&quot;) is to
        inform users of our Site of the following:
      </p>
      <ol className="list-decimal ml-6 my-2">
        <li>The personal data we will collect</li>
        <li>Use of collected data</li>
        <li>Who has access to the data collected</li>
        <li>The rights of Site users</li>
        <li>The Site&apos;s cookie policy</li>
      </ol>
      <p>
        This Privacy Policy applies in addition to the terms and conditions of
        our Site.
      </p>

      <h2 className="text-xl font-bold uppercase border-b my-4">Consent</h2>
      <p>By using our Site users agree that they consent to:</p>
      <ol className="list-decimal ml-6 my-2">
        <li>The conditions set out in this Privacy Policy</li>
        <li>
          The collection, use, and retention of the data listed in this Privacy
          Policy
        </li>
      </ol>

      <h2 className="text-xl font-bold uppercase border-b my-4">
        Personal Data We Collect
      </h2>
      <p>
        We only collect data that helps us achieve the purpose set out in this
        Privacy Policy. We will not collect any additional data beyond the data
        listed below without notifying you first.
      </p>

      <h3 className="font-semibold mt-4 mb-1 underline">
        Data Collected Automatically
      </h3>
      <p>
        When you visit and use our Site, we may automatically collect and store
        the following information:
      </p>
      <ul className="list-disc ml-6 my-2">
        <li>IP address</li>
        <li>Hardware and software details</li>
        <li>Clicked links</li>
      </ul>

      <h3 className="font-semibold mt-4 mb-1 underline">
        Data Collected in a Non-Automatic Way
      </h3>
      <p>
        We may also collect the following data when you perform certain
        functions on our Site:
      </p>
      <ul className="list-disc ml-6 my-2">
        <li>First and last name</li>
        <li>Email address</li>
      </ul>
      <p>This data may be collected using the following methods:</p>
      <ul className="list-disc ml-6 my-2">
        <li>Contact form submissions</li>
      </ul>

      <h2 className="text-xl font-bold uppercase border-b my-4">
        How We Use Personal Data
      </h2>
      <p>
        Data collected on our Site will only be used for the purposes specified
        in this Privacy Policy or indicated on the relevant pages of our Site.
        We will not use your data beyond what we disclose in this Privacy
        Policy.
      </p>
      <p className="mt-2">
        The data we collect automatically is used for the following purposes:
      </p>
      <ul className="list-disc ml-6 my-2">
        <li>Spam prevention and bot detection (Google reCAPTCHA)</li>
        <li>Email delivery confirmation tracking (Brevo)</li>
      </ul>
      <p>
        The data we collect when the user performs certain functions may be used
        for the following purposes:
      </p>
      <ul className="list-disc ml-6 my-2">
        <li>To respond to inquiries and communicate with potential clients</li>
      </ul>

      <h2 className="text-xl font-bold uppercase border-b my-4">
        Who We Share Personal Data With
      </h2>
      <h3 className="font-semibold mt-4 mb-1 underline">Employees</h3>
      <p>
        We may disclose user data to any member of our organization who
        reasonably needs access to user data to achieve the purposes set out in
        this Privacy Policy.
      </p>

      <h3 className="font-semibold mt-4 mb-1 underline">Third Parties</h3>
      <p>We may share user data with the following third parties:</p>
      <ol className="list-decimal ml-6 my-2">
        <li>
          <strong>Google LLC (reCAPTCHA)</strong> &mdash; IP address, browser
          and device fingerprint data &mdash; for spam prevention and bot
          detection
        </li>
        <li>
          <strong>Brevo (Sendinblue)</strong> &mdash; Email address, email
          interaction data (link clicks, opens) &mdash; for email delivery and
          contact form management
        </li>
      </ol>
      <p>
        Third parties will not be able to access user data beyond what is
        reasonably necessary to achieve the given purpose.
      </p>

      <h3 className="font-semibold mt-4 mb-1 underline">Other Disclosures</h3>
      <p>
        We will not sell or share your data with other third parties, except in
        the following cases:
      </p>
      <ul className="list-disc ml-6 my-2">
        <li>If the law requires it</li>
        <li>If it is required for any legal proceeding</li>
        <li>To prove or protect our legal rights</li>
        <li>
          To buyers or potential buyers of this company in the event that we
          seek to sell the company
        </li>
      </ul>
      <p>
        If you follow hyperlinks from our Site to another Site, please note that
        we are not responsible for and have no control over their privacy
        policies and practices.
      </p>

      <h2 className="text-xl font-bold uppercase border-b my-4">
        How Long We Store Personal Data
      </h2>
      <p>
        User data will be stored until the purpose the data was collected for
        has been achieved.
      </p>
      <p>
        You will be notified if your data is kept for longer than this period.
      </p>

      <h2 className="text-xl font-bold uppercase border-b my-4">
        How We Protect Your Personal Data
      </h2>
      <p>
        All data is transmitted over HTTPS. Email addresses are securely stored
        by our email service provider (Brevo) using industry-standard
        encryption. Access is restricted to authorized personnel. We do not sell
        or share personal information with third parties for marketing purposes.
      </p>
      <p className="mt-2">
        While we take all reasonable precautions to ensure that user data is
        secure and that users are protected, there always remains the risk of
        harm. The Internet as a whole can be insecure at times and therefore we
        are unable to guarantee the security of user data beyond what is
        reasonably practical.
      </p>

      <h2 className="text-xl font-bold uppercase border-b my-4">
        International Data Transfers
      </h2>
      <p>We transfer user personal data to the following countries:</p>
      <ol className="list-decimal ml-6 my-2">
        <li>United States</li>
        <li>France</li>
      </ol>
      <p>
        When we transfer user personal data we will protect that data as
        described in this Privacy Policy and comply with applicable legal
        requirements for transferring personal data internationally.
      </p>

      <h2 className="text-xl font-bold uppercase border-b my-4">Children</h2>
      <p>
        The minimum age to use our website is 13 years of age. We do not
        knowingly collect or use personal data from children under 13 years of
        age. If we learn that we have collected personal data from a child under
        13 years of age, the personal data will be deleted as soon as possible.
        If a child under 13 years of age has provided us with personal data
        their parent or guardian may contact our privacy officer.
      </p>

      <h2 className="text-xl font-bold uppercase border-b my-4">
        How to Access, Modify, Delete, or Challenge the Data Collected
      </h2>
      <p>
        If you would like to know if we have collected your personal data, how
        we have used your personal data, if we have disclosed your personal data
        and to who we disclosed your personal data, or if you would like your
        data to be deleted or modified in any way, please contact our privacy
        officer here:
      </p>
      <p className="my-2">
        Anthony Tropeano
        <br />
        <a href={`mailto:${privacy_email}`} className="text-blue-600 underline">
          {privacy_email}
        </a>
        <br />
        {street}, {city}, {state} {zip}
      </p>

      <h2 className="text-xl font-bold uppercase border-b my-4">
        Do Not Track Notice
      </h2>
      <p>
        Do Not Track (&quot;DNT&quot;) is a privacy preference that you can set
        in certain web browsers. We do not track the users of our Site over time
        and across third party websites and therefore do not respond to
        browser-initiated DNT signals. We are not responsible for and cannot
        guarantee how any third parties who interact with our Site and your data
        will respond to DNT signals.
      </p>

      <h2 className="text-xl font-bold uppercase border-b my-4">
        How to Opt-Out of Data Collection, Use or Disclosure
      </h2>
      <p>
        In addition to the method(s) described in the &quot;How to Access,
        Modify, Delete, or Challenge the Data Collected&quot; section, we
        provide the following specific opt-out methods:
      </p>
      <ol className="list-decimal ml-6 my-2">
        <li>
          Receiving waiting list and product launch notification emails. You can
          opt-out by clicking the unsubscribe link at the bottom of any email or
          by emailing{" "}
          <a
            href={`mailto:${privacy_email}`}
            className="text-blue-600 underline"
          >
            {privacy_email}
          </a>
          .
        </li>
      </ol>

      <h2 className="text-xl font-bold uppercase border-b my-4">
        Cookie Policy
      </h2>
      <p>
        A cookie is a small file, stored on a user&apos;s hard drive by a
        website. Its purpose is to collect data relating to the user&apos;s
        browsing habits. You can choose to be notified each time a cookie is
        transmitted. You can also choose to disable cookies entirely in your
        internet browser, but this may decrease the quality of your user
        experience.
      </p>
      <p className="mt-2">We use the following types of cookies on our Site:</p>
      <ol className="list-decimal ml-6 my-2">
        <li>
          <strong>Third-Party Cookies</strong> &mdash; Third-party cookies are
          created by a website other than ours. We may use third-party cookies
          to achieve the following purposes:
          <ul className="list-disc ml-6 mt-1">
            <li>Spam prevention and bot detection (Google reCAPTCHA)</li>
          </ul>
        </li>
      </ol>

      <h2 className="text-xl font-bold uppercase border-b my-4">
        Additional Clauses
      </h2>
      <p>
        We do not sell, trade, or otherwise transfer your personal information
        to outside parties. Data collected through our contact form is used
        solely to respond to your inquiry and will not be used for marketing
        without your explicit consent.
      </p>
      <p className="mt-2">
        <strong>Limitation of Liability:</strong> The company is not liable for
        indirect or consequential damages, including data loss, downtime, or
        third-party service issues. Liability is limited to the amount paid for
        services within the previous 30 days.
      </p>

      <h2 className="text-xl font-bold uppercase border-b my-4">
        Modifications
      </h2>
      <p>
        This Privacy Policy may be amended from time to time in order to
        maintain compliance with the law and to reflect any changes to our data
        collection process. When we amend this Privacy Policy we will update the
        &quot;Effective Date&quot; at the top of this Privacy Policy. We
        recommend that our users periodically review our Privacy Policy to
        ensure that they are notified of any updates. If necessary, we may
        notify users by email of changes to this Privacy Policy.
      </p>

      <h2 className="text-xl font-bold uppercase border-b my-4">
        Contact Information
      </h2>
      <p>
        If you have any questions, concerns, or complaints, you can contact our
        privacy officer:
      </p>
      <p className="my-2">
        Anthony Tropeano
        <br />
        <a href={`mailto:${privacy_email}`} className="text-blue-600 underline">
          {privacy_email}
        </a>
        <br />
        {street}, {city}, {state} {zip}
      </p>
    </LegalPage>
  );
}
