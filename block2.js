const SHA256 = require('crypto-js/sha256');
/* 
    structure of a block:
      data
      previousHash
      hash
      nonce
      timestamp
*/

function calculateHash({ previousHash, data, timestamp, nonce = 1 }) {
  return SHA256(
    previousHash + JSON.stringify(data) + timestamp + nonce
  ).toString();
  //SHA256 accepts a string (hence JSON.stringify)
  // SHA256 returns something like WordArray(a structure within the library)
  // so toString() is added[because hash is a string]
}

function generateGenesisBlock() {
  const block = {
    timestamp: Number(new Date()),
    data: 'Genesis Block',
    previousHash: '0',
  };
  return { ...block, hash: calculateHash(block) };
}

function checkDifficulty(difficulty, hash) {
  return hash.substr(0, difficulty) === '0'.repeat(difficulty);
}

function updateHash(block) {
  return { ...block, hash: calculateHash(block) };
}

function nextNonce(block) {
  return updateHash({ ...block, nonce: block.nonce + 1 });
  // using object spread operator to update an object
}

function trampoline(fn) {
  let result = fn.apply(this, ...arguments);
  while (result && typeof result == 'function') {
    result = result();
  }
  return result;
}
// result() is for the recursive calling for func2
// trampoline(func1)
// func1(return func2: something)
function mineBlock(difficulty, block) {
  function mine(block) {
    const newBlock = nextNonce(block);
    return checkDifficulty(difficulty, newBlock.hash)
      ? newBlock
      : () => {
          return mine(nextNonce(block));
        };
  }
  return trampoline(mine(nextNonce(block)));
}
console.log('Hey');

function addBlock(data, chain) {
  const { hash: previousHash } = chain[chain.length - 1];
  const block = { timestamp: Number(new Date()), data, previousHash, nonce: 0 };
  const newBlock = mineBlock(4, block);
  return chain.concat(newBlock);
}

function validateChain(chain) {
  function tce(chain, index) {
    if (index === 0) return true;
    const { hash, ...blockAtIndexWithoutHash } = chain[index];
    const isPreviousValid =
      blockAtIndexWithoutHash.previousHash === chain[index - 1].hash;
    const isBlockValid = calculateHash(blockAtIndexWithoutHash) === hash;

    if (!(isPreviousValid && isBlockValid)) {
      return false;
    } else {
      return tce(chain, index - 1);
    }
  }
  return tce(chain, chain.length - 1);
}

let chain = [generateGenesisBlock()];

const newBlockData = {
  sender: 'ks829fh28192j28d9dk9',
  receiver: 'ads8d91w29jsm2822910',
  amount: 0.0023,
  currency: 'BTC',
};

chain = addBlock(newBlockData, chain);
console.log(validateChain(chain));
chain = chain.concat({
  timestamp: 1639895056493,
  data: {
    sender: 'ks829fh28192j28d9dk9',
    receiver: 'ads8d91w29jsm2822910',
    amount: 0.0023,
    currency: 'BTC',
  },
  previousHash:
    '6fb52df6a8f2da18c1e599c59c94b868901bafe5a9a1c60e5cf20cf764f3233f',
  nonce: 39205,
  hash: '00091557da167b29c3ff6e8b2d81c25b85aa71ac0c96900a169be89ff4b14c4',
});

// wrong block to test the validate chain
console.log(chain);
console.log(validateChain(chain));
