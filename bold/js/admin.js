(function () {
  "use strict";

  /* ---------------- IndexedDB: persist the picked directory handle across reloads ---------------- */
  var DB_NAME = "mason-admin-db";
  var STORE = "handles";

  function idbOpen() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () { req.result.createObjectStore(STORE); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }
  function idbGet(key) {
    return idbOpen().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readonly");
        var req = tx.objectStore(STORE).get(key);
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }
  function idbSet(key, val) {
    return idbOpen().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(val, key);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  /* ---------------- State ---------------- */
  var rootHandle = null;   // portfolio-mason/
  var dataDirHandle = null; // portfolio-mason/data
  var imagesDirHandle = null; // portfolio-mason/assets/images
  var boldDirHandle = null; // portfolio-mason/bold
  var DATA = null;

  var statusEl = document.getElementById("adminStatus");
  var mainEl = document.getElementById("adminMain");
  var emptyEl = document.getElementById("adminEmpty");

  function setStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.className = "admin-status" + (kind ? " is-" + kind : "");
  }

  function vi(field) {
    if (field == null) return "";
    if (typeof field === "object" && !Array.isArray(field)) return field.vi != null ? field.vi : "";
    return String(field);
  }

  /* ---------------- Connect flow ---------------- */
  function supportsFSA() {
    return "showDirectoryPicker" in window;
  }

  async function connect(fromStoredHandle) {
    try {
      var handle = fromStoredHandle;
      if (!handle) {
        handle = await window.showDirectoryPicker({ mode: "readwrite" });
      }
      var perm = await handle.queryPermission({ mode: "readwrite" });
      if (perm !== "granted") {
        perm = await handle.requestPermission({ mode: "readwrite" });
      }
      if (perm !== "granted") {
        setStatus("Chưa được cấp quyền ghi vào thư mục.", "error");
        return;
      }

      // Validate: must contain data/content.json
      var dataDir, contentFile;
      try {
        dataDir = await handle.getDirectoryHandle("data");
        contentFile = await dataDir.getFileHandle("content.json");
      } catch (e) {
        setStatus("Thư mục này không phải portfolio-mason (thiếu data/content.json). Hãy chọn lại đúng thư mục gốc.", "error");
        return;
      }

      rootHandle = handle;
      dataDirHandle = dataDir;
      imagesDirHandle = await (await handle.getDirectoryHandle("assets")).getDirectoryHandle("images");
      boldDirHandle = await handle.getDirectoryHandle("bold");

      var file = await contentFile.getFile();
      var text = await file.text();
      DATA = JSON.parse(text);

      await idbSet("rootHandle", handle);

      setStatus("Đã kết nối: " + handle.name, "ok");
      emptyEl.hidden = true;
      mainEl.hidden = false;
      renderAll();
    } catch (e) {
      if (e && e.name === "AbortError") return; // user cancelled picker
      console.error(e);
      setStatus("Lỗi kết nối: " + (e && e.message ? e.message : e), "error");
    }
  }

  async function tryAutoReconnect() {
    if (!supportsFSA()) {
      document.getElementById("adminUnsupported").hidden = false;
      return;
    }
    try {
      var handle = await idbGet("rootHandle");
      if (!handle) return;
      var perm = await handle.queryPermission({ mode: "readwrite" });
      if (perm === "granted") {
        await connect(handle);
      } else {
        setStatus("Đã lưu thư mục trước đó — bấm Kết nối để cấp lại quyền.", null);
      }
    } catch (e) {
      // silently ignore — user will connect manually
    }
  }

  document.getElementById("btnConnect").addEventListener("click", function () { connect(null); });
  document.getElementById("btnConnectBig").addEventListener("click", function () { connect(null); });

  /* ---------------- Persist content.json + content.js + bump cache version ---------------- */
  async function writeFile(dirHandle, filename, text) {
    var fh = await dirHandle.getFileHandle(filename, { create: true });
    var w = await fh.createWritable();
    await w.write(text);
    await w.close();
  }

  async function writeImageBlob(filename, blob) {
    var fh = await imagesDirHandle.getFileHandle(filename, { create: true });
    var w = await fh.createWritable();
    await w.write(blob);
    await w.close();
  }

  async function bumpCacheVersion() {
    try {
      var fh = await boldDirHandle.getFileHandle("index.html");
      var file = await fh.getFile();
      var text = await file.text();
      var maxV = 0;
      text.replace(/\?v=(\d+)/g, function (m, n) { maxV = Math.max(maxV, parseInt(n, 10)); return m; });
      var next = maxV + 1;
      var updated = text.replace(/\?v=\d+/g, "?v=" + next);
      var w = await fh.createWritable();
      await w.write(updated);
      await w.close();
    } catch (e) {
      console.warn("Could not bump cache version:", e);
    }
  }

  var saveTimer = null;
  function persist() {
    setStatus("Đang lưu...", null);
    return Promise.all([
      writeFile(dataDirHandle, "content.json", JSON.stringify(DATA, null, 2)),
      writeFile(dataDirHandle, "content.js",
        "// AUTO-GENERATED from content.json — do not hand-edit.\nwindow.SITE_CONTENT = " + JSON.stringify(DATA, null, 2) + ";\n")
    ]).then(bumpCacheVersion).then(function () {
      var t = new Date();
      setStatus("Đã lưu lúc " + t.toLocaleTimeString("vi-VN"), "ok");
    }).catch(function (e) {
      console.error(e);
      setStatus("Lỗi khi lưu: " + (e && e.message ? e.message : e), "error");
    });
  }

  /* ---------------- Slot config (single-image fields) ---------------- */
  function buildPersonalSlots() {
    var slots = [];
    slots.push({
      id: "hero", label: "Ảnh Hero (trang chủ)", hint: "dọc 3:4 · ≥1400×1867px",
      aspect: [3, 4], targetPx: [1400, 1867], filename: "hero-portrait.jpg",
      get: function () { return DATA.personal.heroPhoto; },
      set: function (v) { DATA.personal.heroPhoto = v; }
    });
    DATA.personal.aboutPhotos.forEach(function (_, i) {
      slots.push({
        id: "about-" + i, label: "Ảnh Giới thiệu #" + (i + 1), hint: "dọc 3:4 · ≥1200×1600px",
        aspect: [3, 4], targetPx: [1200, 1600], filename: "about-" + (i + 1) + ".jpg",
        get: function () { return DATA.personal.aboutPhotos[i]; },
        set: function (v) { DATA.personal.aboutPhotos[i] = v; }
      });
    });
    slots.push({
      id: "ownership-rail", label: "Ảnh Rail — Định vị", hint: "dọc 4:5 · ≥960×1200px",
      aspect: [4, 5], targetPx: [960, 1200], filename: "ownership-rail.jpg",
      get: function () { return DATA.ownership.railImage || ""; },
      set: function (v) { DATA.ownership.railImage = v; }
    });
    DATA.ownership.chapters.forEach(function (ch) {
      if (ch.stat) {
        var c = ch.cases[0];
        slots.push({
          id: "ownership-team-" + ch.id, label: "Ảnh: " + vi(c.label) + " (" + vi(ch.title) + ")",
          hint: "ngang ~2.5:1 · ≥1600×640px",
          aspect: [2.5, 1], targetPx: [1600, 640], filename: "ownership-team.jpg",
          get: function () { return c.image || ""; },
          set: function (v) { if (v) c.image = v; else delete c.image; }
        });
      } else {
        ch.cases.forEach(function (c, i) {
          slots.push({
            id: "ownership-case-" + ch.id + "-" + i, label: "Case: " + vi(c.label) + " (" + vi(ch.title) + ")",
            hint: "ngang 4:3 · ≥1000×750px",
            aspect: [4, 3], targetPx: [1000, 750], filename: "ownership-case-" + ch.id + "-" + i + ".jpg",
            get: function () { return c.image || ""; },
            set: function (v) { if (v) c.image = v; else delete c.image; }
          });
        });
      }
    });
    return slots;
  }

  function buildProjectSlots() {
    return DATA.projects.items.map(function (p) {
      return {
        id: "cover-" + p.id, label: "Ảnh đại diện: " + p.client, hint: "ngang 4:3 · ≥1600×1200px",
        aspect: [4, 3], targetPx: [1600, 1200], filename: "cover-" + p.id + ".jpg",
        get: function () { return p.cover || ""; },
        set: function (v) { p.cover = v; }
      };
    });
  }

  /* ---------------- Render: single-image slot cards ---------------- */
  function renderSlotGrid(container, slots) {
    container.innerHTML = "";
    slots.forEach(function (slot) {
      var card = document.createElement("div");
      card.className = "admin-card";

      var thumb = document.createElement("div");
      thumb.className = "admin-card-thumb";
      var ratio = slot.aspect[1] / slot.aspect[0];
      thumb.style.aspectRatio = slot.aspect[0] + " / " + slot.aspect[1];

      var current = slot.get();
      if (current) {
        var img = document.createElement("img");
        img.src = current;
        img.loading = "lazy";
        thumb.appendChild(img);
      } else {
        var ph = document.createElement("div");
        ph.className = "admin-thumb-empty";
        ph.textContent = "Chưa có ảnh";
        thumb.appendChild(ph);
      }

      var body = document.createElement("div");
      body.className = "admin-card-body";
      var label = document.createElement("div");
      label.className = "admin-card-label";
      label.textContent = slot.label;
      var meta = document.createElement("div");
      meta.className = "admin-card-meta";
      meta.textContent = slot.hint;

      var actions = document.createElement("div");
      actions.className = "admin-card-actions";
      var btnUpload = document.createElement("button");
      btnUpload.textContent = current ? "Đổi ảnh" : "Chọn ảnh mới";
      btnUpload.className = "primary";
      btnUpload.addEventListener("click", function () { openFilePicker(slot, function () { renderSlotGrid(container, slots); }); });
      actions.appendChild(btnUpload);

      if (current) {
        var btnRemove = document.createElement("button");
        btnRemove.textContent = "Xoá ảnh";
        btnRemove.className = "danger";
        btnRemove.addEventListener("click", async function () {
          slot.set("");
          await persist();
          renderSlotGrid(container, slots);
        });
        actions.appendChild(btnRemove);
      }

      body.appendChild(label);
      body.appendChild(meta);
      body.appendChild(actions);
      card.appendChild(thumb);
      card.appendChild(body);
      container.appendChild(card);
    });
  }

  /* ---------------- File picker -> crop modal ---------------- */
  var pendingSlot = null;
  var pendingDone = null;
  var fileInput = document.getElementById("fileInput");

  function openFilePicker(slot, onDone) {
    pendingSlot = slot;
    pendingDone = onDone;
    fileInput.value = "";
    fileInput.click();
  }

  fileInput.addEventListener("change", function () {
    var file = fileInput.files && fileInput.files[0];
    if (!file || !pendingSlot) return;
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () { openCropModal(img, pendingSlot); };
    img.src = url;
  });

  /* ---------------- Crop modal (canvas pan + zoom) ---------------- */
  var cropModal = document.getElementById("cropModal");
  var cropCanvas = document.getElementById("cropCanvas");
  var cropCtx = cropCanvas.getContext("2d");
  var cropZoom = document.getElementById("cropZoom");
  var cropTitle = document.getElementById("cropTitle");
  var cropHint = document.getElementById("cropHint");

  var cropState = null; // {img, slot, vw, vh, baseScale, scale, offX, offY}

  function openCropModal(img, slot) {
    var maxW = Math.min(460, window.innerWidth - 80);
    var vw = maxW;
    var vh = Math.round(vw * slot.aspect[1] / slot.aspect[0]);
    if (vh > window.innerHeight * 0.5) {
      vh = Math.round(window.innerHeight * 0.5);
      vw = Math.round(vh * slot.aspect[0] / slot.aspect[1]);
    }
    cropCanvas.width = vw;
    cropCanvas.height = vh;
    cropCanvas.style.width = vw + "px";
    cropCanvas.style.height = vh + "px";

    var baseScale = Math.max(vw / img.naturalWidth, vh / img.naturalHeight);
    cropState = {
      img: img, slot: slot, vw: vw, vh: vh, baseScale: baseScale, scale: 1,
      offX: 0, offY: 0, dragging: false, lastX: 0, lastY: 0
    };
    cropZoom.value = "1";
    cropTitle.textContent = slot.label;
    cropHint.textContent = "Kích thước lưu: " + slot.targetPx[0] + "×" + slot.targetPx[1] + "px — kéo để dịch chuyển, dùng thanh trượt để zoom.";
    drawCrop();
    cropModal.classList.add("is-open");
    cropModal.setAttribute("aria-hidden", "false");
  }

  function closeCropModal() {
    cropModal.classList.remove("is-open");
    cropModal.setAttribute("aria-hidden", "true");
    cropState = null;
  }

  function clampOffset() {
    var s = cropState;
    var effScale = s.baseScale * s.scale;
    var drawW = s.img.naturalWidth * effScale;
    var drawH = s.img.naturalHeight * effScale;
    var maxOffX = Math.max(0, (drawW - s.vw) / 2);
    var maxOffY = Math.max(0, (drawH - s.vh) / 2);
    s.offX = Math.max(-maxOffX, Math.min(maxOffX, s.offX));
    s.offY = Math.max(-maxOffY, Math.min(maxOffY, s.offY));
  }

  function drawCrop() {
    var s = cropState;
    if (!s) return;
    var effScale = s.baseScale * s.scale;
    var drawW = s.img.naturalWidth * effScale;
    var drawH = s.img.naturalHeight * effScale;
    clampOffset();
    var x = (s.vw - drawW) / 2 + s.offX;
    var y = (s.vh - drawH) / 2 + s.offY;
    cropCtx.clearRect(0, 0, s.vw, s.vh);
    cropCtx.fillStyle = "#000";
    cropCtx.fillRect(0, 0, s.vw, s.vh);
    cropCtx.drawImage(s.img, x, y, drawW, drawH);
  }

  cropZoom.addEventListener("input", function () {
    if (!cropState) return;
    cropState.scale = parseFloat(cropZoom.value);
    drawCrop();
  });

  function pointerDown(x, y) {
    if (!cropState) return;
    cropState.dragging = true;
    cropState.lastX = x; cropState.lastY = y;
  }
  function pointerMove(x, y) {
    if (!cropState || !cropState.dragging) return;
    cropState.offX += (x - cropState.lastX);
    cropState.offY += (y - cropState.lastY);
    cropState.lastX = x; cropState.lastY = y;
    drawCrop();
  }
  function pointerUp() { if (cropState) cropState.dragging = false; }

  cropCanvas.addEventListener("mousedown", function (e) { pointerDown(e.clientX, e.clientY); });
  window.addEventListener("mousemove", function (e) { pointerMove(e.clientX, e.clientY); });
  window.addEventListener("mouseup", pointerUp);
  cropCanvas.addEventListener("touchstart", function (e) { var t = e.touches[0]; pointerDown(t.clientX, t.clientY); }, { passive: true });
  cropCanvas.addEventListener("touchmove", function (e) { var t = e.touches[0]; pointerMove(t.clientX, t.clientY); }, { passive: true });
  cropCanvas.addEventListener("touchend", pointerUp);

  document.getElementById("cropCancel").addEventListener("click", closeCropModal);
  document.getElementById("cropBackdrop").addEventListener("click", closeCropModal);

  document.getElementById("cropConfirm").addEventListener("click", async function () {
    if (!cropState) return;
    var s = cropState;
    var effScale = s.baseScale * s.scale;
    var drawW = s.img.naturalWidth * effScale;
    var drawH = s.img.naturalHeight * effScale;
    var x = (s.vw - drawW) / 2 + s.offX;
    var y = (s.vh - drawH) / 2 + s.offY;

    // Source rect in original-image pixel space that maps to the viewport.
    var sx = (0 - x) / effScale;
    var sy = (0 - y) / effScale;
    var sw = s.vw / effScale;
    var sh = s.vh / effScale;

    var out = document.createElement("canvas");
    out.width = s.slot.targetPx[0];
    out.height = s.slot.targetPx[1];
    var octx = out.getContext("2d");
    octx.drawImage(s.img, sx, sy, sw, sh, 0, 0, out.width, out.height);

    var blob = await new Promise(function (resolve) { out.toBlob(resolve, "image/jpeg", 0.87); });
    await writeImageBlob(s.slot.filename, blob);
    s.slot.set("../assets/images/" + s.slot.filename);
    await persist();
    closeCropModal();
    if (pendingDone) pendingDone();
  });

  /* ---------------- Product Library (proofOfWork.assets) ---------------- */
  function categoryOptions(selected) {
    return DATA.proofOfWork.categories.map(function (c) {
      return '<option value="' + c.id + '"' + (c.id === selected ? " selected" : "") + ">" + vi(c.label) + "</option>";
    }).join("");
  }
  function projectOptions(selected) {
    var opts = '<option value=""' + (!selected ? " selected" : "") + ">(không liên kết)</option>";
    opts += DATA.projects.items.map(function (p) {
      return '<option value="' + p.id + '"' + (p.id === selected ? " selected" : "") + ">" + p.client + "</option>";
    }).join("");
    return opts;
  }

  function renderLibrary() {
    var container = document.getElementById("gridLibrary");
    container.innerHTML = "";
    DATA.proofOfWork.assets.forEach(function (asset) {
      var card = document.createElement("div");
      card.className = "admin-card";

      var thumb = document.createElement("div");
      thumb.className = "admin-card-thumb";
      thumb.style.aspectRatio = "1 / 1";
      if (asset.type === "image" && asset.url) {
        var img = document.createElement("img");
        img.src = asset.url;
        img.loading = "lazy";
        thumb.appendChild(img);
      } else {
        var ph = document.createElement("div");
        ph.className = "admin-thumb-empty";
        ph.textContent = asset.url ? (asset.type === "video" ? "Video: " + asset.url.slice(0, 30) + "…" : "PDF") : "Chưa có nội dung";
        thumb.appendChild(ph);
      }

      var body = document.createElement("div");
      body.className = "admin-card-body";
      var label = document.createElement("div");
      label.className = "admin-card-label";
      label.textContent = vi(asset.description) || "(chưa có mô tả)";
      var meta = document.createElement("div");
      meta.className = "admin-card-meta";
      var catLabel = DATA.proofOfWork.categories.find(function (c) { return c.id === asset.category; });
      meta.textContent = asset.type.toUpperCase() + " · " + (catLabel ? vi(catLabel.label) : asset.category) + (asset.projectId ? " · " + asset.projectId : "");

      var actions = document.createElement("div");
      actions.className = "admin-card-actions";

      if (asset.type === "image") {
        var btnUpload = document.createElement("button");
        btnUpload.textContent = asset.url ? "Đổi ảnh" : "Tải ảnh";
        btnUpload.className = "primary";
        btnUpload.addEventListener("click", function () {
          openFilePicker({
            label: vi(asset.description) || asset.id, hint: "vuông 1:1", aspect: [1, 1], targetPx: [1200, 1200],
            filename: "proof-" + asset.id + ".jpg",
            get: function () { return asset.url; },
            set: function (v) { asset.url = v; }
          }, renderLibrary);
        });
        actions.appendChild(btnUpload);
      }

      var btnEdit = document.createElement("button");
      btnEdit.textContent = "Sửa thông tin";
      btnEdit.addEventListener("click", function () { openAssetModal(asset); });
      actions.appendChild(btnEdit);

      var btnRemove = document.createElement("button");
      btnRemove.textContent = "Xoá mục";
      btnRemove.className = "danger";
      btnRemove.addEventListener("click", async function () {
        if (!confirm("Xoá hẳn mục này khỏi thư viện?")) return;
        DATA.proofOfWork.assets = DATA.proofOfWork.assets.filter(function (a) { return a !== asset; });
        await persist();
        renderLibrary();
      });
      actions.appendChild(btnRemove);

      body.appendChild(label);
      body.appendChild(meta);
      body.appendChild(actions);
      card.appendChild(thumb);
      card.appendChild(body);
      container.appendChild(card);
    });
  }

  /* ---------------- Add / edit library asset modal ---------------- */
  var assetModal = document.getElementById("assetModal");
  var assetType = document.getElementById("assetType");
  var assetCategory = document.getElementById("assetCategory");
  var assetProject = document.getElementById("assetProject");
  var assetDescVi = document.getElementById("assetDescVi");
  var assetDescEn = document.getElementById("assetDescEn");
  var assetUrlInput = document.getElementById("assetUrlInput");
  var assetUrlRow = document.getElementById("assetUrlRow");
  var editingAsset = null;

  function nextAssetId() {
    var n = 1;
    var ids = DATA.proofOfWork.assets.map(function (a) { return a.id; });
    while (ids.indexOf("custom-" + n) !== -1) n++;
    return "custom-" + n;
  }

  function openAssetModal(asset) {
    editingAsset = asset || null;
    document.getElementById("assetModalTitle").textContent = asset ? "Sửa mục thư viện" : "Thêm mục thư viện";
    assetCategory.innerHTML = categoryOptions(asset ? asset.category : DATA.proofOfWork.categories[0].id);
    assetProject.innerHTML = projectOptions(asset ? asset.projectId : "");
    assetType.value = asset ? asset.type : "image";
    assetDescVi.value = asset ? vi(asset.description) : "";
    assetDescEn.value = asset && asset.description ? (asset.description.en || "") : "";
    assetUrlInput.value = asset && asset.type !== "image" ? (asset.url || "") : "";
    assetUrlRow.hidden = assetType.value === "image";
    assetModal.classList.add("is-open");
    assetModal.setAttribute("aria-hidden", "false");
  }
  function closeAssetModal() {
    assetModal.classList.remove("is-open");
    assetModal.setAttribute("aria-hidden", "true");
    editingAsset = null;
  }
  assetType.addEventListener("change", function () { assetUrlRow.hidden = assetType.value === "image"; });
  document.getElementById("assetCancel").addEventListener("click", closeAssetModal);
  document.getElementById("assetBackdrop").addEventListener("click", closeAssetModal);
  document.getElementById("btnAddAsset").addEventListener("click", function () { openAssetModal(null); });

  document.getElementById("assetSave").addEventListener("click", async function () {
    var desc = { vi: assetDescVi.value.trim(), en: assetDescEn.value.trim() };
    var type = assetType.value;
    var category = assetCategory.value;
    var projectId = assetProject.value;

    if (editingAsset) {
      editingAsset.type = type;
      editingAsset.category = category;
      editingAsset.description = desc;
      if (projectId) editingAsset.projectId = projectId; else delete editingAsset.projectId;
      if (type !== "image") editingAsset.url = assetUrlInput.value.trim();
    } else {
      var newAsset = { id: nextAssetId(), type: type, category: category, url: type === "image" ? "" : assetUrlInput.value.trim(), description: desc };
      if (projectId) newAsset.projectId = projectId;
      DATA.proofOfWork.assets.push(newAsset);
    }
    await persist();
    closeAssetModal();
    renderLibrary();
  });

  /* ---------------- Render everything ---------------- */
  function renderAll() {
    renderSlotGrid(document.getElementById("gridPersonal"), buildPersonalSlots());
    renderSlotGrid(document.getElementById("gridProjects"), buildProjectSlots());
    renderLibrary();
  }

  tryAutoReconnect();
})();
