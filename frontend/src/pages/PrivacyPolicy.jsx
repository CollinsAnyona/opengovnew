import { Link } from 'react-router-dom';
import { colors } from '../theme/colors';

const sections = [
  {
    title: '1. Information We Collect',
    body: 'OpenGov collects limited personal information, including user names and phone numbers, for account registration and system functionality. We collect only what is necessary to provide the platform\'s services.'
  },
  {
    title: '2. How We Use Your Information',
    body: 'User feedback submitted on the platform is processed separately from identifiable information where possible, to reduce privacy risks. Data is used solely to operate and improve the OpenGov platform.'
  },
  {
    title: '3. Data Security',
    body: 'All data is stored securely and access is restricted to authorized administrators. We apply industry-standard security measures to protect your personal information from unauthorized access or disclosure.'
  },
  {
    title: '4. Your Rights',
    body: 'Users may request access to, update, or deletion of their personal data at any time by contacting the platform administrators. We will respond to such requests within a reasonable timeframe.'
  },
  {
    title: '5. AI-Based Moderation',
    body: 'The platform uses AI-based moderation to filter harmful or inappropriate content before storage. Users are informed that automated moderation may not always be perfect, and human administrators provide oversight.'
  },
  {
    title: '6. Consent',
    body: 'By using OpenGov, users consent to the collection and processing of their data as described in this policy. Continued use of the platform after any updates to this policy constitutes acceptance of the revised terms.'
  },
];

function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: colors.background }}>
      {/* Header */}
      <div style={{ background: colors.primary, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ color: colors.white, textDecoration: 'none', fontSize: '20px', fontWeight: '600' }}>
            OpenGov Kenya
          </Link>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'clamp(32px, 6vw, 60px) clamp(16px, 5vw, 40px)' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: '800', color: colors.dark, marginBottom: '12px' }}>
            Privacy Policy
          </h1>
          <p style={{ color: colors.gray, fontSize: '14px' }}>Last updated: January 2026</p>
          <p style={{ color: colors.gray, fontSize: '16px', lineHeight: '1.7', marginTop: '16px' }}>
            OpenGov Kenya is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you use our platform.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {sections.map((section) => (
            <div key={section.title} style={{ background: colors.white, border: '1px solid ' + colors.border, borderRadius: '12px', padding: 'clamp(20px, 4vw, 32px)', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.dark, marginBottom: '12px' }}>
                {section.title}
              </h2>
              <p style={{ color: colors.gray, lineHeight: '1.8', fontSize: '15px', margin: 0 }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p style={{ color: colors.gray, fontSize: '14px' }}>
            Questions about this policy?{' '}
            <a href="mailto:cjotieno04@gmail.com" style={{ color: colors.primary, fontWeight: '600', textDecoration: 'none' }}>
              Contact us
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: colors.white, borderTop: '1px solid ' + colors.border, padding: '40px', marginTop: '40px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: colors.dark }}>OpenGov Kenya</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: colors.gray, fontSize: '14px', textDecoration: 'none' }}>Home</Link>
            <Link to="/privacy-policy" style={{ color: colors.primary, fontSize: '14px', textDecoration: 'none', fontWeight: '600' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: colors.gray, fontSize: '14px', textDecoration: 'none' }}>Terms &amp; Conditions</Link>
          </div>
          <p style={{ color: colors.lightGray, fontSize: '13px', margin: 0 }}>© 2026 OpenGov Kenya. Built for the people.</p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
