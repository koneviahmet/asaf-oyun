export function printClassReport({ stats, topicAggregates, entries }) {
  const html = `<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8"><title>Duyu Labirenti Raporu</title>
<style>
  body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
  h1 { color: #3d2b4f; border-bottom: 2px solid #f5a623; padding-bottom: 8px; }
  h2 { color: #e94560; font-size: 16px; margin-top: 24px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 13px; }
  th { background: #f5f5f5; }
  .stat { display: inline-block; margin-right: 24px; }
  .stat strong { font-size: 24px; color: #4ecca3; }
  @media print { button { display: none; } }
</style></head><body>
  <h1>Duyu Labirenti — Sınıf Raporu</h1>
  <p>Tarih: ${new Date().toLocaleDateString('tr-TR')}</p>
  <div style="margin: 16px 0">
    <span class="stat"><strong>${stats.totalGames}</strong><br>Oyun</span>
    <span class="stat"><strong>${stats.avgScore}</strong><br>Ort. Skor</span>
    <span class="stat"><strong>${stats.topScore}</strong><br>En Yüksek</span>
  </div>
  <h2>Sıralama</h2>
  <table>
    <tr><th>#</th><th>Ad</th><th>Skor</th><th>Seviye</th><th>Başarı</th></tr>
    ${entries.map((e, i) => `<tr><td>${i + 1}</td><td>${e.name}</td><td>${e.score}</td><td>${e.level}</td><td>${e.stats?.accuracy != null ? e.stats.accuracy + '%' : '-'}</td></tr>`).join('')}
  </table>
  ${topicAggregates.length ? `<h2>Konu Performansı</h2><table>
    <tr><th>Konu</th><th>Doğru</th><th>Yanlış</th><th>Başarı</th></tr>
    ${topicAggregates.map((t) => `<tr><td>${t.topic}</td><td>${t.correct}</td><td>${t.wrong}</td><td>${t.accuracy}%</td></tr>`).join('')}
  </table>` : ''}
  <br><button onclick="window.print()">Yazdır</button>
</body></html>`

  const w = window.open('', '_blank')
  w.document.write(html)
  w.document.close()
}
