<template>
  <div>
    <!-- 导入按钮 --> 
    <el-upload
    class="upload-demo"
    drag
      action=""
      :auto-upload="false"
      :show-file-list="false"
      accept=".xlsx, .xls"
      @change="handleFileChange"
    >
      <div
        style="padding: 20px; border: 2px dashed #409eff; border-radius: 4px; text-align: center;"
      >
        <p>Drag and drop your Excel file here</p>
        <el-button size="small" type="primary">Or Click to Import Contacts</el-button>
      </div>
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
    <el-switch
      v-model="showFavoritesOnly"
      active-text="Show Favorites Only"
      inactive-text="Show All"
      class="mb-5"
    ></el-switch>
    <!-- 添加联系人表单 -->
    <el-form :model="form" label-width="auto" class="mb-4 add-contact-form" >
      <el-form-item label="Name" :required="true">
        <el-input v-model="form.name" placeholder="Enter name"></el-input>
      </el-form-item>
      <el-form-item label="Phone" :required="true">
        <el-input v-model="form.phone" placeholder="Enter phone"></el-input>
      </el-form-item>
      <el-form-item label="Email" :required="true">
        <el-input v-model="form.email" placeholder="Enter email"></el-input>
      </el-form-item>
      <el-form-item label="Social media handles">
        <el-input v-model="form.social" placeholder="Enter social"></el-input>
      </el-form-item>
      <el-form-item label="Address">
        <el-input v-model="form.address" placeholder="Enter address"></el-input>
      </el-form-item>
      <el-button type="primary" @click="addContact">Add Contact</el-button>
    </el-form>
    <!-- 联系人列表 -->
    <el-table :data="filteredContacts" border>
      <!-- 收藏列 -->
      <el-table-column label="Favorite">
        <template #default="scope">
          <el-switch
            v-model="scope.row.is_favorite"
            :active-value="1"
            :inactive-value="0"
            @change="updateFavorite(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <!-- 编辑列：名称 -->
      <el-table-column prop="name" label="Name">
        <template #default="scope">
          <el-input
  v-if="editingRow === scope.row.id"
  v-model="scope.row.name"
></el-input>

          <span v-else>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
  <!-- 编辑列：电话号码 -->
  <el-table-column prop="phone" label="Phone">
  <template #default="scope">
    <el-input
  v-if="editingRow === scope.row.id"
  v-model="scope.row.phone"
></el-input>
    <span v-else style="white-space: pre-wrap;">{{ scope.row.phone.replace(/。/g, '\n') }}</span>
  </template>
</el-table-column>
<el-table-column prop="email" label="Email">
  <template #default="scope">
    <el-input
  v-if="editingRow === scope.row.id"
  v-model="scope.row.email"
></el-input>
    <span v-else style="white-space: pre-wrap;">{{ scope.row.email.replace(/。/g, '\n') }}</span>
  </template>
</el-table-column>
<el-table-column prop="social" label="Social media handles">
  <template #default="scope">
    <el-input
  v-if="editingRow === scope.row.id"
  v-model="scope.row.social"
></el-input>
    <span v-else style="white-space: pre-wrap;">{{ scope.row.social.replace(/。/g, '\n') }}</span>
  </template>
</el-table-column>
<el-table-column prop="address" label="Address">
  <template #default="scope">
    <el-input
  v-if="editingRow === scope.row.id"
  v-model="scope.row.address"
></el-input>
    <span v-else style="white-space: pre-wrap;">{{ scope.row.address.replace(/。/g, '\n') }}</span>
  </template>
</el-table-column>

  <!-- 操作列 -->
  <el-table-column label="Actions">
    <template #default="scope">
      <el-button
        v-if="editingRow !== scope.row.id"
        type="primary"
        @click="startEditing(scope.row.id)"
      >
        Edit
      </el-button>
      <el-button
        v-else
        type="success"
        @click="stopEditing"
      >
        Done
      </el-button>
      <el-button type="danger" @click="deleteContact(scope.row.id)">Delete</el-button>
    </template>
  </el-table-column>
</el-table>
  </div>
</template>
<script>
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default {
  data() {
    return {
      form: {
        name: "",
        phone: "",
        email: "",
        social: "",
        address: "",
      },
      contacts: [], 
      searchQuery: "",
      showFavoritesOnly: false,
      editingRow: null, // 当前正在编辑的行
    };
  },
  computed: {
    filteredContacts() {
      let filtered = this.contacts || [];
      if (this.showFavoritesOnly) {
        filtered = filtered.filter((contact) => contact.is_favorite === 1);
      }
      if (this.searchQuery.trim() !== "") {
        filtered = filtered.filter((contact) =>
          contact.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      return filtered;
    },
  },
  methods: {
    async fetchContacts() {
      try {
        const res = await axios.get("http://localhost:3000/api/contacts");
        this.contacts = res.data.map((contact) => ({
          ...contact,
          is_favorite: contact.is_favorite || 0,
        }));
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
        this.$message.error("Failed to fetch contacts.");
      }
    },
    
    startEditing(rowId) {
      this.editingRow = rowId;
    },
    stopEditing() {
      this.editingRow = null;
    },
    formatText(text) {
      // 格式化文本，将换行符正确显示为多行
      return text ? text.replace(/\n/g, '\n') : '';
    },

    async saveContact(contact) {
    const fieldsToFormat = ['phone', 'email', 'social', 'address'];
    fieldsToFormat.forEach((field) => {
      if (contact[field]) {
        contact[field] = contact[field].replace(/。/g, '|');
      }
    });

    try {
      await axios.put(`http://localhost:3000/api/contacts/${contact.id}`, contact);
      this.$message.success("Contact updated successfully!");
      this.stopEditing();
    } catch (error) {
      console.error("Failed to save contact:", error);
      this.$message.error("Failed to save contact.");
    }
  },
    async addContact() {
      if (!this.form.name || !this.form.phone || !this.form.email) {
        this.$message.error("Please fill out all required fields.");
        return;
      }

      try {
        await axios.post("http://localhost:3000/api/contacts", this.form);
        this.fetchContacts();
        this.resetForm();
        this.$message.success("Contact added successfully!");
      } catch (error) {
        console.error("Failed to add contact:", error);
        this.$message.error("Failed to add contact.");
      }
    },
    async deleteContact(id) {
      try {
        await axios.delete(`http://localhost:3000/api/contacts/${id}`);
        this.fetchContacts();
        this.$message.success("Contact deleted successfully!");
      } catch (error) {
        console.error("Failed to delete contact:", error);
        this.$message.error("Failed to delete contact.");
      }
    },
    resetForm() {
      this.form = {
        name: "",
        phone: "",
        email: "",
        social: "",
        address: "",
      };
    },
    exportContacts() {
      const ws = XLSX.utils.json_to_sheet(this.contacts);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Contacts");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([wbout], { type: "application/octet-stream" }),
        "contacts.xlsx"
      );
      this.$message.success("Contacts exported successfully!");
    },
    async handleFileChange(file) {
      if (!file.raw || file.raw.processed) return; // 如果文件已经处理过则跳过
  file.raw.processed = true; // 标记为已处理
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const contacts = data.slice(1).map((row) => ({
          name: row[0] || "",
          phone: row[1] || "",
          email: row[2] || "",
          social : row[3] || "",
          address: row[4] || "",
          is_favorite: row[5] === 1 ? 1 : 0,
        }));
        await axios.post("http://localhost:3000/api/contacts/import", { contacts });
        this.fetchContacts();
        this.$message.success("Contacts imported successfully!");
      };
      reader.readAsArrayBuffer(file.raw);
    },
    async updateFavorite(contact) {
  try {
    await axios.put(`http://localhost:3000/api/contacts/${contact.id}/favorite`, {
      is_favorite: contact.is_favorite,
    });
    this.$message.success(`Contact ${contact.name} favorite status updated!`);
  } catch (error) {
    console.error("Failed to update favorite status:", error);
    this.$message.error("Failed to update favorite status.");
  }
}
  },
  mounted() {
    this.fetchContacts();
  },
};
</script>
<style scoped>
.add-contact-form {
  margin-bottom: 30px;
  background-color: #f9f9f9;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>
