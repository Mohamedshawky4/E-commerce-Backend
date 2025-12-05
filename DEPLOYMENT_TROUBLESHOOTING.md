# 🔧 AWS Lambda Deployment - Troubleshooting Internal Server Error

## ✅ Deployment Status
Your backend was successfully deployed to AWS Lambda!

**API Endpoint:**
```
https://uormw7fllg.execute-api.us-east-1.amazonaws.com
```

## ❌ Current Issue: Internal Server Error

The API is returning `{"message":"Internal Server Error"}` when accessed.

## 🔍 Root Cause

The issue is that **environment variables are not being loaded** in AWS Lambda. The `serverless-dotenv-plugin` only works locally - it doesn't upload your `.env` file to AWS (which is correct for security).

## ✅ Solution: Set Environment Variables in AWS

You have **3 options** to fix this:

---

### **Option 1: Use AWS Systems Manager Parameter Store (Recommended for Production)**

1. Go to AWS Console → **Systems Manager** → **Parameter Store**
2. Create parameters:
   - `/ecommerce/MONGODB_URI` (SecureString)
   - `/ecommerce/JWT_SECRET` (SecureString)
   - `/ecommerce/STRIPE_SECRET_KEY` (SecureString)

3. Update `serverless.yml` to reference them:
```yaml
environment:
  MONGODB_URI: ${ssm:/ecommerce/MONGODB_URI}
  JWT_SECRET: ${ssm:/ecommerce/JWT_SECRET}
  STRIPE_SECRET_KEY: ${ssm:/ecommerce/STRIPE_SECRET_KEY}
```

4. Redeploy: `npm run deploy`

---

### **Option 2: Use Environment Variables Directly (Quick Fix)**

**Step 1:** Set environment variables before deploying:

**Windows PowerShell:**
```powershell
$env:MONGODB_URI="your_mongodb_atlas_connection_string"
$env:JWT_SECRET="your_jwt_secret_key"
$env:STRIPE_SECRET_KEY="your_stripe_secret_key"
```

**Step 2:** Deploy immediately in the same terminal:
```bash
npm run deploy
```

> ⚠️ **Warning**: These variables only last for the current terminal session.

---

### **Option 3: Hardcode in serverless.yml (NOT RECOMMENDED - Only for Testing)**

Edit `serverless.yml`:
```yaml
environment:
  MONGODB_URI: "mongodb+srv://username:password@cluster.mongodb.net/dbname"
  JWT_SECRET: "your-super-secret-jwt-key"
  STRIPE_SECRET_KEY: "sk_test_your_stripe_key"
  PORT: "5000"
  NODE_ENV: "production"
```

Then redeploy:
```bash
npm run deploy
```

> ⚠️ **CRITICAL**: Never commit this file to Git! Add it to `.gitignore` if you use this method.

---

## 🚀 Quick Fix (Recommended for Now)

I recommend **Option 2** for quick testing. Here's what to do:

1. **Open a new PowerShell terminal**
2. **Set your environment variables:**
   ```powershell
   cd d:\projects\e-commerce\backend
   
   $env:MONGODB_URI="YOUR_ACTUAL_MONGODB_URI_HERE"
   $env:JWT_SECRET="YOUR_ACTUAL_JWT_SECRET_HERE"
   $env:STRIPE_SECRET_KEY="YOUR_ACTUAL_STRIPE_KEY_HERE"
   ```

3. **Redeploy:**
   ```bash
   npm run deploy
   ```

4. **Test the endpoint:**
   ```bash
   curl https://uormw7fllg.execute-api.us-east-1.amazonaws.com/
   ```

---

## 🔍 Verify Environment Variables in AWS Console

1. Go to **AWS Lambda Console**
2. Find function: `ecommerce-backend-dev-api`
3. Click **Configuration** → **Environment variables**
4. Check if `MONGODB_URI`, `JWT_SECRET`, and `STRIPE_SECRET_KEY` are listed
5. If they're empty or missing, that confirms the issue

---

## 📊 Expected Result After Fix

Once environment variables are set correctly, you should see:
```json
"API is running..."
```

Instead of:
```json
{"message":"Internal Server Error"}
```

---

## 🎯 Next Steps

1. Choose one of the options above
2. Set your environment variables
3. Redeploy: `npm run deploy`
4. Test: `curl https://uormw7fllg.execute-api.us-east-1.amazonaws.com/`
5. Run full API tests against the deployed endpoint

---

## 💡 Pro Tip: Create a Deployment Script

Create a file `deploy-with-env.ps1`:
```powershell
# Load environment variables
$env:MONGODB_URI = Get-Content .env | Select-String "MONGODB_URI" | ForEach-Object { $_ -replace "MONGODB_URI=", "" }
$env:JWT_SECRET = Get-Content .env | Select-String "JWT_SECRET" | ForEach-Object { $_ -replace "JWT_SECRET=", "" }
$env:STRIPE_SECRET_KEY = Get-Content .env | Select-String "STRIPE_SECRET_KEY" | ForEach-Object { $_ -replace "STRIPE_SECRET_KEY=", "" }

# Deploy
npm run deploy
```

Then just run: `.\deploy-with-env.ps1`

---

Need help with any of these options? Let me know which one you'd like to use!
