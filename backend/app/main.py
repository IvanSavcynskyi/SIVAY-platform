from fastapi import FastAPI

from app.api.v1.endpoints.auth import router as auth_router

app = FastAPI(
    title="SIVAY Platform API",
    description="Інформаційно-аналітична платформа управління маржинальністю в агросекторі",
    version="0.1.0",
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])


@app.get("/")
async def root():
    return {"status": "ok", "message": "SIVAY API is running"}