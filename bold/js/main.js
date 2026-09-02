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
    setText("brandText", DATA.personal.brandLabel);
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

    setText("heroSignature", DATA.personal.signature);
    setText("heroBadge", t(DATA.personal.title));
    setText("scrollHintLabel", t(DATA.ui.scrollHint));
  }

  function renderClients() {
    setText("clientsEyebrow", t(DATA.ui.clientsEyebrow));
    var wrap = document.getElementById("clientsGroups");
    wrap.innerHTML = "";
    var hintLinked = state.lang === "vi" ? "Xem case study →" : "View case study →";
    var hintPlain = state.lang === "vi" ? "Chi tiết sắp cập nhật" : "Details coming soon";

    DATA.clients.groups.forEach(function (group) {
      var groupEl = el("div", "client-group");
      groupEl.appendChild(el("div", "client-group-label", t(group.label)));
      var grid = el("div", "client-tile-grid");

      group.names.forEach(function (client) {
        var hasLogo = !!client.logo;
        var hasLink = !!client.projectId;
        var tile = el("div", "client-tile" + (hasLogo ? "" : " no-logo") + (hasLink ? " has-link" : ""));
        if (hasLogo) {
          var img = el("img", "client-tile-logo");
          img.src = client.logo;
          img.loading = "lazy";
          img.alt = client.name;
          tile.appendChild(img);
        }
        tile.appendChild(el("div", "client-tile-name", client.name));
        tile.appendChild(el("span", "client-tile-hint", hasLink ? hintLinked : hintPlain));
        if (hasLink) {
          tile.setAttribute("data-project-id", client.projectId);
          tile.setAttribute("role", "button");
          tile.setAttribute("tabindex", "0");
        }
        grid.appendChild(tile);
      });

      groupEl.appendChild(grid);
      wrap.appendChild(groupEl);
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
      var frame = el("div", "about-photo reveal-up");
      var img = el("img");
      img.src = src;
      img.loading = "lazy";
      img.alt = DATA.personal.fullName;
      img.width = 450;
      img.height = 560;
      frame.appendChild(img);
      photos.appendChild(frame);
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
    DATA.projects.items.forEach(function (proj, i) {
      var card = el("article", "project-card reveal-up");
      card.setAttribute("data-project-id", proj.id);

      var media = el("div", "project-media");
      var inner = el("div", "project-media-inner");
      var img = el("img");
      img.src = proj.cover;
      img.loading = "lazy";
      img.alt = t(proj.client) + " — " + t(proj.category);
      inner.appendChild(img);
      media.appendChild(inner);

      var body = el("div", "project-body");
      body.appendChild(el("div", "project-index", "0" + (i + 1)));
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
          var mEl = el("div", "project-metric");
          mEl.appendChild(el("div", "project-metric-value", m.value));
          mEl.appendChild(el("div", "project-metric-label", t(m.label)));
          metrics.appendChild(mEl);
        });
        body.appendChild(metrics);
      }

      if (proj.gallery && proj.gallery.length) {
        var gallery = el("div", "project-gallery");
        proj.gallery.forEach(function (src) {
          var gImg = el("img");
          gImg.src = src;
          gImg.loading = "lazy";
          gImg.alt = t(proj.client) + " — " + (state.lang === "vi" ? "hình ảnh dự án" : "project photo");
          gallery.appendChild(gImg);
        });
        body.appendChild(gallery);
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
      var row = el("div", "competency-row reveal-up");
      row.appendChild(el("div", "competency-index", String(i + 1).padStart(2, "0")));
      var right = el("div");
      right.appendChild(el("div", "competency-title", t(comp.title)));
      right.appendChild(el("div", "competency-items", comp.items.map(t).join(" · ")));
      row.appendChild(right);
      grid.appendChild(row);
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
      item.innerHTML = "<b>" + t(l.name) + "</b> — " + t(l.level);
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
      setupMagnetic();
      setupTiltCards();
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

  function revealFallback() {
    setTimeout(function () { document.body.classList.add("reveal-fallback"); }, 2200);
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

  function setupBackToTop(lenis) {
    document.getElementById("backToTop").addEventListener("click", function () {
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  function setupScrollHint(lenis) {
    document.getElementById("scrollHint").addEventListener("click", function () {
      var target = document.getElementById("about");
      if (lenis) lenis.scrollTo(target, { offset: -70 });
      else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
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
        opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.07,
        scrollTrigger: { trigger: groups[key][0].closest("section") || groups[key][0], start: "top 84%" }
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

  function setupMeshParallax() {
    if (reduceMotion || !window.gsap) return;
    document.querySelectorAll(".mesh-blob").forEach(function (blob, i) {
      window.gsap.to(blob, {
        x: (i % 2 === 0 ? 1 : -1) * 40, y: (i % 2 === 0 ? -1 : 1) * 30,
        duration: 7 + i * 2, ease: "sine.inOut", yoyo: true, repeat: -1
      });
    });
  }

  function setupMagnetic() {
    if (reduceMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.querySelectorAll(".magnetic").forEach(function (node) {
      if (node._magneticBound) return;
      node._magneticBound = true;
      var moveX, moveY;
      if (window.gsap) {
        moveX = window.gsap.quickTo(node, "x", { duration: 0.5, ease: "power3.out" });
        moveY = window.gsap.quickTo(node, "y", { duration: 0.5, ease: "power3.out" });
      }
      node.addEventListener("mousemove", function (e) {
        var r = node.getBoundingClientRect();
        var relX = e.clientX - (r.left + r.width / 2);
        var relY = e.clientY - (r.top + r.height / 2);
        if (moveX) { moveX(relX * 0.35); moveY(relY * 0.5); }
        else { node.style.transform = "translate(" + relX * 0.2 + "px," + relY * 0.3 + "px)"; }
      });
      node.addEventListener("mouseleave", function () {
        if (moveX) { moveX(0); moveY(0); } else { node.style.transform = ""; }
      });
    });
  }

  function setupTiltCards() {
    if (reduceMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.querySelectorAll(".project-media").forEach(function (media) {
      if (media._tiltBound) return;
      media._tiltBound = true;
      var inner = media.querySelector(".project-media-inner");
      media.addEventListener("mousemove", function (e) {
        var r = media.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        inner.style.setProperty("--ry", (px * 14) + "deg");
        inner.style.setProperty("--rx", (py * -14) + "deg");
      });
      media.addEventListener("mouseleave", function () {
        inner.style.setProperty("--rx", "0deg");
        inner.style.setProperty("--ry", "0deg");
      });
    });
  }

  function setupClientLinks(lenis) {
    function goToProject(id) {
      var target = document.querySelector('.project-card[data-project-id="' + id + '"]');
      if (!target) return;
      if (lenis) lenis.scrollTo(target, { offset: -70 });
      else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
    document.getElementById("clientsGroups").addEventListener("click", function (e) {
      var tile = e.target.closest(".client-tile[data-project-id]");
      if (tile) goToProject(tile.getAttribute("data-project-id"));
    });
    document.getElementById("clientsGroups").addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var tile = e.target.closest(".client-tile[data-project-id]");
      if (tile) { e.preventDefault(); goToProject(tile.getAttribute("data-project-id")); }
    });
  }

  function setupHeroParallax() {
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
    window.gsap.to("#heroPhoto", {
      yPercent: 6, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 }
    });
  }

  function init() {
    renderAll();
    revealFallback();
    setupLangToggle();
    setupMobileNav();
    setupHeaderScroll();
    var lenis = setupLenis();
    setupBackToTop(lenis);
    setupScrollHint(lenis);
    setupAnchorLinks(lenis);
    setupClientLinks(lenis);
    setupScrollReveal();
    setupCounters();
    setupMeshParallax();
    setupHeroParallax();
    setupMagnetic();
    setupTiltCards();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
