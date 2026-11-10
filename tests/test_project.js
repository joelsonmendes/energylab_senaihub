const assert=require('assert');global.window={};require('../js/project_engine.js');const e=window.ELab.projectEngine;
const eq=(a,b,t=1e-7)=>assert(Math.abs(a-b)<t,`Expected ${a} ≈ ${b}`);
let p=e.defaults(),s=e.siteCalc(p),d=e.solarCalc(p),eco=e.economicsCalc(p);
assert(!s.problems.length,'vistoria inicial deve ter dados válidos');assert(s.monthlyLoad>0);assert(d.valid,'configuração base deve ser consistente');
assert.strictEqual(d.modules,20);eq(d.dcWp,11000);eq(d.area,51.6);
eq(d.monthlyKWh,11*4.5*.78*(1-.08)*30);eq(d.vocCold,10*49.5*(1-.0028*(10-25)));eq(d.mpptImp,13.25);assert(eco.valid);assert(eco.payback>0);
assert.strictEqual(e.assessment(p).done,0,'etapas não podem ser concluídas sem ato explícito do aluno');
p.meta.completed.vistoria=true;p.meta.completed.dimensionamento=true;p.meta.completed.economia=true;assert.strictEqual(e.assessment(p).done,3);
p.pv.series=13;assert(e.solarCalc(p).errors.some(x=>x.includes('Voc')),'Voc a frio deve violar limite');
p.pv.series=10;p.pv.parallel=5;assert(e.solarCalc(p).errors.some(x=>x.includes('Área')),'área extrapolada deve alertar');
p.pv.parallel=3;p.inverter.mpptCount=1;assert(e.solarCalc(p).errors.some(x=>x.includes('Corrente')),'limite por MPPT deve alertar');
p.inverter.mpptCount=2;p.pv.parallel=2;p.pv.series=2;assert(e.solarCalc(p).errors.some(x=>x.includes('MPPT mínimo')),'MPPT insuficiente deve alertar');
p.pv.series=10;p.site.connection='island';assert.strictEqual(e.economicsCalc(p).valid,false,'não estimar compensação de fatura off-grid');
p.site.connection='grid';p.site.usable=20;assert(!e.solarCalc(p).valid,'área indisponível invalida projeto');
p.site.usable=75;p.loads=[{id:'1',name:'Carga',qty:1,w:1000,h:25,days:22}];assert(e.siteCalc(p).problems.length,'horas de carga inválidas');
p=e.defaults();p.safety=Object.fromEntries(e.safetyQuestions.map(x=>[x.id,true]));p.meta.completed.seguranca=true;p.commission.steps=Object.fromEntries(e.commissioningSteps.map(x=>[x.id,true]));p.commission.passed=true;p.meta.completed.comissionamento=true;p.diagramReviewed=true;
assert(e.assessment(p).goals.seguranca&&e.assessment(p).goals.comissionamento&&e.assessment(p).goals.diagrama);
let checked=0;for(let i=0;i<400;i++){
  p=e.defaults();p.pv.series=1+i%13;p.pv.parallel=1+i%6;p.site.hsp=2+(i%7)/2;p.site.shade=i%60;p.pv.tMin=-15+i%45;p.inverter.mpptCount=1+i%4;
  const r=e.solarCalc(p);assert(Number.isFinite(r.dailyKWh)&&r.dailyKWh>=0);assert(Number.isFinite(r.vocCold));assert(Array.isArray(r.errors));checked++;
}
console.log('✓ Núcleo FV, temperatura, MPPT, área, HSP, viabilidade, evidências, normas didáticas e '+checked+' casos paramétricos');
