import React, { useEffect } from 'react';
import { useTimelineStore } from '../store/timelineStore';
import DraggableNode from './DraggableNode';

const Timeline = () => {
  const { nodes, loading, error, fetchNodes } = useTimelineStore(state => ({
    nodes: state.nodes,
    loading: state.loading,
    error: state.error,
    fetchNodes: state.fetchNodes
  }));

  useEffect(() => {
    // 组件挂载时获取节点数据
    fetchNodes();
  }, [fetchNodes]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        <p>加载时间线数据时出错:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[800px] bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
      {/* 水平参考线 - 时间轴 */}
      <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-300"></div>
      
      {/* 节点 */}
      {nodes.map(node => (
        <DraggableNode key={node.id} node={node} />
      ))}
      
      {/* 如果没有节点，显示提示 */}
      {nodes.length === 0 && (
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-500">暂无时间线数据</p>
        </div>
      )}
    </div>
  );
};

export default Timeline; 