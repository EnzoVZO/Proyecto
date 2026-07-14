require('dotenv').config();
const mongoose = require('mongoose');
const Calificacion = require('./models/Calificacion');

async function seedPendientes() {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/calificaciones_tributarias_db';
        await mongoose.connect(MONGO_URI);
        console.log('Conectado a la base de datos...');
        
        const pendientes = [];
        for (let i = 1; i <= 5; i++) {
            pendientes.push({
                ejercicio: 2024,
                mercado: 'ACCIONES',
                instrumento: `PEND_${i}`,
                fecha_pago: '01-01-2024',
                secuencia_evento: `1000${i}`,
                origen: 'BOLSA',
                val_hist: 5000 + i,
                factor_act: 0,
                factores: {}
            });
        }
        
        for (let p of pendientes) {
            await new Calificacion(p).save();
        }
        console.log('Insertados 5 registros PENDIENTES con éxito.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
seedPendientes();
