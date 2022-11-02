//? Rutas de usuarios / calendar
//? host + api/calendar

const { Router } = require('express');
const { check } = require('express-validator')
const { validarCampos } = require('../middlewares/validar-campos');
const {
    getEventos,
    eliminarEvento,
} = require('../controllers/events');

const {
    getCalendarEvent,
    newCalendarEvent,
    deleteCalendarEvent,
    updateCalendar,
    addNewEventToCalendar
} = require('../controllers/calendarEvents');

const { validarJWT } = require('../middlewares/validar-jwt')

const router = Router();

// Todas tienen que pasar por la validacion del jwt
router.use(validarJWT)

//Obtener todos los calendarios
router.get('/', getCalendarEvent);

//Crear nuevo calendario
router.post('/', newCalendarEvent);

//Actualizar nuevo calendario
router.put('/:id', updateCalendar);

//Agregar Nuevo Evento a calendario ya creado
router.put('/event/:id', addNewEventToCalendar);

//borrar calendario
router.delete('/:id', deleteCalendarEvent);

//recordar exportar el router sino no funciona
module.exports = router