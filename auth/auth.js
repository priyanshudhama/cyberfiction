/* ================= API CONFIG ================= */
const API_BASE = "http://localhost:5000/api/auth";


/* ================= CANVAS BOY ================= */
const canvas = document.getElementById("bgCanvas");

if (canvas) {
  const ctx = canvas.getContext("2d");
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  const img = new Image();
  img.src = "../assets/images/male0001.png";
  let t = 0;

  img.onload = () => {
    function loop() {
      t += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scale = 1.15 + Math.sin(t) * 0.02;
      const w = img.width * scale;
      const h = img.height * scale;

      ctx.globalAlpha = 0.18;
      ctx.drawImage(
        img,
        canvas.width / 2 - w / 2,
        canvas.height / 2 - h / 2,
        w,
        h
      );

      requestAnimationFrame(loop);
    }
    loop();
  };

  window.addEventListener("resize", () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  });
}

/* ================= SUCCESS HANDLER ================= */
function authSuccess(user, mode) {
  const userData = {
    ...user,
    mode,
    loggedIn: true,
    time: Date.now()
  };

  // ✅ SINGLE SOURCE OF TRUTH
  localStorage.setItem("cyberfiction_user", JSON.stringify(userData));

  // intro should play once
  sessionStorage.setItem("playIntro", "true");

  document.body.style.transition = "opacity 0.8s ease";
  document.body.style.opacity = 0;

  setTimeout(() => {
    window.location.href = "intro.html";
  }, 800);
}

/* ================= LOGIN ================= */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Login failed");

      authSuccess(data.user, "login");
    } catch {
      alert("Server not reachable");
    }
  });
}

/* ================= SIGNUP ================= */
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async e => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Signup failed");

      authSuccess(data.user, "signup");
    } catch {
      alert("Server not reachable");
    }
  });
}

/* ================= PASSWORD TOGGLE ================= */
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {
    const input = document.getElementById(icon.dataset.target);
    if (!input) return;

    input.type = input.type === "password" ? "text" : "password";
    icon.textContent = input.type === "password" ? "👁" : "🙈";
  });
});
