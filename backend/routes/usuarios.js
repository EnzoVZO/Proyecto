const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');

// GET: Obtener lista de usuarios (sin contraseña)
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-passwordHash');
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo usuarios' });
    }
});

// POST: Crear nuevo usuario
router.post('/', async (req, res) => {
    const { username, password, displayName, role } = req.body;

    if (!username || !password || !displayName || !role) {
        return res.status(400).json({ error: 'Faltan parámetros.' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    try {
        const existe = await Usuario.findOne({ username: username.toLowerCase() });
        if (existe) {
            return res.status(400).json({ error: 'Usuario ya registrado.' });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const nuevoUsuario = new Usuario({
            username: username.toLowerCase(),
            passwordHash,
            displayName,
            role
        });

        await nuevoUsuario.save();
        res.json({ success: true, message: 'Operación exitosa.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
});

// DELETE: Eliminar usuario
router.delete('/:id', async (req, res) => {
    try {
        const result = await Usuario.findByIdAndDelete(req.params.id);
        if (result) {
            res.json({ success: true, message: 'Usuario eliminado' });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
});

// PUT: Modificar usuario
router.put('/:id', async (req, res) => {
    const { displayName, role, password } = req.body;
    
    if (!displayName || !role) {
        return res.status(400).json({ error: 'Faltan parámetros.' });
    }

    try {
        const updateData = { displayName, role };

        // Si envían password, se valida y hashea
        if (password) {
            if (password.length < 8) {
                return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
            }
            const saltRounds = 10;
            updateData.passwordHash = await bcrypt.hash(password, saltRounds);
        }

        const result = await Usuario.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (result) {
            res.json({ success: true, message: 'Operación exitosa.' });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
});

module.exports = router;
