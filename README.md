# Cloud Dunkin' POS Pro ☁️

A cloud-native Point of Sale system for Dunkin' Donuts built with AWS serverless technologies.

## 🚀 Features

- ✅ **Cloud-hosted POS system** with HTTPS via CloudFront
- ✅ **Serverless backend** (AWS Lambda Functions)
- ✅ **Managed database** (AWS DynamoDB - NoSQL)
- ✅ **CDN caching** via CloudFront for global performance
- ✅ **Image upload & storage** via S3 + CloudFront CDN
- ✅ **Public read-only menu page** (no authentication required)
- ✅ **User authentication** with AWS Cognito (ready for integration)
- ✅ **Real-time monitoring** with CloudWatch dashboards
- ✅ **Cost control** with AWS Budgets alerts
- ✅ **Infrastructure as Code** with Terraform
- ✅ **CI/CD ready** with GitHub Actions
- ✅ **Complete CRUD operations** for Menu, Orders, and Inventory

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USERS (Browser/Devices)                  │
│                             │                               │
│                             ▼                               │
│                    ┌─────────────────┐                     │
│                    │   CloudFront     │  CDN + HTTPS        │
│                    │  (Global Edge)   │  Static Content     │
│                    └─────────────────┘                     │
│                             │                               │
├─────────────────────────────────────────────────────────────┤
│                    AWS Cloud Region                         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │
│  │   S3 Bucket │  │  API Gateway│  │   Lambda@Edge   │    │
│  │  (Frontend) │◄─┤   (REST API)│  │(Authentication) │    │
│  └─────────────┘  └─────────────┘  └─────────────────┘    │
│         │                    │               │             │
│         │                    ▼               ▼             │
│         │          ┌─────────────────┐ ┌─────────────┐    │
│         │          │  Lambda Functions│ │ Cognito     │    │
│         │          │  (Node.js 18.x) │ │ (Auth/Users)│    │
│         │          └─────────────────┘ └─────────────┘    │
│         │                    │               │             │
│         │                    └──────┬────────┘             │
│         │                           ▼                      │
│         │                   ┌─────────────┐                │
│         │                   │ DynamoDB    │                │
│         │                   │ (NoSQL DB)  │                │
│         │                   └─────────────┘                │
│         │                           │                      │
│         └───────────────────────────┼──────────────────────┘
│                                     ▼                       
│                           ┌─────────────────┐              
│                           │  CloudWatch     │              
│                           │ (Logs/Metrics)  │              
│                           └─────────────────┘              
│                                     │                       
│                                     ▼                       
│                           ┌─────────────────┐              
│                           │  AWS Budgets    │              
│                           │  (Cost Control) │              
│                           └─────────────────┘              
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
cloud-dunkin-pos-pro/
├── frontend/
│   └── index.html          # Complete POS application
├── backend/
│   ├── package.json        # Node.js dependencies
│   ├── serverless.yml      # Serverless Framework config
│   └── handlers/
│       ├── menu.js         # Menu CRUD operations
│       ├── orders.js       # Order management
│       ├── inventory.js    # Inventory management
│       └── auth.js         # Authentication handlers
├── infrastructure/
│   └── terraform/
│       ├── main.tf         # Main infrastructure
│       ├── variables.tf    # Terraform variables
│       └── outputs.tf      # Output values
└── README.md
```

## 🛠️ Prerequisites

- **AWS Account** with appropriate permissions
- **Node.js** 18.x or higher
- **Terraform** 1.5+ installed
- **Serverless Framework** CLI installed globally
- **AWS CLI** configured with credentials

## 📦 Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/cloud-dunkin-pos-pro.git
cd cloud-dunkin-pos-pro
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Set default region: us-east-1
```

### 4. Install Frontend Dependencies (for Local Development)

```bash
cd frontend
npm install
```

## 💻 Local Development

### Running the Frontend Locally

**Important:** To avoid CORS errors, you must run the frontend through a local web server instead of opening the HTML file directly (`file://`).

#### Option 1: Using the Frontend Package (Recommended)

```bash
cd frontend
npm install  # First time only
npm start    # Starts server on http://localhost:8080
```

Then open your browser and navigate to: **`http://localhost:8080`**

#### Option 2: Using Python (if you have Python installed)

```bash
cd frontend
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Then open: **`http://localhost:8080`**

#### Option 3: Using Node.js http-server (if installed globally)

```bash
cd frontend
npx http-server -p 8080
```

### Running the Backend Locally (Optional)

If you want to test against a local backend instead of the deployed AWS API:

```bash
cd backend
npm install
npm start  # Starts serverless-offline on http://localhost:3000
```

The frontend is already configured to automatically use `http://localhost:3000` when running on localhost.

### Troubleshooting CORS Issues

If you encounter CORS errors:
1. **Make sure you're accessing via `http://localhost:8080`** (not `file://`)
2. **Check that your backend API has CORS headers configured** (already done in this project)
3. **Verify the API endpoint** in `frontend/index.html` matches your deployed API Gateway URL

## 🚀 Deployment

### Step 1: Deploy Infrastructure (Terraform)

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Review the plan
terraform plan

# Apply infrastructure
terraform apply
```

**Note:** The Terraform backend S3 bucket is commented out by default. Uncomment it in `main.tf` if you have a state bucket configured.

### Step 2: Deploy Backend (Serverless)

```bash
cd backend

# Deploy to dev environment
npm run deploy:dev

# Or deploy to production
npm run deploy:prod
```

After deployment, note the API Gateway endpoint URL from the output.

### Step 3: Update Frontend Configuration

Edit `frontend/index.html` and update the `CLOUD_CONFIG` object:

```javascript
const CLOUD_CONFIG = {
    API_ENDPOINT: "https://YOUR_API_GATEWAY_URL.execute-api.us-east-1.amazonaws.com/dev",
    REGION: "us-east-1"
};
```

### Step 4: Deploy Frontend to S3

```bash
# Get the S3 bucket name from Terraform output
aws s3 sync frontend/ s3://dunkin-pos-frontend-dev/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## 🔌 API Endpoints

All endpoints are prefixed with your API Gateway URL: `https://YOUR_API.execute-api.us-east-1.amazonaws.com/dev`

### Menu Endpoints

- `GET /menu` - Retrieve all menu items (public, no auth required)
- `POST /menu` - Create a new menu item
- `PUT /menu/{id}` - Update a menu item
- `DELETE /menu/{id}` - Delete a menu item

### Order Endpoints

- `GET /orders` - Retrieve all orders
- `POST /orders` - Create a new order

### Inventory Endpoints

- `GET /inventory` - Retrieve inventory status
- `PUT /inventory/{id}` - Update inventory quantity

### Image Upload Endpoints

- `POST /images/upload-url` - Get presigned URL for image upload

### Authentication Endpoints

- `POST /auth/login` - User login (Cognito integration ready)
- `GET /auth/verify` - Verify authentication token

## 💰 Cost Optimization

- **Budget Alert**: Configured at $50/month with alerts at 80% and 100%
- **Pay-per-use**: Lambda and DynamoDB use on-demand pricing
- **S3 Intelligent Tiering**: Automatic cost optimization
- **CloudFront Caching**: Reduces origin requests

**Estimated Monthly Cost**: $25-35 (within free tier for low usage)

## 📊 Monitoring

### CloudWatch Dashboard

Access the dashboard via AWS Console or use the Terraform output URL.

**Metrics Tracked:**
- Lambda invocations, errors, and duration
- CloudFront requests and cache hit ratio
- DynamoDB read/write capacity

### View Logs

```bash
# View Lambda logs
cd backend
serverless logs -f getMenu --tail

# Or via AWS CLI
aws logs tail /aws/lambda/dunkin-pos-backend-dev-getMenu --follow
```

## 🔒 Security

- **HTTPS**: Enforced via CloudFront
- **IAM Roles**: Least privilege access
- **S3 Private**: Access only via CloudFront OAI
- **CORS**: Configured for API endpoints
- **Authentication**: Ready for Cognito integration

## 🧪 Testing

### Test Menu Endpoint

```bash
# Get menu items
curl https://YOUR_API.execute-api.us-east-1.amazonaws.com/dev/menu

# Create menu item
curl -X POST https://YOUR_API.execute-api.us-east-1.amazonaws.com/dev/menu \
  -H "Content-Type: application/json" \
  -d '{"name":"Coffee","price":2.99,"category":"Beverages"}'
```

### Test Order Endpoint

```bash
curl -X POST https://YOUR_API.execute-api.us-east-1.amazonaws.com/dev/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"1","name":"Coffee","price":2.99,"quantity":2}],"total":5.98}'
```

## 🔄 CI/CD Pipeline

CI/CD can be configured using GitHub Actions workflows for automated deployment of both frontend and backend components.

**Setup GitHub Secrets:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `CLOUDFRONT_DISTRIBUTION_ID`

## 🐛 Troubleshooting

### Frontend not loading
- Check CloudFront distribution status
- Verify S3 bucket has correct files
- Check browser console for CORS errors

### API Gateway errors
- Verify Lambda function is deployed
- Check CloudWatch logs for errors
- Ensure DynamoDB tables exist

### Terraform errors
- Ensure AWS credentials are configured
- Check IAM permissions
- Verify region is correct

## 📝 Environment Variables

Update these in `backend/serverless.yml`:

- `MENU_TABLE`: DynamoDB table name for menu items
- `ORDERS_TABLE`: DynamoDB table name for orders
- `INVENTORY_TABLE`: DynamoDB table name for inventory
- `COGNITO_CLIENT_ID`: Cognito User Pool Client ID (if using auth)

## 🎯 Next Steps

1. **Configure Cognito**: Set up user pool and integrate authentication
2. **Add Custom Domain**: Configure Route 53 and ACM certificate
3. **Enable WAF**: Add Web Application Firewall for additional security
4. **Set up Alarms**: Configure CloudWatch alarms for errors
5. **Add Tests**: Implement unit and integration tests

## 📄 License

MIT License - see LICENSE file for details

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using AWS Serverless Technologies**
