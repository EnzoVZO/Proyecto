const express = require('express');
const router = express.Router();
const Calificacion = require('../models/Calificacion');
const LogAuditoria = require('../models/LogAuditoria');

// Auxiliar para registrar auditoría desde el backend
async function auditar(accion, usuario, perfil, detalle, ip) {
    try {
        await LogAuditoria.create({ accion, usuario, perfil, detalle, ip });
    } catch (e) {
        console.error('Error al guardar auditoria:', e);
    }
}

// GET: Obtener todas las calificaciones activas
router.get('/', async (req, res) => {
    try {
        const calificaciones = await Calificacion.find({ estado: { $ne: 'ELIMINADO' } }).sort({ createdAt: -1 });
        res.json(calificaciones);
    } catch (error) {
        console.error('GET Error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// GET: Obtener solo las calificaciones eliminadas (Admin)
router.get('/eliminados', async (req, res) => {
    try {
        const calificaciones = await Calificacion.find({ estado: 'ELIMINADO' }).sort({ updatedAt: -1 });
        res.json(calificaciones);
    } catch (error) {
        console.error('GET Error:', error);
        res.status(500).json({ error: 'Error obteniendo calificaciones eliminadas' });
    }
});

// POST: Grabar Carga Masiva o Ingreso (Con Regla de Prevalencia)
router.post('/grabar', async (req, res) => {
    const { datos, usuario, perfil } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!Array.isArray(datos) || datos.length === 0) {
        return res.status(400).json({ error: 'Sin datos previsualizados.' });
    }

    let insertados = 0;
    let rechazados = 0;
    let actualizados = 0;
    let omitidos = 0;

    try {
        const batchSize = 50;
        for (let i = 0; i < datos.length; i += batchSize) {
            const batch = datos.slice(i, i + batchSize);
            await Promise.all(batch.map(async (newRow) => {
                // Regla de Prevalencia
                const existe = await Calificacion.findOne({
                    ejercicio: newRow.ej,
                    mercado: newRow.mercado || newRow.ori, // Fallback por formato CSV
                    instrumento: newRow.ins,
                    secuencia_evento: newRow.sec
                });

                if (existe) {
                    if (existe.origen === 'CORREDOR' && newRow.ori === 'BOLSA') {
                        rechazados++;
                        await auditar('RECHAZO_REGLA', usuario, perfil, `Bolsa intentó sobreescribir registro de Corredor: ${newRow.ins}`, ip);
                    } else {
                        // Verificar si es exactamente idéntico
                        let esIdentico = true;
                        if (existe.estado === 'ELIMINADO') esIdentico = false;
                        if (existe.origen !== newRow.ori) esIdentico = false;
                        if (existe.fecha_pago !== newRow.fp) esIdentico = false;
                        if (existe.val_hist !== newRow.vh) esIdentico = false;
                        if (existe.descripcion !== (newRow.desc || newRow.descripcion || '')) esIdentico = false;
                        
                        if (esIdentico) {
                            for (let f=8; f<=37; f++) {
                                const fValue = newRow['f'+f] || 0;
                                if (Number(existe.factores['f'+f]).toFixed(8) !== Number(fValue).toFixed(8)) {
                                    esIdentico = false;
                                    break;
                                }
                            }
                        }

                        if (esIdentico) {
                            omitidos++;
                        } else {
                            // Actualizar o Reactivar
                            existe.estado = 'ACTIVO';
                            existe.origen = newRow.ori;
                            existe.fecha_pago = newRow.fp;
                            existe.val_hist = newRow.vh;
                            existe.descripcion = newRow.desc || newRow.descripcion || '';
                            existe.dividendo = newRow.dividendo || 0;
                            existe.isfut = newRow.isfut || false;
                            existe.factor_act = newRow.factor_act || 0;
                            existe.factores = {
                                f8: newRow.f8 || 0,
                                f9: newRow.f9 || 0,
                                f10: newRow.f10 || 0,
                                f11: newRow.f11 || 0,
                                f12: newRow.f12 || 0,
                                f13: newRow.f13 || 0,
                                f14: newRow.f14 || 0,
                                f15: newRow.f15 || 0,
                                f16: newRow.f16 || 0,
                                f17: newRow.f17 || 0,
                                f18: newRow.f18 || 0,
                                f19: newRow.f19 || 0,
                                f20: newRow.f20 || 0,
                                f21: newRow.f21 || 0,
                                f22: newRow.f22 || 0,
                                f23: newRow.f23 || 0,
                                f24: newRow.f24 || 0,
                                f25: newRow.f25 || 0,
                                f26: newRow.f26 || 0,
                                f27: newRow.f27 || 0,
                                f28: newRow.f28 || 0,
                                f29: newRow.f29 || 0,
                                f30: newRow.f30 || 0,
                                f31: newRow.f31 || 0,
                                f32: newRow.f32 || 0,
                                f33: newRow.f33 || 0,
                                f34: newRow.f34 || 0,
                                f35: newRow.f35 || 0,
                                f36: newRow.f36 || 0,
                                f37: newRow.f37 || 0
                            };
                            await existe.save();
                            actualizados++;
                            await auditar('MODIFICAR', usuario, perfil, `Actualización: ${newRow.ins}`, ip);
                        }
                    }
                } else {
                    // Insertar nuevo
                    const nuevaCalificacion = new Calificacion({
                        ejercicio: newRow.ej,
                        mercado: newRow.mercado || newRow.ori,
                        instrumento: newRow.ins,
                        fecha_pago: newRow.fp,
                        secuencia_evento: newRow.sec,
                        origen: newRow.ori,
                        descripcion: newRow.desc || newRow.descripcion || '',
                        val_hist: newRow.vh,
                        dividendo: newRow.dividendo || 0,
                        isfut: newRow.isfut || false,
                        factor_act: newRow.factor_act || 0,
                        factores: {
                            f8: newRow.f8 || 0,
                            f9: newRow.f9 || 0,
                            f10: newRow.f10 || 0,
                            f11: newRow.f11 || 0,
                            f12: newRow.f12 || 0,
                            f13: newRow.f13 || 0,
                            f14: newRow.f14 || 0,
                            f15: newRow.f15 || 0,
                            f16: newRow.f16 || 0,
                            f17: newRow.f17 || 0,
                            f18: newRow.f18 || 0,
                            f19: newRow.f19 || 0,
                            f20: newRow.f20 || 0,
                            f21: newRow.f21 || 0,
                            f22: newRow.f22 || 0,
                            f23: newRow.f23 || 0,
                            f24: newRow.f24 || 0,
                            f25: newRow.f25 || 0,
                            f26: newRow.f26 || 0,
                            f27: newRow.f27 || 0,
                            f28: newRow.f28 || 0,
                            f29: newRow.f29 || 0,
                            f30: newRow.f30 || 0,
                            f31: newRow.f31 || 0,
                            f32: newRow.f32 || 0,
                            f33: newRow.f33 || 0,
                            f34: newRow.f34 || 0,
                            f35: newRow.f35 || 0,
                            f36: newRow.f36 || 0,
                            f37: newRow.f37 || 0
                        }
                    });
                    await nuevaCalificacion.save();
                    insertados++;
                    await auditar('INSERTAR', usuario, perfil, `Nuevo registro: ${newRow.ins}`, ip);
                }
            }));
        }

        res.json({ insertados, rechazados, actualizados, omitidos });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en transacción BD.' });
    }
});

// DELETE: Eliminar calificación (Borrado Lógico)
router.delete('/:id', async (req, res) => {
    try {
        const { usuario, perfil } = req.body;
        const cal = await Calificacion.findById(req.params.id);
        if(!cal) return res.status(404).json({error: 'No encontrado'});
        
        cal.estado = 'ELIMINADO';
        await cal.save();
        await auditar('ELIMINAR', usuario, perfil, `Borrado Lógico (Oculto): ${cal.instrumento}`, req.ip);
        
        res.json({ message: 'Ocultado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando' });
    }
});

module.exports = router;
