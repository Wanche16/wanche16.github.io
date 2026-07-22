/* ==========================================================
   Undangan Pernikahan — Keana & Wanche
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ============================================================
     KONFIGURASI BACKEND (Google Apps Script)
     Ikuti langkah di file apps-script.gs, lalu tempel
     "Web app URL" hasil deploy di sini. Selama masih kosong,
     undangan berjalan dalam mode offline: ucapan hanya tampil
     di browser pengirim dan kunjungan tidak tercatat.
     ============================================================ */
  const API_URL = "https://script.google.com/macros/s/AKfycbyQSinOHX_f0dUxoS_a33l6JQAGqxk2cLlTbZ24ZWmiuoiy7WuwJ17NXsEKNMVAaF6icQ/exec"; // contoh: "https://script.google.com/macros/s/XXXX/exec"

  /* ---------- 1. Nama tamu dari URL (?to=Nama+Tamu) ---------- */
  const params = new URLSearchParams(window.location.search);
  const guest = params.get("to");
  if (guest) {
    document.getElementById("guestName").textContent =
      decodeURIComponent(guest.replace(/\+/g, " "));
  }

  /* ---------- 2. Halaman langsung terbuka (tanpa tombol) ---------- */
  // catat kunjungan begitu halaman dimuat
  logVisit();

  function logVisit() {
    if (!API_URL) return;
    // body dikirim tanpa header khusus agar tidak memicu CORS preflight
    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "visit",
        guest: guest ? decodeURIComponent(guest.replace(/\+/g, " ")) : "",
        device: navigator.userAgent.slice(0, 120),
      }),
    }).catch(() => {}); // gagal mencatat tidak boleh mengganggu tamu
  }

  /* ---------- 2b. Musik latar ----------
     Browser memblokir autoplay audio tanpa interaksi pengguna.
     Karena tombol "Buka Undangan" sudah dihapus, musik dicoba
     diputar pada interaksi pertama tamu (sentuh/scroll/klik),
     dan tombol musik langsung terlihat sejak awal. */
  const music = document.getElementById("bgMusic");
  const musicToggle = document.getElementById("musicToggle");
  musicToggle.hidden = false;

  function setMusicUI(playing) {
    musicToggle.classList.toggle("is-playing", playing);
    musicToggle.setAttribute(
      "aria-label",
      playing ? "Jeda musik" : "Putar musik"
    );
  }

  // hanya event ini yang dihitung browser sebagai "user activation"
  // (scroll/wheel TIDAK dihitung, jadi tidak dipakai)
  const gestureEvents = ["pointerdown", "keydown", "touchend"];

  function tryAutoplay(e) {
    // abaikan gesture pada tombol musik sendiri agar tidak
    // bentrok dengan handler klik putar/jeda di bawah
    if (e && e.target && musicToggle.contains(e.target)) return;
    music.volume = 0.4;
    music
      .play()
      .then(() => {
        setMusicUI(true);
        stopAutoplayAttempts(); // berhasil — berhenti mencoba
      })
      .catch(() => {}); // gagal — biarkan, akan dicoba di gesture berikutnya
  }

  function stopAutoplayAttempts() {
    gestureEvents.forEach((ev) => window.removeEventListener(ev, tryAutoplay));
  }

  gestureEvents.forEach((ev) =>
    window.addEventListener(ev, tryAutoplay, { passive: true })
  );

  musicToggle.addEventListener("click", () => {
    if (music.paused) {
      music.play().then(() => setMusicUI(true)).catch(() => {});
    } else {
      music.pause();
      setMusicUI(false);
      // tamu memilih jeda — jangan nyalakan lagi lewat autoplay
      stopAutoplayAttempts();
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
     Jika API_URL terisi: ucapan dikirim & dimuat dari Google Sheets,
     sehingga semua tamu bisa saling melihat.
     Jika API_URL kosong: mode offline — ucapan hanya tampil di
     browser pengirim dan hilang saat halaman di-refresh. */
  let wishes = [];
  const wishList = document.getElementById("wishList");
  const wishHint = document.getElementById("wishHint");
  const wishSubmitBtn = document.getElementById("wishSubmit");

  function renderWishes() {
    wishList.innerHTML = wishes
      .map(
        (w) => `
        <li>
          <span class="who">${escapeHtml(String(w.name || ""))}</span>
          <span class="status">${escapeHtml(String(w.attend || ""))}</span>
          <p class="msg">${escapeHtml(String(w.message || ""))}</p>
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

  // muat ucapan yang sudah ada dari spreadsheet
  async function loadWishes() {
    if (!API_URL) return;
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        wishes = data;
        renderWishes();
      }
    } catch {
      /* biarkan kosong bila gagal; tidak mengganggu tamu */
    }
  }
  loadWishes();

  wishSubmitBtn.addEventListener("click", async () => {
    const name = document.getElementById("wishName").value.trim();
    const attend = document.getElementById("wishAttend").value;
    const message = document.getElementById("wishMessage").value.trim();

    if (!name || !message) {
      wishHint.textContent = "Mohon isi nama dan ucapan terlebih dahulu.";
      return;
    }

    // kirim ke spreadsheet bila backend terpasang
    if (API_URL) {
      wishSubmitBtn.disabled = true;
      wishHint.textContent = "Mengirim...";
      try {
        await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify({ action: "wish", name, attend, message }),
        });
      } catch {
        /* tetap tampilkan secara lokal walau pengiriman gagal */
      }
      wishSubmitBtn.disabled = false;
    }

    wishes.unshift({ name, attend, message });
    renderWishes();

    document.getElementById("wishName").value = "";
    document.getElementById("wishMessage").value = "";
    wishHint.textContent = "Terima kasih, ucapan Anda telah terkirim \u2728";
    setTimeout(() => (wishHint.textContent = ""), 3000);
  });
});
