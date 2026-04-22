from fastapi import APIRouter, HTTPException
from app.models.schemas import MetricsResponse
from app.services.data_service import get_metrics

router = APIRouter()


@router.get("/", response_model=MetricsResponse)
def metrics():
    try:
        return get_metrics()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
