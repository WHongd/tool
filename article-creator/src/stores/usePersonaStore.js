import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/apiClient';

// ✅ 新人设默认结构（核心）
export const createEmptyPersona = () => ({
  id: crypto.randomUUID(),
  name: '',
  platform: 'toutiao',

  // 🔥 新核心字段
  role: '',
  bio: '',
  tone: 'professional',
  description: '',
  contentAngles: [],
  openingStyle: '',
  endingStyle: '',
  audience: '',
  tabooWords: [],
  keywords: [],

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

  // ⚠️ 兼容旧 UI（后面会删）
  age: 0,
  occupation: '',
  writingStyle: {
    tone: 'professional',
    emojiUsage: 'minimal',
    dialect: '',
    tabooWords: [],
    description: '',
  },
  contentPreference: 'mixed',
});

// 工具：统一数组格式
function ensureArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/[,\n、]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

// 🔥 核心：统一结构（新旧兼容）
function normalizePersona(persona) {
  if (!persona) return null;

  let ws = persona.writingStyle;

  if (typeof ws === 'string') {
    try {
      ws = JSON.parse(ws);
    } catch {
      ws = {};
    }
  }

  ws = ws || {};

  const role = persona.role || persona.occupation || '';
  const tone = persona.tone || ws.tone || 'professional';
  const description = persona.description || ws.description || '';

  const tabooWords = ensureArray(
    persona.tabooWords || ws.tabooWords
  );

  return {
    id: String(persona.id),
    name: persona.name || '',
    platform: persona.platform || 'toutiao',

    // ✅ 新结构
    role,
    bio: persona.bio || '',
    tone,
    description,
    contentAngles: ensureArray(persona.contentAngles),
    openingStyle: persona.openingStyle || '',
    endingStyle: persona.endingStyle || '',
    audience: persona.audience || '',
    tabooWords,
    keywords: ensureArray(persona.keywords),

    createdAt: persona.createdAt || new Date().toISOString(),
    updatedAt: persona.updatedAt || new Date().toISOString(),

    // ⚠️ 兼容旧 UI（关键）
    age: Number(persona.age) || 0,
    occupation: role,
    writingStyle: {
      tone,
      emojiUsage: ws.emojiUsage || 'minimal',
      dialect: ws.dialect || '',
      tabooWords,
      description,
    },
    contentPreference: persona.contentPreference || 'mixed',
  };
}

// 转换为 API 格式
function toApiPayload(persona) {
  const p = normalizePersona(persona);

  return {
    ...p,
    occupation: p.role,
    writingStyle: {
      tone: p.tone,
      emojiUsage: 'minimal',
      dialect: '',
      tabooWords: p.tabooWords,
      description: p.description,
    },
  };
}

// ================= STORE =================

export const usePersonaStore = create(
  persist(
    (set, get) => ({
      personas: [],
      activePersonaId: null,
      isLoading: false,
      error: null,

      // 加载人设
      loadPersonas: async () => {
        set({ isLoading: true });

        try {
          let personas = await api.getPersonas();
          if (!Array.isArray(personas)) personas = [];

          personas = personas.map(normalizePersona).filter(Boolean);

          set({
            personas,
            activePersonaId: personas[0]?.id || null,
            isLoading: false,
          });
        } catch (err) {
          set({
            error: err.message,
            isLoading: false,
          });
        }
      },

      // 设置当前人设
      setActivePersona: (id) => {
        set({ activePersonaId: String(id) });
      },

      // 新增人设
      addPersona: async (persona) => {
        const payload = toApiPayload({
          ...createEmptyPersona(),
          ...persona,
        });

        const res = await api.createPersona(payload);
        const newPersona = normalizePersona(res || payload);

        set((state) => ({
          personas: [...state.personas, newPersona],
          activePersonaId: newPersona.id,
        }));
      },

      // 更新人设
      updatePersona: async (id, updates) => {
        const payload = toApiPayload({
          ...updates,
          id,
          updatedAt: new Date().toISOString(),
        });

        const res = await api.updatePersona(id, payload);
        const updated = normalizePersona(res || payload);

        set((state) => ({
          personas: state.personas.map((p) =>
            p.id === String(id) ? updated : p
          ),
        }));
      },

      // 删除
      deletePersona: async (id) => {
        await api.deletePersona(id);

        set((state) => {
          const next = state.personas.filter((p) => p.id !== String(id));

          return {
            personas: next,
            activePersonaId: next[0]?.id || null,
          };
        });
      },
    }),
    {
      name: 'persona-storage',
    }
  )
);

// 当前人设 hook
export const useActivePersona = () =>
  usePersonaStore((state) =>
    state.personas.find((p) => p.id === state.activePersonaId)
  );