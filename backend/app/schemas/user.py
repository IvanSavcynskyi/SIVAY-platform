from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    phone_number: str | None = None
    date_of_birth: date | None = None


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    role: str

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    email: EmailStr
    password: str
