const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Acceso denegado.' });
    }

    try {
        // Buscar al usuario por username
        const usuario = await Usuario.findOne({ username: username.toLowerCase() });
        
        if (!usuario) {
            return res.status(401).json({ error: 'Acceso denegado.' }); // Ocultamos que el usuario no existe por seguridad
        }

        // Comparar el hash almacenado con la contraseña ingresada
        const match = await bcrypt.compare(password, usuario.passwordHash);

        if (match) {
            // Login exitoso
            // Nota: En una app real de producción generaríamos un JWT token aquí.
            // Para la Entrega 3 validamos la criptografía de base de datos exitosamente.
            res.json({
                success: true,
                role: usuario.role,
                displayName: usuario.displayName
            });
        } else {
            // Login fallido
            res.status(401).json({ error: 'Acceso denegado.' });
        }
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error del servidor en autenticación' });
    }
});

module.exports = router;
