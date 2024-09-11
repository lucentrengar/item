import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

const router = express.Router();

// [필수] 3. 캐릭터 생성
router.post('/character/create', async (req, res) => {
  const { name, level, userId } = req.body;

  try {
    const newCharacter = await prisma.character.create({
      data: {
        name,
        level,
        userId,  // 회원과 연결된 캐릭터라면 userId 필요
      },
    });
    res.status(201).json(newCharacter);
  } catch (error) {
    res.status(500).json({ error: '캐릭터 생성에 실패했습니다.' });
  }
});

// [필수] 4. 캐릭터 삭제
router.post('/character/delete', async (req, res) => {
  const { id } = req.body;

  try {
    await prisma.character.delete({
      where: { id },
    });
    res.status(200).json({ message: '캐릭터가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '캐릭터 삭제에 실패했습니다.' });
  }
});

// [필수] 5. 캐릭터 상세 조회
router.get('/character/detail', async (req, res) => {
  const { id } = req.query;

  try {
    const character = await prisma.character.findUnique({
      where: { id: parseInt(id) },  // id는 숫자일 가능성이 높으므로 파싱
    });
    if (character) {
      res.json(character);
    } else {
      res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }
  } catch (error) {
    res.status(500).json({ error: '캐릭터 조회에 실패했습니다.' });
  }
});

// 6-3. [도전] "회원"에 귀속된 캐릭터를 생성하기
router.post('/character/createfromuser', async (req, res) => {
  const { userId, name, level } = req.body;

  try {
    const newCharacter = await prisma.character.create({
      data: {
        name,
        level,
        userId,
      },
    });
    res.status(201).json(newCharacter);
  } catch (error) {
    res.status(500).json({ error: '회원에 귀속된 캐릭터 생성에 실패했습니다.' });
  }
});

// 6-4. [도전] "회원"에 귀속된 캐릭터를 삭제하기
router.post('/character/deletefromuser', async (req, res) => {
  const { userId, characterId } = req.body;

  try {
    const character = await prisma.character.findFirst({
      where: {
        id: characterId,
        userId,
      },
    });

    if (!character) {
      return res.status(404).json({ error: '해당 캐릭터를 찾을 수 없습니다.' });
    }

    await prisma.character.delete({
      where: { id: characterId },
    });

    res.status(200).json({ message: '회원의 캐릭터가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '회원의 캐릭터 삭제에 실패했습니다.' });
  }
});

export default router;
