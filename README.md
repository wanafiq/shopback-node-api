# ShopBack Node.js API Integration

## Project Description

This project implements a complete API integration with ShopBack's payment system, enabling businesses to process in-store payments through dynamic QR codes, consumer-presented QR codes, and comprehensive order management. The application serves as a middleware layer between merchant point-of-sale systems and ShopBack's payment infrastructure.

### What This Application Does

- **Payment Processing**: Creates and processes dynamic QR code orders for in-store payments
- **QR Code Management**: Handles both merchant-generated and consumer-presented QR codes
- **Order Management**: Provides complete order lifecycle management including status tracking, refunds, and cancellations
- **Real-time Notifications**: Receives and processes webhook notifications from ShopBack for order status updates
- **Secure Authentication**: Implements HMAC-SHA256 signature authentication for all API communications

### Technologies Used

- **Node.js & Express.js**: Chosen for their robust ecosystem and excellent API development capabilities
- **Moment.js**: Selected for reliable and consistent UTC date formatting required by ShopBack's HMAC signature specification
- **UUID**: Implements automatic reference ID generation ensuring unique transaction identifiers
- **Crypto**: Native Node.js module for HMAC-SHA256 signature generation and SHA256 content hashing
- **dotenv**: Secure environment variable management for API credentials

## How to Install and Run the Project

### Prerequisites

- Node.js (version 16 or higher)
- npm (Node Package Manager)
- ShopBack API credentials (access key and secret)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shopback-node-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```

4. **Configure environment variables**
   
   Edit the `.env` file with your ShopBack credentials:
   ```env
   SHOPBACK_ACCESS_KEY=your_access_key_here
   SHOPBACK_ACCESS_KEY_SECRET=your_secret_key_here
   SHOPBACK_BASE_URL=https://integrations-sandbox.shopback.com/posi-sandbox
   ```

5. **Start the development server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Or production mode
   npm start
   ```

6. **Verify installation**
   
   Open your browser and navigate to `http://localhost:3000`. You should see:
   ```json
   {
     "message": "Welcome to ShopBack Node API"
   }
   ```

## How to Use the Project

### API Endpoints

The API provides the following endpoints for ShopBack integration:

#### 1. Create Dynamic QR Order: **POST** `/api/shopback/create-dynamic-qr-order`
#### 2. Scan Consumer QR: **POST** `/api/shopback/scan-consumer-qr`
#### 3. Get Order Status: **GET** `/api/shopback/order-status/:referenceId`
#### 4. Process Refund: **POST** `/api/shopback/order-refund/:referenceId`
#### 5. Cancel Order: **POST** `/api/shopback/cancel-order/:referenceId`

### Using the REST Client

The project includes a `request.rest` file with pre-configured API calls. If you're using VS Code or Jetbrain's IDE with the REST Client extension:

1. Open `request.rest`
2. Click "Send Request" above any HTTP request
3. View the response in the adjacent panel

### Monitoring and Debugging

The application provides comprehensive logging for all API interactions:

- **Request Logging**: All outgoing requests to ShopBack are logged with headers, URLs, and body content
- **Response Logging**: All responses from ShopBack are logged with status codes and response bodies
- **HMAC Debug**: Detailed signature generation process including payload construction and digest creation

Check the console output when running the application to monitor API communications and troubleshoot any issues.