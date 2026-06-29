import React, { useState, useMemo } from 'react';
import { Clock, Video, Building2, CheckCircle2, CircleDashed, ChevronLeft, ChevronRight, X, Link, Upload, Save, Filter } from 'lucide-react';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_LABELS = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'];
const EMPRESAS = ['Todas las empresas','Global','Empresa Alpha','Empresa Beta'];

// Mock contenido base (Lun/Mié/Vie)
const BASE_BLOQUES = [
  { dia: 'Lunes',     bloques: [
    { id:1, turno:'Mañana', horario:'08:00', empresa:'Global',        tipo:'Activación',   estado:'publicado'  },
    { id:2, turno:'Tarde',  horario:'15:00', empresa:'Global',        tipo:'Relajación',   estado:'publicado'  },
  ]},
  { dia: 'Miércoles', bloques: [
    { id:3, turno:'Mañana', horario:'08:00', empresa:'Empresa Alpha', tipo:'Postura',      estado:'programado' },
    { id:4, turno:'Tarde',  horario:'15:00', empresa:'Global',        tipo:'Respiración',  estado:'programado' },
  ]},
  { dia: 'Viernes',   bloques: [
    { id:5, turno:'Mañana', horario:'08:00', empresa:'Empresa Beta',  tipo:'Energía',      estado:'borrador'   },
    { id:6, turno:'Tarde',  horario:'15:00', empresa:'Global',        tipo:'Estiramiento', estado:'borrador'   },
  ]},
];

// Mock calendario mensual: días con contenido y sus mini-eventos
const EVENTOS_MES: Record<number, {horario:string; empresa:string}[]> = {
  5:  [{horario:'08:00', empresa:'Global'}, {horario:'15:00', empresa:'Global'}],
  7:  [{horario:'08:00', empresa:'Empresa Alpha'}, {horario:'15:00', empresa:'Global'}],
  9:  [{horario:'08:00', empresa:'Global'}, {horario:'15:00', empresa:'Empresa Beta'}],
  12: [{horario:'08:00', empresa:'Global'}],
  14: [{horario:'08:00', empresa:'Empresa Alpha'}, {horario:'15:00', empresa:'Global'}],
  16: [{horario:'08:00', empresa:'Global'}, {horario:'15:00', empresa:'Global'}],
  19: [{horario:'08:00', empresa:'Empresa Beta'}],
  21: [{horario:'08:00', empresa:'Global'}, {horario:'15:00', empresa:'Empresa Alpha'}],
  23: [{horario:'08:00', empresa:'Global'}],
  25: [{horario:'08:00', empresa:'Global'}, {horario:'15:00', empresa:'Global'}],
  27: [{horario:'08:00', empresa:'Empresa Alpha'}, {horario:'15:00', empresa:'Global'}],
  29: [{horario:'08:00', empresa:'Global'}, {horario:'15:00', empresa:'Empresa Beta'}],
};

function getCalDays(year:number, month:number) {
  const fd = new Date(year, month, 1).getDay();
  const off = fd === 0 ? 6 : fd - 1;
  const dim = new Date(year, month+1, 0).getDate();
  const cells:(number|null)[] = Array(off).fill(null);
  for (let d=1; d<=dim; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function getLunesOfWeek(base:Date, offset:number) {
  const d = new Date(base);
  const day = d.getDay();
  d.setDate(d.getDate() + (day===0 ? -6 : 1-day) + offset*7);
  return d;
}

function fmt(d:Date) { return `${d.getDate()} ${MESES[d.getMonth()]}`; }

// Colores por empresa
const colorEmpresa: Record<string,{bg:string;text:string}> = {
  'Global':        {bg:'#f0fdfa', text:'#0d9488'},
  'Empresa Alpha': {bg:'#eff6ff', text:'#3b82f6'},
  'Empresa Beta':  {bg:'#faf5ff', text:'#a855f7'},
};

export const MicroentrenamientosTab: React.FC = () => {
  const hoy = new Date();
  const [vista, setVista]          = useState<'semana'|'mes'>('semana');
  const [mes, setMes]              = useState(hoy.getMonth());
  const [anio, setAnio]            = useState(hoy.getFullYear());
  const [modal, setModal]          = useState(false);
  const [tipoLink, setTipoLink]    = useState<'link'|'upload'|'biblioteca'>('link');
  const [diaModal, setDiaModal]    = useState<number|null>(null);
  const [offsetSem, setOffset]     = useState(0);
  const [empresa, setEmpresa]      = useState('Todas las empresas');
  const [recordatorio, setRecordatorio] = useState('15 minutos antes');

  const lunes = getLunesOfWeek(hoy, offsetSem);
  const rangoLabel = (() => {
    const v = new Date(lunes); v.setDate(lunes.getDate()+4);
    return `${lunes.getDate()} – ${v.getDate()} ${MESES[v.getMonth()]} ${v.getFullYear()}`;
  })();

  const semana = useMemo(() => BASE_BLOQUES.map((d, i) => {
    const fecha = new Date(lunes); fecha.setDate(lunes.getDate() + [0,2,4][i]);
    const bloquesFiltrados = empresa === 'Todas las empresas'
      ? d.bloques
      : d.bloques.filter(b => b.empresa === empresa || b.empresa === 'Global' || empresa === 'Global');
    return { ...d, fecha: fmt(fecha), bloques: bloquesFiltrados };
  }), [offsetSem, empresa]);

  const calDays = getCalDays(anio, mes);

  const navMes = (dir:1|-1) => {
    if (dir===1 && mes===11) { setMes(0); setAnio(a=>a+1); }
    else if (dir===-1 && mes===0) { setMes(11); setAnio(a=>a-1); }
    else setMes(m=>m+dir);
  };

  const abrirModal = (dia?:number) => { setDiaModal(dia??null); setModal(true); };

  const btnNav = (onClick:()=>void, children:React.ReactNode) => (
    <button onClick={onClick} style={{background:'none',border:'1px solid #e2e8f0',borderRadius:'8px',padding:'0.35rem 0.6rem',cursor:'pointer',color:'#475569',display:'flex',alignItems:'center'}}>
      {children}
    </button>
  );

  return (
    <div style={{animation:'fadeIn 0.3s ease-out'}}>

      {/* ── Cabecera ── */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap',gap:'0.75rem'}}>
        <div>
          <p className="text-muted" style={{margin:0,fontSize:'0.85rem'}}>Programa los videos de pausas activas</p>
        </div>

        <div style={{display:'flex',gap:'0.75rem',alignItems:'center',flexWrap:'wrap'}}>
          {/* Filtro empresa */}
          <div style={{display:'flex',alignItems:'center',gap:'0.4rem',backgroundColor:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'8px',padding:'0.3rem 0.6rem 0.3rem 0.8rem'}}>
            <Filter size={14} color="#64748b" />
            <select
              value={empresa}
              onChange={e=>setEmpresa(e.target.value)}
              style={{border:'none',background:'transparent',fontSize:'0.82rem',fontWeight:600,color:'#1e293b',cursor:'pointer',outline:'none'}}
            >
              {EMPRESAS.map(e=><option key={e}>{e}</option>)}
            </select>
          </div>

          {/* Toggle vista */}
          <div style={{display:'flex',backgroundColor:'#f1f5f9',borderRadius:'8px',padding:'3px',gap:'2px'}}>
            {(['semana','mes'] as const).map(v=>(
              <button key={v} onClick={()=>setVista(v)} style={{
                padding:'0.35rem 0.85rem',borderRadius:'6px',border:'none',fontSize:'0.78rem',fontWeight:600,cursor:'pointer',
                backgroundColor:vista===v?'white':'transparent',color:vista===v?'#0f172a':'#64748b',
                boxShadow:vista===v?'0 1px 4px rgba(0,0,0,0.08)':'none',transition:'all 0.15s',
              }}>
                {v==='semana'?'📅 Semana':'🗓 Mes'}
              </button>
            ))}
          </div>

          <button onClick={()=>abrirModal()} className="btn-primary"
            style={{display:'flex',alignItems:'center',gap:'0.4rem',padding:'0.45rem 1rem',fontSize:'0.82rem'}}>
            <Video size={15}/> Nuevo Video
          </button>
        </div>
      </div>

      {/* ══ VISTA SEMANAL ══ */}
      {vista==='semana' && (
        <>
          {/* Navegación semana */}
          <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1.25rem'}}>
            {btnNav(()=>setOffset(o=>o-1), <ChevronLeft size={16}/>)}
            <span style={{fontSize:'0.9rem',fontWeight:600,color:'#1e293b',minWidth:'220px',textAlign:'center'}}>{rangoLabel}</span>
            {btnNav(()=>setOffset(o=>o+1), <ChevronRight size={16}/>)}
            {offsetSem!==0 && (
              <button onClick={()=>setOffset(0)} style={{background:'none',border:'none',fontSize:'0.78rem',color:'#0d9488',fontWeight:600,cursor:'pointer',padding:0}}>
                Hoy
              </button>
            )}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1.25rem'}}>
            {semana.map(dia=>(
              <div key={dia.dia} style={{display:'flex',flexDirection:'column',gap:'0.875rem'}}>
                <div style={{padding:'0.6rem 0',borderBottom:'2px solid #e2e8f0',display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
                  <h3 style={{margin:0,fontSize:'1rem',fontWeight:700,color:'#1e293b'}}>{dia.dia}</h3>
                  <span style={{fontSize:'0.78rem',color:'#94a3b8',fontWeight:500}}>{dia.fecha}</span>
                </div>

                {dia.bloques.length === 0
                  ? <div style={{padding:'1rem',borderRadius:'10px',border:'1px dashed #e2e8f0',textAlign:'center',color:'#cbd5e1',fontSize:'0.8rem'}}>Sin contenido</div>
                  : dia.bloques.map(bloque=>{
                    const col = colorEmpresa[bloque.empresa] ?? {bg:'#f8fafc',text:'#475569'};
                    return (
                      <div key={bloque.id} className="card" style={{padding:'1rem 1rem 1rem 1.3rem',margin:0,borderRadius:'10px',border:'1px solid #f1f5f9',boxShadow:'0 2px 8px rgba(0,0,0,0.03)',position:'relative',overflow:'hidden'}}>
                        <div style={{position:'absolute',top:0,left:0,width:'4px',height:'100%',backgroundColor:bloque.turno==='Mañana'?'#38bdf8':'#fbbf24'}}/>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.65rem'}}>
                          <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
                            <span style={{fontSize:'0.85rem',fontWeight:700,color:'#1e293b'}}>{bloque.turno}</span>
                            <span style={{fontSize:'0.68rem',backgroundColor:'#f1f5f9',color:'#475569',padding:'0.1rem 0.4rem',borderRadius:'1rem',fontWeight:600}}>{bloque.tipo}</span>
                          </div>
                          {bloque.estado==='publicado'  && <CheckCircle2 size={16} color="#10b981"/>}
                          {bloque.estado==='programado' && <Clock        size={16} color="#3b82f6"/>}
                          {bloque.estado==='borrador'   && <CircleDashed size={16} color="#cbd5e1"/>}
                        </div>
                        <div style={{display:'flex',flexDirection:'column',gap:'0.3rem'}}>
                          <div style={{display:'flex',alignItems:'center',gap:'0.4rem',color:'#64748b',fontSize:'0.76rem'}}>
                            <Clock size={12}/><span>{bloque.horario} hs</span>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.76rem'}}>
                            <Building2 size={12} color="#64748b"/>
                            <span style={{backgroundColor:col.bg,color:col.text,padding:'0.1rem 0.45rem',borderRadius:'1rem',fontWeight:600,fontSize:'0.7rem'}}>{bloque.empresa}</span>
                          </div>
                        </div>
                        <div style={{marginTop:'0.65rem',paddingTop:'0.55rem',borderTop:'1px solid #f8fafc',textAlign:'right'}}>
                          <button onClick={()=>abrirModal()} style={{background:'none',border:'none',color:'#0d9488',fontSize:'0.76rem',fontWeight:600,cursor:'pointer',padding:0,display:'inline-flex',alignItems:'center',gap:'0.2rem'}}>
                            <Video size={12}/> Editar
                          </button>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            ))}
          </div>
        </>
      )}

      {/* ══ VISTA MENSUAL ══ */}
      {vista==='mes' && (
        <div className="card" style={{padding:'1.5rem',margin:0,borderRadius:'14px',border:'1px solid #f1f5f9',boxShadow:'0 4px 20px rgba(0,0,0,0.03)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
            {btnNav(()=>navMes(-1), <ChevronLeft size={16}/>)}
            <h3 style={{margin:0,fontSize:'1.1rem',fontWeight:700,color:'#1e293b'}}>{MESES[mes]} {anio}</h3>
            {btnNav(()=>navMes(1),  <ChevronRight size={16}/>)}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'3px',marginBottom:'3px'}}>
            {DIAS_LABELS.map(d=>(
              <div key={d} style={{textAlign:'center',fontSize:'0.7rem',fontWeight:700,color:'#94a3b8',padding:'0.35rem 0',textTransform:'uppercase'}}>{d}</div>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'3px'}}>
            {calDays.map((day, idx)=>{
              const eventos = day ? EVENTOS_MES[day] : undefined;
              const filtrados = eventos?.filter(e=>empresa==='Todas las empresas'||e.empresa===empresa||e.empresa==='Global');
              const tieneContenido = !!filtrados?.length;
              const esHoy = day===hoy.getDate() && mes===hoy.getMonth() && anio===hoy.getFullYear();
              return (
                <div key={idx} onClick={()=>day&&abrirModal(day)}
                  style={{
                    minHeight:'72px',borderRadius:'8px',padding:'0.3rem',
                    cursor:day?'pointer':'default',
                    backgroundColor:esHoy?'#0d9488':tieneContenido?'#f0fdfa':'transparent',
                    border:tieneContenido&&!esHoy?'1px solid #ccfbf1':'1px solid transparent',
                    transition:'background 0.15s',display:'flex',flexDirection:'column',gap:'2px',
                  }}>
                  {day && (
                    <>
                      <span style={{fontSize:'0.8rem',fontWeight:esHoy?700:500,color:esHoy?'white':tieneContenido?'#0d9488':'#64748b',lineHeight:1.2}}>{day}</span>
                      {filtrados?.slice(0,2).map((e,i)=>{
                        const col = colorEmpresa[e.empresa]??{bg:'#f1f5f9',text:'#475569'};
                        return (
                          <div key={i} style={{fontSize:'0.62rem',backgroundColor:esHoy?'rgba(255,255,255,0.2)':col.bg,color:esHoy?'white':col.text,borderRadius:'4px',padding:'1px 4px',fontWeight:600,lineHeight:1.4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                            {e.horario} — {e.empresa==='Global'?'General':e.empresa}
                          </div>
                        );
                      })}
                      {(filtrados?.length??0)>2 && (
                        <span style={{fontSize:'0.6rem',color:'#94a3b8'}}>+{filtrados!.length-2} más</span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{marginTop:'1rem',paddingTop:'0.875rem',borderTop:'1px solid #f1f5f9',display:'flex',gap:'1.25rem',flexWrap:'wrap'}}>
            {Object.entries(colorEmpresa).map(([name,c])=>(
              <div key={name} style={{display:'flex',alignItems:'center',gap:'0.35rem',fontSize:'0.75rem',color:'#64748b'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:c.text}}/>
                {name}
              </div>
            ))}
            <span style={{marginLeft:'auto',fontSize:'0.75rem',color:'#94a3b8'}}>Clic en un día para programar</span>
          </div>
        </div>
      )}

      {/* ══ MODAL ══ */}
      {modal && (
        <div onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}
          style={{position:'fixed',inset:0,backgroundColor:'rgba(15,23,42,0.35)',backdropFilter:'blur(4px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{backgroundColor:'white',borderRadius:'16px',padding:'1.75rem',width:'460px',maxWidth:'95vw',boxShadow:'0 20px 60px rgba(0,0,0,0.15)',animation:'fadeIn 0.2s ease-out'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.25rem'}}>
              <div>
                <h3 style={{margin:0,fontSize:'1.05rem',fontWeight:700,color:'#1e293b'}}>Programar Video</h3>
                <p style={{margin:'0.15rem 0 0',fontSize:'0.8rem',color:'#94a3b8'}}>
                  {diaModal?`${diaModal} de ${MESES[mes]}`:'Nuevo contenido'}
                </p>
              </div>
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8'}}><X size={20}/></button>
            </div>

            <div style={{marginBottom:'1rem'}}>
              <label style={{fontSize:'0.75rem',fontWeight:600,color:'#475569',display:'block',marginBottom:'0.4rem',textTransform:'uppercase',letterSpacing:'0.5px'}}>Tipo de contenido</label>
              <div style={{display:'flex',gap:'0.5rem'}}>
                {(['link','upload','biblioteca'] as const).map(t=>(
                  <button key={t} onClick={()=>setTipoLink(t)} style={{
                    flex:1,padding:'0.55rem',borderRadius:'8px',cursor:'pointer',
                    border:`1.5px solid ${tipoLink===t?'#0d9488':'#e2e8f0'}`,
                    backgroundColor:tipoLink===t?'#f0fdfa':'white',
                    color:tipoLink===t?'#0d9488':'#64748b',fontWeight:600,fontSize:'0.8rem',
                    display:'flex',alignItems:'center',justifyContent:'center',gap:'0.35rem',transition:'all 0.15s',
                  }}>
                    {t==='link' ? <><Link size={14}/>Link externo</> : t==='upload' ? <><Upload size={14}/>Subir video</> : <><Video size={14}/>Biblioteca</>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{marginBottom:'0.9rem'}}>
              {tipoLink==='link'
                ? <input type="url" className="input-field" placeholder="https://vimeo.com/..." style={{fontSize:'0.875rem'}}/>
                : tipoLink==='upload'
                ? <div style={{border:'2px dashed #e2e8f0',borderRadius:'10px',padding:'1.25rem',textAlign:'center',cursor:'pointer',color:'#94a3b8',fontSize:'0.82rem'}}>
                    <Upload size={22} style={{marginBottom:'0.35rem',display:'block',margin:'0 auto 0.35rem'}}/>
                    Arrastrá o hacé clic para subir
                  </div>
                : <div style={{border:'2px dashed #e2e8f0',borderRadius:'10px',padding:'1.25rem',textAlign:'center',cursor:'pointer',color:'#0d9488',fontSize:'0.82rem',backgroundColor:'#f0fdfa'}}>
                    <Video size={22} style={{marginBottom:'0.35rem',display:'block',margin:'0 auto 0.35rem'}}/>
                    Seleccionar desde Biblioteca
                  </div>
              }
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.65rem',marginBottom:'0.9rem'}}>
              <div>
                <label style={{fontSize:'0.72rem',fontWeight:600,color:'#475569',display:'block',marginBottom:'0.35rem',textTransform:'uppercase',letterSpacing:'0.5px'}}>Tipo de pausa</label>
                <select className="input-field" style={{fontSize:'0.875rem'}}>
                  {['Activación','Relajación','Postura','Respiración','Energía','Estiramiento'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:'0.72rem',fontWeight:600,color:'#475569',display:'block',marginBottom:'0.35rem',textTransform:'uppercase',letterSpacing:'0.5px'}}>Empresa</label>
                <select className="input-field" style={{fontSize:'0.875rem'}}>
                  {['Global (todas)','Empresa Alpha','Empresa Beta'].map(e=><option key={e}>{e}</option>)}
                </select>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.65rem',marginBottom:'1.25rem'}}>
              <div>
                <label style={{fontSize:'0.72rem',fontWeight:600,color:'#475569',display:'block',marginBottom:'0.35rem',textTransform:'uppercase',letterSpacing:'0.5px'}}>Fecha</label>
                <input type="date" className="input-field" defaultValue={diaModal?`${anio}-${String(mes+1).padStart(2,'0')}-${String(diaModal).padStart(2,'0')}`:''} style={{fontSize:'0.875rem'}}/>
              </div>
              <div>
                <label style={{fontSize:'0.72rem',fontWeight:600,color:'#475569',display:'block',marginBottom:'0.35rem',textTransform:'uppercase',letterSpacing:'0.5px'}}>Turno</label>
                <select className="input-field" style={{fontSize:'0.875rem'}}><option>Mañana</option><option>Tarde</option></select>
              </div>
              <div>
                <label style={{fontSize:'0.72rem',fontWeight:600,color:'#475569',display:'block',marginBottom:'0.35rem',textTransform:'uppercase',letterSpacing:'0.5px'}}>Hora</label>
                <input type="time" className="input-field" defaultValue="08:00" style={{fontSize:'0.875rem'}}/>
              </div>
            </div>

            <div style={{marginBottom:'1.25rem'}}>
              <label style={{fontSize:'0.72rem',fontWeight:600,color:'#475569',display:'block',marginBottom:'0.35rem',textTransform:'uppercase',letterSpacing:'0.5px'}}>Enviar recordatorio (Email Automático)</label>
              <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                <select className="input-field" value={recordatorio} onChange={e=>setRecordatorio(e.target.value)} style={{fontSize:'0.875rem',flex:1,minWidth:'150px'}}>
                  <option value="Sin recordatorio">Sin recordatorio</option>
                  <option value="15 minutos antes">15 minutos antes</option>
                  <option value="30 minutos antes">30 minutos antes</option>
                  <option value="1 hora antes">1 hora antes</option>
                  <option value="2 horas antes">2 horas antes</option>
                  <option value="Personalizado">Personalizado...</option>
                </select>
                {recordatorio === 'Personalizado' && (
                  <div style={{display:'flex',alignItems:'center',gap:'0.4rem',flex:1,minWidth:'120px'}}>
                    <input type="number" className="input-field" placeholder="Minutos" style={{fontSize:'0.875rem',width:'80px'}}/>
                    <span style={{fontSize:'0.8rem',color:'#64748b'}}>min. antes</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{display:'flex',gap:'0.65rem'}}>
              <button onClick={()=>setModal(false)} className="btn-secondary" style={{flex:1,fontSize:'0.875rem'}}>Cancelar</button>
              <button className="btn-primary" style={{flex:2,display:'flex',alignItems:'center',justifyContent:'center',gap:'0.4rem',fontSize:'0.875rem'}}>
                <Save size={15}/> Guardar programación
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
