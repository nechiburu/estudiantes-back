const Estudiante = require('../models/Estudiante');

const fs = require('fs');
const qrcode = require('qrcode');
const nodemailer = require('nodemailer');

//muestra todos los estudiantes

exports.mostrarEstudiante = async (req,res,next) => {

    try {
        const estudiante = await Estudiante.find({});
        res.json(estudiante) 
    } catch (error) {
        console.log(error)
        next()
    }
}

// muestra un estudiante por su ID
exports.mostrarEstudiante = async (req,res,next) => {
    const estudiante = await Estudiante.findById(req.params.idEstudiante)

    if(!estudiante) {
        res.json({mensaje : 'Ese estudiante no exite'})
        next()
    }

    //mostrar estudiante
    res.json(estudiante)
}

//actualiza un estudiante

 exports.actualizarEstudiante = async (req,res,next) =>{
    try {
        const estudiante = await Estudiante.findOneAndUpdate(
            {_id : req.params.idEstudiante},
            req.body, {new: true })
        res.json(estudiante)
    } catch (error) {
        console.log(error)
        next()
    }


 }

 //eliminar estudiante 

 exports.eliminarEstudiante = async (req,res,next) => {
    try {
       await Estudiante.findOneAndDelete(
            {_id: req.params.idEstudiante})
            res.json({mensaje: 'El estudiante se a eliminado'})
    } catch (error) {
        console.log(error)
        next()
    }
 }

 // crEAR UN NUEVO ESTUDIANTE

 exports.nuevoEstudiante = async (req,res)=> {
    console.log(req.body);
    const { nombre, apellido, email, carnet, telefono, colegio, promocion, destino,vacunas } =
      req.body;
      //Estudiante existe
      const estudianteExistente = await Estudiante.findOne({email})
      if(estudianteExistente){
        throw new Error("El estudiante ya existe")
      }
      // crear el nuevo estudiante
      const estudiante = await Estudiante.create({
        nombre,
        apellido,
        email,
        carnet,
        telefono,
        colegio,
        promocion,
        destino,
        vacunas
      });
      //push the product into category
      //send response
        res.json({
            status: "success",
            message: "Estudiante creado exitosamente",
            estudiante,
        });
        
    // Convertir el objeto a cadena JSON
    const jsonStr = JSON.stringify(estudiante);

    

// Generar el código QR y guardarlo como archivo
qrcode.toFile('codigo_qr.png', jsonStr, async (err) => {
  if (err) {
    console.error('Error al generar el código QR:', err);
    return;
  }
  console.log('Se ha generado el código QR correctamente.');

  // Configurar el servicio de correo electrónico
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'krisnaspiral@gmail.com',
      pass: 'wmingyhpgzydjerp'
    }
  });

  // Leer el archivo de código QR generado
  const qrCode = fs.readFileSync('codigo_qr.png');

  // Adjuntar el archivo al correo electrónico
  const mailOptions = {
    from: 'krisnaspiral@gmail.com',
    to: estudiante.email,
    subject: 'Código QR del producto',
    html: '<p>Adjunto encontrarás el código QR del producto.</p>',
    attachments: [{
      filename: 'codigo_qr.png',
      content: qrCode
    }]
  };

  try {
    // Enviar el correo electrónico
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo electrónico enviado:', info.messageId);
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
  }
});
} 


