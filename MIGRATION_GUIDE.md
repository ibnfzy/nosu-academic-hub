# Migration Guide: LocalStorage to REST API
## Sistem Informasi Akademik SMA Negeri 1 Nosu

Panduan migrasi dari penyimpanan data localStorage (prototype) ke REST API (production).

---

## 🔄 Overview Migrasi

Aplikasi ini didesain dengan abstraksi service layer (`apiService.js`) yang memungkinkan switching mudah antara localStorage dan REST API tanpa mengubah kode komponen.

### Current Architecture
```
Components → apiService.js → localStorage (Prototype)
                         ↘ REST API (Production)
```

---

## ⚙️ Konfigurasi Service

### File: `src/services/apiService.js`

```javascript
// UBAH FLAG INI UNTUK SWITCHING
const USE_API = false; // Set ke true untuk menggunakan REST API
const API_BASE_URL = 'http://localhost:3000/api'; // Ganti dengan URL backend
```

### Environment Variables (Recommended)
Buat file `.env`:
```env
VITE_USE_API=false
VITE_API_BASE_URL=http://localhost:3000/api
```

Update `apiService.js`:
```javascript
const USE_API = import.meta.env.VITE_USE_API === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

---

## 📋 Steps Migrasi

### 1. Persiapan Backend
- Implementasikan REST API sesuai [API Documentation](./API_DOCUMENTATION.md)
- Setup database dengan struktur data yang sesuai
- Implement authentication (JWT recommended)
- Test semua endpoint dengan Postman/Insomnia

### 2. Data Migration
Eksport data dari localStorage ke database backend:

```javascript
// Script untuk export data localStorage
const exportLocalStorageData = () => {
  const data = {
    users: JSON.parse(localStorage.getItem('akademik_users') || '[]'),
    students: JSON.parse(localStorage.getItem('akademik_students') || '[]'),
    teachers: JSON.parse(localStorage.getItem('akademik_teachers') || '[]'),
    classes: JSON.parse(localStorage.getItem('akademik_classes') || '[]'),
    subjects: JSON.parse(localStorage.getItem('akademik_subjects') || '[]'),
    grades: JSON.parse(localStorage.getItem('akademik_grades') || '[]'),
    attendance: JSON.parse(localStorage.getItem('akademik_attendance') || '[]'),
    academicYears: JSON.parse(localStorage.getItem('akademik_years') || '[]')
  };
  
  console.log('LocalStorage Data:', JSON.stringify(data, null, 2));
  return data;
};
```

### 3. Update Configuration
```javascript
// Ubah di apiService.js
const USE_API = true;
const API_BASE_URL = 'https://your-backend-domain.com/api';
```

### 4. Authentication Headers
Tambahkan JWT token ke semua request:

```javascript
// Update di apiService.js
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Contoh penggunaan
const response = await fetch(`${API_BASE_URL}/siswa/${studentId}/nilai`, {
  headers: getAuthHeaders()
});
```

### 5. Error Handling
Update error handling untuk response API:

```javascript
const handleApiResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API Error');
  }
  return await response.json();
};
```

---

## 🧪 Testing Migrasi

### 1. Parallel Testing
Jalankan aplikasi dengan `USE_API = false` dan `USE_API = true` secara bergantian untuk memastikan fungsionalitas sama.

### 2. Data Validation
Pastikan data yang dikembalikan API memiliki struktur yang sama dengan localStorage:

```javascript
// Test script
const testDataConsistency = async () => {
  // Set USE_API = false
  const localData = await apiService.getStudentGrades('2', '2024/2025', 1);
  
  // Set USE_API = true  
  const apiData = await apiService.getStudentGrades('2', '2024/2025', 1);
  
  console.log('Data consistency check:', {
    local: localData,
    api: apiData,
    match: JSON.stringify(localData) === JSON.stringify(apiData)
  });
};
```

### 3. Performance Testing
Monitor performa setelah migrasi:
- Response time
- Error rate
- User experience

---

## 🚀 Deployment Checklist

### Frontend
- [ ] Update `USE_API = true`
- [ ] Set correct `API_BASE_URL`
- [ ] Remove localStorage fallback code (opsional)
- [ ] Update environment variables
- [ ] Test all user flows
- [ ] Deploy to hosting (Netlify/Vercel)

### Backend
- [ ] Deploy API server
- [ ] Setup database
- [ ] Import migrated data
- [ ] Configure CORS for frontend domain
- [ ] Setup SSL certificate
- [ ] Configure environment variables
- [ ] Setup monitoring & logging

---

## 🔐 Security Considerations

### JWT Implementation
```javascript
// Store JWT securely
const storeAuthToken = (token) => {
  // Gunakan httpOnly cookies untuk production
  localStorage.setItem('auth_token', token);
  
  // Set expiration
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours
  localStorage.setItem('auth_expires', expiresAt.toISOString());
};

// Check token expiration
const isTokenExpired = () => {
  const expiresAt = localStorage.getItem('auth_expires');
  return expiresAt && new Date() > new Date(expiresAt);
};
```

### API Security
- Implement rate limiting
- Validate all inputs
- Use HTTPS only
- Sanitize data
- Implement proper CORS policy

---

## 📊 Monitoring & Rollback

### Monitoring
Setup monitoring untuk:
- API response times
- Error rates  
- User activity
- Database performance

### Rollback Plan
Jika terjadi masalah:

1. **Quick Rollback**:
   ```javascript
   // Emergency rollback
   const USE_API = false; // Switch back to localStorage
   ```

2. **Data Sync**:
   - Export latest data from API
   - Import to localStorage
   - Redeploy frontend

### Gradual Migration (Recommended)
Untuk organisasi besar, lakukan migrasi bertahap:

```javascript
// Feature flag based migration
const useApiForFeature = (feature) => {
  const apiFeatures = ['grades', 'attendance']; // Migrate gradually
  return USE_API && apiFeatures.includes(feature);
};

// Dalam apiService methods
async getStudentGrades(studentId, tahun, semester) {
  if (useApiForFeature('grades')) {
    // Use API
    const response = await fetch(`${API_BASE_URL}/siswa/${studentId}/nilai...`);
    return await response.json();
  } else {
    // Use localStorage
    const grades = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRADES) || '[]');
    return grades.filter(/* ... */);
  }
}
```

---

## 🔧 Troubleshooting

### Common Issues

1. **CORS Error**
   ```javascript
   // Backend setup (Express.js)
   app.use(cors({
     origin: ['http://localhost:5173', 'https://yourdomain.com'],
     credentials: true
   }));
   ```

2. **Token Expired**
   ```javascript
   // Auto refresh token
   const refreshTokenIfNeeded = async () => {
     if (isTokenExpired()) {
       await refreshAuthToken();
     }
   };
   ```

3. **Data Format Mismatch**
   - Validate API response structure
   - Add data transformation layer if needed
   - Update TypeScript interfaces

### Debug Mode
```javascript
const DEBUG_MODE = import.meta.env.MODE === 'development';

const debugLog = (operation, data) => {
  if (DEBUG_MODE) {
    console.log(`[API Debug] ${operation}:`, data);
  }
};
```

---

## 📚 Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Component Documentation](./COMPONENTS.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

## 💡 Best Practices

1. **Gradual Migration**: Migrate feature by feature
2. **Comprehensive Testing**: Test all user scenarios
3. **Monitor Performance**: Track metrics before/after
4. **Have Rollback Plan**: Always have a way back
5. **Document Changes**: Keep migration log
6. **User Communication**: Inform users about maintenance
7. **Backup Data**: Always backup before migration