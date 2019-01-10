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
const files = fsPath.findSync(saveDir).files

files.forEach((file) => {
  if (path.extname(file) !== '.json') return
  const buildFile = path.join(buildDir, path.basename(file))
  const exists = fs.existsSync(buildFile) ? JSON.parse(fs.readFileSync(buildFile, 'utf8')) : {}
  const save = JSON.parse(fs.readFileSync(file))
  const restore = Object.assign(exists, save)
  restore.networks = Object.assign({}, exists.networks, save.networks)

  fsPath.writeFileSync(buildFile, JSON.stringify(restore, null, 2))
})

console.log(`restore contracts from ${saveDir}`)
