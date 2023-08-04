const Estudiante = require('../models/Estudiante');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs').promises;
const qrcode = require('qrcode');
const nodemailer = require('nodemailer');
const { promisify } = require('util');

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

// Configurar multer con la configuración y los campos necesarios
const upload = multer(configuracionMulter).fields([
  { name: 'imagenDocumento', maxCount: 1 },
  { name: 'imagenVoleto', maxCount: 1 },
  { name: 'imagenPermiso', maxCount: 1 },
  { name: 'imagenPerfil', maxCount: 1 }
]);

// Function to generate QR code and return it as a buffer
async function generateQrCode(data) {
  try {
    await promisify(qrcode.toFile)('codigo_qr.png', data); // Generar el archivo del código QR
    return '/ruta-del-directorio-publico/codigo_qr.png'; // Devuelve la URL del código QR
  } catch (err) {
    console.error('Error al generar el código QR:', err);
    throw err;
  }
}

// Function to send the email
async function sendEmail(mailOptions) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user:'krisnaspiral@gmail.com', // Use environment variables for email credentials
        pass:'wmingyhpgzydjerp', // Use environment variables for email credentials
      },
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Correo electrónico enviado:', info.messageId);
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
    throw error;
  }
}

// Helper function to extract image file names from req.files
function extractImageFileNames(req) {
  const fileNames = {};
  const fileFields = ['imagenDocumento', 'imagenVoleto', 'imagenPermiso', 'imagenPerfil'];

  fileFields.forEach((field) => {
    if (req.files[field]) {
      fileNames[field] = req.files[field][0].filename;
    }
  });

  return fileNames;
}

async function isEmailDuplicate(email) {
  const existingStudent = await Estudiante.findOne({ email });
  return existingStudent !== null;
}

// Agregar un nuevo estudiante
exports.nuevoEstudiante = async (req, res, next) => {
  try {
    upload(req, res, async function (error) {
      if (error) {
        return res.json({ mensaje: error.message });
      }

      const fileNames = extractImageFileNames(req);
      const estudianteData = {
        ...req.body,
        ...fileNames,
      };

      const isDuplicate = await isEmailDuplicate(estudianteData.email);
      if (isDuplicate) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const estudiante = new Estudiante(estudianteData);
      await estudiante.save();

      // Convertir el objeto a cadena JSON
      const jsonStr = JSON.stringify(estudiante._id);

      // Generate the QR code as a buffer using async/await
      const qrCodeUrl = await generateQrCode(jsonStr);
      console.log('Se ha generado el código QR correctamente.');

      // Asignar la URL del código QR al campo qrcode del estudiante
      estudiante.qrcode = qrCodeUrl;

      // Guardar el estudiante en la base de datos
      await estudiante.save();

      // Prepare email options
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: estudiante.email,
        subject: 'Código QR del estudiante',
        html: `<p>Hola ${estudiante.nombre} ${estudiante.apellido},<br>
        Gracias por registrarte con nosotros. Te enviamos tu código QR que podrás usar en tu viaje.</p> `,
        attachments: [
          {
            filename: 'codigo_qr.png',
            path: qrCodeUrl
          }
        ]
      };

      // Send the email
      await sendEmail(mailOptions);

      res.json({ mensaje: 'Se agregó un nuevo estudiante' });
    });
  } catch (error) {
    console.log(error);
    next();
  }
};

exports.mostrarEstudiante = async (req, res, next) => {
  try {
    const estudiantes = await Estudiante.find({});
    const estudiantesCount = await Estudiante.countDocuments({});
    res.json({ estudiantes, estudiantesCount });
  } catch (error) {
    console.log(error);
    next();
  }
};


exports.mostrarEstudianteId = async (req, res) => {
  try {
    const estudiante = await Estudiante.findById(req.params.id)
    res.send(estudiante);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

exports.cambiarEstatusEstudianteID = async (req, res) => {
  try {
    const estudianteId = req.params.id;
    const updatedStatus = req.body.estatus;

    if (typeof updatedStatus !== 'boolean') {
      return res.status(400).json({ message: 'El estatus debe ser un valor booleano (true o false)' });
    }

    const estudiante = await Estudiante.findByIdAndUpdate(estudianteId, { estatus: updatedStatus });

    if (!estudiante) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Estatus del usuario actualizado exitosamente', estudiante });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estatus del usuario', error });
  }
};

exports.getEstudiantesInactivos = async (req, res, next) => {
  try {
    const estudiantes = await Estudiante.find({ estatus: false });
    const estudiantesCount = estudiantes.length;
    res.json({ estudiantes, estudiantesCount });
  } catch (error) {
    console.log(error);
    next();
  }
};

exports.cambiarEstatusEstudiantes = async (req, res) => {
  try {
    await Estudiante.updateMany({}, { estatus: false });
    res.status(200).json({ message: 'Estatus de todos los usuarios cambiado a false' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar el estatus de los usuarios' });
  }
};