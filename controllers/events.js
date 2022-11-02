const { response, request } = require('express')
const Evento = require('../models/Eventos');


const getEventos = async (req, res = response) => {
    const eventos = await Evento.find().populate('user', 'name');

    res.status(201).json({
        ok: true,
        eventos
    })
}

const getEventosUser = async (req = request, res = response) => {

    try {

        //el dato se obtiene del header porque para un getter no se obtiene datos
        //entonces la forma de poder colocar un valor seria mediante el header
        const uid = req.header('uid');

        //? Devuelve el dato con el id del usuario 
        const eventos = await Evento.find().populate('user', 'name').where('user').equals(uid);

        res.status(200).json({
            ok: true,
            eventos
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador...."
        })
    }
}

const getEventosListUsers = async (req = request, res = response) => {

    try {

        const { uids } = req.body;

        console.log(uids)

        //? Devuelve el dato con el id del usuario 
        var eventos = [];

        for (let i = 0; i < uids.length; i++) {
            eventos = eventos.concat(await Evento.find().populate('user', 'name').where('user').equals(uids[i]));
        }

        //eventos = eventos.concat(await Evento.find().populate('user', 'name').where('user').equals(users.uids[1]))


        res.status(200).json({
            ok: true,
            eventos
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador...."
        })
    }
}

const crearEvento = async (req, res = response) => {

    const evento = new Evento(req.body);

    try {

        //para guardar la informacion del usuario
        evento.user = req.uid;

        //console.log(evento)

        const eventoGuardado = await evento.save();

        res.json({
            ok: true,
            evento: eventoGuardado
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: "Hable con el administrador...."
        })
    }
}

const ActualizarEvento = async (req = request, res = response) => {

    const { id } = req.params;
    const uid = req.uid

    try {

        const evento = await Evento.findById(id);

        if (!evento) {
            return res.status(404).json({
                ok: false,
                msg: 'Evento no existe por ese Id'
            })
        }

        if (evento.user.toString() !== uid) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene privilegio de editar este evento'
            })
        }

        const nuevoEvento = {
            ...req.body,
            user: uid
        }
        //retorna el dato anterior antes de la actualizacion si desea que regresa el nuevo dato
        //debe colocar un tercer argumento
        const eventoActualizado = await Evento.findByIdAndUpdate(id, nuevoEvento, { new: true });

        res.json({
            ok: true,
            evento: eventoActualizado
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }
}

const eliminarEvento = async (req, res = response) => {
    const { id } = req.params;
    const uid = req.uid

    try {

        const evento = await Evento.findById(id);

        if (!evento) {
            return res.status(404).json({
                ok: false,
                msg: 'Evento no existe por ese Id'
            })
        }

        if (evento.user.toString() !== uid) {
            return res.status(401).json({
                ok: false,
                msg: 'No tiene privilegio de eliminar este evento'
            })
        }
        //retorna el dato anterior antes de la actualizacion si desea que regresa el nuevo dato
        //debe colocar un tercer argumento
        await Evento.findByIdAndDelete(id);

        res.json({ ok: true })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }
}


module.exports = {
    getEventos,
    crearEvento,
    ActualizarEvento,
    eliminarEvento,
    getEventosUser,
    getEventosListUsers,
}