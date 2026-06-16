"use client";

import { useState, useEffect, useRef } from "react";
import { getRecords, resetAllLocalData } from "@/lib/storage";
import { hasMojibake } from "@/lib/textGuard";
import BottomNav from "@/components/BottomNav";
import { User, Flame, Award, BookOpen, Trash2, Download, Upload, Smartphone, Monitor } from "lucide-react";

export default function ProfilePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => setRecords(getRecords());
  useEffect(() => {
    refresh();
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const unique = new Set(records.map((r) => r.achievementId));
  const dates = Array.from(new Set(records.map((r) => r.completedAt.split("T")[0]))).sort((a, b) => b.localeCompare(a));
  let streak = 0;
  if (dates.length > 0) {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (dates[0] === today || dates[0] === yesterday) { streak = 1; for (let i = 1; i < dates.length; i++) { const diff = (new Date(dates[i - 1]).getTime() - new Date(dates[i]).getTime()) / 86400000; if (Math.abs(diff - 1) < 0.1) streak++; else break; } }
  }

  // Enhanced stats
  const catCount: Record<string, number> = {};
  for (const r of records) catCount[r.category] = (catCount[r.category] || 0) + 1;
  const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0];
  const rareCount = records.filter((r) => ["稀有", "史诗", "传说"].includes(r.rarity)).length;
  const last7 = Array.from({ length: 7 }, (_, i) => new Date(Date.now() - i * 86400000).toISOString().split("T")[0]).reverse();
  const dailyAct = last7.map((d) => records.some((r) => r.completedAt.startsWith(d)));

  const handleExport = () => {
    const data = getRecords();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "earth-ol-records-" + new Date().toISOString().split("T")[0] + ".json"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(data)) throw new Error("格式错误：需要 JSON 数组");
        for (const item of data) {
          if (!item.id || !item.achievementTitle) throw new Error("数据字段不完整");
          if (hasMojibake(item.achievementTitle)) throw new Error("数据包含乱码");
        }
        localStorage.setItem("life-checkin-records", JSON.stringify(data));
        refresh();
        alert("成功导入 " + data.length + " 条记录");
      } catch (err) {
        alert("导入失败：" + ((err as Error).message || "文件格式不正确"));
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") setDeferredPrompt(null);
  };

  const handleClear = () => {
    if (records.length === 0) return;
    if (window.confirm("确定要清除所有本地数据吗？此操作无法撤销。")) { resetAllLocalData(); refresh(); }
  };

  return (
    <>
      <section className="hero-gradient px-6 pt-12 pb-8 rounded-b-[1.5rem]">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 shadow-subtle mb-3"><User size={28} className="text-sage-400" /></div>
          <h1 className="text-[20px] font-bold text-[#2D2A28]">认真生活的人</h1>
          <p className="text-[13px] text-ivory-400 mt-0.5">今天也在慢慢升级</p>
        </div>
      </section>

      <section className="px-6 -mt-4 mb-4">
        <div className="rounded-xl bg-white border border-ivory-200/50 p-4 shadow-subtle">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-sage-50 mx-auto mb-1.5"><Flame size={16} className="text-sage-400" /></div>
              <p className="text-lg font-bold text-[#2D2A28]">{streak}</p>
              <p className="text-[10px] text-ivory-300 mt-0.5">连续打卡</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-sage-50 mx-auto mb-1.5"><Award size={16} className="text-sage-400" /></div>
              <p className="text-lg font-bold text-[#2D2A28]">{unique.size}</p>
              <p className="text-[10px] text-ivory-300 mt-0.5">已解锁成就</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-ivory-100 mx-auto mb-1.5"><BookOpen size={16} className="text-ivory-400" /></div>
              <p className="text-lg font-bold text-[#2D2A28]">{records.length}</p>
              <p className="text-[10px] text-ivory-300 mt-0.5">历史记录</p>
            </div>
          </div>
        </div>
      </section>

      {records.length > 0 && (
        <section className="px-6 mb-4">
          <div className="rounded-xl bg-white border border-ivory-200/50 p-4 shadow-subtle">
            <h2 className="text-sm font-semibold text-[#2D2A28] mb-3">打卡概况</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-ivory-400">最近 7 天</span>
                <div className="flex gap-1">
                  {dailyAct.map((a, i) => (
                    <div key={i} className={"w-3.5 h-3.5 rounded-sm " + (a ? "bg-sage-400" : "bg-ivory-150")} title={last7[i]} />
                  ))}
                </div>
              </div>
              {topCat && (
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-ivory-400">最常打卡</span>
                  <span className="text-[12px] font-medium text-sage-500">{topCat[0]}（{topCat[1]}次）</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-ivory-400">稀有及以上成就</span>
                <span className="text-[12px] font-medium text-amethyst-500">{rareCount} 条</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="px-6 mb-4">
        <div className="rounded-xl bg-white border border-ivory-200/50 p-4 shadow-subtle">
          <h2 className="text-sm font-semibold text-[#2D2A28] mb-3">数据管理</h2>
          <div className="flex gap-2">
            <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-ivory-200 text-ivory-400 hover:text-sage-400 hover:border-sage-300 px-3 py-2.5 text-[12px] font-medium transition-all duration-200">
              <Download size={14} /> 导出记录
            </button>
            <button onClick={() => fileRef.current?.click()} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-ivory-200 text-ivory-400 hover:text-sage-400 hover:border-sage-300 px-3 py-2.5 text-[12px] font-medium transition-all duration-200">
              <Upload size={14} /> 导入记录
            </button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </div>
        </div>
      </section>

      {deferredPrompt && !isIOS && (
        <section className="px-6 mb-4">
          <div className="rounded-xl bg-white border border-ivory-200/50 p-4 shadow-subtle">
            <div className="flex items-start gap-3">
              <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-sage-50"><Smartphone size={15} className="text-sage-400" /></div>
              <div className="flex-1">
                <span className="text-[12px] font-semibold text-sage-500">安装到桌面</span>
                <p className="text-[11px] text-ivory-400 mt-0.5 leading-relaxed">将人生打卡添加到手机桌面，像原生 App 一样使用。</p>
                <button onClick={handleInstall} className="mt-2 rounded-lg bg-sage-400 text-white px-4 py-1.5 text-[12px] font-medium hover:bg-sage-500 transition-colors">添加到主屏幕</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {isIOS && records.length > 0 && (
        <section className="px-6 mb-4">
          <div className="rounded-xl bg-ivory-50/70 border border-ivory-200/50 p-3.5">
            <div className="flex items-start gap-2.5">
              <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-sage-50 mt-0.5"><Monitor size={14} className="text-sage-400" /></div>
              <div>
                <span className="text-[11px] font-semibold text-sage-500">添加到主屏幕</span>
                <p className="text-[11px] text-ivory-400 mt-0.5 leading-relaxed">Safari 浏览器 → 分享按钮 → 添加到主屏幕</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="px-6 mb-4">
        <div className="rounded-xl bg-white border border-ivory-200/50 p-4 shadow-subtle">
          <h2 className="text-sm font-semibold text-[#2D2A28] mb-2">关于人生打卡</h2>
          <p className="text-[13px] text-ivory-400 leading-relaxed">这是一个把生活小事做成成就系统的 App。每一次打卡，AI 都会根据你的真实感受写下一段专属评价。</p>
        </div>
      </section>

      <section className="px-6 pb-6">
        <button onClick={handleClear} className="w-full flex items-center justify-center gap-2 rounded-xl border border-ivory-200 text-ivory-400 hover:text-rose-400 hover:border-rose-200 px-4 py-3 text-sm font-medium transition-all duration-200">
          <Trash2 size={15} /> 清除本地数据
        </button>
      </section>

      <BottomNav />
    </>
  );
}
