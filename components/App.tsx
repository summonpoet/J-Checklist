'use client';

import { useState, useEffect } from 'react';
import { ListTodo, Settings, Sparkles } from 'lucide-react';
import { useChecklist } from '@/hooks/useChecklist';
import { ActionItemEditor } from './ActionItemEditor';
import { TaskExecutor } from './TaskExecutor';

type Tab = 'execute' | 'manage';

/**
 * 主应用组件
 */
export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('execute');
  const [mounted, setMounted] = useState(false);
  const {
    actionItems,
    sortedTasks,
    isLoaded,
    addActionItem,
    updateActionItem,
    deleteActionItem,
    startTask,
    completeTaskWithDuration,
    completeTaskSimple,
    cancelTask,
  } = useChecklist();

  // 确保客户端挂载后再渲染，避免 hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // 等待本地存储加载或客户端挂载
  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-stone-300 border-t-stone-800 rounded-full animate-spin" />
          <p className="text-sm text-stone-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-stone-800 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-stone-800">J人养成器</h1>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-md mx-auto px-4 py-4 pb-24">
        {activeTab === 'execute' ? (
          <TaskExecutor
            sortedTasks={sortedTasks}
            onStart={startTask}
            onCompleteWithDuration={completeTaskWithDuration}
            onCompleteSimple={completeTaskSimple}
            onCancel={cancelTask}
          />
        ) : (
          <ActionItemEditor
            actionItems={actionItems}
            onAdd={addActionItem}
            onUpdate={updateActionItem}
            onDelete={deleteActionItem}
          />
        )}
      </main>

      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 safe-area-pb">
        <div className="max-w-md mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab('execute')}
              className={`flex-1 flex flex-col items-center py-3 transition-colors ${
                activeTab === 'execute'
                  ? 'text-stone-800'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <ListTodo className="w-6 h-6 mb-0.5" />
              <span className="text-xs font-medium">执行任务</span>
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex-1 flex flex-col items-center py-3 transition-colors ${
                activeTab === 'manage'
                  ? 'text-stone-800'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <Settings className="w-6 h-6 mb-0.5" />
              <span className="text-xs font-medium">管理</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
