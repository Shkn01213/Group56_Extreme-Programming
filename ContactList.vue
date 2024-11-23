<template>
  <div>

    <!-- 导入按钮 -->
    <el-upload
      class="upload-demo"
      drag
      action=""
      @change="handleFileChange"
      accept=".xlsx, .xls"
      :show-file-list="false"
    >
      <el-button size="small" type="primary">Import Contacts</el-button>
    </el-upload>

    <!-- 导出按钮 -->
    <el-button size="small" type="primary" @click="exportContacts">
      Export Contacts
    </el-button>

    <!-- 搜索框 -->
    <el-input
      v-model="searchQuery"
      placeholder="Search by name"
      prefix-icon="el-icon-search"
      class="mb-5"  
    ></el-input>

    <!-- 添加联系人表单 -->
    <el-form :model="form" label-width="80px" class="mb-4"> <!-- 也可以给 el-form 添加 margin-bottom -->
      <el-form-item label="Name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="Phone">
        <el-input v-model="form.phone"></el-input>
      </el-form-item>
      <el-form-item label="Email">
        <el-input v-model="form.email"></el-input>
      </el-form-item>
      <el-form-item label="Social">
        <el-input v-model="form.social"></el-input>
      </el-form-item>
      <el-form-item label="Address">
        <el-input v-model="form.address"></el-input>
      </el-form-item>
      <el-button type="primary" @click="addContact">Add Contact</el-button>
    </el-form>

    <!-- 其他部分 -->
    <el-table :data="filteredContacts" border>
      <el-table-column prop="name" label="Name"></el-table-column>
      <el-table-column prop="phone" label="Phone"></el-table-column>
      <el-table-column prop="email" label="Email"></el-table-column>
      <el-table-column prop="social" label="Social"></el-table-column>
      <el-table-column prop="address" label="Address"></el-table-column>
      <el-table-column label="Actions">
        <template #default="scope">
          <el-button type="primary" @click="editContact(scope.$index)">Edit</el-button>
          <el-button type="danger" @click="deleteContact(scope.$index)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>



<script>
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default {
  data() {
    return {
      form: {
        name: '',
        phone: '',
        email: '',
        social: '',
        address: '',
      },
      contacts: [],
      searchQuery: '', // 搜索框内容
    };
  },
  computed: {
    filteredContacts() {
      return this.contacts.filter((contact) =>
        contact.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    async fetchContacts() {
      const res = await axios.get('http://localhost:3000/api/contacts');
      this.contacts = res.data;
    },
    async addContact() {
      await axios.post('http://localhost:3000/api/contacts', this.form);
      this.fetchContacts();
      this.resetForm();
    },
    async deleteContact(index) {
      await axios.delete(`http://localhost:3000/api/contacts/${index}`);
      this.fetchContacts();
    },
    editContact(index) {
      // 编辑联系人
      this.editIndex = index;
      this.editForm = { ...this.contacts[index] };
      this.editDialogVisible = true;
    },
    async updateContact() {
      // 更新联系人信息
      await axios.put(`http://localhost:3000/api/contacts/${this.editIndex}`, this.editForm);
      this.fetchContacts();
      this.editDialogVisible = false;
    },
    resetForm() {
      this.form = {
        name: '',
        phone: '',
        email: '',
        social: '',
        address: '',
      };
    },

    // 导入功能
    handleFileChange(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const ab = e.target.result;
        const wb = XLSX.read(ab, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // 处理导入的数据
        const contacts = data.slice(1).map((row) => ({
          name: row[0],
          phone: row[1],
          email: row[2],
          social: row[3],
          address: row[4],
        }));

        this.contacts = contacts;
      };
      reader.readAsArrayBuffer(file.raw);
    },

    // 导出功能
    exportContacts() {
      const ws = XLSX.utils.json_to_sheet(this.contacts);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Contacts');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'contacts.xlsx');
    },
  },
  mounted() {
    this.fetchContacts();
  },
};
</script>

<style scoped>
.search-input {
  margin-bottom: 20px;
}

.add-contact-form {
  margin-bottom: 30px;
}
</style>
