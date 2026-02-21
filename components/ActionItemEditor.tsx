'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, X, Check, Wrench, Shovel, Axe, Pickaxe, Heart, Package } from 'lucide-react';
import { ActionItem, Difficulty, Importance } from '@/types';

interface ActionItemEditorProps {
  actionItems: ActionItem[];
  onAdd: (name: string, difficulty: Difficulty, importance: Importance, timesPerDay: number, hasDuration: boolean) => void;
  onUpdate: (id: string, updates: Partial<Omit<ActionItem, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
}

const difficultyOptions: { value: Difficulty; label: string; icon: typeof Shovel; color: string; desc: string }[] = [
  { value: 'low', label: '轻松活', icon: Shovel, color: 'bg-green-100 text-green-700 border-green-300', desc: '顺手就能干' },
  { value: 'medium', label: '费点劲', icon: Axe, color: 'bg-yellow-100 text-yellow-700 border-yellow-300', desc: '得使点劲' },
  { value: 'high', label: '苦力活', icon: Pickaxe, color: 'bg-red-100 text-red-700 border-red-300', desc: '大工程啊' },
];

const importanceOptions: { value: Importance; label: string; hearts: number; color: string }[] = [
  { value: 'low', label: '随便搞搞', hearts: 1, color: 'bg-stone-100 text-stone-600 border-stone-300' },
  { value: 'medium', label: '得重视', hearts: 2, color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'high', label: '很重要', hearts: 3, color: 'bg-purple-100 text-purple-700 border-purple-300' },
];

/**
 * 行动项编辑界面 - 当个事儿办
 * 星露谷风格 🌾
 */
export function ActionItemEditor({ actionItems, onAdd, onUpdate, onDelete }: ActionItemEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // 表单状态
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [importance, setImportance] = useState<Importance>('medium');
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [hasDuration, setHasDuration] = useState(false);

  const resetForm = () => {
    setName('');
    setDifficulty('medium');
    setImportance('medium');
    setTimesPerDay(1);
    setHasDuration(false);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), difficulty, importance, timesPerDay, hasDuration);
    resetForm();
    setIsAdding(false);
  };

  const startEditing = (item: ActionItem) => {
    setEditingId(item.id);
    setName(item.name);
    setDifficulty(item.difficulty);
    setImportance(item.importance);
    setTimesPerDay(item.timesPerDay);
    setHasDuration(item.hasDuration);
  };

  const handleUpdate = () => {
    if (!editingId || !name.trim()) return;
    onUpdate(editingId, {
      name: name.trim(),
      difficulty,
      importance,
      timesPerDay,
      hasDuration,
    });
    setEditingId(null);
    resetForm();
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIsAdding(false);
    resetForm();
  };

  const isFormOpen = isAdding || editingId !== null;

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="w-6 h-6 text-[#6090c0]" />
          <h2 className="text-xl font-bold text-[#5c4a32]">当个事儿办</h2>
        </div>
        <span className="text-sm text-[#8b6914] bg-[#e8d4a2] px-3 py-1 rounded-full border border-[#b8a878]">
          {actionItems.length} 个事儿
        </span>
      </div>

      {/* 添加按钮 */}
      {!isFormOpen && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-4 px-4 border-2 border-dashed border-[#b8a878] rounded-xl text-[#8b6914] hover:border-[#90c040] hover:text-[#5c8a20] hover:bg-[#d4e8c0] transition-colors flex items-center justify-center gap-2 font-bold"
        >
          <Plus className="w-5 h-5" />
          加个事儿
        </button>
      )}

      {/* 表单 */}
      {isFormOpen && (
        <div className="bg-[#f8f0d8] rounded-xl border-2 border-[#b8a878] p-4 space-y-4 shadow-md">
          {/* 名称 */}
          <div>
            <label className="block text-sm font-bold text-[#5c4a32] mb-1.5">
              事儿叫啥名儿
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="比如：给菜园浇水"
              className="w-full px-3 py-2 bg-white border-2 border-[#b8a878] rounded-lg focus:outline-none focus:border-[#90c040] text-[#5c4a32] placeholder-[#a08060]"
              autoFocus
            />
          </div>

          {/* 难度和重要性 */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#5c4a32] mb-1.5">
                这活儿累不累
              </label>
              <div className="flex gap-2">
                {difficultyOptions.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`flex-1 py-2 px-1 rounded-lg border-2 text-sm font-bold transition-all ${
                      difficulty === d.value
                        ? `${d.color} ring-2 ring-offset-1 ring-[#8b6914]`
                        : 'bg-[#e8d4a2] text-[#5c4a32] border-[#b8a878] hover:bg-[#d4c494]'
                    }`}
                    title={d.desc}
                  >
                    <d.icon className="w-4 h-4 mx-auto mb-1" />
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#5c4a32] mb-1.5">
                这事儿多重要
              </label>
              <div className="flex gap-2">
                {importanceOptions.map((i) => (
                  <button
                    key={i.value}
                    onClick={() => setImportance(i.value)}
                    className={`flex-1 py-2 px-1 rounded-lg border-2 text-sm font-bold transition-all ${
                      importance === i.value
                        ? `${i.color} ring-2 ring-offset-1 ring-[#8b6914]`
                        : 'bg-[#e8d4a2] text-[#5c4a32] border-[#b8a878] hover:bg-[#d4c494]'
                    }`}
                  >
                    <div className="flex justify-center gap-0.5 mb-1">
                      {Array.from({ length: i.hearts }).map((_, idx) => (
                        <Heart key={idx} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    {i.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 一日几次 */}
          <div>
            <label className="block text-sm font-bold text-[#5c4a32] mb-1.5">
              一天得干几回
            </label>
            <div className="flex items-center gap-3 bg-[#e8d4a2] rounded-lg p-2 border-2 border-[#b8a878]">
              <button
                onClick={() => setTimesPerDay(Math.max(1, timesPerDay - 1))}
                className="w-10 h-10 rounded-lg border-2 border-[#8b6914] bg-[#f8f0d8] flex items-center justify-center hover:bg-[#d4e8c0] transition-colors font-bold text-[#5c4a32]"
              >
                -
              </button>
              <span className="w-16 text-center text-xl font-bold text-[#5c4a32]">
                {timesPerDay}
              </span>
              <button
                onClick={() => setTimesPerDay(timesPerDay + 1)}
                className="w-10 h-10 rounded-lg border-2 border-[#8b6914] bg-[#f8f0d8] flex items-center justify-center hover:bg-[#d4e8c0] transition-colors font-bold text-[#5c4a32]"
              >
                +
              </button>
            </div>
          </div>

          {/* 有始有终 */}
          <div>
            <label className="block text-sm font-bold text-[#5c4a32] mb-1.5">
              得掐着点儿不？
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setHasDuration(false)}
                className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-bold transition-colors ${
                  !hasDuration
                    ? 'bg-[#90c040] text-white border-[#5c8a20]'
                    : 'bg-[#e8d4a2] text-[#5c4a32] border-[#b8a878]'
                }`}
              >
                不用，干完就行
              </button>
              <button
                onClick={() => setHasDuration(true)}
                className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-bold transition-colors ${
                  hasDuration
                    ? 'bg-[#6090c0] text-white border-[#305070]'
                    : 'bg-[#e8d4a2] text-[#5c4a32] border-[#b8a878]'
                }`}
              >
                得记个时
              </button>
            </div>
            <p className="mt-1.5 text-xs text-[#8b6914]">
              {hasDuration
                ? '到时候得点"开干"和"收工"来记时间'
                : '到时候点"干完"就行'}
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={cancelEditing}
              className="flex-1 py-2.5 px-4 border-2 border-[#8b6914] rounded-lg text-[#5c4a32] hover:bg-[#e8d4a2] transition-colors flex items-center justify-center gap-1.5 font-bold"
            >
              <X className="w-4 h-4" />
              算了
            </button>
            <button
              onClick={editingId ? handleUpdate : handleSubmit}
              disabled={!name.trim()}
              className="flex-1 py-2.5 px-4 bg-[#90c040] text-white rounded-lg hover:bg-[#7ab030] disabled:bg-[#c4b494] disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 font-bold border-2 border-[#5c8a20]"
            >
              <Check className="w-4 h-4" />
              {editingId ? '存好' : '加上'}
            </button>
          </div>
        </div>
      )}

      {/* 行动项列表 */}
      {actionItems.length > 0 && (
        <div className="space-y-2">
          {actionItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#f8f0d8] rounded-xl border-2 border-[#b8a878] p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#5c4a32] truncate">{item.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(() => {
                      const diff = difficultyOptions.find(d => d.value === item.difficulty);
                      return diff ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${diff.color}`}>
                          <diff.icon className="w-3 h-3" />
                          {diff.label}
                        </span>
                      ) : null;
                    })()}
                    {(() => {
                      const imp = importanceOptions.find(i => i.value === item.importance);
                      return imp ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${imp.color}`}>
                          <div className="flex gap-0.5">
                            {Array.from({ length: imp.hearts }).map((_, i) => (
                              <Heart key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                          {imp.label}
                        </span>
                      ) : null;
                    })()}
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#e8d4a2] text-[#5c4a32] border border-[#b8a878]">
                      <Package className="w-3 h-3 mr-1" />
                      {item.timesPerDay}回/天
                    </span>
                    {item.hasDuration && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#d0e0f0] text-[#305070] border border-[#6090c0]">
                        ⏱ 计时
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => startEditing(item)}
                    className="p-2 text-[#8b6914] hover:text-[#5c4a32] hover:bg-[#e8d4a2] rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-[#c07060] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {actionItems.length === 0 && !isAdding && (
        <div className="text-center py-8 text-[#a08060]">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>还没啥事儿</p>
          <p className="text-sm mt-1">点上面按钮加个事儿吧</p>
        </div>
      )}
    </div>
  );
}
