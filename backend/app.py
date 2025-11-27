from time import time
from uuid import uuid4
from flask_cors import CORS
from blockchain import Blockchain
from flask import Flask, jsonify, request

# Instantiate the Node
app = Flask(__name__)
CORS(app)

# Generate a globally unique address for this node
node_identifier = str(uuid4()).replace('-', '')

# Instantiate the Blockchain
blockchain = Blockchain()

registered_miners = {}

def success(data, code=200):
    return jsonify({"success": True, "data": data}), code

def error(message, code=400):
    return jsonify({"success": False, "error": message}), code

def api(data=None):
    return jsonify({
        "success": True,
        "data": data
    })

@app.route('/api/mine', methods=['GET'])
def mine():
    if not blockchain.can_mine():
        return error("Max supply reached")

    last_block = blockchain.last_block
    proof = blockchain.proof_of_work(last_block)

    blockchain.new_transaction("0",node_identifier, blockchain.mining_reward)
    previous_hash = blockchain.hash(last_block)
    block = blockchain.new_block(proof, previous_hash)

    return success({
        "message": "New block forged",
        "block": block,
        "current_supply": blockchain.get_total_supply()
    })


@app.route('/api/transactions/new', methods=['POST'])
def new_transaction():
    values = request.get_json()

    # Check that the required fields are in the POST'ed data
    required = ['sender', 'recipient', 'amount']
    if not all(k in values for k in required):
        return error('Missing transaction fields', 400)

    # Create a new Transaction
    index = blockchain.new_transaction(values['sender'], values['recipient'], values['amount'])

    return success({"message": f"Transaction will be added to block {index}"})


@app.route('/api/chain', methods=['GET'])
def full_chain():
    return success({
        'chain': blockchain.chain,
        'length': len(blockchain.chain),
        'current_difficulty': blockchain.current_difficulty,  # Show current difficulty
    })

@app.route('/api/difficulty', methods=['GET'])
def get_difficulty():
    """
    Get current difficulty and mining statistics
    """
    if len(blockchain.chain) >= blockchain.difficulty_adjustment_interval:
        recent_blocks = blockchain.chain[-blockchain.difficulty_adjustment_interval:]
        time_taken = recent_blocks[-1]['timestamp'] - recent_blocks[0]['timestamp']
        expected_time = blockchain.target_block_time * blockchain.difficulty_adjustment_interval
        avg_block_time = time_taken / blockchain.difficulty_adjustment_interval
    else:
        avg_block_time = None
        time_taken = None
        expected_time = None
    
    return success ({
        'current_difficulty': blockchain.current_difficulty,
        'target_block_time': blockchain.target_block_time,
        'average_block_time': avg_block_time,
        'expected_time_for_interval': expected_time,
        'actual_time_for_interval': time_taken,
    })

@app.route('/api/miners/delete', methods=['POST'])
def delete_miner():
    data = request.get_json()
    miner_id = data.get("id")

    if not miner_id or miner_id not in registered_miners:
        return error("Miner not found", 400)

    del registered_miners[miner_id]
    return success({"message": "Miner removed"})

@app.route('/api/supply', methods=['GET'])
def get_supply():
    """
    Get current supply information
    """
    current_supply = blockchain.get_total_supply()
    remaining_supply = blockchain.max_supply - current_supply
    
    return success ({
        'current_supply': current_supply,
        'max_supply': blockchain.max_supply,
        'remaining_supply': remaining_supply,
        'supply_percentage': round(current_supply / blockchain.max_supply * 100, 2),
        'mining_possible': blockchain.can_mine(),
    })

@app.route('/api/nodes/register', methods=['POST'])
def register_nodes():
    values = request.get_json()

    nodes = values.get('nodes')
    if nodes is None:
        return error("Please supply a valid list of nodes")

    for node in nodes:
        blockchain.register_node(node)

    return success ({
        'message': 'New nodes have been added',
        'total_nodes': list(blockchain.nodes),
    })

@app.route('/api/nodes/resolve', methods=['GET'])
def consensus():
    replaced = blockchain.resolve_conflicts()

    if replaced:
        return success ({
            'message': 'Chain was replaced',
            'new_chain': blockchain.chain
        })
    else:
        return success ({
            'message': 'Our chain is authoritative',
            'chain': blockchain.chain
        })

@app.route('/api/mine_with_rate', methods=['POST'])
def mine_with_rate():
    data = request.get_json()
    miner = data.get("miner", "unknown")
    hash_rate = data.get("hash_rate", 1)

    if not blockchain.can_mine():
        return error("Max supply reached")

    last_block = blockchain.last_block
    
    proof = blockchain.proof_of_work(last_block, hash_rate=hash_rate)

    # mining reward
    blockchain.new_transaction("0", miner, blockchain.mining_reward)

    previous_hash = blockchain.hash(last_block)
    block = blockchain.new_block(proof, previous_hash)

    # update miner registry
    if miner in registered_miners:
        registered_miners[miner]["blocks"] += 1
        registered_miners[miner]["lastMined"] = time()


    return success({
        "message": f"Block mined by {miner}",
        "miner": miner,
        "hash_rate": hash_rate,
        "block": block,
    })

@app.route('/api/miners/add', methods=['POST'])
def add_miner():
    data = request.get_json()
    miner_id = data.get("id")
    hash_rate = data.get("hashRate", 1)

    if not miner_id:
        return error("Miner id required", 400)

    registered_miners[miner_id] = {
        "hashRate": hash_rate,
        "blocks": 0
    }

    return success({"message": "Miner added", "miners": registered_miners})

@app.route('/api/miners', methods=['GET'])
def get_miners():
    # merge registry + chain stats
    miners = []

    for miner, info in registered_miners.items():
        miners.append({
            "id": miner,
            "hashRate": info["hashRate"],
            "blocks": info["blocks"]
        })

    return success({"miners": miners})

@app.get("/stats")
def stats():
    current_supply = blockchain.get_total_supply()
    remaining_supply = blockchain.max_supply - current_supply

    return success({
        "difficulty": blockchain.current_difficulty,
        "chainLength": len(blockchain.chain),
        "avgBlockTime": None,  # you can wire real timing later
        "minersOnline": len(registered_miners),
        "totalSupply": current_supply,
        "remainingSupply": remaining_supply,
    })
    
# Running the server
if __name__ == '__main__':
    from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument('-p', '--port', default=5001, type=int, help='port to listen on')
    args = parser.parse_args()
    port = args.port

    app.run(host='0.0.0.0', port=port)