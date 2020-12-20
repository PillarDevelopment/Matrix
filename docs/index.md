












# `MatrixCore`


```
Implementation of the core of Matrix system.
Contains basic methods for working with mlm.
```

## Methods


### constructor(address payable _rootUser, address _priceController) (public)
**Params**

**Returns**






### fallback() (external)
**Params**

**Returns**



User can register in the system by directly transferring funds to the contract


### register(address _referrerAddress) → uint256 userId (external)
**Params**

**Returns**
 - `userId`: New User ID



Register a new user and ask him a matrix.
The new matrix binds to the parent matrix.



### changeEntryCost(uint256 _newCost) → uint256 (external)
**Params**

**Returns**



Administrator function.
Changes registration cost (US dollars).


### setLeaderPool(address payable[10] _leaderPool) → bool (external)
**Params**

**Returns**



Administrator function.
Set the top 10 best participants in the system.
Repetitions are allowed.


### getLeaderPool() → address payable[10] (external)
**Params**

**Returns**



Get a list of the best participants


### getUser(address _userAddress) → uint256, address, uint256, uint256[] (external)
**Params**

**Returns**



Get detailed information about a user


### getMatrix(uint256 _matrixId) → uint256, address payable, bool, uint256, uint256[] (external)
**Params**

**Returns**



Get detailed information about a matrix


### getCostSunPrice() → uint256 (public)
**Params**

**Returns**






### resolveFilling(uint256 _id) → uint256 (external)
**Params**

**Returns**






## Events

### RegisterSuccessful(address newUserAddress, uint256 newUserId, address referrerAddress, uint256 referrerId, uint256 newMatrixId, uint256 sendingValue, uint256 timestamp)





### UserCreated(address newUserAddress, address referrerAddress, uint256 newUserId, uint256 timestamp)





### MatrixCreated(uint256 matrixId, uint256 parentMatrixId, address userAddress, uint256 timestamp)





### Reinvest(uint256 matrixId, address userAddress, uint256 timestamp)





### MakedRewards(address payable _contextUpline, uint256 timestamp)





### TransferSuccess(address payable recipient, uint256 value, uint256 timestamp)





### TransferError(address payable recipient, uint256 value, uint256 timestamp)





### MatrixEntryCostChanged(uint256 newCost, uint256 oldCost, uint256 timestamp)






---





# `MatrixOwnable`


```
Contract module which provides a basic access control mechanism, where
there is an account (an owner) that can be granted exclusive access to
specific functions.

This module is used through inheritance. It will make available the modifier
`onlyOwner`, which can be applied to your functions to restrict their use to
the owner.
```

## Methods


### owner() → address (public)
**Params**

**Returns**



Returns the address of the current owner.


### isOwner() → bool (public)
**Params**

**Returns**



Returns true if the caller is the current owner.


### transferOwnership(address newOwner) (public)
**Params**

**Returns**



Transfers ownership of the contract to a new account (`newOwner`).
Can only be called by the current owner.


## Events

### OwnershipTransferred(address previousOwner, address newOwner)






---






