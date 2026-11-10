/* EnergyLab PRO 3.0 — Núcleo do projeto aplicado da UC (16 h).
   Cálculos didáticos determinísticos, isolados da interface e testáveis. */
(function(){
'use strict';
const n=(v, fallback=0)=>{const x=Number(v);return Number.isFinite(x)?x:fallback};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,n(v)));
const round=(v,p=2)=>Math.round((v+Number.EPSILON)*10**p)/10**p;
function defaults(){return {
  meta:{version:3,updatedAt:'',evaluatedAt:'',completed:{},attempts:{},notes:'',student:''},
  site:{client:'Indústria Amazônia Verde (empresa fictícia)',city:'Rio Branco — AC (cenário fictício)',segment:'industrial',connection:'grid',supply:'127/220 V — valor ilustrativo a confirmar',consumption:1800,roof:100,usable:75,shade:8,tariffClass:'B',tariffType:'convencional',peakKWh:0,offPeakKWh:0,contractedKW:0,demandPrice:0,monthlyBill:0,gridComments:'Consultar o padrão de atendimento e os requisitos da concessionária antes de um projeto real.',hsp:4.5,tariff:.92},
  loads:[{id:'l1',name:'Motores de produção',qty:2,w:3000,h:8,days:22},{id:'l2',name:'Iluminação LED',qty:30,w:40,h:10,days:22},{id:'l3',name:'Máquinas auxiliares',qty:4,w:1500,h:4,days:22}],
  pv:{panel:'Módulo didático 550 Wp',wp:550,area:2.58,voc:49.5,vmp:41.5,isc:14,imp:13.25,betaVoc:-.28,betaVmp:-.35,series:10,parallel:2,tMin:10,tCellMax:70,pr:.78},
  inverter:{acKW:10,maxDC:600,mpptMin:120,mpptMax:500,mpptA:30,maxIscA:40,mpptCount:2,eff:.97},
  economics:{panelPrice:650,inverterPrice:10000,installationPerWp:1.2,engineering:3000,extras:2000,annualOM:1,recognized:80,lifetime:20},
  safety:{},docs:{},commission:{steps:{},fault:'shading',answer:'',attempts:0,passed:false},diagramReviewed:false
};}
const panelPresets={
 '550':{panel:'Módulo didático 550 Wp',wp:550,area:2.58,voc:49.5,vmp:41.5,isc:14,imp:13.25,betaVoc:-.28,betaVmp:-.35},
 '450':{panel:'Módulo didático 450 Wp',wp:450,area:2.10,voc:41.5,vmp:34.8,isc:13.8,imp:12.93,betaVoc:-.27,betaVmp:-.34},
 '600':{panel:'Módulo didático 600 Wp',wp:600,area:2.80,voc:52.5,vmp:44.2,isc:14.5,imp:13.57,betaVoc:-.29,betaVmp:-.35}
};
const money=v=>Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:2});
const number=(v,d=2)=>n(v).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
function siteCalc(p){
  let e=0,power=0,problems=[];
  const rows=p.loads.map(l=>{
    const qty=n(l.qty),w=n(l.w),h=n(l.h),days=n(l.days);
    if(qty<0||qty>10000||w<0||w>1000000||h<0||h>24||days<0||days>31||![qty,w,h,days].every(Number.isFinite)) problems.push(`Carga “${l.name}”: verifique quantidade, W, horas (0–24) e dias (0–31).`);
    const peak=qty*w/1000;const kwh=peak*h*days;e+=kwh;power+=peak;return {name:l.name,peak,kwh};
  });
  if(p.site.consumption<=0||p.site.consumption>1e7)problems.push('Informe consumo mensal válido, acima de 0 kWh.');
  if(p.site.roof<=0||p.site.usable<=0||p.site.usable>p.site.roof)problems.push('A área útil deve ser maior que zero e não ultrapassar a área total.');
  if(p.site.hsp<=0||p.site.hsp>10)problems.push('HSP didática deve ficar entre 0 e 10 h/dia.');
  if(!p.site.client.trim())problems.push('Identifique o cliente (use dados fictícios para exercícios).');
  return {rows,monthlyLoad:e,connectedKW:power,consumption:n(p.site.consumption),difference:e-n(p.site.consumption),problems};
}
function solarCalc(p){
  const d=p.pv,i=p.inverter,s=p.site;let errors=[],warnings=[];
  const integers=['series','parallel'];for(const k of integers)if(!Number.isInteger(n(d[k]))||n(d[k])<1||n(d[k])>60)errors.push(`Quantidade ${k==='series'?'de módulos em série':'de strings em paralelo'} deve ser inteira entre 1 e 60.`);
  if(n(d.wp)<=0||n(d.wp)>1500||n(d.area)<=0||n(d.area)>10)errors.push('Potência e área por módulo inválidas.');
  if(n(d.voc)<=0||n(d.vmp)<=0||n(d.vmp)>=n(d.voc))errors.push('Verifique as tensões: Voc precisa superar Vmp, e ambas devem ser positivas.');
  if(n(d.isc)<=0||n(d.imp)<=0||n(d.imp)>n(d.isc))errors.push('Verifique as correntes: Isc deve ser maior ou igual a Imp.');
  if(n(d.tMin)<-40||n(d.tMin)>80||n(d.tCellMax)<0||n(d.tCellMax)>110)errors.push('Temperaturas fora da faixa didática.');
  if(n(d.betaVoc)>=0||n(d.betaVmp)>=0||n(d.betaVoc)<-1||n(d.betaVmp)<-1)errors.push('Coeficientes térmicos de tensão devem ser negativos, em %/°C.');
  if(n(d.pr)<=0||n(d.pr)>1)errors.push('PR deve estar entre 0 e 1 (fração).');
  if(n(s.hsp)<=0||n(s.hsp)>10||n(s.shade)<0||n(s.shade)>100)errors.push('Verifique HSP e sombreamento (0–100%).');
  if(n(i.acKW)<=0||n(i.maxDC)<=0||n(i.mpptMin)<=0||n(i.mpptMax)<=i.mpptMin||n(i.mpptA)<=0||n(i.maxIscA)<=0||n(i.mpptCount)<1)errors.push('Parâmetros de inversor/MPPT inválidos.');
  const modules=n(d.series)*n(d.parallel),dcWp=modules*n(d.wp),area=modules*n(d.area),vocCold=n(d.voc)*(1+n(d.betaVoc)/100*(n(d.tMin)-25))*n(d.series),vmpHot=n(d.vmp)*(1+n(d.betaVmp)/100*(n(d.tCellMax)-25))*n(d.series),vmpSTC=n(d.vmp)*n(d.series), stringsPerMppt=Math.ceil(n(d.parallel)/Math.max(1,n(i.mpptCount))),mpptImp=n(d.imp)*stringsPerMppt,mpptIsc=n(d.isc)*stringsPerMppt,vmpCold=n(d.vmp)*(1+n(d.betaVmp)/100*(n(d.tMin)-25))*n(d.series),
  dcAc=dcWp/(n(i.acKW)*1000||1),
  dailyKWh=dcWp/1000*n(s.hsp)*n(d.pr)*(1-n(s.shade)/100),monthlyKWh=dailyKWh*30,
  coverage=n(s.consumption)>0?monthlyKWh/n(s.consumption)*100:0;
  if(area>n(s.usable)+1e-6)errors.push(`Área insuficiente: ${number(area,1)} m² de módulos para ${number(s.usable,1)} m² úteis.`);
  if(vocCold>n(i.maxDC)+1e-6)errors.push(`Voc no frio (${number(vocCold,1)} V) excede o limite CC do inversor (${number(i.maxDC,1)} V).`);
  if(vmpHot<n(i.mpptMin)-1e-6)errors.push(`Vmp na temperatura alta (${number(vmpHot,1)} V) abaixo do MPPT mínimo (${number(i.mpptMin,1)} V).`);
  if(vmpCold>n(i.mpptMax)+1e-6)errors.push(`Vmp no frio (${number(vmpCold,1)} V) excede o MPPT máximo (${number(i.mpptMax,1)} V).`);
  if(mpptImp>n(i.mpptA)+1e-6)errors.push(`Corrente Imp por MPPT (${number(mpptImp,2)} A) excede limite informado (${number(i.mpptA,2)} A).`);
  if(mpptIsc>n(i.maxIscA)+1e-6)errors.push(`Isc agregada por MPPT (${number(mpptIsc,2)} A) excede limite informado (${number(i.maxIscA,2)} A).`);
  if(vocCold<=0||vmpHot<=0||dcWp<=0)errors.push('Há resultados elétricos não físicos. Corrija as entradas.');
  if(dcAc<.7||dcAc>1.5)warnings.push(`Razão CC/CA de ${number(dcAc,2)}: examinar sobredimensionamento, subutilização e recorte (clipping) com curvas reais.`);
  if(monthlyKWh<n(s.consumption)*.9)warnings.push('A estimativa mensal fica abaixo de 90% do consumo informado; cobertura parcial pode ser uma decisão válida.');
  if(monthlyKWh>n(s.consumption)*1.2)warnings.push('Produção estimada acima do consumo: excedentes dependem de perfil de uso e regras de compensação.');
  if(!Number.isFinite(monthlyKWh)||monthlyKWh>1e8)errors.push('Resultado de energia inválido.');
  return {modules,dcWp,area,vocCold,vmpHot,vmpCold,vmpSTC,stringsPerMppt,mpptImp,mpptIsc,dcAc,dailyKWh,monthlyKWh,coverage,errors,warnings,valid:errors.length===0};
}
function economicsCalc(p){const s=solarCalc(p),e=p.economics;const cost=s.modules*n(e.panelPrice)+n(e.inverterPrice)+s.dcWp*n(e.installationPerWp)+n(e.engineering)+n(e.extras);
 const credited=Math.min(n(p.site.consumption),Math.max(0,s.monthlyKWh))*clamp(n(e.recognized),0,100)/100;
 const monthlySavings=credited*n(p.site.tariff),annualOM=cost*n(e.annualOM)/100,annualNet=monthlySavings*12-annualOM;
 const payback=annualNet>0?cost/annualNet:null;
 const horizon=clamp(n(e.lifetime),1,40);const totalNet=annualNet*horizon-cost;
 const valid=p.site.connection==='grid'&&s.valid&&n(p.site.tariff)>0&&n(e.recognized)>=0&&n(e.recognized)<=100&&n(e.annualOM)>=0&&n(e.annualOM)<=30&&cost>0&&n(e.lifetime)>=1;
 return {investment:cost,credited,monthlySavings,annualOM,annualNet,payback,totalNet,horizon,valid,solar:s};}
const safetyQuestions=[
 {id:'site',text:'Área, estrutura e acesso foram avaliados por responsável competente?',detail:'Risco estrutural, circulação, intempéries e rotas de acesso.'},
 {id:'risk',text:'Análise de riscos e procedimentos de trabalho estão documentados?',detail:'A simulação não substitui APR, procedimentos nem autorização profissional.'},
 {id:'equip',text:'EPI/EPC e treinamentos pertinentes estão previstos?',detail:'A seleção depende do risco, serviço e legislação aplicável.'},
 {id:'isolation',text:'Seccionamento, identificação e prevenção de energização foram planejados?',detail:'Circuitos FV podem permanecer energizados sob iluminação.'},
 {id:'cables',text:'Cabos, conectores, proteções e encaminhamento foram verificados?',detail:'Dimensionamentos dependem das condições reais, dados e normas.'},
 {id:'earthing',text:'Aterramento, proteção e equipotencialização foram avaliados?',detail:'Considerar interfaces CC e CA e documentação do projeto.'},
 {id:'signs',text:'Sinalizações, acessibilidade e identificação estão previstas?',detail:'Facilitam operação e manutenção seguras.'},
 {id:'environment',text:'Resíduos e destinação ambiental estão planejados?',detail:'Inclui embalagens, módulos, baterias e resíduos de instalação.'},
 {id:'data',text:'Registros do cliente e documentos estão protegidos?',detail:'Use dados fictícios; evite dados pessoais reais em computadores compartilhados.'}
];
const documentItems=[
 {id:'form',text:'Formulário de solicitação / regras da distribuidora',detail:'Aplicabilidade e modelo variam conforme concessionária e modalidade.'},
 {id:'client',text:'Dados da unidade consumidora e do interessado',detail:'Para o exercício, utilizar apenas dados fictícios.'},
 {id:'diagram',text:'Diagrama elétrico e memorial descritivo',detail:'Compatibilizar com equipamentos e requisitos do projeto.'},
 {id:'catalog',text:'Catálogos e identificação de módulos e inversor',detail:'Conferir parâmetros e certificações exigíveis.'},
 {id:'technical',text:'Documentação de responsabilidade técnica',detail:'Consultar exigências do conselho e concessionária.'},
 {id:'connection',text:'Requisitos de acesso, inspeção e conexão',detail:'Documentação e prazos dependem do atendimento específico.'}
];
const commissioningSteps=[
 {id:'inspection',text:'Inspeção visual e correspondência com documentação concluídas'},
 {id:'polarity',text:'Polaridade e identificação dos circuitos foram verificadas em ambiente simulado'},
 {id:'limits',text:'Voc no frio e faixa MPPT foram comparados aos limites de catálogo'},
 {id:'protection',text:'Proteção, seccionamento e aterramento avaliados documentalmente'},
 {id:'record',text:'Resultados, não conformidades e recomendações registrados'}
];
const faultCases={
 shading:{title:'Sombreamento parcial',hint:'Compare a corrente efetiva de uma string com a corrente esperada na mesma irradiância.',data:'Uma string apresenta corrente 45% menor que as demais, com tensão próxima da prevista.',correct:'shadow'},
 polarity:{title:'Polaridade invertida',hint:'Pense no sinal da medida de tensão nos terminais.',data:'A leitura de tensão de um circuito CC aparece com polaridade negativa em relação aos pontos de referência simulados.',correct:'polarity'},
 mppt:{title:'Incompatibilidade MPPT',hint:'O MPPT precisa operar dentro de uma janela de tensão.',data:'A tensão de operação em alta temperatura fica abaixo da tensão mínima de MPPT registrada no catálogo.',correct:'mppt'},
 open:{title:'String interrompida',hint:'O que acontece com a corrente ao se interromper um circuito?',data:'Uma das strings apresenta corrente nula apesar de irradiância disponível; outras continuam operando.',correct:'open'}
};
function assessment(p){const s=siteCalc(p),d=solarCalc(p),e=economicsCalc(p);const safetyCount=safetyQuestions.filter(x=>p.safety[x.id]===true).length;
 const completed=p.meta.completed||{};const goals={vistoria:s.problems.length===0&&p.loads.length>0&&!!completed.vistoria,dimensionamento:d.valid&&!!completed.dimensionamento,diagrama:!!p.diagramReviewed,seguranca:safetyCount===safetyQuestions.length&&!!completed.seguranca,comissionamento:commissioningSteps.every(x=>p.commission.steps[x.id])&&!!p.commission.passed&&!!completed.comissionamento,economia:e.valid&&!!completed.economia,relatorio:!!completed.relatorio};
 const done=Object.values(goals).filter(Boolean).length;
 return {goals,done,total:7,site:s,solar:d,economics:e,safetyCount,issues:[...s.problems,...d.errors]};
}
window.ELab=window.ELab||{};window.ELab.projectEngine={defaults,panelPresets,siteCalc,solarCalc,economicsCalc,safetyQuestions,documentItems,commissioningSteps,faultCases,assessment,money,number,round,clamp};
})();
