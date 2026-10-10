from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserBase(BaseModel):
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    phone_number: str | None = None
    date_of_birth: date | None = None

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower().strip()


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Мінімум 8 символів")


class UserResponse(UserBase):
    id: int
    role: str

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower().strip()

