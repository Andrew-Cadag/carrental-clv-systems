# Car Rental CLV System

A full-stack car rental application with Customer Lifetime Value (CLV) prediction powered by AI.

## Prerequisites

Before you begin, ensure you have the following installed:

- **[XAMPP](https://www.apachefriends.org/)** (for MySQL database)
  - Download and install XAMPP
  - Start Apache and MySQL services from XAMPP Control Panel
- **[Node.js](https://nodejs.org/)** (v18 or higher)
- **[Python](https://www.python.org/)** (v3.9 or higher)
- **[Git](https://git-scm.com/)**

## Local Setup

### 1. Database Setup (XAMPP)

1. Start XAMPP Control Panel
2. Start **Apache** and **MySQL** services
3. Open [phpMyAdmin](http://localhost/phpmyadmin) in your browser
4. Create a new database named `carrental_db`
5. Import `carrental_db.sql` file:
   - Click on `carrental_db` database
   - Go to **Import** tab
   - Choose `carrental_db.sql` file
   - Click **Go**

### 2. Backend Setup

```bash
cd backend
cp .env.example .env    # Edit with your database credentials
npm install
npm start
```

Backend will run on `http://localhost:8000`

**Backend .env example:**
```
PORT=8000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=carrental_db
JWT_SECRET=your_jwt_secret_key_here
FLASK_URL=http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env    # Set REACT_APP_API_URL
npm install
npm start
```

Frontend will run on `http://localhost:3000`

**Frontend .env example:**
```
REACT_APP_API_URL=http://localhost:8000/api
```

### 4. AI Service Setup

```bash
cd ai
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# Train the CLV prediction model (generates clv_model.pkl)
python train.py

# Start the Flask API
python app.py
```

AI service will run on `http://localhost:5000`

## Project Structure

```
carrental-clv-system/
├── frontend/          # React frontend
├── backend/           # Express.js API
├── ai/               # Python CLV prediction service
└── carrental_db.sql  # Database schema
```

## Development Workflow

1. **Pull latest changes** before starting work:
   ```bash
   git pull origin main
   git checkout your-branch
   git merge main
   ```

2. **Make your changes** on the appropriate branch

3. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: your commit message"
   git push origin your-branch
   ```

4. **Create a Pull Request** on GitHub to merge into `main`

## Default Login Credentials

After database import, you can login as:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@driveease.com` | `admin123` |
| **Staff** | `staff@driveease.com` | `staff123` |
| **Customer** | `john@example.com` | `password123` |
| **Customer (sample)** | `maria.santos@email.com` | `password123` |

*Note: 10 sample customers are pre-seeded with `password123` for demonstration purposes.*

## Troubleshooting

- **MySQL connection error**: Ensure XAMPP MySQL service is running
- **Port conflicts**: Make sure ports 3000, 8000, 5000 are free
- **CORS errors**: Check that backend CORS settings include frontend URL

## Contributing

- Follow the established code style
- Write descriptive commit messages
- Test your changes before pushing

### Commit Message Format
```
feat: add new feature
fix: resolve bug
docs: update documentation
```

## License

MIT
