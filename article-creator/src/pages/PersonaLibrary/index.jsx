import { useState, useEffect, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { usePersonaStore } from '../../stores/usePersonaStore';
import PersonaCard from '../../components/business/PersonaCard';
import PersonaFormDrawer from '../../components/business/PersonaFormDrawer';
import clsx from 'clsx';
import { PLATFORMS, PLATFORM_NAMES } from '../../constants/platforms';

export default function PersonaLibrary() {
  const {
    personas,
    activePersonaId,
    setActivePersona,
    deletePersona,
    addPersona,
    updatePersona,
    loadPersonas,
    isLoading,
  } = usePersonaStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);

  const platformValues = ['all', ...PLATFORMS.map((p) => p.value)];

  useEffect(() => {
    loadPersonas();
  }, [loadPersonas]);

  const filteredPersonas = useMemo(() => {
    const list = Array.isArray(personas) ? personas : [];
    const keyword = searchTerm.trim().toLowerCase();

    return list
      .filter((p) => p && p.id != null)
      .filter((p) => {
        const name = (p.name || '').toLowerCase();
        const role = (p.role || p.occupation || '').toLowerCase();
        const bio = (p.bio || '').toLowerCase();
        const audience = (p.audience || '').toLowerCase();

        const keywords = Array.isArray(p.keywords)
          ? p.keywords.join(' ').toLowerCase()
          : '';

        const angles = Array.isArray(p.contentAngles)
          ? p.contentAngles.join(' ').toLowerCase()
          : '';

        const matchesSearch =
          !keyword ||
          name.includes(keyword) ||
          role.includes(keyword) ||
          bio.includes(keyword) ||
          audience.includes(keyword) ||
          keywords.includes(keyword) ||
          angles.includes(keyword);

        const matchesPlatform =
          filterPlatform === 'all' || p.platform === filterPlatform;

        return matchesSearch && matchesPlatform;
      });
  }, [personas, searchTerm, filterPlatform]);

  const handleOpenNew = () => {
    setEditingPersona(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (persona) => {
    setEditingPersona(persona);
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (personaData) => {
    try {
      if (editingPersona) {
        await updatePersona(editingPersona.id, personaData);
      } else {
        await addPersona(personaData);
      }

      setIsDrawerOpen(false);
      setEditingPersona(null);
      await loadPersonas();
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleDelete = async (personaId) => {
    const confirmed = window.confirm('确定删除该人设吗？');
    if (!confirmed) return;

    try {
      await deletePersona(personaId);
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  if (isLoading && filteredPersonas.length === 0) {
    return <div className="p-6 text-center">加载人设中...</div>;
  }

  return (
    <div className="p-6">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">人设库</h1>
          <p className="text-sm text-gray-500 mt-1">
            管理不同平台的内容账号模板，用于驱动 AI 写作风格。
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center space-x-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
        >
          <Plus size={18} />
          <span>新建人设</span>
        </button>
      </div>

      {/* 筛选与搜索 */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {platformValues.map((platform) => (
            <button
              key={platform}
              onClick={() => setFilterPlatform(platform)}
              className={clsx(
                'px-3 py-1 rounded-full text-sm font-medium transition',
                filterPlatform === platform
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {platform === 'all' ? '全部平台' : PLATFORM_NAMES[platform]}
            </button>
          ))}
        </div>

        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="搜索名称、角色定位、简介、关键词..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
          />
        </div>
      </div>

      {/* 列表 */}
      {filteredPersonas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <div className="text-lg font-medium text-gray-800">还没有匹配的人设</div>
          <div className="text-sm text-gray-500 mt-2">
            你可以先新建一个平台型人设，比如“头条｜社会观察者”。
          </div>
          <button
            onClick={handleOpenNew}
            className="mt-5 inline-flex items-center space-x-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
          >
            <Plus size={16} />
            <span>立即新建</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div
            onClick={handleOpenNew}
            className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-8 cursor-pointer hover:border-brand-500 hover:bg-gray-100 transition"
          >
            <Plus size={32} className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 font-medium">创建新人设</p>
          </div>

          {filteredPersonas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              isActive={persona.id === activePersonaId}
              onSetActive={() => setActivePersona(persona.id)}
              onEdit={() => handleEdit(persona)}
              onDelete={() => handleDelete(persona.id)}
            />
          ))}
        </div>
      )}

      {/* 抽屉表单 */}
      <PersonaFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingPersona(null);
        }}
        initialData={editingPersona}
        onSubmit={handleSubmit}
      />
    </div>
  );
}