(function () {
  "use strict";

  var DATA = window.SITE_CONTENT;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var state = {
    lang: localStorage.getItem("mason-lang") || "vi",
    activeProjectTab: 0,
    openExperienceIndex: 0,
    proofCategory: "all",
    proofAssets: (DATA.proofOfWork && DATA.proofOfWork.assets) || []
  };

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

    var mobileCvBtn = document.getElementById("mobileNavCvBtn");
    mobileCvBtn.href = DATA.personal.cv[state.lang];
    mobileCvBtn.textContent = t(DATA.ui.downloadCv);
  }

  function renderHero() {
    setText("heroEyebrow", t(DATA.hero.eyebrow));
    var headlineEl = document.getElementById("heroHeadline");
    var headlineText = t(DATA.hero.headline);
    var accentText = DATA.hero.headlineAccent && t(DATA.hero.headlineAccent);
    if (accentText && headlineText.indexOf(accentText) !== -1) {
      headlineEl.innerHTML = headlineText.replace(accentText, '<span class="hero-headline-accent">' + accentText + "</span>");
    } else {
      headlineEl.textContent = headlineText;
    }
    setText("heroSub", t(DATA.hero.subheadline));

    var contactBtn = document.getElementById("heroContactBtn");
    contactBtn.textContent = t(DATA.ui.contactCta);

    var cvBtn = document.getElementById("heroCvBtn");
    cvBtn.href = DATA.personal.cv[state.lang];
    cvBtn.textContent = t(DATA.ui.downloadCv);

    var photoInner = document.getElementById("heroPhotoInner");
    var existingHeroPh = photoInner.querySelector(".hero-photo-ph");
    if (existingHeroPh) existingHeroPh.remove();
    var photo = document.getElementById("heroPhoto");
    if (DATA.personal.heroPhoto) {
      photo.style.display = "";
      photo.src = DATA.personal.heroPhoto;
      photo.alt = DATA.personal.fullName + " — " + t(DATA.personal.title);
    } else {
      photo.style.display = "none";
      var heroPh = el("div", "ph hero-photo-ph");
      heroPh.innerHTML = PH_ICON_IMAGE + '<span class="ph-label">' + t(DATA.personal.heroPhotoPlaceholder) + "</span>";
      photoInner.insertBefore(heroPh, photo);
    }

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
      if (src) {
        var img = el("img");
        img.src = src;
        img.loading = "lazy";
        img.alt = DATA.personal.fullName;
        img.width = 450;
        img.height = 560;
        frame.appendChild(img);
      } else {
        var ph = el("div", "ph about-photo-ph");
        ph.innerHTML = PH_ICON_IMAGE + '<span class="ph-label">' + t(DATA.personal.aboutPhotoPlaceholder) + "</span>";
        frame.appendChild(ph);
      }
      photos.appendChild(frame);
    });

    var stats = document.getElementById("statsGrid");
    stats.innerHTML = "";
    DATA.about.highlights.forEach(function (stat) {
      var prefix = stat.prefix || "";
      var suffix = t(stat.suffix) || "";
      var card = el("div", "stat" + ((prefix + stat.value + suffix).length > 6 ? " is-long" : ""));
      var value = el("div", "stat-value reveal-up");
      value.setAttribute("data-count", stat.value);
      value.setAttribute("data-prefix", prefix);
      value.setAttribute("data-suffix", suffix);
      value.textContent = prefix + "0" + suffix;
      var label = el("div", "stat-label reveal-up", t(stat.label));
      card.appendChild(value);
      card.appendChild(label);
      stats.appendChild(card);
    });
  }

  var PH_ICON_IMAGE = '<svg class="ph-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>';
  var PH_ICON_TEAM = '<svg class="ph-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>';
  var PH_ICON_DOC = '<svg class="ph-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>';
  var PH_ICON_PLAY = '<svg class="ph-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none"/></svg>';

  function proofTypeIcon(type) {
    if (type === "pdf") return PH_ICON_DOC;
    if (type === "video") return PH_ICON_PLAY;
    return PH_ICON_IMAGE;
  }

  function renderOwnership() {
    var O = DATA.ownership;
    setText("ownershipEyebrow", t(O.eyebrow));
    setText("ownershipHeadline", t(O.headline));
    setText("ownershipIntro", t(O.intro));

    var railPh = document.getElementById("ownershipRailPlaceholder");
    if (O.railImage) {
      railPh.className = "ownership-rail-placeholder";
      railPh.innerHTML = "";
      var railImg = el("img", "ownership-rail-img");
      railImg.src = O.railImage;
      railImg.loading = "lazy";
      railImg.alt = t(O.railPlaceholder);
      railPh.appendChild(railImg);
    } else {
      railPh.className = "ownership-rail-placeholder ph";
      railPh.innerHTML = PH_ICON_IMAGE + '<span class="ph-label">' + t(O.railPlaceholder) + "</span>";
    }

    var nav = document.getElementById("ownershipNav");
    nav.innerHTML = "";
    O.chapters.forEach(function (chapter, i) {
      var a = el("a", "ownership-nav-item");
      a.href = "#ownership-chapter-" + chapter.id;
      a.setAttribute("data-nav", String(i + 1));
      a.innerHTML = '<span class="ownership-nav-num">' + String(i + 1).padStart(2, "0") + "</span><span>" + t(chapter.navLabel) + "</span>";
      nav.appendChild(a);
    });

    var chaptersEl = document.getElementById("ownershipChapters");
    chaptersEl.innerHTML = "";
    O.chapters.forEach(function (chapter, i) {
      var article = el("article", "ownership-chapter reveal-up");
      article.id = "ownership-chapter-" + chapter.id;
      article.setAttribute("data-chapter", String(i + 1));

      article.appendChild(el("span", "ownership-chapter-index", String(i + 1).padStart(2, "0")));
      article.appendChild(el("h3", "ownership-chapter-title", t(chapter.title)));
      article.appendChild(el("p", "ownership-chapter-body", t(chapter.body)));

      if (chapter.stat) {
        // Leadership-style chapter: one placeholder photo next to a big stat callout, instead of the generic case grid.
        var statRow = el("div", "ownership-stat-row");
        var phCard = el("div", "ph");
        phCard.innerHTML = PH_ICON_TEAM + '<span class="ph-label">' + t(chapter.cases[0].label) + "</span>";
        var statCard = el("div", "ownership-stat-card");
        statCard.innerHTML = '<span class="ownership-stat-value">' + chapter.stat.value + '</span><span class="ownership-stat-card-label">' + t(chapter.stat.label) + "</span>";
        statRow.appendChild(phCard);
        statRow.appendChild(statCard);
        article.appendChild(statRow);
      } else {
        var cases = el("div", "ownership-cases");
        chapter.cases.forEach(function (c) {
          var hasLink = !!c.projectId;
          var hasImage = !!c.image;
          var card = el("div", "ownership-case" + (hasImage ? "" : " ph") + (hasLink ? " has-link" : ""));
          var text = t(c.label) + (c.detail ? "<br>" + t(c.detail) : "");
          if (hasImage) {
            var caseImg = el("img", "ownership-case-img");
            caseImg.src = c.image;
            caseImg.loading = "lazy";
            caseImg.alt = t(c.label);
            card.appendChild(caseImg);
          } else {
            card.innerHTML = PH_ICON_IMAGE + '<span class="ph-label">' + text + "</span>";
          }
          if (hasLink) {
            card.setAttribute("data-project-id", c.projectId);
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");
            var hintText = state.lang === "vi" ? "Xem case study →" : "View case study →";
            card.appendChild(el("span", "ownership-case-hint", hintText));
          }
          cases.appendChild(card);
        });
        article.appendChild(cases);
      }

      if (chapter.techTags) {
        var techRow = el("div", "ownership-tech-row");
        chapter.techTags.forEach(function (tag) { techRow.appendChild(el("span", "tag", tag)); });
        techRow.appendChild(el("span", "ownership-tech-note", "— " + t(chapter.techNote)));
        article.appendChild(techRow);
      }

      if (chapter.note) {
        article.appendChild(el("p", "ownership-note", t(chapter.note)));
      }

      var value = el("div", "ownership-value");
      value.appendChild(el("p", null, t(chapter.value)));
      article.appendChild(value);

      chaptersEl.appendChild(article);
    });
  }

  function renderProjects() {
    setText("projectsEyebrow", t(DATA.projects.eyebrow));
    setText("projectsHeading", t(DATA.projects.heading));

    var tabsEl = document.getElementById("projectTabs");
    tabsEl.innerHTML = "";
    var featuredIds = DATA.projects.featuredIds || DATA.projects.items.map(function (p) { return p.id; });
    DATA.projects.items.forEach(function (proj, i) {
      if (featuredIds.indexOf(proj.id) === -1) return; // not one of the featured tabs, but still reachable via deep links (ownership/proof/clients)
      var isActive = i === state.activeProjectTab;
      var btn = el("button", "project-tab" + (isActive ? " is-active" : ""), t(proj.client));
      btn.type = "button";
      btn.setAttribute("data-tab-index", String(i));
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
      tabsEl.appendChild(btn);
    });

    renderProjectPanel();
  }

  function renderProjectPanel() {
    var proj = DATA.projects.items[state.activeProjectTab];
    var panel = document.getElementById("projectPanel");
    panel.innerHTML = "";

    var media = el("div", "project-media");
    var inner = el("div", "project-media-inner");
    if (proj.cover) {
      var img = el("img");
      img.src = proj.cover;
      img.loading = "lazy";
      img.alt = t(proj.client) + " — " + t(proj.category);
      inner.appendChild(img);
    } else {
      var coverPh = el("div", "ph project-cover-ph");
      coverPh.innerHTML = PH_ICON_IMAGE + '<span class="ph-label">' + t(proj.client) + " — " + t(DATA.projects.coverPlaceholder) + "</span>";
      inner.appendChild(coverPh);
    }
    media.appendChild(inner);

    var body = el("div", "project-body");
    body.appendChild(el("div", "project-index", "0" + (state.activeProjectTab + 1)));
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

    if (getAssetsForProject(proj.id).length) {
      var proofBtn = el("button", "btn btn-line proof-cta", t(DATA.proofOfWork.viewDetailLabel));
      proofBtn.type = "button";
      proofBtn.setAttribute("data-proof-project", proj.id);
      body.appendChild(proofBtn);
    }

    panel.appendChild(media);
    panel.appendChild(body);

    if (window.gsap && !reduceMotion) {
      window.gsap.fromTo(panel, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
    }
    setupTiltCards(); // each tab switch creates a fresh .project-media node that needs its own tilt binding
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  /* ---------------- Proof of Work (gallery + case-study modal) ---------------- */

  function getProofAssets() {
    return state.proofAssets || [];
  }

  function getAssetsForProject(projectId) {
    return getProofAssets().filter(function (a) { return a.projectId === projectId; });
  }

  function getFilteredProofAssets() {
    var assets = getProofAssets();
    if (state.proofCategory === "all") return assets;
    return assets.filter(function (a) { return a.category === state.proofCategory; });
  }

  function buildProofTile(asset) {
    var hasFile = !!asset.url;
    var tile = el("div", "proof-tile" + (hasFile ? "" : " ph"));
    if (hasFile && asset.type === "image") {
      var img = el("img");
      img.src = asset.url;
      img.loading = "lazy";
      img.alt = t(asset.description);
      tile.appendChild(img);
      tile.appendChild(el("span", "proof-tile-caption", t(asset.description)));
    } else if (hasFile) {
      tile.classList.add("proof-tile-file");
      tile.innerHTML = proofTypeIcon(asset.type) + '<span class="proof-tile-caption">' + t(asset.description) + "</span>";
    } else {
      tile.innerHTML = proofTypeIcon(asset.type) + '<span class="ph-label">' + t(asset.description) + "</span>";
    }
    if (hasFile) {
      tile.setAttribute("data-proof-url", asset.link || asset.url);
      tile.setAttribute("role", "link");
      tile.setAttribute("tabindex", "0");
    }
    return tile;
  }

  function renderProofGrid(container, assets) {
    if (!container) return;
    container.innerHTML = "";
    if (!assets.length) {
      container.appendChild(el("p", "proof-empty", t(DATA.proofOfWork.emptyLabel)));
      return;
    }
    assets.forEach(function (asset) { container.appendChild(buildProofTile(asset)); });
  }

  function renderProofOfWork() {
    var P = DATA.proofOfWork;
    setText("proofEyebrow", t(P.eyebrow));
    setText("proofHeading", t(P.heading));
    setText("proofIntro", t(P.intro));

    var filters = document.getElementById("proofFilters");
    filters.innerHTML = "";
    var allChip = el("button", "proof-chip" + (state.proofCategory === "all" ? " is-active" : ""), t(P.allLabel));
    allChip.type = "button";
    allChip.setAttribute("data-category", "all");
    allChip.setAttribute("role", "tab");
    allChip.setAttribute("aria-selected", state.proofCategory === "all" ? "true" : "false");
    filters.appendChild(allChip);
    P.categories.forEach(function (cat) {
      var isActive = state.proofCategory === cat.id;
      var chip = el("button", "proof-chip" + (isActive ? " is-active" : ""), t(cat.label));
      chip.type = "button";
      chip.setAttribute("data-category", cat.id);
      chip.setAttribute("role", "tab");
      chip.setAttribute("aria-selected", isActive ? "true" : "false");
      filters.appendChild(chip);
    });

    renderProofGrid(document.getElementById("proofGrid"), getFilteredProofAssets());
  }

  var proofModalTrigger = null;

  function openProofModal(projectId, trigger) {
    var proj = DATA.projects.items.find(function (p) { return p.id === projectId; });
    if (!proj) return;
    proofModalTrigger = trigger || null;
    setText("proofModalEyebrow", t(DATA.proofOfWork.eyebrow));
    setText("proofModalTitle", t(proj.client));
    renderProofGrid(document.getElementById("proofModalGrid"), getAssetsForProject(projectId));
    var modal = document.getElementById("proofModal");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    document.getElementById("proofModalClose").focus();
  }

  function closeProofModal() {
    var modal = document.getElementById("proofModal");
    if (!modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (proofModalTrigger) { proofModalTrigger.focus(); proofModalTrigger = null; }
  }

  /* Live sync from a published Google Sheet (optional — see README.md).
     Reads DATA.proofOfWork.sheetUrl; if blank, or if the fetch fails for any
     reason (most commonly: page opened via file:// instead of a real http(s)
     deploy, since file:// pages can't fetch external URLs), the mock
     `assets` already in content.json stay in place. Never throws. */
  function normalizeSheetKey(s) {
    return (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function parseSheetIdAndGid(url) {
    var m = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    var id = m ? m[1] : url.trim();
    var gidMatch = url.match(/[?&#]gid=(\d+)/);
    return { id: id, gid: gidMatch ? gidMatch[1] : "0" };
  }

  function loadProofAssetsFromSheet() {
    var sheetUrl = DATA.proofOfWork && DATA.proofOfWork.sheetUrl;
    if (!sheetUrl) return;
    var parsed = parseSheetIdAndGid(sheetUrl);
    var endpoint = "https://docs.google.com/spreadsheets/d/" + parsed.id + "/gviz/tq?tqx=out:json&gid=" + parsed.gid;

    fetch(endpoint)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (text) {
        var jsonText = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
        var data = JSON.parse(jsonText);
        var cols = data.table.cols.map(function (c) { return normalizeSheetKey(c.label || c.id); });
        var assets = data.table.rows.map(function (row) {
          var obj = {};
          (row.c || []).forEach(function (cell, i) { obj[cols[i]] = cell ? cell.v : ""; });
          return {
            id: obj.id || "",
            type: (obj.type || "image").toLowerCase(),
            category: obj.category || "",
            projectId: obj.projectid || "",
            url: obj.url || "",
            description: { vi: obj.descriptionvi || obj.description || "", en: obj.descriptionen || obj.description || "" }
          };
        }).filter(function (a) { return a.url; });

        if (assets.length) {
          state.proofAssets = assets;
          renderProofOfWork();
        }
      })
      .catch(function (err) {
        console.info("[proof-of-work] Live Google Sheet not reachable right now — showing sample data instead.", err);
      });
  }

  function setupProofFilters() {
    document.getElementById("proofFilters").addEventListener("click", function (e) {
      var chip = e.target.closest(".proof-chip");
      if (!chip) return;
      var cat = chip.getAttribute("data-category");
      if (cat === state.proofCategory) return;
      state.proofCategory = cat;
      document.querySelectorAll("#proofFilters .proof-chip").forEach(function (c) {
        var active = c.getAttribute("data-category") === cat;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-selected", active ? "true" : "false");
      });
      renderProofGrid(document.getElementById("proofGrid"), getFilteredProofAssets());
    });
  }

  function setupProofModal() {
    document.getElementById("projectPanel").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-proof-project]");
      if (btn) openProofModal(btn.getAttribute("data-proof-project"), btn);
    });
    document.getElementById("proofModalClose").addEventListener("click", closeProofModal);
    document.getElementById("proofModalBackdrop").addEventListener("click", closeProofModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeProofModal();
    });
  }

  function setupProofTileOpen() {
    // Delegated on document since tiles live in two different, re-rendered
    // grids (#proofGrid and #proofModalGrid) — one listener covers both.
    document.addEventListener("click", function (e) {
      var tile = e.target.closest("[data-proof-url]");
      if (tile) window.open(tile.getAttribute("data-proof-url"), "_blank", "noopener");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var tile = e.target.closest("[data-proof-url]");
      if (tile) { e.preventDefault(); window.open(tile.getAttribute("data-proof-url"), "_blank", "noopener"); }
    });
  }

  function renderCapabilities() {
    var Cp = DATA.capabilities;
    setText("capabilitiesEyebrow", t(Cp.eyebrow));
    setText("capabilitiesHeading", t(Cp.heading));
    setText("capExperienceLabel", t(Cp.experienceLabel));
    setText("capEducationLabel", t(Cp.educationLabel));
    setText("capCompetenciesLabel", t(Cp.competenciesLabel));
    setText("capSkillsLabel", t(Cp.skillsLabel));

    // -- Experience, as an accordion (collapsed rows expand to the full role detail) --
    var accordion = document.getElementById("capAccordion");
    accordion.innerHTML = "";
    DATA.experience.items.forEach(function (item, i) {
      var isOpen = state.openExperienceIndex === i;
      var itemEl = el("div", "cap-accordion-item" + (isOpen ? " is-open" : ""));
      itemEl.setAttribute("data-accordion-index", String(i));

      var trigger = el("button", "cap-accordion-trigger");
      trigger.type = "button";
      trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      var left = el("div");
      left.appendChild(el("div", "cap-accordion-role", t(item.role)));
      left.appendChild(el("div", "cap-accordion-meta", item.company + " · " + t(item.period)));
      trigger.appendChild(left);
      trigger.appendChild(el("span", "cap-accordion-icon"));

      var panelWrap = el("div", "cap-accordion-panel-wrap");
      var panelInner = el("div", "cap-accordion-panel-inner");
      var bodyEl = el("div", "cap-accordion-body");
      bodyEl.appendChild(el("p", null, t(item.summary)));
      var ul = el("ul");
      item.bullets.forEach(function (b) { ul.appendChild(el("li", null, t(b))); });
      bodyEl.appendChild(ul);
      var tags = el("div", "cap-accordion-tags");
      item.tags.forEach(function (tag) { tags.appendChild(el("span", "tag", tag)); });
      bodyEl.appendChild(tags);
      panelInner.appendChild(bodyEl);
      panelWrap.appendChild(panelInner);

      itemEl.appendChild(trigger);
      itemEl.appendChild(panelWrap);
      accordion.appendChild(itemEl);
    });

    // -- Education --
    var sc = DATA.education.schools[0];
    var eduBody = document.getElementById("capEducationBody");
    eduBody.innerHTML = "";
    eduBody.appendChild(el("div", "cap-education-school", t(sc.school)));
    eduBody.appendChild(el("div", "cap-education-program", t(sc.program)));
    eduBody.appendChild(el("div", "cap-education-period", t(sc.period)));
    eduBody.appendChild(el("div", "cap-education-honor", t(sc.honor)));
    if (DATA.education.planNote) {
      eduBody.appendChild(el("div", "cap-education-note", t(DATA.education.planNote)));
    }
    var certList = el("div", "cap-cert-list");
    DATA.education.certificates.forEach(function (c) {
      certList.appendChild(el("span", "cert-pill", t(c.name)));
    });
    eduBody.appendChild(certList);

    // -- Core competencies --
    var compBody = document.getElementById("capCompetenciesBody");
    compBody.innerHTML = "";
    DATA.competencies.items.forEach(function (comp) {
      var row = el("div", "competency-row");
      row.appendChild(el("div", "competency-title", t(comp.title)));
      row.appendChild(el("div", "competency-items", comp.items.map(t).join(" · ")));
      compBody.appendChild(row);
    });

    // -- Skills & tools --
    var skillsBody = document.getElementById("capSkillsBody");
    skillsBody.innerHTML = "";
    var skillsGridEl = el("div", "skills-grid");
    DATA.skills.categories.forEach(function (cat) {
      var col = el("div", "skill-category");
      col.appendChild(el("div", "skill-category-label", t(cat.label)));
      var tagsEl = el("div", "skill-tags");
      cat.items.forEach(function (item) { tagsEl.appendChild(el("span", "skill-tag", t(item))); });
      col.appendChild(tagsEl);
      skillsGridEl.appendChild(col);
    });
    skillsBody.appendChild(skillsGridEl);

    var langRow = document.getElementById("capLanguagesRow");
    langRow.innerHTML = "";
    DATA.skills.languages.forEach(function (l) {
      var item = el("div", "language-item");
      item.innerHTML = "<b>" + t(l.name) + "</b> — " + t(l.level);
      langRow.appendChild(item);
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
    renderOwnership();
    renderProjects();
    renderProofOfWork();
    renderCapabilities();
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
      setupOwnershipTracking();
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
    // Exactly one clock may call lenis.raf() or its internal deltas get fed
    // two different time epochs and the animation stalls silently (scrollTo
    // "succeeds" but nothing moves). GSAP's ticker is the driver whenever
    // it's present (its own official Lenis integration); plain rAF is only
    // a fallback for the case GSAP failed to load.
    if (window.gsap) {
      window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
      if (window.ScrollTrigger) lenis.on("scroll", window.ScrollTrigger.update);
    } else {
      (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })();
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
    // Delegated on document (bound once): correctly covers anchors that get
    // rebuilt by renderAll() on every language toggle (e.g. the ownership
    // chapter nav), which per-node listeners would silently stop working on
    // after the first re-render since those nodes get replaced.
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
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
        var isFloat = target % 1 !== 0;
        if (reduceMotion) {
          entry.target.textContent = prefix + target + suffix;
          return;
        }
        var obj = { v: 0 };
        window.gsap ? window.gsap.to(obj, {
          v: target, duration: 1.6, ease: "power2.out",
          onUpdate: function () {
            entry.target.textContent = prefix + (isFloat ? obj.v.toFixed(1) : Math.round(obj.v)) + suffix;
          }
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

  function scrollToProject(id, lenis) {
    // Projects live behind tabs now (only one panel in the DOM at a time), so
    // "go to project X" means: select its tab, then scroll the section into view.
    var idx = DATA.projects.items.findIndex(function (p) { return p.id === id; });
    if (idx === -1) return;
    if (idx !== state.activeProjectTab) {
      state.activeProjectTab = idx;
      document.querySelectorAll(".project-tab").forEach(function (b, i) {
        b.classList.toggle("is-active", i === idx);
        b.setAttribute("aria-selected", i === idx ? "true" : "false");
      });
      renderProjectPanel();
    }
    var target = document.getElementById("projects");
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: -70 });
    else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  function setupProjectLinkDelegation(containerId, itemSelector, lenis) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.addEventListener("click", function (e) {
      var item = e.target.closest(itemSelector + "[data-project-id]");
      if (item) scrollToProject(item.getAttribute("data-project-id"), lenis);
    });
    container.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var item = e.target.closest(itemSelector + "[data-project-id]");
      if (item) { e.preventDefault(); scrollToProject(item.getAttribute("data-project-id"), lenis); }
    });
  }

  function setupProjectTabs() {
    document.getElementById("projectTabs").addEventListener("click", function (e) {
      var btn = e.target.closest(".project-tab");
      if (!btn) return;
      var idx = parseInt(btn.getAttribute("data-tab-index"), 10);
      if (idx === state.activeProjectTab) return;
      state.activeProjectTab = idx;
      document.querySelectorAll(".project-tab").forEach(function (b, i) {
        b.classList.toggle("is-active", i === idx);
        b.setAttribute("aria-selected", i === idx ? "true" : "false");
      });
      renderProjectPanel();
    });
  }

  function setupCapAccordion() {
    document.getElementById("capAccordion").addEventListener("click", function (e) {
      var trigger = e.target.closest(".cap-accordion-trigger");
      if (!trigger) return;
      var item = trigger.closest(".cap-accordion-item");
      var idx = parseInt(item.getAttribute("data-accordion-index"), 10);
      state.openExperienceIndex = state.openExperienceIndex === idx ? -1 : idx;
      document.querySelectorAll(".cap-accordion-item").forEach(function (it) {
        var i = parseInt(it.getAttribute("data-accordion-index"), 10);
        var open = i === state.openExperienceIndex;
        it.classList.toggle("is-open", open);
        it.querySelector(".cap-accordion-trigger").setAttribute("aria-expanded", open ? "true" : "false");
      });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  }

  function setupHeroParallax() {
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
    window.gsap.to("#heroPhoto", {
      yPercent: 6, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 }
    });
  }

  var _ownershipTrackingListener = null;

  function setupOwnershipTracking() {
    // Active-chapter wayfinding for the sticky rail nav: recomputed from real
    // element positions on every scroll (whichever chapter's midpoint sits
    // closest to the 45%-viewport line wins), instead of several independent
    // trigger zones that can overlap and race on tall or fast-scrolled content.
    // Re-run after every renderAll() (lang toggle rebuilds these nodes), so
    // the previous listener — which would otherwise keep reading stale,
    // detached elements — is removed first.
    if (_ownershipTrackingListener) {
      window.removeEventListener("scroll", _ownershipTrackingListener);
      _ownershipTrackingListener = null;
    }
    var chapters = document.querySelectorAll(".ownership-chapter");
    var navItems = document.querySelectorAll(".ownership-nav-item");
    if (!chapters.length || !navItems.length) return;

    function setActive(n) {
      navItems.forEach(function (a) {
        a.classList.toggle("is-active", a.getAttribute("data-nav") === String(n));
      });
    }
    function update() {
      var line = window.innerHeight * 0.45;
      var best = null, bestDist = Infinity;
      chapters.forEach(function (c) {
        var r = c.getBoundingClientRect();
        var dist = Math.abs(r.top + r.height / 2 - line);
        if (dist < bestDist) { bestDist = dist; best = c; }
      });
      if (best) setActive(best.getAttribute("data-chapter"));
    }
    _ownershipTrackingListener = update;
    window.addEventListener("scroll", update, { passive: true });
    update();
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
    setupProjectLinkDelegation("clientsGroups", ".client-tile", lenis);
    setupProjectLinkDelegation("ownershipChapters", ".ownership-case", lenis);
    setupProjectTabs();
    setupProofFilters();
    setupProofModal();
    setupProofTileOpen();
    loadProofAssetsFromSheet();
    setupCapAccordion();
    setupScrollReveal();
    setupCounters();
    setupMeshParallax();
    setupHeroParallax();
    setupOwnershipTracking();
    setupMagnetic();
    setupTiltCards();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
