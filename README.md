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
   NGROK_URL=https://your-ngrok-subdomain.ngrok.io
   CALLBACK_PATH=/api/shopback/dynamic-qr-callback
   ```

5. **Start the development server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Or production mode
   npm start
   ```

6. **Setup ngrok for webhook testing (Required for payment callbacks)**
   
   Install ngrok globally:
   ```bash
   npm install -g ngrok
   ```
   
   Start ngrok tunnel:
   ```bash
   ngrok http 3000
   ```
   
   Copy the HTTPS URL from ngrok output (e.g., `https://abc123.ngrok.io`) and update your `.env` file:
   ```env
   NGROK_URL=https://abc123.ngrok.io
   ```

7. **Verify installation**
   
   Open your browser and navigate to `http://localhost:3000`. You should see:
   ```json
   {
     "message": "Welcome to ShopBack Node API"
   }
   ```
   
   Test the health endpoint at `http://localhost:3000/health` to confirm the server is running properly.

## How to Use the Project

### API Endpoints

The API provides the following endpoints for ShopBack integration:

#### 1. Create Dynamic QR Order
**POST** `/api/shopback/create-dynamic-qr-order`

Creates a dynamic QR code for customer payment. Used when customers scan the merchant's QR code.

**Required fields:**
- `posId` - Point of sale identifier
- `country` - Country code (e.g., "SG", "MY")  
- `amount` - Payment amount
- `currency` - Currency code (e.g., "SGD", "MYR")
- `qrType` - QR code type

**Optional fields:**
- `referenceId` - Custom reference ID (auto-generated if not provided)
- `partner` - Partner information
- `orderMetadata` - Additional order metadata
- `webhookUrl` - Custom webhook URL

#### 2. Scan Consumer QR
**POST** `/api/shopback/scan-consumer-qr`

Processes consumer-presented QR codes. Used when merchants scan the customer's QR code.

**Required fields:**
- `posId` - Point of sale identifier
- `country` - Country code
- `amount` - Payment amount
- `currency` - Currency code
- `consumerQrPayload` - QR code data from customer's app

**Optional fields:**
- `referenceId` - Custom reference ID (auto-generated if not provided)
- `partner` - Partner information
- `orderMetadata` - Additional order metadata
- `webhookUrl` - Custom webhook URL

#### 3. Get Order Status
**GET** `/api/shopback/order-status/:referenceId`

Retrieves the current status of an order using its reference ID.

**URL Parameters:**
- `referenceId` - The order reference ID

#### 4. Process Refund
**POST** `/api/shopback/order-refund/:referenceId`

Processes a refund for a captured order.

**URL Parameters:**
- `referenceId` - The order reference ID

**Required fields:**
- `amount` - Refund amount

**Optional fields:**
- `reason` - Refund reason
- `posId` - Point of sale identifier
- `refundMetadata` - Additional refund metadata

#### 5. Cancel Order
**POST** `/api/shopback/cancel-order/:referenceId`

Cancels an order before payment processing.

**URL Parameters:**
- `referenceId` - The order reference ID

**Optional fields:**
- `reason` - Cancellation reason

#### 6. Payment Callback
**POST** `/api/shopback/dynamic-qr-callback`

Webhook endpoint for receiving payment status updates from ShopBack. This endpoint verifies the HMAC signature and processes the payment notification.

### Example API Usage

#### Creating a Dynamic QR Order

```bash
curl -X POST http://localhost:3000/api/shopback/create-dynamic-qr-order \
  -H "Content-Type: application/json" \
  -d '{
    "posId": "POS001",
    "country": "SG",
    "amount": 1000,
    "currency": "SGD",
    "qrType": "DYNAMIC"
  }'
```

#### Scanning Consumer QR

```bash
curl -X POST http://localhost:3000/api/shopback/scan-consumer-qr \
  -H "Content-Type: application/json" \
  -d '{
    "posId": "POS001",
    "country": "SG", 
    "amount": 1000,
    "currency": "SGD",
    "consumerQrPayload": "00020101021243650016A000000615000101065204411253033605802SG5925SHOPBACK PTE LTD - GRAB6009Singapore62070503***6304"
  }'
```

#### Getting Order Status

```bash
curl -X GET http://localhost:3000/api/shopback/order-status/your-reference-id
```

#### Processing a Refund

```bash
curl -X POST http://localhost:3000/api/shopback/order-refund/your-reference-id \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "reason": "Customer return"
  }'
```

#### Canceling an Order

```bash
curl -X POST http://localhost:3000/api/shopback/cancel-order/your-reference-id \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Order cancelled by customer"
  }'
```

### Using the REST Client

The project includes a `request.rest` file with pre-configured API calls. If you're using VS Code or Jetbrain's IDE with the REST Client extension:

1. Open `request.rest`
2. Click "Send Request" above any HTTP request
3. View the response in the adjacent panel

### Using Postman Collection

The project includes a Postman collection file `Shopback Node.postman_collection.json` with pre-configured API requests for all endpoints.

#### Import Instructions:

1. **Open Postman**
2. **Click "Import"** in the top left corner
3. **Drag and drop** the `Shopback Node.postman_collection.json` file or click "Upload Files" and select it
4. **Click "Import"** to add the collection to your workspace

#### Collection Contents:

The Postman collection includes ready-to-use requests for:
- Create Dynamic QR Order
- Scan Consumer QR
- Get Order Status
- Process Refund
- Cancel Order

Each request is pre-configured with:
- Correct HTTP methods and endpoints
- Sample request bodies with realistic test data
- Proper Content-Type headers

#### Usage Tips:

- Update the request bodies with your actual test data
- Ensure your local server is running on `http://localhost:3000`
- Copy reference IDs from responses to use in subsequent requests (order status, refund, cancel)

### Monitoring and Debugging

The application provides comprehensive logging for all API interactions:

- **Request Logging**: All outgoing requests to ShopBack are logged with headers, URLs, and body content
- **Response Logging**: All responses from ShopBack are logged with status codes and response bodies
- **HMAC Debug**: Detailed signature generation process including payload construction and digest creation

Check the console output when running the application to monitor API communications and troubleshoot any issues.

## Webhook Testing with ngrok

To test ShopBack's payment callbacks, you need to expose your local server to the internet using ngrok:

### Setup Process

1. **Start your local server**:
   ```bash
   npm run dev
   ```

2. **In a new terminal, start ngrok**:
   ```bash
   ngrok http 3000
   ```

3. **Copy the HTTPS URL** from ngrok output and update your `.env`:
   ```env
   NGROK_URL=https://abc123.ngrok.io
   CALLBACK_PATH=/api/shopback/dynamic-qr-callback
   ```

4. **Restart your server** to load the new environment variables:
   ```bash
   npm run dev
   ```

### Testing the Callback

When you create a dynamic QR order, the application automatically sets the webhook URL to:
```
https://your-ngrok-url.ngrok.io/api/shopback/dynamic-qr-callback
```

ShopBack will send payment status updates to this endpoint, and you'll see the callback logs in your console output including:
- Request headers and authorization
- Payment status updates
- HMAC signature verification results

### Troubleshooting

- **ngrok URL changes**: Each time you restart ngrok, the URL changes. Update your `.env` file with the new URL.
- **HTTPS required**: ShopBack only sends callbacks to HTTPS endpoints, so always use the HTTPS URL from ngrok.
- **Signature verification**: Check console logs for signature verification success/failure messages.

## Project Structure

```
shopback-node-api/
├── src/
│   ├── index.js                                # Main Express application entry point
│   ├── controllers/
│   │   └── shopbackController.js              # ShopBack API integration controllers
│   ├── routes/
│   │   └── shopback.js                        # Express route definitions
│   └── utils/
│       └── shopback.js                        # HMAC signature generation utilities
├── tests/                                     # Test files directory (empty)
├── config/                                    # Configuration files directory (empty)
├── request.rest                               # HTTP client test requests
├── Shopback Node.postman_collection.json      # Postman collection for API testing
├── package.json                               # Project dependencies and scripts
├── README.md                                  # Project documentation
└── CLAUDE.md                                  # Claude Code development guidance
```

## Architecture

The application follows a clean MVC architecture pattern:

- **Controllers** (`src/controllers/`): Handle business logic and API integration
- **Routes** (`src/routes/`): Define API endpoints and route requests to controllers
- **Utils** (`src/utils/`): Utility functions for signature generation and common operations
- **Main Application** (`src/index.js`): Express server setup and middleware configuration

### Key Features

- **Automatic Reference ID Generation**: Uses UUID v4 for unique transaction identifiers when not provided
- **Comprehensive Error Handling**: Proper error responses with status codes and messages
- **Request/Response Logging**: Full logging of all API communications for debugging
- **HMAC Signature Verification**: Secure authentication for both outgoing and incoming requests
- **Moment.js Integration**: Consistent UTC date formatting for HMAC signatures
- **Alphabetical Sorting**: Recursive sorting of request body keys for proper signature generation

### Dependencies

- **express**: Web framework for building the REST API
- **dotenv**: Environment variable management
- **moment**: Date formatting for HMAC signatures
- **uuid**: Automatic reference ID generation
- **crypto**: Native Node.js module for HMAC and SHA256 operations
- **nodemon** (dev): Development server with auto-restart functionality