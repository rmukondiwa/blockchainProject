import hashlib
import json
import scrypt
from time import time
from urllib.parse import urlparse
import requests

class Blockchain:
    def __init__(self):
        self.current_transactions = []
        self.chain = []
        self.nodes = set()
        
        # Bitcoin supply parameters
        self.max_supply = 100_000_000  # Maximum of 100 million coins
        self.mining_reward = 1  # Reward per block
        
        # Adaptive difficulty parameters
        self.target_block_time = 300  # Target time between blocks in seconds
        self.difficulty_adjustment_interval = 5  # Adjust difficulty every N blocks
        self.initial_difficulty = 4  # Starting difficulty (number of leading zeros)
        self.current_difficulty = self.initial_difficulty

        # Create the genesis block
        self.new_block(previous_hash='1', proof=100)

    def register_node(self, address):
        """
        Add a new node to the list of nodes

        :param address: Address of node. Eg. 'http://192.168.0.5:5001'
        """

        parsed_url = urlparse(address)
        if parsed_url.netloc:
            self.nodes.add(parsed_url.netloc)
        elif parsed_url.path:
            # Accepts an URL without scheme like '192.168.0.5:5001'.
            self.nodes.add(parsed_url.path)
        else:
            raise ValueError('Invalid URL')


    def valid_chain(self, chain):
        """
        Determine if a given blockchain is valid

        :param chain: A blockchain
        :return: True if valid, False if not
        """

        last_block = chain[0]
        current_index = 1

        while current_index < len(chain):
            block = chain[current_index]
            print(f'{last_block}')
            print(f'{block}')
            print("\n-----------\n")
            # Check that the hash of the block is correct
            last_block_hash = self.hash(last_block)
            if block['previous_hash'] != last_block_hash:
                return False

            # Check that the Proof of Work is correct with adaptive difficulty
            block_difficulty = block.get('difficulty', 4)  # Default to 4 for old blocks
            if not self.valid_proof(last_block['proof'], block['proof'], last_block_hash, block_difficulty):
                return False

            last_block = block
            current_index += 1

        return True

    def resolve_conflicts(self):
        """
        This is our consensus algorithm, it resolves conflicts
        by replacing our chain with the longest one in the network.

        :return: True if our chain was replaced, False if not
        """

        neighbours = self.nodes
        new_chain = None

        # We're only looking for chains longer than ours
        max_length = len(self.chain)

        # Grab and verify the chains from all the nodes in our network
        for node in neighbours:
            response = requests.get(f'http://{node}/chain')

            if response.status_code == 200:
                length = response.json()['length']
                chain = response.json()['chain']

                # Check if the length is longer and the chain is valid
                if length > max_length and self.valid_chain(chain):
                    max_length = length
                    new_chain = chain

        # Replace our chain if we discovered a new, valid chain longer than ours
        if new_chain:
            self.chain = new_chain
            self.recalculate_difficulty()  # Update difficulty after chain replacement
            return True

        return False

    def new_block(self, proof, previous_hash):
        """
        Create a new Block in the Blockchain

        :param proof: The proof given by the Proof of Work algorithm
        :param previous_hash: Hash of previous Block
        :return: New Block
        """

        block = {
            'index': len(self.chain) + 1,
            'timestamp': time(),
            'transactions': self.current_transactions,
            'proof': proof,
            'previous_hash': previous_hash or self.hash(self.chain[-1]),
            'difficulty': self.current_difficulty,  # Store current difficulty
        }

        # Adjust difficulty if needed (every N blocks)
        if len(self.chain) > 0 and (len(self.chain) + 1) % self.difficulty_adjustment_interval == 0:
            self.adjust_difficulty()

        # Reset the current list of transactions
        self.current_transactions = []

        self.chain.append(block)
        return block

    def new_transaction(self, sender, recipient, amount):
        """
        Creates a new transaction to go into the next mined Block

        :param sender: Address of the Sender
        :param recipient: Address of the Recipient
        :param amount: Amount
        :return: The index of the Block that will hold this transaction
        """
        self.current_transactions.append({
            'sender': sender,
            'recipient': recipient,
            'amount': amount,
        })

        return self.last_block['index'] + 1

    @property
    def last_block(self):
        return self.chain[-1]

    @staticmethod
    def hash(block):
        """
        Creates a scrypt hash of a Block

        :param block: Block
        """

        # We must make sure that the Dictionary is Ordered, or we'll have inconsistent hashes
        block_string = json.dumps(block, sort_keys=True).encode()
        return scrypt.hash(block_string, salt=b'blockchain_salt', N=1024, r=1, p=1, buflen=32).hex()

    def adjust_difficulty(self):
        """
        Adjust the mining difficulty based on the time taken to mine the last N blocks.
        This implements Bitcoin-style difficulty adjustment.
        """
        if len(self.chain) < self.difficulty_adjustment_interval:
            return

        # Get the last N blocks
        recent_blocks = self.chain[-self.difficulty_adjustment_interval:]
        
        # Calculate actual time taken
        time_taken = recent_blocks[-1]['timestamp'] - recent_blocks[0]['timestamp']
        
        # Expected time for N blocks
        expected_time = self.target_block_time * self.difficulty_adjustment_interval
        
        # Calculate the ratio
        time_ratio = time_taken / expected_time
        
        print(f"\n=== Difficulty Adjustment ===")
        print(f"Time taken: {time_taken:.2f}s")
        print(f"Expected time: {expected_time:.2f}s")
        print(f"Ratio: {time_ratio:.2f}")
        print(f"Old difficulty: {self.current_difficulty}")
        
        # Adjust difficulty based on how fast/slow blocks were mined
        if time_ratio < 0.5:  # More than 2x faster
            self.current_difficulty += 2
        elif time_ratio < 0.75:  # 25-50% faster
            self.current_difficulty += 1
        elif time_ratio > 2.0:  # More than 2x slower
            self.current_difficulty = max(1, self.current_difficulty - 2)
        elif time_ratio > 1.5:  # 50-100% slower
            self.current_difficulty = max(1, self.current_difficulty - 1)
        
        # Ensure difficulty stays within reasonable bounds
        self.current_difficulty = max(1, min(self.current_difficulty, 10))
        
        print(f"New difficulty: {self.current_difficulty}")
        print("============================\n")

    def recalculate_difficulty(self):
        """
        Recalculate difficulty when chain is replaced (after conflict resolution)
        """
        if len(self.chain) >= self.difficulty_adjustment_interval:
            # Find the most recent difficulty from the chain
            self.current_difficulty = self.last_block.get('difficulty', self.initial_difficulty)

    def get_total_supply(self):
        """
        Calculate the total coins currently in circulation
        
        :return: <int> Total supply
        """
        total = 0
        for block in self.chain:
            for transaction in block['transactions']:
                if transaction['sender'] == "0":  # Mining reward
                    total += transaction['amount']
        return total

    def can_mine(self):
        """
        Check if mining reward can be given without exceeding max supply
        
        :return: <bool> True if supply + reward <= max_supply
        """
        current_supply = self.get_total_supply()
        return (current_supply + self.mining_reward) <= self.max_supply

    def proof_of_work(self, last_block, hash_rate=1):
        """
        Simple Proof of Work Algorithm with adaptive difficulty:
         - Find a number p' such that hash(pp') contains leading zeros equal to current_difficulty
         - Where p is the previous proof, and p' is the new proof
         
        :param last_block: <dict> last Block
        :return: <int>
        """

        last_proof = last_block['proof']
        last_hash = self.hash(last_block)

        proof = 0
        while not self.valid_proof(last_proof, proof, last_hash, self.current_difficulty):
            proof += hash_rate

        return proof

    @staticmethod
    def valid_proof(last_proof, proof, last_hash, difficulty=4):
        """
        Validates the Proof with adaptive difficulty

        :param last_proof: <int> Previous Proof
        :param proof: <int> Current Proof
        :param last_hash: <str> The hash of the Previous Block
        :param difficulty: <int> Number of leading zeros required
        :return: <bool> True if correct, False if not.

        """

        guess = f'{last_proof}{proof}{last_hash}'.encode()
        guess_hash = scrypt.hash(guess, salt=b'blockchain_salt', N=1024, r=1, p=1, buflen=32).hex()
        return guess_hash[:difficulty] == "0" * difficulty