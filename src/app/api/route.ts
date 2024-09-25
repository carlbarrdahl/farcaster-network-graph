import NodeFetchCache, { MemoryCache } from "node-fetch-cache";
import pRetry from "p-retry";
import { getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { NextRequest } from "next/server";

import { PinataFDK } from "pinata-fdk";

const fdk = new PinataFDK({
  pinata_jwt: process.env.PINATA_JWT!,
  pinata_gateway: process.env.PINATA_GATEWAY_URL!,
});

// Cache fetch requests for 1 hour
const fetch = NodeFetchCache.create({
  cache: new MemoryCache({ ttl: 1000 * 60 * 60 }),
});
async function request(
  url: string,
  params?: { method: "POST" | "GET"; body: string }
) {
  // Retry failed requests
  return pRetry(() => fetch(url, params).then((r) => r.json()), { retries: 5 });
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

async function getFidFromUsername(username: string): Promise<number | null> {
  return request(
    `https://fnames.farcaster.xyz/transfers/current?name=${encodeURIComponent(
      username
    )}`
  ).then((r) => r?.transfer?.to);
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
}

async function buildEdges(fids: number[]): Promise<Edge[]> {
  const edges = [];
  for (const source of fids) {
    for (const target of fids) {
      if (source !== target) {
        const follows = await checkFollow(source, target);
        console.log("follows", follows);
        if (follows) {
          edges.push({
            source,
            target,
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
