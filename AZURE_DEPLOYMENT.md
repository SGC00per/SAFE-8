# Azure Deployment Guide for SAFE-8 Assessment

This guide provides multiple deployment options for the SAFE-8 AI Readiness Assessment on Microsoft Azure.

## Deployment Options

### 🚀 Option 1: Azure Static Web Apps (Recommended)

Azure Static Web Apps is perfect for this application and provides:
- Global CDN distribution
- Automatic CI/CD from GitHub
- Built-in authentication
- Serverless API functions
- Custom domain support

#### Prerequisites
- Azure subscription
- GitHub account
- Azure CLI installed

#### Step-by-Step Deployment

1. **Prepare the Repository**
```bash
# Ensure your code is committed to GitHub
git add .
git commit -m "Ready for Azure deployment"
git push origin main
```

2. **Create Azure Static Web App**
```bash
# Login to Azure CLI
az login

# Create resource group
az group create --name "rg-safe8-assessment" --location "East US"

# Create Static Web App
az staticwebapp create \
  --name "safe8-assessment" \
  --resource-group "rg-safe8-assessment" \
  --source "https://github.com/YOUR_USERNAME/YOUR_REPO" \
  --location "East US" \
  --branch "main" \
  --app-location "/" \
  --api-location "api" \
  --output-location "dist"
```

3. **Configure Build Settings**
Create `.github/workflows/azure-static-web-apps.yml`:
```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: "api"
          output_location: "dist"

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

4. **Convert to Azure Functions API**
Create `api/` directory and convert Hono endpoints:
```typescript
// api/assessments/index.ts
import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest): Promise<void> => {
    // Your API logic here
    context.res = {
        status: 200,
        body: { message: "Assessment API" }
    }
}

export default httpTrigger
```

### 🏗️ Option 2: Azure Container Apps

For more complex scenarios requiring full control:

1. **Containerize the Application**
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/_worker.js"]
```

2. **Deploy to Azure Container Apps**
```bash
# Create container registry
az acr create --resource-group rg-safe8-assessment --name safe8registry --sku Basic

# Build and push image
az acr build --registry safe8registry --image safe8-assessment:latest .

# Create container app environment
az containerapp env create \
  --name safe8-env \
  --resource-group rg-safe8-assessment \
  --location eastus

# Deploy container app
az containerapp create \
  --name safe8-assessment \
  --resource-group rg-safe8-assessment \
  --environment safe8-env \
  --image safe8registry.azurecr.io/safe8-assessment:latest \
  --target-port 3000 \
  --ingress external
```

### 🗄️ Database Options

#### Option A: Azure SQL Database
```bash
# Create SQL Server
az sql server create \
  --name safe8-sql-server \
  --resource-group rg-safe8-assessment \
  --location eastus \
  --admin-user sqladmin \
  --admin-password YourSecurePassword123!

# Create database
az sql db create \
  --resource-group rg-safe8-assessment \
  --server safe8-sql-server \
  --name safe8-assessment-db \
  --service-objective Basic
```

#### Option B: Azure Cosmos DB (NoSQL)
```bash
# Create Cosmos DB account
az cosmosdb create \
  --name safe8-cosmosdb \
  --resource-group rg-safe8-assessment \
  --kind GlobalDocumentDB

# Create database and container
az cosmosdb sql database create \
  --account-name safe8-cosmosdb \
  --resource-group rg-safe8-assessment \
  --name safe8-db

az cosmosdb sql container create \
  --account-name safe8-cosmosdb \
  --resource-group rg-safe8-assessment \
  --database-name safe8-db \
  --name assessments \
  --partition-key-path "/leadId"
```

### 📧 Email Integration Options

#### Option A: Azure Logic Apps (Recommended)
1. Create Logic App with HTTP trigger
2. Configure email connector (Outlook, Gmail, SendGrid)
3. Use webhook endpoint in application

#### Option B: Azure Communication Services
```bash
# Create Communication Services resource
az communication create \
  --name safe8-communication \
  --resource-group rg-safe8-assessment \
  --location global
```

### 🔐 Environment Variables

Set application settings:
```bash
# For Static Web Apps
az staticwebapp appsettings set \
  --name safe8-assessment \
  --setting-names EMAIL_API_KEY=your_key ADMIN_EMAIL=shane@forvismazars.com

# For Container Apps
az containerapp update \
  --name safe8-assessment \
  --resource-group rg-safe8-assessment \
  --set-env-vars EMAIL_API_KEY=your_key ADMIN_EMAIL=shane@forvismazars.com
```

### 🌐 Custom Domain Setup

1. **Configure custom domain in Azure**
```bash
az staticwebapp hostname set \
  --name safe8-assessment \
  --hostname assessment.forvismazars.com
```

2. **Update DNS records**
- Add CNAME record pointing to your Azure Static Web App URL
- Configure SSL certificate (automatically handled by Azure)

### 📊 Monitoring and Analytics

1. **Enable Application Insights**
```bash
az monitor app-insights component create \
  --app safe8-insights \
  --location eastus \
  --resource-group rg-safe8-assessment \
  --application-type web
```

2. **Configure alerts**
```bash
az monitor metrics alert create \
  --name "High Error Rate" \
  --resource-group rg-safe8-assessment \
  --scopes "/subscriptions/{subscription-id}/resourceGroups/rg-safe8-assessment/providers/Microsoft.Web/staticSites/safe8-assessment" \
  --condition "avg exceptions/requests > 0.1" \
  --description "Alert when error rate exceeds 10%"
```

### 🚀 CI/CD Pipeline

Azure DevOps Pipeline (`azure-pipelines.yml`):
```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'
  displayName: 'Install Node.js'

- script: |
    npm ci
    npm run build
  displayName: 'Build application'

- task: AzureStaticWebApp@0
  inputs:
    app_location: '/'
    api_location: 'api'
    output_location: 'dist'
  displayName: 'Deploy to Azure Static Web Apps'
```

### 🔧 Configuration Files

Update `wrangler.jsonc` for Azure compatibility:
```json
{
  "name": "safe8-assessment-azure",
  "compatibility_date": "2024-01-01",
  "build": {
    "command": "npm run build"
  },
  "env": {
    "production": {
      "vars": {
        "ENVIRONMENT": "azure-production"
      }
    }
  }
}
```

### 🧪 Testing Deployment

1. **Local testing with Azure Functions Core Tools**
```bash
npm install -g azure-functions-core-tools@4
func start
```

2. **Load testing**
```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 https://your-app.azurestaticapps.net
```

### 💰 Cost Optimization

- Use Azure Static Web Apps free tier (100GB bandwidth/month)
- Implement Azure CDN for global performance
- Use serverless Azure SQL for variable workloads
- Set up budget alerts for cost monitoring

### 📋 Post-Deployment Checklist

- [ ] Custom domain configured and SSL enabled
- [ ] Environment variables set
- [ ] Database connection tested
- [ ] Email notifications working
- [ ] Analytics and monitoring enabled
- [ ] Backup and disaster recovery configured
- [ ] Security scanning completed
- [ ] Performance testing passed
- [ ] Documentation updated

### 🆘 Troubleshooting

**Common Issues:**
1. **Build failures**: Check Node.js version compatibility
2. **Database connection**: Verify connection strings and firewall rules
3. **Email delivery**: Check spam folders and email service quotas
4. **CORS issues**: Configure allowed origins in Azure

**Support Resources:**
- Azure Static Web Apps documentation
- Azure Container Apps documentation
- Microsoft Learn paths for serverless applications

This deployment approach will give you a production-ready, scalable SAFE-8 assessment platform on Azure with enterprise-grade security and performance.