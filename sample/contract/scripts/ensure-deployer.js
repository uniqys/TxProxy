/*
  Copyright 2018 Bit Factory, Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

const fs = require('fs')
const fsPath = require('fs-path')
const path = require('path')
const readline = require('readline-sync')
const axios = require('axios')
const Web3 = require('web3')
const Wallet = require('ethereumjs-wallet')
const web3 = new Web3('https://ropsten.infura.io/')

const keystorePath = path.resolve(__dirname, '../keystore/deployer.json')
const address = fs.existsSync(keystorePath) ? readAccount(keystorePath) : generateAccount(keystorePath)
ensureBalance(address)

function readAccount(savePath) {
  const keystore = JSON.parse(fs.readFileSync(savePath))
  return `0x${keystore.address}`
}

function generateAccount(savePath) {
  console.log('デプロイ用のアカウントを作成します')
  const password = readline.question('パスワードを設定してください: ')
  const wallet = Wallet.generate()
  const address = wallet.getChecksumAddressString()
  const keystore = wallet.toV3(password)
  fsPath.writeFileSync(savePath, JSON.stringify(keystore))

  console.log(`アカウントを作成しました:
    keystore: ${savePath}
    address:  ${address}`
  )
  return address
}

async function ensureBalance(address) {
  const balance = await getBalance(address)
  console.log(`ETH残高[${address}]: ${balance}(wei)`)
  if (checkEnoughBalance(balance)) return
  console.log('アカウントにETHを受け取ります')
  const res = await axios.post('https://ropsten.faucet.b9lab.com/tap', { toWhom: address })
  if (res.status !== 200) {
    console.error('ETH受け取りに失敗しました')
    return
  }
  console.log(`ETH受け取りトランザクション: ${res.data.txHash}`)
  const newBalance = await waitForGetEth(address, balance)
  console.log('ETH受け取りが完了しました')
  console.log(`ETH残高[${address}]: ${newBalance}(wei)`)
}

async function getBalance(address) {
  return await web3.eth.getBalance(address, 'latest')
}

function checkEnoughBalance(balance) {
  return parseInt(balance, 10) > 40000000000000000
}

async function waitForGetEth(address, before) {
  let balance = await getBalance(address)
  while (before === balance) {
    process.stdout.write('.')
    await new Promise(resolve => setTimeout(resolve, 2000))
    balance = await getBalance(address)
  }
  console.log()
  return balance
}
