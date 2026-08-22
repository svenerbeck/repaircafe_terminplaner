/**
 * Repair Café – Terminanmeldung
 * ------------------------------------------------------------------
 * Eine Google-Tabelle + eine Web-App.
 *
 * Für die Teilnehmer:  ein Link, Namen antippen, JA oder NEIN, Kuchen eintragen. Fertig.
 * Für Eva:             eine ganz normale Tabelle, die nur sie sehen und bearbeiten kann.
 *
 * Wichtig: Die Teilnehmer bekommen die Tabelle NIE zu sehen. Sie können
 * dadurch auch nichts löschen, verschieben oder kaputt machen.
 * Zusätzlich wird jede einzelne Eingabe unveränderbar im Blatt "Protokoll"
 * mitgeschrieben – damit ist niemals etwas unwiederbringlich weg.
 *
 * Einrichtung: siehe ANLEITUNG.md
 */

var BLATT_TEILNEHMER  = 'Teilnehmer';
var BLATT_EINSTELLUNG = 'Einstellungen';
var BLATT_PROTOKOLL   = 'Protokoll';

var SPALTE_NAME    = 1;
var SPALTE_ANTWORT = 2;
var SPALTE_KUCHEN  = 3;
var SPALTE_ZEIT    = 4;

// Steht in der Namensliste vor dem Kuchen. Bewusst ein Emoji: es ist farbig und
// auf einen Blick erkennbar. Fällt es auf einem sehr alten Gerät aus, steht der
// Kuchenname als Text daneben – die Information geht also nie verloren.
var KUCHEN_ZEICHEN = '\uD83C\uDF70';


/* ==================================================================
   1. WEB-APP: Was die Teilnehmer im Handy sehen
   ================================================================== */

function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  try {
    if (p.name) return seiteAusgeben_(seitePerson_(p.name, p.geaendert === '1'));
    return seiteAusgeben_(seiteNamensliste_());
  } catch (fehler) {
    return seiteAusgeben_(seiteFehler_(fehler));
  }
}

function doPost(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  try {
    var name   = String(p.name || '').trim();
    var kuchen = String(p.kuchen || '').trim().substring(0, 120);

    // Schritt 2: nur der Kuchen wird nachgetragen, die Zusage bleibt bestehen.
    if (p.kuchenspeichern) {
      var vorher = teilnehmerFinden_(name);
      if (!vorher) return seiteAusgeben_(seiteFehler_('Name nicht in der Liste.'));
      var k = antwortSpeichern_(name, vorher.antwort || 'Ja', kuchen);
      if (!k.ok) return seiteAusgeben_(seiteFehler_(k.fehler));
      return seiteAusgeben_(seiteDanke_(name, vorher.antwort || 'Ja', kuchen, true));
    }

    // Schritt 1: die eigentliche Zu- oder Absage.
    var antwort = p.ja ? 'Ja' : (p.nein ? 'Nein' : '');
    if (!antwort) return seiteAusgeben_(seitePerson_(name, false));

    var bisher   = teilnehmerFinden_(name);
    var ergebnis = antwortSpeichern_(name, antwort, bisher ? bisher.kuchen : '');
    if (!ergebnis.ok) return seiteAusgeben_(seiteFehler_(ergebnis.fehler));

    return seiteAusgeben_(seiteDanke_(name, antwort, bisher ? bisher.kuchen : '', false));
  } catch (fehler) {
    return seiteAusgeben_(seiteFehler_(fehler));
  }
}

function seiteAusgeben_(html) {
  return HtmlService.createHtmlOutput(html)
    .setTitle('Repair Café – Anmeldung')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}


/* ==================================================================
   2. SEITEN
   ================================================================== */

/** Startseite: die Liste mit allen Namen. */
function seiteNamensliste_() {
  var cfg  = einstellungen_();
  var alle = teilnehmer_();

  var h = kopf_(cfg);

  if (!cfg.offen) {
    h += '<div class="box hinweis"><p><b>Die Anmeldung ist gerade geschlossen.</b></p>'
       + '<p>Bitte wende dich an das Repair-Café-Team.</p></div>';
    return h + fuss_();
  }

  h += '<p class="anleitung">Tippe unten auf <b>deinen Namen</b>.</p>';

  // Alphabetisch, damit jeder weiss, wo er suchen muss – unabhängig davon,
  // in welcher Reihenfolge die Namen in der Tabelle stehen.
  alle.sort(function (a, b) { return a.name.localeCompare(b.name, 'de'); });

  // Wer nicht scrollt, findet sich nicht. Bei längeren Listen deshalb ansagen,
  // dass unten noch etwas kommt.
  if (alle.length > 8) {
    h += '<p class="wisch">Alle <b>' + alle.length + ' Namen</b> stehen untereinander &ndash; '
       + 'wisch nach unten, bis du deinen siehst.</p>';
  }

  h += '<div class="liste">';

  if (!alle.length) {
    h += '<div class="box hinweis"><p>Es sind noch keine Namen eingetragen.</p></div>';
  }

  for (var i = 0; i < alle.length; i++) {
    var t = alle[i];
    var zustand = t.antwort === 'Ja'   ? { klasse: 'ja',    text: '&#10003; kommt' }
                : t.antwort === 'Nein' ? { klasse: 'nein',  text: 'kann nicht' }
                :                        { klasse: 'offen', text: 'noch offen' };

    h += '<a class="zeile ' + zustand.klasse + '" href="' + appUrl_() + '?name=' + encodeURIComponent(t.name) + '">'
       +   '<span class="zname">' + esc_(t.name) + '</span>'
       +   '<span class="zstatus">' + zustand.text + '</span>'
       +   (t.kuchen ? '<span class="zkuchen">' + KUCHEN_ZEICHEN + ' ' + esc_(t.kuchen) + '</span>' : '')
       + '</a>';
  }
  h += '</div>';

  if (alle.length > 8) h += '<p class="ende">&mdash; Ende der Liste &mdash;</p>';

  if (cfg.uebersicht) h += uebersichtBlock_(alle);

  return h + fuss_();
}

/** Persönliche Seite: nur eine einzige Frage – komme ich oder nicht? */
function seitePerson_(name, warAenderung) {
  var cfg = einstellungen_();
  var t   = teilnehmerFinden_(name);

  if (!t) {
    return kopf_(cfg)
      + '<div class="box hinweis"><p><b>Diesen Namen gibt es nicht in der Liste.</b></p>'
      + '<p>Bitte tippe unten auf &bdquo;Zur&uuml;ck zur Namensliste&ldquo; und suche dich dort.</p></div>'
      + zurueckKnopf_() + fuss_();
  }

  var h = kopf_(cfg);

  h += '<div class="box person">';
  h += '<p class="klein">Hallo</p>';
  h += '<h2 class="grossername">' + esc_(t.name) + '</h2>';
  // Der Ausweg für alle, die sich vertippt haben – direkt unter dem Namen,
  // damit man ihn im selben Blick hat wie den Fehler.
  h += '<a class="binnicht" href="' + appUrl_() + '">Ich bin nicht '
     + esc_(t.name) + ' &rarr; zur&uuml;ck zur Liste</a>';
  if (!warAenderung && t.antwort) {
    h += '<p class="bisher">Bisher eingetragen: <b>'
       + (t.antwort === 'Ja' ? 'Ich komme' : 'Ich kann nicht')
       + '</b>' + (t.kuchen ? ' &middot; Kuchen: <b>' + esc_(t.kuchen) + '</b>' : '') + '</p>';
    h += '<p class="klein">Du kannst deine Antwort hier jederzeit &auml;ndern.</p>';
  }
  h += '</div>';

  h += '<form method="post" target="_top" action="' + appUrl_() + '">';
  h += '<input type="hidden" name="name" value="' + esc_(t.name) + '">';
  h += '<div class="box frage">';
  h += '<p class="fragetext">Kommst du zum Termin?</p>';
  h += '<input class="knopf knopfja"   type="submit" name="ja"   value="JA, ich komme">';
  h += '<input class="knopf knopfnein" type="submit" name="nein" value="Nein, ich kann nicht">';
  h += '</div>';
  h += '</form>';

  return h + zurueckKnopf_() + fuss_();
}

/**
 * Bestätigung. Bei einer Zusage kommt hier – und erst hier – die Kuchenfrage.
 * So steht auf jedem Bildschirm nur eine einzige Entscheidung.
 */
function seiteDanke_(name, antwort, kuchen, kuchenGeradeGespeichert) {
  var cfg = einstellungen_();
  var h = kopf_(cfg);

  h += '<div class="box danke ' + (antwort === 'Ja' ? 'dankeja' : 'dankenein') + '">';
  h += '<p class="haken">' + (antwort === 'Ja' ? '&#10003;' : '&#10005;') + '</p>';
  h += '<h2 class="grossername">' + esc_(name) + '</h2>';
  h += '<p class="dankesatz">' + (antwort === 'Ja'
        ? 'Du bist angemeldet. Wir freuen uns!'
        : 'Deine Absage ist gespeichert. Schade &ndash; bis zum n&auml;chsten Mal!') + '</p>';
  if (antwort === 'Ja' && kuchen) {
    h += '<p class="dankekuchen">Kuchen: <b>' + esc_(kuchen) + '</b></p>';
  }
  h += '</div>';

  if (antwort === 'Ja') {
    h += '<form method="post" target="_top" action="' + appUrl_() + '">';
    h += '<input type="hidden" name="name" value="' + esc_(name) + '">';
    h += '<div class="box kuchen">';
    h += '<label for="kuchen" class="fragetext">' +
         (kuchen ? 'Kuchen &auml;ndern?' : 'Bringst du einen Kuchen mit?') + '</label>';
    h += '<p class="klein">' + (kuchenGeradeGespeichert
          ? 'Ist notiert. Du kannst es hier jederzeit wieder &auml;ndern.'
          : 'Nur wenn du magst &ndash; sonst einfach nichts eintragen, es ist schon alles gespeichert.') + '</p>';
    h += '<input class="feld" type="text" id="kuchen" name="kuchen" value="' + esc_(kuchen) + '" placeholder="z.B. Apfelkuchen">';
    h += '<input class="knopf knopfkuchen" type="submit" name="kuchenspeichern" value="Kuchen eintragen">';
    h += '</div>';
    h += '</form>';
  }

  h += '<a class="knopf knopfgrau" href="' + appUrl_() + '?name=' + encodeURIComponent(name) + '&geaendert=1">Antwort noch einmal &auml;ndern</a>';
  h += zurueckKnopf_();

  return h + fuss_();
}

function seiteFehler_(fehler) {
  return kopf_({ titel: 'Repair Café', termin: '', ort: '', hinweis: '', offen: true, uebersicht: false })
    + '<div class="box hinweis"><p><b>Da ist leider etwas schiefgegangen.</b></p>'
    + '<p>Bitte probiere es gleich noch einmal oder melde dich beim Repair-Café-Team.</p>'
    + '<p class="klein">' + esc_(String(fehler)) + '</p></div>'
    + zurueckKnopf_() + fuss_();
}


/* ==================================================================
   3. BAUSTEINE DER SEITEN
   ================================================================== */

function kopf_(cfg) {
  return '<!DOCTYPE html><html lang="de"><head>'
    + '<meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<meta name="robots" content="noindex, nofollow">'
    + '<base target="_top">'
    + '<title>' + esc_(cfg.titel) + '</title>'
    + '<style>' + css_() + '</style>'
    + '</head><body><div class="seite">'
    + '<div class="kopf">'
    +   '<h1>' + esc_(cfg.titel) + '</h1>'
    +   (cfg.termin  ? '<p class="termin">' + esc_(cfg.termin) + '</p>' : '')
    +   (cfg.ort     ? '<p class="ort">' + esc_(cfg.ort) + '</p>' : '')
    +   (cfg.hinweis ? '<p class="hinweis-text">' + esc_(cfg.hinweis) + '</p>' : '')
    + '</div>';
}

function fuss_() {
  return '</div></body></html>';
}

function zurueckKnopf_() {
  return '<a class="knopf knopfgrau" href="' + appUrl_() + '">&#8592; Zur&uuml;ck zur Namensliste</a>';
}

function uebersichtBlock_(alle) {
  var kommen = [], kuchen = [];
  for (var i = 0; i < alle.length; i++) {
    if (alle[i].antwort === 'Ja') {
      kommen.push(alle[i].name);
      if (alle[i].kuchen) kuchen.push(KUCHEN_ZEICHEN + ' ' + alle[i].name + ': ' + alle[i].kuchen);
    }
  }
  var h = '<div class="box uebersicht">';
  h += '<h3>Wer kommt</h3>';
  h += '<p class="zahl">' + kommen.length + (kommen.length === 1 ? ' Person' : ' Personen') + '</p>';
  h += kommen.length ? '<p>' + esc_(kommen.join(', ')) + '</p>' : '<p class="klein">Noch niemand angemeldet.</p>';
  h += '<h3>Kuchen</h3>';
  if (kuchen.length) {
    h += '<ul>';
    for (var k = 0; k < kuchen.length; k++) h += '<li>' + esc_(kuchen[k]) + '</li>';
    h += '</ul>';
  } else {
    h += '<p class="klein">Noch kein Kuchen eingetragen.</p>';
  }
  h += '</div>';
  return h;
}


/* ==================================================================
   4. DATEN LESEN UND SCHREIBEN
   ================================================================== */

function tabelle_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function blatt_(name) {
  var b = tabelle_().getSheetByName(name);
  if (!b) throw new Error('Das Tabellenblatt "' + name + '" fehlt. Bitte im Menü "Repair Café" auf "Einrichten" klicken.');
  return b;
}

function einstellungen_() {
  var cfg = { titel: 'Repair Café', termin: '', ort: '', hinweis: '', offen: true, uebersicht: true };
  var b = tabelle_().getSheetByName(BLATT_EINSTELLUNG);
  if (!b) return cfg;

  var werte = b.getRange(1, 1, Math.max(b.getLastRow(), 1), 2).getDisplayValues();
  for (var i = 0; i < werte.length; i++) {
    var schluessel = String(werte[i][0] || '').trim().toLowerCase();
    var wert = String(werte[i][1] || '').trim();
    if (schluessel === 'titel')                cfg.titel   = wert || cfg.titel;
    if (schluessel === 'termin')               cfg.termin  = wert;
    if (schluessel === 'ort')                  cfg.ort     = wert;
    if (schluessel === 'hinweis')              cfg.hinweis = wert;
    if (schluessel === 'anmeldung offen')      cfg.offen      = /^(ja|j|yes|wahr|true|x)$/i.test(wert);
    if (schluessel === 'übersicht anzeigen' ||
        schluessel === 'uebersicht anzeigen')  cfg.uebersicht = /^(ja|j|yes|wahr|true|x)$/i.test(wert);
  }
  return cfg;
}

function teilnehmer_() {
  var b = blatt_(BLATT_TEILNEHMER);
  var letzte = b.getLastRow();
  if (letzte < 2) return [];

  var werte = b.getRange(2, 1, letzte - 1, 4).getDisplayValues();
  var liste = [];
  for (var i = 0; i < werte.length; i++) {
    var name = String(werte[i][0] || '').trim();
    if (!name) continue;
    liste.push({
      zeile:   i + 2,
      name:    name,
      antwort: String(werte[i][1] || '').trim(),
      kuchen:  String(werte[i][2] || '').trim()
    });
  }
  return liste;
}

function teilnehmerFinden_(name) {
  var gesucht = String(name || '').trim().toLowerCase();
  var alle = teilnehmer_();
  for (var i = 0; i < alle.length; i++) {
    if (alle[i].name.toLowerCase() === gesucht) return alle[i];
  }
  return null;
}

/**
 * Speichert eine Antwort. Der Name muss in der Liste stehen –
 * dadurch kann niemand fremde Einträge erfinden.
 */
function antwortSpeichern_(name, antwort, kuchen) {
  var sperre = LockService.getScriptLock();
  try {
    sperre.waitLock(20000);
  } catch (e) {
    return { ok: false, fehler: 'Gerade trägt sich jemand anderes ein. Bitte einen Moment warten und noch einmal tippen.' };
  }

  try {
    var t = teilnehmerFinden_(name);
    if (!t) return { ok: false, fehler: 'Name nicht in der Liste.' };

    var b   = blatt_(BLATT_TEILNEHMER);
    var jetzt = new Date();

    b.getRange(t.zeile, SPALTE_ANTWORT).setValue(antwort);
    b.getRange(t.zeile, SPALTE_KUCHEN).setValue(antwort === 'Ja' ? kuchen : '');
    b.getRange(t.zeile, SPALTE_ZEIT).setValue(jetzt);

    protokollieren_(jetzt, t.name, antwort, kuchen);
    SpreadsheetApp.flush();
    return { ok: true };
  } finally {
    sperre.releaseLock();
  }
}

/** Unveränderbares Protokoll: hier wird nur angehängt, nie überschrieben. */
function protokollieren_(zeit, name, antwort, kuchen) {
  var b = tabelle_().getSheetByName(BLATT_PROTOKOLL);
  if (!b) return;
  var cfg = einstellungen_();
  b.appendRow([zeit, cfg.termin, name, antwort, kuchen]);
}


/* ==================================================================
   5. HILFSFUNKTIONEN
   ================================================================== */

function appUrl_() {
  return ScriptApp.getService().getUrl();
}

function esc_(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Bewusst schlichtes CSS: keine Variablen, kein Flexbox-Zwang, keine
 * Schriftarten aus dem Netz. Läuft auch auf alten Android- und iPhone-Browsern.
 */
function css_() {
  return [
    '*{-webkit-box-sizing:border-box;box-sizing:border-box}',
    'body{margin:0;padding:0;background:#eef1f4;color:#1a1a1a;',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;',
      'font-size:20px;line-height:1.5;-webkit-text-size-adjust:100%}',
    '.seite{max-width:560px;margin:0 auto;padding:16px 14px 60px}',

    '.kopf{text-align:center;padding:10px 4px 18px}',
    '.kopf h1{margin:0 0 6px;font-size:28px;line-height:1.25}',
    '.termin{margin:0 0 4px;font-size:22px;font-weight:bold;color:#144d8c}',
    '.ort{margin:0;font-size:18px;color:#4a5560}',
    '.hinweis-text{margin:10px 0 0;font-size:18px;color:#4a5560}',

    '.anleitung{margin:0 0 10px;font-size:21px;text-align:center}',
    '.wisch{margin:0 0 16px;font-size:17px;text-align:center;color:#4a5560;',
      'background:#fffdf5;border:2px solid #e2c98a;border-radius:10px;padding:10px 12px}',
    '.ende{margin:-4px 0 20px;font-size:16px;text-align:center;color:#7a838c}',

    '.box{background:#fff;border:2px solid #d3dae1;border-radius:10px;',
      'padding:18px;margin:0 0 16px}',

    '.liste{margin:0 0 20px}',
    '.zeile{display:block;background:#fff;border:2px solid #cfd7de;border-radius:10px;',
      'padding:20px 16px;margin:0 0 18px;text-decoration:none;color:#1a1a1a;overflow:hidden}',
    '.zname{font-size:24px;font-weight:bold;float:left;max-width:60%}',
    '.zstatus{font-size:17px;float:right;padding-top:5px;text-align:right}',
    '.zeile.ja{border-color:#2e7d4f;background:#f1f9f4}',
    '.zeile.ja .zstatus{color:#1d6b3f;font-weight:bold}',
    '.zeile.nein{background:#f4f6f8}',
    '.zeile.nein .zstatus{color:#6b7681}',
    '.zkuchen{clear:both;display:block;padding-top:8px;font-size:17px;color:#4a5560}',
    '.zeile.offen{border-color:#c98a12}',
    '.zeile.offen .zstatus{color:#a06c00;font-weight:bold}',

    '.person{text-align:center;background:#fffdf5;border-color:#c98a12}',
    '.grossername{margin:2px 0 8px;font-size:32px;line-height:1.2}',
    '.binnicht{display:inline-block;margin:2px 0 4px;padding:8px 4px;font-size:17px;color:#144d8c}',
    '.bisher{margin:8px 0 4px;font-size:19px}',
    '.klein{margin:6px 0 0;font-size:16px;color:#5b6670}',

    '.frage{text-align:center}',
    '.fragetext{display:block;margin:0 0 14px;font-size:23px;font-weight:bold}',

    '.knopf{display:block;width:100%;padding:22px 12px;margin:0 0 14px;',
      'font-size:24px;font-weight:bold;text-align:center;text-decoration:none;',
      'border-radius:10px;border:2px solid transparent;cursor:pointer;',
      '-webkit-appearance:none;appearance:none;font-family:inherit}',
    '.knopfja{background:#1d7a45;border-color:#155c34;color:#fff}',
    '.knopfnein{background:#fff;border-color:#9aa5ae;color:#333}',
    '.knopfkuchen{background:#144d8c;border-color:#0e3a6b;color:#fff;font-size:21px;margin-top:14px}',
    '.knopfgrau{background:#e6eaee;border-color:#c3ccd4;color:#28323b;font-size:20px;padding:16px 12px}',

    '.kuchen .feld{display:block;width:100%;padding:16px 12px;margin:12px 0 0;',
      'font-size:22px;border:2px solid #9aa5ae;border-radius:10px;background:#fff;',
      'color:#1a1a1a;font-family:inherit;-webkit-appearance:none;appearance:none}',

    '.danke{text-align:center}',
    '.dankeja{border-color:#2e7d4f;background:#f1f9f4}',
    '.dankenein{border-color:#9aa5ae}',
    '.haken{margin:0;font-size:64px;line-height:1;color:#1d7a45}',
    '.dankenein .haken{color:#7a828a}',
    '.dankesatz{margin:6px 0 0;font-size:22px}',
    '.dankekuchen{margin:10px 0 0;font-size:20px}',

    '.hinweis{border-color:#c98a12;background:#fffdf5}',

    '.uebersicht h3{margin:16px 0 6px;font-size:20px;color:#144d8c}',
    '.uebersicht h3:first-child{margin-top:0}',
    '.uebersicht .zahl{margin:0 0 4px;font-size:26px;font-weight:bold}',
    '.uebersicht ul{margin:6px 0 0;padding-left:24px}',
    '.uebersicht li{margin:0 0 4px}'
  ].join('');
}


/* ==================================================================
   6. MENÜ IN DER TABELLE – nur für Eva
   ================================================================== */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Repair Café')
    .addItem('1. Einrichten (einmalig)', 'einrichten')
    .addSeparator()
    .addItem('Link zum Verschicken anzeigen', 'linkAnzeigen')
    .addItem('Wer hat noch nicht geantwortet?', 'werFehltNoch')
    .addSeparator()
    .addItem('Neuen Termin starten (Antworten leeren)', 'neuerTermin')
    .addItem('Anmeldung schliessen / öffnen', 'anmeldungUmschalten')
    .addToUi();
}

/** Legt alle Blätter an. Vorhandene Daten bleiben unangetastet. */
function einrichten() {
  var t  = tabelle_();
  var ui = SpreadsheetApp.getUi();

  // --- Einstellungen ---
  var e = t.getSheetByName(BLATT_EINSTELLUNG);
  if (!e) {
    e = t.insertSheet(BLATT_EINSTELLUNG, 0);
    e.getRange('A1:B7').setValues([
      ['Was',                'Wert'],
      ['Titel',              'Repair Café'],
      ['Termin',             'Samstag, 12. September, 14 bis 17 Uhr'],
      ['Ort',                'Gemeindehaus, Hauptstrasse 5'],
      ['Hinweis',            ''],
      ['Anmeldung offen',    'Ja'],
      ['Übersicht anzeigen', 'Ja']
    ]);
    e.getRange('A1:B1').setFontWeight('bold').setBackground('#dbe4ee');
    e.getRange('A1:A7').setFontWeight('bold');
    e.setColumnWidth(1, 190);
    e.setColumnWidth(2, 420);
    e.setFrozenRows(1);
  }

  // --- Teilnehmer ---
  var p = t.getSheetByName(BLATT_TEILNEHMER);
  if (!p) {
    p = t.insertSheet(BLATT_TEILNEHMER, 1);
    p.getRange('A1:D1').setValues([['Name', 'Kommt?', 'Kuchen', 'Zuletzt geändert']]);
    p.getRange('A2:A4').setValues([['Erika Mustermann'], ['Hans Beispiel'], ['Ingrid Muster']]);
    p.getRange('A1:D1').setFontWeight('bold').setBackground('#dbe4ee');
    p.setColumnWidth(1, 240);
    p.setColumnWidth(2, 110);
    p.setColumnWidth(3, 260);
    p.setColumnWidth(4, 190);
    p.setFrozenRows(1);

    var regeln = [
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('Ja').setBackground('#d9ead3').setRanges([p.getRange('B2:B1000')]).build(),
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('Nein').setBackground('#efefef').setRanges([p.getRange('B2:B1000')]).build()
    ];
    p.setConditionalFormatRules(regeln);
  }

  // --- Protokoll (nur anhängen, nie ändern) ---
  var l = t.getSheetByName(BLATT_PROTOKOLL);
  if (!l) {
    l = t.insertSheet(BLATT_PROTOKOLL, 2);
    l.getRange('A1:E1').setValues([['Zeitpunkt', 'Termin', 'Name', 'Antwort', 'Kuchen']]);
    l.getRange('A1:E1').setFontWeight('bold').setBackground('#f4d9d9');
    l.setColumnWidth(1, 170);
    l.setColumnWidth(2, 260);
    l.setColumnWidth(3, 220);
    l.setColumnWidth(5, 240);
    l.setFrozenRows(1);
    try {
      l.protect()
       .setDescription('Sicherheitsnetz – bitte nichts löschen')
       .setWarningOnly(true);
    } catch (ignoriert) {}
  }

  ui.alert('Fertig',
    'Die Blätter sind angelegt:\n\n' +
    '• Einstellungen – Titel, Termin, Ort\n' +
    '• Teilnehmer – hier die Namen eintragen (Spalte A)\n' +
    '• Protokoll – Sicherheitsnetz, bitte nicht anfassen\n\n' +
    'Nächster Schritt: Namen in Spalte A des Blattes "Teilnehmer" eintragen, ' +
    'dann oben im Menü auf "Link zum Verschicken anzeigen".',
    ui.ButtonSet.OK);
}

function linkAnzeigen() {
  var ui  = SpreadsheetApp.getUi();
  var url = ScriptApp.getService().getUrl();

  if (!url) {
    ui.alert('Noch nicht veröffentlicht',
      'Die Web-App ist noch nicht bereitgestellt.\n\n' +
      'Oben rechts auf "Bereitstellen" → "Neue Bereitstellung" → Typ "Web-App",\n' +
      'Ausführen als: Ich, Zugriff: Alle.\n\nDanach hier noch einmal klicken.',
      ui.ButtonSet.OK);
    return;
  }

  var cfg  = einstellungen_();
  var text = 'Hallo! Bitte kurz Bescheid geben, ob du zum ' + (cfg.termin || 'nächsten Termin')
           + ' kommst. Einfach hier tippen, deinen Namen anklicken und Ja oder Nein wählen:\n' + url;

  var html = '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5">'
    + '<p><b>Dieser Link kommt in die WhatsApp-Gruppe oder E-Mail:</b></p>'
    + '<textarea readonly style="width:100%;height:70px;font-size:13px" onclick="this.select()">' + url + '</textarea>'
    + '<p style="margin-top:16px"><b>Fertiger Text zum Kopieren:</b></p>'
    + '<textarea readonly style="width:100%;height:130px;font-size:13px" onclick="this.select()">' + text + '</textarea>'
    + '<p style="color:#666">Zum Kopieren in das Feld klicken, dann Strg+C (Mac: Cmd+C).</p>'
    + '</div>';

  ui.showModalDialog(HtmlService.createHtmlOutput(html).setWidth(520).setHeight(400), 'Link zum Verschicken');
}

function werFehltNoch() {
  var ui   = SpreadsheetApp.getUi();
  var alle = teilnehmer_();
  var offen = [], ja = 0, nein = 0;

  for (var i = 0; i < alle.length; i++) {
    if (alle[i].antwort === 'Ja') ja++;
    else if (alle[i].antwort === 'Nein') nein++;
    else offen.push(alle[i].name);
  }

  ui.alert('Stand der Anmeldungen',
    'Zugesagt: ' + ja + '\nAbgesagt: ' + nein + '\nNoch offen: ' + offen.length +
    (offen.length ? '\n\n' + offen.join('\n') : ''),
    ui.ButtonSet.OK);
}

/** Neuer Termin: Antworten leeren. Das Protokoll bleibt vollständig erhalten. */
function neuerTermin() {
  var ui = SpreadsheetApp.getUi();

  var frage = ui.prompt('Neuer Termin',
    'Wie heisst der neue Termin?\n(z.B. "Samstag, 10. Oktober, 14 bis 17 Uhr")\n\n' +
    'Alle bisherigen Antworten werden geleert. Sie bleiben im Blatt "Protokoll" erhalten.',
    ui.ButtonSet.OK_CANCEL);

  if (frage.getSelectedButton() !== ui.Button.OK) return;
  var termin = frage.getResponseText().trim();
  if (!termin) return;

  var p = blatt_(BLATT_TEILNEHMER);
  var letzte = p.getLastRow();
  if (letzte > 1) p.getRange(2, SPALTE_ANTWORT, letzte - 1, 3).clearContent();

  einstellungSetzen_('Termin', termin);
  einstellungSetzen_('Anmeldung offen', 'Ja');

  ui.alert('Fertig', 'Der Termin ist jetzt "' + termin + '".\n' +
    'Alle Antworten sind geleert, die Anmeldung ist geöffnet.\n\n' +
    'Der Link bleibt derselbe – du kannst ihn einfach wieder verschicken.', ui.ButtonSet.OK);
}

function anmeldungUmschalten() {
  var ui = SpreadsheetApp.getUi();
  var cfg = einstellungen_();
  var neu = cfg.offen ? 'Nein' : 'Ja';
  einstellungSetzen_('Anmeldung offen', neu);
  ui.alert(neu === 'Ja'
    ? 'Die Anmeldung ist jetzt geöffnet.'
    : 'Die Anmeldung ist jetzt geschlossen. Der Link zeigt einen freundlichen Hinweis.');
}

function einstellungSetzen_(schluessel, wert) {
  var e = blatt_(BLATT_EINSTELLUNG);
  var werte = e.getRange(1, 1, Math.max(e.getLastRow(), 1), 1).getDisplayValues();
  for (var i = 0; i < werte.length; i++) {
    if (String(werte[i][0] || '').trim().toLowerCase() === schluessel.toLowerCase()) {
      e.getRange(i + 1, 2).setValue(wert);
      return;
    }
  }
  e.appendRow([schluessel, wert]);
}
