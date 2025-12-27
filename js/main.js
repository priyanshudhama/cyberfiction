/* =====================================================
   CYBERFICTION – UNIFIED MAIN ENGINE
   Author: Priyanshu Dhama
===================================================== */

/* ========= AUTH GUARD ========= */
const isAuthPage = location.pathname.includes("/auth/");
const isIntroPage = location.pathname.includes("intro.html");
const isLoggedIn =
  localStorage.getItem("cyberfiction_user") ||
  sessionStorage.getItem("cyberfiction_user");

const shouldPlayIntro = sessionStorage.getItem("playIntro");

// 🚫 Not logged in → always go to login
if (!isLoggedIn && !isAuthPage) {
  window.location.href = "auth/login.html";
}

// ✅ Logged in but intro should play → allow intro
if (isLoggedIn && shouldPlayIntro && !isIntroPage) {
  window.location.href = "auth/intro.html";
}


let currentUser = null;

try {
  currentUser = JSON.parse(
    localStorage.getItem("cyberfiction_user")
  );
} catch (e) {
  currentUser = null;
}
document.addEventListener("DOMContentLoaded", () => {
  const rawUser = localStorage.getItem("cyberfiction_user");
  if (!rawUser) return;

  let user;
  try {
    user = JSON.parse(rawUser);
  } catch {
    return;
  }

  const nameEl = document.getElementById("username");
  const avatarEl = document.getElementById("userAvatar");

  if (nameEl) {
    nameEl.textContent = user.username || "Observer";
    nameEl.setAttribute("data-text", nameEl.textContent); // 🔥 glitch sync
  }

  if (avatarEl) {
    avatarEl.src = user.avatar || "assets/avatars/default.png";
  }
});



window.addEventListener("load", () => {
  const fromIntro = sessionStorage.getItem("fromIntro");
  const t = document.getElementById("transition");

  if (fromIntro && t) {
    t.classList.add("active");

    setTimeout(() => {
      t.classList.remove("active");
      sessionStorage.removeItem("fromIntro");
    }, 300);
  }
});



const page = document.body.dataset.page;

/* ---------- CANVAS SETUP (SHARED) ---------- */
let canvas, ctx;
let images = [];
const frameCount = 300;
let frame = 0;
let t = 0;


function setupCanvas(id) {
  canvas = document.getElementById(id);
  if (!canvas) return false;

  ctx = canvas.getContext("2d");
  resize();
  window.addEventListener("resize", resize);
  return true;
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

/* ---------- IMAGE LOADER ---------- */
function loadImages(callback) {
  let loaded = 0;
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = `assets/images/male${String(i + 1).padStart(4, "0")}.png`;
    img.onload = () => {
      loaded++;
      if (loaded === 1) callback();
    };
    images.push(img);
  }
}

/* ---------- RENDER ---------- */


function drawImage(options = {}) {
  const img = images[Math.floor(frame)];
  if (!img) return;

  const scale = Math.max(
    canvas.width / img.width,
    canvas.height / img.height
  );

  const x = (canvas.width - img.width * scale) / 2 + (options.x || 0);
  const y = (canvas.height - img.height * scale) / 2 + (options.y || 0);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = options.alpha ?? 1;

  ctx.save();
  if (options.rotate) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(options.rotate);
    ctx.drawImage(
      img,
      -img.width * scale / 2,
      -img.height * scale / 2,
      img.width * scale,
      img.height * scale
    );
  } else {
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
  }
  ctx.restore();

  ctx.globalAlpha = 1;
}

/* =====================================================
   PAGE-SPECIFIC LOGIC
===================================================== */

/* ---------- HOME ---------- */
function homeAnimation() {
  function loop() {
    t += 0.01;
    frame = (frame + 0.5) % frameCount;
    drawImage();
    requestAnimationFrame(loop);
  }
  loop();
}

/* ---------- COMMUNITY (BREATHING) ---------- */
function communityAnimation() {
  function loop() {
    t += 0.01;
    frame = Math.floor((Math.sin(t) * 0.5 + 0.5) * (frameCount - 1));
    drawImage({
      alpha: 0.25,
      x: Math.sin(t * 0.6) * 20,
      y: Math.cos(t * 0.8) * 10
    });
    requestAnimationFrame(loop);
  }
  loop();
}

/* ---------- ABOUT (CINEMATIC STILLNESS) ---------- */
function aboutAnimation() {
  function loop() {
    t += 0.002;
    frame = Math.floor((Math.sin(t) * 0.5 + 0.5) * (frameCount - 1));
    drawImage({ alpha: 0.22 });
    requestAnimationFrame(loop);
  }
  loop();
}


/* ---------- MARKETPLACE (AMBIENT) ---------- */
function marketplaceAnimation() {
  function loop() {
    frame = (frame + 0.15) % frameCount;
   drawImage({
  alpha: mood.alpha,
  x: (Math.random() - 0.5) * mood.shake,
  y: (Math.random() - 0.5) * mood.shake
});
t += 0.01 * mood.speed;

    requestAnimationFrame(loop);
  }
  loop();
}

/* ---------- LABS (EXPERIMENTAL) ---------- */
function labsAnimation() {
  function loop() {
    t += 0.02;
    frame = Math.abs(Math.floor((t * 30 + Math.random() * 40) % frameCount));
    drawImage({
      rotate: Math.sin(t) * 0.05
    });
    requestAnimationFrame(loop);
  }
  loop();
}

/* ---------- EXPERIENCE (INTENSE) ---------- */
/* ---------- EXPERIENCE (CINEMATIC FORCE) ---------- */
function experienceAnimation() {
  let mouseX = 0.5;
  let velocity = 0;
  let targetFrame = 0;

  window.addEventListener("mousemove", e => {
    mouseX = e.clientX / window.innerWidth;
  });

  function loop() {
    t += 0.025;

    // 🎯 Target jumps forward aggressively
    targetFrame += 2.2;
    if (targetFrame >= frameCount) targetFrame = 0;

    // ⚡ Momentum smoothing
    frame += (targetFrame - frame) * 0.08;

    // 🎥 Camera pressure
    const shakeX = Math.sin(t * 18) * 4;
    const shakeY = Math.cos(t * 14) * 3;

    // 🌀 Torque from cursor
    const rotation = (mouseX - 0.5) * 0.18;

    drawImage({
      rotate: rotation,
      x: shakeX,
      y: shakeY,
      alpha: 0.6
    });

    requestAnimationFrame(loop);
  }

  loop();
}


/* =====================================================
   BOOTSTRAP
===================================================== */
/* ---------- UNIVERSE (COSMIC DRIFT) ---------- */
function universeAnimation() {
  let driftX = 0;
  let driftY = 0;

  function loop() {
    t += 0.004;

    // 🔁 Non-linear frame oscillation (not sequential)
    frame = Math.floor(
      (Math.sin(t * 0.9) * 0.4 + 0.5) * (frameCount - 1)
    );

    // 🌫️ Slow spatial drift
    driftX = Math.sin(t * 0.3) * 30;
    driftY = Math.cos(t * 0.4) * 18;

    // 🌌 Subtle scale breathing illusion
    drawImage({
      alpha: 0.32,
      x: driftX,
      y: driftY
    });

    requestAnimationFrame(loop);
  }

  loop();
}
/* ---------- CHARACTERS (IDENTITY DEPTH) ---------- */
function charactersAnimation() {
  let mouseX = 0.5;
  let mouseY = 0.5;

  window.addEventListener("mousemove", e => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  function loop() {
    t += 0.01;

    // 🧠 Identity snap (cursor chooses frame)
    frame = Math.floor(mouseX * (frameCount - 1));

    // 🫧 Breathing offset
    const driftX = Math.sin(t * 0.8) * 12;
    const driftY = Math.cos(t * 0.6) * 8;

    drawImage({
      alpha: 0.45,
      x: driftX,
      y: driftY
    });

    requestAnimationFrame(loop);
  }

  loop();
}
function profileAnimation() {
  function loop() {
    t += 0.002;
    frame = Math.floor(
      (Math.sin(t) * 0.5 + 0.5) * (frameCount - 1)
    );

    drawImage({
      alpha: 0.18
    });

    requestAnimationFrame(loop);
  }
  loop();
}


const canvasMap = {
  home: "mainCanvas",
  universe: "mainCanvas",
  characters: "mainCanvas",
  experience: "mainCanvas",
  labs: "mainCanvas",
  marketplace: "mainCanvas",
  community: "communityCanvas",
  about: "mainCanvas",
  profile: "mainCanvas" // ✅ ADD
};
/* ================= PAGE MOODS ================= */
const PAGE_MOODS = {
  home:        { alpha: 0.35, speed: 1.0, shake: 0 },
  universe:    { alpha: 0.28, speed: 0.6, shake: 2 },
  characters:  { alpha: 0.45, speed: 1.2, shake: 1 },
  experience:  { alpha: 0.6,  speed: 1.6, shake: 4 },
  labs:        { alpha: 0.4,  speed: 1.8, shake: 6 },
  marketplace: { alpha: 0.25, speed: 0.8, shake: 0 },
  community:   { alpha: 0.3,  speed: 1.0, shake: 1 },
  about:       { alpha: 0.22, speed: 0.5, shake: 0 }
};

const mood = PAGE_MOODS[page] || PAGE_MOODS.home;


const animationMap = {
  home: homeAnimation,
  universe: universeAnimation,
  characters: charactersAnimation,
  community: communityAnimation,
  about: aboutAnimation,
  marketplace: marketplaceAnimation,
  labs: labsAnimation,
  experience: experienceAnimation,
  profile: aboutAnimation // ✅ calm identity presence
};

function animatePageTitle() {
  const title = document.querySelector(".page.hero .text h1");
  const paragraph = document.querySelector(".page.hero .text p");

  if (!title) return;

  // Animate title
  title.style.opacity = 0;
  title.style.transform = "translateY(40px)";

  setTimeout(() => {
    title.style.transition = "all 1.2s ease-out";
    title.style.opacity = 1;
    title.style.transform = "translateY(0)";
  }, 300);

  // Animate paragraph
  if (paragraph) {
    paragraph.style.opacity = 0;
    paragraph.style.transform = "translateY(20px)";

    setTimeout(() => {
      paragraph.style.transition = "all 1s ease-out";
      paragraph.style.opacity = 1;
      paragraph.style.transform = "translateY(0)";
    }, 700);
  }
}
function setupPageTransitions() {
  const overlay = document.getElementById("page-transition");
  const links = document.querySelectorAll("a[href]");

  links.forEach(link => {
    const url = link.getAttribute("href");

    // Ignore external links
    if (url.startsWith("http") || url.startsWith("#")) return;

    link.addEventListener("click", e => {
      e.preventDefault();

      overlay.classList.add("active");

      setTimeout(() => {
        window.location.href = url;
      }, 700);
    });
  });

  // Fade in on page load
  window.addEventListener("load", () => {
    overlay.classList.remove("active");
  });
}



const canvasId = canvasMap[page];
const animationFn = animationMap[page];

if (canvasId && animationFn) {
  if (setupCanvas(canvasId)) {
    loadImages(() => {
      animationFn();
      animatePageTitle();
      setupPageTransitions();
    });
  }
}
document.addEventListener("DOMContentLoaded", () => {

  const logoutBtn = document.getElementById("logoutBtn");
  const logoutOverlay = document.getElementById("logoutOverlay");
  const cancelLogout = document.getElementById("cancelLogout");
  const confirmLogout = document.getElementById("confirmLogout");

  if (!logoutBtn || !logoutOverlay) {
    console.warn("Logout elements missing");
    return;
  }

  logoutBtn.addEventListener("click", e => {
    e.preventDefault();
    logoutOverlay.classList.add("active");
  });

  cancelLogout.addEventListener("click", () => {
    logoutOverlay.classList.remove("active");
  });
});
(function initUserIdentity() {
  const user = JSON.parse(localStorage.getItem("cyberfiction_user"));
  if (!user) return;

  const nameEl = document.getElementById("username");
  const avatarEl = document.getElementById("userAvatar");

  if (nameEl) nameEl.textContent = user.username || "Anonymous";
  if (avatarEl) avatarEl.src = user.avatar || "assets/avatars/default.png";
})();
/* ================= IDENTITY LAYER ENGINE ================= */
(function identityLayer() {
  const layer = document.getElementById("identity-layer");
  if (!layer) return;

  const nameEl = document.getElementById("identityName");
  const modeEl = document.getElementById("identityMode");
  const timeEl = document.getElementById("identityTime");

  const raw = localStorage.getItem("cyberfiction_user");
  if (!raw) return;

  let user;
  try {
    user = JSON.parse(raw);
  } catch {
    return;
  }

  // ---- NAME ----
  const name = user.username || "OBSERVER";
  nameEl.textContent = name;
  nameEl.setAttribute("data-text", name);

  // ---- MODE ----
  modeEl.textContent = (user.mode || "UNKNOWN").toUpperCase();

  // ---- TIME ----
  const start = user.time || Date.now();

  function updateTime() {
    const diff = Math.floor((Date.now() - start) / 1000);
    const m = String(Math.floor(diff / 60)).padStart(2, "0");
    const s = String(diff % 60).padStart(2, "0");
    timeEl.textContent = `${m}:${s}`;
  }
  updateTime();
  setInterval(updateTime, 1000);

  // ---- INTERACTION ----
  layer.addEventListener("mouseenter", () => {
    layer.classList.add("active");
  });

  layer.addEventListener("mouseleave", () => {
    layer.classList.remove("active");
  });

  // ---- KEY TOGGLE (I) ----
  window.addEventListener("keydown", e => {
    if (e.key.toLowerCase() === "i") {
      layer.classList.toggle("active");
    }
    if (e.key === "Escape") {
      layer.classList.remove("active");
    }
  });
})();
/* ================= IDENTITY INIT (SAFE) ================= */
(function initIdentityUI() {
  const raw = localStorage.getItem("cyberfiction_user");
  if (!raw) return;

  let user;
  try {
    user = JSON.parse(raw);
  } catch {
    return;
  }

  const nameEl = document.getElementById("identityName");
  const modeEl = document.getElementById("identityMode");

  if (nameEl) {
    const name = (user.username || "OBSERVER").toUpperCase();
    nameEl.textContent = name;
    nameEl.setAttribute("data-text", name); // 🔥 REQUIRED FOR GLITCH
  }

  if (modeEl) {
    modeEl.textContent = (user.mode || "LOGIN").toUpperCase();
  }
})();
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutOverlay = document.getElementById("logoutOverlay");
  const cancelLogout = document.getElementById("cancelLogout");
  const confirmLogout = document.getElementById("confirmLogout");

  if (!logoutBtn || !logoutOverlay) return;

  logoutBtn.addEventListener("click", e => {
    e.preventDefault();
    logoutOverlay.classList.add("active");
  });

  cancelLogout.addEventListener("click", () => {
    logoutOverlay.classList.remove("active");
  });

  confirmLogout.addEventListener("click", () => {
    // ✅ CLEAR SESSION
    localStorage.removeItem("cyberfiction_user");
    sessionStorage.clear();

    document.body.style.transition = "opacity 0.8s ease";
    document.body.style.opacity = 0;

    setTimeout(() => {
      window.location.href = "/auth/login.html"; // ✅ ABSOLUTE
    }, 800);
  });
});






