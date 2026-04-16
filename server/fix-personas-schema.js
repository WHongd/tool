const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// 按你的实际数据库路径修改
const dbPath = path.resolve(__dirname, "./database.sqlite");
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function main() {
  try {
    console.log("开始检查 personas 表结构...");

    const columns = await all(`PRAGMA table_info(personas)`);
    const columnNames = columns.map((item) => item.name);

    if (!columnNames.includes("name")) {
      console.log("缺少 name 字段，开始补充...");
      await run(`ALTER TABLE personas ADD COLUMN name TEXT`);
    } else {
      console.log("name 字段已存在，跳过。");
    }

    if (!columnNames.includes("tags")) {
      console.log("缺少 tags 字段，开始补充...");
      await run(`ALTER TABLE personas ADD COLUMN tags TEXT`);
    } else {
      console.log("tags 字段已存在，跳过。");
    }

    console.log("开始回填 name ...");
    await run(`
      UPDATE personas
      SET name = CASE
        WHEN role IS NOT NULL AND TRIM(role) <> '' THEN role
        ELSE '未命名人设'
      END
      WHERE name IS NULL OR TRIM(name) = ''
    `);

    console.log("开始补齐 updated_at ...");
    await run(`
      UPDATE personas
      SET updated_at = CURRENT_TIMESTAMP
      WHERE updated_at IS NULL OR TRIM(updated_at) = ''
    `);

    console.log("personas 表修复完成。");
  } catch (error) {
    console.error("修复失败：", error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error("关闭数据库失败：", err);
      } else {
        console.log("数据库连接已关闭。");
      }
    });
  }
}

main();