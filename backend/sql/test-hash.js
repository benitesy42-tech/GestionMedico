const bcrypt = require('bcryptjs');

const hashes = [
  { pw: 'admin123', hash: '$2b$10$DW25pjba54e6kg/A67yOAu2jJT9t6H04V0vfM4uI21WVZkDiikEwK' },
  { pw: 'recepcion123', hash: '$2b$10$ShjxAE4rXy42AJvJ.zdd4uMvfzGBAeFOnNNZVjaNu/LF.WkZ2Yjgi' },
  { pw: 'medico123', hash: '$2b$10$ZhpJxcUekfpQBbmZmpt3zOwEjOnsngYXWBW9SOw6U8AQh9YOhEO6K' },
  { pw: 'medico123', hash: '$2b$10$FG2IBuDZjmOmR2RhweG19O7jO5467piPQur1bbpIlmJr.FOx.0Mze' },
  { pw: 'paciente123', hash: '$2b$10$0YWwk9/MRNJ.D9Gu5Xff1.XMw0l6fsGArLXshgwdzcY9zi7bOtcVS' },
  { pw: 'paciente123', hash: '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9Rn6bm1FZwOJK3v0pMl0YqPPu' },
];

(async () => {
  for (const h of hashes) {
    const match = await bcrypt.compare(h.pw, h.hash);
    console.log(`${h.pw} => ${h.hash.substring(0, 20)}... = ${match}`);
  }
})();
