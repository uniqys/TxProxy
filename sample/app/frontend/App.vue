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
  <div id="app">
    <Messages v-if="web3" :web3="web3" :account="account"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Messages from './components/Messages.vue';
import Web3 from 'web3';

@Component({
  components: {
    Messages,
  },
})
export default class App extends Vue {
  web3: Web3 | null = null
  account: string = ''
  async created () {
    if (Web3.givenProvider) {
      console.log('Web3 injected browser: OK.')
      this.web3 = new Web3(Web3.givenProvider)
    } else {
      alert('Web3 is not injected')
      return
    }
    const accounts = await this.web3.eth.getAccounts()
    if (accounts.length === 0) {
      alert('please unlock wallet')
      let initInterval = setInterval(async () => {
        if (!this.web3) return
        const accounts = await this.web3.eth.getAccounts()
        if (accounts.length === 0) return
        this.account = accounts[0]
        clearInterval(initInterval)
        this.init()
      }, 500)
    } else {
      this.account = accounts[0]
      this.init()
    }
  }
  init (): void {
    //
  }
}
</script>
