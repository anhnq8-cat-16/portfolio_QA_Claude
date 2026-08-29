(function () {
  "use strict";

  var DATA = window.SITE_CONTENT;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var state = { lang: localStorage.getItem("mason-lang") || "vi" };

  function t(field) {
    if (field && typeof field === "object" && !Array.isArray(field) && ("vi" in field || "en" in field)) {
      return field[state.lang] != null ? field[state.lang] : field.vi;
    }
    return field;
  }

  function el(tag, className, html) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function setText(id, value) {
    var node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  /* ---------------- Render ---------------- */

  function renderMeta() {
    document.documentElement.lang = state.lang;
    document.title = t(DATA.meta.siteTitle);
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", t(DATA.meta.siteDescription));
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", t(DATA.meta.siteTitle));
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", t(DATA.meta.siteDescription));
  }

  function renderHeader() {
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      var key = a.getAttribute("data-nav");
      a.textContent = t(DATA.ui.nav[key]);
    });
    var langBtn = document.getElementById("langToggle");
    langBtn.textContent = t(DATA.ui.langToggleLabel);
    langBtn.setAttribute("aria-label", t(DATA.ui.langToggleAria));

    var cvBtn = document.getElementById("headerCvBtn");
    cvBtn.href = DATA.personal.cv[state.lang];
    cvBtn.innerHTML = '<span class="full">' + t(DATA.ui.downloadCv) + "</span>";
  }

  function renderHero() {
    setText("heroEyebrow", t(DATA.hero.eyebrow));
    setText("heroHeadline", t(DATA.hero.headline));
    setText("heroSub", t(DATA.hero.subheadline));

    var contactBtn = document.getElementById("heroContactBtn");
    contactBtn.textContent = t(DATA.ui.contactCta);

    var cvBtn = document.getElementById("heroCvBtn");
    cvBtn.href = DATA.personal.cv[state.lang];
    cvBtn.textContent = t(DATA.ui.downloadCv);

    var photo = document.getElementById("heroPhoto");
    photo.src = DATA.personal.heroPhoto;
    photo.alt = DATA.personal.fullName + " — " + t(DATA.personal.title);

    setText("scrollHintLabel", t(DATA.ui.scrollHint));
  }

  function renderClients() {
    setText("clientsEyebrow", t(DATA.ui.clientsEyebrow));
    var wrap = document.getElementById("clientsMarquee");
    wrap.innerHTML = "";
    DATA.clients.groups.forEach(function (group) {
      group.names.forEach(function (name) {
        wrap.appendChild(el("span", "client-pill", name));
      });
    });
  }

  function renderAbout() {
    setText("aboutEyebrow", t(DATA.about.eyebrow));
    setText("aboutHeading", t(DATA.about.heading));

    var p = document.getElementById("aboutParagraphs");
    p.innerHTML = "";
    DATA.about.paragraphs.forEach(function (para) {
      p.appendChild(el("p", "reveal-up", t(para)));
    });

    var photos = document.getElementById("aboutPhotos");
    photos.innerHTML = "";
    DATA.personal.aboutPhotos.forEach(function (src) {
      var img = el("img");
      img.src = src;
      img.loading = "lazy";
      img.alt = DATA.personal.fullName;
      img.width = 450;
      img.height = 600;
      photos.appendChild(img);
    });

    var stats = document.getElementById("statsGrid");
    stats.innerHTML = "";
    DATA.about.highlights.forEach(function (stat) {
      var card = el("div", "stat");
      var value = el("div", "stat-value reveal-up");
      value.setAttribute("data-count", stat.value);
      value.setAttribute("data-prefix", stat.prefix || "");
      value.setAttribute("data-suffix", t(stat.suffix) || "");
      value.textContent = (stat.prefix || "") + "0" + (t(stat.suffix) || "");
      var label = el("div", "stat-label reveal-up", t(stat.label));
      card.appendChild(value);
      card.appendChild(label);
      stats.appendChild(card);
    });
  }

  function renderExperience() {
    setText("experienceEyebrow", t(DATA.experience.eyebrow));
    setText("experienceHeading", t(DATA.experience.heading));

    var timeline = document.getElementById("timeline");
    timeline.innerHTML = "";
    DATA.experience.items.forEach(function (item) {
      var row = el("div", "timeline-item reveal-up");
      var period = el("div", "timeline-period", t(item.period));
      var body = el("div", "timeline-body");
      body.appendChild(el("div", "timeline-role", t(item.role)));
      body.appendChild(el("div", "timeline-company", item.company));
      body.appendChild(el("p", "timeline-summary", t(item.summary)));
      var ul = el("ul", "timeline-bullets");
      item.bullets.forEach(function (b) { ul.appendChild(el("li", null, t(b))); });
      body.appendChild(ul);
      var tags = el("div", "timeline-tags");
      item.tags.forEach(function (tag) { tags.appendChild(el("span", "tag", tag)); });
      body.appendChild(tags);
      row.appendChild(period);
      row.appendChild(body);
      timeline.appendChild(row);
    });
  }

  function renderProjects() {
    setText("projectsEyebrow", t(DATA.projects.eyebrow));
    setText("projectsHeading", t(DATA.projects.heading));

    var list = document.getElementById("projectsList");
    list.innerHTML = "";
    DATA.projects.items.forEach(function (proj) {
      var card = el("article", "project-card reveal-up");

      var media = el("div", "project-media");
      var img = el("img");
      img.src = proj.cover;
      img.loading = "lazy";
      img.alt = t(proj.client) + " — " + t(proj.category);
      media.appendChild(img);

      var body = el("div", "project-body");
      body.appendChild(el("div", "project-client", t(proj.client)));
      body.appendChild(el("div", "project-category", t(proj.category) + " · " + t(proj.period)));

      [["problem", state.lang === "vi" ? "Vấn đề" : "Challenge"],
       ["action", state.lang === "vi" ? "Cách triển khai" : "What I did"],
       ["result", state.lang === "vi" ? "Kết quả" : "Result"]].forEach(function (pair) {
        var block = el("div", "project-block");
        block.appendChild(el("div", "project-block-label", pair[1]));
        block.appendChild(el("p", null, t(proj[pair[0]])));
        body.appendChild(block);
      });

      if (proj.metrics && proj.metrics.length) {
        var metrics = el("div", "project-metrics");
        proj.metrics.forEach(function (m) {
          var mEl = el("div");
          mEl.appendChild(el("div", "project-metric-value", m.value));
          mEl.appendChild(el("div", "project-metric-label", t(m.label)));
          metrics.appendChild(mEl);
        });
        body.appendChild(metrics);
      }

      card.appendChild(media);
      card.appendChild(body);
      list.appendChild(card);
    });
  }

  function renderCompetencies() {
    setText("competenciesEyebrow", t(DATA.competencies.eyebrow));
    setText("competenciesHeading", t(DATA.competencies.heading));
    var grid = document.getElementById("competenciesGrid");
    grid.innerHTML = "";
    DATA.competencies.items.forEach(function (comp, i) {
      var card = el("div", "competency-card reveal-up");
      card.appendChild(el("div", "competency-index", String(i + 1).padStart(2, "0")));
      card.appendChild(el("div", "competency-title", t(comp.title)));
      card.appendChild(el("div", "competency-items", comp.items.map(t).join(" · ")));
      grid.appendChild(card);
    });
  }

  function renderSkills() {
    setText("skillsEyebrow", t(DATA.skills.eyebrow));
    setText("skillsHeading", t(DATA.skills.heading));
    var grid = document.getElementById("skillsGrid");
    grid.innerHTML = "";
    DATA.skills.categories.forEach(function (cat) {
      var col = el("div", "skill-category reveal-up");
      col.appendChild(el("div", "skill-category-label", t(cat.label)));
      var tags = el("div", "skill-tags");
      cat.items.forEach(function (item) { tags.appendChild(el("span", "skill-tag", t(item))); });
      col.appendChild(tags);
      grid.appendChild(col);
    });

    var langRow = document.getElementById("languagesRow");
    langRow.innerHTML = "";
    DATA.skills.languages.forEach(function (l) {
      var item = el("div", "language-item reveal-up");
      item.innerHTML = "<b>" + t(l.name) + "</b> — <span>" + t(l.level) + "</span>";
      langRow.appendChild(item);
    });
  }

  function renderEducation() {
    setText("educationEyebrow", t(DATA.education.eyebrow));
    setText("educationHeading", t(DATA.education.heading));

    var list = document.getElementById("educationList");
    list.innerHTML = "";
    DATA.education.schools.forEach(function (sc) {
      var item = el("div", "education-item reveal-up");
      item.appendChild(el("div", "education-school", t(sc.school)));
      item.appendChild(el("div", "education-program", t(sc.program)));
      item.appendChild(el("div", "education-period", t(sc.period)));
      item.appendChild(el("div", "education-honor", t(sc.honor)));
      list.appendChild(item);
    });

    var certs = document.getElementById("certificatesList");
    certs.innerHTML = "";
    DATA.education.certificates.forEach(function (c) {
      certs.appendChild(el("span", "cert-pill", t(c.name) + " · " + c.issuer));
    });
  }

  function renderContact() {
    setText("contactEyebrow", t(DATA.contact.eyebrow));
    setText("contactHeading", t(DATA.contact.heading));
    setText("contactBlurb", t(DATA.contact.blurb));

    var links = document.getElementById("contactLinks");
    links.innerHTML = "";
    DATA.contact.social.forEach(function (s) {
      var a = el("a", "contact-link reveal-up");
      a.href = s.url;
      a.innerHTML = "<span>" + s.platform + "</span><small>" + s.label + "</small>";
      links.appendChild(a);
    });
  }

  function renderFooter() {
    setText("footerNote", t(DATA.footer.note) + "  ·  © " + new Date().getFullYear() + " " + DATA.personal.displayName + "  ·  " + t(DATA.ui.footerRights));
    document.getElementById("backToTop").textContent = t(DATA.ui.backToTop);
  }

  function renderAll() {
    renderMeta();
    renderHeader();
    renderHero();
    renderClients();
    renderAbout();
    renderExperience();
    renderProjects();
    renderCompetencies();
    renderSkills();
    renderEducation();
    renderContact();
    renderFooter();
  }

  /* ---------------- Interactions ---------------- */

  function setupLangToggle() {
    document.getElementById("langToggle").addEventListener("click", function () {
      state.lang = state.lang === "vi" ? "en" : "vi";
      localStorage.setItem("mason-lang", state.lang);
      renderAll();
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  }

  function setupMobileNav() {
    var header = document.getElementById("siteHeader");
    var toggle = document.getElementById("menuToggle");
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll("#mobileNav a").forEach(function (a) {
      a.addEventListener("click", function () {
        header.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function setupHeaderScroll() {
    var header = document.getElementById("siteHeader");
    window.addEventListener("scroll", function () {
      header.classList.toggle("is-scrolled", window.scrollY > 20);
    }, { passive: true });
  }

  function setupScrollHint(lenis) {
    document.getElementById("scrollHint").addEventListener("click", function () {
      var target = document.getElementById("about");
      if (lenis) lenis.scrollTo(target, { offset: -70 });
      else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  }

  function setupBackToTop(lenis) {
    document.getElementById("backToTop").addEventListener("click", function () {
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  function setupCursor() {
    if (reduceMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var dot = document.querySelector(".cursor-dot");
    var ring = document.querySelector(".cursor-ring");
    document.body.classList.add("using-mouse");
    var mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px"; dot.style.top = my + "px";
    });
    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest("a, button")) ring.classList.add("is-active");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest("a, button")) ring.classList.remove("is-active");
    });
  }

  function setupLenis() {
    if (reduceMotion || typeof window.Lenis !== "function") return null;
    var lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.gsap) {
      lenis.on("scroll", window.ScrollTrigger && window.ScrollTrigger.update);
      window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    }
    return lenis;
  }

  function setupAnchorLinks(lenis) {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - 70;
        if (lenis) lenis.scrollTo(target, { offset: -70 });
        else window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
        history.pushState(null, "", id);
      });
    });
  }

  function setupScrollReveal() {
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
    document.body.classList.add("js-anim");
    window.gsap.registerPlugin(window.ScrollTrigger);
    var groups = {};
    document.querySelectorAll(".reveal-up").forEach(function (node) {
      var section = node.closest("section") || document.body;
      var key = section.id || "root";
      groups[key] = groups[key] || [];
      groups[key].push(node);
    });
    Object.keys(groups).forEach(function (key) {
      window.gsap.to(groups[key], {
        opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08,
        scrollTrigger: { trigger: groups[key][0].closest("section") || groups[key][0], start: "top 82%" }
      });
    });
  }

  function setupCounters() {
    var values = document.querySelectorAll(".stat-value");
    if (!values.length) return;
    var done = new WeakSet();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || done.has(entry.target)) return;
        done.add(entry.target);
        var target = parseFloat(entry.target.getAttribute("data-count"));
        var prefix = entry.target.getAttribute("data-prefix") || "";
        var suffix = entry.target.getAttribute("data-suffix") || "";
        if (reduceMotion) {
          entry.target.textContent = prefix + target + suffix;
          return;
        }
        var obj = { v: 0 };
        window.gsap ? window.gsap.to(obj, {
          v: target, duration: 1.6, ease: "power2.out",
          onUpdate: function () { entry.target.textContent = prefix + Math.round(obj.v) + suffix; }
        }) : (entry.target.textContent = prefix + target + suffix);
      });
    }, { threshold: 0.4 });
    values.forEach(function (v) { observer.observe(v); });

    // Safety net: if a stat is already on-screen but the observer/tween never
    // resolved (stalled rAF, etc.), snap it to its final value so it never
    // shows a stuck "0" placeholder.
    setTimeout(function () {
      values.forEach(function (v) {
        if (done.has(v)) return;
        var r = v.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          done.add(v);
          v.textContent = (v.getAttribute("data-prefix") || "") + v.getAttribute("data-count") + (v.getAttribute("data-suffix") || "");
        }
      });
    }, 3200);
  }

  function revealFallback() {
    // Guarantees content is never stuck invisible if the scroll-reveal animation
    // stalls (slow/blocked CDN script, throttled rAF on a backgrounded tab, etc.).
    setTimeout(function () {
      document.body.classList.add("reveal-fallback");
    }, 2200);
  }

  function init() {
    renderAll();
    revealFallback();
    setupLangToggle();
    setupMobileNav();
    setupHeaderScroll();
    setupCursor();
    var lenis = setupLenis();
    setupBackToTop(lenis);
    setupScrollHint(lenis);
    setupAnchorLinks(lenis);
    setupScrollReveal();
    setupCounters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
