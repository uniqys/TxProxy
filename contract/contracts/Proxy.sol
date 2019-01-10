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


contract Proxy {
    // keccak256("EIP712Domain(address verifyingContract)")
    bytes32 constant DOMAIN_TYPE_HASH = 0x035aff83d86937d35b32e04f0ddc6ff469290eef2f1b692d8a815c89404d4749;
    // keccak256("Tx(uint256 nonce,address to,bytes data)")
    bytes32 constant TX_TYPE_HASH = 0x77d28b2c622c36e22383a58cca1d9db71e34c818954ae499e6fd8c3305046afe;

    mapping(address => uint) public nonce;

    constructor() public { }

    function send(
        uint _nonce,
        address _to,
        bytes4 _func,
        bytes _args,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) public {
        bytes32 _hash = hashForSign(_nonce, _to, _func, _args);
        address _sender = ecrecover(_hash, _v, _r, _s);
        require(_nonce == nonce[_sender], "invalid nonce");

        // call transaction with sender address
        nonce[_sender]++;
        bool _result = _to.call(abi.encodePacked(_func, bytes32(_sender), _args));
        emit Called(_sender, _nonce, _result);
    }

    function hashForSign(
        uint _nonce,
        address _to,
        bytes4 _func,
        bytes _args
    ) private view returns (bytes32) {
        bytes32 _domainSeparator = keccak256(
            abi.encode(
                DOMAIN_TYPE_HASH,
                address(this) // verifyingContract
            )
        );
        bytes32 _hashStruct = keccak256(
            abi.encode(
                TX_TYPE_HASH,
                _nonce,
                bytes32(_to),
                keccak256(abi.encodePacked(_func, bytes32(0), _args))
            )
        );
        bytes32 _hash = keccak256(abi.encodePacked("\x19\x01", _domainSeparator, _hashStruct));
        return _hash;
    }

    event Called(address _sender, uint _nonce, bool _result);
}
