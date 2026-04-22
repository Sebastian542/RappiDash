"""
Rappi Store Availability Intelligence — FastAPI Backend
Author: RappiMakers 2026 Tech Test
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import metrics, analytics, health

app = FastAPI(
    title="Rappi Store Availability API",
    description="Real-time store availability analytics powered by synthetic monitoring data",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(health.router,    prefix="/api",         tags=["health"])
app.include_router(metrics.router,   prefix="/api/metrics", tags=["metrics"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
