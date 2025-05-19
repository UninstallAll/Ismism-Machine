import { create } from 'zustand';
import { fetchTimelineNodes, updateNode, createNode, deleteNode } from '../api/timelineApi';

interface TimelineNode {
  id: string;
  title: string;
  year: number;
  description: string;
  imageUrl?: string;
  artists: string[];
  styleMovement: string;
  influences: string[];
  influencedBy: string[];
  position?: { x: number; y: number };
  tags?: string[];
}

interface Connection {
  source: string;
  target: string;
  type: string;
}

interface TimelineState {
  nodes: TimelineNode[];
  connections: Connection[];
  loading: boolean;
  error: string | null;
  fetchNodes: () => Promise<void>;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  addNode: (nodeData: Partial<TimelineNode>) => Promise<void>;
  removeNode: (id: string) => Promise<void>;
}

// 示例数据
const sampleNodes: TimelineNode[] = [
  {
    id: '1',
    title: '印象派',
    year: 1872,
    description: '强调光线和色彩的即时视觉印象，笔触松散可见',
    artists: ['莫奈', '雷诺阿', '德加'],
    styleMovement: 'impressionism',
    influences: ['巴比松画派', '日本浮世绘'],
    influencedBy: [],
    position: { x: 100, y: 150 },
    tags: ['印象派', '法国', '19世纪']
  },
  {
    id: '2',
    title: '立体主义',
    year: 1907,
    description: '将对象分解为几何形状，从多个角度同时表现',
    artists: ['毕加索', '布拉克'],
    styleMovement: 'cubism',
    influences: ['塞尚', '非洲艺术'],
    influencedBy: ['印象派'],
    position: { x: 350, y: 250 },
    tags: ['立体主义', '法国', '20世纪初']
  },
  {
    id: '3',
    title: '超现实主义',
    year: 1924,
    description: '结合梦境与现实，创造超越理性的奇特视觉',
    artists: ['达利', '马格里特', '米罗'],
    styleMovement: 'surrealism',
    influences: ['达达主义', '弗洛伊德心理学'],
    influencedBy: ['立体主义'],
    position: { x: 600, y: 180 },
    tags: ['超现实主义', '法国', '20世纪']
  },
  {
    id: '4',
    title: '新印象主义',
    year: 1884,
    description: '运用点彩技法，通过小点色彩的并置产生视觉混合',
    artists: ['修拉', '西涅克'],
    styleMovement: 'neo-impressionism',
    influences: ['印象派', '色彩理论'],
    influencedBy: [],
    position: { x: 200, y: 300 },
    tags: ['新印象主义', '法国', '19世纪末']
  },
  {
    id: '5',
    title: '后印象派',
    year: 1886,
    description: '超越印象派的表面印象，强调个人表达和形式结构',
    artists: ['梵高', '高更', '塞尚'],
    styleMovement: 'post-impressionism',
    influences: ['印象派', '日本浮世绘'],
    influencedBy: ['新印象主义'],
    position: { x: 250, y: 220 },
    tags: ['后印象派', '法国', '19世纪末']
  },
  {
    id: '6',
    title: '表现主义',
    year: 1905,
    description: '强调主观情感表达，扭曲现实以增强情感冲击',
    artists: ['蒙克', '基尔希纳', '诺尔德'],
    styleMovement: 'expressionism',
    influences: ['梵高', '高更'],
    influencedBy: ['后印象派'],
    position: { x: 400, y: 150 },
    tags: ['表现主义', '德国', '20世纪初']
  },
  {
    id: '7',
    title: '野兽派',
    year: 1905,
    description: '使用强烈、非自然的色彩和大胆的笔触表现情感',
    artists: ['马蒂斯', '德兰', '弗拉芒克'],
    styleMovement: 'fauvism',
    influences: ['后印象派', '非洲艺术'],
    influencedBy: [],
    position: { x: 380, y: 320 },
    tags: ['野兽派', '法国', '20世纪初']
  },
  {
    id: '8',
    title: '达达主义',
    year: 1916,
    description: '反传统、反艺术的艺术运动，强调荒谬与偶然性',
    artists: ['杜尚', '阿尔普', '恩斯特'],
    styleMovement: 'dadaism',
    influences: ['立体主义', '第一次世界大战'],
    influencedBy: [],
    position: { x: 500, y: 250 },
    tags: ['达达主义', '欧洲', '20世纪前期']
  },
  {
    id: '9',
    title: '构成主义',
    year: 1915,
    description: '强调几何形式与现代工业材料，服务于社会目的',
    artists: ['塔特林', '罗德琴科', '利西茨基'],
    styleMovement: 'constructivism',
    influences: ['立体主义', '未来主义'],
    influencedBy: [],
    position: { x: 450, y: 180 },
    tags: ['构成主义', '俄国', '20世纪前期']
  },
  {
    id: '10',
    title: '抽象表现主义',
    year: 1943,
    description: '强调自发行动和动态绘画过程的抽象绘画',
    artists: ['波洛克', '德库宁', '罗斯科'],
    styleMovement: 'abstract-expressionism',
    influences: ['超现实主义', '表现主义'],
    influencedBy: ['超现实主义'],
    position: { x: 700, y: 250 },
    tags: ['抽象表现主义', '美国', '20世纪中期']
  },
  {
    id: '11',
    title: '波普艺术',
    year: 1955,
    description: '从大众文化和消费主义中汲取主题和材料',
    artists: ['沃霍尔', '利希滕斯坦', '奥尔登堡'],
    styleMovement: 'pop-art',
    influences: ['达达主义', '商业广告'],
    influencedBy: ['抽象表现主义'],
    position: { x: 800, y: 300 },
    tags: ['波普艺术', '美国', '20世纪后期']
  },
  {
    id: '12',
    title: '极简主义',
    year: 1960,
    description: '减少艺术到最基本元素，强调简单和客观性',
    artists: ['贾德', '弗拉文', '安德烈'],
    styleMovement: 'minimalism',
    influences: ['抽象表现主义', '构成主义'],
    influencedBy: [],
    position: { x: 850, y: 180 },
    tags: ['极简主义', '美国', '20世纪后期']
  },
  {
    id: '13',
    title: '观念艺术',
    year: 1965,
    description: '核心是艺术的概念或想法，物理形式次之',
    artists: ['科苏斯', '魏纳', '霍尔泽'],
    styleMovement: 'conceptual-art',
    influences: ['达达主义', '极简主义'],
    influencedBy: ['极简主义'],
    position: { x: 900, y: 250 },
    tags: ['观念艺术', '全球', '20世纪后期']
  },
  {
    id: '14',
    title: '新表现主义',
    year: 1980,
    description: '回归强烈色彩和激情表达的具象绘画',
    artists: ['巴斯奎特', '基弗', '克门特'],
    styleMovement: 'neo-expressionism',
    influences: ['表现主义', '野兽派'],
    influencedBy: [],
    position: { x: 950, y: 320 },
    tags: ['新表现主义', '国际性', '20世纪末期']
  },
  {
    id: '15',
    title: '装置艺术',
    year: 1970,
    description: '创造三维环境，改变观众对空间的体验',
    artists: ['博伊斯', '卡普尔', '艾未未'],
    styleMovement: 'installation-art',
    influences: ['观念艺术', '极简主义'],
    influencedBy: ['观念艺术'],
    position: { x: 930, y: 200 },
    tags: ['装置艺术', '国际性', '20世纪末期']
  },
  {
    id: '16',
    title: '录像艺术',
    year: 1965,
    description: '使用录像技术作为艺术表达的主要媒介',
    artists: ['派克', '维奥拉', '希尔'],
    styleMovement: 'video-art',
    influences: ['观念艺术', '电影实验'],
    influencedBy: [],
    position: { x: 880, y: 150 },
    tags: ['录像艺术', '国际性', '20世纪后期']
  },
  {
    id: '17',
    title: '行为艺术',
    year: 1960,
    description: '将艺术家的行为和身体作为艺术作品的中心',
    artists: ['阿布拉莫维奇', '博伊斯', '伯登'],
    styleMovement: 'performance-art',
    influences: ['达达主义', '观念艺术'],
    influencedBy: ['观念艺术'],
    position: { x: 820, y: 220 },
    tags: ['行为艺术', '国际性', '20世纪后期']
  },
  {
    id: '18',
    title: '数字艺术',
    year: 1990,
    description: '使用数字技术创作或呈现的艺术形式',
    artists: ['科修', '艾肯', '穆拉卡米'],
    styleMovement: 'digital-art',
    influences: ['观念艺术', '录像艺术'],
    influencedBy: ['录像艺术'],
    position: { x: 1000, y: 280 },
    tags: ['数字艺术', '全球', '21世纪初']
  },
  {
    id: '19',
    title: '街头艺术',
    year: 1980,
    description: '在公共空间创作的视觉艺术，源自涂鸦文化',
    artists: ['班克斯', '谢巴德', '哈林'],
    styleMovement: 'street-art',
    influences: ['涂鸦', '波普艺术'],
    influencedBy: ['波普艺术'],
    position: { x: 980, y: 350 },
    tags: ['街头艺术', '全球', '20世纪末']
  },
  {
    id: '20',
    title: 'NFT艺术',
    year: 2017,
    description: '以非同质化代币形式存在的数字艺术作品',
    artists: ['比普尔', '帕克', '索菲'],
    styleMovement: 'nft-art',
    influences: ['数字艺术', '加密货币'],
    influencedBy: ['数字艺术'],
    position: { x: 1050, y: 320 },
    tags: ['NFT艺术', '全球', '21世纪']
  }
];

export const useTimelineStore = create<TimelineState>((set) => ({
  nodes: sampleNodes, // 使用示例数据
  connections: [
    { source: '1', target: '2', type: 'influence' },
    { source: '2', target: '3', type: 'influence' },
    { source: '1', target: '4', type: 'influence' },
    { source: '4', target: '5', type: 'influence' },
    { source: '5', target: '6', type: 'influence' },
    { source: '5', target: '7', type: 'influence' },
    { source: '6', target: '8', type: 'influence' },
    { source: '2', target: '9', type: 'influence' },
    { source: '3', target: '10', type: 'influence' },
    { source: '10', target: '11', type: 'influence' },
    { source: '10', target: '12', type: 'influence' },
    { source: '12', target: '13', type: 'influence' },
    { source: '6', target: '14', type: 'influence' },
    { source: '13', target: '15', type: 'influence' },
    { source: '13', target: '16', type: 'influence' },
    { source: '13', target: '17', type: 'influence' },
    { source: '16', target: '18', type: 'influence' },
    { source: '11', target: '19', type: 'influence' },
    { source: '18', target: '20', type: 'influence' }
  ],
  loading: false,
  error: null,
  
  // 加载节点数据
  fetchNodes: async () => {
    set({ loading: true, error: null });
    try {
      // 在实际应用中，这里会从API获取数据
      // 但现在我们直接使用示例数据
      // const nodes = await fetchTimelineNodes();
      setTimeout(() => {
        set({ nodes: sampleNodes, loading: false });
      }, 500); // 模拟加载延迟
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
  
  // 更新节点位置
  updateNodePosition: (id, position) => {
    set(state => ({
      nodes: state.nodes.map(node => 
        node.id === id ? { ...node, position } : node
      )
    }));
    // 在实际应用中，这里会将更新同步到服务器
    updateNode(id, { position }).catch(error => {
      console.error('更新节点位置失败:', error);
    });
  },
  
  // 添加新节点
  addNode: async (nodeData) => {
    set({ loading: true, error: null });
    try {
      // 在实际应用中，这里会调用API创建节点
      // const newNode = await createNode(nodeData);
      const newNode = {
        id: `${Date.now()}`,
        ...nodeData,
        artists: nodeData.artists || [],
        influences: nodeData.influences || [],
        influencedBy: nodeData.influencedBy || []
      } as TimelineNode;
      
      set(state => ({ 
        nodes: [...state.nodes, newNode],
        loading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },
  
  // 删除节点
  removeNode: async (id) => {
    set({ loading: true, error: null });
    try {
      // 在实际应用中，这里会调用API删除节点
      // await deleteNode(id);
      set(state => ({
        nodes: state.nodes.filter(node => node.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  }
})); 