# PS99 Database 🗃️

**PS99 Database** is a Node.js application that fetches data from an external API and stores it in a MySQL database. This project is built to handle pet data, item categories, and related attributes for a game.

Made by **[aaronmansfield5](https://github.com/aaronmansfield5)** 👨‍💻

## Features ✨
- Fetches collections and items data from the API.
- Stores or updates item information in a MySQL database.
- Tracks item properties like RAP (Roblox Asset Price), amount available, and more.

## Prerequisites ⚙️
Before running the project, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher) 🔨
- [MySQL](https://www.mysql.com/) with a configured database 💾
- [TypeScript](https://www.typescriptlang.org/) for type-checking 🔍

## Setup 🛠️

### 1. Clone the repository

```bash
git clone https://github.com/aaronmansfield5/PS99-Database.git
cd PS99-Database
```

### 2. Install dependencies
Run the following command to install the required dependencies:
```bash
npm install
```

### 3. Configure your MySQL Database 🏗️
Ensure your MySQL database is running, and create the ps99_rap database.

Run the following SQL queries to set up the necessary tables:
```sql
CREATE DATABASE ps99_rap;

USE ps99_rap;

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL
);

CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rap INT,
    previous_rap INT,
    last_modified INT,
    category_id INT,
    titanic BOOLEAN,
    huge BOOLEAN,
    exclusive BOOLEAN,
    amount_exists INT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### 4. Configure API headers 📝
In the app.ts file, modify the HEADERS constant as needed to match your API setup.

### 5. TypeScript Compilation & Running 🚀
To compile the TypeScript code and run the application, use the following NPM command:
```bash
npm start
```
This command will:
- Compile the app.ts file into JavaScript.
- Run the compiled app.js file using Node.js.

### 6. Check the Database 📊
Once the script finishes running, you can inspect your MySQL database to see the newly inserted/updated item data in the items table.

## Scripts 🖥️
**start**: This script compiles TypeScript files and then runs the resulting JavaScript files.
```bash
"start": "tsc app.ts && node app.js"
```

## Dependencies 📦
- **axios**: A promise-based HTTP client for making API requests.
- **mysql2**: MySQL client for Node.js to interact with the MySQL database.
- **fs**: File system module used for reading and writing files.
- **typescript**: A superset of JavaScript that compiles to clean JavaScript code.
- **@types/node**: TypeScript type definitions for Node.js.

## Development 🧑‍💻
For any updates or features, fork the repository, create a new branch, and submit a pull request.

### License 📄
This project is licensed under the MIT License.