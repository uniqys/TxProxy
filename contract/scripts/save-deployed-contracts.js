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
const path = require('path')
const fsPath = require('fs-path')

const buildDir = './build/contracts/'
const saveDir = './deployed/contracts/'
const files = fsPath.findSync(buildDir).files
const networks = ['3']

files.forEach((file) => {
  const build = JSON.parse(fs.readFileSync(file))
  const save = {}
  save.contractName = build.contractName
  save.abi = build.abi
  save.schemaVersion = build.schemaVersion
  save.networks = {}
  networks.forEach(id => {
    save.networks[id] = build.networks[id]
  })

  fsPath.writeFileSync(path.join(saveDir, path.basename(file)), JSON.stringify(save, null, 2))
})

console.log(`save contracts to ${saveDir}`)
