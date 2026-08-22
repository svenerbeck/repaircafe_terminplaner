/**
 * Vorschau am eigenen Rechner:  node vorschau.js
 *
 * Stellt die Google-Dienste nach, damit die Seiten ohne Google erzeugt werden
 * können. Legt HTML-Dateien im Ordner "vorschau" an, die man im Browser öffnen
 * kann. Bei Google wird dabei nichts verändert.
 */
const fs = require('fs');

const daten = {
  Einstellungen: [
    ['Was','Wert'],
    ['Titel','Repair Café Bad Beispiel'],
    ['Termin','Samstag, 12. September, 14 bis 17 Uhr'],
    ['Ort','Gemeindehaus, Hauptstraße 5'],
    ['Hinweis','Bitte bis Donnerstag antworten.'],
    ['Anmeldung offen','Ja'],
    ['Übersicht anzeigen','Ja']
  ],
  Teilnehmer: [
    ['Name','Kommt?','Kuchen','Zuletzt geändert'],
    ['Erika Mustermann','Ja','Apfelkuchen','2026-08-20 10:12'],
    ['Hans <b>Beispiel</b>','Nein','',''],
    ['Ingrid Muster','','',''],
    ['Karl-Heinz Schmidt-Wollersheim','Ja','Marmorkuchen & Streusel','2026-08-21 09:00'],
    ['Gerda Vogel','','',''],
    ['Änne Öttinger','Ja','Zopf',''],
    ['Zora Wyss','','',''],
    ['Beat Steiner','Nein','',''],
    ['Ueli Ammann','Ja','Nusstorte',''],
    ['Béatrice Aeschbacher','','',''],
    ['Otto Zbinden','','','']
  ],
  Protokoll: [['Zeitpunkt','Termin','Name','Antwort','Kuchen']]
};

function blattAttrappe(name) {
  const rows = daten[name];
  return {
    getLastRow: () => rows.length,
    getRange: (r, c, nr, nc) => ({
      getDisplayValues: () => {
        const out = [];
        for (let i = 0; i < (nr || 1); i++) {
          const zeile = rows[r - 1 + i] || [];
          const teil = [];
          for (let j = 0; j < (nc || 1); j++) teil.push(zeile[c - 1 + j] === undefined ? '' : String(zeile[c - 1 + j]));
          out.push(teil);
        }
        return out;
      },
      setValue: (v) => { while (rows.length < r) rows.push([]); rows[r-1][c-1] = v; }
    }),
    appendRow: (z) => rows.push(z)
  };
}

global.SpreadsheetApp = { flush: () => {}, getActiveSpreadsheet: () => ({ getSheetByName: (n) => daten[n] ? blattAttrappe(n) : null }) };
global.ScriptApp = { getService: () => ({ getUrl: () => 'https://script.google.com/macros/s/BEISPIEL/exec' }) };
global.LockService = { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) };
global.HtmlService = {
  XFrameOptionsMode: { ALLOWALL: 1 },
  createHtmlOutput: (h) => ({ html: h, setTitle() { return this; }, addMetaTag() { return this; }, setXFrameOptionsMode() { return this; } })
};

const quelle = fs.readFileSync(__dirname + '/Code.gs', 'utf8');
eval(quelle);

const raus = process.argv[2] || (__dirname + '/vorschau');
if (!fs.existsSync(raus)) fs.mkdirSync(raus, { recursive: true });
fs.writeFileSync(raus + '/1-liste.html',  doGet({ parameter: {} }).html);
fs.writeFileSync(raus + '/2-person.html', doGet({ parameter: { name: 'Ingrid Muster' } }).html);
fs.writeFileSync(raus + '/3-person-schon-geantwortet.html', doGet({ parameter: { name: 'Erika Mustermann' } }).html);
fs.writeFileSync(raus + '/4-danke.html',  doPost({ parameter: { name: 'Gerda Vogel', ja: 'JA, ich komme', kuchen: 'Zwetschgenkuchen' } }).html);
fs.writeFileSync(raus + '/5-absage.html', doPost({ parameter: { name: 'Ingrid Muster', nein: 'Nein' } }).html);
fs.writeFileSync(raus + '/7-kuchen-nachgetragen.html', doPost({ parameter: { name: 'Gerda Vogel', kuchenspeichern: 'x', kuchen: 'Käsekuchen' } }).html);
fs.writeFileSync(raus + '/6-unbekannt.html', doGet({ parameter: { name: 'Fremder Mensch' } }).html);

console.log('--- Teilnehmerblatt nach den beiden Eingaben ---');
console.log(daten.Teilnehmer.map(r => r.join(' | ')).join('\n'));
console.log('\n--- Protokoll (Sicherheitsnetz) ---');
console.log(daten.Protokoll.map(r => r.join(' | ')).join('\n'));
console.log('\n--- XSS-Prüfung: taucht rohes <b> in der Liste auf? ---');
console.log(/Hans <b>/.test(fs.readFileSync(raus + '/1-liste.html','utf8')) ? 'FEHLER: ungeschützt' : 'OK: sauber maskiert');
