require('dotenv').config();
const mongoose = require('mongoose');
const Calificacion = require('./models/Calificacion');
const LogAuditoria = require('./models/LogAuditoria');

async function cleanDB() {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/calificaciones_tributarias_db';
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Conectado a la base de datos...');
        
        const deleteCals = await Calificacion.deleteMany({});
        console.log(`Borradas ${deleteCals.deletedCount} calificaciones de prueba.`);
        
        const deleteLogs = await LogAuditoria.deleteMany({});
        console.log(`Borrados ${deleteLogs.deletedCount} logs de auditoria de prueba.`);
        
        console.log('Base de datos limpiada correctamente.');
        process.exit(0);
    } catch (error) {
        console.error('Error limpiando la BD:', error);
        process.exit(1);
    }
}

cleanDB();
