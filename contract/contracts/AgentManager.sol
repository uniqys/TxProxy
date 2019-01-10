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

pragma solidity 0.4.24;

import "./Agent.sol";

contract AgentManager {
    address public proxy;
    mapping (address => address) public ownerToAgent;

    constructor(address _proxy) public {
        proxy = _proxy;
    }

    function newAgent (address _x) public returns (address) {
        address _sender = sender(_x);
        address _agent = address(new Agent(_sender, proxy));
        ownerToAgent[_sender] = _agent;
        return _agent;
    }

    function agentOf (address _owner) public view returns (address) {
        return ownerToAgent[_owner];
    }

    function sender (address _x) private view returns (address) {
        return msg.sender == proxy ? _x : msg.sender;
    }
}
