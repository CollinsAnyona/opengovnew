import { Link } from 'react-router-dom';
import { colors } from '../theme/colors';

const sections = [
  {
    title: '1. Accurate and Respectful Use',
    body: 'By using OpenGov, users agree to provide accurate and respectful feedback. Submissions must reflect genuine civic concerns and must not be used to spread misinformation or harass individuals.'
  },
  {
    title: '2. Prohibited Content',
    body: 'Users must not submit harmful, abusive, misleading, or illegal content. This includes but is not limited to hate speech, personal attacks, defamatory statements, or content that violates applicable laws.'
  },
  {
    title: '3. AI-Based Content Moderation',
    body: 'OpenGov uses AI-based moderation to review or flag content before storage. Flagged content may be withheld or removed. Users acknowledge that automated moderation may occasionally produce false positives, and human administrators provide final oversight.'
  },
  {
    title: '4. Platform Purpose and Limitations',
    body: 'The platform supports civic engagement and does not guarantee government action or outcomes. OpenGov serves as a transparency and communication tool; it does not have authority to compel any government body to act on submitted feedback.'
  },
  {
    title: '5. Limitation of Liability',
    body: 'OpenGov is not liable for how third parties interpret aggregated insights or public-facing outputs. The platform provides information in good faith and cannot be held responsible for decisions made by users or external parties based on that information.'
  },
  {
    title: '6. Acceptance of Terms',
    body: 'Continued use of the platform constitutes acceptance of these terms. OpenGov reserves the right to update these terms at any time. Users will be notified of significant changes, and continued use after such notification constitutes acceptance of the revised terms.'
  },
];

function TermsAndConditions() {
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
            Terms &amp; Conditions
          </h1>
          <p style={{ color: colors.gray, fontSize: '14px' }}>Last updated: January 2026</p>
          <p style={{ color: colors.gray, fontSize: '16px', lineHeight: '1.7', marginTop: '16px' }}>
            Please read these Terms and Conditions carefully before using the OpenGov Kenya platform. By accessing or using the platform, you agree to be bound by these terms.
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
            Questions about these terms?{' '}
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
            <Link to="/privacy-policy" style={{ color: colors.gray, fontSize: '14px', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: colors.primary, fontSize: '14px', textDecoration: 'none', fontWeight: '600' }}>Terms &amp; Conditions</Link>
          </div>
          <p style={{ color: colors.lightGray, fontSize: '13px', margin: 0 }}>© 2026 OpenGov Kenya. Built for the people.</p>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;
