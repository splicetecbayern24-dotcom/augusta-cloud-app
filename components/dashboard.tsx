"use client";
import { useState } from "react";

export function Dashboard() {

const [customer,setCustomer]=useState("")
const [project,setProject]=useState("")
const [email,setEmail]=useState("")
const [vat,setVat]=useState(19)

const [items,setItems]=useState([
{description:"Gerüstaufbau Einfamilienhaus",qty:1,unit:"pauschal",price:1200}
])

const net = items.reduce((s,i)=>s+i.qty*i.price,0)
const vatValue = net*(vat/100)
const gross = net+vatValue

return (
<div style={{padding:40,color:"white",background:"#0b1423",minHeight:"100vh"}}>

<h1>AUGUSTA Gerüstbau UG</h1>

<h2>Rechnung</h2>

<div style={{display:"grid",gap:10,maxWidth:500}}>

<input placeholder="Kunde" value={customer} onChange={e=>setCustomer(e.target.value)} />
<input placeholder="Projekt" value={project} onChange={e=>setProject(e.target.value)} />
<input placeholder="Kunden Email" value={email} onChange={e=>setEmail(e.target.value)} />
<input placeholder="MwSt %" value={vat} onChange={e=>setVat(Number(e.target.value))} />

</div>

<h3 style={{marginTop:30}}>Positionen</h3>

{items.map((i,index)=>(
<div key={index} style={{display:"flex",gap:10,marginBottom:10}}>
<input value={i.description} onChange={e=>{
const copy=[...items]
copy[index].description=e.target.value
setItems(copy)
}}/>

<input value={i.qty} type="number" onChange={e=>{
const copy=[...items]
copy[index].qty=Number(e.target.value)
setItems(copy)
}}/>

<input value={i.price} type="number" onChange={e=>{
const copy=[...items]
copy[index].price=Number(e.target.value)
setItems(copy)
}}/>

</div>
))}

<button onClick={()=>setItems([...items,{description:"",qty:1,unit:"",price:0}])}>
Position hinzufügen
</button>

<h3 style={{marginTop:30}}>Summen</h3>

<div>Netto: {net.toFixed(2)} €</div>
<div>MwSt: {vatValue.toFixed(2)} €</div>
<div><b>Brutto: {gross.toFixed(2)} €</b></div>

</div>
)
}
