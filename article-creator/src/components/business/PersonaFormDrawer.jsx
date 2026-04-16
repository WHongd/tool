import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { PLATFORMS } from '../../constants/platforms';

const EMPTY_FORM = {
  name: '',
  platform: 'toutiao',

  role: '',
  bio: '',

  tone: 'professional',
  description: '',

  contentAngles: '',
  openingStyle: '',
  endingStyle: '',
  audience: '',

  keywords: '',
  tabooWords: '',
};

function toCommaText(value) {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'string') return value;
  return '';
}

function normalizeInitialData(initialData) {
  if (!initialData) return EMPTY_FORM;

  return {
    name: initialData.name || '',
    platform: initialData.platform || 'toutiao',

    role: initialData.role || initialData.occupation || '',
    bio: initialData.bio || '',

    tone:
      initialData.tone ||
      initialData.writingStyle?.tone ||
      'professional',

    description:
      initialData.description ||
      initialData.writingStyle?.description ||
      '',

    contentAngles: toCommaText(initialData.contentAngles),
    openingStyle: initialData.openingStyle || '',
    endingStyle: initialData.endingStyle || '',
    audience: initialData.audience || '',

    keywords: toCommaText(initialData.keywords),
    tabooWords: toCommaText(
      initialData.tabooWords || initialData.writingStyle?.tabooWords
    ),
  };
}

function splitToArray(text) {
  return String(text || '')
    .split(/[,\n、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function PersonaFormDrawer({
  isOpen,
  onClose,
  initialData,
  onSubmit,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (isOpen) {
      setFormData(normalizeInitialData(initialData));
    }
  }, [initialData, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      id: initialData?.id,
      name: formData.name.trim(),
      platform: formData.platform,

      role: formData.role.trim(),
      bio: formData.bio.trim(),

      tone: formData.tone,
      description: formData.description.trim(),

      contentAngles: splitToArray(formData.contentAngles),
      openingStyle: formData.openingStyle.trim(),
      endingStyle: formData.endingStyle.trim(),
      audience: formData.audience.trim(),

      keywords: splitToArray(formData.keywords),
      tabooWords: splitToArray(formData.tabooWords),

      updatedAt: new Date().toISOString(),
      createdAt: initialData?.createdAt || new Date().toISOString(),

      // 兼容旧 UI / 旧逻辑
      occupation: formData.role.trim(),
      writingStyle: {
        tone: formData.tone,
        emojiUsage: 'minimal',
        dialect: '',
        tabooWords: splitToArray(formData.tabooWords),
        description: formData.description.trim(),
      },
      contentPreference: 'mixed',
      age: initialData?.age || 0,
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-end p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-x-full"
              enterTo="opacity-100 translate-x-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-x-0"
              leaveTo="opacity-0 translate-x-full"
            >
              <Dialog.Panel className="w-full max-w-xl h-screen bg-white shadow-drawer overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-lg font-semibold">
                      {initialData ? '编辑人设' : '新建人设'}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* 基础信息 */}
                    <div className="border-b pb-4">
                      <h3 className="font-medium text-gray-900 mb-3">基础信息</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            人设名称 *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            placeholder="例如：头条｜社会观察者"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            平台 *
                          </label>
                          <select
                            value={formData.platform}
                            onChange={(e) => handleChange('platform', e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                          >
                            {PLATFORMS.map((p) => (
                              <option key={p.value} value={p.value}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            角色定位 *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.role}
                            onChange={(e) => handleChange('role', e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            placeholder="例如：社会观察型作者 / 热点评论型作者 / 经验分享作者"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            人设简介 *
                          </label>
                          <textarea
                            rows={3}
                            required
                            value={formData.bio}
                            onChange={(e) => handleChange('bio', e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            placeholder="一句话说明这个账号主要关注什么、擅长写什么。"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 写作风格 */}
                    <div className="border-b pb-4">
                      <h3 className="font-medium text-gray-900 mb-3">写作风格</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            语气 *
                          </label>
                          <select
                            value={formData.tone}
                            onChange={(e) => handleChange('tone', e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                          >
                            <option value="casual">口语化</option>
                            <option value="professional">专业理性</option>
                            <option value="emotional">情绪表达</option>
                            <option value="sharp">直接犀利</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            风格描述 *
                          </label>
                          <textarea
                            rows={4}
                            required
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            placeholder="例如：先给结论，再拆原因，语言克制但有观点，避免空话。"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            这是最关键字段之一，直接影响 AI 输出风格。
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            常写角度
                          </label>
                          <input
                            type="text"
                            value={formData.contentAngles}
                            onChange={(e) => handleChange('contentAngles', e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            placeholder="例如：社会观察, 热点解读, 普通人视角"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            用逗号分隔。它决定这个账号更常从什么切口写内容。
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              开头方式
                            </label>
                            <input
                              type="text"
                              value={formData.openingStyle}
                              onChange={(e) => handleChange('openingStyle', e.target.value)}
                              className="mt-1 w-full border border-gray-300 rounded-md p-2"
                              placeholder="例如：先抛结论 / 先抛冲突"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              结尾方式
                            </label>
                            <input
                              type="text"
                              value={formData.endingStyle}
                              onChange={(e) => handleChange('endingStyle', e.target.value)}
                              className="mt-1 w-full border border-gray-300 rounded-md p-2"
                              placeholder="例如：总结观点 / 提建议"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 读者与约束 */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">读者与约束</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            目标读者
                          </label>
                          <input
                            type="text"
                            value={formData.audience}
                            onChange={(e) => handleChange('audience', e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            placeholder="例如：普通大众读者 / 想解决问题的新手"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            关键词
                          </label>
                          <input
                            type="text"
                            value={formData.keywords}
                            onChange={(e) => handleChange('keywords', e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            placeholder="例如：普通人, 趋势, 判断, 方法"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            用逗号分隔。用于强化这个账号的表达辨识度。
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            禁忌词 / 禁忌表达
                          </label>
                          <input
                            type="text"
                            value={formData.tabooWords}
                            onChange={(e) => handleChange('tabooWords', e.target.value)}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            placeholder="例如：绝对, 暴富, 内幕, 保证赚钱"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            用逗号分隔。用于约束 AI，减少平台风险和低质表达。
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700"
                      >
                        保存
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}