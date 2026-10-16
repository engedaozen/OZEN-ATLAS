// ÖZEN ATLAS - ana script
if (typeof emailjs !== "undefined") {
  emailjs.init({ publicKey: "dRIMw4Xtw0eo-3xN-" });
}

const DATA_URLS = { recipes: "data/tarifler.json", travels: "data/seyahatler.json" };
const DRAFT_KEYS = { recipes: "tarifler", travels: "seyahatler" }; // admin taslak anahtarları
const PLACEHOLDER = "icons/placeholder.jpg";
const PREVIEW = new URLSearchParams(location.search).has("preview"); // ?preview=1 → admin taslağını göster

// filtre butonu değeri → sayfadaki liste kutusunun id'si
const FILTER_TARGETS = {
  tatli: "tatli", yemek: "yemek", corba: "corba",
  turkiye: "Türkiye", yurtdisi: "Yurtdışı",
};

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const t = (key, fallback = "") => window.translationSystem?.getTranslation(key) ?? fallback;

function slugify(s) {
  const map = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };
  return String(s ?? "").toLowerCase()
    .replace(/[çğıöşü]/g, (c) => map[c])
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function loadList(kind) {
  if (PREVIEW) {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEYS[kind]));
      if (Array.isArray(draft)) return draft;
    } catch { /* taslak yok, yayındaki veriye düş */ }
  }
  try {
    const res = await fetch(DATA_URLS[kind], { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Veri yüklenemedi:", DATA_URLS[kind], err);
    return [];
  }
}

class ElderOzenTravel {
  constructor() {
    this.recipes = [];
    this.travels = [];
    this.init();
  }

  async init() {
    this.initNavigation();
    this.initContactForm();
    this.initCardClicks();

    const hasRecipes = ["tatli", "yemek", "corba"].some((id) => document.getElementById(id));
    const hasTravels = document.getElementById("Türkiye") || document.getElementById("Yurtdışı");

    if (hasRecipes || hasTravels) {
      this.initFilters();
      if (PREVIEW) this.showPreviewBanner();
    }
    if (hasRecipes) {
      this.recipes = await loadList("recipes");
      this.displayRecipes();
    }
    if (hasTravels) {
      this.travels = await loadList("travels");
      this.displayTravels();
    }

    this.initScrollEffects();
    this.scrollToHash();
  }

  // ---------- NAVIGATION ----------
  initNavigation() {
    document.querySelectorAll('a[href="#"]').forEach((a) =>
      a.addEventListener("click", (e) => e.preventDefault()));

    document.querySelectorAll('a[href^="#"]:not([href="#"]):not(.filter-btn)').forEach((a) =>
      a.addEventListener("click", (e) => {
        const target = document.querySelector(a.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }));

    // mobilde linke basınca menüyü kapat (dropdown başlıkları hariç)
    const menu = document.getElementById("navbarNav");
    document.querySelectorAll("#navbarNav .nav-link:not(.dropdown-toggle), #navbarNav .dropdown-item")
      .forEach((link) => link.addEventListener("click", () => {
        if (menu?.classList.contains("show")) window.bootstrap?.Collapse.getOrCreateInstance(menu).hide();
      }));
  }

  scrollToHash() {
    if (!location.hash) return;
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    el?.scrollIntoView();
  }

  showPreviewBanner() {
    document.body.insertAdjacentHTML("beforeend",
      `<div style="position:fixed;bottom:0;left:0;right:0;z-index:2000;background:#8e44ad;color:#fff;
        text-align:center;padding:8px;font-weight:600">Önizleme modu: admin taslağı gösteriliyor</div>`);
  }

  // ---------- CONTACT FORM ----------
  initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleContactSubmit(form);
    });
  }

  handleContactSubmit(form) {
    const alertBox = document.getElementById("alertMessage");
    const btn = document.getElementById("submitBtn");
    const data = new FormData(form);

    if (data.get("website")) return; // honeypot: botlar doldurur
    form.classList.add("was-validated");
    if (!form.checkValidity()) {
      this.showAlert(alertBox, t("contact.form.required", "Lütfen zorunlu alanları doldurun."), "danger");
      return;
    }
    if (typeof emailjs === "undefined") {
      this.showAlert(alertBox, t("contact.form.noservice", "E-posta servisi yüklenemedi."), "danger");
      return;
    }

    const original = btn?.innerHTML;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${esc(t("contact.form.sending", "Gönderiliyor..."))}`;
    }

    const params = {
      name: data.get("name"), email: data.get("email"), subject: data.get("subject"),
      message: data.get("message"), phone: data.get("phone") || "",
      newsletter: data.get("newsletter") || "Hayır",
    };

    emailjs.send("service_otn609g", "template_h0vh3dr", params)
      .then(() => {
        this.showAlert(alertBox, t("contact.form.success", "Mesajınız gönderildi!"), "success");
        form.reset();
        form.classList.remove("was-validated");
      })
      .catch(() => this.showAlert(alertBox, t("contact.form.error", "Gönderilemedi, tekrar deneyin."), "danger"))
      .finally(() => {
        if (btn) { btn.disabled = false; btn.innerHTML = original; }
      });
  }

  showAlert(container, message, type) {
    if (!container) return;
    container.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${esc(message)}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`;
    container.style.display = "block";
    if (type === "success") setTimeout(() => (container.style.display = "none"), 5000);
  }

  // ---------- RECIPES ----------
  displayRecipes() {
    ["tatli", "yemek", "corba"].forEach((cat) => {
      const box = document.getElementById(cat);
      if (box) box.innerHTML = this.recipeCards(this.recipes.filter((r) => r.kategori === cat));
    });
  }

  recipeCards(list) {
    if (!list.length) {
      return `<div class="col-12"><p class="text-center text-muted" data-translate="recipes.empty">Bu kategoride henüz tarif bulunmuyor.</p></div>`;
    }
    return list.map((r) => {
      const lines = String(r.malzemeler ?? "").split("\n").filter(Boolean);
      const preview = lines.slice(0, 3).join("\n") + (lines.length > 3 ? " …" : "");
      return `
      <div class="col-lg-4 col-md-6 mb-4">
        <div class="destination-card">
          <div class="destination-image">
            <img src="${esc(r.resim)}" class="card-img-top" alt="${esc(r.ad)}" loading="lazy"
                 onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
            <div class="destination-overlay">
              <div class="destination-info">
                <h5 class="card-title dyn">${esc(r.ad)}</h5>
                ${r.hazirlamaSuresi ? `<p class="card-text text-white mb-2"><i class="fas fa-clock me-1"></i><span class="dyn">${esc(r.hazirlamaSuresi)}</span></p>` : ""}
                <div class="recipe-content">
                  <h6 data-translate="recipes.ingredients">Malzemeler:</h6>
                  <p class="small dyn dyn-block">${esc(preview)}</p>
                </div>
                <button class="btn btn-primary mt-auto" data-recipe-id="${esc(r.id)}" data-translate="recipes.view">Tarifi Görüntüle</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    }).join("");
  }

  showRecipeModal(id) {
    const r = this.recipes.find((x) => String(x.id) === String(id));
    if (!r) return;
    this.openModal("recipeModal", r.ad, `
      <img src="${esc(r.resim)}" class="img-fluid mb-3 rounded" alt="${esc(r.ad)}"
           onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
      <div class="row">
        <div class="col-md-6">
          <h6 data-translate="recipes.ingredients">Malzemeler:</h6>
          <div class="bg-light p-3 rounded dyn dyn-block">${esc(r.malzemeler)}</div>
        </div>
        <div class="col-md-6">
          <h6 data-translate="recipes.instructions">Yapılışı:</h6>
          <div class="bg-light p-3 rounded dyn dyn-block">${esc(r.yapilisi)}</div>
        </div>
      </div>`);
  }

  // ---------- TRAVELS ----------
  displayTravels() {
    const tr = document.getElementById("Türkiye");
    const yd = document.getElementById("Yurtdışı");
    if (tr) tr.innerHTML = this.travelCards(this.travels.filter((x) => x.kategori === "turkiye"));
    if (yd) yd.innerHTML = this.travelCards(this.travels.filter((x) => x.kategori === "yurtdisi"));
  }

 
 
travelCards(list) {
  if (!list.length) {
    return `<div class="col-12"><p class="text-center text-muted" data-translate="travels.empty">Bu kategoride henüz seyahat bulunmuyor.</p></div>`;
  }

  return list.map((x) => {
    const mapLocation = encodeURIComponent(x.yer || x.ad || "");
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapLocation}`;

    return `
      <div class="col-lg-4 col-md-6 mb-4" id="${esc(x.slug || slugify(x.ad))}">
        <div class="destination-card">
          <div class="destination-image">
            <img src="${esc(x.resim)}"
                 alt="${esc(x.ad)}"
                 class="img-fluid"
                 loading="lazy"
                 onerror="this.onerror=null;this.src='${PLACEHOLDER}'">

            <div class="destination-overlay">
              <div class="destination-info">
                <h4 class="dyn">${esc(x.ad)}</h4>

                <p>
                  <i class="fas fa-map-marker-alt me-2"></i>
                  <span class="dyn">${esc(x.yer)}</span>
                </p>

                <p>
                  <i class="fas fa-calendar me-2"></i>
                  <span class="dyn">${esc(x.tarih)}</span>
                </p>

                <a href="${mapUrl}"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="map-link">
                  <i class="fas fa-map-marker-alt"></i>
                  Haritada Gör
                </a>

                
<button
  class="details-link"
  data-travel-id="${esc(x.id)}"
  data-translate="travels.details">
  <i class="fas fa-info-circle"></i>
  Detayları Gör
</button>

              </div>
            </div>
          </div>
        </div>
      </div>`;
  }).join("");
}


  showTravelModal(id) {
    const x = this.travels.find((v) => String(v.id) === String(id));
    if (!x) return;
    this.openModal("travelModal", x.ad, `
      <img src="${esc(x.resim)}" class="img-fluid mb-3 rounded" alt="${esc(x.ad)}"
           onerror="this.onerror=null;this.src='${PLACEHOLDER}'">
      <p><i class="fas fa-map-marker-alt me-2"></i><span class="dyn">${esc(x.yer)}</span></p>
      <p><i class="fas fa-calendar me-2"></i><span class="dyn">${esc(x.tarih)}</span></p>
      <div class="dyn dyn-block">${esc(x.aciklama)}</div>`);
  }

  // ---------- ORTAK ----------
  openModal(id, title, bodyHTML) {
    document.getElementById(id)?.remove();
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal fade" id="${id}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable"><div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title dyn">${esc(title)}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">${bodyHTML}</div>
        </div></div>
      </div>`);
    const el = document.getElementById(id);
    el.addEventListener("hidden.bs.modal", () => el.remove());
    window.bootstrap.Modal.getOrCreateInstance(el).show();
  }

  initCardClicks() {
    document.addEventListener("click", (e) => {
      const r = e.target.closest("[data-recipe-id]");
      if (r) return this.showRecipeModal(r.dataset.recipeId);
      const v = e.target.closest("[data-travel-id]");
      if (v) this.showTravelModal(v.dataset.travelId);
    });
  }

  initFilters() {
    const buttons = document.querySelectorAll(".filter-btn");
    buttons.forEach((btn) => btn.addEventListener("click", (e) => {
      e.preventDefault();
      buttons.forEach((b) => b.classList.toggle("active", b === btn));
      const filter = btn.dataset.filter;
      Object.entries(FILTER_TARGETS).forEach(([key, id]) => {
        const box = document.getElementById(id)?.closest(".container");
        if (box) box.style.display = filter === "all" || filter === key ? "" : "none";
      });
    }));
  }

  initScrollEffects() {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("visible");
        observer.unobserve(el);
        // animasyon bitince sınıfları kaldır ki hover efektleri çalışsın
        setTimeout(() => el.classList.remove("reveal", "visible"), 700);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll(".feature-card, .destination-card").forEach((el) => {
      el.classList.add("reveal");
      observer.observe(el);
    });
  }
}

new ElderOzenTravel();
