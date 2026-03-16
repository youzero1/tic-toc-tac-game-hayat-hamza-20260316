import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { GameResult } from './entities/GameResult';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || './database.sqlite';

let dataSource: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }

  // For sqljs, we need to load the database from file if it exists
  let database: Uint8Array | undefined = undefined;
  const resolvedDbPath = path.resolve(dbPath);

  try {
    if (fs.existsSync(resolvedDbPath)) {
      const buffer = fs.readFileSync(resolvedDbPath);
      database = new Uint8Array(buffer);
    }
  } catch {
    // ignore, will create new db
  }

  const ds = new DataSource({
    type: 'sqljs',
    database: database,
    entities: [GameResult],
    synchronize: true,
    autoSave: true,
    location: resolvedDbPath,
    logging: false,
  });

  await ds.initialize();
  dataSource = ds;
  return dataSource;
}
