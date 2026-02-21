'use client';

import { useState, useEffect } from 'react';
import { Sprout, Wrench, MessageCircleHeart } from 'lucide-react';
import { useChecklist } from '@/hooks/useChecklist';
import { useCheckupAgent } from '@/hooks/useCheckupAgent';
import { ActionItemEditor } from './ActionItemEditor';
import { TaskExecutor } from './TaskExecutor';
import { CheckupAgent } from './CheckupAgent';

type Tab = 'execute' | 'manage' | 'checkup';

/**
 * 主应用组件 - P人助手
 * 星露谷物语风格 🌾
 */
export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('execute');
  const [mounted, setMounted] = useState(false);
  
  const {
    actionItems,
    sortedTasks,
    todayTasks,
    isLoaded,
    addActionItem,
    updateActionItem,
    deleteActionItem,
    startTask,
    completeTaskWithDuration,
    completeTaskSimple,
    cancelTask,
  } = useChecklist();

  const today = new Date().toISOString().split('T')[0];
  
  const {
    config: aiConfig,
    todayReview,
    todayStats,
    history,
    isAnalyzing,
    error: checkupError,
    saveConfig,
    analyze,
    clearTodayReview,
  } = useCheckupAgent(actionItems, todayTasks, today);

  // 确保客户端挂载后再渲染，避免 hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // 等待本地存储加载或客户端挂载
  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen bg-[#f4e4bc] flex items-center justify-center pixel-font">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#8b6914] border-t-[#d4a574] rounded-full animate-spin" />
          <p className="text-[#5c4a32] text-sm">种地中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4e4bc] pixel-font">
      {/* 顶部导航 - 星露谷风格木牌 */}
      <header className="sticky top-0 z-10 bg-[#d4a574] border-b-4 border-[#8b6914] shadow-md">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#8b6914] rounded-lg flex items-center justify-center border-2 border-[#5c4a32] shadow-inner">
              <Sprout className="w-6 h-6 text-[#90c040]" />
            </div>
            <div>
              <h1 className="font-bold text-[#5c4a32] text-lg tracking-wide drop-shadow-sm">P人助手</h1>
              <p className="text-xs text-[#8b6914]">今天也要好好种地哦</p>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-md mx-auto px-4 py-4 pb-28">
        {activeTab === 'execute' && (
          <TaskExecutor
            sortedTasks={sortedTasks}
            onStart={startTask}
            onCompleteWithDuration={completeTaskWithDuration}
            onCompleteSimple={completeTaskSimple}
            onCancel={cancelTask}
          />
        )}
        
        {activeTab === 'manage' && (
          <ActionItemEditor
            actionItems={actionItems}
            onAdd={addActionItem}
            onUpdate={updateActionItem}
            onDelete={deleteActionItem}
          />
        )}
        
        {activeTab === 'checkup' && (
          <CheckupAgent
            config={aiConfig}
            todayReview={todayReview}
            todayStats={todayStats}
            history={history}
            isAnalyzing={isAnalyzing}
            error={checkupError}
            onSaveConfig={saveConfig}
            onAnalyze={analyze}
            onClearReview={clearTodayReview}
          />
        )}
      </main>

      {/* 底部导航栏 - 星露谷风格工具栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#e8d4a2] border-t-4 border-[#8b6914] shadow-[0_-4px_0_rgba(0,0,0,0.1)] safe-area-pb">
        <div className="max-w-md mx-auto px-2 py-2">
          <div className="flex bg-[#d4c494] rounded-xl p-1 border-2 border-[#8b6914]">
            <button
              onClick={() => setActiveTab('execute')}
              className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-all ${
                activeTab === 'execute'
                  ? 'bg-[#90c040] text-white shadow-md border-2 border-[#5c8a20]'
                  : 'text-[#5c4a32] hover:bg-[#c4b484]'
              }`}
            >
              <Sprout className="w-6 h-6 mb-0.5" />
              <span className="text-xs font-bold">今儿的活儿</span>
            </button>
            <button
              onClick={() => setActiveTab('checkup')}
              className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-all ${
                activeTab === 'checkup'
                  ? 'bg-[#e07050] text-white shadow-md border-2 border-[#a04030]'
                  : 'text-[#5c4a32] hover:bg-[#c4b484]'
              }`}
            >
              <MessageCircleHeart className="w-6 h-6 mb-0.5" />
              <span className="text-xs font-bold">唠叨奶奶</span>
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-all ${
                activeTab === 'manage'
                  ? 'bg-[#6090c0] text-white shadow-md border-2 border-[#305070]'
                  : 'text-[#5c4a32] hover:bg-[#c4b484]'
              }`}
            >
              <Wrench className="w-6 h-6 mb-0.5" />
              <span className="text-xs font-bold">当个事儿办</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
