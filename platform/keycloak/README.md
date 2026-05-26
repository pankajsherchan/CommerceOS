# Keycloak

`platform/keycloak` contains the local Keycloak bootstrap configuration for
CommerceOS authentication.

## Run Locally

Start Keycloak from this directory:

```bash
cd platform/keycloak
docker compose up -d
```

Keycloak runs at `http://localhost:8080`.

Local admin console:

- URL: `http://localhost:8080/admin`
- Username: `admin`
- Password: `admin`

The Compose service uses the official Keycloak container image and starts with
`start-dev --import-realm`. This imports `realm-commerceos.json` from
`/opt/keycloak/data/import` on first startup.

## Local Realm

`realm-commerceos.json` defines:

- Realm: `commerceos`
- Storefront OIDC client: `commerceos-storefront`
- Authorization-code flow with PKCE `S256`
- Local redirect URIs for `localhost` and `127.0.0.1` on ports `3000` and
  `3001`
- Local post-logout redirects for the same storefront origins
- Self-registration enabled for the storefront sign-up flow

No manual Keycloak UI setup is required after the import. The storefront auth
flow expects these values:

- Issuer URL: `http://localhost:8080/realms/commerceos`
- Client ID: `commerceos-storefront`
- Client type: public OIDC client
- Redirect URI: `http://localhost:3000/auth/callback`
- Fallback redirect URI: `http://localhost:3001/auth/callback`
- Post-logout redirects: `http://localhost:3000/*` and
  `http://localhost:3001/*`
- PKCE method: `S256`

## Storefront Setup

Create `apps/storefront/.env.local` from `apps/storefront/.env.example` and
set `STOREFRONT_AUTH_SESSION_SECRET` to a unique value with at least 32
characters.

For the default local setup:

```bash
KEYCLOAK_ISSUER_URL=http://localhost:8080/realms/commerceos
KEYCLOAK_CLIENT_ID=commerceos-storefront
STOREFRONT_AUTH_REDIRECT_URI=http://localhost:3000/auth/callback
```

If the storefront dev server falls back to port `3001`, set
`STOREFRONT_AUTH_REDIRECT_URI=http://localhost:3001/auth/callback`.

## Reset Imported Realm

Keycloak only imports a realm on startup when that realm does not already
exist. If `realm-commerceos.json` changes and you need a clean local import,
reset the local Keycloak volume:

```bash
cd platform/keycloak
docker compose down -v
docker compose up -d
```

This deletes local Keycloak users and sessions.

## Stop Locally

```bash
cd platform/keycloak
docker compose down
```
