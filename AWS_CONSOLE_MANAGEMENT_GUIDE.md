# AWS Console Management Guide
## Managing Your Serverless E-Commerce Backend

---

## 📋 Table of Contents

1. [Accessing AWS Console](#accessing-aws-console)
2. [Lambda Function Management](#lambda-function-management)
3. [API Gateway Management](#api-gateway-management)
4. [CloudWatch Logs & Monitoring](#cloudwatch-logs--monitoring)
5. [CloudFormation Stack Management](#cloudformation-stack-management)
6. [IAM Permissions Management](#iam-permissions-management)
7. [S3 Deployment Artifacts](#s3-deployment-artifacts)
8. [Common Management Tasks](#common-management-tasks)

---

## 🔐 Accessing AWS Console

### Step 1: Log In
1. Go to: **https://console.aws.amazon.com**
2. Enter your AWS account credentials
3. Select region: **US East (N. Virginia) us-east-1**

> **Important:** Always ensure you're in the correct region (us-east-1) where your resources are deployed.

---

## ⚡ Lambda Function Management

### Accessing Lambda Console

**URL:** https://console.aws.amazon.com/lambda/home?region=us-east-1

**Navigation:**
1. AWS Console → Services → Lambda
2. Or search "Lambda" in the top search bar

### Your Lambda Function

**Function Name:** `ecommerce-backend-dev-api`

### What You Can Do:

#### 1. **View Function Overview**
- **Path:** Lambda → Functions → ecommerce-backend-dev-api
- **Shows:**
  - Function ARN
  - Runtime (Node.js 20.x)
  - Memory (512 MB)
  - Timeout (30 seconds)
  - Last modified date

#### 2. **Monitor Performance**
- **Tab:** Monitor
- **Metrics Available:**
  - Invocations (total requests)
  - Duration (execution time)
  - Error count
  - Throttles
  - Concurrent executions

**How to View:**
```
Lambda → ecommerce-backend-dev-api → Monitor tab
```

#### 3. **View/Edit Environment Variables**
- **Tab:** Configuration → Environment variables
- **Variables You'll See:**
  - MONGODB_URI
  - JWT_SECRET
  - PAYMOB_API_KEY
  - PAYMOB_INTEGRATION_ID
  - PAYMOB_IFRAME_ID
  - PORT
  - NODE_ENV

**To Edit:**
```
1. Click "Edit" button
2. Modify variable values
3. Click "Save"
4. Changes apply immediately
```

> **Warning:** Never expose sensitive values like JWT_SECRET or MONGODB_URI

#### 4. **Test Function**
- **Tab:** Test
- **How to Test:**
```
1. Click "Test" tab
2. Create new test event
3. Use this sample event:
{
  "httpMethod": "GET",
  "path": "/",
  "headers": {},
  "body": null
}
4. Click "Test"
5. View execution results
```

#### 5. **View Code**
- **Tab:** Code
- **Shows:** Your deployed `lambda.js` file
- **Note:** Code is read-only in console
- To update: Redeploy using `npm run deploy:aws`

#### 6. **Configure Function Settings**
- **Tab:** Configuration → General configuration
- **Can Modify:**
  - Memory (128 MB - 10,240 MB)
  - Timeout (1 sec - 15 min)
  - Description

**To Change Memory:**
```
1. Configuration → General configuration
2. Click "Edit"
3. Adjust memory slider
4. Click "Save"
```

> **Tip:** Higher memory = faster CPU, but higher cost

#### 7. **View Logs**
- **Tab:** Monitor → View CloudWatch logs
- **Or:** Monitor → Logs → View logs in CloudWatch

---

## 🌐 API Gateway Management

### Accessing API Gateway Console

**URL:** https://console.aws.amazon.com/apigateway/home?region=us-east-1

**Navigation:**
1. AWS Console → Services → API Gateway
2. Or search "API Gateway"

### Your API

**API Name:** `dev-ecommerce-backend`
**Type:** HTTP API

### What You Can Do:

#### 1. **View API Overview**
- **Shows:**
  - API ID
  - Invoke URL: `https://uormw7fllg.execute-api.us-east-1.amazonaws.com`
  - Protocol: HTTP
  - Created date

#### 2. **View Routes**
- **Path:** API Gateway → dev-ecommerce-backend → Routes
- **Routes You'll See:**
  - `ANY /{proxy+}` → Lambda integration
  - `ANY /` → Lambda integration

**Route Details:**
- **Method:** ANY (GET, POST, PUT, DELETE, etc.)
- **Path:** `/{proxy+}` (catches all paths)
- **Integration:** Lambda function

#### 3. **Configure CORS**
- **Path:** API Gateway → dev-ecommerce-backend → CORS
- **Settings:**
  - Access-Control-Allow-Origin: *
  - Access-Control-Allow-Methods: GET, POST, PUT, DELETE
  - Access-Control-Allow-Headers: Content-Type, Authorization

**To Modify CORS:**
```
1. Click "Configure"
2. Update allowed origins/methods
3. Click "Save"
```

#### 4. **View Stages**
- **Path:** API Gateway → dev-ecommerce-backend → Stages
- **Stage:** $default
- **Invoke URL:** Your production endpoint

#### 5. **Monitor API Metrics**
- **Path:** API Gateway → dev-ecommerce-backend → Monitor
- **Metrics:**
  - Count (total requests)
  - 4XX errors (client errors)
  - 5XX errors (server errors)
  - Latency (response time)
  - Integration latency

#### 6. **Enable Logging** (Optional)
- **Path:** API Gateway → dev-ecommerce-backend → Logging
- **Can Enable:**
  - Access logs
  - Execution logs
  - Custom log format

---

## 📊 CloudWatch Logs & Monitoring

### Accessing CloudWatch Console

**URL:** https://console.aws.amazon.com/cloudwatch/home?region=us-east-1

### Your Log Group

**Log Group Name:** `/aws/lambda/ecommerce-backend-dev-api`

### What You Can Do:

#### 1. **View Recent Logs**
```
CloudWatch → Logs → Log groups → /aws/lambda/ecommerce-backend-dev-api
```

**Shows:**
- Log streams (one per Lambda execution)
- Timestamp
- Log messages (console.log output)
- Errors and stack traces

#### 2. **Search Logs**
- **Path:** Log groups → /aws/lambda/ecommerce-backend-dev-api → Search
- **Search Examples:**
```
# Find errors
"ERROR"

# Find specific endpoint
"/api/products"

# Find MongoDB connections
"MongoDB connected"

# Find slow requests
[duration > 1000]
```

#### 3. **Live Tail Logs**
```
1. Open log group
2. Click "Actions" → "Tail logs"
3. See real-time log updates
```

#### 4. **Create Metric Filters**
- **Path:** Log groups → Actions → Create metric filter
- **Use Cases:**
  - Count errors
  - Track API response times
  - Monitor specific events

#### 5. **Set Up Alarms**
- **Path:** CloudWatch → Alarms → Create alarm
- **Example Alarms:**

**High Error Rate:**
```
Metric: Lambda Errors
Threshold: > 10 errors in 5 minutes
Action: Send email notification
```

**High Latency:**
```
Metric: Lambda Duration
Threshold: > 3000ms average
Action: Send SNS notification
```

#### 6. **View Dashboards**
- **Path:** CloudWatch → Dashboards
- **Create Custom Dashboard:**
```
1. Click "Create dashboard"
2. Add widgets:
   - Lambda invocations
   - API Gateway requests
   - Error rates
   - Response times
3. Save dashboard
```

---

## 🏗️ CloudFormation Stack Management

### Accessing CloudFormation Console

**URL:** https://console.aws.amazon.com/cloudformation/home?region=us-east-1

### Your Stack

**Stack Name:** `ecommerce-backend-dev`

### What You Can Do:

#### 1. **View Stack Overview**
```
CloudFormation → Stacks → ecommerce-backend-dev
```

**Shows:**
- Stack status (CREATE_COMPLETE, UPDATE_COMPLETE)
- Created date
- Last updated
- Stack ID

#### 2. **View Resources**
- **Tab:** Resources
- **Shows All Created Resources:**
  - Lambda function
  - API Gateway
  - IAM roles
  - Log groups
  - Permissions

**Resource List:**
```
- AWS::Lambda::Function (ecommerce-backend-dev-api)
- AWS::ApiGatewayV2::Api (HTTP API)
- AWS::IAM::Role (Lambda execution role)
- AWS::Logs::LogGroup (CloudWatch logs)
- AWS::Lambda::Permission (API Gateway invoke)
```

#### 3. **View Events**
- **Tab:** Events
- **Shows:**
  - Resource creation events
  - Update events
  - Status changes
  - Timestamps

**Useful for:**
- Debugging deployment issues
- Tracking changes
- Understanding deployment timeline

#### 4. **View Template**
- **Tab:** Template
- **Shows:** Complete CloudFormation template (YAML)
- **Generated by:** Serverless Framework

#### 5. **View Outputs**
- **Tab:** Outputs
- **Shows:**
  - API endpoint URL
  - Function ARN
  - Other exported values

#### 6. **Update Stack** (Not Recommended)
- **Note:** Use `npm run deploy:aws` instead
- Manual updates can cause conflicts

#### 7. **Delete Stack**
- **Warning:** Deletes ALL resources
- **Better Alternative:** Use `npm run remove`

---

## 🔒 IAM Permissions Management

### Accessing IAM Console

**URL:** https://console.aws.amazon.com/iam/home

### Your Resources

#### 1. **Lambda Execution Role**
**Role Name:** `ecommerce-backend-dev-{region}-lambdaRole`

**To View:**
```
IAM → Roles → Search "ecommerce-backend-dev"
```

**Permissions:**
- CloudWatch Logs (write)
- Basic Lambda execution

**To View Permissions:**
```
1. Click role name
2. Tab: Permissions
3. See attached policies
```

#### 2. **Deployment User**
**User Name:** `serverless-deploy`

**To View:**
```
IAM → Users → serverless-deploy
```

**Attached Policies:**
- AWSLambdaFullAccess
- IAMFullAccess
- AmazonAPIGatewayAdministrator
- CloudFormationFullAccess
- AmazonS3FullAccess
- CloudWatchLogsFullAccess

**To Manage:**
```
1. Click user name
2. Tab: Permissions
3. Add/remove policies as needed
```

#### 3. **Security Best Practices**

**Rotate Access Keys:**
```
1. IAM → Users → serverless-deploy
2. Security credentials tab
3. Create new access key
4. Update local AWS credentials
5. Delete old access key
```

**Enable MFA:**
```
1. IAM → Users → serverless-deploy
2. Security credentials tab
3. Assign MFA device
4. Follow setup wizard
```

---

## 📦 S3 Deployment Artifacts

### Accessing S3 Console

**URL:** https://console.aws.amazon.com/s3/home?region=us-east-1

### Your Bucket

**Bucket Name:** `ecommerce-backend-dev-serverlessdeploymentbucket-*`

### What You Can Do:

#### 1. **View Deployment Packages**
```
S3 → Buckets → ecommerce-backend-dev-serverlessdeploymentbucket-*
```

**Contains:**
- Compiled deployment packages (.zip)
- CloudFormation templates
- Serverless state files

#### 2. **View Package Details**
- Click on any `.zip` file
- See:
  - Size
  - Last modified
  - Storage class
  - Encryption

#### 3. **Download Deployment Package**
```
1. Select .zip file
2. Click "Download"
3. Can inspect locally
```

#### 4. **View Bucket Properties**
- **Tab:** Properties
- **Shows:**
  - Versioning (enabled/disabled)
  - Encryption settings
  - Access logging

---

## 🛠️ Common Management Tasks

### Task 1: Check API Health

**Steps:**
```
1. API Gateway → dev-ecommerce-backend
2. Copy Invoke URL
3. Test in browser or curl:
   curl https://uormw7fllg.execute-api.us-east-1.amazonaws.com/
```

### Task 2: View Recent Errors

**Steps:**
```
1. CloudWatch → Logs → /aws/lambda/ecommerce-backend-dev-api
2. Click most recent log stream
3. Search for "ERROR" or "error"
4. Review stack traces
```

### Task 3: Monitor Performance

**Steps:**
```
1. Lambda → ecommerce-backend-dev-api → Monitor
2. View metrics:
   - Invocations (request count)
   - Duration (response time)
   - Errors
3. Set time range (1 hour, 1 day, 1 week)
```

### Task 4: Update Environment Variables

**Steps:**
```
1. Lambda → ecommerce-backend-dev-api
2. Configuration → Environment variables
3. Click "Edit"
4. Update values
5. Click "Save"
```

### Task 5: View API Request Logs

**Steps:**
```
1. API Gateway → dev-ecommerce-backend → Monitor
2. View metrics dashboard
3. Check:
   - Request count
   - Error rates (4XX, 5XX)
   - Latency
```

### Task 6: Create CloudWatch Alarm

**Steps:**
```
1. CloudWatch → Alarms → Create alarm
2. Select metric:
   - Lambda → By Function Name → ecommerce-backend-dev-api → Errors
3. Set threshold: > 10 errors
4. Set period: 5 minutes
5. Configure notification (email/SNS)
6. Create alarm
```

### Task 7: View Deployment History

**Steps:**
```
1. CloudFormation → ecommerce-backend-dev
2. Tab: Events
3. See all deployment events
4. Filter by date/status
```

### Task 8: Check Costs

**Steps:**
```
1. AWS Console → Billing Dashboard
2. Cost Explorer
3. Filter by service:
   - Lambda
   - API Gateway
   - CloudWatch
4. View daily/monthly costs
```

---

## 📱 AWS Mobile App

### Download AWS Console App

**iOS:** App Store → "AWS Console"
**Android:** Play Store → "AWS Console"

### Features:
- View Lambda metrics
- Check CloudWatch logs
- Monitor alarms
- View billing
- Receive notifications

---

## 🔔 Setting Up Notifications

### Email Notifications for Errors

**Steps:**
```
1. SNS → Topics → Create topic
2. Name: "lambda-errors"
3. Create subscription:
   - Protocol: Email
   - Endpoint: your-email@example.com
4. Confirm subscription via email
5. CloudWatch → Create alarm
6. Action: Send to SNS topic "lambda-errors"
```

---

## 📊 Recommended Monitoring Setup

### Essential Alarms:

1. **High Error Rate**
   - Metric: Lambda Errors
   - Threshold: > 5% error rate
   - Period: 5 minutes

2. **High Latency**
   - Metric: Lambda Duration
   - Threshold: > 3000ms average
   - Period: 5 minutes

3. **API Gateway 5XX Errors**
   - Metric: 5XXError
   - Threshold: > 10 errors
   - Period: 5 minutes

4. **Cost Alert**
   - Service: Billing
   - Threshold: > $10/month
   - Period: Daily

---

## 🎯 Quick Links Reference

| Service | Console URL |
|---------|-------------|
| Lambda | https://console.aws.amazon.com/lambda/home?region=us-east-1 |
| API Gateway | https://console.aws.amazon.com/apigateway/home?region=us-east-1 |
| CloudWatch | https://console.aws.amazon.com/cloudwatch/home?region=us-east-1 |
| CloudFormation | https://console.aws.amazon.com/cloudformation/home?region=us-east-1 |
| IAM | https://console.aws.amazon.com/iam/home |
| S3 | https://console.aws.amazon.com/s3/home?region=us-east-1 |
| Billing | https://console.aws.amazon.com/billing/home |

---

## 💡 Best Practices

1. **Always check the region** - Ensure you're in us-east-1
2. **Use CloudWatch dashboards** - Create custom views
3. **Set up alarms** - Get notified of issues
4. **Monitor costs** - Set billing alerts
5. **Regular log reviews** - Check for errors weekly
6. **Rotate credentials** - Update access keys quarterly
7. **Tag resources** - Add tags for organization
8. **Document changes** - Keep track of manual updates

---

## 🆘 Troubleshooting

### Can't Find Resources?
- Check region (top-right corner)
- Ensure you're logged into correct AWS account

### No Logs Appearing?
- Wait 1-2 minutes for logs to appear
- Check Lambda has been invoked
- Verify CloudWatch permissions

### High Costs?
- Check CloudWatch → Billing
- Review Lambda invocations
- Check for infinite loops
- Review API Gateway request count

---

**Last Updated:** December 5, 2025  
**Your Deployment:** ecommerce-backend-dev  
**Region:** us-east-1 (N. Virginia)
