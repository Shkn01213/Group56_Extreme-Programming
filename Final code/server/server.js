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
  host: 'localhost',          
  user: 'root',                
  password: '123456',   
  database: 'contacts_db',     
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
  const isValid = contacts.every(contact =>
    typeof contact.name === 'string' &&
    typeof contact.phone === 'string' &&
    typeof contact.email === 'string'
  );

  if (!isValid) {
    return res.status(400).send('Invalid contact data');
  }
  const query = 'INSERT INTO contacts (name, phone, email, social, address, is_favorite) VALUES ?';
  const values = contacts.map((contact) => [
    contact.name,
    contact.phone,
    contact.email,
    contact.social,
    contact.address,
    contact.is_favorite !== undefined ? contact.is_favorite : 0
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

// 更新联系人收藏状态
app.put('/api/contacts/:id/favorite', (req, res) => {
  const id = parseInt(req.params.id);
  const { is_favorite } = req.body; // 传入新的收藏状态
  const query = 'UPDATE contacts SET is_favorite = ? WHERE id = ?';

  db.query(query, [is_favorite, id], (err) => {
    if (err) {
      res.status(500).send('Failed to update favorite status');
    } else {
      res.send('Favorite status updated');
    }
  });
});
// app.get('/api/contacts', (req, res) => {
//   db.query('SELECT * FROM contacts', (err, results) => {
//     if (err) {
//       res.status(500).send('Failed to fetch contacts');
//     } else {
//       res.json(results); // 返回所有联系人，包括 is_favorite 字段
//     }
//   });
// });
app.post('/api/contacts/:id/phones', (req, res) => {
  const contactId = parseInt(req.params.id);
  const { phone, type } = req.body;

  const query = 'INSERT INTO phone_numbers (contact_id, phone, type) VALUES (?, ?, ?)';
  db.query(query, [contactId, phone, type], (err) => {
    if (err) {
      return res.status(500).send('Failed to add phone number');
    }
    res.status(201).send('Phone number added');
  });
});
app.delete('/api/contacts/:id/phones/:phoneId', (req, res) => {
  const phoneId = parseInt(req.params.phoneId);

  const query = 'DELETE FROM phone_numbers WHERE id = ?';
  db.query(query, [phoneId], (err) => {
    if (err) {
      return res.status(500).send('Failed to delete phone number');
    }
    res.send('Phone number deleted');
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});