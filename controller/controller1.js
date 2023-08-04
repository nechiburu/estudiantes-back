
const Estudiante = require('../models/Estudiante');
const multer = require('multer');
const shortid = require('shortid');

const configuracionMulter = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const extension = file.mimetype.split('/')[1];
      cb(null, `${shortid.generate()}.${extension}`);
    }
  }),
  fileFilter(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Formato no válido'));
    }
  }
};

// pasar la configuración y el campo
// Configurar multer con la configuración y los campos necesarios
const upload = multer(configuracionMulter).fields([
    { name: 'imagenDocumento', maxCount: 1 },
    { name: 'imagenOtros', maxCount: 1 }
]);

// Subir archivos
exports.subirArchivo = (req, res, next) => {
    upload(req, res, function (error) {
      if (error) {
        res.json({ mensaje: error.message });
      }
      return next();
    });
  };
  
  // Agregar un nuevo estudiante
  exports.nuevoEstudiante = async (req, res, next) => {
    try {
      const estudiante = new Estudiante(req.body);
  
      if (req.files['imagenDocumento']) {
        estudiante.imagenDocumento = req.files['imagenDocumento'][0].filename;
      }
  
      if (req.files['imagenOtros']) {
        estudiante.imagenOtros = req.files['imagenOtros'][0].filename;
      }
  
      await estudiante.save();
      res.json({ mensaje: 'Se agregó un nuevo estudiante' });
    } catch (error) {
      console.log(error);
      next();
    }
  };
// exports.nuevoEstudiante = async (req, res, next) => {
//     const estudiante = new Estudiante(req.body);

//     try {
//         if(req.file.filename) {
//             estudiante.imagenDocumento = req.file.filename
//         }
//         await estudiante.save();
//         res.json({mensaje : 'Se agrego un nuevo regalo'})
//     } catch (error) {
//         console.log(error);
//         next();
//     }
// } 
