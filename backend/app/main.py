from fastapi import FastAPI

from app.api.v1.router import api_router

app = FastAPI(
    title="SIVAY Platform API",
    description="Інформаційно-аналітична платформа управління маржинальністю в агросекторі",
    version="0.1.0",
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"status": "ok", "message": "SIVAY API is running"}