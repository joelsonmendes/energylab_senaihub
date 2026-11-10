/* Mapa dinâmico integrado ao motor didático da microrrede.
 * A ilustração é um contexto visual. Os fluxos só representam os componentes modelados.
 */
(function(){
'use strict';
const context={
  hydro:{title:'Hidrelétrica · fonte renovável',text:'A energia potencial da água é convertida em energia elétrica por turbina e gerador. Esta instalação aparece na imagem como referência comparativa, mas a potência hidrelétrica não entra nos resultados deste simulador.'},
  nuclear:{title:'Usina nuclear · fonte não renovável',text:'Utiliza o calor da fissão nuclear para produzir vapor e movimentar turbinas. Não é classificada como energia renovável. Está na imagem para comparação de tecnologias, sem geração calculada.'},
  thermal:{title:'Usina termelétrica · depende do combustível',text:'O calor pode vir de combustíveis fósseis, biomassa ou outras fontes. A classificação como renovável depende do combustível e do ciclo de produção. A imagem é contextual; não há cálculo de geração termelétrica neste módulo.'}
};
class EnergyMap{
  constructor(){
    this.stage=document.getElementById('energy-map-stage');
    this.detail=document.getElementById('map-detail');
    this.selected='solar';
    this.contextInfo=null;
    this.s=null;this.r=null;
    if(!this.stage||!this.detail)throw new Error('Mapa interativo não inicializado: elementos ausentes.');
  }
  text(id,value){const el=document.getElementById(id);if(el)el.textContent=value;}
  active(id,yes){const el=document.getElementById(id);if(el)el.classList.toggle('is-active',Boolean(yes));}
  selectCore(id){this.selected=id;this.contextInfo=null;this.selection();this.describe();}
  showInfo(id){if(!context[id])return;this.contextInfo=id;this.selection();this.describe();}
  selection(){document.querySelectorAll('#view-map [data-map-component],#view-map [data-map-info]').forEach(el=>{
    const active=this.contextInfo?el.dataset.mapInfo===this.contextInfo:el.dataset.mapComponent===this.selected;
    el.classList.toggle('is-selected',active);
    el.setAttribute('aria-pressed',String(active));
  });}
  describe(){
    if(!this.s||!this.r)return;
    if(this.contextInfo){const data=context[this.contextInfo];this.detail.innerHTML='<strong>'+data.title+'</strong><span>'+data.text+'</span>';return;}
    const s=this.s,r=this.r,fmt=window.ELab.engine.kw;
    const items={
      solar:['Solar fotovoltaica',`${s.counts.solar} painel(is). Irradiância: ${Math.round(s.params.irr)} W/m². Geração instantânea estimada: ${fmt(r.solarW)}. Aumentar irradiância ou quantidade tende a ampliar a produção.`],
      wind:['Energia eólica',`${s.counts.wind} turbina(s). Vento: ${s.params.wind.toLocaleString('pt-BR')} m/s. Geração estimada: ${fmt(r.windW)}. A potência disponível no vento cresce com o cubo da velocidade.`],
      load:['Consumidores e cargas',`Demanda: ${fmt(r.loadW)}. Atendida: ${fmt(r.acServed)}. Não atendida: ${fmt(r.unmet)}. Os edifícios, veículos e instalações da imagem representam diferentes usos de eletricidade; no modelo, a demanda é agregada.`],
      bus:['Centro de controle e barramento CC',`Fonte CC disponível: ${fmt(r.renewableDc)}. O gerenciamento prioriza o uso da geração disponível, a bateria e, quando habilitada, a rede elétrica. A figura é conceitual, não é um diagrama elétrico de instalação.`],
      grid:['Rede elétrica',r.gridActive?`Interconectada. Importação: ${fmt(r.gridImport)}; exportação: ${fmt(r.gridExport)}. A rede pode completar a demanda ou receber excedentes, respeitando os limites simplificados do inversor.`:'Sem conexão elétrica neste cenário. Se faltar energia, as cargas poderão ficar parcialmente não atendidas.'],
      battery:['Baterias',`${s.counts.battery} banco(s), SOC ${Math.round(s.soc*100)}%. Carga: ${fmt(r.batChargeDc)}; descarga: ${fmt(r.batDischargeDc)}. O armazenamento reduz déficits por períodos limitados.`],
      inverter:['Inversores',`${s.counts.inverter} unidade(s), capacidade de ${fmt(r.inverterCapacity)}. Convertem energia CC das fontes e da bateria para CA. Limites do inversor podem impedir o atendimento mesmo com geração disponível.`]
    };
    const item=items[this.selected]||items.solar;
    this.detail.innerHTML='<strong>'+item[0]+'</strong><span>'+item[1]+'</span>';
  }
  render(s,r){
    this.s=s;this.r=r;
    const E=window.ELab.engine;
    const activeSolar=r.solarW>5,activeWind=r.windW>5,activeLoad=r.acServed>5,activeGrid=r.gridActive&&(r.gridImport>5||r.gridExport>5);
    this.stage.classList.toggle('map-night',s.params.irr<=25);
    this.stage.classList.toggle('map-shortage',r.unmet>5);
    this.stage.classList.toggle('map-island',!r.gridActive);
    this.stage.style.setProperty('--sun-visibility',String(Math.max(0,Math.min(0.62,s.params.irr/1400))));
    this.stage.style.setProperty('--wind-spin',`${Math.max(1.2,Math.min(16,19-Math.max(0,s.params.wind)*1.12))}s`);
    this.active('map-route-solar',activeSolar);
    this.active('map-route-wind',activeWind);
    this.active('map-route-city',activeLoad);
    this.active('map-route-factory',activeLoad);
    this.active('map-route-public',activeLoad);
    this.active('map-route-vehicle',activeLoad);
    this.active('map-route-house',activeLoad);
    this.active('map-route-grid',activeGrid);
    const gridRoute=document.getElementById('map-route-grid');
    if(gridRoute)gridRoute.classList.toggle('is-reversed',r.gridImport>5);
    const windMotion=this.stage.querySelector('.map-wind-motion');
    if(windMotion)windMotion.classList.toggle('wind-still',!activeWind);
    this.stage.querySelectorAll('[data-map-component="solar"]').forEach(el=>el.classList.toggle('is-offline',!activeSolar));
    this.stage.querySelectorAll('[data-map-component="wind"]').forEach(el=>el.classList.toggle('is-offline',!activeWind));
    this.stage.querySelectorAll('[data-map-component="grid"]').forEach(el=>el.classList.toggle('is-offline',!r.gridActive));
    this.stage.querySelectorAll('[data-map-component="load"]').forEach(el=>el.classList.toggle('is-alert',r.unmet>5));
    this.text('map-live-tag',r.unmet>5?'⚠ DEMANDA NÃO ATENDIDA':(!r.gridActive?'● MICRORREDE ISOLADA':r.gridImport>5?'↙ IMPORTANDO DA REDE':r.gridExport>5?'↗ EXPORTANDO EXCEDENTE':'● MICRORREDE EM OPERAÇÃO'));
    this.text('map-weather-tag',`Sol: ${Math.round(s.params.irr)} W/m² · Vento: ${E.num(s.params.wind,1)} m/s`);
    this.text('map-battery-value',s.counts.battery?`${Math.round(s.soc*100)}% SOC`:'Ausente');
    this.text('map-inverter-value',E.kw(r.inverterCapacity));
    this.text('map-solar-value',E.kw(r.solarW));
    this.text('map-wind-value',E.kw(r.windW));
    this.text('map-load-value',E.kw(r.loadW));
    this.text('map-grid-value',!r.gridActive?'Desconectada':r.gridImport>5?'Importa '+E.kw(r.gridImport):r.gridExport>5?'Exporta '+E.kw(r.gridExport):'Em equilíbrio');
    const alert=document.getElementById('map-alert');if(alert){alert.classList.toggle('hidden',!(r.unmet>5));if(r.unmet>5)alert.textContent=`⚠ Não atendida: ${E.kw(r.unmet)}`;}
    this.selection();this.describe();
  }
}
window.ELab=window.ELab||{};window.ELab.MapView=EnergyMap;
})();
