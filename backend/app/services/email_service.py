import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_host = "smtp.gmail.com"
        self.smtp_port = 587
        self.smtp_user = "" # To be filled in .env
        self.smtp_password = "" 
        self.from_email = "noreply@fits.net.za"

    def send_email(self, to_email: str, subject: str, html_body: str) -> bool:
        if not self.smtp_user:
            logger.info(f"Mock Email to {to_email}: {subject}")
            return True
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"Momo <{self.from_email}>"
            msg["To"] = to_email
            msg.attach(MIMEText(html_body, "html"))
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.from_email, to_email, msg.as_string())
            return True
        except Exception as e:
            logger.error(f"Email failed: {e}")
            return False

email_service = EmailService()
