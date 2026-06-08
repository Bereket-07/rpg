# Import all models here to ensure they are registered with SQLAlchemy declarative Base
from app.db.session import Base
from app.models.author_category import Author, Category
from app.models.article import Article, SEOMeta
from app.models.user import User
from app.models.newsletter import NewsletterSubscriber
from app.models.settings import SiteSetting, PageContent
from app.models.consultations import ContactInquiry, BookingRequest
