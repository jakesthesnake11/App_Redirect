const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('appRedirect.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS redirects (id INTEGER PRIMARY KEY AUTOINCREMENT, appName TEXT, appleLink TEXT, googleLink TEXT, uniqueId TEXT)");
});

db.close();