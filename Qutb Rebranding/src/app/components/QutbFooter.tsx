import { navigate } from "../nav";

type FooterLink = {
  label: string;
  action: () => void;
};

type FooterSection = {
  heading: string;
  links: FooterLink[];
};

const footerSections: FooterSection[] = [
  {
    heading: "Shop",
    links: [
      { label: "The Uniform", action: () => navigate("collection") },
      { label: "Stanley Box Tee", action: () => navigate("product") },
      { label: "Montaza Ringer", action: () => navigate("product") },
      { label: "Corniche Regular Tee", action: () => navigate("product") },
      { label: "Size Guide", action: () => navigate("collection") },
    ],
  },
  {
    heading: "Salt Journal",
    links: [
      { label: "Fabric Education", action: () => navigate("journey") },
      { label: "Manufacturing", action: () => navigate("manufacturing") },
      { label: "Alexandria", action: () => navigate("alex") },
      { label: "Fit Guides", action: () => navigate("salt") },
      { label: "Design Philosophy", action: () => navigate("philosophy") },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Our Story", action: () => navigate("alex") },
      { label: "Packaging", action: () => navigate("packaging") },
      { label: "Sustainability", action: () => navigate("sustainability") },
      { label: "Wholesale", action: () => navigate("wholesale") },
      { label: "Contact", action: () => navigate("contact") },
    ],
  },
];

export function QutbFooter() {
  return (
    <footer
      className="bg-[#FAF8F4]"
      style={{ fontFamily: '"DM Sans", sans-serif' }}
    >
      {/* Pre-footer band */}
      <div
        style={{
          backgroundColor: '#F5F0E8',
          borderTop: '1px solid rgba(17,17,17,0.08)',
          borderBottom: '1px solid rgba(17,17,17,0.08)',
          padding: '28px clamp(24px, 6vw, 80px)',
        }}
      >
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p
            style={{
              color: '#7C7C75',
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 300,
            }}
          >
            From Alexandria. Built to stay.
          </p>
          <form className="flex gap-0" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email"
              aria-label="Email for newsletter"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(17,17,17,0.2)',
                borderRight: 'none',
                padding: '10px 16px',
                color: '#111111',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.78rem',
                letterSpacing: '0.04em',
                width: '220px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: '#111111',
                color: '#FAF8F4',
                border: '1px solid #111111',
                padding: '10px 20px',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.68rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'opacity 0.2s',
              }}
              className="hover:opacity-70"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div
        style={{ padding: 'clamp(56px, 8vw, 96px) clamp(24px, 6vw, 80px) clamp(40px, 6vw, 64px)' }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
            {/* Brand col */}
            <div className="md:col-span-4">
              <div className="flex items-center gap-2.5 mb-6">
                <span style={{ display: 'flex', alignItems: 'baseline', color: '#111111' }}>
                  <span style={{ fontFamily: '"Gwendolyn", cursive', fontWeight: 700, fontSize: '2.6rem', lineHeight: 1 }}>Q</span>
                  <span style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: '1.69rem', letterSpacing: '0.06em' }}>UTB</span>
                </span>
              </div>

              <p
                style={{
                  color: '#7C7C75',
                  fontSize: '0.82rem',
                  lineHeight: 1.75,
                  fontWeight: 300,
                  maxWidth: '280px',
                  marginBottom: '1.5rem',
                }}
              >
                Premium basics label born in Alexandria, Egypt.
                Made by people who grew up around fabric.
              </p>

              <p
                style={{
                  color: 'rgba(17,17,17,0.3)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fontWeight: 300,
                }}
              >
                الإسكندرية — Alexandria, Egypt
              </p>
            </div>

            {/* Link columns */}
            {footerSections.map((section) => (
              <div key={section.heading} className="md:col-span-2 md:col-start-auto">
                <p
                  style={{
                    color: '#111111',
                    fontSize: '0.65rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontWeight: 400,
                    marginBottom: '1.25rem',
                  }}
                >
                  {section.heading}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <button
                        onClick={link.action}
                        style={{
                          color: '#7C7C75',
                          fontSize: '0.8rem',
                          fontWeight: 300,
                          textDecoration: 'none',
                          letterSpacing: '0.03em',
                          transition: 'color 0.15s',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          textAlign: 'left',
                        }}
                        className="hover:text-[#111111]"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="max-w-[1400px] mx-auto px-6 md:px-20 pb-10 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ borderTop: '1px solid rgba(17,17,17,0.08)', paddingTop: '28px' }}
      >
        <p
          style={{
            color: 'rgba(17,17,17,0.35)',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            fontWeight: 300,
          }}
        >
          © 2025 QUTB. All rights reserved.
        </p>

        <div className="flex items-center gap-6">
          {["Privacy", "Terms", "Shipping", "Returns"].map((item) => (
            <a
              key={item}
              href="#"
              style={{
                color: 'rgba(17,17,17,0.35)',
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                fontWeight: 300,
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
              className="hover:text-[#111111]"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
