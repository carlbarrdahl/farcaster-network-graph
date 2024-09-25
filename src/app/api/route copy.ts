// Required imports
import axios from "axios";
import NodeFetchCache, { MemoryCache } from "node-fetch-cache";
import pRetry, { AbortError } from "p-retry";
import { getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { NextRequest } from "next/server";

import { PinataFDK } from "pinata-fdk";

const PINATA_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1MTI2NzEzZC04ZGZlLTQwODktYTZiYS03OTViMjc0ZTBiODMiLCJlbWFpbCI6ImNhcmxiYXJyZGFobEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZDBhOTM3ZTQ4Mjg0MzJjNDE5YzUiLCJzY29wZWRLZXlTZWNyZXQiOiJhNmJkNDU4Y2M0OTE1OWQwZDE1NzM5NTc1YjQ5ZjQ0NWU0OWU0MmY3MTkzZWM1OWZjMWFlZDBmNjkyYjYyOWRkIiwiaWF0IjoxNzE3NzUyMDI2fQ.zPyLyfcmvJs6LMZszPgIu0HNS0tvNiXrtivvjPZzexQ";
const PINATA_GATEWAY_URL = "apricot-surviving-takin-594.mypinata.cloud";

const fdk = new PinataFDK({
  pinata_jwt: PINATA_JWT,
  pinata_gateway: PINATA_GATEWAY_URL,
});

const fetch = NodeFetchCache.create({
  cache: new MemoryCache({ ttl: 1000 * 60 * 10 }),
});
async function request(
  url: string,
  params?: { method: "POST" | "GET"; body: string }
) {
  return pRetry(() => fetch(url, params).then((r) => r.json()), { retries: 5 });
  // return fetch(url, params).then((r) => r.json());
}

const hubAddress = "hoyt.farcaster.xyz:2283";
const client = getSSLHubRpcClient(hubAddress);

async function initializeClient(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    client.$.waitForReady(Date.now() + 5000, (err) => {
      if (err) {
        reject(`Failed to connect to the Farcaster Hub: ${err}`);
      } else {
        console.log("Connected to the Farcaster Hub");
        resolve();
      }
    });
  });
}

// Function to get FID from username using the Fname registry API
async function getFidFromUsername(username: string): Promise<number | null> {
  try {
    const response = await axios.get(
      `https://fnames.farcaster.xyz/transfers/current?name=${encodeURIComponent(
        username
      )}`
    );
    const transfer = response.data.transfer;
    if (transfer) {
      const fid = transfer.to;
      return fid;
    } else {
      console.warn(`No transfers found for username: ${username}`);
      return null;
    }
  } catch (error: any) {
    console.error(
      `Error fetching FID for username ${username}:`,
      error.message
    );
    return null;
  }
}

async function buildNodes(fids: number[]) {
  return Promise.all(
    fids.map((fid) => fdk.getUserByFid(fid).catch(() => null))
  ).then((users) =>
    users.filter(Boolean).map((user) => ({
      ...user,
      id: user?.fid,
    }))
  );
}

interface Edge {
  source: number; // FID of the follower
  target: number; // FID of the user being followed
}

async function checkFollow(a: number, b: number): Promise<boolean> {
  return request(
    `https://hub.pinata.cloud/v1/linkById?link_type=follow&fid=${a}&target_fid=${b}`
  )
    .then((r) => {
      if (r.errCode) throw new Error(r.errCode);

      return r;
    })
    .catch(() => false);
  return axios
    .get(
      `https://hub.pinata.cloud/v1/linkById?link_type=follow&fid=${a}&target_fid=${b}`
    )
    .then((r) => r.data?.data)
    .catch(() => false);
}

async function buildEdges(fids: number[]): Promise<Edge[]> {
  const edges = [];

  // Iterate over all pairs of FIDs
  for (const a of fids) {
    for (const b of fids) {
      if (a !== b) {
        console.log({ a, b });
        const follows = await checkFollow(a, b);

        console.log("follows", follows);
        if (follows) {
          edges.push({
            source: a,
            target: b,
            timestamp: convertFarcasterTimestamp(
              follows.data?.timestamp * 1000
            ),
          });
        }
      }
    }
  }

  return edges;
}

export async function POST(req: NextRequest) {
  try {
    await initializeClient();

    const users: string[] = await req.json();
    const fids = (await Promise.all(
      users.map((user) => getFidFromUsername(user))
    ).then((fids) => fids.filter(Boolean))) as number[];

    console.log(fids);

    const nodes = await buildNodes(fids);
    const edges = await buildEdges(nodes.map((node) => node.id));
    // const [nodes, edges] = await Promise.all([
    //   buildNodes(fids),
    //   buildEdges(fids),
    // ]);

    console.log({ nodes, edges });

    return Response.json({ nodes, edges });
  } catch (error) {
    console.error(error);
    return Response.error();
  } finally {
    // Close the client connection
    client.close();
  }
}

function convertFarcasterTimestamp(farcasterTimestamp: number): number {
  // Unix timestamp for Farcaster Epoch: January 1, 2021, 00:00:00 UTC
  const FARCASTER_EPOCH_UNIX = 1609459200 * 1000; // Seconds since January 1, 1970

  // Add the Farcaster timestamp to the Farcaster Epoch's Unix timestamp
  const unixTimestamp = farcasterTimestamp + FARCASTER_EPOCH_UNIX;

  return unixTimestamp;
}
