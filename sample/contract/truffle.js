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

const WalletProvider = require('truffle-wallet-provider')
const path = require('path')
const readline = require('readline-sync')

let wallet = null

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function () {
        while (!wallet) {
          const keystorePath = path.resolve(__dirname, './keystore/deployer.json')
          const keystore = require(keystorePath)
          const password = readline.question('アカウントのパスワードを入力してください: ')
          const Wallet = require('ethereumjs-wallet')
          try {
            wallet = Wallet.fromV3(keystore, password)
          } catch (e) {
            console.log(e.message)
          }
        }

        return new WalletProvider(wallet, 'https://ropsten.infura.io/')
      },
      gas: 1000000,
      gasPrice: 10000000000, // 10 gwei
      network_id: '3'
    }
  }
};
