/* eslint-disable */ // @ts-nocheck
'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export default function Builder() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  function toObjects(arr) {
    return arr.map(([d='',s='',p='']) => ({
      dish:  d.toString().trim(),
      desc:  s.toString().trim(),
      price: p.toString().trim()
    }));
  }

  async function handleCsvTxt(e) {
    const f = e.target.files?.[0]; if (!f) return;
    setLoading(true);
    const text = await f.text();
    const data = Papa.parse(text, { delimiter:/,|\t|\|/, skipEmptyLines:true }).data;
    setRows(toObjects(data));
    setLoading(false);
  }

  async function handleExcel(e) {
    const f = e.target.files?.[0]; if (!f) return;
    setLoading(true);
    const wb  = XLSX.read(await f.arrayBuffer());
    const arr = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header:1, blankrows:false });
    setRows(toObjects(arr));
    setLoading(false);
  }

  async function submitForReview() {
    if (!rows.length) return alert('Add some rows first');
    setLoading(true);
    const res = await fetch('/api/queue', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ items:rows, languages:['fr','es'] })
    });
    const j = await res.json();
    setLoading(false);
    j.ok ? alert('Uploaded for review ✅') : alert(j.error || 'Error');
    setRows([]);
  }

  return (
    <div style={{maxWidth:900,margin:'40px auto',fontFamily:'sans-serif'}}>
      <h2>Upload your menu (CSV / TXT / Excel)</h2>

      <input type="file" accept=".csv,.tsv,.txt" onChange={handleCsvTxt}/> &nbsp;
      <input type="file" accept=".xlsx"         onChange={handleExcel}/>

      {rows.length>0 && (
        <>
          <pre style={{whiteSpace:'pre-wrap',marginTop:20}}>
            {rows.map(r=>`${r.dish} | ${r.desc} | ${r.price}`).join('\n')}
          </pre>
          <button onClick={submitForReview} disabled={loading}
                  style={{marginTop:20,padding:'10px 24px',fontSize:16}}>
            {loading? 'Uploading…':'Submit for review'}
          </button>
        </>
      )}
    </div>
  );
}
