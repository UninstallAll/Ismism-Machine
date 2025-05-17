import express from 'express';
import { getAllNodes, getNodeById, createNode, updateNode, deleteNode } from '../controllers/timelineController.js';

const router = express.Router();

// 获取所有节点
router.get('/', getAllNodes);

// 获取单个节点
router.get('/:id', getNodeById);

// 创建节点
router.post('/', createNode);

// 更新节点
router.put('/:id', updateNode);

// 删除节点
router.delete('/:id', deleteNode);

export default router; 