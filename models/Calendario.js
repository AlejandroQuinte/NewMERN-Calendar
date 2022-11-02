const { Schema, model } = require('mongoose');

const CalendarioSchema = Schema({
    userPrimary: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    calendarEvent: {
        nameCalendarEvent:{
            type: String,
            required:true
        },
        users: [{
            accept:{
                type: String,
                required: true,
            },
            user:{
                type: Schema.Types.ObjectId,
                ref: 'Usuario',
                required: true
            }
        }],
        events: [{
            type: Schema.Types.ObjectId,
            ref: 'Evento',
            required: true
        }]
    }
})

CalendarioSchema.method('toJSON', function () {
    //*Es para retornar el objeto pero solo como id, en la base de datos se guarda bien
    //*pero cuando se recupera se recupera de esta forma
    const { __v, _id, ...object } = this.toObject();
    object.CalendarId = _id; 

    return object;
})


module.exports = model('Calendario', CalendarioSchema);



