from typing import List
from app.models.user import User

ALL_TITLES = [
    "Autonomous Apprentice", "Technical Nomad", "Systems Architect", 
    "Legacy Hunter", "Core Pioneer", "Benevolent Dictator", "Momo Disciple"
]

class TitleManager:
    async def check_unlocks(self, user: User) -> List[str]:
        new_titles = []
        if user.character_level >= 10 and "Technical Nomad" not in user.titles:
            new_titles.append("Technical Nomad")
        if user.character_level >= 20 and "Systems Architect" not in user.titles:
            new_titles.append("Systems Architect")
        if user.character_level >= 50 and "Benevolent Dictator" not in user.titles:
            new_titles.append("Benevolent Dictator")
        return new_titles

title_manager = TitleManager()
