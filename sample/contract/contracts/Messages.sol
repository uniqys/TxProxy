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

contract Messages {
    struct Message {
        address sender;
        string contents;
    }
    Message[] public messages;
    address public proxy;

    constructor(address _proxy) public {
        proxy = _proxy;
    }

    // TxProxy対応のメソッド
    function postMessage(address _x, string _message) public {
        address _sender = sender(_x);
        _postMessage(_sender, _message);
    }

    // 通常のメソッド
    function postMessageTraditional(string _message) public {
        _postMessage(msg.sender, _message);
    }

    function _postMessage(address _sender, string _message) private {
        messages.push(Message({
            sender: _sender,
            contents: _message
        }));
    }

    function count() public view returns (uint) {
        return messages.length;
    }

    function sender (address _x) private view returns (address) {
        return msg.sender == proxy ? _x : msg.sender;
    }
}
