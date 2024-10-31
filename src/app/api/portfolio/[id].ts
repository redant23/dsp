import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  try {
    if (req.method === 'GET') {
      // GET 요청 처리
      const response = await fetch(`/api/portfolio/${id}`);
      const data = await response.json();
      res.status(200).json(data);
    } else if (req.method === 'PUT') {
      // PUT 요청 처리
      const stockData = req.body;
      const response = await fetch(`/api/portfolio/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockData)
      });
      const data = await response.json();
      res.status(200).json(data);
    } else {
      res.status(405).json({ error: '허용되지 않는 메소드입니다' });
    }
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
}