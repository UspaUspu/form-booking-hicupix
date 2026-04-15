// ── Booking Modal ────────────────────────────────────
const overlay   = document.getElementById('bookingOverlay');
const container = document.querySelector('.container');
const btnOpen   = document.getElementById('btnBookNow');
const btnClose  = document.getElementById('modalClose');

// ── Gallery Modal ────────────────────────────────────
const galleryOverlay = document.getElementById('galleryOverlay');
const btnGallery     = document.getElementById('btnGallery');
const galleryClose   = document.getElementById('galleryClose');

btnGallery.addEventListener('click', (e) => {
  e.preventDefault();
  galleryOverlay.classList.add('active');
  container.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
});

galleryClose.addEventListener('click', () => {
  galleryOverlay.classList.remove('active');
  container.classList.remove('modal-open');
  document.body.style.overflow = '';
});

galleryOverlay.addEventListener('click', (e) => {
  if (e.target === galleryOverlay) {
    galleryOverlay.classList.remove('active');
    container.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
});

// ── Lightbox ─────────────────────────────────────────
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.gallery-grid img').forEach(img => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightbox.classList.add('active');
  });
});

lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.classList.remove('active');
});

function openModal() {
  overlay.classList.add('active');
  container.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  overlay.classList.remove('active');
  container.classList.remove('modal-open');
  document.body.style.overflow = '';
}

btnOpen.addEventListener('click', (e) => {
  e.preventDefault();
  openModal();
});

btnClose.addEventListener('click', closeModal);

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    galleryOverlay.classList.remove('active');
    lightbox.classList.remove('active');
    container.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
});

// ── Submit Form ──────────────────────────────────────────
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn  = e.target.querySelector('.btn-book-modal');
  const nama       = document.getElementById('nama').value.trim();
  const tanggal    = document.getElementById('tanggal').value;
  const jamMulai   = document.getElementById('jamMulai').value;
  const jamSelesai = document.getElementById('jamSelesai').value;
  const paket      = document.querySelector('input[name="paket"]:checked')?.value ?? '-';
  const lokasi     = document.getElementById('lokasi').value.trim();

  const pesan =
    `*BOOKING HICUPIX PHOTOBOOTH* 📸\n\n` +
    `👤 Nama / Acara : ${nama}\n` +
    `📅 Tanggal      : ${tanggal}\n` +
    `🕐 Jam Mulai    : ${jamMulai}\n` +
    `🕔 Jam Selesai  : ${jamSelesai}\n` +
    `📦 Paket        : ${paket}\n` +
    `📍 Lokasi       : ${lokasi}`;

  const waUrl = `https://wa.me/6285927420172?text=${encodeURIComponent(pesan)}`;

  // Deteksi environment: localhost pakai server, selain itu langsung WA
  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

  if (!isLocalhost) {
    // GitHub Pages / static hosting:
    // window.open HARUS dipanggil di sini (synchronous, sebelum await apapun)
    // agar tidak diblok popup blocker browser
    window.location.href = waUrl;
    showToast('✅ Membuka WhatsApp...', 'success');
    e.target.reset();
    setTimeout(closeModal, 1000);
    return;
  }

  // ── Localhost: kirim via server Node.js ──
  submitBtn.disabled    = true;
  submitBtn.textContent = 'Mengirim...';

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    const res  = await fetch('/api/booking', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ nama, tanggal, jamMulai, jamSelesai, paket, lokasi }),
      signal:  controller.signal
    });
    clearTimeout(timer);

    const data = await res.json();
    if (data.success) {
      showToast('✅ Booking berhasil dikirim ke Hicupix!', 'success');
      e.target.reset();
      setTimeout(closeModal, 1800);
    } else {
      showToast('❌ ' + (data.message || 'Gagal mengirim.'), 'error');
    }
  } catch {
    // Server gagal → fallback WA (di catch masih boleh redirect)
    window.location.href = waUrl;
    e.target.reset();
    setTimeout(closeModal, 1000);
  } finally {
    submitBtn.disabled    = false;
    submitBtn.textContent = 'BOOK NOW';
  }
});

// ── Toast Notification ───────────────────────────────────
function showToast(msg, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('toast-show'));
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
