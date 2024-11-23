<template>
  <div>
    <el-form :model="form" label-width="80px">
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

    <el-table :data="contacts" border>
      <el-table-column prop="name" label="Name"></el-table-column>
      <el-table-column prop="phone" label="Phone"></el-table-column>
      <el-table-column prop="email" label="Email"></el-table-column>
      <el-table-column prop="social" label="Social"></el-table-column>
      <el-table-column prop="address" label="Address"></el-table-column>
      <el-table-column label="Actions">
        <template #default="scope">
          <el-button type="danger" @click="deleteContact(scope.$index)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>


<script>
import axios from 'axios';

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
    };
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
    resetForm() {
      this.form = {
        name: '',
        phone: '',
        email: '',
        social: '',
        address: '',
      };
    },
  },
  mounted() {
    this.fetchContacts();
  },
};
</script>
