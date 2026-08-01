# Penetration Testing Plan for CruiseLinx

## Executive Summary

This document outlines the penetration testing strategy for the CruiseLinx car rental marketplace application. Testing should be conducted by qualified security professionals with explicit written authorization.

## Scope

### In-Scope
- **Web Application**: `https://cruiselinx.example.com` (production) and staging environment
- **API Endpoints**: All `/api/*` routes
- **Convex Backend**: All mutations, queries, and actions
- **Authentication System**: Login, registration, password reset, session management
- **Payment Integration**: M-Pesa callback handling
- **File Upload**: Vehicle images, KYC documents, check-in/out photos
- **Real-time Features**: Push notifications, messaging
- **Admin Panel**: `/admin/*` routes

### Out-of-Scope
- Third-party services (M-Pesa, Mapbox, Convex infrastructure)
- Denial of Service testing (separate authorization required)
- Social engineering / phishing
- Physical security

## Testing Methodology

### 1. Reconnaissance Phase
- Subdomain enumeration
- Technology fingerprinting
- API endpoint discovery
- JavaScript source analysis

### 2. Authentication & Authorization Testing
| Test Case | Priority | Description |
|-----------|----------|-------------|
| AUTH-01 | Critical | Bypass login via direct Convex calls |
| AUTH-02 | Critical | Session fixation / hijacking |
| AUTH-03 | High | Password reset token reuse |
| AUTH-04 | High | JWT token manipulation |
| AUTH-05 | High | Race conditions in registration |
| AUTH-06 | Medium | Remember me token security |
| AUTH-07 | Medium | Concurrent session limits |
| AUTH-08 | Low | Password history enforcement |

### 3. Input Validation & Injection Testing
| Test Case | Priority | Description |
|-----------|----------|-------------|
| INJ-01 | Critical | SQL/NoSQL injection in Convex queries |
| INJ-02 | Critical | XSS in vehicle descriptions, messages, reviews |
| INJ-03 | High | Command injection in file processing |
| INJ-04 | High | Path traversal in file uploads |
| INJ-05 | Medium | Prototype pollution in API params |
| INJ-06 | Medium | CSV/Formula injection in exports |

### 4. Business Logic Testing
| Test Case | Priority | Description |
|-----------|----------|-------------|
| BIZ-01 | Critical | Price manipulation during booking |
| BIZ-02 | Critical | Race condition in vehicle availability |
| BIZ-03 | High | Booking cancellation without penalty |
| BIZ-04 | High | Double-booking via concurrent requests |
| BIZ-05 | High | M-Pesa callback manipulation |
| BIZ-06 | Medium | KYC document approval bypass |
| BIZ-07 | Medium | Review/rating manipulation |
| BIZ-08 | Low | Loyalty points abuse |

### 5. File Upload Testing
| Test Case | Priority | Description |
|-----------|----------|-------------|
| UP-01 | Critical | Upload executable disguised as image |
| UP-02 | Critical | SVG with embedded scripts |
| UP-03 | High | Oversized files (>10MB) |
| UP-04 | High | Malformed image headers |
| UP-05 | Medium | ZIP bombs / decompression bombs |
| UP-06 | Medium | Polyglot files |

### 6. API Security Testing
| Test Case | Priority | Description |
|-----------|----------|-------------|
| API-01 | Critical | Broken Object Level Authorization (BOLA) |
| API-02 | High | Mass assignment in vehicle creation |
| API-03 | High | Excessive data exposure in responses |
| API-04 | Medium | Missing rate limiting on sensitive endpoints |
| API-05 | Medium | CORS misconfiguration |
| API-06 | Low | API versioning issues |

### 7. Client-Side Security
| Test Case | Priority | Description |
|-----------|----------|-------------|
| CLI-01 | High | DOM-based XSS via URL params |
| CLI-02 | Medium | LocalStorage sensitive data exposure |
| CLI-03 | Medium | CSP bypass attempts |
| CLI-04 | Low | Clickjacking |
| CLI-05 | Low | Mixed content warnings |

### 8. Configuration & Deployment
| Test Case | Priority | Description |
|-----------|----------|-------------|
| CFG-01 | High | Debug endpoints exposed |
| CFG-02 | High | Default credentials |
| CFG-03 | Medium | Security headers missing |
| CFG-04 | Medium | Error messages leak stack traces |
| CFG-05 | Low | Cookie security flags |

## Testing Schedule

### Phase 1: Automated Scanning (Week 1)
- SAST: CodeQL, ESLint security rules
- DAST: OWASP ZAP baseline scan
- Dependency scan: npm audit, Snyk
- Container scan: Trivy (if Docker used)

### Phase 2: Manual Testing (Weeks 2-3)
- Authentication & Authorization
- Business Logic
- API Security
- File Upload

### Phase 3: Advanced Testing (Week 4)
- Race conditions
- Complex business logic
- Chained vulnerabilities
- Post-exploitation simulation

### Phase 4: Reporting & Remediation (Week 5)
- Findings documentation
- Risk rating (CVSS 4.0)
- Remediation verification
- Retest

## Deliverables

1. **Executive Summary** - Business risk overview
2. **Technical Report** - Detailed findings with PoC
3. **Remediation Guide** - Fix recommendations with code examples
4. **Retest Results** - Verification of fixes
4. **Attack Tree** - Chained vulnerability scenarios

## Rules of Engagement

1. **No data destruction** - Read-only where possible
2. **No user impact** - Use test accounts only
4. **Immediate reporting** - Critical findings within 1 hour
5. **Scope adherence** - No testing of out-of-scope systems
5. **Evidence preservation** - Screenshots, logs, request/response pairs

## Test Accounts Required

| Role | Email | Purpose |
|-------|-------|---------|
| Admin | pentest-admin@cruiselinx.test | Admin panel access |
| Host (verified) | pentest-host@cruiselinx.test | Vehicle listing, KYC approved |
| Renter | pentest-renter@cruiselinx.test | Booking, payments |
| Unverified Host | pentest-unverified@cruiselinx.test | KYC bypass testing |

## Tools Recommended

| Category | Tools |
|-----------|-------|
| Static Analysis | CodeQL, SonarQube, Semgrep |
| Dynamic Analysis | OWASP ZAP, Burp Suite Pro |
| API Testing | Postman, Insomnia, custom scripts |
| Auth Testing | Custom race condition scripts |
| Container | Trivy, Grype |
| Dependency | npm audit, Snyk, OWASP Dependency Check |
| Container | Trivy |

## Post-Test Activities

1. **Immediate** (within 24 hours):
   - Critical findings call with development team
   - Emergency patch coordination if needed

2. **Short-term** (1-2 weeks):
   - All High/Critical findings remediated
   - Retest of critical findings

3. **Long-term** (1-3 months):
   - Medium/Low findings remediated
   - Security architecture review
   - Threat modeling update

## Budget Estimation

| Activity | Effort | Cost Range |
|----------|--------|------------|
| Automated scanning setup | 1 day | $1,500 - $3,000 |
| Manual penetration testing | 10-15 days | $15,000 - $30,000 |
| Reporting & remediation support | 3-5 days | $5,000 - $10,000 |
| Retesting | 2-3 days | $3,000 - $6,000 |
| **Total** | **16-24 days** | **$24,500 - $49,000** |

## Compliance Mapping

| Standard | Requirement | Test Coverage |
|----------|-------------|---------------|
| OWASP Top 10 2021 | A01-A10 | All |
| PCI DSS | 6.5.1-6.5.10 | Injection, XSS, Auth |
| GDPR | Art. 32 | Encryption, Access Control |
| ISO 27001 | A.14.2 | Secure Development |

## Contacts

- **Technical Lead**: [Name/Email]
- **Security Team**: [Email]
- **Emergency**: [Phone]

## Approval

- [ ] Client Authorization Signed
- [ ] Scope Confirmed
- [ ] Rules of Engagement Agreed
- [ ] Test Environment Ready
- [ ] Test Accounts Provisioned
- [ ] Monitoring Alerted

---

*Document Version: 1.0*  
*Last Updated: 2024*  
*Classification: CONFIDENTIAL*