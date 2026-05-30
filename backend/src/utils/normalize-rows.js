function normalizeKey(key) {
    if (key.includes('_')) {
        return key
            .split('_')
            .map((part) =>
                part.length <= 3 ? part.toUpperCase() : `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`,
            )
            .join('_');
    }

    if (key.toUpperCase() === key) {
        return key;
    }

    return key.length <= 3 ? key.toUpperCase() : `${key.charAt(0).toUpperCase()}${key.slice(1).toLowerCase()}`;
}

function normalizeRow(row) {
    return Object.fromEntries(
        Object.entries(row).map(([key, value]) => [normalizeKey(key), value]),
    );
}

function normalizeRows(rows) {
    return rows.map(normalizeRow);
}

module.exports = { normalizeRow, normalizeRows };