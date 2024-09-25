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

  console.log(graph);
  const [currentTimestamp, setMaxTimestamp] = useState(
    getMaxTimestamp(graph.edges)
  );

  const filteredGraph = filterGraphByTimestamp(graph, currentTimestamp);

  const [ref, { width }] = useMeasure();
  const minTimestamp = getMinTimestamp(graph.edges);
  const maxTimestamp = getMaxTimestamp(graph.edges);
  console.log({ minTimestamp, maxTimestamp });

  return (
    <div>
      <Form
        isLoading={call.isPending}
        onSubmit={(users) => {
          console.log("users", users);

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
          onValueChange={(value) => setMaxTimestamp(Number(value))}
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
        fid: 3352,
        username: "odysseustz",
        pfp: "https://mappalicious.files.wordpress.com/2015/12/odysseus.jpg",
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
        fid: 384378,
        username: "biohacker",
        pfp: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/3ab9bf65-4325-4ccd-521c-07b56c7b9a00/rectcrop3",
        bio: "LONGEVITY X CRYPTO",
        id: 384378,
      },
      {
        fid: 432386,
        username: "mosnassar",
        pfp: "https://i.imgur.com/5L7JTpY.jpg",
        bio: "Engineer and pixel art wizard",
        id: 432386,
      },
      {
        fid: 18775,
        username: "camellia",
        pfp: "https://i.imgur.com/jGAxXjA.jpg",
        bio: "A pixel in Mandelbrot set\n👉🏻www.camelliayang.com",
        id: 18775,
      },
      {
        fid: 840616,
        username: "electrafrost",
        pfp: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/9e8b26e7-0b5e-4d00-9655-e1e749892e00/rectcrop3",
        bio: "Web3 accountant, Stacks advocate, building on Bitcoin, living remotely and simply in nature, open source everything",
        id: 840616,
      },
      {
        fid: 841394,
        username: "valone",
        pfp: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/5463efd8-6639-409c-0251-afedcb29af00/rectcrop3",
        bio: "Animation film director",
        id: 841394,
      },
      {
        fid: 845004,
        username: "dexhunter",
        pfp: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/ad93bf0a-e8a8-4a8a-5e24-a89c1168cc00/rectcrop3",
        bio: "Builder | NSer",
        id: 845004,
      },
      {
        fid: 843259,
        username: "nurtinba",
        pfp: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/c8b5161d-db1b-43b0-fe1c-d138699bde00/rectcrop3",
        bio: "e/acc, ns v1 ",
        id: 843259,
      },
      {
        fid: 840824,
        username: "smorez",
        pfp: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/28fae0ea-d143-4c08-fcee-242c10fe4600/rectcrop3",
        bio: "",
        id: 840824,
      },
      {
        fid: 841639,
        username: "0htrap1",
        pfp: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/6f128bd0-0e8f-40b1-468d-a2393b239300/rectcrop3",
        bio: "",
        id: 841639,
      },
    ],
    edges: [
      {
        source: 3352,
        target: 836197,
        timestamp: convertFarcasterTimestamp(116247523 * 1000),
      },
      {
        source: 3352,
        target: 841507,
        timestamp: convertFarcasterTimestamp(116247541 * 1000),
      },
      {
        source: 3352,
        target: 851874,
        timestamp: convertFarcasterTimestamp(116247499 * 1000),
      },
      {
        source: 3352,
        target: 384378,
        timestamp: convertFarcasterTimestamp(116247558 * 1000),
      },
      {
        source: 3352,
        target: 432386,
        timestamp: convertFarcasterTimestamp(116247566 * 1000),
      },
      {
        source: 3352,
        target: 18775,
        timestamp: convertFarcasterTimestamp(116247597 * 1000),
      },
      {
        source: 3352,
        target: 841394,
        timestamp: convertFarcasterTimestamp(116247651 * 1000),
      },
      {
        source: 3352,
        target: 845004,
        timestamp: convertFarcasterTimestamp(116247681 * 1000),
      },
      {
        source: 836197,
        target: 3352,
        timestamp: convertFarcasterTimestamp(116255789 * 1000),
      },
      {
        source: 836197,
        target: 841507,
        timestamp: convertFarcasterTimestamp(116311031 * 1000),
      },
      {
        source: 836197,
        target: 851874,
        timestamp: convertFarcasterTimestamp(116255794 * 1000),
      },
      {
        source: 836197,
        target: 384378,
        timestamp: convertFarcasterTimestamp(116313178 * 1000),
      },
      {
        source: 836197,
        target: 18775,
        timestamp: convertFarcasterTimestamp(116310989 * 1000),
      },
      {
        source: 836197,
        target: 840616,
        timestamp: convertFarcasterTimestamp(116311022 * 1000),
      },
      {
        source: 836197,
        target: 845004,
        timestamp: convertFarcasterTimestamp(116311042 * 1000),
      },
      {
        source: 836197,
        target: 841639,
        timestamp: convertFarcasterTimestamp(116263910 * 1000),
      },
      {
        source: 851874,
        target: 3352,
        timestamp: convertFarcasterTimestamp(116247513 * 1000),
      },
      {
        source: 851874,
        target: 841507,
        timestamp: convertFarcasterTimestamp(116334281 * 1000),
      },
      {
        source: 851874,
        target: 18775,
        timestamp: convertFarcasterTimestamp(116248117 * 1000),
      },
      {
        source: 851874,
        target: 840616,
        timestamp: convertFarcasterTimestamp(116247394 * 1000),
      },
      {
        source: 851874,
        target: 841394,
        timestamp: convertFarcasterTimestamp(116248175 * 1000),
      },
      {
        source: 851874,
        target: 845004,
        timestamp: convertFarcasterTimestamp(116247376 * 1000),
      },
      {
        source: 851874,
        target: 843259,
        timestamp: convertFarcasterTimestamp(116247521 * 1000),
      },
      {
        source: 851874,
        target: 840824,
        timestamp: convertFarcasterTimestamp(116247787 * 1000),
      },
      {
        source: 851874,
        target: 841639,
        timestamp: convertFarcasterTimestamp(116247412 * 1000),
      },
      {
        source: 384378,
        target: 3352,
        timestamp: convertFarcasterTimestamp(116312163 * 1000),
      },
      {
        source: 384378,
        target: 432386,
        timestamp: convertFarcasterTimestamp(102475616 * 1000),
      },
      {
        source: 384378,
        target: 18775,
        timestamp: convertFarcasterTimestamp(116360775 * 1000),
      },
      {
        source: 432386,
        target: 384378,
        timestamp: convertFarcasterTimestamp(102475627 * 1000),
      },
      {
        source: 840616,
        target: 845004,
        timestamp: convertFarcasterTimestamp(116247357 * 1000),
      },
      {
        source: 845004,
        target: 3352,
        timestamp: convertFarcasterTimestamp(116247936 * 1000),
      },
      {
        source: 845004,
        target: 851874,
        timestamp: convertFarcasterTimestamp(116247950 * 1000),
      },
      {
        source: 845004,
        target: 18775,
        timestamp: convertFarcasterTimestamp(116250102 * 1000),
      },
      {
        source: 845004,
        target: 840616,
        timestamp: convertFarcasterTimestamp(116247953 * 1000),
      },
      {
        source: 843259,
        target: 851874,
        timestamp: convertFarcasterTimestamp(116246839 * 1000),
      },
      {
        source: 843259,
        target: 841639,
        timestamp: convertFarcasterTimestamp(116257372 * 1000),
      },
      {
        source: 840824,
        target: 851874,
        timestamp: convertFarcasterTimestamp(116661832 * 1000),
      },
      {
        source: 840824,
        target: 841639,
        timestamp: convertFarcasterTimestamp(116661830 * 1000),
      },
      {
        source: 841639,
        target: 3352,
        timestamp: convertFarcasterTimestamp(116257280 * 1000),
      },
      {
        source: 841639,
        target: 836197,
        timestamp: convertFarcasterTimestamp(116257208 * 1000),
      },
      {
        source: 841639,
        target: 851874,
        timestamp: convertFarcasterTimestamp(116257118 * 1000),
      },
      {
        source: 841639,
        target: 384378,
        timestamp: convertFarcasterTimestamp(116257246 * 1000),
      },
      {
        source: 841639,
        target: 432386,
        timestamp: convertFarcasterTimestamp(116257263 * 1000),
      },
      {
        source: 841639,
        target: 18775,
        timestamp: convertFarcasterTimestamp(116257303 * 1000),
      },
      {
        source: 841639,
        target: 840616,
        timestamp: convertFarcasterTimestamp(116257315 * 1000),
      },
      {
        source: 841639,
        target: 841394,
        timestamp: convertFarcasterTimestamp(116257328 * 1000),
      },
      {
        source: 841639,
        target: 845004,
        timestamp: convertFarcasterTimestamp(116257337 * 1000),
      },
      {
        source: 841639,
        target: 843259,
        timestamp: convertFarcasterTimestamp(116257354 * 1000),
      },
      {
        source: 841639,
        target: 840824,
        timestamp: convertFarcasterTimestamp(116257368 * 1000),
      },
    ],
  };
}
