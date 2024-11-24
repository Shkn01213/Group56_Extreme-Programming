# Contact Management System

This is a simple contact management system built using Vue.js for the frontend and Node.js with Express.js for the backend. It supports managing contacts, including importing/exporting data, editing, adding, and deleting contacts. The contacts are stored in a MySQL database.

## Features

- **View Contacts**: List all contacts in a tabular format.
- **Search**: Search contacts by name.
- **Add Contacts**: Add new contacts with fields like name, phone, email, social media handles, and address.
- **Edit Contacts**: Inline editing for updating contact details.
- **Delete Contacts**: Remove a contact from the database.
- **Import Contacts**: Upload contacts from an Excel file.
- **Export Contacts**: Download all contacts as an Excel file.
- **Mark Favorites**: Toggle favorite status for contacts.
- **Filter by Favorites**: View only favorite contacts.

## Tech Stack

- **Frontend**: Vue.js, Element UI, Axios
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **File Handling**: XLSX for Excel file operations, FileSaver.js for exporting.

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- MySQL database set up
- Vue CLI installed globally (`npm install -g @vue/cli`)

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/contact-management.git
   cd contact-management/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the database:
  - Make sure MySQL is running.
  - Create a database named `contacts_db`.
  - Update the MySQL configuration in the code (default: `host: 'localhost', user: 'root', password: '123456', database: 'contacts_db'`).

## API Endpoints
### Contacts
- `GET /api/contacts`: Fetch all contacts.
- `POST /api/contacts`: Add a new contact.
- `PUT /api/contacts/:id`: Update a contact's details.
- `DELETE /api/contacts/:id`: Delete a contact.
- `POST /api/contacts/import`: Import contacts from an Excel file.
- `GET /api/contacts/export`: Export all contacts as an Excel file.
- `PUT /api/contacts/:id/favorite`: Update the favorite status of a contact.

### Database Schema
```sql
CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(255),
  email VARCHAR(255),
  social VARCHAR(255),
  address TEXT,
  is_favorite TINYINT(1) DEFAULT 0
);
```

## Usage
### Import Contacts
1. Click the Import Contacts button and upload an Excel file.
2. The file should have the following columns:
- Name
- Phone
- Email
- Social Media Handles
- Address
- Favorite (1 for favorite, 0 for not)

### Export Contacts
Click the Export Contacts button to download all contacts as an Excel file.

### Mark as Favorite
Toggle the favorite switch in the table to mark/unmark a contact as favorite.
