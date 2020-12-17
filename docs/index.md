# `IPriceController`







### `getCurrentUsdRate() → uint256` (external)







---

# `MatrixOne`







### `constructor(address payable _rootUser, address _priceController)` (public)






### `_makeRewards(uint256 _newMatrixIndex)` (internal)






### `_getParentMatrixId(uint256 _localRootMatrix) → uint256` (internal)






### `_getSubtreeHeight() → uint256` (internal)






### `_getRefferalsLimit() → uint256` (internal)







---

# `MatrixThree`







### `constructor(address payable _rootUser, address _priceController)` (public)






### `_search(uint256 id, uint256 depth) → uint256` (public)






### `_makeRewards(uint256 _newMatrixIndex)` (internal)






### `_getParentMatrixId(uint256 _localRootMatrix) → uint256` (internal)






### `_getSubtreeHeight() → uint256` (internal)






### `_getRefferalsLimit() → uint256` (internal)







---

# `MatrixTwo`







### `constructor(address payable _rootUser, address _priceController)` (public)






### `_search(uint256 id, uint256 depth) → uint256` (public)






### `_makeRewards(uint256 _newMatrixIndex)` (internal)






### `_getParentMatrixId(uint256 _localRootMatrix) → uint256` (internal)






### `_getSubtreeHeight() → uint256` (internal)






### `_getRefferalsLimit() → uint256` (internal)







---

# `Context`







### `constructor()` (internal)






### `_msgSender() → address payable` (internal)






### `_msgData() → bytes` (internal)







---

# `Ownable`





### `onlyOwner()`



Throws if called by any account other than the owner.



### `constructor()` (internal)



Initializes the contract setting the deployer as the initial owner.


### `owner() → address` (public)



Returns the address of the current owner.


### `isOwner() → bool` (public)



Returns true if the caller is the current owner.


### `renounceOwnership()` (public)



Leaves the contract without owner. It will not be possible to call
`onlyOwner` functions anymore. Can only be called by the current owner.

NOTE: Renouncing ownership will leave the contract without an owner,
thereby removing any functionality that is only available to the owner.


### `transferOwnership(address newOwner)` (public)



Transfers ownership of the contract to a new account (`newOwner`).
Can only be called by the current owner.


### `_transferOwnership(address newOwner)` (internal)



Transfers ownership of the contract to a new account (`newOwner`).


### `OwnershipTransferred(address previousOwner, address newOwner)`






---

# `PriceController`





### `onlyPriceProvider()`







### `setPriceProvider(address _newPriceProvider)` (public)






### `updateUsdRate(uint256 _newRate)` (public)






### `getCurrentUsdRate() → uint256` (public)







---

# `ILeaderPool`







### `setLeaderPool(address payable[10]) → bool` (external)






### `getLeaderPool() → address payable[10]` (external)







---

# `IMatrix`







### `register(address _referrerAddress) → uint256` (external)






### `changeEntryCost(uint256 _newCost) → uint256` (external)






### `getUser(address _userAddress) → uint256, address, uint256, uint256[]` (external)






### `getMatrix(uint256 _matrixId) → uint256, address payable, bool, uint256, uint256[]` (external)







---

# `MatrixCore`







### `constructor(address payable _rootUser, address _priceController)` (public)






### `fallback()` (external)






### `register(address _referrerAddress) → uint256` (external)






### `changeEntryCost(uint256 _newCost) → uint256` (external)






### `setLeaderPool(address payable[10] _leaderPool) → bool` (external)






### `getLeaderPool() → address payable[10]` (external)






### `getUser(address _userAddress) → uint256, address, uint256, uint256[]` (external)






### `getMatrix(uint256 _matrixId) → uint256, address payable, bool, uint256, uint256[]` (external)






### `getCostSunPrice() → uint256` (public)






### `resolveFilling(uint256 _id) → uint256` (external)






### `_rewardLeaders(uint256 _rewardAmount)` (internal)






### `_nonBlockingTransfer(address payable _target, uint256 _amount)` (internal)






### `_isUserExists(address _user) → bool` (internal)






### `_bytesToAddress(bytes _data) → address addr` (internal)






### `_makeRewards(uint256 _newMatrixIndex)` (internal)






### `_getParentMatrixId(uint256 _localRootMatrix) → uint256` (internal)






### `_getSubtreeHeight() → uint256` (internal)






### `_getRefferalsLimit() → uint256` (internal)






### `RegisterSuccessful(address newUserAddress, uint256 newUserId, address referrerAddress, uint256 referrerId, uint256 newMatrixId, uint256 sendingValue, uint256 timestamp)`





### `UserCreated(address newUserAddress, address referrerAddress, uint256 newUserId, uint256 timestamp)`





### `MatrixCreated(uint256 matrixId, uint256 parentMatrixId, address userAddress, uint256 timestamp)`





### `Reinvest(uint256 matrixId, address userAddress, uint256 timestamp)`





### `MakedRewards(address payable _contextUpline, uint256 timestamp)`





### `TransferSuccess(address payable recipient, uint256 value, uint256 timestamp)`





### `TransferError(address payable recipient, uint256 value, uint256 timestamp)`





### `MatrixEntryCostChanged(uint256 newCost, uint256 oldCost, uint256 timestamp)`






---

# `MatrixOwnable`



Contract module which provides a basic access control mechanism, where
there is an account (an owner) that can be granted exclusive access to
specific functions.

This module is used through inheritance. It will make available the modifier
`onlyOwner`, which can be applied to your functions to restrict their use to
the owner.

### `onlyOwner()`



Throws if called by any account other than the owner.



### `constructor()` (internal)



Initializes the contract setting the deployer as the initial owner.


### `owner() → address` (public)



Returns the address of the current owner.


### `isOwner() → bool` (public)



Returns true if the caller is the current owner.


### `transferOwnership(address newOwner)` (public)



Transfers ownership of the contract to a new account (`newOwner`).
Can only be called by the current owner.


### `_transferOwnership(address newOwner)` (internal)



Transfers ownership of the contract to a new account (`newOwner`).


### `OwnershipTransferred(address previousOwner, address newOwner)`






---