import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  AlertCircle,
  Flame,
  Clock,
  Tag
} from 'lucide-react';
import { Category, FoodItem } from '../types';
import { soundFx } from '../utils/sound';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (item: Omit<FoodItem, 'id'>) => void;
}

const PRESET_IMAGES = [
  {
    name: 'Yellow Noodle Packet (Maggi style)',
    url: '/assets/maggi-masala-packet.svg',
    category: 'noodles'
  },
  {
    name: 'Spicy Ramen Packet (Buldak style)',
    url: '/assets/buldak-2x-packet.svg',
    category: 'noodles'
  },
  {
    name: 'Ready-to-Eat Noodle Pouch (Wai Wai style)',
    url: '/assets/wai-wai-packet.svg',
    category: 'noodles'
  },
  {
    name: 'Curry Ramen Packet (Top Ramen style)',
    url: '/assets/top-ramen-packet.svg',
    category: 'noodles'
  },
  {
    name: 'Potato Chips',
    url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    category: 'chips'
  },
  {
    name: 'Nacho Tortilla',
    url: 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80',
    category: 'chips'
  },
  {
    name: 'Energy Can',
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    category: 'drinks'
  },
  {
    name: 'Cold Coffee / Milk',
    url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
    category: 'drinks'
  },
  {
    name: 'Chocolate Bar',
    url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80',
    category: 'sweets'
  },
  {
    name: 'Biscuits / Cookies',
    url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    category: 'quick-bites'
  },
  {
    name: 'Midnight Combo Pack',
    url: '/assets/combo-allnighter-pack.svg',
    category: 'combos'
  }
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('noodles');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(PRESET_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [useCustomUrl, setUseCustomUrl] = useState(false);
  const [isVeg, setIsVeg] = useState(true);
  const [spicyLevel, setSpicyLevel] = useState<0 | 1 | 2 | 3>(1);
  const [prepTime, setPrepTime] = useState('Ready to Eat (Sealed)');
  const [tag, setTag] = useState('New Arrival');
  const [inStock, setInStock] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Item name is required';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      errs.price = 'Valid price is required';
    }
    if (!weight.trim()) errs.weight = 'Weight / pack size is required (e.g. 100g, 250ml)';
    if (!description.trim()) errs.description = 'Brief item description is required';
    
    const activeImage = useCustomUrl ? customImageUrl.trim() : image;
    if (!activeImage) {
      errs.image = 'Please select or provide an image';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      soundFx.playTap();
      return;
    }

    const finalImage = useCustomUrl && customImageUrl.trim() ? customImageUrl.trim() : image;

    const newItem: Omit<FoodItem, 'id'> = {
      name: name.trim(),
      category,
      price: Math.round(Number(price)),
      originalPrice: originalPrice ? Math.round(Number(originalPrice)) : undefined,
      weight: weight.trim(),
      description: description.trim(),
      image: finalImage,
      isVeg,
      spicyLevel,
      prepTime: prepTime.trim() || 'Ready to Eat',
      tag: tag.trim() || undefined,
      rating: 4.9,
      reviewsCount: 1,
      inStock,
    };

    onAddProduct(newItem);
    soundFx.playSuccess();
    onClose();
  };

  const handleSelectPreset = (url: string) => {
    setImage(url);
    setUseCustomUrl(false);
    soundFx.playTap();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6">
      <div className="min-h-full flex items-start sm:items-center justify-center py-4 sm:py-6">
        <div 
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white font-['Outfit']">
                  Add New Packaged Food Item
                </h3>
                <p className="text-xs text-slate-400">
                  Added items are instantly available for room delivery to Block A & B
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Item Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Food Item Name *</span>
                {errors.name && <span className="text-rose-400 font-normal">{errors.name}</span>}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="e.g. Chings Secret Hot Garlic Noodles (Pack of 2)"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border ${
                  errors.name ? 'border-rose-500' : 'border-slate-800 focus:border-amber-500'
                } text-xs text-white placeholder:text-slate-600 focus:outline-none transition-colors`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-white focus:outline-none capitalize"
              >
                <option value="noodles">Noodles & Soups</option>
                <option value="chips">Chips & Savories</option>
                <option value="drinks">Chilled Drinks & Cans</option>
                <option value="sweets">Chocolates & Sweets</option>
                <option value="quick-bites">Biscuits & Bites</option>
                <option value="combos">2 AM Combos</option>
              </select>
            </div>
          </div>

          {/* Pricing & Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Selling Price (₹) *</span>
                {errors.price && <span className="text-rose-400 font-normal">{errors.price}</span>}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
                  }}
                  placeholder="35"
                  className={`w-full pl-7 pr-3 py-2.5 rounded-xl bg-slate-950 border ${
                    errors.price ? 'border-rose-500' : 'border-slate-800 focus:border-amber-500'
                  } text-xs text-white placeholder:text-slate-600 focus:outline-none`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Original MRP (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="40 (optional strikethrough)"
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Weight / Size *</span>
                {errors.weight && <span className="text-rose-400 font-normal">{errors.weight}</span>}
              </label>
              <input
                type="text"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  if (errors.weight) setErrors((prev) => ({ ...prev, weight: '' }));
                }}
                placeholder="e.g. 100g Sealed Pouch"
                className={`w-full px-3 py-2.5 rounded-xl bg-slate-950 border ${
                  errors.weight ? 'border-rose-500' : 'border-slate-800 focus:border-amber-500'
                } text-xs text-white placeholder:text-slate-600 focus:outline-none`}
              />
            </div>
          </div>

          {/* Item Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Description *</span>
              {errors.description && <span className="text-rose-400 font-normal">{errors.description}</span>}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              placeholder="Crispy factory-sealed snack pack for all-night study sessions."
              className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                errors.description ? 'border-rose-500' : 'border-slate-800 focus:border-amber-500'
              } text-xs text-white placeholder:text-slate-600 focus:outline-none resize-none`}
            />
          </div>

          {/* Image Selection with Presets + Custom URL */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Product Image</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUseCustomUrl(false)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    !useCustomUrl ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setUseCustomUrl(true)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    useCustomUrl ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Custom URL
                </button>
              </div>
            </div>

            {!useCustomUrl ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PRESET_IMAGES.map((preset, idx) => {
                  const isSelected = image === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`relative rounded-xl overflow-hidden border-2 aspect-square group transition-all cursor-pointer ${
                        isSelected ? 'border-amber-400 ring-2 ring-amber-400/40 scale-102' : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.name} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-slate-950/40 flex items-end p-1 text-[9px] font-bold text-white leading-tight">
                        {preset.name}
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or any image link"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                />
                {customImageUrl && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <img 
                      src={customImageUrl} 
                      alt="Preview" 
                      className="w-12 h-12 rounded-lg object-cover bg-slate-900"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PRESET_IMAGES[0].url;
                      }}
                    />
                    <span className="text-xs text-slate-400">Image preview valid</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Badges, Dietary & Spice Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
            {/* Tag / Badge */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-400" />
                <span>Badge / Tag</span>
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. 2 AM Hit, Sealed Pack"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-white placeholder:text-slate-600 focus:outline-none"
              />
            </div>

            {/* Preparation / Serving Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Prep / Serve Note</span>
              </label>
              <input
                type="text"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="Ready to Eat / Kettle 2 mins"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-white placeholder:text-slate-600 focus:outline-none"
              />
            </div>

            {/* Spiciness Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Spice Level (0–3)</span>
              </label>
              <select
                value={spicyLevel}
                onChange={(e) => setSpicyLevel(Number(e.target.value) as 0 | 1 | 2 | 3)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-white focus:outline-none"
              >
                <option value={0}>0 - Not Spicy</option>
                <option value={1}>1 - Mild</option>
                <option value={2}>2 - Hot / Spicy 🌶️</option>
                <option value={3}>3 - Extreme Fire 🌶️🌶️</option>
              </select>
            </div>
          </div>

          {/* Vegetarian & In Stock Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            {/* Veg toggle */}
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                isVeg ? 'border-emerald-500' : 'border-rose-500'
              }`}>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  {isVeg ? '100% Vegetarian' : 'Non-Vegetarian'}
                </div>
                <div className="text-[10px] text-slate-400">Dietary label on menu</div>
              </div>
              <button
                type="button"
                onClick={() => setIsVeg(!isVeg)}
                className="ml-2 text-[11px] font-bold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                Switch to {isVeg ? 'Non-Veg' : 'Veg'}
              </button>
            </div>

            {/* In stock toggle */}
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${inStock ? 'text-emerald-400' : 'text-rose-400'}`}>
                {inStock ? 'In Stock (Available)' : 'Out of Stock (Sold Out)'}
              </span>
              <button
                type="button"
                onClick={() => setInStock(!inStock)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  inStock ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition ${
                    inStock ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Food Item to Menu</span>
            </button>
          </div>

        </form>

        </div>
      </div>
    </div>
  );
};
