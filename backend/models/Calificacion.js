const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const calificacionSchema = new mongoose.Schema({
    ejercicio: { type: Number, required: true },
    mercado: { type: String, required: true },
    instrumento: { type: String, required: true },
    fecha_pago: { type: String, required: true },
    secuencia_evento: { type: String, required: true },
    origen: { type: String, enum: ['BOLSA', 'CORREDOR'], required: true },
    val_hist: { type: Number },
    dividendo: { type: Number, default: 0 },
    descripcion: { type: String },
    isfut: { type: Boolean, default: false },
    factor_act: { type: Number, default: 0 },
    estado: { type: String, enum: ['ACTIVO', 'ELIMINADO'], default: 'ACTIVO' },
    // Los factores como sub-documento (f8 a f37)
    factores: {
        f8: { type: Number, default: 0 },
        f9: { type: Number, default: 0 },
        f10: { type: Number, default: 0 },
        f11: { type: Number, default: 0 },
        f12: { type: Number, default: 0 },
        f13: { type: Number, default: 0 },
        f14: { type: Number, default: 0 },
        f15: { type: Number, default: 0 },
        f16: { type: Number, default: 0 },
        f17: { type: Number, default: 0 },
        f18: { type: Number, default: 0 },
        f19: { type: Number, default: 0 },
        f20: { type: Number, default: 0 },
        f21: { type: Number, default: 0 },
        f22: { type: Number, default: 0 },
        f23: { type: Number, default: 0 },
        f24: { type: Number, default: 0 },
        f25: { type: Number, default: 0 },
        f26: { type: Number, default: 0 },
        f27: { type: Number, default: 0 },
        f28: { type: Number, default: 0 },
        f29: { type: Number, default: 0 },
        f30: { type: Number, default: 0 },
        f31: { type: Number, default: 0 },
        f32: { type: Number, default: 0 },
        f33: { type: Number, default: 0 },
        f34: { type: Number, default: 0 },
        f35: { type: Number, default: 0 },
        f36: { type: Number, default: 0 },
        f37: { type: Number, default: 0 }
    }
}, { timestamps: true });

// ENCRIPTACIÓN EN REPOSO (DATA AT REST)
// Usamos mongoose-encryption para encriptar los montos de los factores y el origen.
// Nadie con acceso a la BD podrá ver los valores matemáticos reales.
const encKey = process.env.ENC_KEY;
const sigKey = process.env.SIG_KEY;

if (encKey && sigKey) {
    calificacionSchema.plugin(encrypt, {
        encryptionKey: encKey,
        signingKey: sigKey,
        encryptedFields: ['factores', 'origen']
    });
} else {
    console.warn('[ADVERTENCIA] No se encontraron ENC_KEY o SIG_KEY en el .env. Encriptacion desactivada.');
}

module.exports = mongoose.model('Calificacion', calificacionSchema);
