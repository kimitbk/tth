export type ThemeId = "space" | "dino" | "knight" | "ocean" | "princess";
export type RoomId = "characters" | "gear" | "pets" | "base";

export const ROOM_IDS: RoomId[] = ["characters", "gear", "pets", "base"];

export type Rarity = "Thường" | "Hiếm" | "Sử thi" | "Huyền thoại";

export interface Item {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  rarity: Rarity;
}

export interface Room {
  title: string; // panel title inside the room
  label: string; // short label on the hub card
  icon: string; // emoji on the hub card
  items: Item[];
}

export interface Theme {
  id: ThemeId;
  name: string; // shown in the theme picker
  emoji: string;
  title: (kid: string) => string;
  tagline: string;
  enterLabel: string;
  homeLabel: string; // back-to-hub button
  greeting: string; // uses {currency}
  currency: { name: string; emoji: string };
  decorations: string[];
  rooms: Record<RoomId, Room>;
}

// Costs and rarity follow the same curve in every room of every theme.
const COSTS = [0, 4, 7, 10, 15, 22];
const RARITY: Rarity[] = ["Thường", "Thường", "Hiếm", "Hiếm", "Sử thi", "Huyền thoại"];

function items(list: [string, string][]): Item[] {
  return list.map(([emoji, name], i) => ({
    id: `i${i}`,
    emoji,
    name,
    cost: COSTS[i] ?? 30,
    rarity: RARITY[i] ?? "Huyền thoại",
  }));
}

export const THEMES: Record<ThemeId, Theme> = {
  space: {
    id: "space",
    name: "Phi hành gia vũ trụ",
    emoji: "🚀",
    title: (k) => `${k}'s Space Adventure`,
    tagline: "Học để nạp nhiên liệu • Bay để khám phá • Sưu tầm để thành phi hành gia",
    enterLabel: "🚀 Khởi động tên lửa",
    homeLabel: "🛰️ Trạm chính",
    greeting: "Chào phi hành gia nhí! Giải câu đố để nhận {currency} và mở khóa trang bị vũ trụ nhé!",
    currency: { name: "ngôi sao", emoji: "⭐" },
    decorations: ["⭐", "✨", "🪐", "☄️", "🌙", "💫"],
    rooms: {
      characters: {
        title: "Phòng nhân vật",
        label: "Nhân vật",
        icon: "🧑‍🚀",
        items: items([
          ["🧑‍🚀", "Phi hành gia"],
          ["🤖", "Rô-bốt thám hiểm"],
          ["👽", "Bạn ngoài hành tinh"],
          ["👾", "Quái vật pixel"],
          ["🦸‍♂️", "Siêu nhân vũ trụ"],
          ["🥷", "Ninja bóng đêm"],
        ]),
      },
      gear: {
        title: "Kho trang bị",
        label: "Trang bị",
        icon: "🔭",
        items: items([
          ["🔦", "Đèn pin"],
          ["🔭", "Kính thiên văn"],
          ["📡", "Ăng-ten liên lạc"],
          ["🧲", "Nam châm siêu cấp"],
          ["🛰️", "Vệ tinh riêng"],
          ["☄️", "Sao chổi thần tốc"],
        ]),
      },
      pets: {
        title: "Bạn đồng hành",
        label: "Bạn đồng hành",
        icon: "🐶",
        items: items([
          ["🐶", "Cún phi hành"],
          ["🐵", "Khỉ thám hiểm"],
          ["🦉", "Cú đêm"],
          ["🐙", "Bạch tuộc sao Hỏa"],
          ["🦄", "Kỳ lân thiên hà"],
          ["🐉", "Rồng ngân hà"],
        ]),
      },
      base: {
        title: "Căn cứ vũ trụ",
        label: "Căn cứ",
        icon: "🪐",
        items: items([
          ["🚀", "Tên lửa"],
          ["🛸", "Đĩa bay"],
          ["🌙", "Trạm Mặt Trăng"],
          ["🪐", "Hành tinh vành đai"],
          ["☀️", "Trạm Mặt Trời"],
          ["🌌", "Dải Ngân Hà"],
        ]),
      },
    },
  },

  dino: {
    id: "dino",
    name: "Thung lũng khủng long",
    emoji: "🦖",
    title: (k) => `${k}'s Dino Valley`,
    tagline: "Học để tìm trứng • Đào để khám phá • Sưu tầm để thành nhà thám hiểm",
    enterLabel: "🦖 Vào thung lũng",
    homeLabel: "⛺ Trại chính",
    greeting: "Chào nhà thám hiểm nhí! Giải câu đố để nhặt {currency} và mở khóa đồ đi rừng nhé!",
    currency: { name: "trứng khủng long", emoji: "🥚" },
    decorations: ["🌿", "🍃", "🦴", "🥚", "🌴", "🍂"],
    rooms: {
      characters: {
        title: "Phòng nhân vật",
        label: "Nhân vật",
        icon: "🤠",
        items: items([
          ["🤠", "Nhà thám hiểm"],
          ["🧑‍🔬", "Nhà khoa học"],
          ["🦕", "Khủng long cổ dài"],
          ["🦖", "T-Rex nhí"],
          ["🐊", "Cá sấu cổ đại"],
          ["🐲", "Rồng tiền sử"],
        ]),
      },
      gear: {
        title: "Ba lô thám hiểm",
        label: "Đồ nghề",
        icon: "🧭",
        items: items([
          ["🔍", "Kính lúp"],
          ["🧭", "La bàn"],
          ["🗺️", "Bản đồ cổ"],
          ["⛏️", "Cuốc đào"],
          ["🦴", "Xương hóa thạch"],
          ["💎", "Hổ phách quý"],
        ]),
      },
      pets: {
        title: "Bạn đồng hành",
        label: "Bạn đồng hành",
        icon: "🐣",
        items: items([
          ["🐣", "Khủng long con"],
          ["🐸", "Ếch rừng"],
          ["🐢", "Rùa cổ"],
          ["🦎", "Thằn lằn"],
          ["🦜", "Vẹt nhiệt đới"],
          ["🦕", "Bé cổ dài"],
        ]),
      },
      base: {
        title: "Khu cắm trại",
        label: "Khu trại",
        icon: "🏕️",
        items: items([
          ["⛺", "Lều trại"],
          ["🏕️", "Trại bên suối"],
          ["🌴", "Rừng nhiệt đới"],
          ["🏞️", "Thung lũng xanh"],
          ["🏝️", "Đảo hoang"],
          ["🌋", "Núi lửa"],
        ]),
      },
    },
  },

  knight: {
    id: "knight",
    name: "Hiệp sĩ & rồng",
    emoji: "🐉",
    title: (k) => `${k}'s Dragon Kingdom`,
    tagline: "Học để thêm sức mạnh • Chiến đấu để khám phá • Sưu tầm để thành hiệp sĩ",
    enterLabel: "⚔️ Mở cổng thành",
    homeLabel: "🏰 Thành trì",
    greeting: "Chào hiệp sĩ nhí! Giải câu đố để nhận {currency} và mở khóa vũ khí huyền thoại nhé!",
    currency: { name: "xu vàng", emoji: "🪙" },
    decorations: ["✨", "🛡️", "⚔️", "🔥", "⭐", "🪙"],
    rooms: {
      characters: {
        title: "Phòng nhân vật",
        label: "Nhân vật",
        icon: "🤴",
        items: items([
          ["🤴", "Hoàng tử"],
          ["🧙‍♂️", "Pháp sư"],
          ["🥷", "Ninja"],
          ["🧝‍♂️", "Tiên rừng"],
          ["🦸‍♂️", "Siêu anh hùng"],
          ["🧞‍♂️", "Thần đèn"],
        ]),
      },
      gear: {
        title: "Kho vũ khí",
        label: "Vũ khí",
        icon: "🛡️",
        items: items([
          ["🗡️", "Kiếm gỗ"],
          ["🛡️", "Khiên sắt"],
          ["🏹", "Cung tên"],
          ["🪄", "Gậy phép"],
          ["🔮", "Quả cầu pha lê"],
          ["👑", "Vương miện vua"],
        ]),
      },
      pets: {
        title: "Chuồng thú cưỡi",
        label: "Thú cưỡi",
        icon: "🐴",
        items: items([
          ["🐴", "Ngựa chiến"],
          ["🦅", "Đại bàng"],
          ["🐺", "Sói xám"],
          ["🦁", "Sư tử vàng"],
          ["🦄", "Kỳ lân"],
          ["🐉", "Rồng lửa"],
        ]),
      },
      base: {
        title: "Lãnh địa",
        label: "Lãnh địa",
        icon: "🏰",
        items: items([
          ["🛖", "Lều gỗ"],
          ["🏠", "Nhà làng"],
          ["🏯", "Pháo đài"],
          ["🏰", "Lâu đài"],
          ["⛰️", "Núi rồng"],
          ["🌋", "Hang rồng lửa"],
        ]),
      },
    },
  },

  ocean: {
    id: "ocean",
    name: "Thuyền trưởng đại dương",
    emoji: "⚓",
    title: (k) => `${k}'s Ocean Quest`,
    tagline: "Học để căng buồm • Lặn để khám phá • Sưu tầm để thành thuyền trưởng",
    enterLabel: "⚓ Nhổ neo ra khơi",
    homeLabel: "⛵ Bến cảng",
    greeting: "Chào thuyền trưởng nhí! Giải câu đố để nhặt {currency} và mở khóa kho báu nhé!",
    currency: { name: "vỏ sò", emoji: "🐚" },
    decorations: ["🫧", "🐚", "🌊", "🐠", "⭐", "🫧"],
    rooms: {
      characters: {
        title: "Phòng nhân vật",
        label: "Nhân vật",
        icon: "🧑‍✈️",
        items: items([
          ["🧑‍✈️", "Thuyền trưởng"],
          ["🏄‍♂️", "Cậu bé lướt sóng"],
          ["🤿", "Thợ lặn"],
          ["🧜‍♂️", "Người cá"],
          ["🦈", "Cá mập"],
          ["🐋", "Cá voi xanh"],
        ]),
      },
      gear: {
        title: "Khoang dụng cụ",
        label: "Dụng cụ",
        icon: "🧭",
        items: items([
          ["🧭", "La bàn"],
          ["🔭", "Ống nhòm"],
          ["🗺️", "Bản đồ kho báu"],
          ["⚓", "Mỏ neo"],
          ["🔱", "Đinh ba thần biển"],
          ["💰", "Rương vàng"],
        ]),
      },
      pets: {
        title: "Bạn đồng hành",
        label: "Bạn đồng hành",
        icon: "🐬",
        items: items([
          ["🦀", "Cua đỏ"],
          ["🦜", "Vẹt thuyền trưởng"],
          ["🐢", "Rùa biển"],
          ["🐙", "Bạch tuộc"],
          ["🐬", "Cá heo"],
          ["🐳", "Cá voi"],
        ]),
      },
      base: {
        title: "Đội tàu",
        label: "Tàu thuyền",
        icon: "⛵",
        items: items([
          ["🛶", "Xuồng nhỏ"],
          ["⛵", "Thuyền buồm"],
          ["🚢", "Tàu lớn"],
          ["🏝️", "Đảo kho báu"],
          ["🪸", "Rạn san hô"],
          ["🌊", "Cung điện dưới biển"],
        ]),
      },
    },
  },

  princess: {
    id: "princess",
    name: "Công chúa phép thuật",
    emoji: "👑",
    title: (k) => `${k}'s Magical Princess World`,
    tagline: "Học để mở khóa • Chơi để khám phá • Mặc đẹp để sáng tạo",
    enterLabel: "✨ Mở cổng lâu đài ✨",
    homeLabel: "🏰 Lâu đài",
    greeting: "Chào bé! Hãy giải câu đố để nhận {currency} và mở khóa váy áo xinh đẹp nhé!",
    currency: { name: "ngọc ruby", emoji: "💎" },
    decorations: ["✨", "⭐", "💫", "🌸", "💖", "🌷"],
    rooms: {
      characters: {
        title: "Phòng thời trang",
        label: "Thời trang",
        icon: "👸",
        items: items([
          ["👸", "Công chúa"],
          ["🧚‍♀️", "Nàng tiên"],
          ["🧜‍♀️", "Tiên cá"],
          ["🧙‍♀️", "Phù thủy nhỏ"],
          ["💃", "Vũ công"],
          ["🦸‍♀️", "Nữ siêu anh hùng"],
        ]),
      },
      gear: {
        title: "Phòng trang sức",
        label: "Trang sức",
        icon: "🎀",
        items: items([
          ["🎀", "Nơ xinh"],
          ["🌸", "Cài hoa"],
          ["💄", "Son hồng"],
          ["💍", "Nhẫn kim cương"],
          ["🪄", "Đũa phép"],
          ["👑", "Vương miện"],
        ]),
      },
      pets: {
        title: "Thú cưng",
        label: "Thú cưng",
        icon: "🐰",
        items: items([
          ["🐰", "Thỏ bông"],
          ["🐱", "Mèo hoàng gia"],
          ["🐩", "Cún poodle"],
          ["🦢", "Thiên nga"],
          ["🦄", "Kỳ lân"],
          ["🐉", "Rồng con"],
        ]),
      },
      base: {
        title: "Cung điện",
        label: "Cung điện",
        icon: "🏰",
        items: items([
          ["🏡", "Nhà nhỏ"],
          ["🌷", "Vườn hoa"],
          ["🏰", "Lâu đài"],
          ["🌈", "Lâu đài cầu vồng"],
          ["❄️", "Cung điện băng"],
          ["🌙", "Cung điện ánh trăng"],
        ]),
      },
    },
  },
};

export const THEME_LIST: Theme[] = [
  THEMES.space,
  THEMES.dino,
  THEMES.knight,
  THEMES.ocean,
  THEMES.princess,
];

export const DEFAULT_THEME: ThemeId = "space";

export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === "string" && v in THEMES;
}

export function itemKey(theme: ThemeId, room: RoomId, id: string) {
  return `${theme}:${room}:${id}`;
}
