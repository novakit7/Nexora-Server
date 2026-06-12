# Nexora Server

A scalable backend for a modern video-sharing platform built with **Node.js**, **Express.js**, **MongoDB**, and **Cloudinary**.

Nexora Server provides a complete REST API ecosystem for user authentication, video management, playlists, subscriptions, tweets, comments, likes, and media uploads. The project follows industry-standard backend architecture and RESTful API design principles.

---

## ✨ Features

### 👤 User Management

* User Registration & Authentication
* JWT Access & Refresh Tokens
* Secure Login & Logout
* Password Management
* Profile Management
* Avatar & Cover Image Upload

### 🎥 Video Management

* Upload Videos
* Update Video Details
* Delete Videos
* Publish / Unpublish Videos
* Video Watch History
* Video Ownership Management

### 📂 Playlist Management

* Create Playlist
* Update Playlist
* Delete Playlist
* Add Videos to Playlist
* Remove Videos from Playlist

### 📝 Tweet System

* Create Tweets
* Update Tweets
* Delete Tweets
* Fetch User Tweets

### 💬 Comment System

* Add Comments
* Update Comments
* Delete Comments
* Retrieve Video Comments

### 🔔 Subscription System

* Subscribe to Channels
* Unsubscribe from Channels
* View Subscribers
* View Subscribed Channels

### ❤️ Like System

* Like Videos
* Like Comments
* Like Tweets
* Remove Likes

### ☁️ Media Management

* Cloudinary Integration
* Avatar Upload
* Cover Image Upload
* Video Upload
* Image Optimization

---

## 🛠️ Tech Stack

| Category       | Technology                  |
| -------------- | --------------------------- |
| Runtime        | Node.js                     |
| Framework      | Express.js                  |
| Database       | MongoDB                     |
| ODM            | Mongoose                    |
| Authentication | JWT, bcrypt                 |
| Media Storage  | Cloudinary                  |
| File Uploads   | Multer                      |
| Utilities      | Cookie Parser, CORS, dotenv |

---

## 📁 Project Structure

```bash
src/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── utils/
├── db/
├── constants/
├── app.js
└── index.js
```

---

## ⚙️ Installation

### Clone the Repository

```bash
git clone https://github.com/novakit7/Nexora-Server

cd nexora-server
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000

MONGODB_URI=your_mongodb_uri

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Run Development Server

```bash
npm run dev
```

---

## 📡 API Testing

A Postman collection is included for testing all API endpoints.

Import:

```bash
Nexora-Server.postman_collection.json
```

Configure the required environment variables before making requests.

---

## 🔐 Authentication Flow

```text
Register User
      ↓
Login User
      ↓
Receive Access Token & Refresh Token
      ↓
Access Protected Routes
      ↓
Refresh Token When Expired
      ↓
Logout User
```

---

## 🚀 Learning Outcomes

This project helped strengthen understanding of:

* REST API Design
* Authentication & Authorization
* MongoDB Aggregation Pipelines
* Cloudinary Integration
* File Upload Handling
* Backend Architecture
* Error Handling & Middleware
* Secure Token Management

---

## 🙏 Acknowledgements

This project was built while learning backend development concepts from the amazing content provided by **Hitesh Choudhary** through the **Chai aur Code Backend Series**.

A huge thanks to Hitesh Sir for creating practical and industry-focused content that helps developers understand real-world backend engineering.

**Chai aur Code:**
https://www.youtube.com/@chaiaurcode

> This project is an independent implementation created for learning and educational purposes based on concepts taught in the Backend Series.

---

## 👨‍💻 Author

**Ankit**

GitHub: https://github.com/novakit7

---

## ⭐ Show Your Support

If you found this project useful:

* ⭐ Star the repository
* 🍴 Fork the repository
* 🐛 Report issues
* 🚀 Contribute improvements

---

Made with ❤️ using Node.js, Express.js, MongoDB, and Cloudinary.
