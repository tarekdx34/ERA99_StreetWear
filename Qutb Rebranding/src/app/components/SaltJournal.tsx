import { ArrowRight } from "lucide-react";
import { useState } from "react";

const articles = [
  {
    id: 1,
    category: "Fabric Education",
    title: "What Egyptian Cotton Actually Means",
    excerpt:
      "Long-staple. Extra-long staple. Giza grades. Not all Egyptian cotton is the same. Here is how to read what you are buying.",
    image: "https://images.unsplash.com/photo-1761069183521-fc1a0d8be3dd?w=800&h=520&fit=crop&auto=format",
    imgAlt: "Ripe cotton field ready for harvest",
    date: "May 2025",
    readTime: "6 min read",
    featured: true,
  },
  {
    id: 2,
    category: "Product Development",
    title: "The Stanley Box Tee: Two Years of Decisions",
    excerpt:
      "From the first sample to the cut we settled on — every decision that shaped the silhouette.",
    image: "https://images.unsplash.com/photo-1606343131164-ab932aeffdaa?w=600&h=400&fit=crop&auto=format",
    imgAlt: "White fabric samples on wooden table",
    date: "April 2025",
    readTime: "8 min read",
    featured: false,
  },
  {
    id: 3,
    category: "Alexandria",
    title: "A City That Built an Industry",
    excerpt:
      "Alexandria's garment history spans a century. We grew up in its factories. This is what we learned.",
    image: "https://images.unsplash.com/photo-1760973566831-4d029dc31c3e?w=600&h=400&fit=crop&auto=format",
    imgAlt: "Alexandria city skyline along the ocean",
    date: "March 2025",
    readTime: "5 min read",
    featured: false,
  },
  {
    id: 4,
    category: "Design Philosophy",
    title: "Why We Started With Three Shirts",
    excerpt:
      "No capsule collection. No drops. Just three cuts, done as well as we can do them.",
    image: "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=600&h=400&fit=crop&auto=format",
    imgAlt: "White crew-neck t-shirt minimal photography",
    date: "February 2025",
    readTime: "4 min read",
    featured: false,
  },
];

function ArticleCard({ article }: { article: typeof articles[0] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col cursor-pointer"
    >
      <div
        className="relative overflow-hidden mb-5"
        style={{ backgroundColor: '#EDE8DF', aspectRatio: article.featured ? '16/10' : '4/3' }}
      >
        <img
          src={article.image}
          alt={article.imgAlt}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
        />
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span
          style={{
            color: '#7C7C75',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.62rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: 300,
          }}
        >
          {article.category}
        </span>
        <span style={{ color: 'rgba(17,17,17,0.15)', fontSize: '0.6rem' }}>—</span>
        <span
          style={{
            color: 'rgba(17,17,17,0.35)',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.62rem',
            fontWeight: 300,
          }}
        >
          {article.date}
        </span>
      </div>

      <h3
        style={{
          color: '#111111',
          fontFamily: '"Bodoni Moda", serif',
          fontSize: article.featured ? 'clamp(1.4rem, 3vw, 2rem)' : '1.1rem',
          fontWeight: 400,
          lineHeight: 1.25,
          letterSpacing: '-0.005em',
          marginBottom: '0.75rem',
        }}
      >
        {article.title}
      </h3>

      <p
        style={{
          color: '#7C7C75',
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '0.82rem',
          lineHeight: 1.7,
          fontWeight: 300,
          marginBottom: '1rem',
        }}
      >
        {article.excerpt}
      </p>

      <div className="flex items-center gap-2 mt-auto group">
        <span
          style={{
            color: '#111111',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.68rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontWeight: 400,
            borderBottom: '1px solid rgba(17,17,17,0.35)',
            paddingBottom: '1px',
            transition: 'opacity 0.2s',
          }}
          className="group-hover:opacity-50"
        >
          Read
        </span>
        <ArrowRight
          size={12}
          strokeWidth={1.5}
          style={{ color: '#111111', transition: 'transform 0.2s' }}
          className="group-hover:translate-x-0.5"
        />
        <span
          style={{
            color: '#7C7C75',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.65rem',
            fontWeight: 300,
            marginLeft: '4px',
          }}
        >
          {article.readTime}
        </span>
      </div>
    </article>
  );
}

export function SaltJournal() {
  return (
    <section
      id="journal"
      className="bg-[#F5F0E8]"
      style={{ padding: 'clamp(80px, 10vw, 140px) clamp(24px, 6vw, 80px)' }}
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-20">
          <div>
            <p
              style={{
                color: '#7C7C75',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.65rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                fontWeight: 300,
                marginBottom: '1rem',
              }}
            >
              Editorial
            </p>
            <h2
              style={{
                color: '#111111',
                fontFamily: '"Bodoni Moda", serif',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
              }}
            >
              Salt Journal
            </h2>
          </div>
          <a
            href="#"
            className="flex items-center gap-2 group hover:opacity-60 transition-opacity self-start md:self-auto"
            style={{
              color: '#111111',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.72rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            <span>All Issues</span>
            <ArrowRight size={14} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Featured + grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Featured article — left, 6 cols */}
          <div className="lg:col-span-6">
            <ArticleCard article={articles[0]} />
          </div>

          {/* 3 smaller articles — right, 6 cols in 2-col grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-10 lg:gap-8">
            {articles.slice(1).map((article) => (
              <div
                key={article.id}
                className="lg:grid lg:grid-cols-2 lg:gap-6 flex flex-col"
              >
                <div
                  className="relative overflow-hidden mb-4 lg:mb-0"
                  style={{ backgroundColor: '#EDE8DF', aspectRatio: '4/3' }}
                >
                  <img
                    src={article.image}
                    alt={article.imgAlt}
                    className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      style={{
                        color: '#7C7C75',
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: '0.6rem',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        fontWeight: 300,
                      }}
                    >
                      {article.category}
                    </span>
                  </div>
                  <h3
                    style={{
                      color: '#111111',
                      fontFamily: '"Bodoni Moda", serif',
                      fontSize: '1.05rem',
                      fontWeight: 400,
                      lineHeight: 1.3,
                      marginBottom: '0.6rem',
                    }}
                  >
                    {article.title}
                  </h3>
                  <p
                    style={{
                      color: '#7C7C75',
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '0.78rem',
                      lineHeight: 1.65,
                      fontWeight: 300,
                      marginBottom: '0.75rem',
                    }}
                  >
                    {article.excerpt}
                  </p>
                  <a
                    href="#"
                    className="flex items-center gap-1.5 group hover:opacity-50 transition-opacity"
                    style={{ textDecoration: 'none' }}
                  >
                    <span
                      style={{
                        color: '#111111',
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: '0.65rem',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        fontWeight: 400,
                        borderBottom: '1px solid rgba(17,17,17,0.4)',
                        paddingBottom: '1px',
                      }}
                    >
                      Read
                    </span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
