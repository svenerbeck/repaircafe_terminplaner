# Repair Café Anmeldung – Einrichtung

Einmalig ca. 15 Minuten. Danach muss Eva pro Termin nur noch **einen Menüpunkt anklicken**
und den immer gleichen Link verschicken.

---

## Was am Ende passiert

**Für die Teilnehmer** (ein Link, sonst nichts):

```
        Namensliste                 Meine Seite                 Bestätigung
  ┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
  │  Erika M.        ✓  │     │        Hallo        │     │          ✓          │
  │   🍰 Apfelkuchen    │     │    INGRID MUSTER    │     │    INGRID MUSTER    │
  ├─────────────────────┤     │Ich bin nicht Ingrid │     │ Du bist angemeldet! │
  │Hans B.    kann nicht│     │ Muster → zur Liste  │     ├─────────────────────┤
  ├─────────────────────┤ ──► ├─────────────────────┤ ──► │  Bringst du einen   │
  │Ingrid M.      offen │     │Kommst du zum Termin?│     │     Kuchen mit?     │
  ├─────────────────────┤     │  [ JA, ich komme ]  │     │ [                 ] │
  │Gerda V.       offen │     │[ Nein, kann nicht ] │     │  [   Eintragen   ]  │
  └─────────────────────┘     └─────────────────────┘     └─────────────────────┘
      auf den eigenen
       Namen tippen
```

Kein Login. Keine Tabelle. Keine App. Pro Bildschirm genau **eine** Entscheidung.

**Für Eva:** eine ganz normale Google-Tabelle, die ausser ihr niemand sieht.

---

## Schritt 1 – Tabelle anlegen

1. Mit Evas Google-Konto auf **drive.google.com** gehen
2. **Neu → Google Tabellen → Leere Tabelle**
3. Oben links den Namen auf **„Repair Café Anmeldung"** ändern

## Schritt 2 – Das Programm einsetzen

1. In der Tabelle oben im Menü: **Erweiterungen → Apps Script**
2. Es öffnet sich ein Fenster mit ein bisschen Beispielcode. Diesen **komplett löschen**
   (Klick ins Textfeld, `Strg+A` bzw. `Cmd+A`, dann `Entf`)
3. Den **gesamten** Inhalt der Datei `Code.gs` aus diesem Ordner dort hineinkopieren
4. Oben auf das **Disketten-Symbol** (Speichern) klicken
5. Das Fenster kann offen bleiben – wir brauchen es in Schritt 5 nochmal

## Schritt 3 – Einrichten lassen

1. Zurück zum Tab mit der Tabelle, **Seite neu laden** (F5)
2. Oben erscheint jetzt ein neues Menü: **Repair Café**
3. Darauf klicken → **„1. Einrichten (einmalig)"**
4. Google fragt nach Berechtigungen. Das ist normal – es ist Evas eigenes Skript
   in ihrer eigenen Tabelle:
   - **Zugriff überprüfen** → Google-Konto auswählen
   - Der Hinweis **„Google hat diese App nicht überprüft"** erscheint.
     Unten auf **Erweitert** klicken → **„Weiter zu Repair Café Anmeldung (unsicher)"**
     (das steht dort, weil es ein privates Skript ist und nicht im Google-Store)
   - **Zulassen**
5. Menü **Repair Café → „1. Einrichten"** noch einmal anklicken.
   Es entstehen drei Blätter: `Einstellungen`, `Teilnehmer`, `Protokoll`

## Schritt 4 – Namen und Termin eintragen

**Blatt „Teilnehmer":** die drei Beispielnamen in Spalte A überschreiben und alle
echten Namen untereinander eintragen. **Nur Spalte A** – der Rest füllt sich von selbst.

**Blatt „Einstellungen":** Titel, Termin und Ort eintragen.

| Was | Beispiel |
|---|---|
| Titel | Repair Café Musterstadt |
| Termin | Samstag, 12. September, 14 bis 17 Uhr |
| Ort | Gemeindehaus, Hauptstrasse 5 |
| Hinweis | Bitte bis Donnerstag antworten. *(darf leer bleiben)* |
| Anmeldung offen | Ja |
| Übersicht anzeigen | Ja *(zeigt allen, wer kommt und wer Kuchen bringt)* |

## Schritt 5 – Ins Netz stellen

1. Zurück ins Apps-Script-Fenster (Schritt 2)
2. Oben rechts **Bereitstellen → Neue Bereitstellung**
3. Beim Zahnrad neben „Typ auswählen" auf **Web-App** klicken
4. Ausfüllen:
   - **Beschreibung:** Anmeldung
   - **Ausführen als:** *Ich (Evas Adresse)* ← wichtig
   - **Zugriff:** **Alle** ← wichtig, sonst müssen sich die Leute einloggen
5. **Bereitstellen** → der Link wird angezeigt → fertig

> Der Link ist sehr lang und zufällig. Nur wer ihn hat, kommt hinein –
> über Google finden kann ihn niemand.

## Schritt 6 – Link verschicken

Menü **Repair Café → „Link zum Verschicken anzeigen"**.
Dort steht der Link und ein fertiger Text zum Kopieren für WhatsApp oder E-Mail.

**Auf der Jimdo-Seite:** eine Seite „Anmeldung" anlegen und dort ein
**Button-Element** einfügen, das auf diesen Link zeigt. Beschriftung z.B.
*„Zum nächsten Termin anmelden"*. Damit müssen die Leute sich nicht mal einen
Link merken – sie gehen auf die gewohnte Vereinsseite.

*(Jimdo kann selbst keine Anmeldungen speichern – deshalb liegt die Technik bei
Google und Jimdo verlinkt nur dorthin. Für die Leute sieht es aus wie ein Klick weiter.)*

---

## Der Alltag danach

| Ich möchte … | Menü **Repair Café** → |
|---|---|
| sehen, wer noch nicht geantwortet hat | „Wer hat noch nicht geantwortet?" |
| den nächsten Termin starten | „Neuen Termin starten (Antworten leeren)" |
| die Anmeldung beenden | „Anmeldung schliessen / öffnen" |
| den Link nochmal verschicken | „Link zum Verschicken anzeigen" |

**Der Link bleibt für immer derselbe.** Auch nach einem neuen Termin. Wer ihn sich
im Handy gespeichert hat, kann ihn jedes Mal wieder benutzen.

**Neue Person im Verein?** Einfach unten in Spalte A des Blattes „Teilnehmer"
dazuschreiben. Sofort in der Liste sichtbar, ohne irgendetwas neu bereitzustellen.

---

## Warum jetzt nichts mehr kaputtgehen kann

- Die Teilnehmer sehen **die Tabelle nie**. Sie können darin nichts löschen,
  verschieben oder überschreiben – sie sehen nur Knöpfe.
- Es gibt **nichts zum Kaputtmachen**: keine Zeilen, keine Formeln, keine Spalten.
  Nur „JA" oder „Nein" und ein Textfeld.
- Jede einzelne Eingabe wird zusätzlich im Blatt **„Protokoll"** mitgeschrieben und
  dort **nie wieder verändert**. Selbst wenn im Blatt „Teilnehmer" versehentlich etwas
  gelöscht wird: im Protokoll steht jede Antwort mit Uhrzeit und lässt sich zurückholen.
- Google Tabellen hat ausserdem **Datei → Versionsverlauf** – damit lässt sich die
  ganze Tabelle auf jeden früheren Stand zurücksetzen.
- Zwei Leute gleichzeitig sind kein Problem, das Skript arbeitet der Reihe nach ab.

---

## Wenn etwas nicht klappt

**„Das Menü ‚Repair Café' fehlt"** → Tabelle neu laden (F5). Beim allerersten Mal
kann es einen Moment dauern.

**Leute landen auf einem Google-Login** → In Schritt 5 stand „Zugriff" nicht auf
**Alle**. Im Apps-Script-Fenster: *Bereitstellen → Bereitstellungen verwalten →
Stift-Symbol → Zugriff: Alle → Bereitstellen*.

**Der Code wurde geändert und wirkt nicht** → *Bereitstellen → Bereitstellungen
verwalten → Stift-Symbol → Version: **Neu** → Bereitstellen*. Der Link bleibt gleich.
Achtung: „Neue Bereitstellung" erzeugt dagegen einen **neuen** Link.

**Ein Name steht nicht in der Liste** → Steht er wirklich in Spalte A des Blattes
„Teilnehmer" und ist die Zeile darüber nicht leer? Leerzeilen beenden die Liste nicht,
aber die Namen sollten ohne Lücken untereinander stehen.
