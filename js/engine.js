(function(){
'use strict';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const defaults=()=>({
  mode:'grid', gridEnabled:true, scenario:'base', running:false, minute:720, day:1, soc:.65,
  counts:{solar:8,wind:2,battery:1,inverter:1,load:4},
  params:{irr:850,wind:7,temp:28,shade:5,solarArea:2.2,panelEff:21,solarSys:95,windRadius:2.5,rho:1.225,cp:38,genEff:90,rectEff:96,battV:48,battAh:100,dod:80,battEff:94,battMaxW:2500,invKW:5,invEff:96,loadW:850},
  totals:{solarWh:0,windWh:0,loadWh:0,importWh:0,exportWh:0},history:[]
});
const schema={
 irr:{label:'Irradiância solar',unit:'W/m²',min:0,max:1200,step:10,group:'climate'},wind:{label:'Velocidade do vento',unit:'m/s',min:0,max:25,step:.5,group:'climate'},temp:{label:'Temperatura ambiente',unit:'°C',min:-10,max:65,step:1,group:'climate'},shade:{label:'Sombreamento',unit:'%',min:0,max:100,step:1,group:'climate'},
 solarArea:{label:'Área por painel',unit:'m²',min:.5,max:5,step:.1,group:'solar'},panelEff:{label:'Eficiência do painel',unit:'%',min:5,max:30,step:1,group:'solar'},solarSys:{label:'Fator do sistema (sem inverter)',unit:'%',min:50,max:100,step:1,group:'solar'},
 windRadius:{label:'Raio das pás',unit:'m',min:1,max:8,step:.5,group:'wind'},rho:{label:'Densidade do ar',unit:'kg/m³',min:1,max:1.4,step:.005,group:'wind'},cp:{label:'Coeficiente Cp',unit:'%',min:10,max:59.3,step:.1,group:'wind'},genEff:{label:'Eficiência do gerador',unit:'%',min:50,max:99,step:1,group:'wind'},rectEff:{label:'Eficiência do retificador',unit:'%',min:70,max:100,step:1,group:'wind'},
 battV:{label:'Tensão do banco',unit:'V',min:12,max:400,step:12,group:'battery'},battAh:{label:'Capacidade por bateria',unit:'Ah',min:20,max:1000,step:20,group:'battery'},dod:{label:'Profundidade de descarga (DoD)',unit:'%',min:10,max:100,step:5,group:'battery'},battEff:{label:'Eficiência carga/descarga',unit:'%',min:60,max:100,step:1,group:'battery'},battMaxW:{label:'Potência máx. por bateria',unit:'W',min:200,max:10000,step:100,group:'battery'},
 invKW:{label:'Potência CA por inversor',unit:'kW',min:.5,max:20,step:.5,group:'loads'},invEff:{label:'Eficiência do inversor',unit:'%',min:70,max:100,step:1,group:'loads'},loadW:{label:'Potência por carga',unit:'W',min:100,max:5000,step:50,group:'loads'}
};
const groups={climate:'☀ Clima e condições ambientais',solar:'▰ Painéis fotovoltaicos',wind:'✦ Turbinas eólicas',battery:'▣ Armazenamento',loads:'⚡ Inversores e consumo'};
const scenarios={
 base:{name:'Operação normal',mode:'grid',gridEnabled:true,irr:850,wind:7,temp:28,shade:5,counts:{solar:8,wind:2,battery:1,inverter:1,load:4}},
 sunny:{name:'Dia ensolarado',mode:'grid',gridEnabled:true,irr:1100,wind:5,temp:34,shade:0,counts:{solar:12,wind:1,battery:1,inverter:1,load:4}},
 night:{name:'Noite sem sol',mode:'island',gridEnabled:false,irr:0,wind:5,temp:22,shade:0,counts:{solar:8,wind:2,battery:2,inverter:1,load:4}},
 lowwind:{name:'Vento fraco',mode:'island',gridEnabled:false,irr:650,wind:2,temp:27,shade:5,counts:{solar:10,wind:2,battery:2,inverter:1,load:4}},
 highload:{name:'Pico de consumo',mode:'island',gridEnabled:false,irr:500,wind:5,temp:30,shade:10,counts:{solar:8,wind:2,battery:1,inverter:1,load:8}},
 failure:{name:'Falha do inversor',mode:'island',gridEnabled:false,irr:1000,wind:9,temp:28,shade:0,counts:{solar:12,wind:2,battery:2,inverter:0,load:4}}
};
function applyScenario(state,id){const preset=scenarios[id];if(!preset)return;Object.assign(state,{mode:preset.mode,gridEnabled:preset.gridEnabled,scenario:id,running:false});for(const k of ['irr','wind','temp','shade'])state.params[k]=preset[k];state.counts={...preset.counts};state.soc=.65;state.minute=720;state.day=1;state.totals={solarWh:0,windWh:0,loadWh:0,importWh:0,exportWh:0};state.history=[];}
function calculate(s,dtHours=1/6){
 const p=s.params,c=s.counts;const irr=clamp(p.irr,0,1200),v=clamp(p.wind,0,25),invEff=p.invEff/100,rectEff=p.rectEff/100,battEff=p.battEff/100;
 const cellTemp=p.temp+(irr/800)*20; // aproximação didática da temperatura da célula, sem NOCT do fabricante
 const tempFactor=clamp(1-.0035*(cellTemp-25),0,1.2);
 const solarUnshaded=c.solar*irr*p.solarArea*(p.panelEff/100)*(p.solarSys/100);
 const solarW=solarUnshaded*(1-p.shade/100)*tempFactor;
 const rotorArea=Math.PI*p.windRadius*p.windRadius;
 const windAvailableOne=.5*p.rho*rotorArea*v*v*v;
 const windCalculatedOne=windAvailableOne*(p.cp/100)*(p.genEff/100);
 // Curva simplificada: abaixo de 3 m/s sem geração; acima de 25 m/s desarme; potência nominal didática de 5 kW por turbina.
 const windElectricOne=(v<3||v>=25)?0:Math.min(windCalculatedOne,5000);
 const windW=c.wind*windElectricOne;const windDc=windW*rectEff;
 const renewableDc=solarW+windDc;
 const loadW=c.load*p.loadW;
 const inverterCapacity=c.inverter*p.invKW*1000;
 const bankWh=c.battery*p.battV*p.battAh;
 const usableWh=bankWh*p.dod/100*battEff;
 const minSOC=1-p.dod/100;
 const batLimit=c.battery*p.battMaxW;
 const gridActive=(s.mode==='grid'&&s.gridEnabled);
 let fromSolarWindAc=Math.min(loadW,renewableDc*invEff,inverterCapacity),batDischargeDc=0,batChargeDc=0,batSupplyAc=0,gridImport=0,gridExport=0,unmet=0,curtailW=0;
 let remainingDC=renewableDc-fromSolarWindAc/invEff;
 if(loadW>fromSolarWindAc+1e-7){
   const acDeficit=loadW-fromSolarWindAc;
   const availableNomWh=Math.max(0,(s.soc-minSOC)*bankWh);
   batDischargeDc=Math.max(0,Math.min(acDeficit/invEff,batLimit,availableNomWh*battEff/Math.max(dtHours,.00001),(inverterCapacity-fromSolarWindAc)/invEff));
   batSupplyAc=batDischargeDc*invEff;
   const uncovered=Math.max(0,loadW-fromSolarWindAc-batSupplyAc);
   gridImport=gridActive?uncovered:0;
   unmet=gridActive?0:uncovered;
 }
 if(remainingDC>0){
   const headroom=Math.max(0,(1-s.soc)*bankWh);
   batChargeDc=Math.max(0,Math.min(remainingDC,batLimit,headroom/Math.max(dtHours*battEff,.00001)));
   remainingDC-=batChargeDc;
   gridExport=gridActive?Math.min(remainingDC*invEff,Math.max(0,inverterCapacity-fromSolarWindAc-batSupplyAc)):0;
   curtailW=Math.max(0,remainingDC-gridExport/invEff);
 }
 const invLoss=(fromSolarWindAc+batSupplyAc+gridExport)*(1/invEff-1);
 const rectLoss=windW*(1-rectEff);
 const batLoss=batChargeDc*(1-battEff)+batDischargeDc*(1/battEff-1);
 const lossW=invLoss+rectLoss+batLoss;
 const socDelta=bankWh>0?(batChargeDc*battEff-batDischargeDc/battEff)*dtHours/bankWh:0;
 const nextSOC=bankWh>0?clamp(s.soc+socDelta,0,1):0;
 const acServed=loadW-unmet;
 const sourceW=solarW+windW;
 const batteryStoredRate=batChargeDc*battEff-batDischargeDc/battEff;
 const signedGridW=gridImport-gridExport;
 const pSaldo=sourceW+signedGridW-loadW-lossW;
 const residual=sourceW+signedGridW-acServed-lossW-batteryStoredRate-curtailW;
 const saturation=inverterCapacity>0&&((fromSolarWindAc+batSupplyAc+gridExport)>=inverterCapacity-5);
 let status='Equilibrado',severity='ok';
 if(unmet>5){status='Déficit de energia';severity='bad';}
 else if(saturation&&curtailW>5){status='Limite do inversor';severity='warn';}
 else if(curtailW>5){status='Geração limitada';severity='warn';}
 else if(gridExport>5){status='Exportando excedente';severity='ok';}
 else if(batChargeDc>5){status='Bateria carregando';severity='ok';}
 else if(batDischargeDc>5){status='Bateria descarregando';severity='warn';}
 else if(gridImport>5){status='Importando da rede';severity='warn';}
 return {solarW,solarUnshaded,windW,windDc,windAvailableOne,windCalculatedOne,rotorArea,cellTemp,tempFactor,renewableDc,sourceW,loadW,acServed,fromSolarWindAc,batDischargeDc,batChargeDc,batSupplyAc,gridImport,gridExport,unmet,curtailW,invLoss,rectLoss,batLoss,lossW,socDelta,nextSOC,bankWh,usableWh,minSOC,batLimit,inverterCapacity,gridActive,batteryStoredRate,signedGridW,pSaldo,residual,status,severity,saturation};
}
function advance(state,minutes=10){const hours=minutes/60;const r=calculate(state,hours);state.soc=r.nextSOC;state.minute+=minutes;while(state.minute>=1440){state.minute-=1440;state.day++;}state.totals.solarWh+=r.solarW*hours;state.totals.windWh+=r.windW*hours;state.totals.loadWh+=r.acServed*hours;state.totals.importWh+=r.gridImport*hours;state.totals.exportWh+=r.gridExport*hours;return calculate(state);}
const kw=(w)=>w>=1000?`${(w/1000).toLocaleString('pt-BR',{maximumFractionDigits:2})} kW`:`${w.toLocaleString('pt-BR',{maximumFractionDigits:0})} W`;
const kwh=(wh)=>wh>=1000?`${(wh/1000).toLocaleString('pt-BR',{maximumFractionDigits:2})} kWh`:`${wh.toLocaleString('pt-BR',{maximumFractionDigits:0})} Wh`;
const num=(v,places=1)=>Number(v).toLocaleString('pt-BR',{minimumFractionDigits:places,maximumFractionDigits:places});
window.ELab=window.ELab||{};window.ELab.engine={defaults,schema,groups,scenarios,applyScenario,calculate,advance,clamp,kw,kwh,num};
})();
