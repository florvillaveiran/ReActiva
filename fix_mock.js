const fs = require('fs');
const file = 'src/pages/plataforma/views/admin/Analiticas.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add tension array after zonas array in ANALITICAS_MOCK
content = content.replace(/zonas: \[\s+([^\]]+)\s+\],/g, (match, p1) => {
    return match + `\n      tension: [\n        { name: 'A la tarde', valor: 45 }, { name: 'Al final de la jornada', valor: 30 },\n        { name: 'A la mañana', valor: 15 }, { name: 'Al mediodía', valor: 10 },\n      ],`;
});

// Update AnaliticaSetBase
content = content.replace(/zonas: \{ name: string; valor: number \}\[\];/g, "zonas: { name: string; valor: number }[];\n  tension: { name: string; valor: number }[];");

fs.writeFileSync(file, content);
