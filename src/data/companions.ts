export interface Companion {
  id: string;
  name: string;
  game: string;
  rank: string;
  price: number;
  avatar: string;
  description: string;
}

export const allCompanions: Companion[] = [
  // 三角洲行动 (10个)
  { id: '1', name: '小王', game: '三角洲行动', rank: '专家', price: 70, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20tactical%2C%20esports%20profile&image_size=square', description: '战术专家，团队配合默契' },
  { id: '2', name: '阿杰', game: '三角洲行动', rank: '大师', price: 90, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20leader%2C%20esports%20profile&image_size=square', description: '指挥官级别，四排核心' },
  { id: '3', name: '小涛', game: '三角洲行动', rank: '精英', price: 55, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20stealth%2C%20esports%20profile&image_size=square', description: '爆破专家，意识出色' },
  { id: '4', name: '阿龙', game: '三角洲行动', rank: '三角洲巅峰', price: 150, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20champion%2C%20esports%20profile&image_size=square', description: '全服前100战队成员' },
  { id: '5', name: '小虎', game: '三角洲行动', rank: '高手', price: 60, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20aggressive%2C%20esports%20profile&image_size=square', description: '冲锋陷阵，近战王者' },
  { id: '6', name: '阿豪', game: '三角洲行动', rank: '老兵', price: 45, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20veteran%2C%20esports%20profile&image_size=square', description: '经验丰富，稳扎稳打' },
  { id: '7', name: '小宇', game: '三角洲行动', rank: '新兵', price: 35, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20rookie%2C%20esports%20profile&image_size=square', description: '新人陪玩，价格实惠' },
  { id: '8', name: '阿峰', game: '三角洲行动', rank: '专家', price: 75, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20sniper%2C%20esports%20profile&image_size=square', description: '狙击手定点清除，远程支援' },
  { id: '9', name: '小文', game: '三角洲行动', rank: '高手', price: 65, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20support%2C%20esports%20profile&image_size=square', description: '医疗兵，团队生存保障' },
  { id: '10', name: '阿超', game: '三角洲行动', rank: '大师', price: 100, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20pro%2C%20esports%20profile&image_size=square', description: '职业选手，退游前战队主力' },

  // 王者荣耀 (10个)
  { id: '11', name: '小红', game: '王者荣耀', rank: '王者', price: 80, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20friendly%2C%20esports%20profile&image_size=square', description: '全能选手，擅长法师和射手' },
  { id: '12', name: '小赵', game: '王者荣耀', rank: '星耀', price: 65, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20skilled%2C%20esports%20profile&image_size=square', description: '法师辅助都很强，声音好听' },
  { id: '13', name: '阿丽', game: '王者荣耀', rank: '王者', price: 90, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20adc%2C%20esports%20profile&image_size=square', description: '国服孙尚香，输出机器' },
  { id: '14', name: '小美', game: '王者荣耀', rank: '荣耀王者', price: 120, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20legend%2C%20esports%20profile&image_size=square', description: '巅峰赛2200分，职业退役' },
  { id: '15', name: '阿杰', game: '王者荣耀', rank: '钻石', price: 50, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20tank%2C%20esports%20profile&image_size=square', description: '肉盾开团，团战发动机' },
  { id: '16', name: '小杰', game: '王者荣耀', rank: '星耀', price: 70, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20mid%2C%20esports%20profile&image_size=square', description: '中单法王，草丛伦专家' },
  { id: '17', name: '阿伟', game: '王者荣耀', rank: '王者', price: 85, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20jungle%2C%20esports%20profile&image_size=square', description: '打野节奏大师，带飞全场' },
  { id: '18', name: '小浩', game: '王者荣耀', rank: '铂金', price: 40, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20support%2C%20esports%20profile&image_size=square', description: '辅助上分，队友保护伞' },
  { id: '19', name: '阿萱', game: '王者荣耀', rank: '星耀', price: 68, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20mage%2C%20esports%20profile&image_size=square', description: '女法师，技能准意识好' },
  { id: '20', name: '小强', game: '王者荣耀', rank: '王者', price: 95, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20top%2C%20esports%20profile&image_size=square', description: '边路霸主，芈月绝活哥' },

  // 英雄联盟 (10个)
  { id: '21', name: '小明', game: '英雄联盟', rank: '钻石', price: 50, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20friendly%2C%20esports%20profile&image_size=square', description: '擅长打野位置，意识好，节奏强' },
  { id: '22', name: '小刘', game: '英雄联盟', rank: '大师', price: 120, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20elite%2C%20esports%20profile&image_size=square', description: '峡谷之巅顶级选手' },
  { id: '23', name: '阿杰', game: '英雄联盟', rank: '钻石', price: 60, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20adc%2C%20esports%20profile&image_size=square', description: '下路对线王，团战输出爆表' },
  { id: '24', name: '小北', game: '英雄联盟', rank: '铂金', price: 45, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20support%2C%20esports%20profile&image_size=square', description: '辅助型陪玩，保护意识强' },
  { id: '25', name: '阿豪', game: '英雄联盟', rank: '超凡大师', price: 130, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20grandmaster%2C%20esports%20profile&image_size=square', description: '韩服大师，英雄海' },
  { id: '26', name: '小凯', game: '英雄联盟', rank: '钻石', price: 55, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20top%2C%20esports%20profile&image_size=square', description: '上单抗压王，团队前排' },
  { id: '27', name: '阿乐', game: '英雄联盟', rank: '王者', price: 150, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20challenger%2C%20esports%20profile&image_size=square', description: '峡谷之巅百名王者' },
  { id: '28', name: '小森', game: '英雄联盟', rank: '铂金', price: 42, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20mid%2C%20esports%20profile&image_size=square', description: '中单刺客，操作细腻' },
  { id: '29', name: '阿炜', game: '英雄联盟', rank: '钻石', price: 65, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20jungle%2C%20esports%20profile&image_size=square', description: '打野入侵型，反野专家' },
  { id: '30', name: '小波', game: '英雄联盟', rank: '黄金', price: 35, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20fun%2C%20esports%20profile&image_size=square', description: '娱乐陪玩，开心最重要' },

  // 英雄联盟手游 (10个)
  { id: '31', name: '小琳', game: '英雄联盟手游', rank: '钻石', price: 55, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20mobile%2C%20esports%20profile&image_size=square', description: '手游ADC女王，走位风骚' },
  { id: '32', name: '阿浩', game: '英雄联盟手游', rank: '大师', price: 100, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20mobilepro%2C%20esports%20profile&image_size=square', description: '手游职业退役选手' },
  { id: '33', name: '小琪', game: '英雄联盟手游', rank: '铂金', price: 45, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20sup%2C%20esports%20profile&image_size=square', description: '辅助玩家，队友最爱的类型' },
  { id: '34', name: '阿坤', game: '英雄联盟手游', rank: '钻石', price: 60, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20jg%2C%20esports%20profile&image_size=square', description: '打野带节奏，carry全场' },
  { id: '35', name: '小颖', game: '英雄联盟手游', rank: '黄金', price: 38, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20mage%2C%20esports%20profile&image_size=square', description: '法师玩得好，技能预判准' },
  { id: '36', name: '阿华', game: '英雄联盟手游', rank: '宗师', price: 110, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20master%2C%20esports%20profile&image_size=square', description: '手游顶端玩家' },
  { id: '37', name: '小璐', game: '英雄联盟手游', rank: '铂金', price: 48, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20top%2C%20esports%20profile&image_size=square', description: '上单女战士，操作细腻' },
  { id: '38', name: '阿睿', game: '英雄联盟手游', rank: '王者', price: 130, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20mobileking%2C%20esports%20profile&image_size=square', description: '国服榜前50' },
  { id: '39', name: '小雪', game: '英雄联盟手游', rank: '翡翠', price: 50, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20mid%2C%20esports%20profile&image_size=square', description: '中单实力派，意识好' },
  { id: '40', name: '阿磊', game: '英雄联盟手游', rank: '钻石', price: 58, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20solo%2C%20esports%20profile&image_size=square', description: '单排王者，个人能力突出' },

  // 和平精英 (10个)
  { id: '41', name: '小李', game: '和平精英', rank: '王牌', price: 60, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20cool%2C%20esports%20profile&image_size=square', description: '枪法精准，战术意识强' },
  { id: '42', name: '小陈', game: '和平精英', rank: '战神', price: 150, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20champion%2C%20esports%20profile&image_size=square', description: '四排指挥，全能型选手' },
  { id: '43', name: '阿兵', game: '和平精英', rank: '超级王牌', price: 75, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20ace%2C%20esports%20profile&image_size=square', description: '刚枪王贴脸战斗最强' },
  { id: '44', name: '小安', game: '和平精英', rank: '荣耀皇冠', price: 85, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20sniper%2C%20esports%20profile&image_size=square', description: '狙击手，一枪一个' },
  { id: '45', name: '阿志', game: '和平精英', rank: '无敌战神', price: 180, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20god%2C%20esports%20profile&image_size=square', description: '全服无敌战神，职业水准' },
  { id: '46', name: '小艾', game: '和平精英', rank: '铂金', price: 45, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20support%2C%20esports%20profile&image_size=square', description: '医疗兵，队友存活率高' },
  { id: '47', name: '阿杨', game: '和平精英', rank: '王牌', price: 70, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20driver%2C%20esports%20profile&image_size=square', description: '司机担当，圈边运营强' },
  { id: '48', name: '小婷', game: '和平精英', rank: '钻石', price: 55, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20_ENTRY%2C%20esports%20profile&image_size=square', description: '自由人，灵活走位' },
  { id: '49', name: '阿雷', game: '和平精英', rank: '不朽星钻', price: 65, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20rush%2C%20esports%20profile&image_size=square', description: 'roll点王，贴脸不虚' },
  { id: '50', name: '小曼', game: '和平精英', rank: '超级王牌', price: 80, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20strategic%2C%20esports%20profile&image_size=square', description: '指挥兼狙击，意识超群' },

  // 无畏契约 (10个)
  { id: '51', name: '小M', game: '无畏契约', rank: '钻石', price: 70, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20val%2C%20esports%20profile&image_size=square', description: '捷风绝活哥，击杀机器' },
  { id: '52', name: '阿Jet', game: '无畏契约', rank: '超凡', price: 110, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20immortal%2C%20esports%20profile&image_size=square', description: '亚服超凡大师' },
  { id: '53', name: '小Sage', game: '无畏契约', rank: '铂金', price: 55, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20support%2C%20esports%20profile&image_size=square', description: '最好用的奶妈，队友存活保障' },
  { id: '54', name: '阿Reyna', game: '无畏契约', rank: '钻石', price: 85, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20duelist%2C%20esports%20profile&image_size=square', description: '刷子大拿，收割能力强' },
  { id: '55', name: '小Omen', game: '无畏契约', rank: '神话', price: 140, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20radiant%2C%20esports%20profile&image_size=square', description: '全球前500神话玩家' },
  { id: '56', name: '阿C', game: '无畏契约', rank: '铂金', price: 50, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20controller%2C%20esports%20profile&image_size=square', description: '烟子控场，战术大师' },
  { id: '57', name: '小Viper', game: '无畏契约', rank: '钻石', price: 75, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20sentinel%2C%20esports%20profile&image_size=square', description: '毒蛇使用者，防守专家' },
  { id: '58', name: '阿K', game: '无畏契约', rank: '黄金', price: 40, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20initiator%2C%20esports%20profile&image_size=square', description: '信息收集者，团队大脑' },
  { id: '59', name: '小Jett', game: '无畏契约', rank: '超凡', price: 100, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20flanker%2C%20esports%20profile&image_size=square', description: '飘逸打法，秀翻全场' },
  { id: '60', name: '阿Sova', game: '无畏契约', rank: '铂金', price: 52, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20scout%2C%20esports%20profile&image_size=square', description: '侦查专家，情报大师' },

  // 金铲铲之战 (10个)
  { id: '61', name: '小铲', game: '金铲铲之战', rank: '钻石', price: 55, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20auto%2C%20esports%20profile&image_size=square', description: '金铲铲高手，阵容理解深' },
  { id: '62', name: '阿帝', game: '金铲铲之战', rank: '大师', price: 90, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20tftmaster%2C%20esports%20profile&image_size=square', description: '双城之争赛季王者' },
  { id: '63', name: '小妮', game: '金铲铲之战', rank: '铂金', price: 42, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20tactician%2C%20esports%20profile&image_size=square', description: '女性选手，运营细腻' },
  { id: '64', name: '阿凯', game: '金铲铲之战', rank: '翡翠', price: 48, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20emerald%2C%20esports%20profile&image_size=square', description: '赌狗流爱好者，神仙打架' },
  { id: '65', name: '小棋', game: '金铲铲之战', rank: '钻石', price: 58, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20chess%2C%20esports%20profile&image_size=square', description: '运营型选手，经济掌控' },
  { id: '66', name: '阿阵', game: '金铲铲之战', rank: '宗师', price: 100, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20grandmaster%2C%20esports%20profile&image_size=square', description: '阵容搭配专家' },
  { id: '67', name: '小运', game: '金铲铲之战', rank: '黄金', price: 38, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20lucky%2C%20esports%20profile&image_size=square', description: '运气型玩家，天选之人' },
  { id: '68', name: '阿略', game: '金铲铲之战', rank: '大师', price: 85, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20strategy%2C%20esports%20profile&image_size=square', description: '策略大师，灵活应变' },
  { id: '69', name: '小合', game: '金铲铲之战', rank: '铂金', price: 45, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20synergy%2C%20esports%20profile&image_size=square', description: '羁绊搭配专家' },
  { id: '70', name: '阿装', game: '金铲铲之战', rank: '钻石', price: 60, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20items%2C%20esports%20profile&image_size=square', description: '装备分配大师' },

  // 穿越火线 (10个)
  { id: '71', name: '小CF', game: '穿越火线', rank: '枪王', price: 80, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20cf%2C%20esports%20profile&image_size=square', description: '十年老玩家，枪王段位' },
  { id: '72', name: '阿炮', game: '穿越火线', rank: '枪王之王', price: 120, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20god%2C%20esports%20profile&image_size=square', description: '枪王之王，击杀播报不断' },
  { id: '73', name: '小G', game: '穿越火线', rank: '精英', price: 55, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20elite%2C%20esports%20profile&image_size=square', description: 'AK47霸主，近中距离无敌' },
  { id: '74', name: '阿狙', game: '穿越火线', rank: '大师', price: 85, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20sniper%2C%20esports%20profile&image_size=square', description: '狙击手，一击必杀' },
  { id: '75', name: '小刀', game: '穿越火线', rank: '专家', price: 65, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20expert%2C%20esports%20profile&image_size=square', description: '刀战专家，幽灵模式大神' },
  { id: '76', name: '阿雷', game: '穿越火线', rank: '新锐', price: 35, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20rookie%2C%20esports%20profile&image_size=square', description: '新手陪练，价格实惠' },
  { id: '77', name: '小散', game: '穿越火线', rank: '枪王', price: 90, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20shotgun%2C%20esports%20profile&image_size=square', description: '散弹枪之王，近身战斗' },
  { id: '78', name: '阿宾', game: '穿越火线', rank: '宗师', price: 100, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20master%2C%20esports%20profile&image_size=square', description: '全面型选手，团队核心' },
  { id: '79', name: '小Y', game: '穿越火线', rank: '枪王之王', price: 140, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20legend%2C%20esports%20profile&image_size=square', description: '穿越火线职业退役' },
  { id: '80', name: '阿轩', game: '穿越火线', rank: '精英', price: 58, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20fusion%2C%20esports%20profile&image_size=square', description: '步枪精准，点射大师' },

  // 第五人格 (10个)
  { id: '81', name: '小五', game: '第五人格', rank: '六阶', price: 70, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20detective%2C%20esports%20profile&image_size=square', description: '溜鬼达人，屠夫克星' },
  { id: '82', name: '阿梦', game: '第五人格', rank: '巅峰七阶', price: 110, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20master%2C%20esports%20profile&image_size=square', description: '巅峰七阶选手' },
  { id: '83', name: '小猪', game: '第五人格', rank: '五阶', price: 60, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20survivor%2C%20esports%20profile&image_size=square', description: '修机位，电机速度最快' },
  { id: '84', name: '阿空', game: '第五人格', rank: '四阶', price: 45, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20rescuer%2C%20esports%20profile&image_size=square', description: '救人位，意识好' },
  { id: '85', name: '小瞳', game: '第五人格', rank: '六阶', price: 75, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20hunter%2C%20esports%20profile&image_size=square', description: '屠夫玩家，殿堂级' },
  { id: '86', name: '阿雾', game: '第五人格', rank: '三阶', price: 38, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20beginner%2C%20esports%20profile&image_size=square', description: '新手陪玩，教学讲解' },
  { id: '87', name: '小焰', game: '第五人格', rank: '五阶', price: 62, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20speed%2C%20esports%20profile&image_size=square', description: '板区女王，溜鬼技术流' },
  { id: '88', name: '阿魂', game: '第五人格', rank: '六阶', price: 78, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20veteran%2C%20esports%20profile&image_size=square', description: '人屠双皇型玩家' },
  { id: '89', name: '小眠', game: '第五人格', rank: '二阶', price: 35, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20soft%2C%20esports%20profile&image_size=square', description: '佛系陪玩，开心游戏' },
  { id: '90', name: '阿夜', game: '第五人格', rank: '巅峰七阶', price: 130, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20top%2C%20esports%20profile&image_size=square', description: '第五人格前百玩家' },

  // 蛋仔派对 (10个)
  { id: '91', name: '小蛋', game: '蛋仔派对', rank: '恐龙蛋', price: 45, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20egg%2C%20esports%20profile&image_size=square', description: '闯关达人，关关必过' },
  { id: '92', name: '阿萌', game: '蛋仔派对', rank: '凤凰蛋', price: 80, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20phoenix%2C%20esports%20profile&image_size=square', description: '凤凰蛋选手，技术流' },
  { id: '93', name: '小派', game: '蛋仔派对', rank: '鹅蛋', price: 38, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20goose%2C%20esports%20profile&image_size=square', description: '休闲陪玩，享受游戏' },
  { id: '94', name: '阿滑', game: '蛋仔派对', rank: '恐龙蛋', price: 50, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20sliding%2C%20esports%20profile&image_size=square', description: '滑滚技巧，谁都追不上' },
  { id: '95', name: '小可爱', game: '蛋仔派对', rank: '鸡蛋', price: 35, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20chick%2C%20esports%20profile&image_size=square', description: '新手向陪玩，价格实惠' },
  { id: '96', name: '阿酷', game: '蛋仔派对', rank: '凤凰蛋', price: 85, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20cool%2C%20esports%20profile&image_size=square', description: '无敌凤凰蛋操作怪' },
  { id: '97', name: '小乖', game: '蛋仔派对', rank: '恐龙蛋', price: 55, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20dinosaur%2C%20esports%20profile&image_size=square', description: '乖乖女，闯关稳健' },
  { id: '98', name: '阿贪', game: '蛋仔派对', rank: '无敌凤凰蛋', price: 100, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20ultimate%2C%20esports%20profile&image_size=square', description: '全蛋种制霸，蛋仔巅峰' },
  { id: '99', name: '小鹌', game: '蛋仔派对', rank: '鹌鹑蛋', price: 30, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20quail%2C%20esports%20profile&image_size=square', description: '最低门槛陪玩体验' },
  { id: '100', name: '阿宝', game: '蛋仔派对', rank: '凤凰蛋', price: 78, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20female%20gamer%20avatar%2C%20baby%2C%20esports%20profile&image_size=square', description: '可爱型陪玩，声音甜美' },

  // 暗区突围 (10个)
  { id: '101', name: '小突', game: '暗区突围', rank: '精英', price: 65, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20infiltrator%2C%20esports%20profile&image_size=square', description: '撤离大师，生存专家' },
  { id: '102', name: '阿区', game: '暗区突围', rank: '暗区传说', price: 120, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20legend%2C%20esports%20profile&image_size=square', description: '暗区传说，全服前50' },
  { id: '103', name: '小包', game: '暗区突围', rank: '专家', price: 75, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20looter%2C%20esports%20profile&image_size=square', description: '舔包狂人，物资管理' },
  { id: '104', name: '阿战', game: '暗区突围', rank: '大师', price: 95, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20combat%2C%20esports%20profile&image_size=square', description: '战斗型玩家，枪法精准' },
  { id: '105', name: '小斥', game: '暗区突围', rank: '斥候', price: 45, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20scout%2C%20esports%20profile&image_size=square', description: '新手入门陪玩' },
  { id: '106', name: '阿肥', game: '暗区突围', rank: '精英', price: 70, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20rich%2C%20esports%20profile&image_size=square', description: '金主型陪玩，慷慨大方' },
  { id: '107', name: '小新', game: '暗区突围', rank: '新锐', price: 38, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20newbie%2C%20esports%20profile&image_size=square', description: '新锐陪玩，价格实惠' },
  { id: '108', name: '阿博', game: '暗区突围', rank: '专家', price: 78, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20boss%2C%20esports%20profile&image_size=square', description: 'boss房常客，收获丰富' },
  { id: '109', name: '小药', game: '暗区突围', rank: '大师', price: 88, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20medical%2C%20esports%20profile&image_size=square', description: '医疗专家，战场救援' },
  { id: '110', name: '阿真', game: '暗区突围', rank: '暗区传说', price: 140, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20topdog%2C%20esports%20profile&image_size=square', description: '全服传说级别玩家' },

  // CS2 (10个)
  { id: '111', name: '小张', game: 'CS2', rank: 'S', price: 100, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20professional%2C%20esports%20profile&image_size=square', description: '职业选手，擅长AWP' },
  { id: '112', name: '阿S', game: 'CS2', rank: 'SS', price: 130, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20ss%2C%20esports%20profile&image_size=square', description: '双SS选手，全能型' },
  { id: '113', name: '小A', game: 'CS2', rank: 'A', price: 75, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20a%2C%20esports%20profile&image_size=square', description: 'AK大神，点头枪法' },
  { id: '114', name: '阿K', game: 'CS2', rank: 'S', price: 95, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20awper%2C%20esports%20profile&image_size=square', description: '大狙精准，一击必杀' },
  { id: '115', name: '小B', game: 'CS2', rank: 'B', price: 50, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20b%2C%20esports%20profile&image_size=square', description: '稳健型玩家，团队配合' },
  { id: '116', name: '阿D', game: 'CS2', rank: 'D', price: 35, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20d%2C%20esports%20profile&image_size=square', description: '新手陪练，价格实惠' },
  { id: '117', name: '小C', game: 'CS2', rank: 'C', price: 42, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20c%2C%20esports%20profile&image_size=square', description: 'CT方专家，防守坚固' },
  { id: '118', name: '阿W', game: 'CS2', rank: 'SSS', price: 180, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20sss%2C%20esports%20profile&image_size=square', description: '全球顶级，职业水准' },
  { id: '119', name: '小T', game: 'CS2', rank: 'A', price: 80, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20t%2C%20esports%20profile&image_size=square', description: 'T方进攻核心，战术大师' },
  { id: '120', name: '阿E', game: 'CS2', rank: 'S', price: 105, avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20male%20gamer%20avatar%2C%20entry%2C%20esports%20profile&image_size=square', description: '突破手，进攻先行者' },
];
