<!--
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
-->

<template>
  <div>
    <div class="navbar navbar-light bg-light">
      <div class="container">
        <div class="navbar-brand">Messages</div>
        <div class="navbar-text">
          A sample of Tx Proxy
        </div>
      </div>
    </div>
    <div class="container" style="margin-top: 40px; margin-bottom: 60px;">
      <section class="jumbotron">
        <h1>Messages</h1>
        <p>Messages is a simple application that can post and read messages.</p>
      </section>

      <section>
        <h2>Settings</h2>
        <form>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="proxyCheckbox" v-model="useProxy" :disabled="!balance">
            <label class="form-check-label" for="proxyCheckbox">send transaction via TxProxy (ETH required if disable this option)</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="agentCheckbox" v-model="useAgent" :disabled="!agentAddress">
            <label class="form-check-label" for="agentCheckbox2">use Agent for existing contract (create Agent if enable this option)</label>
          </div>
        </form>
      </section>
      <section>
        <h2>Your account</h2>
        <p>These is your account address.</p>
        <div v-if="!networkId" class="alert alert-danger" role="alert">
          Please change your Ethereum network to Ropsten.
        </div>

        <dl class="row">
          <dt class="col-sm-2">Account</dt>
          <dd class="col-sm-10">{{account}}</dd>
          <dt class="col-sm-2">Agent</dt>
          <dd class="col-sm-10" v-if="agentAddress">{{agentAddress}}</dd>
          <dd class="col-sm-10" v-else>
            <button
              class="btn btn-primary btn-block"
              type="button"
              :disabled="!isInitialized"
              @click.prevent="newAgent"
            >new Agent</button>
          </dd>
        </dl>
        <div v-if="newAgentResult.receipt" class="alert alert-success" role="alert">
          Success! Your agent is created.
        </div>
        <div v-else-if="newAgentResult.error" class="alert alert-danger" role="alert">
          {{postResult.error.message}}
        </div>
        <div v-else-if="newAgentResult.transactionHash" class="alert alert-success" role="alert">
          Your transaction has been sent successfully. (txHash: {{newAgentResult.transactionHash}})
        </div>
      </section>
      <section>
        <h2>Post a message</h2>
        <p>Let's try posting a message to the timeline.</p>

        <form>
          <div class="form-group row">
            <label for="message" class="col-sm-2">message</label>
            <div class="col-sm-10">
              <textarea
                class="form-control"
                v-model="inputMessage"
                required
                placeholder="Hello uniqys!"
              ></textarea>
            </div>
          </div>
          <div class="form-group row">
            <div class="col-sm-10 offset-sm-2">
              <button
                class="btn btn-primary btn-block"
                type="button"
                :disabled="!isInitialized"
                @click.prevent="postMessage"
              >post message</button>
            </div>
          </div>
        </form>
        <div v-if="postResult.receipt" class="alert alert-success" role="alert">
          Success! Your post has been included in block.
        </div>
        <div v-else-if="postResult.error" class="alert alert-danger" role="alert">
          {{postResult.error.message}}
        </div>
        <div v-else-if="postResult.transactionHash" class="alert alert-success" role="alert">
          Your transaction has been sent successfully. (txHash: {{postResult.transactionHash}})
        </div>
      </section>

      <section>
        <h2>Messages Timeline</h2>
        <p>This Timeline displays all the messages recorded in the blockchain.</p>

        <div v-if="messages && messages.length">
          <div class="list-group">
            <div v-for="message in messages" :key="message.id"
              class="list-group-item flex-column align-items-start"
            >
              <p class="mb-1">{{message.contents}}</p>
              <p class="mb-1">
                <small>
                  Sender: {{message.sender}}<br>
                </small>
              </p>
            </div>
          </div>
        </div>
        <div v-else>
          <p>Let's post your message.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Web3 from 'web3';
import Contract from 'web3/eth/contract';
import artifact from '@contracts/Messages.json';
import { AgentProvider, ProxyProvider, SignedTxForProxy, AgentManagerContract, senderPlaceholder } from '@uniqys/tx-proxy-lib';
import axios from 'axios';

@Component
export default class Messages extends Vue {
  @Prop(Web3) web3!: Web3
  @Prop(String) account!: string
  networkId = 0
  balance = 0
  useProxy = true
  useAgent = false
  agentManager: AgentManagerContract | null = null
  agentAddress = ''
  contract: Contract | null = null
  inputMessage = ''
  messages: { contents: string, sender: string }[] = []
  newAgentResult: { transactionHash: string | null, receipt: {} | null, error: Error | null } = {
    transactionHash: null,
    receipt: null,
    error: null
  }
  postResult: { transactionHash: string | null, receipt: {} | null, error: Error | null } = {
    transactionHash: null,
    receipt: null,
    error: null
  }
  async created () {
    const network = await this.web3.eth.net.getId()
    const contract = new this.web3.eth.Contract(artifact.abi, artifact.networks[network].address)
    // set proxy provider
    const base = this.web3.currentProvider
    const proxy = new ProxyProvider(base, tx => this.sendTx(tx))
    const agent = new AgentProvider(proxy)
    this.agentManager = agent.manager
    contract.setProvider(agent)
    this.contract = contract
  }
  get isInitialized(): boolean {
    return !!(this.contract && this.account)
  }
  @Watch('isInitialized')
  async updateAtInitialized () {
    this.updateBalance()
    this.updateMessages()
    this.updateAgentAddress()
    this.updateNetworkId()
  }
  async updateBalance () {
    const balance = await this.web3.eth.getBalance(this.account) as any as string
    this.balance = parseInt(balance, 10)
  }
  async updateMessages () {
    if (!this.isInitialized) return
    const count = parseInt(await this.contract!.methods.count().call(), 10)
    this.messages = await Promise.all([...Array(count).keys()].reverse().map(i => this.contract!.methods.messages(i).call()))
  }
  async updateAgentAddress () {
    if (!this.isInitialized) return
    const addr = await this.agentManager!.agentOf(this.account)
    if (addr) {
      this.agentAddress = addr
    }
  }
  async updateNetworkId () {
    if (!this.isInitialized) return
    const networkId = await this.web3.eth.net.getId()
    if (networkId) {
      this.networkId = networkId
    }
  }
  async newAgent() {
    if (!this.isInitialized) return
    this.newAgentResult = { transactionHash: null, receipt: null, error: null }
    const tx = { from: this.account, proxy: this.useProxy }
    const promiEvent = this.agentManager!.newAgent(tx)
    promiEvent.on('error', err => { this.newAgentResult.error = err })
    promiEvent.on('transactionHash', hash => { this.newAgentResult.transactionHash = hash })
    promiEvent.on('receipt', receipt => {
      this.newAgentResult.receipt = receipt
      this.updateBalance()
      this.updateAgentAddress()
    })
  }
  async postMessage() {
    if (!this.isInitialized) return
    this.postResult = { transactionHash: null, receipt: null, error: null }
    const tx = { from: this.account, proxy: this.useProxy, agent: this.useAgent }
    const promiEvent = this.useAgent
      ? this.contract!.methods.postMessageTraditional(this.inputMessage).send(tx)
      : this.contract!.methods.postMessage(senderPlaceholder, this.inputMessage).send(tx)
    promiEvent.on('error', err => { this.postResult.error = err })
    promiEvent.on('transactionHash', hash => { this.postResult.transactionHash = hash })
    promiEvent.on('receipt', receipt => {
      this.postResult.receipt = receipt
      this.updateBalance()
      this.updateMessages()
    })
  }
  private async sendTx (tx: SignedTxForProxy) {
    return (await axios.post('http://localhost:8080/proxy', tx)).data.transactionHash
  }
}
</script>
