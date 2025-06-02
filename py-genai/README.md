# Python GenAI Application

A Python-powered GenAI app you can run locally using your favorite LLM — just follow the guide to get started.

## Environment Variables

The application uses the following environment variables:

- `LLM_BASE_URL`: The base URL of the LLM API
- `LLM_MODEL_NAME`: The model name to use
- `PORT`: The port to run the application on (default: 8081)
- `DEBUG`: Set to "true" to enable debug mode (default: "false")
- `LOG_LEVEL`: Set the logging level (default: "INFO")

## API Endpoints

- `GET /`: Web interface for the chat application
- `POST /api/chat`: Send a message to the AI and get a response
- `GET /health`: Health check endpoint
- `GET /api/docs`: API documentation

## Running the Application

### Using Docker Compose

```bash
docker-compose up python-genai
```

### Running Locally

```bash
cd py-genai
pip install -r requirements.txt
python app.py
```

## Running with Docker

This project provides a ready-to-use Docker setup for local development and deployment.

- **Python version:** 3.11 (as specified in the Dockerfile)
- **Dependencies:** Installed from `requirements.txt` inside a virtual environment
- **Non-root user:** The container runs as a non-root user for improved security
- **Exposed port:** `8081` (the app will be available at `http://localhost:8081`)

### Build and Run with Docker Compose

1. (Optional) Create a `.env` file in the project root to set environment variables, or set them directly in the `docker-compose.yml` under `environment:`.
2. Build and start the service:

   ```bash
   docker-compose up python-genai
   ```

   The service will be available at [http://localhost:8081](http://localhost:8081).

### Configuration Notes

- The Docker Compose file defines a single service (`python-app`, container name `python-genai`) and a custom bridge network (`app-net`).
- Health checks are enabled and will monitor the `/health` endpoint.
- If you need to customize environment variables (such as `LLM_BASE_URL` or `LLM_MODEL_NAME`), you can do so in the `docker-compose.yml` or via a `.env` file.
- No special build arguments are required; all dependencies are managed via `requirements.txt`.

---
