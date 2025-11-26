# API Keys and Credentials

> **IMPORTANT**: Never commit this file with actual credentials to version control!

## Azure OpenAI Configuration

```env
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your_deployment_name
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

### How to Get Azure OpenAI Credentials:

1. Go to [Azure Portal](https://portal.azure.com)
2. Create an Azure OpenAI resource
3. Deploy a model (GPT-4 or GPT-4o recommended)
4. Copy API key from "Keys and Endpoint" section
5. Copy endpoint URL
6. Copy deployment name

---

## GitHub App Configuration

```env
GITHUB_APP_ID=your_app_id
GITHUB_PRIVATE_KEY=your_private_key_content
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_TOKEN=your_personal_access_token
```

### How to Create GitHub App:

1. Go to GitHub Settings → Developer settings → GitHub Apps
2. Click "New GitHub App"
3. Configure permissions:
   - Pull requests: Read & Write
   - Contents: Read-only
   - Metadata: Read-only
4. Enable webhook and set secret
5. Generate and download private key
6. Install app on repositories

---

## Optional: OpenAI Direct API (Alternative to Azure)

```env
OPENAI_API_KEY=sk-your_openai_key_here
OPENAI_ORG_ID=org-your_org_id
```

Get from: [OpenAI Platform](https://platform.openai.com/api-keys)

---

## Notes

- Keep this file secure
- Rotate keys regularly
- Use environment variables in production
- Never hardcode credentials in source code
- Consider using Azure Key Vault or similar services for production
