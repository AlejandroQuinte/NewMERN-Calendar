//*se vuelve a invocar para que tenga el intelligence
const { response } = require('express')
const { generarJWT } = require('../helpers/jwt');

//para encriptar
const bcrypt = require('bcryptjs')

const Usuario = require('../models/Usuario');

const getUsuario = async (req, res = response) => {

    const { email } = req.params;

    try {

        let usuario = await Usuario.findOne({ email });

        if (usuario) {
            return res.status(200).json({
                ok: true,
                user: {
                    uid: usuario._id,
                    name: usuario.name,
                    email: usuario.email
                }
            })
        }

        res.status(404).json({
            ok: false,
            msg: "Usuario no existe"
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador',
        })
    }

}

const crearUsuario = async (req, res = response) => {

    const { email, password } = req.body;

    try {
        let usuario = await Usuario.findOne({ email });

        if (usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'Un usuario existe con ese correo',
            })
        }

        usuario = new Usuario(req.body);


        //*Encriptar password
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);

        //*Guardar usuario
        await usuario.save();

        //?Generar JWT
        const token = await generarJWT(usuario.id, usuario.name);

        //no se debe ejecutar la respuesta 2 veces, asegurar que lo que se envie sea solo una vez
        //?201 es para se agrego correctamente
        res.status(201).json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            token
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador',
        })
    }
}

const loginUsuario = async (req, res = response) => {

    try {

        const { email, password } = req.body;

        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe con ese email',
            })
        }

        //?Confirmar los passwords
        const validPassword = bcrypt.compareSync(password, usuario.password);

        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Password incorrecto',
            })
        }

        //?Generar nuestro JWT
        const token = await generarJWT(usuario.id, usuario.name);

        res.status(200).json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            token
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador',
        })
    }

}

const revalidarToken = async (req, res = response) => {

    const { uid, name } = req;

    //generar un nuevo jwt y retornarlo en esta peticion

    const token = await generarJWT(uid, name);

    res.json({
        ok: true,
        uid,
        name,
        token
    })
}



module.exports = {
    crearUsuario,
    loginUsuario,
    revalidarToken,
    getUsuario,
}

