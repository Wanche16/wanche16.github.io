/* ==========================================================
   Undangan Pernikahan — Anke & Iwan
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- 1. Nama tamu dari URL (?to=Nama+Tamu) ---------- */
  const params = new URLSearchParams(window.location.search);
  const guest = params.get("to");
  if (guest) {
    document.getElementById("guestName").textContent =
      decodeURIComponent(guest.replace(/\+/g, " "));
  }

  /* ---------- 2. Buka undangan ---------- */
  const cover = document.getElementById("cover");
  const main = document.getElementById("mainContent");
  const openBtn = document.getElementById("openBtn");

  document.body.classList.add("locked");

  openBtn.addEventListener("click", () => {
    cover.classList.add("is-open");
    document.body.classList.remove("locked");
    main.setAttribute("aria-hidden", "false");
    // paksa cek elemen reveal yang sudah terlihat
    revealCheck();
    // mulai musik — klik tombol ini adalah "user gesture" yang
    // disyaratkan browser sebelum audio boleh diputar
    startMusic();
  });

  /* ---------- 2b. Musik latar ---------- */
  const music = document.getElementById("bgMusic");
  const musicToggle = document.getElementById("musicToggle");

  function setMusicUI(playing) {
    musicToggle.classList.toggle("is-playing", playing);
    musicToggle.setAttribute(
      "aria-label",
      playing ? "Jeda musik" : "Putar musik"
    );
  }

  function startMusic() {
    music.volume = 0.7;
    music
      .play()
      .then(() => setMusicUI(true))
      .catch(() => setMusicUI(false)); // jika browser tetap memblokir
    musicToggle.hidden = false;
  }

  musicToggle.addEventListener("click", () => {
    if (music.paused) {
      music.play().then(() => setMusicUI(true)).catch(() => {});
    } else {
      music.pause();
      setMusicUI(false);
    }
  });

  // jeda otomatis saat tab tidak aktif, lanjut saat kembali
  document.addEventListener("visibilitychange", () => {
    if (musicToggle.hidden) return;
    if (document.hidden) {
      if (!music.paused) {
        music.pause();
        music.dataset.resume = "1";
      }
    } else if (music.dataset.resume === "1") {
      delete music.dataset.resume;
      music.play().then(() => setMusicUI(true)).catch(() => {});
    }
  });

  /* ---------- 3. Langit berbintang ---------- */
  const STAR_COUNT = 60;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < STAR_COUNT; i++) {
    const s = document.createElement("span");
    s.className = "star";
    const size = Math.random() * 2 + 1;
    s.style.width = s.style.height = size + "px";
    s.style.left = Math.random() * 100 + "vw";
    s.style.top = Math.random() * 100 + "vh";
    s.style.animationDelay = Math.random() * 4 + "s";
    s.style.animationDuration = 3 + Math.random() * 4 + "s";
    frag.appendChild(s);
  }
  document.body.appendChild(frag);

  /* ---------- 4. Countdown (Akad: 8 Agustus 2026, 11.00 WIB) ---------- */
  const target = new Date("2026-08-08T11:00:00+07:00").getTime();
  const el = {
    d: document.getElementById("cdDays"),
    h: document.getElementById("cdHours"),
    m: document.getElementById("cdMins"),
    s: document.getElementById("cdSecs"),
  };

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      document.getElementById("countdown").innerHTML =
        '<p class="lead">Alhamdulillah, hari bahagia telah tiba \u2728</p>';
      clearInterval(timer);
      return;
    }
    el.d.textContent = Math.floor(diff / 86400000);
    el.h.textContent = Math.floor((diff % 86400000) / 3600000);
    el.m.textContent = Math.floor((diff % 3600000) / 60000);
    el.s.textContent = Math.floor((diff % 60000) / 1000);
  }
  tick();
  const timer = setInterval(tick, 1000);

  /* ---------- 5. Reveal saat scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  reveals.forEach((r) => io.observe(r));

  function revealCheck() {
    reveals.forEach((r) => {
      const rect = r.getBoundingClientRect();
      if (rect.top < window.innerHeight) r.classList.add("is-visible");
    });
  }

  /* ---------- 6. Salin alamat ---------- */
  const copyBtn = document.getElementById("copyAddressBtn");
  const ADDRESS =
    "Kedai Waka Waka, Jl. Prof. drg. Surya Sumantri No.5C, Sukawarna, Kec. Sukajadi, Kota Bandung";

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(ADDRESS);
      copyBtn.textContent = "Alamat Tersalin \u2713";
    } catch {
      copyBtn.textContent = "Gagal menyalin";
    }
    setTimeout(() => (copyBtn.textContent = "Salin Alamat"), 2500);
  });

  /* ---------- 7. Salin nomor rekening (Tanda Kasih) ---------- */
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    const original = btn.textContent.trim();
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = "Tersalin \u2713";
      } catch {
        btn.textContent = "Gagal menyalin";
      }
      setTimeout(() => (btn.textContent = original), 2500);
    });
  });

  /* ---------- 8. Ucapan & konfirmasi kehadiran ----------
     CATATAN: daftar ucapan ini hanya tersimpan di memori browser
     pengunjung (hilang saat halaman di-refresh). Untuk menyimpan
     ucapan dari semua tamu, sambungkan fungsi submitWish() ke
     backend/API (mis. Google Apps Script, Firebase, atau Supabase). */
  const wishes = [];
  const wishList = document.getElementById("wishList");
  const wishHint = document.getElementById("wishHint");

  function renderWishes() {
    wishList.innerHTML = wishes
      .map(
        (w) => `
        <li>
          <span class="who">${escapeHtml(w.name)}</span>
          <span class="status">${escapeHtml(w.attend)}</span>
          <p class="msg">${escapeHtml(w.message)}</p>
        </li>`
      )
      .join("");
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  document.getElementById("wishSubmit").addEventListener("click", () => {
    const name = document.getElementById("wishName").value.trim();
    const attend = document.getElementById("wishAttend").value;
    const message = document.getElementById("wishMessage").value.trim();

    if (!name || !message) {
      wishHint.textContent = "Mohon isi nama dan ucapan terlebih dahulu.";
      return;
    }

    wishes.unshift({ name, attend, message });
    renderWishes();

    document.getElementById("wishName").value = "";
    document.getElementById("wishMessage").value = "";
    wishHint.textContent = "Terima kasih, ucapan Anda telah terkirim \u2728";
    setTimeout(() => (wishHint.textContent = ""), 3000);
  });
});
