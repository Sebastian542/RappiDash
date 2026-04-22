from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.services.data_service import _load_raw

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check():
    try:
        raw = _load_raw()
        points = raw.get("total_points", 0)
    except FileNotFoundError:
        points = 0
    return HealthResponse(status="ok", version="1.0.0", data_points=points)
