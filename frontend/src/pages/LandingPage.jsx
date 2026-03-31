import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { colors } from '../theme/colors';

function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      if (payload.exp * 1000 > Date.now()) {
        navigate('/dashboard');
      } else {
        localStorage.removeItem('access_token');
      }
    } catch {
      localStorage.removeItem('access_token');
    }
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', background: colors.background }}>

      {/* Header */}
      <div style={{ background: colors.primary, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ color: colors.white, fontSize: '20px', fontWeight: '600', margin: 0 }}>
            OpenGov Kenya
          </h1>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link to="/login" style={{ color: colors.white, textDecoration: 'none', fontSize: '14px', fontWeight: '500', opacity: 0.9 }}>
              Sign In
            </Link>
            <Link to="/register" style={{
              background: colors.white, color: colors.primary,
              padding: '8px 20px', borderRadius: '6px',
              textDecoration: 'none', fontSize: '14px', fontWeight: '600',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section - full width image */}
      <div style={{
        position: 'relative', width: '100%', minHeight: '92vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <img
          src="/images.jpg"
          alt="OpenGov Kenya hero image"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            filter: 'brightness(0.38)',
          }}
        />

        <div style={{
          position: 'relative', zIndex: 1, textAlign: 'center',
          padding: 'clamp(40px, 8vw, 100px) clamp(20px, 6vw, 80px)',
          maxWidth: '860px',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(16, 185, 129, 0.18)',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            padding: '8px 20px', borderRadius: '50px',
            marginBottom: '28px', fontSize: '13px',
            fontWeight: '600', color: '#6ee7b7',
            backdropFilter: 'blur(4px)',
          }}>
            <span style={{ width: '6px', height: '6px', background: '#6ee7b7', borderRadius: '50%' }} />
            AI-POWERED GOVERNANCE PLATFORM
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: '800',
            marginBottom: '24px', lineHeight: '1.1',
            color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}>
            Transparency Meets
            <br />
            <span style={{ color: '#34d399' }}>Technology</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2.2vw, 20px)',
            color: 'rgba(255,255,255,0.82)', lineHeight: '1.7',
            maxWidth: '640px', margin: '0 auto 40px',
          }}>
            Track government spending in education and health. Get AI-powered insights in simple language. Hold leaders accountable.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              background: colors.primary, color: colors.white,
              padding: '14px 32px', borderRadius: '8px',
              textDecoration: 'none', fontWeight: '600', fontSize: '16px',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
            }}>
              Start Free Today →
            </Link>
            <Link to="/login" style={{
              background: 'rgba(255,255,255,0.12)', color: '#ffffff',
              padding: '14px 32px', borderRadius: '8px',
              textDecoration: 'none', fontWeight: '600', fontSize: '16px',
              border: '1px solid rgba(255,255,255,0.35)',
              backdropFilter: 'blur(4px)',
            }}>
              Sign In
            </Link>
          </div>
        </div>

        {/* Fade into page background */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
          background: 'linear-gradient(to bottom, transparent, ' + colors.background + ')',
        }} />
      </div>

      {/* Features + CTA */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 40px' }}>

        {/* Features Section */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px', color: colors.dark }}>
              Built for <span style={{ color: colors.primary }}>Kenya</span>
            </h2>
            <p style={{ fontSize: '16px', color: colors.gray, maxWidth: '600px', margin: '0 auto' }}>
              Everything you need to understand and engage with government spending
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            {[
              { title: 'Visual Budget Tracking', desc: 'Interactive charts show exactly where every shilling goes. Compare spending across years and sectors instantly.' },
              { title: 'AI-Powered Insights', desc: 'Artificial intelligence reads complex budget documents and explains them in plain Kenyan English you can understand.' },
              { title: 'Direct Citizen Feedback', desc: 'Submit concerns about education or health services. Your feedback goes directly to government officials for review.' },
              { title: 'Real-Time Expenditure Monitoring', desc: 'Track government spending as it happens. See budget allocations versus actual expenditures in real-time.' },
              { title: 'Human-in-the-Loop Governance', desc: 'AI moderates submissions for quality, but real government officials review and make all final decisions.' },
              { title: 'Kenya-Specific Context', desc: 'Built with Kenyan governance structure in mind. Uses KSh currency and focuses on education and health priorities.' }
            ].map((feature, idx) => (
              <div key={idx} style={{
                background: colors.white, border: '1px solid ' + colors.border,
                borderRadius: '12px', padding: '32px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px', fontSize: '20px', fontWeight: '700', color: colors.primary
                }}>
                  {(idx + 1).toString().padStart(2, '0')}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: colors.dark }}>
                  {feature.title}
                </h3>
                <p style={{ color: colors.gray, lineHeight: '1.7', fontSize: '15px', margin: 0 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div style={{
          background: colors.white, border: '1px solid ' + colors.border,
          borderRadius: '12px', padding: '60px 40px',
          textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px', color: colors.dark }}>
            Ready to demand accountability?
          </h2>
          <p style={{ fontSize: '16px', color: colors.gray, marginBottom: '32px', lineHeight: '1.6' }}>
            Join thousands of Kenyans tracking government spending and making their voices heard.
          </p>
          <Link to="/register" style={{
            background: colors.primary, color: colors.white,
            padding: '14px 40px', borderRadius: '8px',
            textDecoration: 'none', fontWeight: '600', fontSize: '16px',
            display: 'inline-block', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
          }}>
            Start Now - It's Free →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: colors.white, borderTop: '1px solid ' + colors.border, padding: '40px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: colors.dark }}>
            OpenGov Kenya
          </div>
          <p style={{ color: colors.gray, fontSize: '14px', marginBottom: '16px' }}>
            Empowering Kenyan citizens through transparent governance
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <Link to="/privacy-policy" style={{ color: colors.gray, fontSize: '14px', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: colors.gray, fontSize: '14px', textDecoration: 'none' }}>Terms &amp; Conditions</Link>
          </div>
          <p style={{ color: colors.lightGray, fontSize: '13px' }}>
            © 2026 OpenGov Kenya. Built for the people.
          </p>
        </div>
      </div>

    </div>
  );
}

export default LandingPage;
