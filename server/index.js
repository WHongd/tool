// 文件作用：后端服务入口，提供人设、文章、收藏接口
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const knex = require('knex');
const knexConfig = require('./knexfile');
const app = express();
const db = knex(knexConfig.development);
app.use(cors());
app.use(express.json());

// ai接口调用
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages = [] } = req.body || {};

    // 只提取最后一个 user 内容，避免把前端那套超长 JSON 指令再喂给模型
    const lastUserMessage = Array.isArray(messages)
      ? [...messages].reverse().find((m) => m?.role === 'user' && typeof m?.content === 'string')
      : null;

    const rawText = String(lastUserMessage?.content || '').trim();

    // 从前端传来的长 prompt 里尽量提取主题
    let topic = rawText;

    const topicMatch =
      rawText.match(/topic[：:]\s*["“]?(.+?)["”]?(?:\n|$)/i) ||
      rawText.match(/主题[：:]\s*(.+?)(?:\n|$)/);

    if (topicMatch?.[1]) {
      topic = topicMatch[1].trim();
    }

    if (!topic) {
      topic = '请生成3个标题方案';
    }

    const prompt = `
你是标题助手。
只返回严格 JSON，不要解释，不要 markdown。
格式固定：
{
  "titles": ["标题1", "标题2", "标题3"],
  "bestIndex": 0,
  "reason": "一句话说明为什么最佳"
}

要求：
1. 只返回 3 个标题
2. 标题尽量短
3. bestIndex 只能是 0、1、2
4. reason 只写一句话
5. 不要返回 platform、audience、score、comment、weakness、suggestion、rewrittenTitle

主题：${topic}
`.trim();

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你只返回极短 JSON。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 260,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || 'DeepSeek 请求失败');
    }

    let text = data?.choices?.[0]?.message?.content || '';
    text = String(text)
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    if (!text) {
      throw new Error('模型返回为空');
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        parsed = JSON.parse(text.slice(start, end + 1));
      } else {
        throw new Error('模型返回不是有效 JSON');
      }
    }

    const titles = Array.isArray(parsed?.titles)
      ? parsed.titles.map((t) => String(t || '').trim()).filter(Boolean).slice(0, 3)
      : [];

    while (titles.length < 3) {
      titles.push(`标题建议${titles.length + 1}`);
    }

    let bestIndex = Number(parsed?.bestIndex);
    if (![0, 1, 2].includes(bestIndex)) {
      bestIndex = 0;
    }

    const reason = String(parsed?.reason || '').trim();

    return res.json({
      candidates: titles.map((title, index) => ({
        title,
        score: 90 - index * 3,
      })),
      bestTitle: {
        title: titles[bestIndex] || titles[0],
        reason: reason || '这是当前最优标题方案',
      },
    });
  } catch (err) {
    console.error('AI调用失败:', err);
    return res.json({
      candidates: [
        { title: '普通人也能写出高点击标题的3个方法', score: 88 },
        { title: '为什么你的标题没人点开？问题在这里', score: 85 },
        { title: '高点击标题最容易忽略的一个细节', score: 82 },
      ],
      bestTitle: {
        title: '高点击标题的3个关键写法',
        reason: '服务端异常兜底',
      },
    });
  }
});

//后端新增接口
app.post('/api/ai/analyze-title', async (req, res) => {
  try {
    const { title = '', topic = '' } = req.body || {};

    const prompt = `
你是内容优化专家。
请分析标题并返回结果。

严格按格式输出（不能加解释）：

评分：xx
优点：一句话
问题：一句话
优化标题：xxxx
大纲：
1. xxxx
2. xxxx
3. xxxx

标题：${title}
主题：${topic}
`.trim();

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是标题优化专家。严格按格式输出。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    const data = await response.json();
    console.log('分析返回：', JSON.stringify(data, null, 2));

    let text = data?.choices?.[0]?.message?.content || '';
    text = String(text)
      .replace(/^```[\w-]*\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    if (!text) throw new Error('模型返回为空');

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    const get = (prefix) => {
      const line = lines.find(l => l.startsWith(prefix));
      return line ? line.slice(prefix.length).trim() : '';
    };

    const outline = lines
      .filter(l => /^\d+\./.test(l))
      .map(l => l.replace(/^\d+\.\s*/, ''));

    return res.json({
      score: get('评分：') || '80',
      strengths: get('优点：'),
      weaknesses: get('问题：'),
      optimizedTitle: get('优化标题：'),
      outline,
    });

  } catch (err) {
    console.error('分析失败:', err);
    return res.json({
      score: '80',
      strengths: '结构清晰',
      weaknesses: '吸引力不足',
      optimizedTitle: '优化后的标题示例',
      outline: ['开头引入', '核心分析', '总结升华'],
    });
  }
});

// 安全解析 JSON
function safeParseJson(value, fallback = null) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

// =================== 初始化数据库 ===================
async function initDatabase() {
  const hasPersonasTable = await db.schema.hasTable('personas');
  if (!hasPersonasTable) {
    await db.schema.createTable('personas', (table) => {
      table.string('id').primary();
      table.string('name');
      table.integer('age');
      table.string('occupation');
      table.string('platform');
      table.text('avatar');
      table.text('bio');
      table.text('writingStyle');
      table.string('contentPreference');
      table.timestamp('createdAt').defaultTo(db.fn.now());
      table.timestamp('updatedAt').defaultTo(db.fn.now());
    });
    console.log('✅ 表 personas 创建成功');
  }

  const hasArticlesTable = await db.schema.hasTable('articles');
  if (!hasArticlesTable) {
    await db.schema.createTable('articles', (table) => {
      table.string('id').primary();
      table.string('title').notNullable();
      table.text('content').notNullable();
      table.string('personaId').notNullable();
      table.string('platform').notNullable();
      table.string('aiProvider');
      table.string('status').defaultTo('draft');
      table.timestamp('publishedAt');
      table.text('aiScore');
      table.text('engagementMetrics');
      table.timestamp('createdAt');
      table.timestamp('updatedAt');
    });
    console.log('✅ 表 articles 创建成功');
  } else {
    // 旧库字段补齐
    const articleColumns = [
      ['aiProvider', (table) => table.string('aiProvider')],
      ['publishedAt', (table) => table.timestamp('publishedAt')],
      ['status', (table) => table.string('status').defaultTo('draft')],
      ['aiScore', (table) => table.text('aiScore')],
      ['engagementMetrics', (table) => table.text('engagementMetrics')],
    ];

    for (const [columnName, addColumn] of articleColumns) {
      const hasColumn = await db.schema.hasColumn('articles', columnName);
      if (!hasColumn) {
        await db.schema.table('articles', (table) => {
          addColumn(table);
        });
        console.log(`✅ 已补齐 articles.${columnName} 字段`);
      }
    }
  }

  const hasFavoritesTable = await db.schema.hasTable('favorites');
  if (!hasFavoritesTable) {
    await db.schema.createTable('favorites', (table) => {
      table.increments('id');
      table.string('articleId').notNullable();
      table.timestamp('createdAt').defaultTo(db.fn.now());
    });
    console.log('✅ 表 favorites 创建成功');
  } else {
    const hasCreatedAt = await db.schema.hasColumn('favorites', 'createdAt');
    if (!hasCreatedAt) {
      await db.schema.table('favorites', (table) => {
        table.timestamp('createdAt').defaultTo(db.fn.now());
      });
      console.log('✅ 已补齐 favorites.createdAt 字段');
    }
  }

  // 清理 favorites 中指向不存在文章的孤儿收藏
  const orphanFavorites = await db('favorites as f')
    .leftJoin('articles as a', 'f.articleId', 'a.id')
    .whereNull('a.id')
    .select('f.id');

  if (orphanFavorites.length > 0) {
    const orphanIds = orphanFavorites.map((item) => item.id);
    await db('favorites').whereIn('id', orphanIds).del();
    console.log(`✅ 已清理 ${orphanIds.length} 条孤儿收藏记录`);
  }

  // 防止重复收藏
  try {
    await db.raw(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_articleId_unique ON favorites(articleId)'
    );
    console.log('✅ favorites.articleId 唯一索引已就绪');
  } catch (err) {
    console.error('创建 favorites.articleId 唯一索引失败:', err.message);
  }
}

initDatabase().catch((err) => console.error('数据库初始化失败:', err));

// =================== 人设接口 ===================
app.get('/api/personas', async (req, res) => {
  try {
    const personas = await db('personas').select('*').orderBy('createdAt', 'desc');
    res.json(
      personas.map((p) => ({
        ...p,
        writingStyle: safeParseJson(p.writingStyle, {}),
      })),
    );
  } catch (err) {
    console.error('获取人设失败:', err);
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/personas', async (req, res) => {
  try {
    const {
      id,
      name,
      age,
      occupation,
      platform,
      avatar,
      bio,
      writingStyle,
      contentPreference,
    } = req.body;

    if (!id) return res.status(400).json({ error: '缺少 id 字段' });

    const newPersona = {
      id,
      name: name || '',
      age: age || 0,
      occupation: occupation || '',
      platform: platform || 'toutiao',
      avatar: avatar || null,
      bio: bio || '',
      writingStyle: JSON.stringify(writingStyle || {}),
      contentPreference: contentPreference || 'mixed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db('personas').insert(newPersona);
    res.status(201).json({
      ...newPersona,
      writingStyle: writingStyle || {},
    });
  } catch (err) {
    console.error('创建人设失败:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/personas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    if (updates.writingStyle) {
      updates.writingStyle = JSON.stringify(updates.writingStyle);
    }

    await db('personas').where({ id }).update(updates);

    const updated = await db('personas').where({ id }).first();
    if (!updated) {
      return res.status(404).json({ error: '人设不存在' });
    }

    res.json({
      ...updated,
      writingStyle: safeParseJson(updated.writingStyle, {}),
    });
  } catch (err) {
    console.error('更新人设失败:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/personas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db('personas').where({ id }).del();
    res.status(204).send();
  } catch (err) {
    console.error('删除人设失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// =================== 文章接口 ===================
app.get('/api/articles', async (req, res) => {
  try {
    let query = db('articles').select('*');

    if (req.query.personaId) query = query.where('personaId', req.query.personaId);
    if (req.query.platform) query = query.where('platform', req.query.platform);
    if (req.query.status) query = query.where('status', req.query.status);

    const articles = await query.orderBy('createdAt', 'desc');

    res.json(
      articles.map((a) => ({
        ...a,
        aiScore: safeParseJson(a.aiScore, null),
        engagementMetrics: safeParseJson(a.engagementMetrics, {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
        }),
      })),
    );
  } catch (err) {
    console.error('获取文章列表失败:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/articles', async (req, res) => {
  try {
    const article = req.body;

    const newArticle = {
      id: article.id,
      title: article.title || '',
      content: article.content || '',
      personaId: article.personaId || '1',
      platform: article.platform || 'toutiao',
      aiProvider: article.aiProvider || null,
      status: article.status || 'draft',
      publishedAt: article.publishedAt || null,
      aiScore: article.aiScore ? JSON.stringify(article.aiScore) : null,
      engagementMetrics: article.engagementMetrics
        ? JSON.stringify(article.engagementMetrics)
        : JSON.stringify({ views: 0, likes: 0, comments: 0, shares: 0 }),
      createdAt: article.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db('articles').insert(newArticle);

    res.status(201).json({
      ...newArticle,
      aiScore: article.aiScore || null,
      engagementMetrics: article.engagementMetrics || {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      },
    });
  } catch (err) {
    console.error('发布文章失败:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db('favorites').where({ articleId: id }).del();
    await db('articles').where({ id }).del();
    res.status(204).send();
  } catch (err) {
    console.error('删除文章失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// =================== 收藏夹接口 ===================

// 获取收藏列表：返回完整文章对象数组
app.get('/api/favorites', async (req, res) => {
  try {
    const rows = await db('favorites as f')
      .join('articles as a', 'f.articleId', 'a.id')
      .select('a.*', 'f.createdAt as favoritedAt')
      .orderBy('f.createdAt', 'desc');

    const result = rows.map((item) => ({
      ...item,
      aiScore: safeParseJson(item.aiScore, null),
      engagementMetrics: safeParseJson(item.engagementMetrics, {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      }),
    }));

    res.json(result);
  } catch (err) {
    console.error('获取收藏列表失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 添加收藏：文章不存在时自动补建草稿
app.post('/api/favorites/:articleId', async (req, res) => {
  const { articleId } = req.params;
  const { article } = req.body || {};

  if (!articleId) {
    return res.status(400).json({ error: '缺少 articleId' });
  }

  try {
    let existingArticle = await db('articles').where({ id: articleId }).first();

    if (!existingArticle) {
      if (!article || !article.title || !article.content) {
        return res.status(404).json({ error: '文章不存在，且缺少补建文章所需数据' });
      }

      const newArticle = {
        id: article.id,
        title: article.title,
        content: article.content,
        personaId: article.personaId || '1',
        platform: article.platform || 'toutiao',
        aiProvider: article.aiProvider || null,
        status: article.status || 'draft',
        publishedAt: article.publishedAt || null,
        aiScore: article.aiScore ? JSON.stringify(article.aiScore) : null,
        engagementMetrics: article.engagementMetrics
          ? JSON.stringify(article.engagementMetrics)
          : JSON.stringify({ views: 0, likes: 0, comments: 0, shares: 0 }),
        createdAt: article.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db('articles').insert(newArticle);
      existingArticle = newArticle;
    }

    const existingFavorite = await db('favorites').where({ articleId }).first();
    if (existingFavorite) {
      return res.status(409).json({ error: '已经收藏过这篇文章' });
    }

    await db('favorites').insert({
      articleId,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, articleId });
  } catch (err) {
    console.error('添加收藏失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 取消收藏
app.delete('/api/favorites/:articleId', async (req, res) => {
  const { articleId } = req.params;

  try {
    const deletedCount = await db('favorites').where({ articleId }).del();

    if (deletedCount === 0) {
      return res.status(404).json({ error: '收藏记录不存在' });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('取消收藏失败:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('=== 新版收藏系统后端已启动 ===');
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('当前文件:', __filename);
});