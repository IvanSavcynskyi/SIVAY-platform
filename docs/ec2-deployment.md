# SIVAY platform: GitHub Actions → existing EC2

The platform uses the existing ARM64 EC2 instance and RDS. The model remains a
separate Compose project. The existing Caddy serves `model.sivay.tech` and
`sivay.tech`; the platform's Nginx container serves React and proxies `/api/`.

```text
push main → GitHub Actions (ARM64) → tests/build → GHCR images tagged with commit SHA
          → restricted SSH command → pull images → Alembic → Compose → health checks

sivay.tech → existing Caddy → sivay-platform-web:8080
                              ├── React files
                              └── /api/* → sivay-platform-api:8000 → RDS + PostGIS
```

The server does not run npm builds or Python dependency installation. One backend
worker is limited to 384 MiB and the frontend to 64 MiB. These are initial limits;
measure actual model and platform load together. The current instance has 2 GiB
RAM. Migration containers temporarily consume additional memory. Existing model
limits are not reservations and can collectively exceed the host's capacity.

## Files and GitHub settings

- `.github/workflows/platform.yml`: build, frontend lint/tests, backend settings
  and import/hash checks, image publication, deployment after a successful build.
- `compose.production.yaml`: isolated project `sivay-platform`; no public backend
  port; frontend diagnostic port `127.0.0.1:8080`.
- `deploy/ssh-deploy.sh`: root-owned forced SSH command installed on EC2.
- `deploy/release.sh`: migration, replacement, and checks for a specific commit.
- `deploy/backend.env`: RDS/JWT credentials, ignored by Git.
- `deploy/runtime.env`: nonsecret runtime configuration, ignored by Git.

Configure repository Actions variables:

| Name | Value |
| --- | --- |
| `EC2_HOST` | `13.53.151.170` |
| `EC2_DEPLOY_ENABLED` | `true` after the server prerequisites below are complete |
| `VITE_GOOGLE_MAPS_API_KEY` | Browser key restricted to `https://sivay.tech/*` |
| `VITE_GOOGLE_MAPS_MAP_ID` | Your Google Maps map ID |

Configure Actions secrets:

| Name | Value |
| --- | --- |
| `EC2_SSH_KEY` | Dedicated deployment private key; not the administrator's key |
| `EC2_KNOWN_HOSTS` | EC2 SSH host keys verified through the existing trusted connection |

Actions uses its short-lived `GITHUB_TOKEN` to publish images and a read-only
token in the deploy job to pull them on EC2. The token goes over SSH stdin, is
stored only in a temporary Docker config, and is removed when deployment exits.
RDS credentials never enter GitHub Actions or Docker images. The first image
publication creates GHCR packages; retain their repository access inheritance.

## One-time EC2 preparation

Use the existing `ubuntu` account, which has passwordless sudo for Docker. The
forced deployment command expects exactly `/home/ubuntu/SIVAY-platform`.

```bash
cd /home/ubuntu
git clone https://github.com/IvanSavcynskyi/SIVAY-platform.git
cd SIVAY-platform
cp deploy/runtime.env.example deploy/runtime.env
umask 077
cp deploy/backend.env.example deploy/backend.env
mkdir -p deploy/certs
curl --fail --silent --show-error \
  https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem \
  -o deploy/certs/global-bundle.pem
chmod 644 deploy/certs/global-bundle.pem
chmod 755 deploy/certs
```

Edit `deploy/backend.env` on EC2 with the existing RDS host, database, application
user and password. Single-quote passwords containing `$` so Compose does not
interpolate them. Generate `SECRET_KEY` with `openssl rand -hex 32`; keep it stable
between deployments. This setup enforces `verify-full` TLS for both the API and
Alembic using the mounted AWS CA bundle.

The RDS security group must accept TCP 5432 from this EC2's security group. Enable
PostGIS in the **application database** before the first migration:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
SELECT PostGIS_Version();
```

Use an RDS administrator for extension setup. The migration user must have the
required schema/table permissions. Take a snapshot before migrating a database
that already contains data. Existing pytest integration fixtures truncate/drop
tables: never point `TEST_DATABASE_URL` at the production database.

Confirm `PROXY_NETWORK=sivay_default` matches the network used by Caddy:

```bash
sudo docker inspect sivay-proxy-1 --format '{{json .NetworkSettings.Networks}}'
```

Only the frontend joins the model's existing network. The backend uses a separate
platform network. Its trusted forwarded headers come through the frontend; the
backend is not published on the EC2 host.

Install the SSH wrapper and append the dedicated public key to
`/home/ubuntu/.ssh/authorized_keys` with this prefix:

```text
restrict,command="/usr/local/bin/sivay-platform-deploy" ssh-ed25519 PUBLIC_KEY sivay-platform-actions
```

```bash
sudo install -o root -g root -m 755 deploy/ssh-deploy.sh /usr/local/bin/sivay-platform-deploy
```

The dedicated key permits only `deploy FULL_COMMIT_SHA GITHUB_ACTOR`. The wrapper
fetches GitHub `main`, verifies that the requested commit belongs to its history,
and refuses a dirty checkout. Keep the wrapper outside the Git working tree.
Changing it in Git requires an explicit reinstall on EC2.

GitHub-hosted runners must be able to reach the EC2 SSH port. If the current
security group only allows an administrator's IP, use an appropriate connectivity
solution before enabling deployment (for example an AWS SSM/OIDC setup). Do not
silently broaden existing SSH firewall rules. SSM/OIDC is not required by the
provided SSH workflow.

## DNS and Caddy

Create an `A` record for the apex (`@`, `sivay.tech`) pointing to `13.53.151.170`.
Ensure no stale `AAAA` record points elsewhere. Use a stable EC2 public address or
update DNS and `EC2_HOST` if it changes. Ports 80/443 are already used by Caddy.

After the platform is healthy, append `deploy/Caddyfile.platform.example` to
`/home/ubuntu/sivay/deploy/Caddyfile`. Preserve the existing model host block,
global settings and Caddy certificate volumes. Validate the full configuration:

```bash
cd /home/ubuntu/sivay
sudo docker compose -f compose.yaml -f compose.public.yaml exec -T proxy \
  caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
```

The existing Caddy has `admin off`, so its admin API reload command is unavailable.
After validation, restart **only** `proxy` to apply the additional host; there is a
brief interruption to HTTP traffic while it restarts:

```bash
sudo docker compose -f compose.yaml -f compose.public.yaml restart proxy
curl -I https://sivay.tech/
curl -i https://sivay.tech/api/v1/auth/me
curl -I https://model.sivay.tech/docs
```

Expect 200 for the platform page and model docs, and 401 for unauthenticated
`/api/v1/auth/me`. Caddy obtains and renews the certificate once DNS reaches this
server. `www.sivay.tech` is not configured by this setup.

## Releases, checks, and recovery

Set `EC2_DEPLOY_ENABLED=true` once RDS credentials, PostGIS and SSH access are
ready. A push to `main` then builds and deploys automatically. The workflow can
also be rerun using Actions → Platform ARM64 release → Run workflow on `main`.

The workflow tests settings and dependency imports but does not run the existing
database integration suite against RDS. Before the first production release,
validate migrations on a separate PostGIS database when one is available.

Each release pulls both images before migration, runs Alembic once, and uses
`docker compose up --wait` followed by a frontend-to-backend HTTP check. It never
runs `docker compose down`, deletes volumes, or prunes the model's images. API
health currently checks the process; a successful migration verifies DB access
during deployment. Monitor database connectivity separately at runtime.

`deploy/current-release` records the last successful commit and
`deploy/previous-release` its predecessor. A failure stops the workflow; there is
no automatic database rollback. A failed migration can leave the old app running;
a failure during container replacement can require operator recovery. Deploy
backward-compatible schema migrations because the old application may still be
running while they execute.

Retain previous images for recovery. Reverting application changes and pushing a
new commit creates a new tested release; preserve already-applied migration
history. Never blindly downgrade Alembic to recover an application version. Use
RDS snapshots/restoration for database recovery according to the migration.

Logs are rotated at 3 × 10 MiB per service. Image layers accumulate across
releases, so monitor `df -h /` and `sudo docker system df`. Remove only known old
platform image tags after reviewing the retained rollback versions.

The analysis UI still stores fields/seasons/requests in browser localStorage.
Deploying it does not connect those features to the model automatically. That
integration is separate from this deployment configuration.

## References

- [GitHub ARM runners](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Compose networking](https://docs.docker.com/compose/how-tos/networking/)
- [RDS TLS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/PostgreSQL.Concepts.General.SSL.html)
