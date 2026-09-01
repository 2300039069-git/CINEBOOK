from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class CastMember(BaseModel):
    name: str
    role: str
    photo: Optional[str] = None

class MovieBase(BaseModel):
    title: str
    slug: str
    tagline: Optional[str] = None
    description: str
    genres: List[str]
    languages: List[str]
    formats: List[str] = ["2D", "3D"]
    duration: str
    duration_minutes: int
    release_date: str
    rating: float = 0.0
    votes: str = "0"
    censor_rating: str = "UA"
    poster_url: str
    backdrop_url: str
    trailer_url: Optional[str] = None
    director: str
    cast: List[CastMember] = []
    status: str = "NOW_SHOWING" # NOW_SHOWING, UPCOMING, ARCHIVED
    is_featured: bool = False
    cities: List[str] = ["mumbai", "delhi", "bengaluru"]

class MovieCreate(MovieBase):
    pass

class MovieUpdate(BaseModel):
    title: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    genres: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    formats: Optional[List[str]] = None
    rating: Optional[float] = None
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    trailer_url: Optional[str] = None
    status: Optional[str] = None
    is_featured: Optional[bool] = None

class MovieResponse(MovieBase):
    id: str

    class Config:
        from_attributes = True
