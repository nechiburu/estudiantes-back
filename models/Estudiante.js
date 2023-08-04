const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const estudianteSchema = new Schema({
  nombre: {
    type: String,
    trim: true
  },
  apellido: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  carnet: {
    type: String,
    trim: true
  },
  telefono: {
    type: String,
    trim: true
  },
  colegio: {
    type: String,
    trim: true
  },
  promocion: {
    type: String,
    trim: true
  },
  destino: {
    type: String,
    trim: true
  },
  imagenDocumento: {
    type: String,
  },
  imagenVoleto: {
    type: String,
  },
  imagenPermiso: {
    type: String,
  },
  imagenPerfil: {
    type: String,
  },
  estatus: {
    type: Boolean,
    default: false
  },
  qrcode: {  // Agregar el campo para almacenar la URL del código QR
    type: String,
  }
});

module.exports = mongoose.model('Estudiante', estudianteSchema);
