import fs from 'fs';

const filePath = process.argv[2] || '/tmp/lighthouse_freshroots_mobile.report.json';
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

console.log('==============================================');
console.log(`LIGHTHOUSE AUDIT: ${data.finalUrl || data.requestedUrl}`);
console.log(`Fetched at: ${data.fetchTime}`);
console.log('==============================================');

console.log('\n--- OVERALL CATEGORY SCORES ---');
for (const [catId, cat] of Object.entries(data.categories || {})) {
  const scorePercent = Math.round((cat.score || 0) * 100);
  console.log(`${cat.title}: ${scorePercent}/100`);
}

console.log('\n--- CORE WEB VITALS & TIMINGS ---');
const metrics = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index',
  'interactive'
];
for (const m of metrics) {
  const audit = data.audits[m];
  if (audit) {
    console.log(`${audit.title}: ${audit.displayValue || audit.numericValue} (score: ${Math.round((audit.score || 0) * 100)})`);
  }
}

console.log('\n--- FAILED OR WARNING AUDITS (< 100) ---');
const failedByCat = {};
for (const [catKey, catObj] of Object.entries(data.categories || {})) {
  for (const auditRef of catObj.auditRefs || []) {
    const audit = data.audits[auditRef.id];
    if (audit && typeof audit.score === 'number' && audit.score < 0.95 && audit.scoreDisplayMode !== 'notApplicable') {
      if (!failedByCat[catObj.title]) failedByCat[catObj.title] = [];
      failedByCat[catObj.title].push({
        id: auditRef.id,
        title: audit.title,
        score: Math.round(audit.score * 100),
        displayValue: audit.displayValue || '',
        description: audit.description,
        details: audit.details?.items?.slice(0, 3) || []
      });
    }
  }
}

for (const [catName, audits] of Object.entries(failedByCat)) {
  console.log(`\n[${catName}]`);
  for (const a of audits) {
    console.log(`  - [${a.score}%] ${a.title} (${a.id}): ${a.displayValue}`);
    if (a.details && a.details.length > 0) {
      console.log(`    Items:`, JSON.stringify(a.details));
    }
  }
}
