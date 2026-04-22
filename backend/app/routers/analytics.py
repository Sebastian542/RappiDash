from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalyticsResponse
from app.services.data_service import get_analytics

router = APIRouter()


@router.get("/", response_model=AnalyticsResponse)
def analytics():
    try:
        return get_analytics()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
