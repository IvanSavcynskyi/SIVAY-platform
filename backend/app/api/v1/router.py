from fastapi import APIRouter

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.fields import router as fields_router
from app.api.v1.endpoints.plots import router as plots_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(fields_router, prefix="/fields", tags=["Fields"])
api_router.include_router(plots_router, prefix="/plots", tags=["Plots"])
