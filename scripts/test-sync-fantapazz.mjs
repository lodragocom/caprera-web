import test from 'node:test'
import assert from 'node:assert/strict'
import { planSync } from './lib/piano-sync-fantapazz.mjs'

const bonuses=new Map([['gol',3]])
const url='https://www.fantapazz.com/fantacalcio/formazioni-in-campo-lega/767/1/342460'
function fixture() {
  const p={ordine:1,casa:'uno',fuori:'due',gol_casa:null,gol_fuori:null,fp_casa:null,fp_fuori:null,giocata:false,tipo:'partita'}
  const f=societa=>({competizione:'campionato',fonte:url,casa:p.casa,fuori:p.fuori,societa,serie_a:7,stato:'provvisorio',modulo:'4-3-3',inviata:'oggi',modificatori:[],
    giocatori:['P','D','D','D','D','C','C','C','A','A','A'].map((ruolo,i)=>({fantapazz_id:i+1,titolare:true,ordine:i+1,nome:`G${i}`,ruolo,sfida:'a-b',fascia:null,voto:null,entrato:false,bonus:[]}))})
  return {stagione:'2026-27',sha256:'a'.repeat(64),acquisito_al:'2026-10-18T10:00:00Z',
    calendari:[{id:'campionato',girone:null,turni:[{ordine:1,nome:'Giornata 1',data:'2026-10-18',serie_a:7,fonte:url,partite:[p]}]}],
    formazioni:[f('uno'),f('due')],classifiche:[{id:'campionato',righe:['uno','due'].map((societa,i)=>({societa,posizione:i+1,punti:0,vinte:0,pari:0,perse:0,gol_fatti:0,gol_subiti:0,fantapunti:0,fp_subiti:0}))}]}
}
const next=before=>({...structuredClone(before),sha256:'b'.repeat(64),acquisito_al:'2026-10-18T11:00:00Z'})
const first=s=>s.calendari[0].turni[0].partite[0]
function published() {
  const s=fixture(),p=first(s);Object.assign(p,{giocata:true,gol_casa:0,gol_fuori:0,fp_casa:66,fp_fuori:66})
  for (const f of s.formazioni) {f.stato='concluso';for (const g of f.giocatori)g.voto=6}
  for (const r of s.classifiche[0].righe)Object.assign(r,{punti:1,pari:1,fantapunti:66,fp_subiti:66})
  return s
}
test('ripetizione identica senza cambiamenti',()=>{const s=fixture();assert.equal(planSync(s,s,bonuses).changed,false)})
test('variazione capitano conservata anche durante turno live',()=>{const a=fixture(),b=next(a);b.formazioni[0].giocatori[0].fascia='C';assert.equal(planSync(a,b,bonuses).changedFormations.length,1)})
test('risultato pubblicato e quadrato accettato',()=>{const a=fixture(),b=next(published());assert.equal(planSync(a,b,bonuses).changedMatches.length,1)})
test('rettifica evidenziata',()=>{const a=published(),b=next(a);first(b).fp_casa+=1;b.formazioni[0].giocatori[0].voto+=1;b.classifiche[0].righe[0].fantapunti+=1;b.classifiche[0].righe[1].fp_subiti+=1;assert.equal(planSync(a,b,bonuses).corrections.length,1)})
test('ritiro risultato evidenziato come rettifica',()=>{const a=published(),b=next(fixture());assert.equal(planSync(a,b,bonuses).corrections.length,1)})
for (const [name,mutate] of [
  ['login o risposta vuota',b=>{b.calendari=[]}],
  ['stagione diversa',b=>{b.stagione='2027-28'}],
  ['data arretrata',b=>{b.acquisito_al='2026-10-17'}],
  ['copertura diminuita',b=>{b.calendari[0].turni=[]}],
  ['formazione sparita',b=>{b.formazioni.pop()}],
  ['giocatore duplicato',b=>{b.formazioni[0].giocatori[1].fantapazz_id=1}],
  ['panchina senza ordine',b=>{b.formazioni[0].giocatori[1].ordine=5}],
  ['modulo errato',b=>{b.formazioni[0].modulo='3-4-3'}],
  ['voto live negli ufficiali',b=>{b.formazioni[0].giocatori[0].voto=6}],
  ['bonus sconosciuto',b=>{b.formazioni[0].giocatori[0].bonus=['ignoto']}],
  ['classifica scollegata dai risultati',b=>{b.classifiche[0].righe[0].punti=3}],
  ['stessa impronta con contenuto diverso',b=>{b.sha256='a'.repeat(64)}],
]) test(`blocca ${name}`,()=>{const a=fixture(),b=next(a);mutate(b);assert.throws(()=>planSync(a,b,bonuses))})
test('totale non quadrato blocca la pubblicazione',()=>{const a=fixture(),b=next(published());b.formazioni[0].giocatori[0].voto=7;assert.throws(()=>planSync(a,b,bonuses),/Totale non coincidente/)})
test('risultato nuovo richiede entrambi i tabellini',()=>{const a=fixture();a.formazioni=[];const b=next(published());b.formazioni.pop();assert.throws(()=>planSync(a,b,bonuses),/entrambe le formazioni/)})
