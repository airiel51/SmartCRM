import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from app.core.database import Base


class User(Base):
    __tablename__ = "workshop_users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(120), nullable=False)
    role = Column(String(50), nullable=False, default="pic") # 'pic', 'admin', 'technician'
    phone = Column(String(50), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
