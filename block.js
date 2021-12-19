/* 
	Blocks sample:
		{
			timestamp: number,
			data: string,
			previousHash: string,
			hash: string,
		}
*/

const SHA256 = require('crypto-js/sha256');

function calculateHash({ previousHash, timestamp, data, nonce = 1 }) {
  return SHA256(
    previousHash + timestamp + JSON.stringify(data) + nonce
  ).toString();
}

//const block1 = {
//  data: {
//    sender: "x3041d34134g22d",
//    receiver: "x89sj8ak2l9al18",
//    amount: 0.0012,
//    currency: "BTC",
//  },
//  timestamp: 1568481293771,
//  previousHash:
//    "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
//};

//console.log(calculateHash(block1));

/* 
	WHAT IF THERE IS A SUPERCOMPUTER THAT CAN DECRYPT SHA256
	=> clause: the hash is only valid if there is a constraint in the front of it(00009999 should precede hash, then its valid) 
*/

/* STEPS OF CREATING A GENESIS BLOCK

	block-> need timestamp(current time a.k.a Number(new Date()))
		-> data: (lets say genesis block)
		-> previousHash: NULL (or for making it a string '0')

*/
function generateGenesisBlock() {
  const block = {
    timestamp: Number(new Date()),
    data: 'Genesis Block',
    previousHash: '0',
  };
  return {
    ...block,
    hash: calculateHash(block),
  };
}

function checkDifficulty(difficulty, hash) {
  return hash.substr(0, difficulty) === '0'.repeat(difficulty);
}
// checks whether the hash is constrained
// Why should such a check happen -> in order to disallow simple supercomputer decrypting (supercomputer a.k.a really powerful computer)

function nextNonce(block) {
  return updateHash({ ...block, nonce: block.nonce + 1 });
}
// Increases the value of the "nonce"

function updateHash(block) {
  return { ...block, hash: calculateHash(block) };
}
// update hash(use case: suppose nonce is changed, hash has to be updated for the block so block is first passed throught nextNonce and then passed through updateHash)

function trampoline(fn) {
  let result = fn.apply(this, ...arguments);
  while (result && typeof result === 'function') {
    result = result();
  }
  return result;
}
// trampoline for tail recursion in js

function mineBlock(difficulty, block) {
  function mine(block) {
    const newBlock = nextNonce(block);
    return checkDifficulty(difficulty, newBlock.hash)
      ? newBlock
      : () => mine(nextNonce(block));
  }
  return trampoline(mine(nextNonce(block)));
}

// mineBlock is the wrapper function which is thunk-returning
// mine block => new block is formed by incrementing the nonce of the older one thus forming a new hash with the same data
// check the difficulty and the hash of the new block if its valid
// if valid return the newBlock else increase the nonce
// basically increase the nonce until the checkDifficulty is true
// mineblock -> block -> nextNonce -> recursion -> check difficulty-> increase till difficulty given is equal to nonce of hash and once its over return newBlock

function addBlock(chain, data) {
  const { hash: previousHash } = chain[chain.length - 1];
  //example of renaming while destructuring
  const block = { timestamp: Number(new Date()), data, previousHash, nonce: 0 };
  const newBlock = mineBlock(4, block);
  return chain.concat(newBlock);
}

function validateChain(chain) {
  function tce(chain, index) {
    if (index === 0) return true;
    const { hash, ...currentBlockWithoutHash } = chain[index];
    const currentBlock = chain[index];
    const previousBlock = chain[index - 1];
    const isValidHash = hash === calculateHash(currentBlockWithoutHash);
    const isPreviousHashValid =
      currentBlock.previousHash === previousBlock.hash;
    const isValidChain = isValidHash && isPreviousHashValid;

    if (!isValidChain) return false;
    else return tce(chain, index - 1);
  }
  return tce(chain, chain.length - 1);
}

/* tce(chain,index)
		index === 0 , chain is valid
		const {hash,...currentBlockWithoutHash} = chain[index];
		(take the index in the chain and extract the hash)
		currentBlock,previousBlock
		isValid if hash === calculateHash(currentBlockwithoutHash)
		isPreviousValid currentBlock.previousHash === previousBlock.hash
		validChain means block at index should precede by the right one(isPreviousValid) and current hash should be valid(calculate the hash of the block and compare it with the hash already)	
*/

// PUTTING EVERYTHING TOGETHER

let chain = [generateGenesisBlock()];

const newBlockData = {
  sender: 'ks829fh28192j28d9dk9',
  receiver: 'ads8d91w29jsm2822910',
  amount: 0.0023,
  currency: 'BTC',
};

const newnewBlockData = {
  sender: 'jdfgujusd8345',
  receiver: '48gjrtusd83jgu',
  amount: 0.0432,
  currency: 'BTC',
};

let newChain = addBlock(chain, newBlockData);
let newnewChain = addBlock(newChain, newnewBlockData);

console.log(newnewChain);
