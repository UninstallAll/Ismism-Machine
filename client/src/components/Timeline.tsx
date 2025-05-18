import React, { useEffect, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge,
  NodeTypes,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTimelineStore } from '../store/timelineStore';
import TimelineNode from './TimelineNode';
import { Box, Typography } from '@mui/material';

// 定义节点类型
const nodeTypes: NodeTypes = {
  timelineNode: TimelineNode,
};

const Timeline: React.FC = () => {
  const { nodes: storeNodes, connections, fetchNodes } = useTimelineStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 从store加载数据并转换为ReactFlow格式
  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  // 当store数据变化时，更新ReactFlow节点和边
  useEffect(() => {
    if (storeNodes.length > 0) {
      // 转换节点为ReactFlow格式
      const flowNodes: Node[] = storeNodes.map(node => ({
        id: node.id,
        type: 'timelineNode',
        position: node.position || { x: 0, y: 0 },
        data: { ...node },
      }));

      // 转换连接为ReactFlow边
      const flowEdges: Edge[] = connections.map(conn => ({
        id: `${conn.source}-${conn.target}`,
        source: conn.source,
        target: conn.target,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#555' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#555',
        },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [storeNodes, connections, setNodes, setEdges]);

  // 处理节点位置变化
  const onNodeDragStop = (event: React.MouseEvent, node: Node) => {
    const { id, position } = node;
    useTimelineStore.getState().updateNodePosition(id, position);
  };

  return (
    <Box sx={{ width: '100%', height: '100vh' }}>
      {nodes.length === 0 ? (
        <Typography variant="h6" sx={{ p: 2 }}>加载时间线数据...</Typography>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      )}
    </Box>
  );
};

export default Timeline; 