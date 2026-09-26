# MPrnt Frontend - Backend Integration

Complete integration with MPrnt backend API (http://localhost:3000/api/v1)

## ✅ Integrated Flow

### 1. **Landing Page** (`app/page.tsx`)
- Auto-creates backend session via `POST /api/v1/sessions`
- Requires `kioskId` in request body
- Stores `sessionId` and `expiresAt` from backend

### 2. **Upload Page** (`app/upload/page.tsx`)
- Uploads document via `POST /api/v1/sessions/:sessionId/documents`
- Uses `multipart/form-data` with field name `document`
- Tracks upload progress with XHR
- Stores `documentId`, `pageCount`, `fileType` from backend

### 3. **Settings Page** (`app/settings/page.tsx`)
- User configures print settings locally
- No backend call on this page
- Frontend calculates estimated price

### 4. **Review Page** (`app/review/page.tsx`)
- Creates print job via `POST /api/v1/sessions/:sessionId/print-jobs`
- Sends print settings:
  ```typescript
  {
    colorMode: 'bw' | 'color',
    copies: number,
    pageRange: 'all' | 'custom',
    customRange?: string,
    printSides: 'single' | 'double',
    paperSize: 'a4' | 'letter',
    orientation: 'portrait' | 'landscape'
  }
  ```
- Backend returns exact pricing with `jobId`
- Stores `printJobId` for payment

### 5. **Payment Page** (`app/payment/page.tsx`)
- **Step 1**: Create payment order via `POST /api/v1/print-jobs/:jobId/payment/order`
- **Step 2**: Simulate payment via `POST /api/v1/payment/mock/simulate-success`
  - Mock endpoint for demo/testing
  - Returns `paymentId` and `signature`
- **Step 3**: Verify payment via `POST /api/v1/payment/verify`
  - Sends `orderId`, `paymentId`, `signature`
  - Backend captures payment and queues print job
- On success, navigate to Processing page

### 6. **Processing Page** (`app/processing/page.tsx`)
- Simulates printing progress (no backend call)
- In production, would poll job status via `GET /api/v1/print-jobs/:jobId`

### 7. **Complete Page** (`app/complete/page.tsx`)
- Shows completion summary
- Allows starting new print job

## 🔄 Backend API Endpoints Used

```
POST   /api/v1/sessions                           - Create session
GET    /api/v1/sessions/:sessionId                - Get session details
POST   /api/v1/sessions/:sessionId/documents      - Upload document
POST   /api/v1/sessions/:sessionId/print-jobs     - Create print job
POST   /api/v1/print-jobs/:jobId/payment/order    - Create payment order
POST   /api/v1/payment/mock/simulate-success      - Simulate payment (demo)
POST   /api/v1/payment/verify                     - Verify payment
GET    /api/v1/print-jobs/:jobId                  - Get job details (optional)
```

## 📦 API Client (`lib/api/client.ts`)

Simple, clean API client with:
- Typed request/response interfaces matching backend
- Progress tracking for uploads
- Error handling with `APIError` class
- No external dependencies

## 🎯 Key Features

- **Real Backend Integration**: All API calls match actual backend implementation
- **Mock Payment Flow**: Uses backend's mock endpoints for demo
- **Progress Tracking**: Visual upload progress
- **Error Handling**: User-friendly error messages
- **Console Logging**: All API calls logged with ✓ for debugging

## 🧪 Testing

1. Start backend: `cd ~/mprnt-backend && npm run dev`
2. Start frontend: `npm run dev`
3. Open http://localhost:3000
4. Watch console for API call logs

## 🔧 Configuration

Set backend URL via environment variable:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

Default: `http://localhost:3000/api/v1`
