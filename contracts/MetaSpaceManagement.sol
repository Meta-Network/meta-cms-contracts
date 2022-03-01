// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

contract MetaSpaceManagement is Ownable, AccessControl, EIP712 {
    struct Action {
        address initiator;
        string name;
    }
    struct Authorization {
        address user;
        uint256 timestamp;
    }
    struct Verification {
        address server;
        address user; // User send
        uint256 timestamp; // User send
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    bytes32 public constant GLOBAL_ADMINISTRATOR_ROLE = keccak256("Meta Space Global Administrator");
    bytes32 public constant VERIFICATION_PAYLOAD_AUTHOR_ROLE =
        keccak256("Meta Space Server Verification Payload Author");
    bytes32 public constant ACTION_TYPE_HASH = keccak256("Action(address initiator,string name)");
    bytes32 public constant AUTHORIZATION_TYPE_HASH = keccak256("Authorization(address user,uint256 timestamp)");
    bytes32 public constant VERIFICATION_TYPE_HASH =
        keccak256("Verification(address server,address user,uint256 timestamp,uint8 v,bytes32 r,bytes32 s)");

    constructor(string memory name, string memory version) EIP712(name, version) {
        AccessControl._grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        AccessControl._setRoleAdmin(GLOBAL_ADMINISTRATOR_ROLE, DEFAULT_ADMIN_ROLE);
        AccessControl._setRoleAdmin(VERIFICATION_PAYLOAD_AUTHOR_ROLE, DEFAULT_ADMIN_ROLE);
    }

    function _hashStruct(Action memory action) private pure returns (bytes32) {
        // If your struct member has string type, you need to use keccak256(bytes(string)) convert it to bytes32
        return keccak256(abi.encode(ACTION_TYPE_HASH, action.initiator, keccak256(bytes(action.name))));
    }

    function _hashStruct(Authorization memory auth) private pure returns (bytes32) {
        return keccak256(abi.encode(AUTHORIZATION_TYPE_HASH, auth.user, auth.timestamp));
    }

    function _hashStruct(Verification memory verify) private pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    VERIFICATION_TYPE_HASH,
                    verify.server,
                    verify.user,
                    verify.timestamp,
                    verify.v,
                    verify.r,
                    verify.s
                )
            );
    }

    function _hashTypedDataV4(Action memory action) private view returns (bytes32) {
        bytes32 structHash = _hashStruct(action);
        return EIP712._hashTypedDataV4(structHash);
    }

    function _hashTypedDataV4(Authorization memory auth) private view returns (bytes32) {
        bytes32 structHash = _hashStruct(auth);
        return EIP712._hashTypedDataV4(structHash);
    }

    function _hashTypedDataV4(Verification memory verify) private view returns (bytes32) {
        bytes32 structHash = _hashStruct(verify);
        return EIP712._hashTypedDataV4(structHash);
    }

    function _verifyAction(Action memory action, bytes memory signature) private view returns (bool) {
        bytes32 digest = _hashTypedDataV4(action);
        address signer = ECDSA.recover(digest, signature);
        bool checkRole = AccessControl.hasRole(GLOBAL_ADMINISTRATOR_ROLE, signer);
        return action.initiator == signer && checkRole;
    }

    function _verifyAuthorization(Authorization memory auth, bytes memory signature) private view returns (bool) {
        bytes32 digest = _hashTypedDataV4(auth);
        address signer = ECDSA.recover(digest, signature);
        bool checkRole = AccessControl.hasRole(GLOBAL_ADMINISTRATOR_ROLE, signer);
        return auth.user == signer && checkRole;
    }

    function _verifyAuthorization(
        Authorization memory auth,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) private view returns (bool) {
        bytes32 digest = _hashTypedDataV4(auth);
        address signer = ECDSA.recover(digest, v, r, s);
        bool checkRole = AccessControl.hasRole(GLOBAL_ADMINISTRATOR_ROLE, signer);
        return auth.user == signer && checkRole;
    }

    function _verifyVerification(Verification memory verify, bytes memory signature) private view returns (bool) {
        bytes32 digest = _hashTypedDataV4(verify);
        address signer = ECDSA.recover(digest, signature);
        return _msgSender() == signer;
    }

    function verifySignature(Action memory action, bytes memory signature) public view returns (bool) {
        return _verifyAction(action, signature);
    }

    function verifySignature(Authorization memory auth, bytes memory signature) public view returns (bool) {
        return _verifyAuthorization(auth, signature);
    }

    function verifySignature(Verification memory verify, bytes memory signature)
        public
        view
        onlyRole(VERIFICATION_PAYLOAD_AUTHOR_ROLE) /// Only server address can call
        returns (bool)
    {
        Authorization memory auth = Authorization({ user: verify.user, timestamp: verify.timestamp });
        bool verifyAuth = _verifyAuthorization(auth, verify.v, verify.r, verify.s);
        bool verifyServer = _verifyVerification(verify, signature);
        return verifyAuth && verifyServer;
    }
}
