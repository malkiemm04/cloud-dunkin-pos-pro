# 🗄️ How to Open/View Your Database

## Method 1: Database Viewer Page (Easiest)

I've created a database viewer page for you!

**Access it:**
1. Go to: https://malkiemm04.github.io/cloud-dunkin-pos-pro/database-viewer.html
2. Or add it to your repository and it will be available

**Features:**
- ✅ View all menu items
- ✅ View all orders
- ✅ View inventory data
- ✅ Real-time statistics
- ✅ Refresh button

---

## Method 2: AWS Console (Direct Access)

### View DynamoDB Tables:

**Direct Links:**
1. **Menu Table:**
   https://console.aws.amazon.com/dynamodb/home?region=us-east-1#tables:selected=dunkin-pos-backend-menu-dev

2. **Orders Table:**
   https://console.aws.amazon.com/dynamodb/home?region=us-east-1#tables:selected=dunkin-pos-backend-orders-dev

3. **Inventory Table:**
   https://console.aws.amazon.com/dynamodb/home?region=us-east-1#tables:selected=dunkin-pos-backend-inventory-dev

### Steps in AWS Console:
1. Go to: https://console.aws.amazon.com/dynamodb
2. Click on **"Tables"** in the left menu
3. Click on a table name (e.g., `dunkin-pos-backend-menu-dev`)
4. Click **"Explore table items"** tab
5. You'll see all your data!

---

## Method 3: Browser Console (Quick Check)

1. Open your website: https://malkiemm04.github.io/cloud-dunkin-pos-pro/
2. Press **F12** (Developer Tools)
3. Go to **Console** tab
4. Type:
```javascript
// View menu from API
fetch('https://izr5wkzc0a.execute-api.us-east-1.amazonaws.com/dev/menu')
  .then(r => r.json())
  .then(data => {
    console.log('Menu Items:', data);
    console.table(data);
  });

// View orders from API
fetch('https://izr5wkzc0a.execute-api.us-east-1.amazonaws.com/dev/orders')
  .then(r => r.json())
  .then(data => {
    console.log('Orders:', data);
    console.table(data);
  });
```

---

## Method 4: AWS CLI (Command Line)

```bash
# View menu items
aws dynamodb scan --table-name dunkin-pos-backend-menu-dev --region us-east-1

# View orders
aws dynamodb scan --table-name dunkin-pos-backend-orders-dev --region us-east-1

# View inventory
aws dynamodb scan --table-name dunkin-pos-backend-inventory-dev --region us-east-1
```

---

## Quick Access Links

### AWS Console:
- **DynamoDB Home:** https://console.aws.amazon.com/dynamodb
- **All Tables:** https://console.aws.amazon.com/dynamodb/home?region=us-east-1#tables:

### Your Tables:
- **Menu:** `dunkin-pos-backend-menu-dev`
- **Orders:** `dunkin-pos-backend-orders-dev`
- **Inventory:** `dunkin-pos-backend-inventory-dev`

### API Endpoints:
- **Menu:** https://izr5wkzc0a.execute-api.us-east-1.amazonaws.com/dev/menu
- **Orders:** https://izr5wkzc0a.execute-api.us-east-1.amazonaws.com/dev/orders

---

## What You'll See

### Menu Table:
- ID, Name, Price, Category, Icon, Stock, Created Date

### Orders Table:
- Order ID, Items, Total, Payment Method, Date

### Inventory Table:
- Item ID, Current Stock, Low Alert, Sold Today

---

**The easiest way is to use the Database Viewer page I created! Just add it to your repository.**

