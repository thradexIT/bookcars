# Mitos Public Experience — I0 Backend Restart Observation · 2026-08-20

**Classification:** BASELINE ENVIRONMENT / TRANSIENT RESTART STATE  
**Branch:** `feature/mitos-public-experience-v1`

## Observation

After correcting the local ignored Docker env value:

```text
BC_FRONTEND_HOST=https://localhost:8080/
```

the backend container was force-recreated.

The browser was refreshed while `bc-dev-backend` was still executing its `dev:setup` startup sequence. DevTools showed `ERR_EMPTY_RESPONSE` for requests including:

```text
GET  http://localhost:4002/api/settings
POST http://localhost:4002/api/sign-out
GET  http://localhost:4002/api/all-suppliers
```

At the same time the backend logs ended during TypeScript build and had not yet emitted the canonical readiness log:

```text
HTTP server is running on port 4002
```

## Interpretation

This observation must not be classified as a Mitos regression or as proof that the CORS correction failed.

The backend Docker development command is `npm run dev:setup`, which performs build/setup before starting the development server. During that window, requests to port 4002 may receive no response.

## Required next evidence

Wait until backend startup reaches the server-ready state, then execute:

```text
curl -i http://localhost:4002/api/settings
browser hard refresh of https://localhost:8080/
backend log inspection for Incoming Origin: https://localhost:8080
confirm absence/presence of Not allowed by CORS
```

Only the post-ready browser request may determine whether the local CORS blocker is closed.

## Gate effect

```text
I0 runtime environment   🟡 IN PROGRESS
CORS fix                 🟡 NOT YET POST-READY VERIFIED
I1                       🔒 LOCKED
```
