
//? Rutas de usuarios / Auth
//? host + /api/auth

const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { crearUsuario, loginUsuario, revalidarToken, getUsuario } = require('../controllers/auth')
const { validarJWT } = require('../middlewares/validar-jwt')
const router = Router();

//Variables de validacion
const emailValidation = check('email', 'El Email es obligatorio').isEmail();
const passwordValidation = check('password', 'El password debe ser de 6 caracteres').isLength({ min: 6 })

router.post(
    '/new',
    [ //midlewares
        check('name', 'El nombre es obligatorio').not().notEmpty(),
        emailValidation,
        passwordValidation,
        validarCampos
    ],
    crearUsuario
)

router.post(
    '/',
    [ //midlewares
        emailValidation,
        passwordValidation,
        validarCampos
    ],
    loginUsuario
)

router.get('/renew', validarJWT, revalidarToken);

router.get('/:email', validarJWT, getUsuario);


module.exports = router