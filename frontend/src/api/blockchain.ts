import axios from "axios";

export async function mineBlock() {
  const res = await axios.get("/api/mine");
  return res.data;
}

export async function mineWithRate(miner: string, hashRate: number) {
  const res = await axios.post("/api/mine_with_rate", {
    miner,
    hash_rate: hashRate,
  });
  return res.data;
}

export async function getChain() {
  const res = await axios.get("/api/chain");
  return res.data;
}

export async function getSupply() {
  const res = await axios.get("/api/supply");
  return res.data;
}

export async function getDifficulty() {
  const res = await axios.get("/api/difficulty");
  return res.data;
}