import { Coffee, Egg, Utensils, Beef, Fish, Salad, Pizza, Wheat, Banana, Apple, Milk, Dumbbell, CupSoda } from 'lucide-react';

const rules = [
  [/coffee|espresso|latte/, Coffee],
  [/egg/, Egg],
  [/beef|steak|burger/, Beef],
  [/fish|salmon|tuna/, Fish],
  [/salad|veggie|vegetable|broccoli|spinach/, Salad],
  [/pizza/, Pizza],
  [/bread|toast|sandwich|cereal|oat|granola/, Wheat],
  [/banana/, Banana],
  [/apple/, Apple],
  [/milk|yogurt|cheese|dairy/, Milk],
  [/protein|shake|bar/, Dumbbell],
  [/juice|smoothie/, CupSoda],
];

export default function FoodIcon({ name = '', size = 18, color = 'var(--text2)' }) {
  const n = name.toLowerCase();
  const match = rules.find(([re]) => re.test(n));
  const Icon = match ? match[1] : Utensils;
  return <Icon size={size} color={color} />;
}
