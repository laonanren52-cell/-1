"use client";
import { AchievementCategory, Rarity } from "@/types/achievement";

import { useState } from "react";
import { categories } from "@/data/achievements";
import { emotionTags } from "@/data/emotionTags";
import { generatePraise } from "@/lib/aiPraise";
import { saveRecord } from "@/lib/storage";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Sparkles, Loader2, Clock, MessageSquare, Bookmark, Award, RefreshCw, ArrowLeft,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function CustomCheckInDialog({ open, onClose, onSaved }: Props) {
  const [step, setStep] = useState<"form" | "loading" | "result">("form");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [praise, setPraise] = useState("");
  const [generatedAt, setGeneratedAt] = useState("");

  const handleGenerate = async () => {
    if (!title.trim()) return;
    setStep("loading");
    try {
      const mockAchievement = {
        id: "custom_" + Date.now(),
        title: title.trim(),
        category: (category || "其他") as AchievementCategory,
        rarity: "普通" as Rarity,
        description: description || title.trim(),
        unlockCondition: "",
        icon: "sparkles",
        tags: [],
        aiTone: "温柔、真诚、鼓励",
      };
      const result = await generatePraise({
        achievement: mockAchievement,
        userNote: description || title,
        emotionTag: selectedEmotion || undefined,
        records: [],
      });
      setPraise(result);
      setGeneratedAt(new Date().toISOString());
      setStep("result");
    } catch {
      setStep("form");
    }
  };

  const handleSave = () => {
    saveRecord({
      id: crypto.randomUUID?.() || Date.now().toString(36),
      source: "custom",
      achievementTitle: title.trim(),
      category: (category || "其他") as AchievementCategory,
      rarity: "自定义",
      description: description || undefined,
      userNote: description || title,
      emotionTag: selectedEmotion || undefined,
      aiPraise: praise,
      completedAt: generatedAt,
    });
    onSaved();
    handleReset();
  };

  const handleReset = () => {
    setStep("form"); setTitle(""); setDescription(""); setCategory(""); setSelectedEmotion(""); setPraise(""); setGeneratedAt(""); onClose();
  };

  const handleRegenerate = () => {
    setStep("form"); setPraise(""); setGeneratedAt("");
  };

  const canGenerate = title.trim().length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget && step === "form") handleReset(); }}>
          <motion.div key={step} initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 350, damping: 30, mass: 0.9 }} className="relative w-full max-w-sm mx-3 rounded-2xl bg-white shadow-modal overflow-hidden">

            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              {step === "result" ? (
                <button onClick={handleRegenerate} className="flex items-center gap-1.5 text-sm text-ivory-400 hover:text-ivory-500 transition-colors">
                  <ArrowLeft size={16} /> <span>返回修改</span>
                </button>
              ) : <div />}
              <button onClick={handleReset} className="flex items-center justify-center w-8 h-8 rounded-full text-ivory-400 hover:text-ivory-500 hover:bg-ivory-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-5 pb-4">
              <h2 className="text-lg font-bold text-[#2D2A28]">自定义打卡</h2>
              <p className="text-[13px] text-ivory-400 mt-0.5">记录属于你的一件小事</p>
            </div>

            <div className="border-t border-ivory-100" />

            <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
              {step === "form" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <label className="block text-sm font-medium text-[#2D2A28] mb-1.5">打卡标题 *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="今天主动去散步了" className="w-full rounded-xl border border-ivory-200 bg-ivory-50/50 px-4 py-3 text-sm text-[#2D2A28] placeholder:text-ivory-300 focus:outline-none focus:ring-2 focus:ring-sage-300/40 focus:border-sage-300 transition-all mb-3" />

                  <label className="block text-sm font-medium text-[#2D2A28] mb-1.5">打卡描述</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="虽然有点懒，但还是出门走了 20 分钟" rows={2} className="w-full resize-none rounded-xl border border-ivory-200 bg-ivory-50/50 px-4 py-3 text-sm text-[#2D2A28] placeholder:text-ivory-300 focus:outline-none focus:ring-2 focus:ring-sage-300/40 focus:border-sage-300 transition-all mb-3" />

                  <label className="block text-sm font-medium text-[#2D2A28] mb-1.5">分类</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-ivory-200 bg-ivory-50/50 px-4 py-3 text-sm text-[#2D2A28] focus:outline-none focus:ring-2 focus:ring-sage-300/40 focus:border-sage-300 transition-all mb-3">
                    <option value="">选择分类（可选）</option>
                    {categories.filter(c => c.value !== "all").map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>

                  <label className="block text-sm font-medium text-[#2D2A28] mb-1.5">现在的感受</label>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {emotionTags.map((em) => {
                      const active = selectedEmotion === em.id;
                      return (
                        <button key={em.id} onClick={() => setSelectedEmotion(active ? "" : em.id)}
                          className={`rounded-full px-3 py-1 text-[12px] font-medium transition-all duration-200 ${active ? "bg-sage-400 text-white shadow-sm" : "bg-ivory-100 text-ivory-400 hover:bg-ivory-150"}`}>
                          {em.label}
                        </button>
                      );
                    })}
                  </div>

                  <button onClick={handleGenerate} disabled={!canGenerate}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${canGenerate ? "bg-sage-400 text-white hover:bg-sage-500 active:scale-[0.98] shadow-sm" : "bg-ivory-100 text-ivory-300 cursor-not-allowed"}`}>
                    <Sparkles size={16} /> 生成我的成就评价
                  </button>
                </motion.div>
              )}

              {step === "loading" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8">
                  <Loader2 size={36} className="text-sage-400 animate-spin mb-5" />
                  <p className="text-sm font-medium text-[#2D2A28] mb-1">AI 夸夸官正在记录你的成长</p>
                  <p className="text-[12px] text-ivory-300">正在生成专属成就评价</p>
                  <div className="flex gap-1 mt-4">
                    {[0, 1, 2].map((i) => (
                      <motion.div key={i} initial={{ opacity: 0.3 }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.3 }} className="w-1.5 h-1.5 rounded-full bg-sage-400" />
                    ))}
                  </div>
                </motion.div>
              )}

              {step === "result" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
                    className="flex flex-col items-center mb-5">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-sky-50 to-sage-50 mb-2 shadow-lg shadow-sky-200/30">
                      <Award size={30} className="text-sky-500" />
                    </div>
                    <h3 className="text-lg font-bold text-[#2D2A28]">成就解锁</h3>
                    <p className="text-[13px] font-medium text-sky-500">{title}</p>
                  </motion.div>

                  <div className="rounded-xl bg-gradient-to-br from-sky-50/60 to-ivory-50 border border-sky-200/30 p-4 mb-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles size={13} className="text-sage-400" />
                      <span className="text-[10px] font-medium text-sage-500 tracking-[0.05em] uppercase">地球 Online 成就评价</span>
                    </div>
                    <p className="text-[14px] text-[#2D2A28] leading-relaxed whitespace-pre-line">{praise}</p>
                  </div>

                  <div className="rounded-xl bg-ivory-50 border border-ivory-150 p-3.5 mb-4">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MessageSquare size={13} className="text-ivory-400" />
                      <span className="text-[10px] font-medium text-ivory-400 tracking-[0.05em] uppercase">你的记录</span>
                    </div>
                    <p className="text-[13px] text-[#2D2A28] leading-relaxed">{title}</p>
                    {description && <p className="text-[12px] text-ivory-500 mt-1">{description}</p>}
                    <div className="flex items-center gap-1 mt-2 text-[11px] text-ivory-300">
                      <Clock size={11} />
                      <span>{new Date(generatedAt).toLocaleString("zh-CN")}</span>
                    </div>
                  </div>

                  <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 rounded-xl bg-sage-400 text-white px-5 py-3 text-sm font-semibold hover:bg-sage-500 active:scale-[0.98] transition-all duration-200 shadow-sm mb-2 sheen-button">
                    <Bookmark size={16} /> 保存记录
                  </button>

                  <div className="flex gap-2">
                    <button onClick={handleReset} className="flex-1 rounded-xl border border-ivory-200 text-ivory-400 hover:text-ivory-500 hover:bg-ivory-50 px-4 py-2.5 text-sm font-medium transition-all duration-200">继续探索</button>
                    <button onClick={handleRegenerate} className="flex-1 rounded-xl border border-ivory-200 text-ivory-400 hover:text-ivory-500 hover:bg-ivory-50 px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5">
                      <RefreshCw size={14} /> 再生成一次
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
