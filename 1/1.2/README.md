# learnyounode - Lösungen

## Erkenntnisse pro Aufgabe

- **baby-steps**: Command-line Argumente sind in `process.argv` gespeichert und müssen mit `.slice(2)` ab Index 2 gelesen werden.
- **my-first-io**: Mit `fs.readFileSync` kann eine Datei synchron als String eingelesen werden.
- **my-first-async-io**: Asynchrone Funktionen erfordern Callbacks — das Ergebnis ist erst im Callback verfügbar, nicht danach.
- **filtered-ls**: Mit `fs.readdir` und `path.extname` können Dateien in einem Verzeichnis nach Endung gefiltert werden.
- **http-client**: HTTP-Antworten kommen als Stream in mehreren `data`-Events an, nicht auf einmal.
- **http-collect**: Um alle Chunks zu sammeln, muss man sie in einer Variable akkumulieren und erst beim `end`-Event ausgeben.
- **juggling-async**: Mehrere parallele Requests liefern Ergebnisse in unbekannter Reihenfolge — durch Speichern per Index im Array bleibt die Reihenfolge garantiert.
- **time-server**: Mit dem `net`-Modul kann ein TCP-Server erstellt werden, der bei jeder Verbindung Daten sendet und die Verbindung schliesst.

## Reflexion

**Herausforderungen:**

- Asynchrones Denken war am Anfang schwierig — der Code läuft nicht von oben nach unten, sondern Callbacks werden erst später ausgeführt.
- Bei `juggling-async` war unklar, wie die Reihenfolge der Ausgabe garantiert werden kann, obwohl die Requests parallel laufen.
- Datum formatieren mit führenden Nullen (`04` statt `4`) war nicht offensichtlich.

**Lösungsansätze:**

- Asynchrone Probleme wurden durch konsequentes Arbeiten mit Callbacks und dem `end`-Event gelöst.
- Die Reihenfolge bei parallelen Requests wurde durch einen Index-Array und einen Zähler für abgeschlossene Requests sichergestellt.
- `String.padStart(2, '0')` löste das Problem mit den führenden Nullen.
