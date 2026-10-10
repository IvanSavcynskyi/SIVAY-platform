from fastapi import FastAPI

app = FastAPI(
    title="SIVAY Platform API",
    description="Інформаційно-аналітична платформа управління маржинальністю в агросекторі",
    version="0.1.0",
)


@app.get("/")
async def root():
    return {"status": "ok", "message": "SIVAY API is running"}