import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#000', color: '#fff' }}>
      
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: scrollY > 50 ? 'rgba(0, 0, 0, 0.8)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em' }}>
          OpenGov<span style={{ color: '#3b82f6' }}>.</span>
        </div>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontSize: '15px', fontWeight: '500', opacity: 0.8 }}>
            Sign In
          </Link>
          <Link to="/register" style={{
            backgroundColor: '#3b82f6',
            color: '#fff',
            padding: '10px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: '600',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)'
          }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '80px'
      }}>
        {/* Animated Background Grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
          opacity: 0.5
        }} />
        
        {/* Gradient Orbs */}
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'float 20s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'float 15s ease-in-out infinite reverse'
        }} />

        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '0 40px', 
          width: '100%', 
          position: 'relative', 
          zIndex: 1 
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              padding: '10px 24px',
              borderRadius: '50px',
              marginBottom: '40px',
              fontSize: '14px',
              fontWeight: '600',
              letterSpacing: '0.5px'
            }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#10b981', 
                borderRadius: '50%',
                boxShadow: '0 0 10px #10b981'
              }} />
              AI-POWERED GOVERNANCE PLATFORM
            </div>

            {/* Main Headline */}
            <h1 style={{ 
              fontSize: '80px', 
              fontWeight: '900', 
              marginBottom: '30px', 
              lineHeight: '1.1',
              letterSpacing: '-0.03em',
              background: 'linear-gradient(to bottom, #ffffff, #a0a0a0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Transparency Meets
              <br />
              <span style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Technology
              </span>
            </h1>
            
            <p style={{ 
              fontSize: '24px', 
              marginBottom: '50px', 
              opacity: 0.7,
              lineHeight: '1.6',
              fontWeight: '400',
              maxWidth: '800px',
              margin: '0 auto 50px'
            }}>
              Track government spending in education and health. Get AI-powered insights in simple language. Hold leaders accountable.
            </p>
            
            {/* CTA Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              justifyContent: 'center',
              marginBottom: '80px',
              flexWrap: 'wrap'
            }}>
              <Link to="/register" style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                padding: '20px 50px',
                borderRadius: '14px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '18px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 20px 60px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.5)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <span>Start Free Today</span>
                <span style={{ fontSize: '22px' }}>→</span>
              </Link>
              
              <Link to="/login" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                padding: '20px 50px',
                borderRadius: '14px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '18px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div style={{ 
              display: 'flex',
              gap: '60px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              opacity: 0.5
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>100%</div>
                <div style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Free</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>2</div>
                <div style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Sectors</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>AI</div>
                <div style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Powered</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>24/7</div>
                <div style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Access</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0.3,
          animation: 'bounce 2s infinite'
        }}>
          <div style={{ fontSize: '24px' }}>↓</div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '120px 40px', position: 'relative' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 20px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '50px',
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '1px',
              marginBottom: '20px',
              textTransform: 'uppercase'
            }}>
              Features
            </div>
            <h2 style={{ 
              fontSize: '56px', 
              fontWeight: '800', 
              marginBottom: '20px',
              letterSpacing: '-0.02em'
            }}>
              Built for <span style={{ color: '#3b82f6' }}>Kenya</span>
            </h2>
            <p style={{ fontSize: '20px', opacity: 0.6, maxWidth: '700px', margin: '0 auto' }}>
              Everything you need to understand and engage with government spending
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '2px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            padding: '2px',
            borderRadius: '24px'
          }}>
            
            {[
              { 
                number: '01', 
                title: 'Visual Budget Tracking', 
                desc: 'Interactive charts show exactly where every shilling goes. Compare spending across years and sectors instantly.',
                color: '#3b82f6'
              },
              { 
                number: '02', 
                title: 'AI-Powered Insights', 
                desc: 'Artificial intelligence reads complex budget documents and explains them in plain Kenyan English you can understand.',
                color: '#10b981'
              },
              { 
                number: '03', 
                title: 'Direct Citizen Feedback', 
                desc: 'Submit concerns about education or health services. Your feedback goes directly to government officials for review.',
                color: '#8b5cf6'
              },
              { 
                number: '04', 
                title: 'Real-Time Expenditure Monitoring', 
                desc: 'Track government spending as it happens. See budget allocations versus actual expenditures in real-time.',
                color: '#f59e0b'
              },
              { 
                number: '05', 
                title: 'Human-in-the-Loop Governance', 
                desc: 'AI moderates submissions for quality, but real government officials review and make all final decisions.',
                color: '#ec4899'
              },
              { 
                number: '06', 
                title: 'Kenya-Specific Context', 
                desc: 'Built with Kenyan governance structure in mind. Uses KSh currency and focuses on education and health priorities.',
                color: '#06b6d4'
              }
            ].map((feature, idx) => (
              <div key={idx} style={{
                backgroundColor: '#000',
                padding: '50px 40px',
                borderRadius: idx === 0 ? '22px 0 0 0' : 
                             idx === 1 ? '0 22px 0 0' :
                             idx === 4 ? '0 0 0 22px' :
                             idx === 5 ? '0 0 22px 0' : '0',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}>
                {/* Gradient accent line */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: `linear-gradient(90deg, ${feature.color}, transparent)`
                }} />
                
                {/* Number badge */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '50px',
                  height: '50px',
                  backgroundColor: `${feature.color}15`,
                  border: `2px solid ${feature.color}30`,
                  borderRadius: '12px',
                  fontSize: '20px',
                  fontWeight: '800',
                  color: feature.color,
                  marginBottom: '25px'
                }}>
                  {feature.number}
                </div>
                
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  marginBottom: '15px',
                  letterSpacing: '-0.01em'
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.6)', 
                  lineHeight: '1.7', 
                  fontSize: '16px' 
                }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '120px 40px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: '56px', 
            fontWeight: '800', 
            marginBottom: '30px',
            letterSpacing: '-0.02em',
            lineHeight: '1.2'
          }}>
            Ready to demand accountability?
          </h2>
          <p style={{ fontSize: '20px', opacity: 0.7, marginBottom: '50px', lineHeight: '1.6' }}>
            Join thousands of Kenyans tracking government spending and making their voices heard.
          </p>
          <Link to="/register" style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            padding: '22px 60px',
            borderRadius: '14px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 20px 60px rgba(59, 130, 246, 0.4)'
          }}>
            Start Now - It's Free
            <span style={{ fontSize: '24px' }}>→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '60px 40px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '15px' }}>
            OpenGov<span style={{ color: '#3b82f6' }}>.</span>
          </div>
          <p style={{ opacity: 0.5, fontSize: '15px', marginBottom: '30px' }}>
            Empowering Kenyan citizens through transparent governance
          </p>
          <p style={{ opacity: 0.3, fontSize: '13px' }}>
            © 2026 OpenGov Kenya. Built for the people.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
