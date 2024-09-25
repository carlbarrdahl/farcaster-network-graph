"use client";
import { ForceGraph2D } from "react-force-graph";

export type NetworkProps = {
  width: number;
  height: number;
};

interface CustomNode {
  x: number;
  y: number;
  color?: string;
}

interface CustomLink {
  source: CustomNode;
  target: CustomNode;
  dashed?: boolean;
}

export function NetworkGraph({
  nodes = [],
  edges = [],
  width = 0,
}: {
  nodes: CustomNode[];
  edges: CustomLink[];
  width: number;
}) {
  return (
    <ForceGraph2D
      width={width}
      height={width}
      graphData={{ nodes, links: edges }}
      nodeCanvasObject={(node, ctx, globalScale) => {
        const label = node.username;
        const fontSize = 12 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(
          (n) => n + fontSize * 0.2
        );

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(
          node.x - bckgDimensions[0] / 2,
          node.y - bckgDimensions[1] / 2,
          ...bckgDimensions
        );

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.fillText(label, node.x, node.y);

        node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
      }}
    />
  );
}
