/* eslint-disable */ // @ts-nocheck
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function Admin() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from('upload_queue')
    .select('id, uploaded_csv, languages, status, notes')
    .neq('status', 'approved')
    .order('created_at', { ascending: false });

  async function approve(id:string) {
    await fetch('/api/admin/approve', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ id })
    }).then(()=>location.reload());
  }

  async function reject(id:string) {
    const n = prompt('Reason?'); if(n===null) return;
    await fetch('/api/admin/reject', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ id, notes:n })
    }).then(()=>location.reload());
  }

  return (
    <div style={{maxWidth:900,margin:'40px auto',fontFamily:'sans-serif'}}>
      <h2>Pending uploads</h2>
      {!data?.length && <p>No pending items 🎉</p>}
      {data?.map(row=>(
        <div key={row.id} style={{border:'1px solid #ccc',margin:'12px 0',padding:12}}>
          <pre style={{whiteSpace:'pre-wrap',fontSize:14}}>
            {row.uploaded_csv.map((r:any)=>`${r.dish} | ${r.desc} | ${r.price}`).join('\n')}
          </pre>
          <button onClick={()=>approve(row.id)} style={{marginRight:8}}>Approve</button>
          <button onClick={()=>reject(row.id)}>Reject</button>
          {row.notes && <p><em>{row.notes}</em></p>}
        </div>
      ))}
    </div>
  );
}
