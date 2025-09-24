const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crea una instancia de la base de datos.
const dbPath = path.resolve(__dirname, 'productos.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
  }
});

// tabla de productos si no existe.
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio REAL NOT NULL,
    estado TEXT CHECK(estado IN ('Disponible', 'No disponible')) NOT NULL,
    categoria TEXT,
    url_fotografia TEXT
  )`, (err) => {
    if (err) {
      console.error("Error al crear la tabla 'productos':", err.message);
    } else {
      console.log("Tabla 'productos' creada o ya existe.");
    }
  });
});

module.exports = db;