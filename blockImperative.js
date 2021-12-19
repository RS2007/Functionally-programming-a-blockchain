const SHA256 = require('crypto-js/sha256');

// Blockchains are a combination of linked lists and merkle trees
// instead of traditional pointers we use hashes

/*	UNDERSTANDING HASH FUNCTIONS
	----------------------------

	function that takes in input value and from that input creates an output value deterministic of the input value.
		For any x input value , you always have the same y output value when function runs(y = f(x) is invertible).
	Say i have an answer and i want to compare it with my friend and i dont want to explicitly say the value. So I hash it and give it to my friend and he hashes his and checks with mine.
	
*/

// THERE EXISTS A SOLUTION BUT IT IS VERY DIFFICULT TO FIND

// For less complexity , we are not using merklee tree

class Block {
  constructor(timestamp, data) {
    this.index = 0;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = '0';
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
    ).toString();
  }

  mineBlock(difficulty) {}
}

// BTC is designed to have a difficult such that the average mining time per block is 10 minutes
// index shows the location of the block
// hash of previousBlock (pointing)
// calculateHash : hash

/*	BLOCKCHAIN OBJECT
	------------------
*/

class Blockchain {
  constructor() {
    this.chain = [this.createGenesis];
  }

  createGenesis() {
    return new Block(0, Number(new Date()).toString(), 'Genesis Block', '0');
  }

  latestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.latestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  checkValid() {
    for (let i = 1; i < this.chain.length; ++i) {
      const currentBlock = this.chain[i];
      const prevousBlock = this.chain[i - 1];
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      return true;
    }
  }
}
