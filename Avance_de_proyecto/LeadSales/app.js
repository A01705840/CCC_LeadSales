const express = require('express');
const router = express.Router();

require('dotenv').config();

const app = express();

app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', 'views');

const session = require('express-session');
app.use(session({
  secret: 'mi string secreto que debe ser un string aleatorio muy largo, no como éste', 
  resave: false, //La sesión no se guardará en cada petición, sino sólo se guardará si algo cambió 
  saveUninitialized: false, //Asegura que no se guarde una sesión para una petición que no lo necesita
}));


// Configura Express para servir archivos estáticos desde el directorio 'public'
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

//Body parser 
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));


//Middleware
app.use((request, response, next) => {
  console.log('Middleware!');
  next(); //Le permite a la petición avanzar hacia el siguiente middleware
});

const cookieParser = require('cookie-parser');
app.use(cookieParser());

//Protección contra ataques de CSRF

const multer = require('multer');

//
const csv = require('fast-csv');


//fileStorage: Es nuestra constante de configuración para manejar el almacenamiento
const fileStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        
        //'public/uploads': Es el directorio del servidor donde se subirán los archivos 
        callback(null, 'public/uploads');
    },
    filename: (request, file, callback) => {
        //aquí configuramos el nombre que queremos que tenga el archivo en el servidor, 
        //para que no haya problema si se suben 2 archivos con el mismo nombre concatenamos el timestamp
        callback(null, file.originalname);
    },
});


app.use(multer({ storage: fileStorage}).single('csv')); 

const rutasUsuarios = require('./routes/usuarios.routes');
app.use('/Usuario', rutasUsuarios);
app.use('/', rutasUsuarios);

const rutasSignup = require('./routes/usuarios.routes');
app.use('/Usuario', rutasSignup);

const rutasPrivilegios= require('./routes/privilegios.routes');
app.use('/privilegios', rutasPrivilegios);

const rutasRoles = require('./routes/roles.routes');
app.use('/Roles', rutasRoles);

const rutasLeads = require('./routes/leads.routes');
app.use('/Lead', rutasLeads);


app.use((request, response, next) => {
  response.status(404);
  console.log('404 ERROR');
  response.render(path.join(__dirname, 'views', '404.ejs')); //Manda la respuesta
});

module.exports = router;


app.listen(3000);
