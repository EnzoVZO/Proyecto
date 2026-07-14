const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const calificacionSchema = new mongoose.Schema({
    ejercicio: { type: Number, required: true },
    mercado: { type: String, required: true },
    instrumento: { type: String, required: true },
    fecha_pago: { type: String, required: true },
    secuencia_evento: { type: String, required: true },
    origen: { type: String, enum: ['BOLSA', 'CORREDOR'], required: true },
    val_hist: { type: mongoose.Schema.Types.Decimal128 },
    dividendo: { type: mongoose.Schema.Types.Decimal128, default: 0 },
    descripcion: { type: String },
    isfut: { type: Boolean, default: false },
    factor_act: { type: mongoose.Schema.Types.Decimal128, default: 0 },
    estado: { type: String, enum: ['ACTIVO', 'ELIMINADO'], default: 'ACTIVO' },
    // Los factores como sub-documento (f8 a f37)
    factores: {
        f8: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f9: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f10: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f11: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f12: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f13: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f14: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f15: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f16: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f17: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f18: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f19: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f20: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f21: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f22: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f23: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f24: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f25: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f26: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f27: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f28: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f29: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f30: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f31: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f32: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f33: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f34: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f35: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f36: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        f37: { type: mongoose.Schema.Types.Decimal128, default: 0 }
    }
}, { timestamps: true });

// TRUCO SENIOR: Convertimos Decimal128 a Number normal cuando viaja al Frontend por JSON,
// de lo contrario Mongoose lo manda como objeto {"$numberDecimal": "1.0"} y rompe todo.
calificacionSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.val_hist && ret.val_hist.toString) ret.val_hist = parseFloat(ret.val_hist.toString());
    if (ret.dividendo && ret.dividendo.toString) ret.dividendo = parseFloat(ret.dividendo.toString());
    if (ret.factor_act && ret.factor_act.toString) ret.factor_act = parseFloat(ret.factor_act.toString());
    if (ret.factores) {
      for (let i = 8; i <= 37; i++) {
        let key = 'f' + i;
        if (ret.factores[key] && ret.factores[key].toString) {
          ret.factores[key] = parseFloat(ret.factores[key].toString());
        }
      }
    }
    return ret;
  }
});

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
