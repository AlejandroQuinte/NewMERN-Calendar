
const express = require('express');
const { dbConnection } = require('./database/config');
require('dotenv').config()
const cors = require('cors')

//*crear el servidor de express
const app = express();

//*Base de datos
dbConnection();

//*Cors
app.use(cors())


//*Directorio Publico
app.use(express.static('public'));

//*Lectura y parseo del body
app.use(express.json());


//*Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));

app.use('/api/calendar', require('./routes/calendarEvents'));


//para que las rutas funcionen correctamente
app.get('*',(req,res)=>{
    res.sendFile(__dirname+ '/public/index.html');
});

//escuchar peticiones
app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en puerto ${process.env.PORT}`)
});