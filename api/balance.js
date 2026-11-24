import { getSolBalance } from '../lib/drain.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
    try {
        const sol = await getSolBalance(req.query.owner);
            res.status(200).json({ sol });
              } catch {
                  res.status(200).json({ sol: 0 });
                    }
                    }