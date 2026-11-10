const fs=require('fs'),vm=require('vm'),assert=require('assert');
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(__dirname+'/../js/engine.js','utf8'),sandbox);const E=sandbox.window.ELab.engine;
const approx=(a,b,tol=.001)=>assert(Math.abs(a-b)<tol,`${a} != ${b}`);
let s=E.defaults(),r=E.calculate(s);assert(r.solarW>0&&r.windW>0&&r.loadW>0);approx(r.residual,0,.001);assert(r.socDelta>0,'base deve carregar bateria');console.log('✓ Cenário base: balanço e carregamento');
s.params.wind=8;r=E.calculate(s);let p8=r.windAvailableOne;s.params.wind=4;r=E.calculate(s);approx(p8/r.windAvailableOne,8);console.log('✓ Lei cúbica da potência eólica');
s.params.irr=0;s.params.wind=0;s.mode='island';s.gridEnabled=false;s.counts.battery=0;r=E.calculate(s);assert(r.unmet===r.loadW);approx(r.residual,0,.001);console.log('✓ Ilha sem fontes: déficit integral');
s.mode='grid';s.gridEnabled=true;r=E.calculate(s);approx(r.gridImport,r.loadW);approx(r.unmet,0);approx(r.residual,0,.001);console.log('✓ Rede conectada importa déficit');
s=E.defaults();s.counts.inverter=0;s.mode='island';r=E.calculate(s);approx(r.unmet,r.loadW);assert(r.batChargeDc>0);approx(r.residual,0,.001);console.log('✓ Sem inversor: cargas CA sem fornecimento');
s=E.defaults();s.soc=.2;s.params.irr=0;s.params.wind=0;s.mode='island';s.gridEnabled=false;r=E.calculate(s);approx(r.batDischargeDc,0);approx(r.unmet,r.loadW);console.log('✓ Reserva de DoD impede descarga excessiva');
s=E.defaults();s.params.irr=1200;s.params.wind=12;s.counts.load=0;s.counts.battery=0;r=E.calculate(s);assert(r.gridExport<=r.inverterCapacity+1e-5);assert(r.curtailW>0);approx(r.residual,0,.001);console.log('✓ Exportação limitada e corte de geração');
s=E.defaults();s.params.irr=0;s.params.wind=0;s.mode='island';s.gridEnabled=false;s.counts.load=4;const old=s.soc;E.advance(s,10);assert(s.soc<old);approx(E.calculate(s).residual,0,.001);console.log('✓ SOC diminui no avanço');
// teste por propriedades: muitos perfis combinados, residuo de conservação deve permanecer próximo de zero
for(const irr of [0,400,800,1200])for(const wind of [0,3,7,14,25])for(const mode of ['grid','island'])for(const invert of [0,1,2])for(const load of [0,3,12]){s=E.defaults();s.params.irr=irr;s.params.wind=wind;s.mode=mode;s.counts.inverter=invert;s.counts.load=load;s.soc=.6;r=E.calculate(s);approx(r.residual,0,.005);assert(r.nextSOC>=0&&r.nextSOC<=1);assert(r.gridExport<=r.inverterCapacity+1e-5);assert(r.unmet>=0);assert(r.gridImport>=0);}
console.log('✓ 360 combinações de parâmetros conservam energia');
