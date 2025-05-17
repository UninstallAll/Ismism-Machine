import TimelineNodeModel from '../models/TimelineNode.js';

// 模拟数据 - 当MongoDB未连接时使用
let mockNodes = [
  {
    id: '1',
    title: '印象主义的诞生',
    description: '印象主义作为一种艺术运动开始于19世纪70年代的法国巴黎',
    year: 1872,
    tags: ['印象派', '绘画', '法国'],
    position: { x: 10, y: 100 },
    imageUrl: 'https://example.com/impressionism.jpg'
  },
  {
    id: '2',
    title: '毕加索的蓝色时期',
    description: '毕加索创作的一系列几乎单色的绘画，主要使用蓝色和蓝绿色',
    year: 1901,
    tags: ['毕加索', '现代主义', '蓝色时期'],
    position: { x: 150, y: 200 },
    imageUrl: 'https://example.com/picasso-blue.jpg'
  }
];

// 获取所有节点
export const getAllNodes = async (req, res) => {
  try {
    // 如果MongoDB已连接，使用真实数据库
    // const nodes = await TimelineNode.find();
    // 否则使用模拟数据
    const nodes = mockNodes;
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取单个节点
export const getNodeById = async (req, res) => {
  try {
    // 如果MongoDB已连接:
    // const node = await TimelineNode.findById(req.params.id);
    // 否则使用模拟数据:
    const node = mockNodes.find(node => node.id === req.params.id);
    
    if (!node) return res.status(404).json({ message: '节点不存在' });
    res.json(node);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 创建节点
export const createNode = async (req, res) => {
  try {
    // 如果MongoDB已连接:
    // const node = new TimelineNode(req.body);
    // const newNode = await node.save();
    
    // 否则使用模拟数据:
    const newNode = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockNodes.push(newNode);
    
    res.status(201).json(newNode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 更新节点
export const updateNode = async (req, res) => {
  try {
    // 如果MongoDB已连接:
    // const updatedNode = await TimelineNode.findByIdAndUpdate(
    //   req.params.id, 
    //   { ...req.body, updatedAt: Date.now() },
    //   { new: true }
    // );
    
    // 否则使用模拟数据:
    const index = mockNodes.findIndex(node => node.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: '节点不存在' });
    
    mockNodes[index] = {
      ...mockNodes[index],
      ...req.body,
      updatedAt: new Date()
    };
    
    res.json(mockNodes[index]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 删除节点
export const deleteNode = async (req, res) => {
  try {
    // 如果MongoDB已连接:
    // const node = await TimelineNode.findByIdAndDelete(req.params.id);
    
    // 否则使用模拟数据:
    const index = mockNodes.findIndex(node => node.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: '节点不存在' });
    
    const deletedNode = mockNodes[index];
    mockNodes = mockNodes.filter(node => node.id !== req.params.id);
    
    res.json({ message: '节点已删除', node: deletedNode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 