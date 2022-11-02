const { Schema, model } = require('mongoose');

const EventoSchema = Schema({
    title: {
        type: String,
        required: true
    },
    notes: {
        type: String,
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    style: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
})

EventoSchema.method('toJSON', function () {
    //*Es para retornar el objeto pero solo como id, en la base de datos se guarda bien
    //*pero cuando se recupera se recupera de esta forma
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;

    //Cambio para que lo que retorna sea un uid en el usuario en vez de un _id
    //asi el uso en el fron end sea mas parejo
    object.user.uid=object.user._id;

    return object;
})


module.exports = model('Evento', EventoSchema);




