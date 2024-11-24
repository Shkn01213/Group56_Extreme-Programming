<template>
  <div>
    <!-- 导入按钮 -->
    <el-upload
      class="upload-demo"
      drag
      action=""
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
    <el-form :model="form" label-width="80px" class="mb-4 add-contact-form">
      <el-form-item label="Name" :required="true">
        <el-input v-model="form.name" placeholder="Enter name"></el-input>
      </el-form-item>
      <el-form-item label="Phone" :required="true">
        <el-input v-model="form.phone" placeholder="Enter phone"></el-input>
      </el-form-item>
      <el-form-item label="Email" :required="true">
        <el-input v-model="form.email" placeholder="Enter email"></el-input>
      </el-form-item>
      <el-form-item label="Social">
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

      <!-- 其他列 -->
      <el-table-column prop="name" label="Name"></el-table-column>
      <el-table-column prop="phone" label="Phone"></el-table-column>
      <el-table-column prop="email" label="Email"></el-table-column>
      <el-table-column prop="social" label="Social"></el-table-column>
      <el-table-column prop="address" label="Address"></el-table-column>
      <el-table-column label="Actions">
        <template #default="scope">
          <el-button type="primary" @click="editContact(scope.row.id)">Edit</el-button>
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
      contacts: [], // 确保 contacts 被正确初始化为数组
      searchQuery: "",
      showFavoritesOnly: false,
    };
  },
  computed: {
    filteredContacts() {
      let filtered = this.contacts || []; // 确保 contacts 始终为数组

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
          is_favorite: contact.is_favorite || 0, // 确保 is_favorite 字段存在
        }));
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
        this.$message.error("Failed to fetch contacts.");
      }
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
    async handleFileChange(file) {
      if (!file.raw) {
        console.error("No raw file data found.");
        this.$message.error("Invalid file format.");
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const workbook = XLSX.read(arrayBuffer, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const contacts = data.slice(1).map((row) => ({
            name: row[0] || "",
            phone: row[1] || "",
            email: row[2] || "",
            social: row[3] || "",
            address: row[4] || "",
          }));

          await axios.post("http://localhost:3000/api/contacts/import", { contacts });
          this.fetchContacts();
          this.$message.success("Contacts imported successfully!");
        } catch (error) {
          console.error("Error processing file:", error);
          this.$message.error("Failed to import contacts.");
        }
      };

      reader.readAsArrayBuffer(file.raw);
    },
    exportContacts() {
      try {
        const ws = XLSX.utils.json_to_sheet(this.contacts);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Contacts");
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(
          new Blob([wbout], { type: "application/octet-stream" }),
          "contacts.xlsx"
        );
        this.$message.success("Contacts exported successfully!");
      } catch (error) {
        console.error("Failed to export contacts:", error);
        this.$message.error("Failed to export contacts.");
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
