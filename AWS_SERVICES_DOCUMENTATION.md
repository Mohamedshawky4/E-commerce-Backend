# AWS Services Documentation
## E-Commerce Backend Deployment

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [AWS Services Used](#aws-services-used)
4. [Service Details](#service-details)
5. [Cost Analysis](#cost-analysis)
6. [Benefits & Advantages](#benefits--advantages)
7. [Deployment Workflow](#deployment-workflow)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Executive Summary

This document provides comprehensive documentation of the AWS services utilized for deploying the e-commerce backend application. The deployment leverages a serverless architecture using AWS Lambda and API Gateway, providing a scalable, cost-effective, and highly available solution.

**Project**: E-Commerce Backend API  
**Deployment Type**: Serverless  
**Primary Services**: AWS Lambda, API Gateway  
**Database**: MongoDB Atlas (External)  
**Deployment Framework**: Serverless Framework  

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────┐
│   Internet      │
│   Clients       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Amazon API Gateway            │
│   (HTTP API)                    │
│   - HTTPS Endpoint              │
│   - Request Routing             │
│   - CORS Handling               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   AWS Lambda                    │
│   Function: ecommerce-backend   │
│   - Express.js Application      │
│   - Node.js 20 Runtime          │
│   - 512MB Memory                │
│   - 30s Timeout                 │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   MongoDB Atlas                 │
│   (External Database)           │
│   - Cloud-hosted MongoDB        │
│   - Connection Pooling          │
└─────────────────────────────────┘

Supporting Services:
├── CloudWatch Logs (Logging)
├── CloudFormation (Infrastructure)
├── IAM (Security)
└── S3 (Deployment Artifacts)
```

---

## AWS Services Used

### Core Services (6)

| # | Service | Purpose | Category |
|---|---------|---------|----------|
| 1 | **AWS Lambda** | Serverless compute to run backend code | Compute |
| 2 | **API Gateway** | HTTP API endpoint and routing | Networking |
| 3 | **CloudWatch Logs** | Application logging and monitoring | Monitoring |
| 4 | **CloudFormation** | Infrastructure as Code management | Management |
| 5 | **IAM** | Security and access control | Security |
| 6 | **S3** | Deployment package storage | Storage |

---

## Service Details

### 1. AWS Lambda

**Description**: AWS Lambda is a serverless compute service that runs code without provisioning servers.

**Configuration**:
- **Function Name**: `ecommerce-backend-dev-api`
- **Runtime**: Node.js 20.x
- **Memory**: 512 MB
- **Timeout**: 30 seconds
- **Handler**: `lambda.handler`
- **Package Size**: ~144 KB (compressed)

**Key Features**:
- ✅ Automatic scaling (0 to thousands of requests)
- ✅ Pay-per-use pricing (only charged when code runs)
- ✅ Built-in fault tolerance and high availability
- ✅ Integrated with CloudWatch for logging
- ✅ No server management required

**Environment Variables**:
```
MONGODB_URI          - MongoDB Atlas connection string
JWT_SECRET           - JWT token signing secret
PAYMOB_API_KEY       - Payment gateway API key
PAYMOB_INTEGRATION_ID - Payment integration ID
PAYMOB_IFRAME_ID     - Payment iframe ID
PORT                 - Application port (5000)
NODE_ENV             - Environment (production)
```

**Use Case in Project**:
- Executes Express.js backend application
- Handles all API requests (products, users, orders, etc.)
- Connects to MongoDB Atlas for data persistence
- Processes authentication and authorization

---

### 2. Amazon API Gateway (HTTP API)

**Description**: API Gateway is a fully managed service for creating, publishing, and securing APIs at any scale.

**Configuration**:
- **Type**: HTTP API (v2)
- **Endpoint**: `https://uormw7fllg.execute-api.us-east-1.amazonaws.com`
- **Region**: us-east-1 (N. Virginia)
- **Protocol**: HTTPS only
- **CORS**: Enabled

**Routes**:
```
ANY /{proxy+}  → Lambda Function
ANY /          → Lambda Function
```

**Key Features**:
- ✅ Automatic HTTPS encryption
- ✅ Built-in DDoS protection (AWS Shield)
- ✅ Request/response transformation
- ✅ API versioning support
- ✅ Throttling and rate limiting
- ✅ 71% cheaper than REST API Gateway

**Use Case in Project**:
- Provides public HTTPS endpoint for the API
- Routes all HTTP requests to Lambda function
- Handles CORS for frontend integration
- Manages request/response formatting

---

### 3. Amazon CloudWatch Logs

**Description**: CloudWatch Logs enables monitoring, storing, and accessing log files from AWS resources.

**Configuration**:
- **Log Group**: `/aws/lambda/ecommerce-backend-dev-api`
- **Retention**: Default (never expire)
- **Log Streams**: Auto-created per Lambda execution

**Key Features**:
- ✅ Real-time log streaming
- ✅ Log search and filtering
- ✅ Metric extraction from logs
- ✅ Integration with Lambda (automatic)
- ✅ CloudWatch Insights for analysis

**Logged Information**:
- Lambda function invocations
- Application console.log() output
- Error messages and stack traces
- MongoDB connection status
- Request/response details
- Performance metrics

**Access Methods**:
```bash
# Via AWS CLI
aws logs tail /aws/lambda/ecommerce-backend-dev-api --follow

# Via npm script
npm run logs

# Via AWS Console
https://console.aws.amazon.com/cloudwatch
```

---

### 4. AWS CloudFormation

**Description**: CloudFormation provides Infrastructure as Code (IaC) to model and provision AWS resources.

**Configuration**:
- **Stack Name**: `ecommerce-backend-dev`
- **Template**: Generated by Serverless Framework
- **Resources**: Lambda, API Gateway, IAM roles, etc.

**Key Features**:
- ✅ Declarative infrastructure definition
- ✅ Automatic resource provisioning
- ✅ Stack rollback on failure
- ✅ Change sets for preview
- ✅ Drift detection

**Managed Resources**:
1. Lambda Function
2. Lambda Execution Role
3. Lambda Log Group
4. API Gateway HTTP API
5. API Gateway Routes
6. API Gateway Integrations
7. Lambda Permissions

**Use Case in Project**:
- Serverless Framework generates CloudFormation template
- Deploys all resources as a single stack
- Enables easy updates and rollbacks
- Manages resource dependencies automatically

---

### 5. AWS IAM (Identity and Access Management)

**Description**: IAM enables secure control of access to AWS services and resources.

**Components Used**:

**1. Execution Role** (Auto-created by Serverless Framework)
- **Name**: `ecommerce-backend-dev-{region}-lambdaRole`
- **Purpose**: Grants Lambda permission to access AWS services

**Permissions**:
```json
{
  "Effect": "Allow",
  "Action": [
    "logs:CreateLogGroup",
    "logs:CreateLogStream",
    "logs:PutLogEvents"
  ],
  "Resource": "*"
}
```

**2. Deployment User**
- **Name**: `serverless-deploy`
- **Type**: IAM User with programmatic access
- **Policies Attached**:
  - AWSLambdaFullAccess
  - IAMFullAccess
  - AmazonAPIGatewayAdministrator
  - CloudFormationFullAccess
  - AmazonS3FullAccess
  - CloudWatchLogsFullAccess

**Key Features**:
- ✅ Principle of least privilege
- ✅ Fine-grained access control
- ✅ Multi-factor authentication support
- ✅ Temporary security credentials
- ✅ Audit trail via CloudTrail

---

### 6. Amazon S3 (Simple Storage Service)

**Description**: S3 is object storage built to store and retrieve any amount of data.

**Configuration**:
- **Bucket Name**: `ecommerce-backend-dev-serverlessdeploymentbucket-*`
- **Region**: us-east-1
- **Access**: Private (IAM-controlled)

**Stored Objects**:
- Deployment packages (.zip files)
- CloudFormation templates
- Serverless Framework state files

**Key Features**:
- ✅ 99.999999999% (11 9's) durability
- ✅ Versioning support
- ✅ Encryption at rest
- ✅ Lifecycle policies
- ✅ Cross-region replication

**Use Case in Project**:
- Stores Lambda deployment packages
- Maintains deployment history
- Enables rollback to previous versions

---

## Cost Analysis

### Monthly Cost Breakdown

#### With AWS Free Tier (First 12 Months)

| Service | Free Tier | Usage | Monthly Cost |
|---------|-----------|-------|--------------|
| **AWS Lambda** | 1M requests/month<br>400,000 GB-seconds | ~50K requests<br>25,000 GB-seconds | **$0.00** |
| **API Gateway** | 1M API calls/month | ~50K calls | **$0.00** |
| **CloudWatch Logs** | 5GB ingestion<br>5GB storage | ~0.5GB | **$0.00** |
| **S3** | 5GB storage<br>20,000 GET requests | ~0.1GB | **$0.00** |
| **CloudFormation** | No charge | N/A | **$0.00** |
| **IAM** | No charge | N/A | **$0.00** |
| **Total** | | | **~$0.00/month** |

#### After Free Tier Expires

| Service | Pricing | Usage | Monthly Cost |
|---------|---------|-------|--------------|
| **AWS Lambda** | $0.20 per 1M requests<br>$0.0000166667 per GB-second | 50K requests<br>25,000 GB-seconds | **$0.42** |
| **API Gateway** | $1.00 per 1M requests | 50K requests | **$0.05** |
| **CloudWatch Logs** | $0.50 per GB ingested<br>$0.03 per GB stored | 0.5GB ingested<br>5GB stored | **$0.40** |
| **S3** | $0.023 per GB<br>$0.0004 per 1K requests | 0.1GB<br>1K requests | **$0.01** |
| **Data Transfer** | $0.09 per GB (after 1GB free) | ~2GB | **$0.09** |
| **Total** | | | **~$0.97/month** |

### Cost Comparison

**Traditional EC2 Deployment**:
- t3.small instance: $15.18/month (24/7)
- Load balancer: $16.20/month
- **Total**: ~$31.38/month

**Serverless Deployment**:
- **Total**: ~$0.97/month (after free tier)

**Savings**: ~$30.41/month (97% cost reduction)

---

## Benefits & Advantages

### 1. Cost Efficiency
- ✅ **Pay-per-use**: Only charged for actual requests
- ✅ **No idle costs**: Unlike EC2, no charges when not in use
- ✅ **Free tier**: Generous free tier for development/testing
- ✅ **97% cheaper**: Compared to traditional EC2 deployment

### 2. Scalability
- ✅ **Automatic scaling**: From 0 to thousands of concurrent requests
- ✅ **No capacity planning**: AWS handles all scaling
- ✅ **Global reach**: Deploy to multiple regions easily
- ✅ **Burst handling**: Handles traffic spikes automatically

### 3. Reliability
- ✅ **99.95% SLA**: High availability guarantee
- ✅ **Multi-AZ**: Automatic deployment across availability zones
- ✅ **Fault tolerance**: Built-in redundancy
- ✅ **DDoS protection**: AWS Shield included

### 4. Operational Excellence
- ✅ **No server management**: Zero infrastructure maintenance
- ✅ **Automatic patching**: AWS handles OS and runtime updates
- ✅ **Built-in monitoring**: CloudWatch integration
- ✅ **Easy rollbacks**: Version control and instant rollback

### 5. Security
- ✅ **HTTPS by default**: All traffic encrypted
- ✅ **IAM integration**: Fine-grained access control
- ✅ **VPC support**: Network isolation (if needed)
- ✅ **Compliance**: SOC, PCI DSS, HIPAA compliant

### 6. Developer Experience
- ✅ **Fast deployment**: Deploy in ~90 seconds
- ✅ **Local testing**: serverless-offline for development
- ✅ **Infrastructure as Code**: Version-controlled configuration
- ✅ **Easy updates**: Single command deployment

---

## Deployment Workflow

### 1. Development Phase
```bash
# Local development with hot reload
npm run dev

# Local Lambda emulation
npm run offline

# Run tests
npm test
```

### 2. Deployment Phase
```bash
# Deploy to AWS
npm run deploy:aws

# Deploy to production
npm run deploy:prod
```

### 3. Monitoring Phase
```bash
# View real-time logs
npm run logs

# Check function metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=ecommerce-backend-dev-api
```

### 4. Rollback (if needed)
```bash
# List deployments
serverless deploy list

# Rollback to previous version
serverless rollback --timestamp TIMESTAMP
```

---

## Monitoring & Maintenance

### Key Metrics to Monitor

**Lambda Metrics**:
- Invocations (request count)
- Duration (execution time)
- Errors (failed requests)
- Throttles (rate limit hits)
- Concurrent Executions

**API Gateway Metrics**:
- Count (total requests)
- 4XXError (client errors)
- 5XXError (server errors)
- Latency (response time)

### Alerting Setup

**Recommended CloudWatch Alarms**:
1. **High Error Rate**: > 5% errors in 5 minutes
2. **High Latency**: > 3000ms average latency
3. **Throttling**: Any throttled requests
4. **Cost Alert**: Monthly spend > $10

### Maintenance Tasks

**Weekly**:
- Review CloudWatch logs for errors
- Check cost and usage reports
- Verify backup/deployment artifacts

**Monthly**:
- Review and optimize Lambda memory/timeout
- Analyze cold start metrics
- Update dependencies (npm packages)
- Review IAM permissions

**Quarterly**:
- Security audit
- Cost optimization review
- Performance benchmarking
- Disaster recovery testing

---

## Conclusion

The serverless architecture using AWS Lambda and API Gateway provides a robust, scalable, and cost-effective solution for the e-commerce backend. The deployment leverages six core AWS services that work together seamlessly to deliver:

- **97% cost savings** compared to traditional infrastructure
- **Automatic scaling** from zero to thousands of requests
- **High availability** with 99.95% SLA
- **Zero server management** overhead
- **Built-in security** and compliance

This architecture is ideal for applications with variable traffic patterns and enables the development team to focus on building features rather than managing infrastructure.

---

**Document Version**: 1.0  
**Last Updated**: December 5, 2025  
**Author**: AWS Deployment Team  
**Project**: E-Commerce Backend API
