# Duyu Labirenti

4. sınıf fen bilimleri **Duyu Organlarımız** konusu için Vue 3, Tailwind CSS ve Phaser 3 ile geliştirilmiş pixel art labirent oyunu.

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` adresini açın.

## Oynanış

1. **BAŞLAT** butonuna basın ve giriş sorusunu doğru cevaplayın.
2. **WASD** veya **ok tuşları** ile labirentte hareket edin (mobilde sol alttaki yön tuşları).
3. **Soru kartlarından** geçerek canavarları yenin (doğru cevap = 1 canavar ölür).
4. **Canavar sizi yakalarsa** soruyu bilin; bilmezseniz oyun biter.
5. Tüm canavarları yenince bir sonraki seviyeye geçin.
6. En yüksek skor tarayıcıda saklanır.
7. **Ses** açma/kapama: ana menü veya oyun içi HUD'dan.
8. **ESC** veya **P** ile duraklat, sağ üstteki minimap ile konumunu takip et.

## Özellikler

- Prosedürel labirent üretimi (her seviyede farklı)
- 4 canavar + BFS yapay zeka
- 30 adet 4. sınıf duyu organları sorusu
- 8-bit ses efektleri ve arka plan müziği
- Mobil dokunmatik kontrol (sanal D-pad)
- Skor ve rekor kaydı (`localStorage`)
- Yürüme animasyonları (oyuncu + canavarlar)
- Minimap (oyuncu, canavarlar, soru kartları)
- Duraklatma menüsü ve ilk açılış tutorial'ı
- Sınıf sıralaması (isim + skor, en iyi 10)
- Öğretmen paneli (şifre: `2024`) — istatistikler ve sıfırlama
- 45 adet duyu organları sorusu
- Konu filtresi ve zorluk seçimi (Kolay / Normal / Zor)
- Öğretmen sınıf ayarı ve CSV rapor indirme
- Oturum istatistikleri ve konu bazlı performans analizi
- PWA desteği (tablete ana ekrana ekle) ve tam ekran modu
- Pratik Mod (10 soru) ve Zaman Yarışı (3 dakika)
- 9 başarı rozeti sistemi
- Labirent güçlendirmeleri (kalkan, hız) ve günlük görev
- 60 soruluk genişletilmiş soru bankası

## Build

```bash
npm run build
npm run preview
```

## Teknolojiler

- Vue 3 + Vite
- Tailwind CSS
- Phaser 3
