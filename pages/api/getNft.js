import NextCors from 'nextjs-cors'
import algosdk from 'algosdk'

// Custom replacer to safely convert BigInt values
function replacer(key, value) {
  return typeof value === 'bigint' ? Number(value.toString()) : value
}

async function getNft(req, res) {
  await NextCors(req, res, {
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
  })

  const indexerClient = new algosdk.Indexer('', 'https://mainnet-idx.algonode.cloud', 443)

  try {
    const response = await indexerClient
      .searchForAssets()
      .index(req.body.nftId)
      .do()

    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(response, replacer))
  } catch (err) {
    console.error('Indexer error:', err)
    res.status(500).json({ error: 'Failed to fetch NFT data' })
  }
}

export default getNft
