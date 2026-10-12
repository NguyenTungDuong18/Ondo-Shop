import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      className="pt-16 pb-12"
      style={{
        backgroundColor: 'var(--footer-bg)',
        borderTop: '1px solid var(--footer-border)',
        color: 'var(--footer-text-secondary)',
        transition: 'background-color 0.25s ease, border-color 0.25s ease',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Newsletter Callout Section */}
        <div
          className="rounded-3xl p-8 lg:p-12 mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          style={{
            backgroundColor: 'var(--footer-newsletter-bg)',
            border: '1px solid var(--footer-newsletter-border)',
          }}
        >
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold block"
              style={{ color: '#fbbf24' }}>
              A NOTE FROM ONDA
            </span>
            <h3 className="font-serif-hero text-3xl lg:text-5xl" style={{ color: 'var(--footer-text-primary)' }}>
              Good things take their time.
            </h3>
            <p className="text-xs leading-relaxed font-sans max-w-md" style={{ color: 'var(--footer-text-secondary)' }}>
              A small letter about useful beauty, the makers we admire, and the rituals that make a day feel like yours.
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-3">
            <input
              type="email"
              placeholder="Enter your email address..."
              className="w-full px-4 py-3 rounded-xl text-xs font-sans outline-none"
              style={{
                backgroundColor: 'var(--footer-bg)',
                border: '1px solid var(--footer-border)',
                color: 'var(--footer-text-primary)',
              }}
            />
            <button
              type="submit"
              className="px-6 py-3 text-xs font-mono uppercase tracking-wider inline-flex items-center gap-2 shrink-0 cursor-pointer rounded-xl font-medium"
              style={{
                backgroundColor: 'var(--footer-btn-bg)',
                color: 'var(--footer-btn-text)',
                border: '1px solid var(--footer-btn-bg)',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--footer-btn-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--footer-btn-bg)';
              }}
            >
              <span>Join the list</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Links Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-10 py-8"
          style={{ borderTop: '1px solid var(--footer-border)', borderBottom: '1px solid var(--footer-border)' }}
        >
          {/* Brand Info */}
          <div className="space-y-4">
            <span className="font-serif-hero text-4xl tracking-tight leading-none block" style={{ color: 'var(--footer-text-primary)' }}>
              Onda Studio.
            </span>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--footer-text-secondary)' }}>
              Onda is a quiet collection of useful things — chosen for the way they feel in your hand, and the way they stay in your life.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-mono uppercase tracking-widest font-bold" style={{ color: 'var(--footer-text-primary)' }}>The Edit</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/shop" className="footer-link">Shop the collection</Link></li>
              <li><Link to="/shop?category=Kitchen" className="footer-link">Kitchen & Dining</Link></li>
              <li><Link to="/shop?category=Living" className="footer-link">Home & Objects</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h5 className="text-xs font-mono uppercase tracking-widest font-bold" style={{ color: 'var(--footer-text-primary)' }}>Information</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="footer-link">Shipping & Returns</a></li>
              <li><a href="#" className="footer-link">Care instructions</a></li>
              <li><a href="#" className="footer-link">Contact studio</a></li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h5 className="text-xs font-mono uppercase tracking-widest font-bold" style={{ color: 'var(--footer-text-primary)' }}>Connect</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="footer-link">Instagram</a></li>
              <li><a href="#" className="footer-link">Journal entries</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] font-mono gap-4" style={{ color: 'var(--footer-text-muted)' }}>
          <p>© 2026 Onda Studio — Made slowly, wherever possible.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="footer-link">Terms</a>
            <a href="#" className="footer-link">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
