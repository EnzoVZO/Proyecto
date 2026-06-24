const express = require('express');
const router = express.Router();
const LogAuditoria = require('../models/LogAuditoria');

// GET: Obtener el log de auditoría con paginación
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;

        const total = await LogAuditoria.countDocuments();
        const logs = await LogAuditoria.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        
        // Mapear para la tabla del frontend
        const data = logs.map(log => ({
            fecha: log.createdAt.toISOString(),
            usuario: log.usuario,
            perfil: log.perfil,
            accion: log.accion,
            detalle: log.detalle,
            ip: log.ip // Esto llegará desencriptado gracias al plugin, pero en la DB está seguro.
        }));

        res.json({
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit) || 1
        });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo auditoria' });
    }
});

module.exports = router;
