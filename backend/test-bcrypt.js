const bcrypt = require('bcryptjs');
const hash = process.argv[1];
const plain = process.argv[2];
console.log('Hash received:', hash);
console.log('Plain:', plain);
console.log('Match:', bcrypt.compareSync(plain, hash));
