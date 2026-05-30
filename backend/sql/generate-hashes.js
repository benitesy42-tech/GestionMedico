const bcrypt = require('bcryptjs');

async function generate() {
  const passwords = [
    { label: 'admin123', password: 'admin123' },
    { label: 'recepcion123', password: 'recepcion123' },
    { label: 'medico123', password: 'medico123' },
    { label: 'paciente123', password: 'paciente123' },
  ];

  console.log('=== GENERAR HASHES PARA EL SEED ===\n');
  console.log('Copia estos hashes al archivo seed.sql:\n');

  for (const p of passwords) {
    const hash = await bcrypt.hash(p.password, 10);
    console.log(`Password: ${p.password}`);
    console.log(`Hash:     ${hash}`);
    console.log();
  }

  console.log('=== INSTRUCCIONES ===');
  console.log('1. Reemplaza los hashes en seed.sql con los generados arriba');
  console.log('2. Luego ejecuta: node src/index.js');
}

generate().catch(console.error);
