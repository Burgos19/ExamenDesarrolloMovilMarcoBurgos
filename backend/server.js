const express = require('express');
const db = require('./database.js'); 
const app = express();
const PORT = 3000;

app.use(express.json());

// Endpoint para obtener todos los productos.
app.get('/productos', (req, res) => {
  db.all("SELECT * FROM productos", [], (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": rows
    });
  });
});

// agrega nuevo producto
app.post('/productos', (req, res) => {
  const { nombre, descripcion, precio, estado, categoria, url_fotografia } = req.body;

  // validar para los capmos obligatorios 
  if (!nombre || !precio || !estado) {
    res.status(400).json({ "error": "Faltan campos obligatorios: nombre, precio y estado." });
    return;
  }

  //inserta un prodcuto a la base 
  db.run(`INSERT INTO productos (nombre, descripcion, precio, estado, categoria, url_fotografia) VALUES (?, ?, ?, ?, ?, ?)`,
    [nombre, descripcion, precio, estado, categoria, url_fotografia],
    function(err) {
      if (err) {
        res.status(400).json({ "error": err.message });
        return;
      }
      res.status(201).json({
        "message": "Producto creado con éxito",
        "data": { id: this.lastID, ...req.body }
      });
    }
  );
});

// eliminar producto
app.delete('/items/:id', (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM productos WHERE id = ?`, id, function(err) {
    if (err) {
      res.status(400).json({ "error": res.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ "error": "Producto no encontrado." });
    } else {
      res.json({ "message": "Producto eliminado con éxito", "id": id });
    }
  });
});

// inicializamos servidor 
app.listen(PORT, () => {
  console.log(`Servidor de API ejecutándose en http://localhost:${PORT}`);
});