# syntax=docker/dockerfile:1

FROM python:3.11-slim AS base

# Set working directory
WORKDIR /app

# --- Builder stage ---
FROM base AS builder

# Install build dependencies (if any needed, e.g. gcc, but not required for this app)

# Copy requirements.txt first for better cache usage
COPY --link requirements.txt ./

# Create virtual environment and install dependencies using pip cache
RUN --mount=type=cache,target=/root/.cache/pip \
    python -m venv .venv && \
    .venv/bin/pip install --upgrade pip && \
    .venv/bin/pip install -r requirements.txt

# --- Final stage ---
FROM base AS final

# Create non-root user and group
RUN groupadd -r nomadicmehul && useradd --no-log-init -r -g nomadicmehul nomadicmehul

# Copy virtual environment from builder
COPY --from=builder /app/.venv /app/.venv

# Copy application code and assets
COPY --link app.py requirements.txt ./
COPY --link templates/ templates/
COPY --link static/ static/

# Set permissions
RUN chown -R nomadicmehul:nomadicmehul /app

# Switch to non-root user
USER nomadicmehul

# Set environment variables
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Expose the application port
EXPOSE 8081

# Healthcheck endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8081/health || exit 1

# Default command
CMD ["python", "app.py"]
