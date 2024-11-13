"use client";

import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { Form } from "./form";
import { NetworkGraph } from "./graph";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { MetricsDisplay } from "./metrics";
import { useMeasure } from "react-use";

export default function Home() {
  const call = useMutation({
    mutationFn: async (users: string[]) =>
      fetch("/api", {
        method: "POST",
        body: JSON.stringify(users),
        headers: { "content-type": "application/json" },
      }).then((r) => r.json()),
  });

  console.log(call.data);

  const graph = call.isPending
    ? { nodes: [], edges: [] }
    : call.data || getInitialGraph();

  const [currentTimestamp, setCurrentTimestamp] = useState(
    getMaxTimestamp(graph.edges)
  );
  console.log({ currentTimestamp }, Date.now());
  const filteredGraph = filterGraphByTimestamp({ ...graph }, currentTimestamp);

  console.log(JSON.stringify(filteredGraph, null, 2));
  const [ref, { width }] = useMeasure();
  const minTimestamp = getMinTimestamp(graph.edges);
  const maxTimestamp = getMaxTimestamp(graph.edges);

  return (
    <div>
      <Form
        defaultValue={getInitialGraph()
          .nodes.map((node) => node.username)
          .join(", ")}
        isLoading={call.isPending}
        onSubmit={(users) => {
          console.log("users", users);
          // setCurrentTimestamp(Date.now());
          call.mutate(users);
        }}
      />
      <div className="my-4">
        <Slider
          className="mb-1"
          defaultValue={[33]}
          min={minTimestamp}
          max={maxTimestamp}
          step={1}
          value={[currentTimestamp]}
          onValueChange={(value) => setCurrentTimestamp(Number(value))}
        />
      </div>
      <div className="flex justify-between text-sm mb-2" ref={ref}>
        <div>{format(minTimestamp, "PP")}</div>
        <div>{format(currentTimestamp, "PP")}</div>
        <div>{format(maxTimestamp, "PP")}</div>
      </div>
      <div className={call.isPending ? "opacity-50" : ""}>
        <MetricsDisplay {...filteredGraph} />
      </div>
      <div
        className={`border rounded mt-2 ${call.isPending ? "opacity-50" : ""}`}
      >
        <NetworkGraph width={width} {...call.data} {...filteredGraph} />
      </div>
    </div>
  );
}

function filterGraphByTimestamp(graph, maxTimestamp) {
  const filteredEdges = graph.edges.filter(
    (edge) => edge.timestamp <= maxTimestamp
  );

  const connectedNodeIds = new Set();
  filteredEdges.forEach((edge) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  const filteredNodes = graph.nodes.filter((node) =>
    connectedNodeIds.has(node.id)
  );

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
  };
}
function getMinTimestamp(edges = []) {
  return edges.length
    ? Math.min(...edges.map((edge) => edge.timestamp))
    : Date.now();
}

function getMaxTimestamp(edges = []) {
  return edges.length
    ? Math.max(...edges.map((edge) => edge.timestamp))
    : Date.now();
}

function convertFarcasterTimestamp(farcasterTimestamp: number): number {
  // Unix timestamp for Farcaster Epoch: January 1, 2021, 00:00:00 UTC
  const FARCASTER_EPOCH_UNIX = 1609459200 * 1000; // Seconds since January 1, 1970

  // Add the Farcaster timestamp to the Farcaster Epoch's Unix timestamp
  const unixTimestamp = farcasterTimestamp + FARCASTER_EPOCH_UNIX;

  return unixTimestamp;
}

function getInitialGraph() {
  return {
    nodes: [
      {
        fid: 37,
        username: "balajis",
        pfp: "https://github.com/balajis.png",
        bio: "Author of thenetworkstate.com.",
        id: 37,
      },
      {
        fid: 3352,
        username: "odysseustz",
        pfp: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/e2472840-5f46-4dfd-8434-f219ff429a00/original",
        bio: "left curve @flashbots",
        id: 3352,
      },
      {
        fid: 836197,
        username: "feides",
        pfp: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/da28f517-b083-4e87-2485-15e9947b6100/rectcrop3",
        bio: "Around the world",
        id: 836197,
      },
      {
        fid: 841507,
        username: "milandereede",
        pfp: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/b2d2f29b-c2f6-41b7-717d-6b44e87b1800/rectcrop3",
        bio: "Developer, crypto enthusiast",
        id: 841507,
      },
      {
        fid: 851874,
        username: "omarreid",
        pfp: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/db0c7412-a798-48bf-e15d-584570920b00/rectcrop3",
        bio: "Build collective wealth. Achieve generational freedom.  ",
        id: 851874,
      },
      {
        fid: 13552,
        username: "memester",
        pfp: "https://i.imgur.com/dMYQVyE.jpg",
        bio: "Memes. Memes. Memes.\nSilver Tribe ⚪️ #CTG",
        id: 13552,
      },
      {
        fid: 842172,
        username: "rudrakanya",
        pfp: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/eea2182f-14ef-4dd8-cb20-01b28149bf00/rectcrop3",
        bio: "Mystery, Mastery, Manifestation, Mysticism, Magick (& Memes)",
        id: 842172,
      },
      {
        fid: 840600,
        username: "calvinlegassick",
        pfp: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fb862f9a-6880-44c8-ccdd-a48178c3f500/rectcrop3",
        bio: "Building www.capture.so",
        id: 840600,
      },
      {
        fid: 852251,
        username: "heyzeus",
        pfp: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/f9951ee2-3180-41cf-eea7-4a5a091e3200/rectcrop3",
        bio: "Kinda like a Jimminy Cricket for those with a God complex",
        id: 852251,
      },
      {
        fid: 211159,
        username: "beecurious",
        pfp: "https://i.imgur.com/HTCi4oR.jpg",
        bio: "Founder of /farcastea\nNewsletter for Japan: https://paragraph.xyz/@beecurious\n\nHosting /japan + channel and 🇦🇱 based in  🇯🇵",
        id: 211159,
      },
      {
        fid: 840789,
        username: "blackmajic5000",
        pfp: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/26ce36ad-d61f-462d-ba80-d7fa19b66100/rectcrop3",
        bio: "Software engineer helping cluttered minds find peace and purpose",
        id: 840789,
      },
      {
        fid: 854234,
        username: "krisx",
        pfp: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/f3487daf-b02d-4c25-f536-feac95096c00/original",
        bio: "Trader & Builder in web3",
        id: 854234,
      },
      {
        fid: 840008,
        username: "carl-b",
        pfp: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/7ec08db1-476b-4062-e358-de060bca0200/rectcrop3",
        bio: "",
        id: 840008,
      },
    ],
    edges: [
      {
        source: 3352,
        target: 37,
        timestamp: 1666824676000,
      },
      {
        source: 3352,
        target: 836197,
        timestamp: 1725706723000,
      },
      {
        source: 3352,
        target: 841507,
        timestamp: 1725706741000,
      },
      {
        source: 3352,
        target: 851874,
        timestamp: 1725725753000,
      },
      {
        source: 3352,
        target: 211159,
        timestamp: 1726494913000,
      },
      {
        source: 836197,
        target: 37,
        timestamp: 1725091367000,
      },
      {
        source: 836197,
        target: 3352,
        timestamp: 1725714989000,
      },
      {
        source: 836197,
        target: 841507,
        timestamp: 1725770231000,
      },
      {
        source: 836197,
        target: 851874,
        timestamp: 1725714994000,
      },
      {
        source: 836197,
        target: 842172,
        timestamp: 1726329258000,
      },
      {
        source: 836197,
        target: 852251,
        timestamp: 1726378975000,
      },
      {
        source: 841507,
        target: 211159,
        timestamp: 1726466058000,
      },
      {
        source: 851874,
        target: 37,
        timestamp: 1725705722000,
      },
      {
        source: 851874,
        target: 3352,
        timestamp: 1725706713000,
      },
      {
        source: 851874,
        target: 836197,
        timestamp: 1725706114000,
      },
      {
        source: 851874,
        target: 841507,
        timestamp: 1725793481000,
      },
      {
        source: 851874,
        target: 13552,
        timestamp: 1726083408000,
      },
      {
        source: 851874,
        target: 842172,
        timestamp: 1726083425000,
      },
      {
        source: 851874,
        target: 840600,
        timestamp: 1726086265000,
      },
      {
        source: 851874,
        target: 852251,
        timestamp: 1726091477000,
      },
      {
        source: 851874,
        target: 211159,
        timestamp: 1725706687000,
      },
      {
        source: 851874,
        target: 840789,
        timestamp: 1726124850000,
      },
      {
        source: 851874,
        target: 854234,
        timestamp: 1726131950000,
      },
      {
        source: 13552,
        target: 37,
        timestamp: 1704736446000,
      },
      {
        source: 842172,
        target: 37,
        timestamp: 1724466820000,
      },
      {
        source: 842172,
        target: 3352,
        timestamp: 1726212275000,
      },
      {
        source: 842172,
        target: 836197,
        timestamp: 1726212290000,
      },
      {
        source: 842172,
        target: 841507,
        timestamp: 1726212308000,
      },
      {
        source: 842172,
        target: 851874,
        timestamp: 1726212325000,
      },
      {
        source: 842172,
        target: 13552,
        timestamp: 1726224726000,
      },
      {
        source: 842172,
        target: 840600,
        timestamp: 1726224745000,
      },
      {
        source: 842172,
        target: 852251,
        timestamp: 1726224754000,
      },
      {
        source: 842172,
        target: 211159,
        timestamp: 1726224780000,
      },
      {
        source: 842172,
        target: 840789,
        timestamp: 1726224801000,
      },
      {
        source: 842172,
        target: 854234,
        timestamp: 1726224813000,
      },
      {
        source: 852251,
        target: 37,
        timestamp: 1725839904000,
      },
      {
        source: 852251,
        target: 3352,
        timestamp: 1726120694000,
      },
      {
        source: 852251,
        target: 836197,
        timestamp: 1726120709000,
      },
      {
        source: 852251,
        target: 841507,
        timestamp: 1726120730000,
      },
      {
        source: 852251,
        target: 851874,
        timestamp: 1726120741000,
      },
      {
        source: 852251,
        target: 13552,
        timestamp: 1726121149000,
      },
      {
        source: 852251,
        target: 842172,
        timestamp: 1726121161000,
      },
      {
        source: 852251,
        target: 840600,
        timestamp: 1726121181000,
      },
      {
        source: 852251,
        target: 211159,
        timestamp: 1726121220000,
      },
      {
        source: 852251,
        target: 840789,
        timestamp: 1726121235000,
      },
      {
        source: 852251,
        target: 854234,
        timestamp: 1726265913000,
      },
      {
        source: 211159,
        target: 37,
        timestamp: 1702873266000,
      },
      {
        source: 211159,
        target: 841507,
        timestamp: 1726465683000,
      },
      {
        source: 211159,
        target: 840600,
        timestamp: 1726194238000,
      },
      {
        source: 840789,
        target: 37,
        timestamp: 1724377288000,
      },
      {
        source: 854234,
        target: 37,
        timestamp: 1726207898000,
      },
      {
        source: 854234,
        target: 3352,
        timestamp: 1726130983000,
      },
      {
        source: 854234,
        target: 851874,
        timestamp: 1726130941000,
      },
      {
        source: 840008,
        target: 37,
        timestamp: 1726050904000,
      },
    ],
  };
}
