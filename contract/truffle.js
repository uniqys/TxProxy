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

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      gas: 100000000,
      network_id: "*" // Match any network id
    },
    test: {
      host: "localhost",
      port: 6545,
      gas: 8000000,
      network_id: "*"
    },
    private: {
      host: "localhost",
      port: 8545,
      gas: 8000000,
      network_id: "*"
    },
    ropsten: {
      host: "localhost",
      port: 8545,
      network_id: "3"
    }
  }
};
