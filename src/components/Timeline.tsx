import React, { useEffect } from 'react';
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
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Button } from './ui/button';

// 定义节点类型
const nodeTypes: NodeTypes = {
  timelineNode: TimelineNode,
};

const Timeline: React.FC = () => {
  const { nodes: storeNodes, connections, fetchNodes } = useTimelineStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [searchTerm, setSearchTerm] = React.useState('');

  // 从store加载数据并转换为ReactFlow格式
  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  // 当store数据变化时，更新ReactFlow节点和边
  useEffect(() => {
    if (storeNodes.length > 0) {
      // 转换节点为ReactFlow格式
      const flowNodes: Node[] = storeNodes
        .filter(node => 
          searchTerm === '' || 
          node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.artists.some(artist => artist.toLowerCase().includes(searchTerm.toLowerCase())) ||
          node.styleMovement.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(node => ({
          id: node.id,
          type: 'timelineNode',
          position: node.position || { x: 0, y: 0 },
          data: { ...node },
      }));

      // 转换连接为ReactFlow边
      const flowEdges: Edge[] = connections
        .filter(conn => 
          flowNodes.some(node => node.id === conn.source) && 
          flowNodes.some(node => node.id === conn.target)
        )
        .map(conn => ({
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
  }, [storeNodes, connections, setNodes, setEdges, searchTerm]);

  // 处理节点位置变化
  const onNodeDragStop = (_: React.MouseEvent, node: Node) => {
    const { id, position } = node;
    useTimelineStore.getState().updateNodePosition(id, position);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 标题和搜索栏 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
      >
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent text-center">
            艺术主义时间线
          </h1>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <div className="flex items-center p-2 px-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input
                  type="text"
                  placeholder="搜索时间线节点..."
                  className="bg-transparent border-none outline-none text-sm text-muted-foreground w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm"
                className="border border-white/10 hover:bg-white/5 gap-2"
              >
                <Filter className="h-4 w-4" />
                筛选艺术流派
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ReactFlow 流程图 */}
      <div className="flex-grow border border-white/10 rounded-lg overflow-hidden bg-[#050505]/50 backdrop-blur-sm h-[70vh]">
        {nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-lg text-white/50">加载时间线数据...</div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={1.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          >
            <Background color="#333" gap={16} />
            <Controls />
            <MiniMap
              nodeStrokeColor="#555"
              nodeColor="#222"
              maskColor="rgba(0, 0, 0, 0.5)"
            />
          </ReactFlow>
        )}
      </div>
    </div>
  );
};

export default Timeline; 