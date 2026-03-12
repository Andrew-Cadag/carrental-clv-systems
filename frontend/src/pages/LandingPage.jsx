import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}>
      {/* Navbar */}
      <header className="landing-nav" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 80px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#1F3864">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
          <h2 style={{
            color: '#1F3864',
            fontSize: '22px',
            fontWeight: 'bold',
            margin: 0
          }}>
            DriveEase
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link 
            to="/login"
            style={{
              padding: '10px 20px',
              border: '2px solid #1F3864',
              borderRadius: '6px',
              color: '#1F3864',
              backgroundColor: 'white',
              textDecoration: 'none',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Login
          </Link>
          <Link 
            to="/register"
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              color: 'white',
              backgroundColor: '#1F3864',
              textDecoration: 'none',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero" style={{
        display: 'flex',
        padding: '80px',
        backgroundColor: 'white',
        gap: '60px',
        alignItems: 'center'
      }}>
        <div style={{ flex: 1, maxWidth: '500px' }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: '800',
            color: '#1F3864',
            margin: '0 0 24px 0',
            lineHeight: '1.1'
          }}>
            Rent Your Perfect <span style={{ color: '#1F3864' }}>Car Today</span>
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#64748b',
            margin: '0 0 32px 0',
            lineHeight: '1.6'
          }}>
            Affordable rates. Easy booking. Trusted by thousands of travelers worldwide.
          </p>
          <Link 
            to="/register"
            style={{
              display: 'inline-block',
              padding: '16px 40px',
              backgroundColor: '#1F3864',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Book Now
          </Link>
        </div>
        <div style={{ flex: 1 }}>
          <img 
            src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop&q=80"
            alt="Modern luxury car"
            style={{
              width: '100%',
              borderRadius: '16px',
              display: 'block',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
            }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-section" style={{
        backgroundColor: '#f6f7f7',
        padding: '80px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#1F3864',
            margin: '0 0 16px 0'
          }}>
            Why Choose DriveEase?
          </h2>
          <div style={{
            width: '60px',
            height: '4px',
            backgroundColor: '#1F3864',
            margin: '0 auto 16px auto',
            borderRadius: '2px'
          }}></div>
          <p style={{
            fontSize: '18px',
            color: '#64748b',
            margin: 0,
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Experience the best car rental service with features designed for your convenience and peace of mind.
          </p>
        </div>
        <div className="landing-features-grid" style={{
          display: 'flex',
          gap: '24px',
          justifyContent: 'center'
        }}>
          {/* Card 1 - Wide Selection */}
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '16px',
            borderBottom: '4px solid #1F3864',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            maxWidth: '300px',
            flex: 1
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              backgroundColor: 'rgba(31,56,100,0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#1F3864">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1F3864',
              margin: '0 0 12px 0'
            }}>
              Wide Selection
            </h3>
            <p style={{
              color: '#64748b',
              margin: 0,
              lineHeight: '1.5'
            }}>
              A huge variety of vehicles to choose from, ranging from economy to luxury models.
            </p>
          </div>
          {/* Card 2 - Easy Booking */}
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '16px',
            borderBottom: '4px solid #1F3864',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            maxWidth: '300px',
            flex: 1
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              backgroundColor: 'rgba(31,56,100,0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#1F3864">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1F3864',
              margin: '0 0 12px 0'
            }}>
              Easy Booking
            </h3>
            <p style={{
              color: '#64748b',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Book your car in just a few clicks with our streamlined and intuitive reservation process.
            </p>
          </div>
          {/* Card 3 - 24/7 Support */}
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '16px',
            borderBottom: '4px solid #1F3864',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            maxWidth: '300px',
            flex: 1
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              backgroundColor: 'rgba(31,56,100,0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#1F3864">
                <path d="M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3c4.86-2.5 8-7.18 8-11.5C20 5.81 16.19 2 11.5 2zm1 14.5h-2v-2h2v2zm0-4.5h-2V7h2v5z"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1F3864',
              margin: '0 0 12px 0'
            }}>
              24/7 Support
            </h3>
            <p style={{
              color: '#64748b',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Our dedicated support team is here to help you anytime, anywhere, for a smooth journey.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="landing-section" style={{
        backgroundColor: 'white',
        padding: '80px'
      }}>
        <div style={{
          backgroundColor: '#1F3864',
          borderRadius: '32px',
          padding: '64px',
          textAlign: 'center',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '40px',
            fontWeight: 'bold',
            color: 'white',
            margin: '0 0 16px 0',
            lineHeight: '1.2'
          }}>
            Ready to hit the road in your dream car?
          </h2>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.8)',
            margin: '0 0 32px 0'
          }}>
            Join over 50,000 satisfied customers and start your adventure today with DriveEase.
          </p>
          <Link 
            to="/register"
            style={{
              display: 'inline-block',
              padding: '16px 40px',
              backgroundColor: 'white',
              color: '#1F3864',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-section" style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e2e8f0',
        padding: '48px 80px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#1F3864">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
            <h3 style={{
              color: '#1F3864',
              fontSize: '20px',
              fontWeight: 'bold',
              margin: 0
            }}>
              DriveEase
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '32px' }}>
            <a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>Terms of Service</a>
            <a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>Contact Us</a>
          </div>
        </div>
        <p style={{
          color: '#64748b',
          fontSize: '14px',
          margin: 0
        }}>
          © 2023 DriveEase Car Rentals. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
