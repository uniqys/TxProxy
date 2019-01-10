#!/bin/bash
# Copyright 2018 Bit Factory, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -ue
WORK_DIR=$(cd `dirname "$0"`; pwd)

if [[ $# -eq 0 ]] ; then
  echo "アクセストークンを入力してください"
  echo "アクセストークンはコンソール(https://admin.tx-proxy.uniqys.net)から取得できます"
  echo -n "> "
  read TX_PROXY_TOKEN
else
  TX_PROXY_TOKEN=$1
fi

export TX_PROXY_TOKEN

cd $WORK_DIR/app
yarn dev
