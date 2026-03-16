import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { getDataSource } from '@/lib/datasource';
import { GameResult } from '@/lib/entities/GameResult';

export async function GET() {
  try {
    const ds = await getDataSource();
    const repo = ds.getRepository(GameResult);
    const results = await repo.find();

    const xWins = results.filter((r) => r.winner === 'X').length;
    const oWins = results.filter((r) => r.winner === 'O').length;
    const draws = results.filter((r) => r.winner === 'Draw').length;

    return NextResponse.json({ xWins, oWins, draws });
  } catch (error) {
    console.error('GET /api/scores error:', error);
    return NextResponse.json({ xWins: 0, oWins: 0, draws: 0 }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { winner } = body as { winner: string };

    if (!winner || !['X', 'O', 'Draw'].includes(winner)) {
      return NextResponse.json({ error: 'Invalid winner value' }, { status: 400 });
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(GameResult);

    const gameResult = repo.create({ winner });
    await repo.save(gameResult);

    const results = await repo.find();
    const xWins = results.filter((r) => r.winner === 'X').length;
    const oWins = results.filter((r) => r.winner === 'O').length;
    const draws = results.filter((r) => r.winner === 'Draw').length;

    return NextResponse.json({ xWins, oWins, draws });
  } catch (error) {
    console.error('POST /api/scores error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
