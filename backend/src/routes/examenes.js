const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { createWorker } = require('tesseract.js');
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const pacienteDir = path.join(UPLOADS_DIR, `paciente_${req.body.ID_Paciente || 'tmp'}`);
        if (!fs.existsSync(pacienteDir)) {
            fs.mkdirSync(pacienteDir, { recursive: true });
        }
        cb(null, pacienteDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
        cb(null, name);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Formato no permitido. Solo PDF, JPG, PNG'), false);
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });

function getClientIp(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || 'unknown';
}

async function ejecutarOCR(rutaArchivo) {
    try {
        const worker = await createWorker('spa');
        const { data } = await worker.recognize(rutaArchivo);
        await worker.terminate();
        return { texto: data.text || '', confianza: data.confidence || 0 };
    } catch (err) {
        console.error('Error OCR:', err.message);
        return { texto: '', confianza: 0 };
    }
}

function extraerValoresNumericos(texto) {
    if (!texto) return [];
    const valores = [];
    const lineas = texto.split('\n');
    for (const linea of lineas) {
        const match = linea.match(/^([A-ZÁÉÍÓÚÑa-záéíóúñ\s]+)\s*:?\s*([<>]?\d+[.,]?\d*)\s*([a-zA-Z/%µ]+)?/);
        if (match) {
            const nombre = match[1].trim();
            const valorStr = match[2].replace(',', '.');
            const unidad = (match[3] || '').trim();
            const valorNum = parseFloat(valorStr);
            if (!isNaN(valorNum)) {
                valores.push({ nombre, valor: valorNum, unidad });
            }
        }
    }
    return valores;
}

async function compararConRangos(pool, valores) {
    for (const v of valores) {
        const result = await pool.query(
            `SELECT Rango_Minimo, Rango_Maximo, Limite_Critico_Inferior, Limite_Critico_Superior
             FROM Rango_Referencia WHERE Activo = TRUE AND LOWER(Nombre_Valor) = LOWER($1)`,
            [v.nombre]
        );
        if (result.rows.length > 0) {
            const r = result.rows[0];
            const rMin = parseFloat(r.rango_minimo);
            const rMax = parseFloat(r.rango_maximo);
            const critInf = r.limite_critico_inferior !== null ? parseFloat(r.limite_critico_inferior) : null;
            const critSup = r.limite_critico_superior !== null ? parseFloat(r.limite_critico_superior) : null;
            let estado = 'normal';
            if ((critInf !== null && v.valor < critInf) || (critSup !== null && v.valor > critSup)) {
                estado = 'critico';
            } else if (v.valor < rMin || v.valor > rMax) {
                estado = 'alterado';
            }
            v.rangoMinimo = rMin;
            v.rangoMaximo = rMax;
            v.estado = estado;
        }
    }
    return valores;
}

function determinarAlertaGeneral(valores) {
    if (valores.some(v => v.estado === 'critico')) return 'critico';
    if (valores.some(v => v.estado === 'alterado')) return 'borderline';
    return 'normal';
}

function autoDetectarTipoYEtiquetas(textoOCR) {
    if (!textoOCR) return { tipoSugerido: null, etiquetasSugeridas: [] };
    const t = textoOCR.toLowerCase();
    const etiquetas = [];

    if (/glucosa|hemoglobina|hematocrito|leucocito|plaqueta|eritrocito|serología|perfil.*lipídico|colesterol|triglicéridos/i.test(t)) {
        etiquetas.push('Sangre');
    }
    if (/orina|uroanálisis|urocultivo|sedimento|proteinuria|hematuria/i.test(t)) {
        etiquetas.push('Orina');
    }
    if (/radiograf[íi]a|rx|rayos\s*x|placa\s*de\s*t[óo]rax/i.test(t)) {
        etiquetas.push('RX');
    }
    if (/ecograf[íi]a|eco|ultrasonido|ecocardiograma|ecotomograf[íi]a/i.test(t)) {
        etiquetas.push('ECO');
    }
    if (/tomograf[íi]a|tac|tc\s*scan/i.test(t)) {
        etiquetas.push('TAC');
    }
    if (/resonancia|rmn|rm\s*|imagen\s*por\s*resonancia/i.test(t)) {
        etiquetas.push('RMN');
    }
    if (/microbiolog[íi]a|cultivo|antibiograma|baciloscopia|frotis/i.test(t)) {
        etiquetas.push('Microbiología');
    }
    if (/histopatolog[íi]a|biopsia|anatom[íi]a\s*patológica|citolog[íi]a/i.test(t)) {
        etiquetas.push('Histopatología');
    }
    if (/creatinina|urea|nitr[óo]geno|tfge|filtración\s*glomerular|proteinuria/i.test(t)) {
        etiquetas.push('Función Renal');
    }
    if (/alt|ast|ggt|transaminasa|bilirrubina|fosfatasa|alanina\s*aminotransferasa|aspartato\s*aminotransferasa|hepatitis|gamma\s*glutamil/i.test(t)) {
        etiquetas.push('Función Hepática');
    }
    if (/colesterol\s*total|hdl|ldl|triglicéridos|perfil\s*lipídico/i.test(t)) {
        etiquetas.push('Perfil Lipídico');
    }
    if (/tsh|t4\s*libre|t3|hormona\s*tir[oó]idea|prolactina|cortisol|estradiol|testosterona|fsh|lh|insulina|hormona/i.test(t)) {
        etiquetas.push('Hormonas');
    }
    const unique = [...new Set(etiquetas)];

    let tipoSugerido = null;
    if (unique.includes('RX') || unique.includes('ECO') || unique.includes('TAC') || unique.includes('RMN')) {
        tipoSugerido = `Imagen (${unique.find(e => ['RX','ECO','TAC','RMN'].includes(e))})`;
    } else if (unique.includes('Sangre')) {
        tipoSugerido = 'Sangre';
    } else if (unique.includes('Orina')) {
        tipoSugerido = 'Orina';
    } else if (unique.includes('Microbiología')) {
        tipoSugerido = 'Microbiología';
    } else if (unique.includes('Histopatología')) {
        tipoSugerido = 'Histopatología';
    } else if (unique.includes('Función Renal')) {
        tipoSugerido = 'Función Renal';
    } else if (unique.includes('Función Hepática')) {
        tipoSugerido = 'Función Hepática';
    } else if (unique.includes('Perfil Lipídico')) {
        tipoSugerido = 'Perfil Lipídico';
    } else if (unique.includes('Hormonas')) {
        tipoSugerido = 'Hormonas';
    }

    return { tipoSugerido, etiquetasSugeridas: unique };
}

async function generarResumenConGroq(textoOCR, valores, tipoExamen) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY || !textoOCR) {
        return { resumenMedico: null, resumenPaciente: null };
    }
    try {
        const { default: Groq } = await import('groq-sdk');
        const groq = new Groq({ apiKey: GROQ_API_KEY });
        const promptMedico = `Eres un médico especialista. Genera un resumen técnico conciso de este examen de laboratorio (Tipo: ${tipoExamen}). Enfócate en hallazgos relevantes, valores alterados e interpretación clínica breve.\n\nTEXTO DEL EXAMEN:\n${textoOCR}\n\nVALORES EXTRAÍDOS:\n${JSON.stringify(valores, null, 2)}\n\nResumen técnico:`;
        const promptPaciente = `Eres un médico explicando resultados a un paciente. Genera un resumen en lenguaje sencillo y claro, sin tecnicismos, explicando qué significa el resultado del examen.\n\nTEXTO DEL EXAMEN:\n${textoOCR}\n\nVALORES EXTRAÍDOS:\n${JSON.stringify(valores, null, 2)}\n\nResumen para el paciente:`;
        const [resMedico, resPaciente] = await Promise.all([
            groq.chat.completions.create({
                messages: [{ role: 'user', content: promptMedico }],
                model: 'llama-3.1-8b-instant',
                max_tokens: 500,
            }),
            groq.chat.completions.create({
                messages: [{ role: 'user', content: promptPaciente }],
                model: 'llama-3.1-8b-instant',
                max_tokens: 500,
            }),
        ]);
        return {
            resumenMedico: resMedico.choices[0]?.message?.content || null,
            resumenPaciente: resPaciente.choices[0]?.message?.content || null,
        };
    } catch (err) {
        console.error('Error generando resumen con Groq:', err.message);
        return { resumenMedico: null, resumenPaciente: null };
    }
}

router.post('/upload', authenticateToken, upload.single('archivo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Archivo requerido' });
        }
        const { ID_Paciente, ID_Consulta, Laboratorio, Fecha_Toma, Tipo_Examen, Es_Sensible, Notas } = req.body;
        if (!ID_Paciente) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Paciente requerido' });
        }
        const etiquetas = req.body.Etiquetas ? JSON.parse(req.body.Etiquetas) : [];
        const esSensible = Es_Sensible === 'true' || Es_Sensible === true;
        const result = await pool.query(
            `INSERT INTO Examen (ID_Paciente, ID_Consulta, Archivo_Nombre, Archivo_Ruta, Archivo_Tipo, Archivo_Tamanio,
             Laboratorio, Fecha_Toma, Tipo_Examen, Etiquetas, Es_Sensible, Subido_Por, Notas_Clinicas)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
            [
                ID_Paciente, ID_Consulta || null, req.file.originalname, req.file.path,
                req.file.mimetype, req.file.size, Laboratorio || null, Fecha_Toma || null,
                Tipo_Examen || 'Otro', etiquetas, esSensible, req.user.id, Notas || null,
            ]
        );
        const examen = result.rows[0];
        res.status(201).json({ message: 'Examen subido', examen: normalizeExamen(examen) });
        (async () => {
            try {
                const ocrResult = await ejecutarOCR(req.file.path);
                if (ocrResult.texto) {
                    const autoDetect = autoDetectarTipoYEtiquetas(ocrResult.texto);
                    const valores = extraerValoresNumericos(ocrResult.texto);
                    const valoresConRangos = await compararConRangos(pool, valores);
                    const alertaGeneral = determinarAlertaGeneral(valoresConRangos);
                    const tieneValores = valoresConRangos.length > 0;
                    const nuevasEtiquetas = [...new Set([...etiquetas, ...autoDetect.etiquetasSugeridas])];
                    const tipoFinal = Tipo_Examen && Tipo_Examen !== 'Otro' ? Tipo_Examen : (autoDetect.tipoSugerido || 'Otro');
                    await pool.query(
                        `UPDATE Examen SET Texto_OCR = $1, Estado_Alerta = $2, Tiene_Valores = $3,
                         Tipo_Examen = $4, Etiquetas = $5 WHERE ID_Examen = $6`,
                        [ocrResult.texto, alertaGeneral, tieneValores, tipoFinal, nuevasEtiquetas, examen.id_examen]
                    );
                    for (const v of valoresConRangos) {
                        await pool.query(
                            `INSERT INTO Valor_Examen (ID_Examen, Nombre_Valor, Valor_Numerico, Unidad, Rango_Minimo, Rango_Maximo, Estado)
                             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                            [examen.id_examen, v.nombre, v.valor, v.unidad, v.rangoMinimo || null, v.rangoMaximo || null, v.estado]
                        );
                    }
                }
            } catch (err) {
                console.error('Error en OCR post-upload:', err.message);
            }
        })();
    } catch (err) {
        console.error('Error subiendo examen:', err);
        res.status(500).json({ message: 'Error al subir el examen' });
    }
});

router.get('/paciente/:idPaciente', authenticateToken, async (req, res) => {
    try {
        const { idPaciente } = req.params;
        const { tipo, laboratorio, estado, desde, hasta, q } = req.query;
        let sql = `SELECT e.*, u.Username_Correo AS subido_por_nombre FROM Examen e
                   LEFT JOIN Usuario u ON e.Subido_Por = u.ID_Usuario
                   WHERE e.ID_Paciente = $1`;
        const params = [idPaciente];
        let idx = 2;
        if (tipo) { sql += ` AND e.Tipo_Examen = $${idx++}`; params.push(tipo); }
        if (laboratorio) { sql += ` AND LOWER(e.Laboratorio) LIKE LOWER($${idx++})`; params.push(`%${laboratorio}%`); }
        if (estado) { sql += ` AND e.Estado_Alerta = $${idx++}`; params.push(estado); }
        if (desde) { sql += ` AND e.Fecha_Toma >= $${idx++}`; params.push(desde); }
        if (hasta) { sql += ` AND e.Fecha_Toma <= $${idx++}`; params.push(hasta); }
        if (q) { sql += ` AND (e.Texto_OCR ILIKE $${idx++} OR e.Archivo_Nombre ILIKE $${idx})`; params.push(`%${q}%`); }
        sql += ' ORDER BY e.Fecha_Toma DESC NULLS LAST, e.Fecha_Subida DESC';
        const result = await pool.query(sql, params);
        const examenes = result.rows.map(normalizeExamen);
        if (req.query.solo_sensible !== undefined) {
            for (const ex of examenes) {
                if (ex.Es_Sensible && req.user.rol !== 'administrador') {
                    const medicoResult = await pool.query(
                        `SELECT COUNT(*) FROM Cita c JOIN Consulta_Medica cm ON c.ID_Cita = cm.ID_Cita
                         WHERE c.ID_Paciente = $1 AND c.ID_Medico IN (SELECT ID_Medico FROM Medico WHERE ID_Usuario = $2)`,
                        [idPaciente, req.user.id]
                    );
                    if (parseInt(medicoResult.rows[0].count) === 0) {
                        ex.Bloqueado = true;
                    }
                }
            }
        }
        res.json(examenes);
    } catch (err) {
        console.error('Error listando exámenes:', err);
        res.status(500).json({ message: 'Error al obtener exámenes' });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT e.*, u.Username_Correo AS subido_por_nombre FROM Examen e
             LEFT JOIN Usuario u ON e.Subido_Por = u.ID_Usuario WHERE e.ID_Examen = $1`,
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Examen no encontrado' });
        }
        const examen = normalizeExamen(result.rows[0]);
        if (examen.Es_Sensible && req.user.rol !== 'administrador') {
            await pool.query(
                `INSERT INTO Log_Acceso_Sensible (ID_Examen, ID_Usuario, IP) VALUES ($1, $2, $3)`,
                [examen.ID_Examen, req.user.id, getClientIp(req)]
            );
        }
        const valoresResult = await pool.query(
            `SELECT * FROM Valor_Examen WHERE ID_Examen = $1 ORDER BY ID_Valor`, [req.params.id]
        );
        examen.Valores = valoresResult.rows.map(v => ({
            ...v, id_valor: undefined,
            ID_Valor: v.id_valor, ID_Examen: v.id_examen,
            Nombre_Valor: v.nombre_valor, Valor_Numerico: parseFloat(v.valor_numerico),
            Unidad: v.unidad, Rango_Minimo: parseFloat(v.rango_minimo),
            Rango_Maximo: parseFloat(v.rango_maximo), Estado: v.estado,
        }));
        res.json(examen);
    } catch (err) {
        console.error('Error obteniendo examen:', err);
        res.status(500).json({ message: 'Error al obtener examen' });
    }
});

router.get('/:id/archivo', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const queryToken = req.query.token;
        let token = authHeader && authHeader.split(' ')[1];
        if (!token && queryToken) { token = queryToken; }
        if (!token) {
            return res.status(401).json({ message: 'Token de acceso requerido' });
        }
        let user;
        try {
            user = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            return res.status(403).json({ message: 'Token inválido o expirado' });
        }
        const result = await pool.query('SELECT * FROM Examen WHERE ID_Examen = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Examen no encontrado' });
        }
        const examen = result.rows[0];
        if (!fs.existsSync(examen.archivo_ruta)) {
            return res.status(404).json({ message: 'Archivo no encontrado en el servidor' });
        }
        if (examen.es_sensible && user.rol !== 'administrador') {
            await pool.query(
                `INSERT INTO Log_Acceso_Sensible (ID_Examen, ID_Usuario, IP) VALUES ($1, $2, $3)`,
                [examen.id_examen, user.id, getClientIp(req)]
            );
        }
        res.sendFile(examen.archivo_ruta);
    } catch (err) {
        console.error('Error sirviendo archivo:', err);
        res.status(500).json({ message: 'Error al obtener archivo' });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT Archivo_Ruta FROM Examen WHERE ID_Examen = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Examen no encontrado' });
        }
        const ruta = result.rows[0].archivo_ruta;
        await pool.query('DELETE FROM Examen WHERE ID_Examen = $1', [req.params.id]);
        if (fs.existsSync(ruta)) {
            fs.unlinkSync(ruta);
        }
        res.json({ message: 'Examen eliminado' });
    } catch (err) {
        console.error('Error eliminando examen:', err);
        res.status(500).json({ message: 'Error al eliminar examen' });
    }
});

router.post('/:id/generar-resumen', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Examen WHERE ID_Examen = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Examen no encontrado' });
        }
        const examen = result.rows[0];
        const valoresResult = await pool.query(
            'SELECT * FROM Valor_Examen WHERE ID_Examen = $1', [req.params.id]
        );
        const valores = valoresResult.rows.map(v => ({
            nombre: v.nombre_valor, valor: parseFloat(v.valor_numerico),
            unidad: v.unidad, estado: v.estado,
        }));
        res.json({ message: 'Generando resumen...' });
        const resumenes = await generarResumenConGroq(examen.texto_ocr, valores, examen.tipo_examen);
        if (resumenes.resumenMedico || resumenes.resumenPaciente) {
            await pool.query(
                `UPDATE Examen SET Resumen_Medico = $1, Resumen_Paciente = $2 WHERE ID_Examen = $3`,
                [resumenes.resumenMedico, resumenes.resumenPaciente, examen.id_examen]
            );
        }
    } catch (err) {
        console.error('Error generando resumen:', err);
        res.status(500).json({ message: 'Error al generar resumen' });
    }
});

router.put('/:id/valores', authenticateToken, async (req, res) => {
    try {
        const { valores: nuevosValores } = req.body;
        if (!Array.isArray(nuevosValores)) {
            return res.status(400).json({ message: 'valores debe ser un array' });
        }
        await pool.query('DELETE FROM Valor_Examen WHERE ID_Examen = $1', [req.params.id]);
        for (const v of nuevosValores) {
            await pool.query(
                `INSERT INTO Valor_Examen (ID_Examen, Nombre_Valor, Valor_Numerico, Unidad, Rango_Minimo, Rango_Maximo, Estado)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [req.params.id, v.Nombre_Valor, v.Valor_Numerico, v.Unidad, v.Rango_Minimo, v.Rango_Maximo, v.Estado || 'normal']
            );
        }
        const alerta = determinarAlertaGeneral(nuevosValores.map(v => ({ estado: v.Estado || 'normal' })));
        await pool.query('UPDATE Examen SET Tiene_Valores = $1, Estado_Alerta = $2 WHERE ID_Examen = $3',
            [nuevosValores.length > 0, alerta, req.params.id]);
        res.json({ message: 'Valores actualizados', estadoAlerta: alerta });
    } catch (err) {
        console.error('Error actualizando valores:', err);
        res.status(500).json({ message: 'Error al actualizar valores' });
    }
});

router.get('/:id/log-acceso', authenticateToken, requireRole('administrador'), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT l.*, u.Username_Correo FROM Log_Acceso_Sensible l
             LEFT JOIN Usuario u ON l.ID_Usuario = u.ID_Usuario
             WHERE l.ID_Examen = $1 ORDER BY l.Fecha_Acceso DESC`, [req.params.id]
        );
        res.json(result.rows.map(r => ({
            ID_Log: r.id_log, ID_Examen: r.id_examen, ID_Usuario: r.id_usuario,
            Usuario: r.username_correo, Fecha_Acceso: r.fecha_acceso, IP: r.ip,
        })));
    } catch (err) {
        console.error('Error obteniendo log:', err);
        res.status(500).json({ message: 'Error al obtener log de acceso' });
    }
});

router.post('/:id/desbloquear', authenticateToken, requireRole('administrador'), async (req, res) => {
    try {
        const { ID_Usuario } = req.body;
        await pool.query(
            `INSERT INTO Log_Acceso_Sensible (ID_Examen, ID_Usuario, IP) VALUES ($1, $2, $3)`,
            [req.params.id, ID_Usuario, getClientIp(req)]
        );
        res.json({ message: 'Acceso desbloqueado. Acceso registrado en auditoría.' });
    } catch (err) {
        console.error('Error desbloqueando acceso:', err);
        res.status(500).json({ message: 'Error al desbloquear acceso' });
    }
});

router.get('/rangos', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Rango_Referencia WHERE Activo = TRUE ORDER BY Nombre_Valor');
        res.json(result.rows.map(r => ({
            ID_Rango: r.id_rango, Nombre_Valor: r.nombre_valor, Unidad: r.unidad,
            Rango_Minimo: parseFloat(r.rango_minimo), Rango_Maximo: parseFloat(r.rango_maximo),
            Limite_Critico_Inferior: r.limite_critico_inferior !== null ? parseFloat(r.limite_critico_inferior) : null,
            Limite_Critico_Superior: r.limite_critico_superior !== null ? parseFloat(r.limite_critico_superior) : null,
            Activo: r.activo,
        })));
    } catch (err) {
        console.error('Error obteniendo rangos:', err);
        res.status(500).json({ message: 'Error al obtener rangos de referencia' });
    }
});

router.put('/rangos/:id', authenticateToken, requireRole('administrador'), async (req, res) => {
    try {
        const { Rango_Minimo, Rango_Maximo, Limite_Critico_Inferior, Limite_Critico_Superior, Activo } = req.body;
        await pool.query(
            `UPDATE Rango_Referencia SET Rango_Minimo = $1, Rango_Maximo = $2,
             Limite_Critico_Inferior = $3, Limite_Critico_Superior = $4, Activo = $5 WHERE ID_Rango = $6`,
            [Rango_Minimo, Rango_Maximo, Limite_Critico_Inferior, Limite_Critico_Superior, Activo, req.params.id]
        );
        res.json({ message: 'Rango actualizado' });
    } catch (err) {
        console.error('Error actualizando rango:', err);
        res.status(500).json({ message: 'Error al actualizar rango' });
    }
});

function normalizeExamen(row) {
    return {
        ID_Examen: row.id_examen,
        ID_Paciente: row.id_paciente,
        ID_Consulta: row.id_consulta,
        Archivo_Nombre: row.archivo_nombre,
        Archivo_Ruta: row.archivo_ruta,
        Archivo_Tipo: row.archivo_tipo,
        Archivo_Tamanio: row.archivo_tamanio,
        Texto_OCR: row.texto_ocr,
        Notas_Clinicas: row.notas_clinicas,
        Resumen_Medico: row.resumen_medico,
        Resumen_Paciente: row.resumen_paciente,
        Laboratorio: row.laboratorio,
        Fecha_Toma: row.fecha_toma,
        Fecha_Subida: row.fecha_subida,
        Tipo_Examen: row.tipo_examen,
        Etiquetas: row.etiquetas || [],
        Es_Sensible: row.es_sensible || false,
        Estado_Alerta: row.estado_alerta || 'normal',
        Subido_Por: row.subido_por,
        Subido_Por_Nombre: row.subido_por_nombre || null,
        Tiene_Valores: row.tiene_valores || false,
    };
}

const routeErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Archivo demasiado grande. Máximo 20MB' });
        }
        return res.status(400).json({ message: `Error de subida: ${err.message}` });
    }
    if (err.message && err.message.includes('Formato no permitido')) {
        return res.status(400).json({ message: err.message });
    }
    next(err);
};
router.use(routeErrorHandler);

module.exports = router;
