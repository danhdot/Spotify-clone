# Spotify Clone

Một ứng dụng web clone của Spotify được xây dựng với React và Django.

## Công nghệ sử dụng

### Frontend
- React với TypeScript
- Vite
- Modern state management
- Responsive design

### Backend
- Django
- Django REST Framework
- PostgreSQL Database

## Tính năng

- 🎵 Phát nhạc
- 🎬 Xem video
- 📚 Quản lý thư viện
- 🔍 Tìm kiếm
- 📃 Playlist management

## Cài đặt

### Backend

1. Di chuyển vào thư mục backend:
```bash
cd backend
```

2. Cài đặt các dependencies:
```bash
pip install -r requirements.txt
```

3. Khởi tạo database:
```bash
python init_db.py
```

4. Chạy server:
```bash
python manage.py runserver
```

### Frontend

1. Di chuyển vào thư mục frontend:
```bash
cd frontend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy development server:
```bash
npm run dev
```

## Cấu trúc Project

```
├── backend/               # Django backend
│   ├── api/              # REST API endpoints
│   └── spotify_backend/  # Django settings
└── frontend/             # React frontend
    └── src/
        ├── components/   # React components
        ├── services/     # API services
        └── types/        # TypeScript types
```

## Contributing

Mọi đóng góp đều được chào đón! Hãy tạo pull request hoặc mở issue để thảo luận về những thay đổi bạn muốn thực hiện.

## License

MIT License