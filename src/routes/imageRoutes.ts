import express from 'express';
import { getImageById, getAllImages, saveImage } from '../api/imageApi';

const router = express.Router();

// 获取所有图片
router.get('/images', async (req, res) => {
  try {
    const images = await getAllImages();
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// 获取单个图片
router.get('/images/:id', async (req, res) => {
  try {
    const image = await getImageById(req.params.id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // 如果图片是二进制数据
    if (image.data && image.contentType) {
      res.contentType(image.contentType);
      res.send(image.data.buffer);
    }
    // 如果图片是Base64
    else if (image.base64Data) {
      res.json({ imageData: image.base64Data });
    }
    // 如果图片是URL
    else if (image.url) {
      res.json({ imageUrl: image.url });
    }
    else {
      res.status(400).json({ error: 'Invalid image format' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// 上传图片
router.post('/images', async (req, res) => {
  try {
    const imageData = req.body;
    const result = await saveImage(imageData);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save image' });
  }
});

export default router; 