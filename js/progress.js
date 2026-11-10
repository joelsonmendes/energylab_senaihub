(function(){
'use strict';
const KEY='energylab-progress-v1';
const create=()=>({modules:{},challenges:{},totalAttempts:0,totalCorrect:0});
function load(){try{const raw=JSON.parse(localStorage.getItem(KEY));if(raw&&typeof raw==='object')return {...create(),...raw,modules:raw.modules||{},challenges:raw.challenges||{}};}catch(e){}return create();}
function save(p){try{localStorage.setItem(KEY,JSON.stringify(p));}catch(e){/* Modo privado pode bloquear armazenamento */}}
function getModule(p,id){if(!p.modules[id])p.modules[id]={questions:[{attempts:0,correct:false,hint:0},{attempts:0,correct:false,hint:0}]};return p.modules[id];}
function completed(p){return window.ELab.content.modules.filter(m=>getModule(p,m.id).questions.every(q=>q.correct)).length;}
function attempts(p){return Object.values(p.modules).flatMap(x=>x.questions||[]).reduce((a,q)=>a+(q.attempts||0),0);}
function successes(p){return Object.values(p.modules).flatMap(x=>x.questions||[]).filter(q=>q.correct).length;}
function reset(){try{localStorage.removeItem(KEY);}catch(e){}return create();}
window.ELab=window.ELab||{};window.ELab.progress={load,save,getModule,completed,attempts,successes,reset};
})();
