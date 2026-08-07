// Minimal Express server scaffold for proxies (IA, Google Sheets sync)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health
app.get('/health', (req,res)=> res.json({ ok:true }));

// Placeholder endpoint for IA proxy - requires OPENAI_KEY in env
app.post('/api/ai', async (req,res)=>{
  if(!process.env.OPENAI_KEY) return res.status(501).json({ error:'AI not configured' });
  // Implement proxy to OpenAI here
  return res.status(501).json({ error:'Not implemented on server side. Configure OPENAI_KEY and implement proxy.' });
});

// Placeholder endpoint for Google Sheets sync - requires SERVICE_ACCOUNT and SHEET_ID
app.post('/api/sheets/sync', async (req,res)=>{
  return res.status(501).json({ error:'Sheets sync not configured. Place service account and implement sync.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server running on', PORT));
