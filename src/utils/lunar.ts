// 简易农历换算与农历格式化工具
const LUNAR_MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
const LUNAR_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const SHENG_XIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

export function getLunarInfo(date: Date = new Date()): {
  yearStr: string;
  monthDayStr: string;
  solarStr: string;
  weekStr: string;
  ganzhiYear: string;
  animal: string;
} {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const weekNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const weekStr = weekNames[date.getDay()];
  const solarStr = `${year}年${month}月${day}日`;

  // 天干地支年
  const tgIndex = (year - 4) % 10;
  const dzIndex = (year - 4) % 12;
  const ganzhiYear = `${TIAN_GAN[tgIndex < 0 ? tgIndex + 10 : tgIndex]}${DI_ZHI[dzIndex < 0 ? dzIndex + 12 : dzIndex]}年`;
  const animal = SHENG_XIAO[dzIndex < 0 ? dzIndex + 12 : dzIndex];

  // 计算近似农历月日（无需大体积词库，满足日常新标签页显示）
  // 结合公历月日做基准偏移
  const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 0).getTime()) / 86400000);
  const lunarMonthApprox = ((Math.floor((dayOfYear - 20) / 29.5) % 12) + 12) % 12;
  const lunarDayApprox = ((dayOfYear - 20) % 30 + 30) % 30;

  const monthDayStr = `农历${LUNAR_MONTHS[lunarMonthApprox]}月${LUNAR_DAYS[lunarDayApprox]}`;
  const yearStr = `${ganzhiYear} (${animal}年)`;

  return {
    yearStr,
    monthDayStr,
    solarStr,
    weekStr,
    ganzhiYear,
    animal,
  };
}
