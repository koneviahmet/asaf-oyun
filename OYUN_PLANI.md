# Duyu Organları Labirent Oyunu — Geliştirme Planı

> **Hedef kitle:** 4. sınıf fen bilimleri — Duyu Organlarımız konusu  
> **Teknolojiler:** Vue 3, Tailwind CSS, Phaser 3  
> **Görsel stil:** Pixel art

---

## Oyun Özeti

Oyuncu, duyu organları sorularını çözerek labirentte hayatta kalır. Labirentte 4 canavar oyuncuyu kovalar; soru kartlarından geçerek canavarları yok edebilir veya canavar yakalanınca soru çözerek hayatta kalabilir. Tüm canavarlar öldürülünce bir sonraki seviyeye geçilir. En yüksek skor `localStorage`'a kaydedilir.

---

## Faz Durumu

| Faz | Başlık | Durum |
|-----|--------|-------|
| 0 | Proje kurulumu | ✅ Tamamlandı |
| 1 | Başlangıç ekranı ve giriş sorusu | ✅ Tamamlandı |
| 2 | Labirent üretim sistemi | ✅ Tamamlandı |
| 3 | Oyuncu, kamera ve hareket | ✅ Tamamlandı |
| 4 | Canavarlar ve yapay zeka | ✅ Tamamlandı |
| 5 | Soru kartları ve soru modali | ✅ Tamamlandı |
| 6 | Çarpışma, yakalama ve canavar yeniden doğma | ✅ Tamamlandı |
| 7 | Seviye geçişi ve zorluk artışı | ✅ Tamamlandı |
| 8 | Skor sistemi ve localStorage | ✅ Tamamlandı |
| 9 | Pixel art görseller ve ses | ✅ Tamamlandı |
| 10 | Test, dengeleme ve son rötuşlar | ✅ Tamamlandı |
| 11 | Ek özellikler (animasyon, minimap, tutorial) | ✅ Tamamlandı |
| 12 | Sınıf modu ve öğretmen paneli | ✅ Tamamlandı |
| 13 | Konu seçimi, zorluk, CSV rapor | ✅ Tamamlandı |
| 14 | Oturum istatistikleri, PWA, tam ekran | ✅ Tamamlandı |
| 15 | Pratik mod, zaman yarışı, rozetler | ✅ Tamamlandı |
| 16 | Güçlendirmeler, günlük görev, 60 soru | ✅ Tamamlandı |

> Tamamlanan fazların `⬜ Bekliyor` işaretini `✅ Tamamlandı` olarak güncelleyeceğiz.

---

## Faz 0 — Proje Kurulumu

**Amaç:** Vue + Tailwind + Phaser altyapısını hazırlamak.

### Yapılacaklar
- [x] Vite ile Vue 3 projesi oluştur
- [x] Tailwind CSS kur ve yapılandır
- [x] Phaser 3 bağımlılığını ekle
- [x] `PhaserGame.vue` bileşeni: Phaser canvas'ını Vue içinde mount et
- [ ] Klasör yapısı:
  ```
  src/
    components/     # Vue UI (modal, başlangıç ekranı)
    game/
      scenes/       # Phaser sahneleri
      entities/     # Oyuncu, canavar, soru kartı
      systems/      # Labirent, çarpışma, skor
      data/         # Soru bankası, seviye ayarları
    assets/
      sprites/      # Pixel art görseller
      tilemaps/     # Labirent karoları
  ```
- [x] Geliştirme sunucusunun çalıştığını doğrula

### Kabul kriterleri
- Boş bir Phaser sahnesi Vue sayfasında görünür
- Tailwind sınıfları çalışır

---

## Faz 1 — Başlangıç Ekranı ve Giriş Sorusu

**Amaç:** Oyuna girerken "Başlat" butonu ve doğru cevaplanırsa oyuna geçiş.

### Yapılacaklar
- [ ] Tam ekran başlangıç ekranı (pixel art arka plan + logo/başlık)
- [ ] "Başlat" butonu (Tailwind ile stil)
- [ ] Butona basınca duyu organları sorusu göster (Vue modal)
- [ ] Doğru cevap → `GameScene`'e geç
- [ ] Yanlış cevap → tekrar dene mesajı, oyun başlamaz
- [ ] Soru bankasından rastgele 1 soru seç

### Kabul kriterleri
- Başlat → soru → doğru cevap → labirent yüklenir
- Yanlış cevapta oyun başlamaz

---

## Faz 2 — Labirent Üretim Sistemi

**Amaç:** Her seviyede farklı zorlukta, prosedürel labirent oluşturmak.

### Yapılacaklar
- [ ] Recursive Backtracker veya benzeri algoritma ile labirent üret
- [ ] Giriş/çıkış kapısı **olmasın** (tamamen kapalı labirent)
- [ ] Oyuncu ve canavarlar için rastgele boş hücrede spawn noktası
- [ ] Seviye bazlı parametreler:
  | Seviye | Genişlik × Yükseklik | Duvar yoğunluğu |
  |--------|----------------------|-----------------|
  | 1      | 15 × 15              | Düşük           |
  | 2      | 20 × 20              | Orta            |
  | 3      | 25 × 25              | Yüksek          |
  | 4+     | Artan boyut          | Artan karmaşıklık |
- [ ] Pixel art duvar ve zemin karoları (tilemap)
- [ ] Kamera oyuncuyu takip etsin

### Kabul kriterleri
- Her oyun başlangıcında farklı labirent
- Oyuncu geçerli bir boş hücrede doğar
- Duvarlara çarpılamaz

---

## Faz 3 — Oyuncu, Kamera ve Hareket

**Amaç:** Pixel art karakterin labirentte akıcı hareketi.

### Yapılacaklar
- [ ] Oyuncu sprite (pixel art, 16×16 veya 32×32)
- [ ] Ok tuşları / WASD ile hareket
- [ ] Duvar çarpışma kontrolü (grid veya fizik tabanlı)
- [ ] Yürüme animasyonu (4 yön)
- [ ] Kamera sınırları labirent içinde kalsın

### Kabul kriterleri
- Oyuncu akıcı hareket eder, duvarlardan geçemez
- Kamera oyuncuyu merkezde tutar

---

## Faz 4 — Canavarlar ve Yapay Zeka

**Amaç:** 4 canavarın oyuncuyu kovalaması.

### Yapılacaklar
- [ ] 4 adet canavar sprite (farklı renkler/tipler)
- [ ] Labirentte rastgele boş hücrelerde spawn
- [ ] A* veya BFS pathfinding ile oyuncuya en kısa yoldan gitme
- [ ] Canavar hızı oyuncudan biraz düşük (adil oyun)
- [ ] Canavarlar birbirine ve duvarlara çarpmasın
- [ ] Yürüme animasyonu

### Kabul kriterleri
- 4 canavar aktif olarak oyuncuyu kovalar
- Labirent duvarlarına takılırlar, geçemezler

---
## Faz 5 — Soru Kartları ve Soru Modali

**Amaç:** Labirentte soru kartları; üzerinden geçince soru sorulsun.

### Yapılacaklar - [ ] Labirente rastgele N adet soru kartı yerleştir (seviyeye göre 3–6)
- [ ] Soru kartı sprite (parlayan/animasyonlu pixel art)
- [ ] Oyuncu kartın üzerinden geçince:
  - Oyun duraklatılır
  - Vue modal ile duyu organları sorusu gösterilir
  - **Doğru cevap:** Rastgele 1 canavar öldürülür (sprite gizlenir, AI durur)
  - **Yanlış cevap:** Ekstra 1 canavar spawn edilir
- [ ] Aynı kart tekrar sorulmasın (kullanıldıktan sonra kaldır)

### Soru bankası konuları (4. sınıf — Duyu Organlarımız)
- Göz ve görme
- Kulak ve işitme
- Burun ve koku alma
- Dil ve tat alma
- Deri ve dokunma
- Duyu organlarının görevleri
- Duyu organlarını koruma

### Kabul kriterleri
- Kartlardan geçince soru çıkar
- Doğru → 1 canavar ölür; yanlış → +1 canavar

---

## Faz 6 — Çarpışma, Yakalama ve Canavar Yeniden Doğma

**Amaç:** Canavar yakalarsa soru; bilinmezse oyun biter.

### Yapılacaklar
- [ ] Oyuncu–canavar çarpışma algılama
- [ ] Yakalanınca:
  - Oyun duraklatılır
  - Duyu organları sorusu sorulur
  - **Doğru cevap:** Yakalayan canavar başka rastgele noktada yeniden doğar, kovalamaya devam
  - **Yanlış cevap:** Oyun biter → "Oyun Bitti" ekranı
- [ ] Ölü canavarlar tekrar spawn olmaz (sadece soru kartıyla öldürülenler)

### Kabul kriterleri
- Yakalanma → soru → doğru = canavar yeniden doğar
- Yakalanma → soru → yanlış = game over

---

## Faz 7 — Seviye Geçişi ve Zorluk Artışı

**Amaç:** Tüm canavarlar öldürülünce sonraki seviyeye geçiş.

### Yapılacaklar
- [ ] Canavar sayacı: başlangıç 4, yanlış cevaplarla artabilir
- [ ] Tüm canavarlar ölünce:
  - "Seviye Tamamlandı!" ekranı
  - Skor güncelle (seviye × 100 + kalan canavar cezası vb.)
  - Sonraki seviyeye geç (daha büyük/karmaşık labirent)
- [ ] Seviye sonsuz döngü: 4. seviyeden sonra zorluk artmaya devam
- [ ] Her yeni seviyede canavar sayısı sıfırlanır (4'e döner) veya artan zorlukla 4+ başlar

### Kabul kriterleri
- 4 canavar öldürülünce yeni labirent yüklenir
- Labirent boyutu ve karmaşıklığı seviye ile artar

---

## Faz 8 — Skor Sistemi ve localStorage

**Amaç:** En yüksek skoru kalıcı olarak saklamak.

### Yapılacaklar
- [ ] Skor hesaplama:
  - Doğru cevap: +50 puan
  - Canavar öldürme: +100 puan
  - Seviye tamamlama: +500 puan
  - Yakalanıp doğru cevap: +25 puan
- [ ] Anlık skor HUD (Phaser veya Vue overlay)
- [ ] `localStorage.setItem('duyuLabirentHighScore', skor)`
- [ ] Başlangıç ekranında en yüksek skor göster
- [ ] Game over ekranında skor ve rekor karşılaştırması

### Kabul kriterleri
- Skor oyun içinde görünür
- Tarayıcı kapatılıp açılsa bile rekor korunur

---

## Faz 9 — Pixel Art Görseller ve Ses

**Amaç:** Oyunun görsel ve işitsel cilası.

### Yapılacaklar
- [ ] Oyuncu karakteri sprite sheet (4 yön animasyon)
- [ ] 4 farklı canavar sprite
- [ ] Duvar ve zemin tileset (16×16 pixel)
- [ ] Soru kartı sprite (parlama animasyonu)
- [ ] UI pixel font veya retro font
- [ ] Arka plan müziği (opsiyonel, kısa loop)
- [ ] Ses efektleri: adım, yakalama, doğru/yanlış cevap, seviye geçişi
- [ ] Başlangıç ve game over ekranı pixel art arka planları

### Kabul kriterleri
- Tüm görseller tutarlı pixel art stilinde
- Animasyonlar akıcı (8–12 FPS sprite animasyon)

---

## Faz 10 — Test, Dengeleme ve Son Rötuşlar

**Amaç:** Oyunun sınıfta kullanıma hazır olması.

### Yapılacaklar
- [ ] En az 30 duyu organları sorusu (çoktan seçmeli, 4 şık)
- [ ] Canavar hızı ve sayısı dengelemesi
- [ ] Mobil/tablet dokunmatik kontrol (opsiyonel)
- [ ] Türkçe arayüz metinleri kontrolü
- [ ] Performans testi (büyük labirentlerde 60 FPS)
- [ ] README: kurulum ve çalıştırma talimatları
- [ ] Production build (`npm run build`)

### Kabul kriterleri
- Oyun baştan sona kesintisiz oynanabilir
- 4. sınıf öğrencisi soruları anlayabilir
- Build hatasız alınır

---

## Teknik Notlar

### Vue ↔ Phaser İletişimi
- Phaser `EventBus` (mitt veya custom) ile Vue modal'ları tetikle
- Soru cevabı Vue'dan Phaser'a geri dönsün
- Oyun duraklatma: `scene.scene.pause()` / `resume()`

### Labirent Algoritması
```
1. Tüm hücreleri duvar yap
2. Rastgele başlangıç hücresi seç, ziyaret et
3. Komşu duvar hücrelerine recursive backtracker uygula
4. Sonuç: mükemmel labirent (tek yol, döngü yok)
5. İsteğe bağlı: bazı duvarları kaldırarak döngü ekle (daha karmaşık)
```

### Dosya Yapısı (Hedef)
```
oyun-asaf/
├── OYUN_PLANI.md          ← bu dosya
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
├── public/
│   └── assets/
│       ├── sprites/
│       └── audio/
└── src/
    ├── main.js
    ├── App.vue
    ├── components/
    │   ├── StartScreen.vue
    │   ├── QuestionModal.vue
    │   └── GameOverScreen.vue
    ├── game/
    │   ├── PhaserGame.vue
    │   ├── EventBus.js
    │   ├── scenes/
    │   │   ├── BootScene.js
    │   │   ├── GameScene.js
    │   │   └── UIScene.js
    │   ├── entities/
    │   │   ├── Player.js
    │   │   ├── Monster.js
    │   │   └── QuestionCard.js
    │   ├── systems/
    │   │   ├── MazeGenerator.js
    │   │   ├── Pathfinding.js
    │   │   └── ScoreManager.js
    │   └── data/
    │       ├── questions.js
    │       └── levels.js
    └── style.css
```

---

## İlerleme Günlüğü

| Tarih | Faz | Not |
|-------|-----|-----|
| 10 Haz 2026 | — | Plan oluşturuldu |
| 10 Haz 2026 | 0–8 | Tüm temel fazlar tamamlandı |
| 10 Haz 2026 | 9–10 | Pixel art görseller eklendi; ses efektleri bekliyor |
| 10 Haz 2026 | 9 | 8-bit ses efektleri, arka plan müziği, ses aç/kapa |
| 10 Haz 2026 | 10 | Mobil dokunmatik kontrol, dengeleme, hata düzeltmeleri |
| 10 Haz 2026 | 11 | Yürüme animasyonları, minimap, duraklatma menüsü, tutorial |
| 10 Haz 2026 | 12 | Sınıf sıralaması, öğretmen paneli, 45 soru |
| 10 Haz 2026 | 13 | Konu filtresi, zorluk seviyesi, CSV dışa aktarma |
| 10 Haz 2026 | 14 | Soru performansı, konu analizi, PWA, tam ekran |
| 10 Haz 2026 | 15 | Pratik mod, zaman yarışı, başarı rozetleri |
| 10 Haz 2026 | 16 | Güçlendirmeler, günlük görev, yazdırma raporu |
| 10 Haz 2026 | 17 | Sis perdesi, boss seviyeleri, ses ayarı, Firebase Hosting |

---

## Faz 17 — Sis Perdesi, Boss ve Dağıtım

**Amaç:** Labirentte keşif hissi, zorlu boss seviyeleri ve canlıya alma.

### Yapılacaklar
- [x] Sis perdesi (fog of war) — keşfedilen alanlar kalıcı açılır
- [x] Boss seviyeleri (5, 10, 15…) — 2 HP, hızlı, bonus skor
- [x] Boss Avcısı rozeti
- [x] Ses seviyesi kaydırıcısı (menü + duraklatma)
- [x] Kontrol yardım ekranı (H / ? tuşu)
- [x] Firebase Hosting yapılandırması (`npm run deploy`)

---

## Faz 16 — Güçlendirmeler ve Günlük Görev

**Amaç:** Labirent oynanışını zenginleştirmek ve günlük motivasyon.

### Yapılacaklar
- [x] Kalkan güçlendirmesi — 1 kez canavar yakalamasından korur
- [x] Hız güçlendirmesi — 8 saniye hızlı hareket
- [x] Günlük görev — her gün farklı 2 konu + bonus skor
- [x] Soru bankası 45 → 60 soru
- [x] Öğretmen yazdır/PDF raporu
- [x] Seviye tamamlama ekranında performans özeti

---

## Faz 15 — Pratik Mod, Zaman Yarışı ve Rozetler

**Amaç:** Labirent dışında hızlı çalışma ve motivasyon.

### Yapılacaklar
- [x] Pratik Mod — 10 soruluk quiz (labirent yok)
- [x] Zaman Yarışı — 3 dakikada en çok doğru cevap
- [x] 8 başarı rozeti (localStorage)
- [x] Rozetler ekranı
- [x] Phaser lazy loading (daha hızlı menü)

---

## Faz 14 — Oturum İstatistikleri ve PWA

**Amaç:** Öğrenme analitiği ve sınıf tableti desteği.

### Yapılacaklar
- [x] Oturum boyunca doğru/yanlış takibi
- [x] Konu bazlı performans (zayıf konular)
- [x] Oyun sonu performans özeti
- [x] HUD'da anlık doğru/yanlış sayacı
- [x] Öğretmen paneli — sınıf konu performans grafiği
- [x] Oturum geçmişi CSV dışa aktarma
- [x] PWA manifest (ana ekrana ekle)
- [x] Tam ekran modu

---

## Faz 13 — Konu Seçimi ve Raporlama

**Amaç:** Hedefli çalışma ve öğretmen raporu.

### Yapılacaklar
- [x] Konu filtresi — istenen duyu organı konularını seç
- [x] Zorluk seviyesi — Kolay / Normal / Zor
- [x] Öğretmen sınıf ayarı — tüm öğrenciler için konu ve zorluk kilitleme
- [x] CSV sıralama raporu indirme (Excel uyumlu)

---

## Faz 12 — Sınıf Modu ve Öğretmen Paneli

**Amaç:** Sınıfta kullanım için isimli skor tablosu ve öğretmen yönetimi.

### Yapılacaklar
- [x] Oyuncu adı girişi (başlamadan önce zorunlu)
- [x] Sınıf sıralaması — en iyi 10 skor (`localStorage`)
- [x] Oyun bitince sıralamaya kayıt ve sıra gösterimi
- [x] Öğretmen paneli (şifre: `2024`) — istatistikler, soru bankası özeti
- [x] Sıralamayı sıfırlama (öğretmen panelinden)
- [x] Soru bankası 30 → 45 soruya genişletildi

---

## Faz 11 — Ek Özellikler

**Amaç:** Oyun deneyimini zenginleştirmek.

### Yapılacaklar
- [x] Oyuncu ve canavar yürüme animasyonları (sprite sheet, 8 FPS)
- [x] Minimap (sağ üst köşe — oyuncu, canavarlar, soru kartları)
- [x] Duraklatma menüsü (ESC / P / HUD butonu)
- [x] İlk açılış tutorial ekranı
- [x] Pixel art animasyonlu arka plan (ana menü)

---

*Oyun tamamlandı. `npm run dev` ile oynanabilir. Canlıya almak için `.firebaserc.example` dosyasını `.firebaserc` olarak kopyalayıp `npm run deploy` çalıştırın.*
