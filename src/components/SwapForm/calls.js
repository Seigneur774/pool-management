/* eslint-disable eqeqeq */
import { bPoolService } from 'core/services'
import { web3Lib } from 'core/libs'

export const updatePriceExactAmountIn = async (data, error) => { }
export const updatePriceExactAmountOut = async (data, error) => { }
export const updatePriceExactMarginalPrice = async (data, error) => { }


export const swapExactAmountIn = async (data, error) => {
  const {
    provider, address, inputAmount, inputToken, outputToken, updateTokenParams
  } = data
  let { outputLimit, limitPrice } = data

  // Empty limit price = no price limit
  if (!limitPrice || limitPrice == 0) {
    limitPrice = web3Lib.hexToNumberString(web3Lib.MAX_UINT)
  }

  // Empty output limit = no minimum
  if (!outputLimit) {
    outputLimit = '0'
  }

  const call = await bPoolService.swapExactAmountIn(
    provider,
    address,
    inputToken,
    web3Lib.toWei(inputAmount),
    outputToken,
    web3Lib.toWei(outputLimit),
    web3Lib.toWei(limitPrice)
  )

  if (call.result === 'failure') {
    error(call.data.error.message)
  } else {
    updateTokenParams()
  }
}

export const swapExactAmountOut = async (data, error) => {
  const {
    provider, address, outputAmount, inputToken, outputToken, updateTokenParams
  } = data
  let { inLimit, limitPrice } = data

  // Empty limit price = no price limit
  if (!limitPrice || limitPrice == 0) {
    limitPrice = web3Lib.hexToNumberString(web3Lib.MAX_UINT)
  }

  // Empty input limit = no maximum input
  if (!inLimit || inLimit == 0) {
    inLimit = web3Lib.hexToNumberString(web3Lib.MAX_UINT)
  }


  const call = await bPoolService.swapExactAmountOut(
    provider,
    address,
    inputToken,
    web3Lib.toWei(inLimit),
    outputToken,
    web3Lib.toWei(outputAmount),
    web3Lib.toWei(limitPrice)
  )

  if (call.result === 'failure') {
    error(call.data.error.message)
  } else {
    updateTokenParams()
  }
}


export const swapExactMarginalPrice = async (data, error) => {
  const {
    provider, address, outLimit, inLimit, inputToken, outputToken, marginalPrice, updateTokenParams
  } = data
  const call = await bPoolService.swapExactMarginalPrice(
    provider,
    address,
    inputToken,
    web3Lib.toWei(inLimit),
    outputToken,
    web3Lib.toWei(outLimit),
    web3Lib.toWei(marginalPrice)
  )

  if (call.result === 'failure') {
    error(call.data.error.message)
  } else {
    updateTokenParams()
  }
}

