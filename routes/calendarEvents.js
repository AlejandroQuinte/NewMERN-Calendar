//? Rutas de usuarios / calendar
//? host + api/calendar

const { Router } = require('express');

const {
    addNewEventToCalendar,
    deleteCalendarEvent,
    getCalendar,
    getCalendarEvent,
    newCalendarEvent,
    updateCalendar,
    getEventsToCalendar,
} = require('../controllers/calendarEvents');

const { validarJWT } = require('../middlewares/validar-jwt')

const router = Router();

// Todas tienen que pasar por la validacion del jwt
router.use(validarJWT)

//Obtiene un calendario mediante el ID
router.get('/:id', getCalendar);

//Obtener todos los calendarios
router.get('/', getCalendarEvent);

//Obteniendo todos los eventos de ese calendario
router.get('/event/:id', getEventsToCalendar);

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