require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Usuario = require('./models/Usuario');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/calificaciones_tributarias_db';

async function seedUsuarios() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('[INFO] Conectado a MongoDB para Seed de Auth');

        // Limpiar usuarios anteriores si existen para hacer una inserción limpia
        await Usuario.deleteMany({});
        console.log('[INFO] Coleccion de usuarios limpiada.');

        // Encriptar las contraseñas base usando Bcrypt (Salt de 10 rondas)
        const saltRounds = 10;
        
        // Usuario Admin
        const adminPass = await bcrypt.hash('Admin123', saltRounds);
        // Usuario Corredor
        const corredorPass = await bcrypt.hash('Corredor123', saltRounds);

        await Usuario.create([
            {
                username: 'admin',
                passwordHash: adminPass,
                role: 'admin',
                displayName: 'Administrador Bolsa (Nuam)'
            },
            {
                username: 'corredor',
                passwordHash: corredorPass,
                role: 'corredor',
                displayName: 'Corredor Externo'
            }
        ]);

        console.log('[EXITO] Usuarios base inyectados correctamente con contrasenas encriptadas.');
        process.exit(0);
    } catch (error) {
        console.error('[ERROR] Error en el Seed:', error);
        process.exit(1);
    }
}

seedUsuarios();
