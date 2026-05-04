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
  categoryMeta as localCategoryMeta,
  comparisons as localComparisons,
  portfolioItems as localPortfolioItems,
  highlights as localHighlights,
  profile as localProfile,
  reels as localReels,
  useSanityData,
} from "./data";

const processSteps = [
  {
    number: "01",
    title: "Shoot",
    copy: "Plan the mood, frame for story, and capture enough texture and movement for a strong final edit.",
  },
  {
    number: "02",
    title: "Edit",
    copy: "Shape color, contrast, and crop with a cinematic finish while protecting the natural feel of the moment.",
  },
  {
    number: "03",
    title: "Deliver",
    copy: "Curate the strongest selects, organize by set, and send polished files ready for posting or archive.",
  },
];

function makeSocialIcons(profile) {
  return [
    { label: "Instagram", href: profile.links.instagram, kind: "instagram" },
    { label: "GitHub", href: profile.links.github, kind: "github" },
    { label: "YouTube", href: profile.links.youtube, kind: "youtube" },
    { label: "LinkedIn", href: profile.links.linkedin, kind: "linkedin" },
  ];
}

function makeFilterCategories(categoryMeta) {
  return [
    { slug: "all", title: "All" },
    ...categoryMeta.map((item) => ({ slug: item.slug, title: item.title })),
  ];
}

function toPublicUrl(url) {
  if (!url) {
    return "";
  }
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return url.startsWith("/") ? url : `/${url}`;
}

function SocialIcon({ kind }) {
  const props = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    focusable: false,
  };

  switch (kind) {
    case "instagram":
      return (
        <svg {...props}>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case "github":
      return (
        <svg {...props}>
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...props}>
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...props}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    default:
      return null;
  }
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
    let moved = false;

    function onPointerDown(event) {
      pointerId = event.pointerId;
      startX = event.clientX;
      scrollLeft = node.scrollLeft;
      moved = false;
      node.dataset.dragging = "true";
      node.setPointerCapture(pointerId);
    }

    function onPointerMove(event) {
      if (pointerId === null) {
        return;
      }

      const delta = event.clientX - startX;
      if (Math.abs(delta) > 8) {
        moved = true;
      }
      node.scrollLeft = scrollLeft - delta;
    }

    function endDrag() {
      pointerId = null;
      delete node.dataset.dragging;
    }

    function onClick(event) {
      if (!moved) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      moved = false;
    }

    node.addEventListener("pointerdown", onPointerDown);
    node.addEventListener("pointermove", onPointerMove);
    node.addEventListener("pointerup", endDrag);
    node.addEventListener("pointerleave", endDrag);
    node.addEventListener("click", onClick, true);

    return () => {
      node.removeEventListener("pointerdown", onPointerDown);
      node.removeEventListener("pointermove", onPointerMove);
      node.removeEventListener("pointerup", endDrag);
      node.removeEventListener("pointerleave", endDrag);
      node.removeEventListener("click", onClick, true);
    };
  }, []);

  return ref;
}

function useUiEffects() {
  const location = useLocation();

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

    let frameId = 0;
    function animateCursor() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      if (ring) {
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
      }
      frameId = window.requestAnimationFrame(animateCursor);
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
      { threshold: 0.01, rootMargin: "0px 0px -50px 0px" },
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

    const refreshObservers = () => {
      document.querySelectorAll(".sr,.sl,.srr").forEach((node) => revealObserver.observe(node));
      document.querySelectorAll(".counter").forEach((node) => counterObserver.observe(node));
      document.querySelectorAll(targets).forEach((node) => {
        node.addEventListener("mouseenter", () => document.body.classList.add("hov"));
        node.addEventListener("mouseleave", () => document.body.classList.remove("hov"));
      });
    };

    refreshObservers();
    // Re-check after a short delay to catch elements rendered after mount
    const timeoutId = setTimeout(refreshObservers, 500);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", () => document.body.classList.add("clk"));
    document.addEventListener("mouseup", () => document.body.classList.remove("clk"));
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    animateCursor();

    return () => {
      clearTimeout(timeoutId);
      window.cancelAnimationFrame(frameId);
      revealObserver.disconnect();
      counterObserver.disconnect();
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [location.pathname]);
}

function MediaImage({ src, alt, className = "", loading = "lazy" }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`media-image ${loaded ? "is-loaded" : ""}`}>
      <img
        src={toPublicUrl(src)}
        alt={alt}
        className={className}
        loading={loading}
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
      <h2 className="hl">{title}</h2>
      <div className="hr" />
    </div>
  );
}

function Header({ theme, onToggleTheme, categoryMeta }) {
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
            <a href={location.pathname === "/" ? "#video" : "/#video"}>Reels</a>
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

function Footer({ profile, socialIcons }) {
  return (
    <footer>
      <div className="fgrid">
        <div>
          <Link to="/" className="flogo">
            Photic Photo
          </Link>
          <p className="ftag">Capturing moments, framing stories, and shaping visual narratives through mood, light, and detail.</p>
          <div className="fsocs">
            {socialIcons.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                title={item.label}
              >
                <SocialIcon kind={item.kind} />
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
              <a href="/#video">Reels</a>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </div>
        <div className="fcol">
          <h4>Contact</h4>
          <p>{profile.email}</p>
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
        </div>
      </div>
      <div className="fbot">
        <span className="fcopy">© 2026 PHOTIC Photography. All rights reserved.</span>
      </div>
    </footer>
  );
}

function WhatsAppFloat({ profile }) {
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

function Hero({ featured, profile, categoryMeta, highlights, onOpenFeatured }) {
  const creatorImage = profile.heroImage || categoryMeta[1]?.cover || categoryMeta[0]?.cover;

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
            PHOTIC
            <em>PHOTO</em>
          </h1>
          <p className="hero-sub">{profile.shortBio}</p>
          <div className="hero-cta">
            <a href="#Vault" className="btn-fill">
              View Gallery
            </a>
            <a href="#video" className="btn-line">
              Watch Reels
            </a>
          </div>
          {featured?.media_url ? (
            <button
              type="button"
              className="hero-spotlight"
              onClick={onOpenFeatured}
              aria-label={`View featured: ${featured.title || 'Cinematic Frame'}`}
            >
              <div className="hero-spotlight-text">
                <span>Featured of the month</span>
                <strong>{featured.title || "Cinematic Frame"}</strong>
              </div>
              <div className="hero-spotlight-arrow">→</div>
            </button>
          ) : null}
        </div>
        <aside className="hero-card">
          <div className="hero-card-media" style={{ aspectRatio: "4/3" }}>
            <MediaImage src={creatorImage} alt={`${profile.name} portrait`} loading="eager" />
          </div>
          <div className="hero-card-body">
            <span className="hero-card-tag">About the creator</span>
            <h2>{profile.name}</h2>
            <p className="hero-card-role">{profile.title}</p>
            <p className="hero-card-location">{profile.location}</p>
            <div className="hero-stats">
              {(highlights || []).slice(0, 3).map((item) => (
                <div key={item.label} className="hero-stat">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="hero-card-footer">
              <a href={profile.links.instagram} target="_blank" rel="noreferrer" className="btn-line hero-card-link">
                Instagram
              </a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function HorizontalStrip({ items, onOpen }) {
  const scrollRef = useDragScroll();
  const [isHovered, setIsHovered] = useState(false);
  const stripItems = items.length > 1 ? [...items, ...items] : items;

  useEffect(() => {
    const node = scrollRef.current;
    if (!node || !isHovered) {
      return undefined;
    }

    let frameId = 0;

    function tick() {
      const loopWidth = node.scrollWidth / 2;
      if (loopWidth <= node.clientWidth) {
        return;
      }

      const next = node.scrollLeft + 0.7;
      node.scrollLeft = next >= loopWidth ? next - loopWidth : next;
      frameId = window.requestAnimationFrame(tick);
    }

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isHovered, scrollRef]);

  function moveStrip(direction) {
    const node = scrollRef.current;
    if (!node) {
      return;
    }

    node.scrollBy({
      left: direction * Math.max(node.clientWidth * 0.78, 260),
      behavior: "smooth",
    });
  }

  return (
    <section className="strip-section" id="strip">
      <div className="strip-head sr">
        <SectionHeading eyebrow="Curated Perspectives" title={<>Featured <em>Portfolio</em></>} />
        <div className="strip-nav">
          <button type="button" className="chip" onClick={() => moveStrip(-1)}>
            Prev
          </button>
          <button type="button" className="chip active" onClick={() => moveStrip(1)}>
            Next
          </button>
        </div>
      </div>
      <div className="strip-copy sr">
        A curated selection of our finest visual stories. Swipe, use the navigation, or simply hover to explore the collection.
      </div>
      <div
        ref={scrollRef}
        className="strip-track"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {stripItems.map((item, index) => (
          <button
            type="button"
            className="strip-card"
            key={`${item.id}-${index}`}
            onClick={() => onOpen(index % items.length)}
          >
            <MediaImage src={item.thumbnail_url || item.media_url} alt={item.title || "Portfolio frame"} />
            <div className="strip-card-body">
              <span>{item.category_slug || "featured"}</span>
              <strong>{item.title || `Frame ${(index % items.length) + 1}`}</strong>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function VaultGallery({
  items,
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
  categoryMeta,
}) {
  const filterCategories = makeFilterCategories(categoryMeta || []);
  const deferredSearch = useDeferredValue(search);
  const imageItems = items.filter((item) => item.media_type === "image");
  const categoryCounts = imageItems.reduce(
    (accumulator, item) => ({
      ...accumulator,
      [item.category_slug]: (accumulator[item.category_slug] || 0) + 1,
    }),
    {},
  );

  const filteredItems = imageItems
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

  const displayLimit = 12;
  const displayedItems = filteredItems.slice(0, displayLimit);
  const hasMore = filteredItems.length > displayLimit;

  return (
    <section id="Vault">
      <div className="vault-top sr">
        <div>
          <p className="tag">Selected Works</p>
          <h2 className="hl">
            Photic <em>Vault</em>
          </h2>
          <p className="vault-caption">
            A curated glimpse into the archive. Select any frame to view in detail.
          </p>
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
              <span>{item.slug === "all" ? imageItems.length : categoryCounts[item.slug] || 0}</span>
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
          <div className="sort-tabs" aria-label="Sort photos">
            <button type="button" className={sort === "featured" ? "chip active" : "chip"} onClick={() => onSortChange("featured")}>
              Featured
            </button>
            <button type="button" className={sort === "newest" ? "chip active" : "chip"} onClick={() => onSortChange("newest")}>
              Newest
            </button>
            <button type="button" className={sort === "title" ? "chip active" : "chip"} onClick={() => onSortChange("title")}>
              A-Z
            </button>
          </div>
        </div>
      </div>
        <div className="vault-summary sr">
          <span>Showing {displayedItems.length} of {filteredItems.length} image{filteredItems.length === 1 ? "" : "s"}</span>
          <span>Filter: {filter === "all" ? "All categories" : (categoryMeta || []).find((item) => item.slug === filter)?.title || filter}</span>
          <span>Sort: {sort === "featured" ? "Featured first" : sort === "newest" ? "Newest first" : "Alphabetical"}</span>
        </div>
        {displayedItems.length === 0 ? (
          <div className="admin-header sr">No gallery items match this filter yet.</div>
        ) : (
        <>
          <div className={mode === "masonry" ? "gg gg-masonry" : "gg gg-editorial"}>
            {displayedItems.map((item, index) => (
              <article
                className="gi sr"
                key={item.id}
                id={item.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpen(index, displayedItems)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen(index, displayedItems);
                  }
                }}
              >
                <button
                  type="button"
                  className="gallery-hit"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpen(index, displayedItems);
                  }}
                  aria-label={`Open ${item.title || `Frame ${index + 1}`}`}
                >
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
                    <button type="button" className={likes[item.id] ? "icon-pill active" : "icon-pill"} onClick={(event) => { event.stopPropagation(); onToggleLike(item.id); }}>
                      Like
                    </button>
                    <button type="button" className="icon-pill" onClick={(event) => { event.stopPropagation(); onShare(item); }}>
                      Share
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {hasMore && (
            <div className="vault-footer sr">
              <Link
                to={filter === "all" ? "/category/nature" : `/category/${filter}`}
                className="btn-line"
                style={{ marginLeft: "auto" }}
              >
                Explore More in {filter === "all" ? "Categories" : (categoryMeta.find(c => c.slug === filter)?.title || "this set")} →
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function LabSection({ itemCount, categoryMeta, profile }) {
  return (
    <section id="lab">
      <div className="lab-copy sl">
        <SectionHeading eyebrow="About the Lab" title={<>Photic <em>Lab</em></>} />
        <p>{profile.intro}</p>
      </div>
      <div className="lab-stats srr">
        <div className="stat">
          <div className="stat-n counter" data-target={itemCount || 120}>0</div>
          <div className="stat-l">Frames archived</div>
        </div>
        <div className="stat">
          <div className="stat-n counter" data-target={(categoryMeta || []).length}>0</div>
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

function CategoriesSection({ categoryMeta }) {
  return (
    <section className="categories">
      <div className="cat-head sr">
        <SectionHeading eyebrow="Browse by Genre" title={<>Lab <em>Categories</em></>} />
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
      <SectionHeading eyebrow="Workflow" title={<>Shoot <em>to Delivery</em></>} className="sr" />
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

function BeforeAfterSection({ comparisons }) {
  return (
    <section className="bas" style={{ paddingBottom: '60px' }}>
      <SectionHeading eyebrow="Edit Process" title={<>Before <em>&amp; After</em></>} className="sr" />
      <div className="bagrid">
        {(comparisons || []).map((item, index) => (
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

function VideoSection({ onOpen, reels }) {
  const videos = reels || [];
  const [orientations, setOrientations] = useState({});

  if (videos.length === 0) {
    return null;
  }

  function handleLoadedMetadata(id, event) {
    const node = event.currentTarget;
    if (!node?.videoWidth || !node?.videoHeight) {
      return;
    }
    setOrientations((current) => ({
      ...current,
      [id]: node.videoHeight > node.videoWidth ? "portrait" : "landscape",
    }));
  }

  return (
    <section className="vs" id="video" style={{ padding: "120px 5vw" }}>
      <div className="video-section-head sr">
        <SectionHeading eyebrow="Featured Motion" title={<>Shot <em>Reels</em></>} />
      </div>
      <div className="video-grid sr">
        {videos.map((item, index) => {
          const orientation = orientations[item.id] || "portrait";

          return (
            <button
              key={item.id}
              type="button"
              className={`video-preview ${orientation}`}
              onClick={() => onOpen(index, videos)}
              onMouseEnter={(e) => {
                 const v = e.currentTarget.querySelector('video');
                 if (v) { v.play().catch(()=>{}); }
              }}
              onMouseLeave={(e) => {
                 const v = e.currentTarget.querySelector('video');
                 if (v) { v.pause(); v.currentTime = 0; }
              }}
              style={{ transitionDelay: `${index * 0.05}s` }}
            >
              <video
                src={`${toPublicUrl(item.media_url)}#t=1`}
                muted
                playsInline
                preload="metadata"
                loop
                poster={item.thumbnail_url ? toPublicUrl(item.thumbnail_url) : undefined}
                onLoadedMetadata={(event) => handleLoadedMetadata(item.id, event)}
              />
              <div className="video-preview-meta">
                <strong>{item.title || `Reel ${index + 1}`}</strong>
                <span>{orientation === "portrait" ? "Vertical" : "Horizontal"}</span>
              </div>
              <div className="video-play-hint">Play Reel</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function VideoOverlay({ items, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    if (index < 0) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [index, onClose, onPrev, onNext]);

  if (index < 0 || !items[index]) return null;
  const item = items[index];

  return (
    <div id="lb" className="open video-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <button type="button" className="lbc" onClick={onClose}>Close</button>
      <div className="video-overlay-shell" onClick={e => e.stopPropagation()}>
        <video
          key={item.id}
          src={toPublicUrl(item.media_url)}
          controls
          autoPlay
          className="video-full"
        />
        <div className="video-overlay-meta">
           <strong>{item.title || "Cinematic Reel"}</strong>
           <p>{item.description || "Shot and edited with Photic Lab."}</p>
        </div>
      </div>
      <button type="button" className="slide-nav prev" onClick={e => { e.stopPropagation(); onPrev(); }}>Prev</button>
      <button type="button" className="slide-nav next" onClick={e => { e.stopPropagation(); onNext(); }}>Next</button>
    </div>
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

function ContactSection({ profile }) {
  return (
    <section className="contact" id="contact">
      <div className="contact-left">
        <div className="sl">
          <SectionHeading eyebrow="Let's Connect" title={<>Get in <em>Touch</em></>} />
        </div>
        <p className="cdesc sl">Open for collaborations, portraits, reels, or visual experiments. Reach out below.</p>
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
      <div className="cform srr">
         <div className="admin-header" style={{textAlign: "center", paddingTop: "40px"}}>
             <p className="tag" style={{justifyContent: "center"}}>Inquiries</p>
             <h2 className="hl" style={{fontSize: "2.5rem"}}>Let's create together</h2>
             <br/>
             <a href={`mailto:${profile.email}`} className="btn-fill" style={{display: "inline-block"}}>Email Me Directly</a>
         </div>
      </div>
    </section>
  );
}

function SlideshowOverlay({ items, index, onClose, onPrev, onNext, onJump, likes, onToggleLike, onShare }) {
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
    <div id="lb" className="open" onClick={onClose} style={{ animation: "fadeZoom 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
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
            <p className="slideshow-count">
              {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </p>
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
        <div className="lightbox-rail">
          {items.map((entry, entryIndex) => (
            <button
              key={entry.id}
              type="button"
              className={`lightbox-thumb ${entryIndex === index ? "active" : ""}`}
              onClick={(event) => {
                event.stopPropagation();
                onJump(entryIndex);
              }}
            >
              <MediaImage src={entry.thumbnail_url || entry.media_url} alt={entry.title || `Frame ${entryIndex + 1}`} />
            </button>
          ))}
        </div>
      </div>
      <button type="button" className="slide-nav next" onClick={(event) => { event.stopPropagation(); onNext(); }}>
        Next
      </button>
    </div>
  );
}

// Pinned spotlight image — can be overridden by a featured Sanity item
const PINNED_SPOTLIGHT_URL = "media/uploads/random/spotlight_custom.jpg";

function HomePage({ likes, onToggleLike, onShare, onOpenSlideshow, onOpenVideo, portfolioItems, profile, categoryMeta, highlights, comparisons, reels }) {
  const featuredImages = portfolioItems.filter((item) => item.media_type === "image").slice(0, 10);
  // Use Sanity-featured item if available, otherwise use pinned image as spotlight
  const sanityFeatured = portfolioItems.find((item) => item.featured);
  const pinnedSpotlight = {
    id: "pinned-spotlight",
    media_url: PINNED_SPOTLIGHT_URL,
    thumbnail_url: PINNED_SPOTLIGHT_URL,
    title: "Random Frame",
    category_slug: "random",
    media_type: "image",
    featured: true,
  };
  const spotlight = pinnedSpotlight; // Forcing the pinned spotlight as requested
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("featured");
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("editorial");

  function openFeatured() {
    onOpenSlideshow(0, [spotlight]);
  }

  return (
    <>
      <Hero featured={spotlight} profile={profile} categoryMeta={categoryMeta} highlights={highlights} onOpenFeatured={openFeatured} />
      {featuredImages.length > 0 ? (
        <HorizontalStrip items={featuredImages.slice(0, 8)} onOpen={(index) => onOpenSlideshow(index, featuredImages.slice(0, 8))} />
      ) : null}
      <VaultGallery
        items={portfolioItems}
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
        onOpen={onOpenSlideshow}
        categoryMeta={categoryMeta}
      />
      <LabSection itemCount={portfolioItems.length} categoryMeta={categoryMeta} profile={profile} />
      <ProcessSection />
      <CategoriesSection categoryMeta={categoryMeta} />
      <BeforeAfterSection comparisons={comparisons} />
      <VideoSection onOpen={onOpenVideo} reels={reels} />
      <SpotlightSection item={spotlight} />
      <ContactSection profile={profile} />
    </>
  );
}

function AboutPage({ profile, categoryMeta }) {
  return (
    <main className="category-main route-panel">
      <section className="category-hero">
        <div className="category-copy sr in">
          <p className="tag">About</p>
          <h1 className="hl">
            Built from a first portfolio into a <em>working studio</em>
          </h1>
          <div className="hr" />
          {(profile.about || []).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="category-image-wrap srr in">
          <MediaImage src={categoryMeta[0]?.cover} alt="Photic Photo cover" />
        </div>
      </section>
    </main>
  );
}

function CategoryPage({ likes, onToggleLike, onShare, onOpenSlideshow, portfolioItems, categoryMeta }) {
  const { slug } = useParams();
  const meta = (categoryMeta || []).find((item) => item.slug === slug);
  const items = (portfolioItems || []).filter(
    (item) =>
      item.category_slug === slug &&
      item.media_type === "image"
  );

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
        <section className="category-gallery" style={{ padding: '0 5vw 120px' }}>
          {items.length === 0 ? (
            <div className="admin-header sr">No images have been added to this category yet.</div>
          ) : (
              <div className="gg category-grid-alt">
                {items.map((item, index) => (
                  <article 
                    key={item.id} 
                    className="gi sr"
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenSlideshow(index, items)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onOpenSlideshow(index, items);
                      }
                    }}
                  >
                    <button 
                      type="button" 
                      className="gallery-hit" 
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenSlideshow(index, items);
                      }}
                    >
                      <MediaImage
                        src={item.thumbnail_url || item.media_url}
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
    </main>
  );
}

function AppShell() {
  const { likes, toggleLike } = useLikes();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const sanity = useSanityData();

  const profile = sanity.profile;
  const categoryMeta = sanity.categoryMeta;
  const portfolioItems = sanity.portfolioItems;
  const highlights = sanity.highlights;
  const comparisons = sanity.comparisons;
  const reels = sanity.reels;
  const socialIcons = makeSocialIcons(profile);
  const filterCategories = makeFilterCategories(categoryMeta);

  const [slideIndex, setSlideIndex] = useState(-1);
  const [slideItems, setSlideItems] = useState([]);
  const [videoIndex, setVideoIndex] = useState(-1);
  const [videoItems, setVideoItems] = useState([]);

  useUiEffects();

  function openSlideshow(index, items) {
    setSlideItems(items);
    setSlideIndex(index);
  }

  function openVideo(index, items) {
    setVideoItems(items);
    setVideoIndex(index);
  }

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
      <Header theme={theme} onToggleTheme={toggleTheme} categoryMeta={categoryMeta} />
      <div key={location.pathname} className="route-shell">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                likes={likes}
                onToggleLike={toggleLike}
                onShare={shareItem}
                onOpenSlideshow={openSlideshow}
                onOpenVideo={openVideo}
                portfolioItems={portfolioItems}
                profile={profile}
                categoryMeta={categoryMeta}
                highlights={highlights}
                comparisons={comparisons}
                reels={reels}
              />
            }
          />
          <Route path="/about" element={<AboutPage profile={profile} categoryMeta={categoryMeta} />} />
          <Route
            path="/category/:slug"
            element={
              <CategoryPage
                likes={likes}
                onToggleLike={toggleLike}
                onShare={shareItem}
                onOpenSlideshow={openSlideshow}
                portfolioItems={portfolioItems}
                categoryMeta={categoryMeta}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <ScrollToTopFloat />
      <WhatsAppFloat profile={profile} />
      <Footer profile={profile} socialIcons={socialIcons} />

      <SlideshowOverlay
        items={slideItems}
        index={slideIndex}
        onClose={() => setSlideIndex(-1)}
        onPrev={() => setSlideIndex((current) => (current <= 0 ? slideItems.length - 1 : current - 1))}
        onNext={() => setSlideIndex((current) => (current >= slideItems.length - 1 ? 0 : current + 1))}
        onJump={setSlideIndex}
        likes={likes}
        onToggleLike={toggleLike}
        onShare={shareItem}
      />
      <VideoOverlay
        items={videoItems}
        index={videoIndex}
        onClose={() => setVideoIndex(-1)}
        onPrev={() => setVideoIndex(c => (c <= 0 ? videoItems.length - 1 : c - 1))}
        onNext={() => setVideoIndex(c => (c >= videoItems.length - 1 ? 0 : c + 1))}
      />
    </>
  );
}

export default function App() {
  return <AppShell />;
}
