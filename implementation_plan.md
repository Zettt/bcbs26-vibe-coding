# Konzept: Schiffe versenken (Battleship) - 2 Spieler (Hotseat)

Dieses Dokument beschreibt das Konzept für eine browserbasierte Umsetzung des Spieleklassikers "Schiffe versenken" mit HTML, CSS und JavaScript für zwei menschliche Spieler an einem Gerät.

## 1. Spielziel & Regeln
- **Ziel:** Der Spieler muss alle Schiffe des Gegners versenken, bevor dieser die eigenen Schiffe versenkt.
- **Spielfeld:** Zwei Raster (üblicherweise 10x10 Felder). Jeder Spieler hat ein eigenes Raster.
- **Schiffe pro Spieler:** 
  - 1x Schlachtschiff (5 Felder)
  - 2x Kreuzer (4 Felder)
  - 3x Zerstörer (3 Felder)
  - 4x U-Boote (2 Felder)
- **Ablauf (Hotseat-Modus):**
  1. **Setup Spieler 1:** Spieler 1 platziert seine Schiffe. Spieler 2 schaut weg.
  2. **Transition:** Bildschirm wird verdeckt ("Spielerwechsel").
  3. **Setup Spieler 2:** Spieler 2 platziert seine Schiffe. Spieler 1 schaut weg.
  4. **Kampfphase:** Abwechselnde Züge.
     - Sicht Spieler 1: Zeigt eigenes Raster (mit Schiffen) und Zielraster (Gegnerfeld, verdeckt).
     - Klick auf Zielraster -> Schuss.
     - Nach dem Schuss: Transition-Screen ("Spielerwechsel").
     - Sicht Spieler 2: Analog.
  5. **Feedback:** "Wasser" oder "Treffer". Ein Schiff ist versenkt, wenn alle Felder getroffen wurden.
  6. **Spielende:** Ein Spieler hat keine intakten Schiffe mehr.

## 2. Benutzeroberfläche (UI) & Design
- **Phasen / Screens:** Das UI wechselt zwischen verschiedenen Containern (mit `display: none/block`).
  - `start-screen`: Hauptmenü.
  - `setup-screen`: Grid zum Platzieren. Schiffs-Auswahl-Panel an der Seite. Button "Drehen (90°)".
  - `transition-screen`: Neutraler Bildschirm ("Bitte Gerät an Spieler X übergeben", Button "Bereit").
  - `battle-screen`: Zwei Grids nebeneinander (Eigenes Grid klein, Ziel-Grid groß).
  - `gameover-screen`: Siegerehrung.
- **Platzierungs-Mechanik:**
  - Spieler klickt im Panel auf ein Schiffstyp, um es auszuwählen.
  - Klick auf "Drehen" wechselt die Ausrichtung (Horizontal / Vertikal).
  - Hover über das Grid zeigt eine Vorschau (grün wenn gültig, rot wenn blockiert/außerhalb).
  - Klick platziert das Schiff.

## 3. Technische Umsetzung
- **State-Management:**
  - `boards`: `{ 1: [...], 2: [...] }`
  - `currentPlayer`: 1 oder 2
  - `gameState`: 'setup', 'battle', 'gameover'
- **Technologien:** Plain HTML, CSS, Vanilla JS. Alles wird in `./tmp/battleship/` abgelegt.

## Umsetzung

Wird nun direkt implementiert.
