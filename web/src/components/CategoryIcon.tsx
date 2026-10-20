'use client';

import React from 'react';
import {
  Utensils,
  Coffee,
  ShoppingBag,
  ShoppingCart,
  Car,
  Fuel,
  Home,
  Receipt,
  Zap,
  Smartphone,
  Wifi,
  HeartPulse,
  Gamepad2,
  Film,
  Music,
  BookOpen,
  GraduationCap,
  Gift,
  Plane,
  Dumbbell,
  Scissors,
  PawPrint,
  Baby,
  CreditCard,
  Landmark,
  Wallet,
  Banknote,
  TrendingUp,
  ArrowDownLeft,
  Briefcase,
  Award,
  PiggyBank,
  MoreHorizontal,
  Tag,
  CircleDollarSign,
  ChevronDown,
  Check,
  Search,
  X,
  type LucideIcon,
} from 'lucide-react';

export interface CategoryIconMeta {
  key: string;
  label: string;
  icon: LucideIcon;
  tags: string[];
  type?: 'expense' | 'income' | 'both';
}

export const CATEGORY_ICONS: CategoryIconMeta[] = [
  // Expense - Food & Dining
  { key: 'utensils', label: 'อาหาร', icon: Utensils, tags: ['อาหาร', 'ข้าว', 'กิน', 'food', 'บุฟเฟต์', 'ก๋วยเตี๋ยว', 'ชาบู', 'ส้มตำ'], type: 'expense' },
  { key: 'coffee', label: 'กาแฟ/เครื่องดื่ม', icon: Coffee, tags: ['กาแฟ', 'ชา', 'ชานม', 'cafe', 'coffee', 'starbucks', 'น้ำปั่น'], type: 'expense' },

  // Expense - Shopping
  { key: 'shopping-bag', label: 'ช้อปปิ้ง', icon: ShoppingBag, tags: ['ช้อปปิ้ง', 'ซื้อของ', 'ห้าง', 'shopee', 'lazada', 'เสื้อผ้า', 'แฟชั่น', 'ของขวัญ'], type: 'expense' },
  { key: 'shopping-cart', label: 'ซูเปอร์มาร์เก็ต', icon: ShoppingCart, tags: ['ซูเปอร์', 'ของสด', 'ตลาด', 'เซเว่น', '7-eleven', 'big c', 'lotus', 'tops'], type: 'expense' },

  // Expense - Transport
  { key: 'car', label: 'เดินทาง/รถ', icon: Car, tags: ['รถ', 'เดินทาง', 'แท็กซี่', 'bts', 'mrt', 'grab', 'bolt', 'ทางด่วน', 'ที่จอด'], type: 'expense' },
  { key: 'fuel', label: 'น้ำมันรถ', icon: Fuel, tags: ['น้ำมัน', 'ปั๊มน้ำมัน', 'gas', 'pt', 'ptt', 'บางจาก', 'shell', 'caltex'], type: 'expense' },

  // Expense - Housing & Utilities
  { key: 'home', label: 'ที่อยู่อาศัย', icon: Home, tags: ['บ้าน', 'คอนโด', 'ค่าเช่า', 'ค่าหอ', 'หอพัก', 'ซ่อมบ้าน', 'เฟอร์นิเจอร์'], type: 'expense' },
  { key: 'zap', label: 'ค่าน้ำ/ค่าไฟ', icon: Zap, tags: ['ค่าไฟ', 'ค่าน้ำ', 'ไฟฟ้า', 'ประปา', 'การไฟฟ้า', 'การประปา'], type: 'expense' },
  { key: 'smartphone', label: 'โทรศัพท์/มือถือ', icon: Smartphone, tags: ['มือถือ', 'โทรศัพท์', 'ais', 'true', 'dtac', 'เติมเงิน', 'ค่าโทร'], type: 'expense' },
  { key: 'wifi', label: 'เน็ตบ้าน/อินเทอร์เน็ต', icon: Wifi, tags: ['เน็ต', 'เน็ตบ้าน', 'wifi', 'internet', 'fiber', '3bb'], type: 'expense' },
  { key: 'receipt', label: 'บิล/ค่าใช้จ่าย', icon: Receipt, tags: ['บิล', 'ค่าธรรมเนียม', 'ภาษี', 'ประกัน', 'หนี้', 'ผ่อน'], type: 'expense' },

  // Expense - Health & Personal
  { key: 'heart-pulse', label: 'สุขภาพ/ยา', icon: HeartPulse, tags: ['สุขภาพ', 'ยา', 'หมอ', 'คลินิก', 'โรงพยาบาล', 'ตรวจสุขภาพ', 'ทำฟัน'], type: 'expense' },
  { key: 'dumbbell', label: 'ฟิตเนส/กีฬา', icon: Dumbbell, tags: ['ฟิตเนส', 'ยิม', 'ออกกำลังกาย', 'วิ่ง', 'แบด', 'กีฬา', 'สระว่ายน้ำ'], type: 'expense' },
  { key: 'scissors', label: 'เสริมสวย/ตัดผม', icon: Scissors, tags: ['ตัดผม', 'เสริมสวย', 'ทำเล็บ', 'สปา', 'นวด', 'คลินิกความงาม'], type: 'expense' },

  // Expense - Entertainment & Life
  { key: 'gamepad-2', label: 'เกม/บันเทิง', icon: Gamepad2, tags: ['เกม', 'game', 'steam', 'playstation', 'nintendo', 'ของเล่น'], type: 'expense' },
  { key: 'film', label: 'ภาพยนตร์/สตรีมมิ่ง', icon: Film, tags: ['หนัง', 'ดูหนัง', 'netflix', 'disney', 'youtube', 'ตั๋วหนัง'], type: 'expense' },
  { key: 'music', label: 'เพลง/คอนเสิร์ต', icon: Music, tags: ['เพลง', 'spotify', 'apple music', 'คอนเสิร์ต', 'ดนตรี'], type: 'expense' },
  { key: 'plane', label: 'ท่องเที่ยว', icon: Plane, tags: ['เที่ยว', 'ตั๋วเครื่องบิน', 'โรงแรม', 'ทริป', 'ตั๋วรถ', 'วันหยุด'], type: 'expense' },
  { key: 'gift', label: 'ของขวัญ/ทำบุญ', icon: Gift, tags: ['ของขวัญ', 'ทำบุญ', 'บริจาค', 'วันเกิด', 'ช่วยงาน', 'ซอง'], type: 'expense' },
  { key: 'book-open', label: 'หนังสือ/อ่าน', icon: BookOpen, tags: ['หนังสือ', 'นิยาย', 'การ์ตูน', 'e-book', 'meb', 'เครื่องเขียน'], type: 'expense' },
  { key: 'graduation-cap', label: 'การศึกษา/คอร์ส', icon: GraduationCap, tags: ['เรียน', 'การศึกษา', 'คอร์ส', 'อบรม', 'ค่าเทอม', 'สัมมนา'], type: 'expense' },
  { key: 'paw-print', label: 'สัตว์เลี้ยง', icon: PawPrint, tags: ['สัตว์เลี้ยง', 'หมา', 'แมว', 'อาหารสัตว์', 'ทรายแมว', 'รักษาสัตว์'], type: 'expense' },
  { key: 'baby', label: 'เด็ก/ของใช้ลูก', icon: Baby, tags: ['เด็ก', 'ลูก', 'นมผง', 'ผ้าอ้อม', 'แพมเพิส', 'ของเล่นเด็ก'], type: 'expense' },
  { key: 'credit-card', label: 'บัตรเครดิต/ผ่อน', icon: CreditCard, tags: ['บัตรเครดิต', 'ผ่อนชำระ', 'งวดรถ', 'กู้', 'ดอกเบี้ย'], type: 'expense' },

  // Income Categories
  { key: 'wallet', label: 'เงินเดือน', icon: Wallet, tags: ['เงินเดือน', 'salary', 'ค่าจ้าง', 'เงินประจำ', 'รายได้ประจำ'], type: 'income' },
  { key: 'briefcase', label: 'ฟรีแลนซ์/งานเสริม', icon: Briefcase, tags: ['ฟรีแลนซ์', 'งานเสริม', 'freelance', 'รับจ้าง', 'โปรเจกต์', 'ค่าคอม'], type: 'income' },
  { key: 'trending-up', label: 'ลงทุน/ผลตอบแทน', icon: TrendingUp, tags: ['ลงทุน', 'หุ้น', 'ปันผล', 'คริปโต', 'ดอกเบี้ย', 'กองทุน', 'กำไร'], type: 'income' },
  { key: 'award', label: 'โบนัส/รางวัล', icon: Award, tags: ['โบนัส', 'bonus', 'รางวัล', 'ลาภลอย', 'สลาก', 'ถูกหวย'], type: 'income' },
  { key: 'arrow-down-left', label: 'เงินโอนเข้า', icon: ArrowDownLeft, tags: ['เงินโอนเข้า', 'โอนเข้า', 'คืนเงิน', 'รับเงิน', 'โอน'], type: 'income' },
  { key: 'piggy-bank', label: 'เงินออม', icon: PiggyBank, tags: ['เงินออม', 'ออมเงิน', 'กระปุก', 'ฝากประจำ'], type: 'both' },
  { key: 'banknote', label: 'เงินสด', icon: Banknote, tags: ['เงินสด', 'เบิกเงิน', 'ถอนเงิน'], type: 'both' },
  { key: 'landmark', label: 'ธนาคาร/รัฐ', icon: Landmark, tags: ['ธนาคาร', 'รัฐบาล', 'เงินสงเคราะห์', 'สวัสดิการ', 'ภาษีคืน'], type: 'both' },
  { key: 'tag', label: 'อื่นๆ/ทั่วไป', icon: Tag, tags: ['อื่นๆ', 'ทั่วไป', 'จิปาถะ', 'misc'], type: 'both' },
  { key: 'more-horizontal', label: 'หมวดเพิ่มเติม', icon: MoreHorizontal, tags: ['เพิ่มเติม', 'etc'], type: 'both' },
];

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = CATEGORY_ICONS.reduce(
  (acc, item) => {
    acc[item.key] = item.icon;
    return acc;
  },
  {} as Record<string, LucideIcon>,
);

// Fallback & Alias mappings
CATEGORY_ICON_MAP['food'] = Utensils;
CATEGORY_ICON_MAP['drinks'] = Coffee;
CATEGORY_ICON_MAP['shopping'] = ShoppingBag;
CATEGORY_ICON_MAP['travel'] = Plane;
CATEGORY_ICON_MAP['transport'] = Car;
CATEGORY_ICON_MAP['bills'] = Receipt;
CATEGORY_ICON_MAP['bill'] = Receipt;
CATEGORY_ICON_MAP['utilities'] = Zap;
CATEGORY_ICON_MAP['health'] = HeartPulse;
CATEGORY_ICON_MAP['entertainment'] = Gamepad2;
CATEGORY_ICON_MAP['salary'] = Wallet;
CATEGORY_ICON_MAP['income'] = ArrowDownLeft;
CATEGORY_ICON_MAP['investment'] = TrendingUp;
CATEGORY_ICON_MAP['other'] = Tag;

/**
 * Smart automatic icon suggestion based on name & type
 */
export function suggestCategoryIcon(name: string, type: 'income' | 'expense' = 'expense'): string {
  if (!name || !name.trim()) {
    return type === 'income' ? 'wallet' : 'shopping-bag';
  }

  const clean = name.toLowerCase().trim();

  // 1. Direct match on key or label
  for (const item of CATEGORY_ICONS) {
    if (clean === item.key.toLowerCase() || clean === item.label.toLowerCase()) {
      return item.key;
    }
  }

  // 2. Keyword match in tags
  for (const item of CATEGORY_ICONS) {
    for (const tag of item.tags) {
      if (clean.includes(tag.toLowerCase()) || tag.toLowerCase().includes(clean)) {
        return item.key;
      }
    }
  }

  // 3. Common Thai word heuristical fallback
  if (clean.includes('กิน') || clean.includes('ข้าว') || clean.includes('จาน')) return 'utensils';
  if (clean.includes('น้ำ') || clean.includes('ชา') || clean.includes('กาแฟ')) return 'coffee';
  if (clean.includes('ซื้อ') || clean.includes('ของ') || clean.includes('ห้าง')) return 'shopping-bag';
  if (clean.includes('รถ') || clean.includes('ทาง') || clean.includes('ไป')) return 'car';
  if (clean.includes('บ้าน') || clean.includes('หอ') || clean.includes('ห้อง')) return 'home';
  if (clean.includes('เงิน') || clean.includes('เดือน') || clean.includes('รับ')) {
    return type === 'income' ? 'wallet' : 'banknote';
  }

  return type === 'income' ? 'wallet' : 'tag';
}

/**
 * Resolve icon component safely
 */
export function getCategoryIconComponent(
  iconKey?: string | null,
  categoryName?: string,
  type: 'income' | 'expense' = 'expense',
): LucideIcon {
  if (iconKey && CATEGORY_ICON_MAP[iconKey]) {
    return CATEGORY_ICON_MAP[iconKey];
  }
  if (categoryName) {
    const suggested = suggestCategoryIcon(categoryName, type);
    if (CATEGORY_ICON_MAP[suggested]) {
      return CATEGORY_ICON_MAP[suggested];
    }
  }
  return Tag;
}

export interface CategoryIconProps {
  icon?: string | null;
  categoryName?: string;
  type?: 'income' | 'expense';
  color?: string | null;
  size?: number | string;
  className?: string;
}

/**
 * Clean & resilient Lucide Category Icon
 */
export function CategoryIcon({
  icon,
  categoryName,
  type = 'expense',
  color,
  size = 16,
  className = '',
}: CategoryIconProps) {
  const IconComponent = getCategoryIconComponent(icon, categoryName, type);
  const numSize = typeof size === 'number' ? size : 16;

  return (
    <IconComponent
      size={numSize}
      className={className}
      style={color ? { color } : undefined}
    />
  );
}

/**
 * Category Avatar / Box with Background Tint
 */
export function CategoryAvatar({
  icon,
  categoryName,
  type = 'expense',
  color = '#64748B',
  size = 'md',
  className = '',
}: {
  icon?: string | null;
  categoryName?: string;
  type?: 'income' | 'expense';
  color?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const safeColor = color || '#64748B';

  const sizeStyles = {
    xs: { box: 'w-6 h-6 rounded-lg', iconSize: 12 },
    sm: { box: 'w-8 h-8 rounded-xl', iconSize: 14 },
    md: { box: 'w-10 h-10 rounded-2xl', iconSize: 18 },
    lg: { box: 'w-12 h-12 rounded-2xl', iconSize: 22 },
  }[size];

  return (
    <div
      className={`flex items-center justify-center flex-shrink-0 text-white shadow-xs ${sizeStyles.box} ${className}`}
      style={{ backgroundColor: safeColor }}
    >
      <CategoryIcon
        icon={icon}
        categoryName={categoryName}
        type={type}
        size={sizeStyles.iconSize}
      />
    </div>
  );
}

/**
 * Interactive Icon Picker Component for Creating / Editing Categories
 */
export function CategoryIconPicker({
  selectedIcon,
  onSelectIcon,
  categoryName = '',
  type = 'expense',
  color = '#0066FF',
}: {
  selectedIcon: string;
  onSelectIcon: (key: string) => void;
  categoryName?: string;
  type?: 'income' | 'expense';
  color?: string;
}) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterTab, setFilterTab] = React.useState<'all' | 'expense' | 'income'>('all');

  // Auto suggest icon based on current name
  const suggestedKey = React.useMemo(() => {
    return suggestCategoryIcon(categoryName, type);
  }, [categoryName, type]);

  // Filtered icons based on search & tab
  const filteredIcons = React.useMemo(() => {
    return CATEGORY_ICONS.filter((item) => {
      // Tab filter
      if (filterTab === 'expense' && item.type === 'income') return false;
      if (filterTab === 'income' && item.type === 'expense') return false;

      // Search filter
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      return (
        item.label.toLowerCase().includes(q) ||
        item.key.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [searchTerm, filterTab]);

  const selectedMeta = CATEGORY_ICONS.find((i) => i.key === selectedIcon) || {
    key: selectedIcon,
    label: 'ไอคอนที่เลือก',
    icon: Tag,
  };

  const suggestedMeta = CATEGORY_ICONS.find((i) => i.key === suggestedKey);

  return (
    <div className="space-y-3">
      {/* Current Selection & Auto Suggestion Notification */}
      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/90 rounded-2xl">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs transition-colors"
            style={{ backgroundColor: color || '#0066FF' }}
          >
            <CategoryIcon icon={selectedIcon} size={20} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400">ไอคอนที่เลือก</div>
            <div className="text-xs font-extrabold text-slate-800">{selectedMeta.label}</div>
          </div>
        </div>

        {/* Suggestion chip */}
        {categoryName.trim().length > 0 && suggestedKey !== selectedIcon && suggestedMeta && (
          <button
            type="button"
            onClick={() => onSelectIcon(suggestedKey)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-[11px] font-bold transition active:scale-95"
            title="คลิกเพื่อใช้ไอคอนแนะนำจากชื่อหมวดหมู่"
          >
            <span>💡 แนะนำ:</span>
            <suggestedMeta.icon size={13} className="text-amber-700" />
            <span>{suggestedMeta.label}</span>
          </button>
        )}
      </div>

      {/* Search and Tabs */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ค้นหาไอคอน (เช่น อาหาร, กาแฟ, บิล, รถ)..."
          className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-fastwork-500 font-medium"
        />
        <div className="flex bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-2 py-1 rounded-lg transition ${
              filterTab === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('expense')}
            className={`px-2 py-1 rounded-lg transition ${
              filterTab === 'expense' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            รายจ่าย
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('income')}
            className={`px-2 py-1 rounded-lg transition ${
              filterTab === 'income' ? 'bg-white text-emerald-600 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            รายรับ
          </button>
        </div>
      </div>

      {/* Icons Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-white">
        {filteredIcons.map((item) => {
          const isSelected = selectedIcon === item.key;
          const IconComp = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectIcon(item.key)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all text-center group ${
                isSelected
                  ? 'bg-fastwork-50 ring-2 ring-fastwork-500 text-fastwork-600 font-bold shadow-xs scale-98'
                  : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition ${
                  isSelected ? 'bg-fastwork-100/80 text-fastwork-600' : 'text-slate-600 group-hover:text-fastwork-600'
                }`}
              >
                <IconComp size={18} />
              </div>
              <span className="text-[10px] truncate max-w-full mt-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Dropdown Select Component for Categories with Icons
 */
export function CategorySelect({
  categories,
  value,
  onChange,
  placeholder = 'เลือกหมวดหมู่',
  allOptionLabel,
  filterType,
  className = '',
}: {
  categories: Array<{
    id: string;
    name: string;
    type: 'income' | 'expense';
    icon: string | null;
    color: string | null;
  }>;
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  allOptionLabel?: string;
  filterType?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCategory = categories.find((c) => c.id === value);

  const filteredCategories = React.useMemo(() => {
    return categories
      .filter((c) => !filterType || c.type === filterType)
      .filter((c) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase().trim();
        return c.name.toLowerCase().includes(q);
      });
  }, [categories, filterType, search]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 transition focus:outline-none focus:ring-2 focus:ring-fastwork-500/20 focus:border-fastwork-500 text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedCategory ? (
            <>
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-2xs"
                style={{ backgroundColor: selectedCategory.color || '#64748B' }}
              >
                <CategoryIcon
                  icon={selectedCategory.icon}
                  categoryName={selectedCategory.name}
                  type={selectedCategory.type}
                  size={13}
                />
              </div>
              <span className="truncate font-semibold text-slate-900">
                {selectedCategory.name}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                  selectedCategory.type === 'income'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {selectedCategory.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
              </span>
            </>
          ) : allOptionLabel ? (
            <>
              <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0">
                <Tag size={13} />
              </div>
              <span className="truncate text-slate-700 font-medium">
                {allOptionLabel}
              </span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-400 flex items-center justify-center flex-shrink-0">
                <Tag size={13} />
              </div>
              <span className="truncate text-slate-400 font-normal">
                {placeholder}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 text-slate-400">
          {value && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 hover:text-slate-600 rounded-md cursor-pointer transition"
              title="ล้างค่าที่เลือก"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-fastwork-600' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-1.5 max-h-72 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {categories.length > 5 && (
            <div className="relative px-1 pt-1 pb-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาหมวดหมู่..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-fastwork-500 font-medium"
                autoFocus
              />
              <Search size={14} className="text-slate-400 absolute left-3 top-3" />
            </div>
          )}

          <div className="overflow-y-auto space-y-1 max-h-56 pr-0.5">
            {allOptionLabel && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  !value
                    ? 'bg-fastwork-50 text-fastwork-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                    <Tag size={13} />
                  </div>
                  <span>{allOptionLabel}</span>
                </div>
                {!value && <Check size={14} className="text-fastwork-600" />}
              </button>
            )}

            {!allOptionLabel && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  !value
                    ? 'bg-fastwork-50 text-fastwork-700'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0">
                    <Tag size={13} />
                  </div>
                  <span>(ไม่ระบุหมวดหมู่)</span>
                </div>
                {!value && <Check size={14} className="text-fastwork-600" />}
              </button>
            )}

            {filteredCategories.map((cat) => {
              const isSelected = cat.id === value;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onChange(cat.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isSelected
                      ? 'bg-fastwork-50 text-fastwork-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-2xs"
                      style={{ backgroundColor: cat.color || '#64748B' }}
                    >
                      <CategoryIcon
                        icon={cat.icon}
                        categoryName={cat.name}
                        type={cat.type}
                        size={13}
                      />
                    </div>
                    <span className="truncate">{cat.name}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        cat.type === 'income'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {cat.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                    </span>
                  </div>
                  {isSelected && <Check size={14} className="text-fastwork-600 flex-shrink-0 ml-2" />}
                </button>
              );
            })}

            {filteredCategories.length === 0 && (
              <div className="py-4 text-center text-xs text-slate-400">
                ไม่พบหมวดหมู่ที่ตรงกับคำค้นหา
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


