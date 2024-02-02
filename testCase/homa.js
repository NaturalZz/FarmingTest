const { ApiPromise, WsProvider } = require('@polkadot/api')
const { options } = require('@acala-network/api')
const { Wallet } = require('@acala-network/sdk')

async function main () {
  const ENDPOINT = "wss://mandala-tc9-rpc.aca-staging.network"

  const api = await ApiPromise.create(options({ provider: new WsProvider(ENDPOINT) }))
  const wallet = new Wallet(api)

  await wallet.isReady

  const homa = wallet.homa
  const env = await homa.getEnv()

  // total staking token in homa
  console.log(env.totalStaking.toString())
  // total liquid token in homa
  console.log(env.totalLiquidity.toString())
  // homa apy
  console.log(env.apy.toString())
  // homa exchange apy
  console.log(env.exchangeRate.toString())
  // min mint threshold
  console.log(env.mintThreshold.toString())
  // min redeem threshold
  console.log(env.redeemThreshold.toString())
  // staking soft cap
  console.log(env.stakingSoftCap.toString())
}

;main()