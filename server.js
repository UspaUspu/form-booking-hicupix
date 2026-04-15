const express = require('express');
const axios   = require('axios');
const path    = require('path');

const app  = express();
const PORT = 3000;

// ── Konfigurasi ──────────────────────────────────────
const WA_NUMBER       = '6285927420172';
const CALLMEBOT_APIKEY = 'GANTI_DENGAN_API_KEY_KAMU';
// Cara dapat API key (GRATIS):
// 1. Simpan nomor +34 644 59 21 83 di kontak HP
// 2. Kirim pesan WA: "I allow callmebot to send me messages"
// 3. Balasan berisi API key → tempel di atas
// ─────────────────────────────────────────────────────

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/booking', async (req, res) => {
  const { nama, tanggal, jamMulai, jamSelesai, paket, lokasi } = req.body;

  if (!nama || !tanggal || !jamMulai || !jamSelesai || !lokasi) {
    return res.status(400).json({ success: false, message: 'Data tidak lengkap.' });
  }

  const pesan =
    `*BOOKING HICUPIX PHOTOBOOTH* 📸\n\n` +
    `👤 Nama / Acara : ${nama}\n` +
    `📅 Tanggal      : ${tanggal}\n` +
    `🕐 Jam Mulai    : ${jamMulai}\n` +
    `🕔 Jam Selesai  : ${jamSelesai}\n` +
    `📦 Paket        : ${paket}\n` +
    `📍 Lokasi       : ${lokasi}\n\n` +
    `_Dikirim otomatis dari website Hicupix_`;

  try {
    await axios.get('https://api.callmebot.com/whatsapp.php', {
      params: {
        phone:  WA_NUMBER,
        text:   pesan,
        apikey: CALLMEBOT_APIKEY
      },
      timeout: 10000
    });

    res.json({ success: true, message: 'Booking berhasil dikirim!' });
  } catch (err) {
    console.error('Gagal kirim WA:', err.message);
    res.status(500).json({ success: false, message: 'Gagal mengirim, coba lagi.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅  Server Hicupix berjalan → http://localhost:${PORT}`);
});
