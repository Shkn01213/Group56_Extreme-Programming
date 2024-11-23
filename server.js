const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 创建 MySQL 连接池，直接硬编码数据库配置
const db = mysql.createPool({
  host: 'localhost',           // 替换为您的 MySQL 主机名
  user: 'root',                // 替换为您的 MySQL 用户名
  password: '123456',   // 替换为您的 MySQL 密码
  database: 'contacts_db',     // 替换为您的数据库名称
});

// 测试数据库连接
db.getConnection((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to the MySQL database.');
  }
});

// 获取联系人列表
app.get('/api/contacts', (req, res) => {
  db.query('SELECT * FROM contacts', (err, results) => {
    if (err) {
      res.status(500).send('Failed to fetch contacts');
    } else {
      res.json(results);
    }
  });
});

// 添加联系人
app.post('/api/contacts', (req, res) => {
  const { name, phone, email, social, address } = req.body;
  const query = 'INSERT INTO contacts (name, phone, email, social, address) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [name, phone, email, social, address], (err) => {
    if (err) {
      res.status(500).send('Failed to add contact');
    } else {
      res.status(201).send('Contact added');
    }
  });
});

// 删除联系人
app.delete('/api/contacts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.query('DELETE FROM contacts WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).send('Failed to delete contact');
    } else {
      res.send('Contact deleted');
    }
  });
});

// 更新联系人
app.put('/api/contacts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, phone, email, social, address } = req.body;
  const query = 'UPDATE contacts SET name = ?, phone = ?, email = ?, social = ?, address = ? WHERE id = ?';
  db.query(query, [name, phone, email, social, address, id], (err) => {
    if (err) {
      res.status(500).send('Failed to update contact');
    } else {
      res.send('Contact updated');
    }
  });
});

// 导入联系人
app.post('/api/contacts/import', (req, res) => {
  const contacts = req.body.contacts;

  if (!Array.isArray(contacts)) {
    return res.status(400).send('Invalid contacts format');
  }

  const query = 'INSERT INTO contacts (name, phone, email, social, address) VALUES ?';
  const values = contacts.map((contact) => [
    contact.name,
    contact.phone,
    contact.email,
    contact.social,
    contact.address,
  ]);

  db.query(query, [values], (err) => {
    if (err) {
      res.status(500).send('Failed to import contacts');
    } else {
      res.send('Contacts imported successfully');
    }
  });
});

// 导出联系人
app.get('/api/contacts/export', (req, res) => {
  db.query('SELECT * FROM contacts', (err, results) => {
    if (err) {
      return res.status(500).send('Failed to export contacts');
    }

    // 使用 XLSX 生成 Excel 文件
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

    // 写入文件
    const filePath = path.join(__dirname, 'contacts_export.xlsx');
    XLSX.writeFile(workbook, filePath);

    // 返回文件给客户端
    res.download(filePath, 'contacts.xlsx', (downloadErr) => {
      if (downloadErr) {
        console.error('Failed to send file:', downloadErr);
        res.status(500).send('Failed to send file');
      }

      // 删除服务器上的临时文件
      fs.unlink(filePath, () => {});
    });
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});