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

contract Agent {
    address public proxy;
    address public owner;

    constructor(address _owner, address _proxy) public {
        owner = _owner;
        proxy = _proxy;
    }

    function callContract (address _x, address _to, bytes _data) public payable {
        address _sender = sender(_x);
        require(_sender == owner, "allow to owner only");
        _call(_to, msg.value, _data);
    }

    function callContract (address _to, bytes _data) public payable {
        require(msg.sender == owner, "allow to owner only");
        _call(_to, msg.value, _data);
    }

    function _call(address _to, uint _value, bytes _data) private {
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            let _result := call(gas, _to, _value, add(_data, 0x20), mload(_data), 0, 0)
            let _p := mload(0x40)
            returndatacopy(_p, 0, returndatasize)

            switch _result
            case 0 {
                revert(_p, returndatasize)
            }
            default {
                return(_p, returndatasize)
            }
        }
    }

    function sender (address _x) private view returns (address) {
        return msg.sender == proxy ? _x : msg.sender;
    }
}
