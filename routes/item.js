import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

const router = express.Router();

// 유효성 검사 함수
const validateItemData = (data) => {
  const { code, name, ability, price } = data;
  if (!code || typeof code !== 'string') return false;
  if (!name || typeof name !== 'string') return false;
  if (!ability || typeof ability !== 'string') return false;
  if (typeof price !== 'number') return false;
  return true;
};

// [필수] 1. 아이템 생성
router.post('/item/create', async (req, res) => {
  const { code, name, ability, price } = req.body;

  if (!validateItemData(req.body)) {
    return res.status(400).json({ error: '잘못된 요청 데이터입니다.' });
  }

  try {
    const newItem = await prisma.item.create({
      data: {
        code,
        name,
        ability,
        price,
      },
    });
    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '아이템 생성에 실패했습니다.' });
  }
});

// [필수] 2. 아이템 목록 조회
router.get('/item/list', async (req, res) => {
  try {
    const items = await prisma.item.findMany();
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '아이템 목록 조회에 실패했습니다.' });
  }
});

// [필수] 3. 특정 아이템 조회
router.get('/item/:itemCode', async (req, res) => {
  const { itemCode } = req.params;

  try {
    const item = await prisma.item.findUnique({
      where: { code: itemCode },
    });
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: '아이템을 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '아이템 조회에 실패했습니다.' });
  }
});

// [필수] 4. 특정 아이템 수정
router.put('/item/update', async (req, res) => {
  const { code, name, ability, price } = req.body;

  if (!validateItemData(req.body)) {
    return res.status(400).json({ error: '잘못된 요청 데이터입니다.' });
  }

  try {
    const updatedItem = await prisma.item.update({
      where: { code },
      data: { name, ability, price },
    });
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '아이템 수정에 실패했습니다.' });
  }
});

export default router;
