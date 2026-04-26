# Schiffe Versenken - Browser Game

Ein modernes, webbasiertes "Schiffe versenken" Spiel, entwickelt mit HTML, CSS und JavaScript.

Erstellt von Ina und Zettt.

## Features

- **Zwei Spielmodi:**
  - **Gegen Freund (Hotseat):** Zwei Spieler an einem Gerät. Der Bildschirm wird zwischen den Zügen verdeckt.
  - **Gegen Computer:** Spiele gegen eine KI, die Schiffe zufällig platziert und strategisch (mit Extra-Zügen bei Treffern) angreift.
- **Manuelle Platzierung:** Schiffe können per Klick platziert und um 90 Grad gedreht werden.
- **Treffer-Regel:** Wer einen Treffer landet, darf sofort erneut schießen.
- **Modernes Design:** Glassmorphismus-Aoptik mit flüssigen Animationen und responsiven Grids.

## Spielanleitung

1. **Modus wählen:** Entscheide dich für ein Spiel gegen einen Freund oder den Computer.
2. **Schiffe platzieren:**
   - Wähle ein Schiff aus der Liste rechts aus.
   - Nutze den "Drehen"-Button, um zwischen horizontaler und vertikaler Ausrichtung zu wechseln.
   - Klicke auf dein Spielfeld, um das Schiff zu setzen.
3. **Kampf:**
   - Klicke im Radar-Feld (oben/rechts) auf eine Koordinate, um zu feuern.
   - Ein rotes "✕" markiert einen Treffer, ein blaues "•" markiert Wasser.
   - Bei einem Treffer darfst du direkt noch einmal feuern.
4. **Sieg:** Versenke alle Schiffe des Gegners (insgesamt 10 Schiffe), um zu gewinnen.

## Technische Details

- **Sprachen:** HTML5, CSS3, Vanilla JavaScript (keine externen Bibliotheken benötigt).
- **Struktur:**
  - `index.html`: Struktur der verschiedenen Screens (Start, Setup, Battle, Transition).
  - `style.css`: Designsystem und Grid-Logik.
  - `script.js`: Zustandsverwaltung, AI-Logik und Spielmechanik.

## Installation

Einfach den Ordner öffnen und die `index.html` in einem modernen Webbrowser starten.
