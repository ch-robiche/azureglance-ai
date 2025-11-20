import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TopologyData, TopologyNode, TopologyLink, ResourceType } from '../types';

interface TopologyMapProps {
  data: TopologyData;
  onNodeClick: (node: TopologyNode) => void;
}

const TopologyMap: React.FC<TopologyMapProps> = ({ data, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{x: number, y: number, content: string} | null>(null);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Clear previous svg content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; background-color: #0f172a;");

    // Group for zoomable content
    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    svg.call(zoom);

    // Color scale based on status
    const colorScale = (status: string) => {
        switch(status) {
            case 'Running': return '#22c55e'; // green-500
            case 'OK': return '#3b82f6'; // blue-500
            case 'Stopped': return '#94a3b8'; // slate-400
            case 'Degraded': return '#ef4444'; // red-500
            default: return '#64748b';
        }
    };

    const getNodeRadius = (type: string) => {
        switch(type) {
            case ResourceType.SUBSCRIPTION: return 35;
            case ResourceType.RESOURCE_GROUP: return 25;
            case ResourceType.VNET: return 20;
            case ResourceType.SUBNET: return 15;
            default: return 12;
        }
    };

    // Simulation setup
    const simulation = d3.forceSimulation<TopologyNode>(data.nodes)
      .force("link", d3.forceLink<TopologyNode, TopologyLink>(data.links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(d => (d as any).val * 2 + 10));

    // Draw Links
    const link = g.append("g")
      .attr("stroke", "#475569")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(2))
      .attr("stroke-dasharray", d => d.type === 'connects' ? "5,5" : "0");

    // Draw Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(d3.drag<SVGGElement, TopologyNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    // Node Circles
    node.append("circle")
        .attr("r", d => getNodeRadius(d.type))
        .attr("fill", "#1e293b")
        .attr("stroke", d => colorScale(d.status))
        .attr("stroke-width", 2.5)
        .on("click", (event, d) => {
             event.stopPropagation();
             onNodeClick(d);
        })
        .on("mouseover", (event, d) => {
            setTooltip({
                x: event.pageX,
                y: event.pageY,
                content: `${d.name} (${d.type})`
            });
            d3.select(event.currentTarget).attr("stroke", "#ffffff");
        })
        .on("mouseout", (event) => {
            setTooltip(null);
            d3.select(event.currentTarget).attr("stroke", (d: any) => colorScale(d.status));
        });

    // Node Labels (Text) - Only for larger items or if zoomed in (simplified here)
    node.append("text")
        .attr("dx", d => getNodeRadius(d.type) + 5)
        .attr("dy", ".35em")
        .text(d => d.name.length > 15 ? d.name.substring(0,12) + '...' : d.name)
        .attr("fill", "#e2e8f0")
        .style("font-size", "10px")
        .style("font-weight", "500")
        .style("pointer-events", "none");

    // Simulation Tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as TopologyNode).x!)
        .attr("y1", d => (d.source as TopologyNode).y!)
        .attr("x2", d => (d.target as TopologyNode).x!)
        .attr("y2", d => (d.target as TopologyNode).y!);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: TopologyNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: TopologyNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: TopologyNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, onNodeClick]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-900 overflow-hidden rounded-xl border border-slate-800 shadow-inner">
        <svg ref={svgRef} className="w-full h-full"></svg>
        
        {/* Simple Tooltip */}
        {tooltip && (
            <div 
                className="absolute pointer-events-none bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg z-50 border border-slate-600"
                style={{ left: tooltip.x + 10, top: tooltip.y - 30 }} // Note: In a real app, calculate relative to container, this is relative to page which works for fixed layout
            >
                {tooltip.content}
            </div>
        )}

        <div className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur p-2 rounded-lg border border-slate-700 text-xs text-slate-300">
            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Running</div>
            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> OK</div>
            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Degraded</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Stopped</div>
        </div>
    </div>
  );
};

export default TopologyMap;