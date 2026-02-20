'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, X, Check, Settings } from 'lucide-react';
import { ActionItem, Difficulty, Importance } from '@/types';

interface ActionItemEditorProps {
  actionItems: ActionItem[];
  onAdd: (name: string, difficulty: Difficulty, importance: Importance, timesPerDay: number, hasDuration: boolean) => void;
  onUpdate: (id: string, updates: Partial<Omit<ActionItem, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
}

const difficultyLabels: Record<Difficulty, { label: string; color: string }> = {
  low: { label: '低', color: 'bg-green-100 text-green-700 border-green-200' },
  medium: { label: '中', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  high: { label: '高', color: 'bg-red-100 text-red-700 border-red-200' },
};

const importanceLabels: Record<Importance, { label: string; color: string }> = {
  low: { label: '低', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  medium: { label: '中', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  high: { label: '高', color: 'bg-purple-100 text-purple-700 border-purple-200' },
};

/**
 * 行动项编辑界面组件
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
          <Settings className="w-5 h-5 text-stone-600" />
          <h2 className="text-lg font-semibold text-stone-800">管理行动项</h2>
        </div>
        <span className="text-sm text-stone-500">{actionItems.length} 个行动项</span>
      </div>

      {/* 添加按钮 */}
      {!isFormOpen && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 px-4 border-2 border-dashed border-stone-300 rounded-xl text-stone-500 hover:border-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          添加行动项
        </button>
      )}

      {/* 表单 */}
      {isFormOpen && (
        <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-4 shadow-sm">
          {/* 名称 */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              行动项名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：阅读30分钟"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* 难度和重要性 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                难度
              </label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 px-1 rounded-lg border text-sm font-medium transition-colors ${
                      difficulty === d
                        ? difficultyLabels[d].color + ' ring-2 ring-offset-1'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {difficultyLabels[d].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                重要度
              </label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as Importance[]).map((i) => (
                  <button
                    key={i}
                    onClick={() => setImportance(i)}
                    className={`flex-1 py-2 px-1 rounded-lg border text-sm font-medium transition-colors ${
                      importance === i
                        ? importanceLabels[i].color + ' ring-2 ring-offset-1'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {importanceLabels[i].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 一日几次 */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              一日几次
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTimesPerDay(Math.max(1, timesPerDay - 1))}
                className="w-10 h-10 rounded-lg border border-stone-300 flex items-center justify-center hover:bg-stone-100 transition-colors"
              >
                -
              </button>
              <span className="w-16 text-center text-lg font-semibold text-stone-800">
                {timesPerDay}
              </span>
              <button
                onClick={() => setTimesPerDay(timesPerDay + 1)}
                className="w-10 h-10 rounded-lg border border-stone-300 flex items-center justify-center hover:bg-stone-100 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* 有始有终 */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              有始有终？
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setHasDuration(false)}
                className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                  !hasDuration
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                否，只记录完成
              </button>
              <button
                onClick={() => setHasDuration(true)}
                className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                  hasDuration
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                是，记录时间
              </button>
            </div>
            <p className="mt-1.5 text-xs text-stone-500">
              {hasDuration
                ? '使用时需要点击"开干"和"干完"来记录用时'
                : '使用时只需点击"干"来记录完成'}
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={cancelEditing}
              className="flex-1 py-2.5 px-4 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4" />
              取消
            </button>
            <button
              onClick={editingId ? handleUpdate : handleSubmit}
              disabled={!name.trim()}
              className="flex-1 py-2.5 px-4 bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {editingId ? '保存' : '添加'}
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
              className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-stone-800 truncate">{item.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${difficultyLabels[item.difficulty].color}`}>
                      难度: {difficultyLabels[item.difficulty].label}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${importanceLabels[item.importance].color}`}>
                      重要: {importanceLabels[item.importance].label}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
                      {item.timesPerDay}次/天
                    </span>
                    {item.hasDuration && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                        计时
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => startEditing(item)}
                    className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="text-center py-8 text-stone-400">
          <p>还没有行动项</p>
          <p className="text-sm mt-1">点击上方按钮添加你的第一个行动项</p>
        </div>
      )}
    </div>
  );
}
