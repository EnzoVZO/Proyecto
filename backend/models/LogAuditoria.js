const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const logAuditoriaSchema = new mongoose.Schema({
    accion: { type: String, required: true },
    usuario: { type: String, required: true },
    perfil: { type: String, required: true },
    detalle: { type: String, required: true },
    ip: { type: String } // Dato sensible
}, { timestamps: true });

// ENCRIPTACIÓN EN REPOSO
// Encriptamos la IP para cumplir con normativas de privacidad (GDPR / Leyes locales)
const encKey = process.env.ENC_KEY;
const sigKey = process.env.SIG_KEY;

if (encKey && sigKey) {
    logAuditoriaSchema.plugin(encrypt, {
        encryptionKey: encKey,
        signingKey: sigKey,
        encryptedFields: ['ip']
    });
}

module.exports = mongoose.model('LogAuditoria', logAuditoriaSchema);
