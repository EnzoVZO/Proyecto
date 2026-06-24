const fs = require('fs');
const path = require('path');

const headers = [
    'ejercicio', 'mercado', 'nemo', 'fecha', 'descripcion', 'secuencia', 'val_hist', 'dividendo', 'isfut', 'f_act'
];
for(let i=8; i<=37; i++) headers.push('f'+i);

function generateMontoData(count, isValid) {
    let rows = [headers.join(';')];
    for(let i=0; i<count; i++) {
        let ejercicio = 2024;
        let mercado = 'AC';
        let nemo = 'EMPRESA' + (i % 10);
        let fecha = '10-06-2024';
        let desc = 'Dividendo ' + i;
        let secuencia = isValid ? (10001 + i) : (9990 + i); // Invalid sequences if !isValid
        let val_hist = isValid ? (1000 + Math.random()*5000).toFixed(2) : (i % 10 === 0 ? 0 : 5000); // Some 0 val_hist if !isValid
        let dividendo = 0;
        let isfut = 'no';
        let f_act = '0';
        
        let rowData = [ejercicio, mercado, nemo, fecha, desc, secuencia, val_hist, dividendo, isfut, f_act];
        
        for(let j=8; j<=37; j++) {
            if(isValid) {
                // If valid, keep the sum F8-F16 < 1. 
                // Since this is Montos, the sum of f8-f16 * factors / val_hist < 1.
                // We'll just put random small amounts
                if (j <= 16) {
                    rowData.push( Math.floor(Math.random() * 10) ); // Tiny amounts so factor sum is definitely < 1
                } else {
                    rowData.push( Math.floor(Math.random() * 100) );
                }
            } else {
                // If invalid, let's put huge amounts for F8-F16 so it breaks the < 1 rule
                if (j <= 16 && i % 5 === 0) {
                    rowData.push( val_hist * 2 ); // Factor will be 2.0, breaks rule
                } else {
                    rowData.push(0);
                }
            }
        }
        
        // Let's add a few completely broken format errors if invalid
        if (!isValid && i % 100 === 0) {
            rowData[2] = ''; // Missing Nemo
        }
        if (!isValid && i % 50 === 0) {
            rowData[6] = 'LETRAS'; // val_hist as string
        }

        rows.push(rowData.join(';'));
    }
    return rows.join('\n');
}

fs.writeFileSync(path.join(__dirname, 'montos_500_bueno.csv'), generateMontoData(500, true));
fs.writeFileSync(path.join(__dirname, 'montos_500_malo.csv'), generateMontoData(500, false));
console.log('Archivos generados con éxito.');
