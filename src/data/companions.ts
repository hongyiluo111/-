export interface Companion {
  id: string;
  name: string;
  game: string;
  rank: string;
  price: number;
  avatar: string;
  description: string;
}

// 数据已迁移到数据库，通过 /api/companions 获取
export const allCompanions: Companion[] = [];
