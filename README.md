# Hydro - Blockchain Implementation and Simulation with Adaptive Difficulty

A full-stack blockchain application featuring a Python Flask backend with proof-of-work consensus and a React TypeScript frontend for visualization and control. This project demonstrates core blockchain concepts including distributed consensus, adaptive mining difficulty, supply-capped cryptocurrency, and multi-miner competition.

To view the key features of Hydro, please see the blockchain.py file within the backend folder

## Table of Contents

- [Overview](#overview)
- [How the Blockchain Works](#how-the-blockchain-works)
- [Architecture](#architecture)
- [Backend: Flask API](#backend-flask-api)
- [Mining System](#mining-system)
- [Frontend: React Dashboard](#frontend-react-dashboard)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)

## Overview

This blockchain implementation features:

- **Proof-of-Work Consensus**: Uses scrypt hashing algorithm for block validation
- **Adaptive Difficulty**: Automatically adjusts mining difficulty to maintain target block time
- **Supply Cap**: Maximum supply of 100 million coins with reward per block
- **Multi-Miner Support**: Register multiple miners with different hash rates
- **Distributed Consensus**: Node registration and conflict resolution
- **Real-time Visualization**: Interactive dashboard showing blockchain stats and miner network

## How the Blockchain Works

### Core Concepts

**Blocks**: Each block contains:
- Index (position in the chain)
- Timestamp
- List of transactions
- Proof (nonce found through mining)
- Previous block hash
- Current difficulty level

**Transactions**: Transfer of coins between addresses. Mining rewards are transactions from address "0" to the miner.

**Hashing**: Uses scrypt (memory-hard hash function) with parameters N=1024, r=1, p=1 for:
- Block hashing (creating unique block identifiers)
- Proof-of-work validation (finding valid nonces)

**Chain Validation**: Ensures integrity by:
1. Verifying each block's hash matches the previous block's stored hash
2. Validating proof-of-work meets difficulty requirements
3. Maintaining chronological order

### Proof-of-Work Mining

The mining process works as follows:

1. **Get Last Block**: Retrieve the most recent block from the chain
2. **Find Valid Proof**: Increment nonce values until finding one that produces a hash with the required number of leading zeros (determined by current difficulty)
3. **Validate Proof**: Hash(previous_proof + current_proof + previous_hash) must start with N zeros where N = current_difficulty
4. **Create Block**: Once valid proof is found, create new block with transactions and proof
5. **Reward Miner**: Add transaction crediting mining reward to the miner's address

### Adaptive Difficulty Adjustment

The blockchain maintains a target block time of 300 seconds through automatic difficulty adjustment:

- **Adjustment Interval**: Every 5 blocks
- **Difficulty Range**: 1 to 10 (leading zeros required in hash)
- **Adjustment Logic**:
  - If blocks mined 2x faster than target: increase difficulty by 2
  - If blocks mined 25-50% faster: increase difficulty by 1
  - If blocks mined 2x slower than target: decrease difficulty by 2
  - If blocks mined 50-100% slower: decrease difficulty by 1

### Supply Economics

- **Maximum Supply**: 100,000,000 coins
- **Block Reward**: 1 coin per block
- **Supply Tracking**: Calculated by summing all mining reward transactions (sender = "0")
- **Mining Cutoff**: Mining automatically stops when max supply is reached

### Consensus Mechanism

When multiple nodes exist:

1. **Conflict Resolution**: Nodes compare chain lengths
2. **Longest Valid Chain**: The longest valid chain becomes authoritative
3. **Chain Replacement**: Shorter chains are replaced by longer valid chains
4. **Difficulty Sync**: After chain replacement, difficulty is recalculated from the new chain

## Architecture

### Backend Stack

- **Flask**: Lightweight WSGI web application framework
- **Flask-CORS**: Handles Cross-Origin Resource Sharing for frontend communication
- **Python 3.6+**: Core programming language

### Frontend Stack

- **React 19**: UI component library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Charting library for data visualization
- **React Force Graph**: Network graph visualization for miner relationships
- **Axios**: HTTP client for API requests

## Backend: Flask API

### Flask Application Structure

The Flask backend (`backend/app.py`) serves as the REST API layer:

**Initialization**:
```python
app = Flask(__name__)
CORS(app)  # Enable cross-origin requests from frontend
blockchain = Blockchain()  # Single blockchain instance
registered_miners = {}  # Thread-safe miner registry
```

**Key Features**:
- RESTful API endpoints for blockchain operations
- Thread-safe miner management using locks
- Standardized JSON response format with success/error wrappers
- CORS enabled for frontend communication
- Command-line port configuration

**Flask's Role**:
- **Route Handling**: Maps HTTP endpoints to blockchain operations
- **Request Processing**: Parses JSON payloads for transactions and mining
- **Response Formatting**: Returns consistent JSON responses
- **State Management**: Maintains single blockchain instance shared across requests
- **Concurrency**: Uses threading locks for safe miner registry access

### Blockchain Core (`backend/blockchain.py`)

**Initialization Parameters**:
- Max supply: 100,000,000 coins
- Mining reward: 1 coin per block
- Target block time: 300 seconds
- Difficulty adjustment interval: 5 blocks
- Initial difficulty: 4 leading zeros

**Key Methods**:
- `new_block()`: Creates block, adjusts difficulty if needed
- `new_transaction()`: Adds transaction to pending pool
- `proof_of_work()`: Finds valid nonce for mining
- `valid_chain()`: Validates entire blockchain
- `resolve_conflicts()`: Implements longest chain consensus
- `adjust_difficulty()`: Dynamic difficulty recalculation

## Mining System

### How Miners Work

**Miner Registration**:
1. Frontend creates miner with unique ID and hash rate
2. POST request to `/api/miners/add` registers miner
3. Backend stores miner in thread-safe registry

**Mining Process**:
1. Miner requests mining operation via `/api/mine_with_rate`
2. Backend checks if supply cap allows mining
3. Calls `proof_of_work()` with miner's hash rate
4. Hash rate determines step size in nonce search (higher = faster)
5. Valid proof triggers block creation
6. Mining reward transaction added to block
7. Miner's block count incremented

**Hash Rate Impact**:
- Hash rate determines nonce increment per iteration
- Higher hash rate = fewer iterations to find valid proof
- Simulates computational power differences between miners

**Miner Statistics**:
- Blocks mined: Count of successfully mined blocks
- Hash rate: Mining speed/power
- Last mined: Timestamp of most recent block
- Success rate: Blocks mined / total blocks ratio

## Frontend: React Dashboard

### Components

**Dashboard (`frontend/src/pages/Dashboard.tsx`)**:
- Main application view
- Integrates all components
- Manages global state

**BlockchainStats (`frontend/src/components/BlockchainStats.tsx`)**:
- Displays real-time blockchain metrics
- Shows difficulty, chain length, average block time
- Monitors supply and miners online

**MinerControls (`frontend/src/components/MinerControls.jsx`)**:
- Add/remove miners interface
- Configure hash rates
- Start/stop mining operations
- View individual miner statistics

**MinerNetworkGraph (`frontend/src/components/MinerNetworkGraph.tsx`)**:
- Force-directed graph visualization
- Shows miner relationships and activity
- Interactive network topology

### API Integration

API client (`frontend/src/api/blockchain.ts`) handles:
- HTTP requests to Flask backend
- Type-safe response handling
- Error management
- Real-time data polling

### Custom Hooks

**useMinerAutoMine (`frontend/src/hooks/useMinerAutoMine.ts`)**:
- Automated mining loop for registered miners
- Configurable mining intervals
- Handles mining requests and updates

## Prerequisites

- **Python 3.6 or higher**
- **Node.js 16+ and npm**
- **pip** (Python package manager)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd blockchain
```

### 2. Backend Setup

Install Python dependencies:

```bash
cd backend
pip install flask flask-cors requests scrypt
```

Or using pipenv:

```bash
pip install pipenv
pipenv install
```

### 3. Frontend Setup

Install Node.js dependencies:

```bash
cd frontend
npm install
```

## Running the Application

### Start the Backend

From the `backend` directory:

```bash
python app.py
```

The Flask server will start on `http://localhost:5001` by default.

To run on a different port:

```bash
python app.py --port 5002
```

### Start the Frontend

From the `frontend` directory:

```bash
npm run dev
```

The Vite development server will start on `http://localhost:5173` (or next available port).

### Access the Application

Open your browser to the frontend URL (typically `http://localhost:5173`). The dashboard will load and connect to the backend API.

## API Endpoints

### Blockchain Operations

- `GET /api/chain` - Retrieve full blockchain
- `GET /stats` - Get blockchain statistics
- `GET /api/supply` - Get supply information
- `GET /api/difficulty` - Get difficulty information

### Mining

- `GET /api/mine` - Mine a new block (simple)
- `POST /api/mine_with_rate` - Mine with specific hash rate
  ```json
  {
    "miner": "miner_id",
    "hash_rate": 5
  }
  ```

### Transactions

- `POST /api/transactions/new` - Create new transaction
  ```json
  {
    "sender": "address1",
    "recipient": "address2",
    "amount": 10
  }
  ```

### Miners

- `GET /api/miners` - List all registered miners
- `POST /api/miners/add` - Register new miner
  ```json
  {
    "id": "miner_1",
    "hashRate": 5
  }
  ```
- `POST /api/miners/delete` - Remove miner
  ```json
  {
    "id": "miner_1"
  }
  ```

### Network Consensus

- `POST /api/nodes/register` - Register network nodes
  ```json
  {
    "nodes": ["http://localhost:5002"]
  }
  ```
- `GET /api/nodes/resolve` - Resolve chain conflicts

## Project Structure

```
blockchain/
├── backend/
│   ├── app.py              # Flask REST API server
│   ├── blockchain.py       # Core blockchain implementation
│   └── __pycache__/        # Python bytecode cache
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Dashboard.tsx       # Main dashboard view
│   │   ├── components/
│   │   │   ├── BlockchainStats.tsx # Stats display
│   │   │   ├── MinerControls.jsx   # Miner management
│   │   │   └── MinerNetworkGraph.tsx # Network visualization
│   │   ├── api/
│   │   │   └── blockchain.ts       # API client
│   │   ├── hooks/
│   │   │   └── useMinerAutoMine.ts # Auto-mining hook
│   │   ├── App.tsx         # Root component
│   │   └── main.tsx        # Application entry
│   ├── public/             # Static assets
│   ├── package.json        # Node.js dependencies
│   ├── vite.config.ts      # Vite configuration
│   ├── tailwind.config.js  # Tailwind CSS config
│   └── tsconfig.json       # TypeScript config
├── tests/
│   ├── __init__.py
│   └── test_blockchain.py  # Blockchain tests
├── Dockerfile              # Container configuration
├── requirements.txt        # Python dependencies
├── Pipfile                 # Pipenv configuration
└── README.md              # This file
```

## Running Tests

From the project root:

```bash
python -m pytest tests/
```

## Open Source Credit

This project was built from the following open-source repository and instructions for Blockchain development: https://github.com/dvf/blockchain-book
