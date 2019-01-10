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

import Koa from 'koa'
import Router from 'koa-router'
import BodyParser from 'koa-bodyparser'
import KoaLogger from 'koa-logger'
import axios from 'axios'
import { SignedTxForProxy } from '@uniqys/tx-proxy-lib'
import debug from 'debug'
const logger = debug('app')

type Config = { endpoint: string }
const CONFIG: { [key: string]: Config } = {
  development: {
    endpoint: 'https://us-central1-tx-proxy-develop.cloudfunctions.net'
  },
  test: {
    endpoint: 'http://localhost:5000/tx-proxy-develop/us-central1'
  }
}

export class App extends Koa {
  constructor () {
    super()
    const accessToken = process.env.TX_PROXY_TOKEN
    if (!accessToken) throw new Error('access token required')
    const txProxy = axios.create({
      baseURL: CONFIG[this.env].endpoint,
      // set header `Authorization: Bearer YOUR-TOKEN`
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
      // OR set request parameter `?access_token=YOUR-TOKEN`
      // params: {
      //   'access_token': accessToken
      // }
    })
    const router = new Router()
      .get('/hello', (ctx) => {
        ctx.body = 'Hello!'
      })
      .post('/proxy', BodyParser(), async (ctx) => {
        const tx = ctx.request.body as SignedTxForProxy
        logger('proxy request from %s', tx.from)
        // NOTE: check user login?
        try {
          const res = await txProxy.post('/proxy', tx)
          if (!res.data.transactionHash) {
            logger('invalid response: %o', res.data)
            ctx.throw(500)
          }
          ctx.body = { transactionHash: res.data.transactionHash }
        } catch (err) {
          logger('failed proxy tx: %d %s', err.response.status, err.response.data)
          ctx.throw(500, err.response.data)
        }
      })

    this.use(KoaLogger())
      .use(router.routes())
      .use(router.allowedMethods())
  }
}
