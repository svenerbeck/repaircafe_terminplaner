# Repair Café Terminplaner

Anwesenheitsplanung für die Reparierenden eines Repair Cafés.
Ein Link, den eigenen Namen antippen, **Ja** oder **Nein**, Kuchen eintragen. Fertig.

Kein Login, keine App, keine Tabelle, in der jemand versehentlich etwas löschen kann.
Gebaut für Handys – ausdrücklich auch für alte.

```
   Namensliste                Meine Seite              Bestätigung
 ┌────────────────┐        ┌────────────────┐      ┌────────────────┐
 │ Erika M.  ✓    │        │     Hallo      │      │       ✓        │
 │ Hans B.   –    │  ───►  │ Ingrid Muster  │ ──►  │ Ingrid Muster  │
 │ Ingrid M. offen│        │                │      │ Du bist ange-  │
 │ Gerda V.  offen│        │ Kommst du?     │      │ meldet!        │
 └────────────────┘        │ ┌────────────┐ │      ├────────────────┤
   auf den eigenen         │ │JA,ich komme│ │      │ Kuchen? [____] │
   Namen tippen            │ └────────────┘ │      │ [Eintragen]    │
                           │ │Nein, ich   │ │      └────────────────┘
                           │ │kann nicht  │ │
                           │ └────────────┘ │
                           └────────────────┘
```

Pro Bildschirm genau **eine** Entscheidung. Die Kuchenfrage kommt bewusst erst nach der
Zusage – stünde sie neben den Knöpfen, tippt man auf „JA“ und sieht sie nie.

## Warum

Vorher lief die Terminplanung über ein geteiltes Tabellendokument: einloggen, den eigenen
Namen in einer Liste suchen, ein `+` oder `–` setzen, in der Nachbarzelle den Kuchen
eintragen. Für die Zielgruppe – viele davon jenseits der 70 – ist das drei Hürden zu viel.
Irgendwann hat jemand beim Aufräumen die halbe Liste gelöscht, die Wiederherstellung hat
den Rest verschoben, und danach hat niemand mehr den Zahlen getraut.

Dieses Werkzeug dreht das um: Die Teilnehmer sehen **nur noch Knöpfe**. Die Tabelle bleibt,
aber sie liegt dahinter und gehört allein der Organisatorin.

## Wie es funktioniert

| Baustein | Aufgabe |
|---|---|
| **Google Tabelle** | Die Daten. Nur die Organisatorin hat Zugriff. |
| **Google Apps Script Web-App** | Die Seite für die Teilnehmer. Kostenlos, kein Server, kein Login. |
| **Jimdo / beliebige Website** | Verlinkt nur dorthin. |

Ein klassischer Webspace ist ausdrücklich **nicht** nötig – und ein Jimdo-Baukasten reicht
auch nicht aus, weil er selbst keine Daten speichern kann. Deshalb liegt die Logik komplett
im Apps Script der Tabelle.

Drei Blätter entstehen automatisch:

| Blatt | Inhalt |
|---|---|
| `Einstellungen` | Titel, Termin, Ort, Hinweistext, Anmeldung offen/geschlossen |
| `Teilnehmer` | Namen in Spalte A – Antwort, Kuchen und Zeitstempel füllt das Skript |
| `Protokoll` | Jede einzelne Eingabe mit Zeitstempel, wird **nie** überschrieben |

## Schnellstart

Ausführlich und bebildert in **[ANLEITUNG.md](ANLEITUNG.md)** – gedacht zum Weiterreichen an
jemanden, der nicht programmiert.

1. Neue Google Tabelle anlegen
2. **Erweiterungen → Apps Script**, Inhalt von [`Code.gs`](Code.gs) hineinkopieren, speichern
3. Tabelle neu laden → Menü **Repair Café → 1. Einrichten**
4. Namen in Spalte A des Blattes `Teilnehmer` eintragen, Termin unter `Einstellungen`
5. **Bereitstellen → Neue Bereitstellung → Web-App**,
   *Ausführen als:* `Ich`, *Zugriff:* `Alle`
6. Menü **Repair Café → Link zum Verschicken anzeigen**

Der Link bleibt danach für immer derselbe – auch für kommende Termine.

## Für die Organisation

Alles läuft über das Menü **Repair Café** in der Tabelle:

| Menüpunkt | Wirkung |
|---|---|
| Link zum Verschicken anzeigen | Link plus fertiger Text für WhatsApp oder E-Mail |
| Wer hat noch nicht geantwortet? | Zusagen, Absagen und die offenen Namen |
| Neuen Termin starten | Leert die Antworten, setzt den neuen Termin, öffnet die Anmeldung |
| Anmeldung schließen / öffnen | Der Link zeigt dann einen freundlichen Hinweis |

Neue Person im Verein? Einfach unten in Spalte A dazuschreiben – sofort in der Liste,
ohne erneutes Bereitstellen.

## Alte Geräte

Prio 1 des Projekts, deshalb bewusst zurückhaltend gebaut:

- **Kein JavaScript nötig.** Reines HTML-Formular mit `GET` für die Auswahl und `POST` zum
  Speichern. Läuft auf Android 4 und iOS 9 genauso wie auf einem aktuellen Gerät.
- Kein Framework, keine Schriften aus dem Netz, kein Flexbox-Zwang, keine CSS-Variablen.
- 20 px Grundschrift, Knöpfe über 60 px hoch, Bedienelemente über die volle Breite.
- Eine einzige Seite pro Entscheidung, kein Scrollen zu einem Absenden-Knopf.

## Datensicherheit

- Die Teilnehmer bekommen die Tabelle nie zu sehen und können darin nichts verändern.
- Jede Eingabe landet zusätzlich unveränderlich im Blatt `Protokoll` – geht im Hauptblatt
  etwas verloren, lässt es sich daraus vollständig rekonstruieren.
- Namen werden gegen die Teilnehmerliste geprüft; erfundene Einträge sind nicht möglich.
- Alle Ausgaben sind HTML-maskiert.
- Gleichzeitige Zugriffe werden über `LockService` serialisiert.
- Zusätzlich greift der Versionsverlauf von Google Tabellen.

## Bewusste Einschränkung

Es gibt **einen Link für alle**, keine persönlichen Zugänge. Wer den Link hat, könnte
theoretisch auch für jemand anderen antworten. Für einen Verein ist das in aller Regel
unproblematisch, und der Status neben jedem Namen macht einen Fehlgriff sofort sichtbar.
Der Gegenwert ist erheblich: eine einzige Adresse für die ganze Gruppe, nichts zu verteilen,
nichts zu verwalten, nichts zu verlieren.

## Vorschau am eigenen Rechner

```bash
node vorschau.js
```

Stellt die Google-Dienste nach, erzeugt alle Seitenzustände als HTML im Ordner `vorschau/`
und prüft die Maskierung. Bei Google wird dabei nichts verändert.

## Dateien

| Datei | Inhalt |
|---|---|
| [`Code.gs`](Code.gs) | Das vollständige Programm für das Apps Script |
| [`ANLEITUNG.md`](ANLEITUNG.md) | Einrichtung Schritt für Schritt, ohne Vorkenntnisse |
| [`vorschau.js`](vorschau.js) | Lokale Vorschau ohne Google |
