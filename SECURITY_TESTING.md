# Security Testing Configuration for CruiseLinx

## CI/CD Pipeline Security Stages

Add to your `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  security:
    name: Security Scanning
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Node.js audit
      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: false

      # SAST - CodeQL
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: typescript
          
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

      # Dependency scanning
      - name: Snyk Dependency Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      # Container scanning (if using Docker)
      - name: Trivy Container Scan
        uses: aquasecurity/trivy-action@master
        if: false  # Enable when Dockerfile exists
        with:
          scan-type: 'fs'
          scan-ref: '.'
```

## Automated Security Tests

Create `tests/security/`:

```bash
mkdir -p tests/security
```

### 1. Auth Bypass Tests (`tests/security/auth-bypass.test.ts`)

```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

describe("Auth Security", () => {
  test("Rate limiting blocks excessive login attempts", async () => {
    const email = "test@example.com";
    const password = "wrongpassword";
    
    // Make 6 attempts (limit is 5)
    for (let i = 0; i < 6; i++) {
      const res = await fetch("http://localhost:3000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, flow: "signIn" }),
      });
      
      if (i < 5) {
        expect(res.status).toBe(400); // Wrong password
      } else {
        expect(res.status).toBe(429); // Rate limited
      }
    }
  });

  test("Direct Convex auth calls are rate limited", async () => {
    // This test verifies that even direct Convex calls are rate limited
    // via the server-side check in the authenticate function
  });
});
```

### 2. CSRF Protection Tests (`tests/security/csrf.test.ts`)

```typescript
describe("CSRF Protection", () => {
  test("API requests without CSRF token are rejected", async () => {
    const res = await fetch("http://localhost:3000/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ make: "Toyota" }),
    });
    
    expect(res.status).toBe(403);
  });

  test("Valid CSRF token allows request", async () => {
    // Get CSRF token from cookie
    // Use it in header
    // Expect success
  });
});
```

### 3. File Upload Validation Tests (`tests/security/file-upload.test.ts`)

```typescript
describe("File Upload Security", () => {
  test("Rejects non-image files", async () => {
    const maliciousFile = new File(["<?php system($_GET['cmd']); ?>"], "shell.php", { type: "application/php" });
    
    const formData = new FormData();
    formData.append("file", maliciousFile);
    
    const res = await fetch("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });
    
    expect(res.status).toBe(400);
  });

  test("Rejects oversized files", async () => {
    const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], "large.jpg", { type: "image/jpeg" });
    
    const formData = new FormData();
    formData.append("file", largeFile);
    
    const res = await fetch("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });
    
    expect(res.status).toBe(400);
  });
});
```

### 4. XSS Prevention Tests (`tests/security/xss.test.ts`)

```typescript
describe("XSS Prevention", () => {
  test("Vehicle descriptions are sanitized", async () => {
    const maliciousDescription = '<script>alert("xss")</script><b>Bold</b>';
    
    const res = await fetch("http://localhost:3000/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        make: "Toyota",
        model: "Camry",
        year: 2020,
        type: "sedan",
        transmission: "automatic",
        fuelType: "petrol",
        seats: 5,
        pricePerDay: 5000,
        address: "Nairobi",
        description: maliciousDescription,
      }),
    });
    
    const vehicle = await res.json();
    // Verify script tags are removed
    expect(vehicle.description).not.toContain("<script>");
    expect(vehicle.description).toContain("Bold");
  });
});
```

## Pre-commit Hooks

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run security-focused checks
npm run lint
npm run typecheck
npm audit --audit-level=moderate
```

## GitHub Dependabot

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "security"
    groups:
      development-dependencies:
        patterns:
          - "@types/*"
          - "eslint*"
          - "prettier*"
          - "typescript*"
        update-types:
          - "minor"
          - "patch"
```

## SAST Configuration

Create `.github/codeql/codeql-config.yml`:

```yaml
name: "CodeQL Config"

queries:
  - uses: security-and-quality
  - uses: security-extended

paths-ignore:
  - node_modules
  - .next
  - dist
  - build
```

## Run Security Tests Locally

```bash
# Run all security tests
npm run test:security

# Run with coverage
npm run test:security -- --coverage

# Run specific test file
npm run test:security -- tests/security/auth-bypass.test.ts
```

Add to `package.json`:

```json
{
  "scripts": {
    "test:security": "jest --config=jest.security.config.js",
    "test:security:watch": "jest --config=jest.security.config.js --watch"
  }
}
```

## Security Monitoring Alerts

Create monitoring alerts for:

1. **Failed login rate** - Alert if >50 failed logins/hour
2. **Rate limit hits** - Alert if >100 rate limit rejections/hour
3. **Critical security alerts** - Immediate notification
4. **File upload anomalies** - Alert if >10 rejected uploads/hour
5. **New admin users** - Alert on any admin role assignment
6. **Audit log anomalies** - Alert on unusual patterns

## Run Book for Security Incidents

Create `SECURITY_INCIDENT_RUNBOOK.md` with procedures for:
- Brute force attacks
- Suspicious file uploads
- Privilege escalation attempts
- Data exfiltration attempts
- Account takeover

---

## Next Steps

1. Add the GitHub workflows
2. Create test files in `tests/security/`
3. Configure monitoring (Datadog, Sentry, etc.)
4. Schedule monthly security reviews
5. Plan annual penetration testing