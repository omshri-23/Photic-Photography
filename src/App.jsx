import {
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import {
  categoryCollections,
  categoryMeta,
  comparisons,
  fallbackPortfolioItems,
  featuredVault,
  highlights,
  profile,
} from "./data";

const testimonials = [
  {
    name: "Rutuja Patil",
    role: "Portrait Client",
    quote:
      "The final frames felt personal and polished. The edits kept the emotion while making every image feel cinematic.",
  },
  {
    name: "Sanket More",
    role: "Event Collaboration",
    quote:
      "Fast communication, clear workflow, and a strong visual style. Delivery was clean and on time.",
  },
  {
    name: "Atharva Joshi",
    role: "Creative Partner",
    quote:
      "Photic Photo has a strong eye for light and mood. Even everyday locations start looking intentional.",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Shoot",
    copy:
      "Plan the mood, frame for story, and capture enough texture and movement for a strong final edit.",
  },
  {
    number: "02",
    title: "Edit",
    copy:
      "Shape color, contrast, and crop with a cinematic finish while protecting the natural feel of the moment.",
  },
  {
    number: "03",
    title: "Deliver",
    copy:
      "Curate the strongest selects, organize by set, and send polished files ready for posting or archive.",
  },
];

const journalPosts = [
  {
    slug: "street-lighting-notes",
    title: "Finding clean light in crowded streets",
    excerpt:
      "How I look for edge light, reflective surfaces, and pauses in movement before taking the shot.",
  },
  {
    slug: "mobile-colour-grade",
    title: "My mobile color grading baseline",
    excerpt:
      "The edit order I use to keep images sharp, controlled, and cinematic without overprocessing skin or sky.",
  },
  {
    slug: "night-photo-rhythm",
    title: "What changes when the city goes dark",
    excerpt:
      "Night scenes need slower observation. This is how I build contrast, neon balance, and mood after sunset.",
  },
];

const pressMentions = [
  "Independent creator portfolio refresh - 2026 edition",
  "Selected frames shared across Instagram, YouTube, and GitHub",
  "Available for collaborations, portraits, reels, and editorial-style experiments",
];

const socialIcons = [
  { label: "Instagram", href: profile.links.instagram, icon: "instagram.svg" },
  { label: "GitHub", href: profile.links.github, icon: "github.svg" },
  { label: "YouTube", href: profile.links.youtube, icon: "youtube.svg" },
  { label: "LinkedIn", href: profile.links.linkedin, icon: "linkedin.svg" },
];

const filterCategories = [
  { slug: "all", title: "All" },
  ...categoryMeta.map((item) => ({ slug: item.slug, title: item.title })),
  { slug: "video", title: "Video" },
];

function toPublicUrl(url) {
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return url.startsWith("/") ? url : `/${url}`;
}

function createFallbackItems() {
  return fallbackPortfolioItems.map((item, index) => ({
    ...item,
    sort_order: item.sort_order ?? index,
  }));
}

function getCategoryFallbackItems(slug) {
  const images = categoryCollections.find((item) => item.slug === slug)?.images || [];
  return images.map((file, index) => ({
    id: `${slug}-${index}`,
    media_url: file,
    title: `Frame ${index + 1}`,
    category_slug: slug,
    media_type: "image",
    status: "published",
  }));
}

function formatCategoryItemTitle(index) {
  return String(index + 1).padStart(2, "0");
}

function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    return window.localStorage.getItem("photic-theme") || "dark";
  });

  useEffect(() => {
    document.body.dataset.theme = theme;
    window.localStorage.setItem("photic-theme", theme);
  }, [theme]);

  return {
    theme,
    toggleTheme() {
      setTheme((current) => (current === "dark" ? "light" : "dark"));
    },
  };
}

function useLikes() {
  const [likes, setLikes] = useState(() => {
    if (typeof window === "undefined") {
      return {};
    }

    try {
      return JSON.parse(window.localStorage.getItem("photic-likes") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    window.localStorage.setItem("photic-likes", JSON.stringify(likes));
  }, [likes]);

  function toggleLike(id) {
    setLikes((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  return { likes, toggleLike };
}

function usePortfolioData() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/portfolio");
        if (!response.ok) {
          throw new Error("Unable to load portfolio items.");
        }

        const payload = await response.json();
        const apiItems = Array.isArray(payload.items) ? payload.items : [];

        if (!active) {
          return;
        }

        if (apiItems.length > 0) {
          setItems(apiItems);
          setUsingFallback(false);
        } else {
          setItems(createFallbackItems());
          setUsingFallback(true);
        }
      } catch {
        if (active) {
          setItems(createFallbackItems());
          setUsingFallback(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return { items, loading, usingFallback };
}

function useDragScroll() {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return undefined;
    }

    let pointerId = null;
    let startX = 0;
    let scrollLeft = 0;

    function onPointerDown(event) {
      pointerId = event.pointerId;
      startX = event.clientX;
      scrollLeft = node.scrollLeft;
      node.dataset.dragging = "true";
      node.setPointerCapture(pointerId);
    }

    function onPointerMove(event) {
      if (pointerId === null) {
        return;
      }

      const delta = event.clientX - startX;
      node.scrollLeft = scrollLeft - delta;
    }

    function endDrag() {
      pointerId = null;
      delete node.dataset.dragging;
    }

    node.addEventListener("pointerdown", onPointerDown);
    node.addEventListener("pointermove", onPointerMove);
    node.addEventListener("pointerup", endDrag);
    node.addEventListener("pointerleave", endDrag);

    return () => {
      node.removeEventListener("pointerdown", onPointerDown);
      node.removeEventListener("pointermove", onPointerMove);
      node.removeEventListener("pointerup", endDrag);
      node.removeEventListener("pointerleave", endDrag);
    };
  }, []);

  return ref;
}

function useUiEffects() {
  useEffect(() => {
    const progress = document.getElementById("sb");
    const header = document.getElementById("hdr");
    const dot = document.getElementById("cd");
    const ring = document.getElementById("cr");
    const targets = "a,button,input,textarea,select,.gi,.cc,.strip-card,.testimonial-card,.journal-card";

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    function onScroll() {
      const top = document.documentElement.scrollTop;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) {
        progress.style.width = max > 0 ? `${(top / max) * 100}%` : "0%";
      }
      if (header) {
        header.classList.toggle("sc", top > 60);
      }
    }

    function onMouseMove(event) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (dot) {
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
      }
    }

    function animateCursor() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      if (ring) {
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
      }
      window.requestAnimationFrame(animateCursor);
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const element = entry.target;
          const target = Number(element.dataset.target || "0");
          let value = 0;
          const step = Math.max(target / 90, 1);

          function tick() {
            value = Math.min(target, value + step);
            element.textContent = `${Math.round(value)}${target >= 100 ? "+" : ""}`;
            if (value < target) {
              window.requestAnimationFrame(tick);
            }
          }

          tick();
          counterObserver.unobserve(element);
        });
      },
      { threshold: 0.5 },
    );

    document.querySelectorAll(".sr,.sl,.srr").forEach((node) => revealObserver.observe(node));
    document.querySelectorAll(".counter").forEach((node) => counterObserver.observe(node));
    document.querySelectorAll(targets).forEach((node) => {
      node.addEventListener("mouseenter", () => document.body.classList.add("hov"));
      node.addEventListener("mouseleave", () => document.body.classList.remove("hov"));
    });

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", () => document.body.classList.add("clk"));
    document.addEventListener("mouseup", () => document.body.classList.remove("clk"));
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    animateCursor();

    return () => {
      revealObserver.disconnect();
      counterObserver.disconnect();
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
}

function MediaImage({ src, alt, className = "" }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`media-image ${loaded ? "is-loaded" : ""}`}>
      <img
        src={toPublicUrl(src)}
        alt={alt}
        className={className}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="skeleton-card" />
      ))}
    </div>
  );
}

function SectionHeading({ eyebrow, title, className = "" }) {
  return (
    <div className={className}>
      <p className="tag">{eyebrow}</p>
      <h2 className="hl" dangerouslySetInnerHTML={{ __html: title }} />
      <div className="hr" />
    </div>
  );
}

function Header({ theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  return (
    <header id="hdr">
      <Link to="/" className="logo">
        Photic Photo
      </Link>
      <nav>
        <ul className={`nav-links ${menuOpen ? "op" : ""}`} id="navLinks">
          <li>
            <a href={location.pathname === "/" ? "#Vault" : "/#Vault"}>Vault</a>
          </li>
          <li>
            <a href={location.pathname === "/" ? "#lab" : "/#lab"}>Lab</a>
          </li>
          <li>
            <NavLink to="/about">About</NavLink>
          </li>
          <li>
            <a href={location.pathname === "/" ? "#contact" : "/#contact"}>Contact</a>
          </li>
          <li className={`dropdown-parent ${dropdownOpen ? "op" : ""}`}>
            <button
              type="button"
              className="nav-trigger"
              onClick={() => setDropdownOpen((current) => !current)}
            >
              Categories
            </button>
            <div className="dropdown">
              {categoryMeta.map((item) => (
                <Link key={item.slug} to={`/category/${item.slug}`}>
                  {item.title}
                </Link>
              ))}
            </div>
          </li>
          <li>
            <button type="button" className="theme-toggle" onClick={onToggleTheme}>
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </li>
        </ul>
        <button
          type="button"
          className={`menu-btn ${menuOpen ? "act" : ""}`}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <div className="fgrid">
        <div>
          <Link to="/" className="flogo">
            Photic Photo
          </Link>
          <p className="ftag">Capturing moments. Framing stories. One deliberate click at a time.</p>
          <div className="fsocs">
            {socialIcons.map((item) => (
              <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
                <img src={toPublicUrl(item.icon)} alt={item.label} />
              </a>
            ))}
          </div>
        </div>
        <div className="fcol">
          <h4>Explore</h4>
          <ul>
            <li>
              <a href="/#Vault">Vault</a>
            </li>
            <li>
              <a href="/#journal">Journal</a>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </div>
        <div className="fcol">
          <h4>Contact</h4>
          <p>{profile.email}</p>
          <p>{profile.backupEmail}</p>
          <p>{profile.phone}</p>
          <p>{profile.location}</p>
        </div>
        <div className="fcol">
          <h4>Links</h4>
          <p>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </p>
          <p>
            <a href={profile.links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </p>
          <p>
            <Link to="/admin">Admin dashboard</Link>
          </p>
        </div>
      </div>
      <div className="fbot">
        <span className="fcopy">© 2026 PHOTIC Photography. All rights reserved.</span>
        <span className="fcopy">Built in React, Vite, and Vercel.</span>
      </div>
    </footer>
  );
}

function WhatsAppFloat() {
  return (
    <a
      href={profile.links.whatsapp}
      target="_blank"
      rel="noreferrer"
      className="whatsapp-float"
      aria-label="Chat on WhatsApp"
      title="WhatsApp"
    >
      WA
    </a>
  );
}

function ScrollToTopFloat() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 320);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      className={`scroll-top-float ${visible ? "is-visible" : ""}`}
      aria-label="Scroll to top"
      title="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </button>
  );
}

function Hero({ featured }) {
  const creatorImage = featured?.media_url || categoryMeta[1]?.cover || categoryMeta[0]?.cover;

  return (
    <section className="hero">
      <div className="hbg" />
      <div className="hgrid" />
      <div className="hrings">
        <div className="ring" />
        <div className="ring" />
        <div className="ring" />
        <div className="ring" />
      </div>
      <div className="hparts">
        {Array.from({ length: 16 }).map((_, index) => (
          <span
            key={index}
            className="particle"
            style={{
              left: `${10 + index * 5}%`,
              bottom: `${8 + (index % 5) * 8}%`,
              width: `${1 + (index % 3)}px`,
              height: `${1 + (index % 3)}px`,
              animationDuration: `${6 + (index % 5)}s`,
              animationDelay: `${index * 0.35}s`,
            }}
          />
        ))}
      </div>
      <div className="hero-layout">
        <div className="hero-copy">
          <p className="hero-ey">Visual Storytelling Studio</p>
          <h1 className="hero-h1">
            Welcome to
            <em>Photic Photo Lab</em>
          </h1>
          <p className="hero-sub">{profile.tagline}</p>
          <div className="hero-cta">
            <a href="#Vault" className="btn-fill">
              View Gallery
            </a>
            <a href="#strip" className="btn-line">
              Drag Scroll Strip
            </a>
          </div>
          {featured?.media_url ? (
            <div className="hero-spotlight sr in">
              <span>Featured of the month</span>
              <strong>{featured.title || "Cinematic Frame"}</strong>
            </div>
          ) : null}
        </div>
        <aside className="hero-card sr in">
          <div className="hero-card-media">
            <MediaImage src={creatorImage} alt={profile.name} />
          </div>
          <div className="hero-card-body">
            <span className="hero-card-tag">About the creator</span>
            <h2>{profile.name}</h2>
            <p className="hero-card-role">{profile.title}</p>
            <p className="hero-card-location">{profile.location}</p>
            <div className="hero-stats">
              {highlights.slice(0, 3).map((item) => (
                <div key={item.label} className="hero-stat">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="hero-card-footer">
              <p>Available for collaborations</p>
              <a href={profile.links.instagram} target="_blank" rel="noreferrer" className="btn-line hero-card-link">
                Instagram
              </a>
            </div>
          </div>
        </aside>
      </div>
      <div className="scind">
        <div className="sctrack">
          <div className="scfill" />
        </div>
        <span>Scroll</span>
      </div>
    </section>
  );
}

function HorizontalStrip({ items, onOpen }) {
  const scrollRef = useDragScroll();

  return (
    <section className="strip-section" id="strip">
      <SectionHeading eyebrow="Signature Frames" title={"Drag <em>Gallery</em>"} className="sr" />
      <div className="strip-copy sr">
        Smooth horizontal drag-to-scroll for quick browsing across featured frames and experiments.
      </div>
      <div ref={scrollRef} className="strip-track">
        {items.map((item, index) => (
          <button
            type="button"
            className="strip-card"
            key={item.id}
            onClick={() => onOpen(index)}
          >
            <MediaImage src={item.thumbnail_url || item.media_url} alt={item.title || "Portfolio frame"} />
            <div className="strip-card-body">
              <span>{item.category_slug || "featured"}</span>
              <strong>{item.title || `Frame ${index + 1}`}</strong>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function VaultGallery({
  items,
  loading,
  usingFallback,
  filter,
  sort,
  search,
  mode,
  likes,
  onFilterChange,
  onSortChange,
  onSearchChange,
  onModeChange,
  onToggleLike,
  onShare,
  onOpen,
}) {
  const deferredSearch = useDeferredValue(search);

  const filteredItems = items
    .filter((item) => item.media_type === "image")
    .filter((item) => filter === "all" || item.category_slug === filter)
    .filter((item) => {
      const haystack = `${item.title || ""} ${item.description || ""} ${item.category_slug || ""}`.toLowerCase();
      return haystack.includes(deferredSearch.trim().toLowerCase());
    })
    .sort((left, right) => {
      if (sort === "title") {
        return (left.title || "").localeCompare(right.title || "");
      }

      if (sort === "newest") {
        return new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime();
      }

      return Number(right.featured) - Number(left.featured) || (left.sort_order || 0) - (right.sort_order || 0);
    });

  return (
    <section id="Vault">
      <div className="vault-top sr">
        <div>
          <p className="tag">Selected Works</p>
          <h2 className="hl">
            Photic <em>Vault</em>
          </h2>
        </div>
        <div className="vault-actions">
          <button type="button" className={mode === "editorial" ? "chip active" : "chip"} onClick={() => onModeChange("editorial")}>
            Editorial
          </button>
          <button type="button" className={mode === "masonry" ? "chip active" : "chip"} onClick={() => onModeChange("masonry")}>
            Masonry
          </button>
        </div>
      </div>
      <div className="vault-toolbar sr">
        <div className="filter-row">
          {filterCategories.map((item) => (
            <button
              key={item.slug}
              type="button"
              className={filter === item.slug ? "chip active" : "chip"}
              onClick={() => onFilterChange(item.slug)}
            >
              {item.title}
            </button>
          ))}
        </div>
        <div className="vault-controls">
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search photos"
            aria-label="Search photos"
          />
          <select value={sort} onChange={(event) => onSortChange(event.target.value)} aria-label="Sort photos">
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>
        {usingFallback ? <p className="api-note sr">No local gallery images are loaded. Add portfolio media from the admin login page.</p> : null}
        {loading ? (
          <SkeletonGrid />
        ) : filteredItems.length === 0 ? (
          <div className="admin-header">No gallery items yet. Add them from the admin login page.</div>
        ) : (
        <div className={mode === "masonry" ? "gg gg-masonry" : "gg"}>
          {filteredItems.map((item, index) => (
            <article className="gi sr" key={item.id} id={item.id}>
              <button type="button" className="gallery-hit" onClick={() => onOpen(index, filteredItems)}>
                <MediaImage src={item.thumbnail_url || item.media_url} alt={item.title || `Portfolio image ${index + 1}`} className="lbimg" />
              </button>
              <div className="gimeta">
                <div>
                  <span className="ginum">
                    {String(index + 1).padStart(2, "0")} - {item.category_slug || "work"}
                  </span>
                  <strong className="gallery-title">{item.title || `Frame ${index + 1}`}</strong>
                </div>
                <div className="gallery-meta-actions">
                  <button type="button" className={likes[item.id] ? "icon-pill active" : "icon-pill"} onClick={() => onToggleLike(item.id)}>
                    Like
                  </button>
                  <button type="button" className="icon-pill" onClick={() => onShare(item)}>
                    Share
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function LabSection({ itemCount }) {
  return (
    <section id="lab">
      <div className="lab-copy sl">
        <SectionHeading eyebrow="About the Lab" title={"Photic <em>Lab</em>"} />
        <p>{profile.intro}</p>
      </div>
      <div className="lab-stats srr">
        <div className="stat">
          <div className="stat-n counter" data-target={itemCount || 120}>0</div>
          <div className="stat-l">Frames archived</div>
        </div>
        <div className="stat">
          <div className="stat-n counter" data-target={categoryMeta.length}>0</div>
          <div className="stat-l">Categories</div>
        </div>
        <div className="stat">
          <div className="stat-n counter" data-target={3}>0</div>
          <div className="stat-l">Years active</div>
        </div>
        <div className="stat">
          <div className="stat-n counter" data-target={100}>0</div>
          <div className="stat-l">Happy clients</div>
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  return (
    <section className="categories">
      <div className="cat-head sr">
        <SectionHeading eyebrow="Browse by Genre" title={"Lab <em>Categories</em>"} />
      </div>
      <div className="cgrid">
        {categoryMeta.map((item, index) => (
          <Link key={item.slug} className="cc sr" to={`/category/${item.slug}`} style={{ transitionDelay: `${(index + 1) * 0.04}s` }}>
            <MediaImage src={item.cover} alt={item.title} />
            <div className="cov" />
            <div className="carr">Go</div>
            <div className="cbody">
              <div className="cnum">{String(index + 1).padStart(2, "0")} / {item.title}</div>
              <div className="cname">{item.title}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="process-section">
      <SectionHeading eyebrow="Workflow" title={"Shoot <em>to Delivery</em>"} className="sr" />
      <div className="process-grid">
        {processSteps.map((item) => (
          <article key={item.number} className="process-card sr">
            <span>{item.number}</span>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function BeforeAfterSection() {
  return (
    <section className="bas">
      <SectionHeading eyebrow="Edit Process" title={"Before <em>&amp; After</em>"} className="sr" />
      <div className="bagrid">
        {comparisons.map((item, index) => (
          <BeforeAfterCard key={item.title} item={item} delay={index} />
        ))}
      </div>
    </section>
  );
}

function BeforeAfterCard({ item, delay }) {
  const [value, setValue] = useState(50);

  return (
    <div className="cw sr" style={{ transitionDelay: `${delay * 0.08}s` }}>
      <div className="bacomp">
        <div className="bares" style={{ width: `${value}%` }}>
          <MediaImage src={item.before} alt={`${item.title} before`} />
        </div>
        <MediaImage src={item.after} alt={`${item.title} after`} />
        <div className="baline" style={{ left: `${value}%` }}>
          <div className="baknob">Slide</div>
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        className="basl"
        onChange={(event) => setValue(Number(event.target.value))}
      />
      <span className="balbl l">Before</span>
      <span className="balbl r">After</span>
    </div>
  );
}

function VideoSection({ items }) {
  const videos = items.filter((item) => item.media_type === "video").slice(0, 4);

  if (videos.length === 0) {
    return null;
  }

  return (
    <section className="vs" id="video">
      <SectionHeading eyebrow="Color Grading Samples" title={"Shot <em>Reels</em>"} className="sr" />
      <div className="vgrid">
        {videos.map((item, index) => (
          <VideoCard key={item.id} item={item} delay={index} />
        ))}
      </div>
    </section>
  );
}

function VideoCard({ item, delay }) {
  const ref = useRef(null);
  const [muted, setMuted] = useState(true);

  return (
    <article
      className="vw sr"
      style={{ transitionDelay: `${delay * 0.08}s` }}
      onMouseEnter={() => ref.current?.play()}
      onMouseLeave={() => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
        }
      }}
    >
      <video ref={ref} src={toPublicUrl(item.media_url)} muted={muted} playsInline poster={toPublicUrl(item.thumbnail_url)} />
      <div className="vlbl">{item.title || "Video reel"}</div>
      <button type="button" className="mbtn" onClick={() => setMuted((current) => !current)}>
        {muted ? "Unmute" : "Mute"}
      </button>
    </article>
  );
}

function SpotlightSection({ item }) {
  if (!item) {
    return null;
  }

  return (
    <section className="spotlight-section">
      <div className="spotlight-media sr">
        <MediaImage src={item.media_url} alt={item.title || "Featured frame"} />
      </div>
      <div className="spotlight-copy srr">
        <p className="tag">Spotlight</p>
        <h2 className="hl">
          Photo of the <em>Month</em>
        </h2>
        <div className="hr" />
        <p>{item.description || "A selected frame that represents the current tone of the archive."}</p>
        <strong>{item.title || "Featured cinematic frame"}</strong>
      </div>
    </section>
  );
}

function TestimonialSection() {
  return (
    <section className="testimonials-section">
      <SectionHeading eyebrow="Client Reviews" title={"Words from <em>Collaborators</em>"} className="sr" />
      <div className="testimonials-grid">
        {testimonials.map((item) => (
          <article key={item.name} className="testimonial-card sr">
            <p>{item.quote}</p>
            <strong>{item.name}</strong>
            <span>{item.role}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function JournalSection() {
  return (
    <section className="journal-section" id="journal">
      <SectionHeading eyebrow="Journal" title={"Behind the <em>Frames</em>"} className="sr" />
      <div className="journal-grid">
        {journalPosts.map((item) => (
          <article key={item.slug} className="journal-card sr">
            <span>Journal note</span>
            <h3>{item.title}</h3>
            <p>{item.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PressSection() {
  return (
    <section className="press-section">
      <SectionHeading eyebrow="Awards and Press" title={"Signals of <em>Momentum</em>"} className="sr" />
      <div className="press-list">
        {pressMentions.map((item) => (
          <article key={item} className="press-card sr">
            {item}
          </article>
        ))}
      </div>
    </section>
  );
}

function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [state, setState] = useState({ loading: false, message: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setState({ loading: true, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to send message.");
      }

      setForm({ name: "", email: "", subject: "", message: "" });
      setState({ loading: false, message: "Message sent successfully." });
    } catch (error) {
      setState({ loading: false, message: error.message });
    }
  }

  return (
    <section className="contact" id="contact">
      <div className="contact-left">
        <div className="sl">
          <SectionHeading eyebrow="Let's Connect" title={"Get in <em>Touch</em>"} />
        </div>
        <p className="cdesc sl">Open for collaborations, portraits, reels, or visual experiments. Reach out and the message will land in the admin dashboard and by email notification.</p>
        <div className="citems sl">
          <div className="ci">
            <span className="cilbl">Email</span>
            <span className="cival">
              {profile.email}
              <small>{profile.backupEmail}</small>
            </span>
          </div>
          <div className="ci">
            <span className="cilbl">Location</span>
            <span className="cival">{profile.location}</span>
          </div>
          <div className="ci">
            <span className="cilbl">Phone</span>
            <span className="cival">{profile.phone}</span>
          </div>
        </div>
        <div className="socs sl">
          {Object.entries(profile.links).map(([key, value]) => (
            <a key={key} href={value} target="_blank" rel="noreferrer" className="soc">
              {key}
            </a>
          ))}
        </div>
      </div>
      <form className="cform srr" onSubmit={handleSubmit}>
        <div className="ig">
          <input
            type="text"
            id="nm"
            placeholder=" "
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
          <label htmlFor="nm">Your Name</label>
        </div>
        <div className="ig">
          <input
            type="email"
            id="em"
            placeholder=" "
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
          <label htmlFor="em">Email Address</label>
        </div>
        <div className="ig">
          <input
            type="text"
            id="sub"
            placeholder=" "
            value={form.subject}
            onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
          />
          <label htmlFor="sub">Subject</label>
        </div>
        <div className="ig">
          <textarea
            id="msg"
            placeholder=" "
            rows="5"
            value={form.message}
            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
            required
          />
          <label htmlFor="msg">Your Message</label>
        </div>
        <button type="submit" className="fbtn" disabled={state.loading}>
          {state.loading ? "Sending..." : "Send Message"}
        </button>
        {state.message ? <p className="form-state">{state.message}</p> : null}
      </form>
    </section>
  );
}

function SlideshowOverlay({ items, index, onClose, onPrev, onNext, likes, onToggleLike, onShare }) {
  useEffect(() => {
    if (index < 0) {
      return undefined;
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "ArrowLeft") {
        onPrev();
      }
      if (event.key === "ArrowRight") {
        onNext();
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [index, onClose, onNext, onPrev]);

  if (index < 0 || items.length === 0) {
    return null;
  }

  const item = items[index];

  return (
    <div id="lb" className="open" onClick={onClose}>
      <button type="button" className="lbc" onClick={onClose}>
        Close
      </button>
      <button type="button" className="slide-nav prev" onClick={(event) => { event.stopPropagation(); onPrev(); }}>
        Prev
      </button>
      <div className="slideshow-shell" onClick={(event) => event.stopPropagation()}>
        <MediaImage src={item.media_url} alt={item.title || "Portfolio frame"} />
        <div className="slideshow-meta">
          <div>
            <span>{item.category_slug || "work"}</span>
            <strong>{item.title || "Cinematic frame"}</strong>
          </div>
          <div className="gallery-meta-actions">
            <button type="button" className={likes[item.id] ? "icon-pill active" : "icon-pill"} onClick={() => onToggleLike(item.id)}>
              Like
            </button>
            <button type="button" className="icon-pill" onClick={() => onShare(item)}>
              Share
            </button>
          </div>
        </div>
      </div>
      <button type="button" className="slide-nav next" onClick={(event) => { event.stopPropagation(); onNext(); }}>
        Next
      </button>
    </div>
  );
}

function HomePage({ items, loading, usingFallback, likes, onToggleLike, onShare }) {
  const featuredImages = items.filter((item) => item.media_type === "image").slice(0, 10);
  const spotlight = items.find((item) => item.featured) || featuredImages[0];
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("featured");
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("editorial");
  const [slideItems, setSlideItems] = useState(featuredImages);
  const [slideIndex, setSlideIndex] = useState(-1);

  function openSlideshow(index, sourceItems = featuredImages) {
    setSlideItems(sourceItems);
    setSlideIndex(index);
  }

  return (
    <>
      <Hero featured={spotlight} />
      {featuredImages.length > 0 ? (
        <HorizontalStrip items={featuredImages.slice(0, 8)} onOpen={(index) => openSlideshow(index, featuredImages.slice(0, 8))} />
      ) : null}
      <VaultGallery
        items={items}
        loading={loading}
        usingFallback={usingFallback}
        filter={filter}
        sort={sort}
        search={search}
        mode={mode}
        likes={likes}
        onFilterChange={setFilter}
        onSortChange={setSort}
        onSearchChange={setSearch}
        onModeChange={setMode}
        onToggleLike={onToggleLike}
        onShare={onShare}
        onOpen={openSlideshow}
      />
      <LabSection itemCount={items.length} />
      <ProcessSection />
      <CategoriesSection />
      <BeforeAfterSection />
      <VideoSection items={items} />
      <SpotlightSection item={spotlight} />
      <TestimonialSection />
      <JournalSection />
      <PressSection />
      <ContactSection />
      <SlideshowOverlay
        items={slideItems}
        index={slideIndex}
        onClose={() => setSlideIndex(-1)}
        onPrev={() => setSlideIndex((current) => (current <= 0 ? slideItems.length - 1 : current - 1))}
        onNext={() => setSlideIndex((current) => (current >= slideItems.length - 1 ? 0 : current + 1))}
        likes={likes}
        onToggleLike={onToggleLike}
        onShare={onShare}
      />
    </>
  );
}

function AboutPage() {
  return (
    <main className="category-main route-panel">
      <section className="category-hero">
        <div className="category-copy sr in">
          <p className="tag">About</p>
          <h1 className="hl">
            Built from a first portfolio into a <em>working studio</em>
          </h1>
          <div className="hr" />
          {profile.about.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="category-image-wrap srr in">
          <MediaImage src={categoryMeta[0].cover} alt="Photic Photo cover" />
        </div>
      </section>
    </main>
  );
}

function CategoryPage({ items: portfolioItems, usingFallback, likes, onToggleLike, onShare }) {
  const { slug } = useParams();
  const meta = categoryMeta.find((item) => item.slug === slug);
  const items = usingFallback
    ? getCategoryFallbackItems(slug)
    : portfolioItems.filter(
        (item) =>
          item.category_slug === slug &&
          item.media_type === "image" &&
          item.status === "published",
      );
  const [slideIndex, setSlideIndex] = useState(-1);

  if (!meta) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="category-main route-panel">
      <section className="category-hero">
        <div className="category-copy sr in">
          <p className="tag">Collection</p>
          <h1 className="hl">
            {meta.title} <em>Archive</em>
          </h1>
          <div className="hr" />
          <p>{meta.description}</p>
        </div>
        <div className="category-image-wrap srr in">
          <MediaImage src={meta.cover} alt={meta.title} />
        </div>
        </section>
        <section className="category-gallery">
          {items.length === 0 ? (
            <div className="admin-header">No published images in this category yet. Add them from admin.</div>
          ) : (
              <div className="gg category-grid-alt">
                {items.map((item, index) => (
                  <article key={item.id} className="gi sr in">
                    <button type="button" className="gallery-hit" onClick={() => setSlideIndex(index)}>
                      <MediaImage
                        src={item.media_url}
                        alt={`${meta.title} ${String(index + 1).padStart(2, "0")}`}
                      />
                    </button>
                    <div className="gimeta">
                      <div>
                        <span className="ginum">{meta.title}</span>
                        <strong className="gallery-title">
                          {formatCategoryItemTitle(index)}
                        </strong>
                      </div>
                      <div className="gallery-meta-actions">
                        <button type="button" className={likes[item.id] ? "icon-pill active" : "icon-pill"} onClick={() => onToggleLike(item.id)}>
                          Like
                      </button>
                      <button type="button" className="icon-pill" onClick={() => onShare(item)}>
                        Share
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      <SlideshowOverlay
        items={items}
        index={slideIndex}
        onClose={() => setSlideIndex(-1)}
        onPrev={() => setSlideIndex((current) => (current <= 0 ? items.length - 1 : current - 1))}
        onNext={() => setSlideIndex((current) => (current >= items.length - 1 ? 0 : current + 1))}
        likes={likes}
        onToggleLike={onToggleLike}
        onShare={onShare}
      />
    </main>
  );
}

function AdminPage() {
  const [token, setToken] = useState(() => window.localStorage.getItem("photic-admin-token") || "");
  const [login, setLogin] = useState({ username: "", password: "" });
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    mediaType: "image",
    categorySlug: "nature",
    mediaUrl: "",
    thumbnailUrl: "",
    featured: false,
    status: "published",
    sortOrder: 0,
  });
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [messages, setMessages] = useState([]);
  const [state, setState] = useState("");

  async function loadAdminData(activeToken) {
    const headers = { Authorization: `Bearer ${activeToken}` };
    const [portfolioResponse, messagesResponse] = await Promise.all([
      fetch("/api/admin-portfolio", { headers }),
      fetch("/api/admin-messages", { headers }),
    ]);

    if (!portfolioResponse.ok || !messagesResponse.ok) {
      throw new Error("Unable to load admin data.");
    }

    const portfolioPayload = await portfolioResponse.json();
    const messagesPayload = await messagesResponse.json();
    setPortfolioItems(portfolioPayload.items || []);
    setMessages(messagesPayload.messages || []);
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    loadAdminData(token).catch((error) => setState(error.message));
  }, [token]);

  async function handleLogin(event) {
    event.preventDefault();
    setState("");

    const response = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(login),
    });
    const payload = await response.json();

    if (!response.ok) {
      setState(payload.error || "Unable to log in.");
      return;
    }

    window.localStorage.setItem("photic-admin-token", payload.token);
    setToken(payload.token);
  }

  async function handleCreateItem(event) {
    event.preventDefault();
    setState("");

    const response = await fetch("/api/admin-portfolio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    const payload = await response.json();

    if (!response.ok) {
      setState(payload.error || "Unable to create item.");
      return;
    }

    setPortfolioItems((current) => [payload.item, ...current]);
    setForm({
      title: "",
      description: "",
      mediaType: "image",
      categorySlug: "nature",
      mediaUrl: "",
      thumbnailUrl: "",
      featured: false,
      status: "published",
      sortOrder: 0,
    });
  }

  async function handleDeleteItem(id) {
    const response = await fetch(`/api/admin-portfolio?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      setState("Unable to delete item.");
      return;
    }

    setPortfolioItems((current) => current.filter((item) => item.id !== id));
  }

  async function handleUpdateItem(id, updates) {
    const response = await fetch(`/api/admin-portfolio?id=${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    const payload = await response.json();

    if (!response.ok) {
      setState(payload.error || "Unable to update item.");
      return;
    }

    setPortfolioItems((current) =>
      current.map((item) => (item.id === id ? payload.item : item)),
    );
  }

  function logout() {
    window.localStorage.removeItem("photic-admin-token");
    setToken("");
    setPortfolioItems([]);
    setMessages([]);
  }

  const managedCategoryItems = portfolioItems.filter(
    (item) =>
      item.media_type === "image" &&
      (categoryFilter === "all" || item.category_slug === categoryFilter),
  );

  if (!token) {
    return (
      <main className="admin-main route-panel">
        <section className="admin-login-card">
          <p className="tag">Admin</p>
          <h1 className="hl">
            Secure <em>Login</em>
          </h1>
          <div className="hr" />
          <form className="cform" onSubmit={handleLogin}>
            <label>
              Username
              <input value={login.username} onChange={(event) => setLogin((current) => ({ ...current, username: event.target.value }))} />
            </label>
            <label>
              Password
              <input type="password" value={login.password} onChange={(event) => setLogin((current) => ({ ...current, password: event.target.value }))} />
            </label>
            <button type="submit" className="fbtn">
              Login
            </button>
          </form>
          {state ? <p className="form-state">{state}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="admin-main route-panel">
      <div className="admin-header">
        Manage category images, review contact messages, and keep the portfolio dynamic from one admin panel. Category cover photos stay fixed. Inside each category, images are fully controlled from here.
      </div>
      <div className="admin-toolbar">
        <button type="button" className="btn-line" onClick={() => loadAdminData(token)}>
          Refresh
        </button>
        <button type="button" className="btn-line" onClick={logout}>
          Logout
        </button>
      </div>
      <div className="admin-grid">
        <section className="admin-form-card">
          <SectionHeading eyebrow="Portfolio Media" title={"Add <em>New Work</em>"} />
          <form className="cform" onSubmit={handleCreateItem}>
            <label>
              Title
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
            </label>
            <label>
              Description
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <div className="admin-form-row">
              <label>
                Media type
                <select value={form.mediaType} onChange={(event) => setForm((current) => ({ ...current, mediaType: event.target.value }))}>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </label>
              <label>
                Category
                <select value={form.categorySlug} onChange={(event) => setForm((current) => ({ ...current, categorySlug: event.target.value }))}>
                  {filterCategories
                    .filter((item) => item.slug !== "all")
                    .map((item) => (
                      <option key={item.slug} value={item.slug}>
                        {item.title}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <label>
              Media URL
              <input value={form.mediaUrl} onChange={(event) => setForm((current) => ({ ...current, mediaUrl: event.target.value }))} required />
            </label>
            <label>
              Thumbnail URL
              <input value={form.thumbnailUrl} onChange={(event) => setForm((current) => ({ ...current, thumbnailUrl: event.target.value }))} />
            </label>
            <div className="admin-form-row">
              <label>
                Status
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
              <label>
                Sort order
                <input type="number" value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))} />
              </label>
            </div>
            <label className="checkbox-row">
              <input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} />
              Featured item
            </label>
            <button type="submit" className="fbtn">
              Save media
            </button>
          </form>
        </section>
        <section className="admin-messages-block">
          <SectionHeading eyebrow="Messages" title={"Contact <em>Inbox</em>"} />
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr key={message.id}>
                    <td>{message.name}</td>
                    <td>{message.email}</td>
                    <td>{message.subject || "General"}</td>
                    <td>{message.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <section className="admin-messages-block">
        <SectionHeading eyebrow="Library" title={"Current <em>Portfolio Items</em>"} />
        <div className="vault-toolbar">
          <div className="filter-row">
            <button type="button" className={categoryFilter === "all" ? "chip active" : "chip"} onClick={() => setCategoryFilter("all")}>
              All categories
            </button>
            {categoryMeta.map((item) => (
              <button
                key={item.slug}
                type="button"
                className={categoryFilter === item.slug ? "chip active" : "chip"}
                onClick={() => setCategoryFilter(item.slug)}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Category</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {managedCategoryItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.media_type}</td>
                  <td>{item.category_slug}</td>
                  <td>{item.status}</td>
                  <td>
                    <button
                      type="button"
                      className="table-action"
                      onClick={() =>
                        handleUpdateItem(item.id, {
                          status: item.status === "published" ? "draft" : "published",
                        })
                      }
                    >
                      {item.status === "published" ? "Hide" : "Publish"}
                    </button>
                    <button type="button" className="table-action" onClick={() => handleDeleteItem(item.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {state ? <p className="form-state">{state}</p> : null}
    </main>
  );
}

function AppShell() {
  const { items, loading, usingFallback } = usePortfolioData();
  const { likes, toggleLike } = useLikes();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useUiEffects();

  async function shareItem(item) {
    const shareUrl = `${window.location.origin}${window.location.pathname}#${item.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title || "Photic Photo",
          text: item.description || "Check this frame from Photic Photo.",
          url: shareUrl,
        });
        return;
      } catch {
        return;
      }
    }

    await navigator.clipboard.writeText(shareUrl);
    window.alert("Link copied to clipboard.");
  }

  return (
    <>
      <div id="sb" />
      <div id="cd" />
      <div id="cr" />
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <div key={location.pathname} className="route-shell">
        <Routes>
          <Route
            path="/"
            element={<HomePage items={items} loading={loading} usingFallback={usingFallback} likes={likes} onToggleLike={toggleLike} onShare={shareItem} />}
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/category/:slug" element={<CategoryPage items={items} usingFallback={usingFallback} likes={likes} onToggleLike={toggleLike} onShare={shareItem} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <ScrollToTopFloat />
      <WhatsAppFloat />
      <Footer />
    </>
  );
}

export default function App() {
  return <AppShell />;
}
