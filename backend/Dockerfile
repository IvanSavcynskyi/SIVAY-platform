# Production-ready Dockerfile for SIVAY backend using uv
FROM ghcr.io/astral-sh/uv:python3.14-bookworm-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

WORKDIR /app

# Step 1: Copy dependency definitions first to leverage Docker layer caching
COPY pyproject.toml uv.lock ./

# Step 2: Install project dependencies into virtual environment (.venv)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

# Step 3: Copy backend source code and migration scripts
COPY . /app

# Step 4: Complete synchronization (installs the backend package itself)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# Ensure entrypoint script has LF line endings and executable permissions
RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Place the virtual environment binaries into system PATH
ENV PATH="/app/.venv/bin:$PATH"

# Create and switch to a non-privileged user for enhanced security
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

# Container healthcheck using Python standard library
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/').read()" || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

