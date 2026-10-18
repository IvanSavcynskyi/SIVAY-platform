from fastapi import APIRouter

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.crops import router as crops_router
from app.api.v1.endpoints.fields import router as fields_router
from app.api.v1.endpoints.market_products import router as market_products_router
from app.api.v1.endpoints.plot_history import router as plot_history_router
from app.api.v1.endpoints.plots import router as plots_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(fields_router, prefix="/fields", tags=["Fields"])
api_router.include_router(plots_router, prefix="/fields/{field_id}/plots", tags=["Plots"])
api_router.include_router(plot_history_router, prefix="/plots/{plot_id}/history", tags=["Plot History"])
api_router.include_router(crops_router, prefix="/crops", tags=["Crops"])
api_router.include_router(market_products_router, prefix="/market-products", tags=["Market Products"])
