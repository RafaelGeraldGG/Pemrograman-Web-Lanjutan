// Data profil dipisahkan agar mudah diubah tanpa menyentuh logika tampilan.
const members = window.dataAnggota || [];

const memberGrid = document.getElementById("member-grid");
const modal = document.getElementById("member-modal");
const closeButton = document.getElementById("modal-close");
let lastFocusedElement = null;

function renderMembers() {
  memberGrid.innerHTML = members.map((member, index) => `
    <article class="member-card dark-card group relative aspect-[4/5] overflow-hidden rounded-[1.6rem] border border-white/70 bg-slate-100" data-aos="fade-up" data-aos-delay="${index * 130}" data-aos-duration="800" style="--card-index: ${index};">
      <img data-photo="${index}" src="${member.image}" alt="Foto profil ${member.name}" class="member-photo size-full object-cover" loading="lazy" onload="this.classList.add('photo-loaded')">
      <div class="member-info-glass">
        <p class="text-[10px] font-semibold uppercase tracking-[.13em] text-accent">${member.role}</p>
        <h3 class="member-name mt-1.5 font-display text-base font-bold leading-snug text-slate-900">${member.name}</h3>
        <span class="detail-button mt-3 inline-flex items-center gap-1.5 border-t border-white/50 pt-3 text-xs font-semibold text-brand dark:text-blue-200">
          Lihat profil <i data-lucide="arrow-right" class="size-3.5"></i>
        </span>
      </div>
      <button type="button" class="member-card-action" data-member="${index}" aria-label="Lihat profil ${member.name}"></button>
    </article>
  `).join("");
  lucide.createIcons();

  // Memastikan gambar yang sudah ter-cache langsung memicu transisi halus
  requestAnimationFrame(() => {
    document.querySelectorAll(".member-photo").forEach(img => {
      if (img.complete && img.naturalHeight !== 0) {
        img.classList.add("photo-loaded");
      }
    });
  });
}

renderMembers();

function openMember(member, trigger) {
  lastFocusedElement = trigger;
  const modalImage = document.getElementById("modal-image");
  modalImage.style.opacity = "0";
  modalImage.style.transform = "scale(0.9) translateY(8px)";
  modalImage.src = member.image;
  modalImage.alt = `Foto profil ${member.name}`;

  requestAnimationFrame(() => {
    setTimeout(() => {
      modalImage.style.transition = "opacity 0.45s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
      modalImage.style.opacity = "1";
      modalImage.style.transform = "scale(1) translateY(0)";
    }, 60);
  });

  document.getElementById("modal-name").textContent = member.name;
  document.getElementById("modal-role").textContent = member.role;
  document.getElementById("modal-npm").textContent = member.npm;
  document.getElementById("modal-bio").textContent = member.bio;
  document.getElementById("modal-birth-date").textContent = member.birthDate;
  const educationHistory = document.getElementById("modal-education-history");
  educationHistory.replaceChildren();
  [
    ["SD", member.educationHistory?.sd],
    ["SMP", member.educationHistory?.smp],
    ["SMA", member.educationHistory?.sma]
  ].forEach(([level, school]) => {
    const item = document.createElement("li");
    item.className = "education-item";
    const levelLabel = document.createElement("span");
    levelLabel.className = "education-level";
    levelLabel.textContent = level;
    const schoolName = document.createElement("span");
    schoolName.className = "education-school";
    schoolName.textContent = school || "Belum diisi";
    item.append(levelLabel, schoolName);
    educationHistory.append(item);
  });
  document.getElementById("modal-hobby").textContent = member.hobby;
  document.getElementById("modal-quote").textContent = member.quote;
  const emailLink = document.getElementById("modal-email");
  document.getElementById("modal-email-text").textContent = member.email;
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email);
  if (validEmail) emailLink.href = `mailto:${member.email}`;
  else emailLink.removeAttribute("href");
  emailLink.setAttribute("aria-disabled", String(!validEmail));
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.classList.add("overflow-hidden");
  closeButton.focus();
}

function closeMember() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.classList.remove("overflow-hidden");
  if (lastFocusedElement) lastFocusedElement.focus();
}

memberGrid.addEventListener("click", event => {
  const profileButton = event.target.closest(".member-card-action");
  if (profileButton) openMember(members[Number(profileButton.dataset.member)], profileButton);
});

closeButton.addEventListener("click", closeMember);
modal.addEventListener("click", event => { if (event.target === modal) closeMember(); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !modal.classList.contains("hidden")) closeMember();
});

const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

function updateThemeButton() {
  const darkMode = document.documentElement.classList.contains("dark");
  const action = darkMode ? "Aktifkan mode terang" : "Aktifkan mode gelap";
  themeToggle.setAttribute("aria-label", action);
  themeToggle.setAttribute("title", action);
  themeIcon.setAttribute("data-lucide", darkMode ? "sun" : "moon");
  document.querySelector('meta[name="theme-color"]').content = darkMode ? "#0b1726" : "#ffffff";
  lucide.createIcons();
}

themeToggle.addEventListener("click", () => {
  const darkMode = document.documentElement.classList.toggle("dark");
  try {
    localStorage.setItem("ukim-kelompok-1-theme", darkMode ? "dark" : "light");
  } catch (error) {
    console.warn("Preferensi tema tidak dapat disimpan di browser.", error);
  }
  updateThemeButton();
});

const progressBar = document.getElementById("scroll-progress");
let scrollFramePending = false;
function updateScrollProgress() {
  if (scrollFramePending) return;
  scrollFramePending = true;
  requestAnimationFrame(() => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
    progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    scrollFramePending = false;
  });
}
window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

const heroSection = document.getElementById("beranda");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const particleCanvas = document.getElementById("hero-particles");
const particleContext = particleCanvas.getContext("2d");
const particles = [];
let particleFrame = 0;
let particleFrameTime = 0;
let heroIsVisible = true;
let particlePointer = null;

function resizeParticleCanvas() {
  const bounds = heroSection.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  particleCanvas.width = Math.round(bounds.width * pixelRatio);
  particleCanvas.height = Math.round(bounds.height * pixelRatio);
  particleContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  particles.length = 0;
  const count = Math.min(42, Math.max(18, Math.floor((bounds.width * bounds.height) / 26000)));
  for (let index = 0; index < count; index++) {
    particles.push({
      x: Math.random() * bounds.width,
      y: Math.random() * bounds.height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.18,
      radius: Math.random() * 1.4 + 0.55
    });
  }
  drawParticles();
}

function drawParticles(timestamp = 0) {
  if (!particleContext) return;
  if (!prefersReducedMotion.matches && timestamp - particleFrameTime < 32) {
    particleFrame = requestAnimationFrame(drawParticles);
    return;
  }
  particleFrameTime = timestamp;
  const bounds = heroSection.getBoundingClientRect();
  const width = bounds.width;
  const height = bounds.height;
  particleContext.clearRect(0, 0, width, height);
  for (let index = 0; index < particles.length; index++) {
    const particle = particles[index];
    if (!prefersReducedMotion.matches && particlePointer) {
      const dx = particlePointer.x - particle.x;
      const dy = particlePointer.y - particle.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 0 && distance < 155) {
        particleContext.beginPath();
        particleContext.moveTo(particle.x, particle.y);
        particleContext.lineTo(particlePointer.x, particlePointer.y);
        particleContext.strokeStyle = `rgba(190,220,255,${(1 - distance / 155) * 0.19})`;
        particleContext.lineWidth = 0.7;
        particleContext.stroke();
      }
    }
    for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex++) {
      const other = particles[otherIndex];
      const distance = Math.hypot(other.x - particle.x, other.y - particle.y);
      if (distance < 112) {
        particleContext.beginPath();
        particleContext.moveTo(particle.x, particle.y);
        particleContext.lineTo(other.x, other.y);
        particleContext.strokeStyle = `rgba(176,207,244,${(1 - distance / 112) * 0.12})`;
        particleContext.lineWidth = 0.65;
        particleContext.stroke();
      }
    }
    particleContext.beginPath();
    particleContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    particleContext.fillStyle = "rgba(204,226,255,.5)";
    particleContext.fill();
    if (!prefersReducedMotion.matches) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;
    }
  }
  if (!prefersReducedMotion.matches && heroIsVisible && !document.hidden) {
    particleFrame = requestAnimationFrame(drawParticles);
  }
}

if (particleContext) {
  resizeParticleCanvas();
  const heroVisibilityObserver = new IntersectionObserver(entries => {
    heroIsVisible = entries[0].isIntersecting;
    if (heroIsVisible && !prefersReducedMotion.matches && !document.hidden && !particleFrame) {
      particleFrame = requestAnimationFrame(drawParticles);
    } else if (!heroIsVisible && particleFrame) {
      cancelAnimationFrame(particleFrame);
      particleFrame = 0;
    }
  });
  heroVisibilityObserver.observe(heroSection);
  window.addEventListener("resize", resizeParticleCanvas, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && particleFrame) {
      cancelAnimationFrame(particleFrame);
      particleFrame = 0;
    } else if (!document.hidden && heroIsVisible && !prefersReducedMotion.matches && !particleFrame) {
      particleFrame = requestAnimationFrame(drawParticles);
    }
  });
  prefersReducedMotion.addEventListener("change", () => {
    cancelAnimationFrame(particleFrame);
    particleFrame = 0;
    drawParticles();
    if (!prefersReducedMotion.matches && heroIsVisible && !document.hidden) {
      particleFrame = requestAnimationFrame(drawParticles);
    }
  });
  heroSection.addEventListener("pointermove", event => {
    const bounds = heroSection.getBoundingClientRect();
    particlePointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }, { passive: true });
  heroSection.addEventListener("pointerleave", () => { particlePointer = null; }, { passive: true });
  if (!prefersReducedMotion.matches) particleFrame = requestAnimationFrame(drawParticles);
}

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  memberGrid.addEventListener("pointermove", event => {
    const card = event.target.closest(".member-card");
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.setProperty("--tilt-x", `${relativeY * -3}deg`);
    card.style.setProperty("--tilt-y", `${relativeX * 3}deg`);
  }, { passive: true });
  memberGrid.addEventListener("pointerout", event => {
    const card = event.target.closest(".member-card");
    if (card && !card.contains(event.relatedTarget)) {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    }
  }, { passive: true });
}

const sectionLinks = document.querySelectorAll('header a[href^="#"]');
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    sectionLinks.forEach(link => {
      const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
      if (isCurrent) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
      if (link.closest(".lg\\:flex, .md\\:flex")) link.classList.toggle("nav-current", isCurrent);
    });
  });
}, { rootMargin: "-30% 0px -60% 0px" });
document.querySelectorAll("main section[id]").forEach(section => navObserver.observe(section));

menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  menuToggle.setAttribute("aria-label", expanded ? "Buka menu navigasi" : "Tutup menu navigasi");
  mobileMenu.classList.toggle("hidden", expanded);
  menuToggle.innerHTML = `<i data-lucide="${expanded ? "menu" : "x"}" class="size-5"></i>`;
  lucide.createIcons();
});
mobileMenu.addEventListener("click", event => {
  if (event.target.closest("a")) {
    mobileMenu.classList.add("hidden");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Buka menu navigasi");
    menuToggle.innerHTML = '<i data-lucide="menu" class="size-5"></i>';
    lucide.createIcons();
  }
});

document.getElementById("current-year").textContent = new Date().getFullYear();
updateThemeButton();

/* ==========================================================
   1. PRELOADER RESMI UKIM & FILKOM
   ========================================================== */
function initPreloader() {
  const preloader = document.getElementById("site-preloader");
  const progressBar = document.getElementById("preloader-progress-bar");
  const percentText = document.getElementById("preloader-percent");
  const statusText = document.getElementById("preloader-status");

  if (!preloader || !progressBar) return;
  // Halaman sudah selesai membangun fitur saat fungsi ini dipanggil.
  // Jangan menahan pengunjung dengan progres buatan yang tetap berjalan.
  progressBar.style.width = "100%";
  if (percentText) percentText.textContent = "100%";
  if (statusText) statusText.textContent = "Siap dieksplorasi!";

  window.setTimeout(() => {
    preloader.classList.add("fade-out");
    window.setTimeout(() => {
      preloader.remove();
    }, 250);
  }, 750);
}

/* ==========================================================
   2. INTERACTIVE COURSE OVERVIEW TABS & WORKFLOW SIMULATOR
   ========================================================== */
function initCourseOverview() {
  // Master Switcher (Materi vs Alur Kerja Web)
  const btnViewMateri = document.getElementById("btn-view-materi");
  const btnViewAlur = document.getElementById("btn-view-alur");
  const viewMateri = document.getElementById("view-materi");
  const viewAlur = document.getElementById("view-alur");

  if (btnViewMateri && btnViewAlur && viewMateri && viewAlur) {
    btnViewMateri.addEventListener("click", () => {
      btnViewMateri.classList.add("active");
      btnViewAlur.classList.remove("active");
      viewMateri.classList.remove("hidden");
      viewAlur.classList.add("hidden");
      lucide.createIcons();
    });

    btnViewAlur.addEventListener("click", () => {
      btnViewAlur.classList.add("active");
      btnViewMateri.classList.remove("active");
      viewAlur.classList.remove("hidden");
      viewMateri.classList.add("hidden");
      lucide.createIcons();
    });
  }

  // Sub-tabs for Apa yang Dipelajari
  const tabButtons = document.querySelectorAll(".course-tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.tab;
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add("active");
        lucide.createIcons();
      }
    });
  });

  // Interactive Architecture Simulation
  const runSimBtn = document.getElementById("btn-run-sim");
  const simBadge = document.getElementById("sim-status-badge");
  const simMetric = document.getElementById("sim-metric");

  if (runSimBtn && simBadge && simMetric) {
    runSimBtn.addEventListener("click", () => {
      simBadge.className = "rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/70 dark:text-amber-300";
      simBadge.textContent = "Fetching stream...";
      runSimBtn.disabled = true;
      runSimBtn.classList.add("opacity-60");

      setTimeout(() => {
        const ms = Math.floor(Math.random() * 20) + 12;
        const size = (Math.random() * 0.8 + 1.2).toFixed(1);
        simBadge.className = "rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300";
        simBadge.textContent = "HTTP 200 OK (Rehydrated)";
        simMetric.textContent = `Latensi simulasi: ${ms}ms · ${size}KB payload`;
        runSimBtn.disabled = false;
        runSimBtn.classList.remove("opacity-60");
      }, 550);
    });
  }

  // Interactive State Counter
  let reactiveCount = 5;
  const countDisplay = document.getElementById("state-display");
  const countVal = document.getElementById("state-val");
  const incBtn = document.getElementById("btn-state-inc");
  const decBtn = document.getElementById("btn-state-dec");

  function updateStateCounter() {
    if (countDisplay) countDisplay.textContent = reactiveCount;
    if (countVal) countVal.textContent = reactiveCount;
  }

  if (incBtn) {
    incBtn.addEventListener("click", () => {
      reactiveCount += 1;
      updateStateCounter();
    });
  }
  if (decBtn) {
    decBtn.addEventListener("click", () => {
      reactiveCount = Math.max(0, reactiveCount - 1);
      updateStateCounter();
    });
  }

  // Interactive Sanitizer Demo
  const sanitizeInput = document.getElementById("demo-sanitize-input");
  const sanitizeOutput = document.getElementById("demo-sanitize-output");

  if (sanitizeInput && sanitizeOutput) {
    sanitizeInput.addEventListener("input", () => {
      const escaped = sanitizeInput.value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      sanitizeOutput.textContent = escaped || "(kosong)";
    });
  }

  // Interactive Web Workflow Stepper Simulation
  const runWorkflowBtn = document.getElementById("btn-run-workflow");
  const workflowCards = document.querySelectorAll(".workflow-card");
  const workflowStatusText = document.getElementById("workflow-status-text");
  const workflowStepBadge = document.getElementById("workflow-step-badge");

  const workflowMessages = [
    "Langkah 1/6: Pengguna memicu aksi di browser (Event capture & payload packaging)",
    "Langkah 2/6: Resolusi DNS Lookup (Domain ke IP) & Membangun koneksi aman TLS/HTTPS",
    "Langkah 3/6: Mengirimkan HTTP Request ke server (GET/POST paket terkirim via jaringan)",
    "Langkah 4/6: Web Server menerima request, memeriksa routing endpoint & middleware controller",
    "Langkah 5/6: Eksekusi query Database & Server merangkum respon HTTP 200 OK beserta data JSON",
    "Langkah 6/6: Browser memproses payload JSON, hydration DOM reaktif & merender antarmuka!"
  ];

  let workflowInterval = null;

  if (runWorkflowBtn && workflowCards.length > 0) {
    runWorkflowBtn.addEventListener("click", () => {
      if (workflowInterval) clearInterval(workflowInterval);
      runWorkflowBtn.disabled = true;
      runWorkflowBtn.classList.add("opacity-60");

      let stepIndex = 0;
      workflowCards.forEach(card => card.classList.remove("active-step"));

      function advanceWorkflow() {
        if (stepIndex >= workflowCards.length) {
          clearInterval(workflowInterval);
          workflowInterval = null;
          runWorkflowBtn.disabled = false;
          runWorkflowBtn.classList.remove("opacity-60");
          if (workflowStatusText) {
            workflowStatusText.innerHTML = `<strong class="text-emerald-500">Selesai!</strong> Seluruh alur kerja web dari Klien hingga Server dan kembali ke Klien berhasil disimulasikan.`;
          }
          if (workflowStepBadge) workflowStepBadge.textContent = "Step 6 / 6 (Selesai)";
          return;
        }

        workflowCards.forEach((c, idx) => {
          c.classList.toggle("active-step", idx === stepIndex);
        });

        if (workflowStatusText) {
          workflowStatusText.textContent = workflowMessages[stepIndex];
        }
        if (workflowStepBadge) {
          workflowStepBadge.textContent = `Step ${stepIndex + 1} / 6`;
        }

        stepIndex += 1;
      }

      advanceWorkflow();
      workflowInterval = setInterval(advanceWorkflow, 1200);
    });

    // Clicking individual workflow card
    workflowCards.forEach((card, index) => {
      card.addEventListener("click", () => {
        if (workflowInterval) {
          clearInterval(workflowInterval);
          workflowInterval = null;
          runWorkflowBtn.disabled = false;
          runWorkflowBtn.classList.remove("opacity-60");
        }
        workflowCards.forEach((c, idx) => c.classList.toggle("active-step", idx === index));
        if (workflowStatusText) workflowStatusText.textContent = workflowMessages[index];
        if (workflowStepBadge) workflowStepBadge.textContent = `Step ${index + 1} / 6`;
      });
    });
  }
}

/* ==========================================================
   3. RUANG SARAN & PESAN PENGUNJUNG (FORM SAJA)
   ========================================================== */
function initFeedbackSystem() {
  const form = document.getElementById("feedback-form");
  const charCounter = document.getElementById("char-counter");
  const messageInput = document.getElementById("feedback-message");
  const alertBox = document.getElementById("feedback-alert");

  if (!form) return;

  const STORAGE_KEY = "ukim_kelompok1_feedback";

  function saveFeedback(item) {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      existing.unshift(item);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch (e) {
      console.warn("Gagal menyimpan feedback ke localStorage", e);
    }
  }

  // Character counter
  if (messageInput && charCounter) {
    messageInput.addEventListener("input", () => {
      charCounter.textContent = `${messageInput.value.length} / 500`;
    });
  }

  // Form submission
  form.addEventListener("submit", event => {
    event.preventDefault();
    const name = document.getElementById("feedback-name").value.trim();
    const contact = document.getElementById("feedback-contact").value.trim();
    const message = messageInput.value.trim();
    const categoryElem = document.querySelector('input[name="feedback-category"]:checked');
    const category = categoryElem ? categoryElem.value : "Saran Perbaikan";

    if (!name || !message) return;

    const newFeedback = {
      id: "fb-" + Date.now(),
      name: name,
      category: category,
      contact: contact,
      message: message,
      timestamp: new Date().toISOString()
    };

    saveFeedback(newFeedback);

    // Reset form
    form.reset();
    if (charCounter) charCounter.textContent = "0 / 500";

    // Show alert
    if (alertBox) {
      alertBox.classList.remove("hidden");
      lucide.createIcons();
      setTimeout(() => {
        alertBox.classList.add("hidden");
      }, 5000);
    }
  });
}

// Inisialisasi seluruh fitur
initPreloader();
initCourseOverview();
initFeedbackSystem();

lucide.createIcons();
AOS.init({ duration: 650, once: false, mirror: true, offset: 55, easing: "ease-out-cubic" });

