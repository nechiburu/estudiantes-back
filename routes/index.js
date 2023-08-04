const express = require('express');
const router = express.Router();



// const estudianteController = require('../controller/estudianteController');
const  nuevoEstudianteCtrl  = require('../controller/nuevoEstudianteCtrl');

module.exports = function() {



    // estudiante rute

    router.get('/estudiante',nuevoEstudianteCtrl.mostrarEstudiante)
    //muestra un estudiante en espesifico ID
    router.get('/estudiante/:id', nuevoEstudianteCtrl.mostrarEstudianteId)

    router.post('/estudiante',
    nuevoEstudianteCtrl.subirArchivo,
    nuevoEstudianteCtrl.nuevoEstudiante
    );

    router.put('/estudiante/:id/cambiar-estatus', nuevoEstudianteCtrl.cambiarEstatusEstudianteID);

    router.get('/estudianteina',nuevoEstudianteCtrl.getEstudiantesInactivos)

    router.put('/estudiante/cambiar-estatus', nuevoEstudianteCtrl.cambiarEstatusEstudiantes);


    return router;

}

