# MongoDB Atlas & Database Configuration

## 1. MongoDB Atlas Setup (Cloud Database)
To use MongoDB Atlas:
1. Go to [https://cloud.mongodb.com/](https://cloud.mongodb.com/) and create a free account.
2. Create a free shared cluster (e.g. `Cluster0`, AWS / Mumbai `ap-south-1`).
3. Under **Security > Database Access**:
   - Create a database user (e.g. `ignitron_admin`) and set a secure password.
   - Set privileges to `Read and write to any database`.
4. Under **Security > Network Access**:
   - Click **Add IP Address** -> Select **Allow Access From Anywhere** (`0.0.0.0/0`) or your specific IP.
5. Under **Deployments > Database**:
   - Click **Connect** -> Choose **Drivers** (Node.js).
   - Copy your connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ignitron2k26?retryWrites=true&w=majority
     ```
6. Open `.env` in the project root and set:
   ```env
   MONGODB_URI=mongodb+srv://ignitron_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ignitron2k26?retryWrites=true&w=majority
   ```
7. Start or restart the server (`npm run dev`). The server will automatically connect to MongoDB Atlas and seed all 29 events, default colleges, and admin credentials!

---

## 2. Local MongoDB Fallback
If you do not have internet access or want to develop offline:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/ignitron2k26
```
The server will connect to your local MongoDB service.

