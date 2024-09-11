import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

const router = express.Router();

// 유효성 검사 함수
const validateCharacterData = (data) => {
  const { name, level, userId } = data;
  if (!name || typeof name !== 'string') return false;
  if (!level || typeof level !== 'number') return false;
  if (!userId || typeof userId !== 'number') return false;
  return true;
};

// 캐릭터 생성
router.post('/character/create', async (req, res) => {
  const { name, level, userId } = req.body;

  if (!validateCharacterData(req.body)) {
    return res.status(400).json({ error: '잘못된 요청 데이터입니다.' });
  }

  try {
    const newCharacter = await prisma.character.create({
      data: { name, level, userId },
    });
    res.status(201).json(newCharacter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '캐릭터 생성에 실패했습니다.' });
  }
});

// 캐릭터 삭제 (DELETE 메서드 사용)
router.delete('/character/delete', async (req, res) => {
  const { id } = req.body;

  try {
    await prisma.character.delete({ where: { id } });
    res.status(200).json({ message: '캐릭터가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '캐릭터 삭제에 실패했습니다.' });
  }
});

// 캐릭터 상세 조회
router.get('/character/detail', async (req, res) => {
  const { id } = req.query;

  try {
    const character = await prisma.character.findUnique({
      where: { id: parseInt(id) },
    });
    if (character) {
      res.json(character);
    } else {
      res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '캐릭터 조회에 실패했습니다.' });
  }
});

// 회원에 귀속된 캐릭터 생성
router.post('/character/createfromuser', async (req, res) => {
  const { userId, name, level } = req.body;

  if (!validateCharacterData(req.body)) {
    return res.status(400).json({ error: '잘못된 요청 데이터입니다.' });
  }

  try {
    const newCharacter = await prisma.character.create({
      data: { name, level, userId },
    });
    res.status(201).json(newCharacter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '회원에 귀속된 캐릭터 생성에 실패했습니다.' });
  }
});

// 회원에 귀속된 캐릭터 삭제
router.delete('/character/deletefromuser', async (req, res) => {
  const { userId, characterId } = req.body;

  try {
    const character = await prisma.character.findFirst({
      where: { id: characterId, userId },
    });

    if (!character) {
      return res.status(404).json({ error: '해당 캐릭터를 찾을 수 없습니다.' });
    }

    await prisma.character.delete({ where: { id: characterId } });
    res.status(200).json({ message: '회원의 캐릭터가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '회원의 캐릭터 삭제에 실패했습니다.' });
  }
});

export default router;
