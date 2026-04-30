import Link from 'next/link';
import Image from 'next/image';

export default function GameList() {
  const games = [
    {
      id: 1,
      name: '三角洲行动',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Delta%20Force%20logo%2C%20esports%2C%20gaming&image_size=square',
      companions: 156
    },
    {
      id: 2,
      name: '王者荣耀',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Honor%20of%20Kings%20logo%2C%20esports%2C%20gaming&image_size=square',
      companions: 128
    },
    {
      id: 3,
      name: '英雄联盟',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=League%20of%20Legends%20logo%2C%20esports%2C%20gaming&image_size=square',
      companions: 112
    },
    {
      id: 4,
      name: '和平精英',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Peace%20Elite%20logo%2C%20esports%2C%20gaming&image_size=square',
      companions: 98
    },
    {
      id: 5,
      name: 'CS2',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CS2%20logo%2C%20Counter-Strike%202%2C%20esports%2C%20gaming&image_size=square',
      companions: 85
    },
    {
      id: 6,
      name: 'VALORANT',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=VALORANT%20logo%2C%20esports%2C%20gaming&image_size=square',
      companions: 76
    },
    {
      id: 7,
      name: '穿越火线',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=CrossFire%20logo%2C%20esports%2C%20gaming&image_size=square',
      companions: 64
    },
    {
      id: 8,
      name: '金铲铲之战',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Teamfight%20Tactics%20logo%2C%20esports%2C%20gaming&image_size=square',
      companions: 52
    }
  ];

  return (
    <div className="mb-20 py-12">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">热门游戏</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            选择你喜欢的游戏，找到专业的陪玩伙伴
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <Link
              key={game.id}
              href={`/find-companion?game=${game.name}`}
              className="card group overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-[1.03]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-square overflow-hidden rounded-lg mb-4 relative">
                <Image
                  src={game.image}
                  alt={game.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 text-white">
                    <span className="bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {game.companions} 位陪玩
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{game.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-sm">{game.companions} 位陪玩</p>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}