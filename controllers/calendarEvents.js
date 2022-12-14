const { response, request } = require('express');
const Calendario = require('../models/Calendario');
const Evento = require('../models/Eventos');

//Obtiene un calendario mediante el ID enviado
const getCalendar = async (req = request, res = response) => {

    // Recibir el uid del usuario mediante el header
    const uid = req.header('uid');

    const { id } = req.params;

    try {

        //Pide los calendarios de un usuario mediante el uid enviado en el header
        var calendario = await Calendario.find()
            .where('_id').equals(id)//Compara el enviado con el del userPrimary
            .populate('userPrimary', 'name')
            .populate({
                path: 'calendarEvent.events',
                transform: (doc, id) => doc == null ? id : {
                    id: doc._id,
                    title: doc.title,
                    notes: doc.notes,
                    start: doc.start,
                    end: doc.end,
                    style: doc.style,
                    user: doc.user,
                },
                populate: {
                    path: 'user',
                    transform: (doc, id) => doc == null ? id : { uid: id, name: doc.name },
                }
            })
            .populate({
                path: 'calendarEvent.users.user',
                transform: (doc, id) => doc == null ? id : { uid: doc._id, name: doc.name, accept: doc.accept }
            });

        return res.status(200).json({
            ok: true,
            calendario
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador...."
        })
    }

}
//Obtiene todos los eventos del calendario
const getEventsToCalendar = async (req = request, res = response) => {

    try {

        const { id } = req.params;

        //Se busca y se actualiza con el nuevo dato
        const calendario = await Calendario.findById(id)
            .populate({
                path: 'calendarEvent.events',
                transform: (doc, id) => doc == null ? id : {
                    id: doc._id,
                    title: doc.title,
                    notes: doc.notes,
                    start: doc.start,
                    end: doc.end,
                    style: doc.style,
                    user: doc.user,
                },
                populate: {
                    path: 'user',
                    transform: (doc, id) => doc == null ? id : { uid: id, name: doc.name },
                }
            });

        res.json({
            ok: true,
            calendario
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador...."
        })
    }
}
//Obtiene todos los calendarios del usuario
const getCalendarEvent = async (req = request, res = response) => {

    // Recibir el uid del usuario mediante el header
    const uid = req.header('uid');

    try {

        //Pide los calendarios de un usuario mediante el uid enviado en el header
        var calendario = await Calendario.find()
            //* Busca los calendarios del usuario y los calendarios en los que esta sincronizado
            //* que son de otros usuarios
            .or([{ 'calendarEvent.users.user': uid }, { 'userPrimary': uid }])
            .populate('userPrimary', 'name')
            .populate({
                path: 'calendarEvent.events',
                transform: (doc, id) => doc == null ? id : {
                    id: doc._id,
                    title: doc.title,
                    notes: doc.notes,
                    start: doc.start,
                    end: doc.end,
                    style: doc.style,
                    user: doc.user,
                },
                populate: {
                    path: 'user',
                    transform: (doc, id) => doc == null ? id : { uid: id, name: doc.name },
                }
            })
            .populate({
                path: 'calendarEvent.users.user',
                transform: (doc, id) => doc == null ? id : { uid: doc._id, name: doc.name, accept: doc.accept }
            });

        return res.status(200).json({
            ok: true,
            calendario
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador...."
        })
    }
}
//Crea nuevos calendarios
const newCalendarEvent = async (req, res = response) => {

    //Debe venir un uid en el header que sera como un token igual de principal
    const calendario = new Calendario(req.body);;

    try {

        const calendarioGuardado = await calendario.save();

        const calendarioBusqueda = await Calendario.findOne()
            .where('_id').equals(calendarioGuardado.id)
            .populate('userPrimary', 'name')
            .populate({
                path: 'calendarEvent.events',
                transform: (doc, id) => doc == null ? id : {
                    id: doc._id,
                    title: doc.title,
                    notes: doc.notes,
                    start: doc.start,
                    end: doc.end,
                    style: doc.style,
                    user: doc.user,
                },
                populate: {
                    path: 'user',
                    transform: (doc, id) => doc == null ? id : { uid: doc.id, name: doc.name },
                }
            })
            .populate({
                path: 'calendarEvent.users.user',
                transform: (doc, id) => doc == null ? id : { uid: doc._id, name: doc.name, accept: doc.accept }
            });

        res.json({
            ok: true,
            calendario: calendarioBusqueda
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador...."
        })
    }
}
//Agrega un calendario nuevo al evento
const addNewEventToCalendar = async (req = request, res = response) => {

    const evento = new Evento(req.body);

    //*Buscamos el calendario si existe, despues agregamos el evento en EventoBD
    //*Obtenemos el ID y lo agregamos al calendario que encontramos
    //*Hacemos una busqueda del calendario, si existe se modifica y se saca el id una vez modificado
    //*Una vez hecho eso, hacemos otra busqueda de si existe no hacemos nada
    try {

        //*Para guardar la informacion del Evento y su usuario que lo creo
        evento.user = req.uid;

        //*Guardamos el evento y obtenemos el dato guardado con su nuevo ID del evento
        const eventoGuardado = await evento.save();

        //*Obtenemos el id del CALENDARIO que vendra mediante un parametro
        const { id } = req.params;

        //*Verificamos si existe ese calendario, si existe lo obtenemos
        const calendario = await Calendario.findById(id)
            .populate({
                path: 'userPrimary',
                transform: (doc, id) => doc == null ? id : doc.id
            })
            .populate({
                path: 'calendarEvent.events',
                transform: (doc, id) => doc == null ? id : doc.id
            })
            .populate({
                path: 'calendarEvent.users.user',
                transform: (doc, id) => doc == null ? id : { uid: doc.id, accept: doc.accept }
            });

        //*Sino existe returnamos que no existe
        if (!calendario) {
            return res.status(404).json({
                ok: false,
                msg: 'Calendario no existe por ese Id'
            })
        }

        //*Si existe el calendario lo unico que habria que hacer seria agregar ese nuevo evento 
        //*En el arreglo de eventos
        var eventsList
        if (calendario.calendarEvent.events.length > 0) {
            eventsList = [...calendario.calendarEvent.events, eventoGuardado.id]
        } else {
            eventsList = [eventoGuardado.id];
        }

        //*Modificamos el calendario para que reciba solos los IDS necesarios
        const calendarioUpdateDB = {
            CalendarId: calendario.id,
            userPrimary: calendario.userPrimary,
            calendarEvent: {
                nameCalendarEvent: calendario.calendarEvent.nameCalendarEvent,
                users: (calendario.calendarEvent.users.length > 0)
                    ? calendario.calendarEvent.users.map(user => {
                        return {
                            accept: user.accept,
                            user: user.user.uid
                        }
                    }) : [],
                events: eventsList
            }
        }

        //*Una vez modificado lo guardamos luego obtenemos el calendario de vuelta 
        //*con todos sus valores editados
        const calendarUpdate = await Calendario.findByIdAndUpdate(
            id, calendarioUpdateDB, { new: true }
        ).populate('userPrimary', 'name')
            .populate({
                path: 'calendarEvent.events',
                transform: (doc, id) => doc == null ? id : {
                    id: doc._id,
                    title: doc.title,
                    notes: doc.notes,
                    start: doc.start,
                    end: doc.end,
                    style: doc.style,
                    user: doc.user,
                },
                populate: {
                    path: 'user',
                    transform: (doc, id) => doc == null ? id : { uid: doc.id, name: doc.name },
                }
            })
            .populate({
                path: 'calendarEvent.users.user',
                transform: (doc, id) => doc == null ? id : { uid: doc._id, name: doc.name, accept: doc.accept }
            });

        res.json({
            ok: true,
            calendario: calendarUpdate
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador...."
        })
    }
}
//Actualizamos el calendario
const updateCalendar = async (req = request, res = response) => {

    try {

        const { id } = req.params;

        //Primero se busca si ese calendario existe
        const calendario = await Calendario.findById(id);

        if (!calendario) {
            return res.status(404).json({
                ok: false,
                msg: 'Calendario no existe por ese Id'
            })
        }

        //Se busca y se actualiza con el nuevo dato
        const calendarioUpdate = await Calendario.findByIdAndUpdate(
            id, { ...req.body }, { new: true }
        ).populate('userPrimary', 'name')
            .populate({
                path: 'calendarEvent.events',
                transform: (doc, id) => doc == null ? id : {
                    id: doc._id,
                    title: doc.title,
                    notes: doc.notes,
                    start: doc.start,
                    end: doc.end,
                    style: doc.style,
                    user: doc.user,
                },
                populate: {
                    path: 'user',
                    transform: (doc, id) => doc == null ? id : { uid: id, name: doc.name },
                }
            })
            .populate({
                path: 'calendarEvent.users.user',
                transform: (doc, id) => doc == null ? id : { uid: doc._id, name: doc.name, accept: doc.accept }
            });

        res.json({
            ok: true,
            calendario: calendarioUpdate
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador...."
        })
    }
}
//Eliminar un calendario
const deleteCalendarEvent = async (req = request, res = response) => {

    // Recibir el uid del usuario mediante el header
    const uid = req.header('uid');

    // Se envia mediante el url
    const { id } = req.params;

    try {

        const calendario = await Calendario.findById(id);

        if (!calendario) {
            return res.status(404).json({
                ok: false,
                msg: 'Calendario no existe por ese Id'
            });
        }

        if (uid !== calendario.userPrimary.toString()) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene privilegio de eliminar este Calendario'
            })
        }

        const eventos = calendario.calendarEvent.events;
        //*Eliminamos el arreglo de elementos del calendario

        if (eventos.length > 0) {
            for (let i = 0; i < eventos.length; i++) {
                await Evento.findByIdAndDelete(eventos[i]);
            }
        }

        //*Eliminamos el calendario, una vez eliminado los eventos
        await Calendario.findByIdAndDelete(id);

        res.json({ ok: true });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador...."
        })
    }
}

module.exports = {
    getCalendarEvent,
    newCalendarEvent,
    deleteCalendarEvent,
    updateCalendar,
    addNewEventToCalendar,
    getCalendar,
    getEventsToCalendar,
}