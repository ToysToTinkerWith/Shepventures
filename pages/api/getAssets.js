import NextCors from 'nextjs-cors'
import algosdk from "algosdk"

function replacer(key, value) {
  return typeof value === 'bigint' ? Number(value.toString()) : value
}

async function getAssets(req, res) {
  await NextCors(req, res, {
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
  })

  const indexerClient = new algosdk.Indexer('', 'https://mainnet-idx.algonode.cloud', 443)

  let response

  if (req.body.nextToken) {
    response = await indexerClient
      .lookupAccountAssets(req.body.address)
      .nextToken(req.body.nextToken)
      .limit(1000)
      .do()
  } else {
    response = await indexerClient
      .lookupAccountAssets(req.body.address)
      .limit(1000)
      .do()
  }

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(response, replacer))
}

export default getAssets
