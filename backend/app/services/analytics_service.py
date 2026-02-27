from sqlalchemy.orm import Session
from app.models.budget import Budget
from app.models.sector import Sector
from typing import Dict

class AnalyticsService:
    @staticmethod
    def calculate_budget_analytics(db: Session, sector_name: str) -> Dict:
        sector = db.query(Sector).filter(Sector.name == sector_name).first()
        if not sector:
            return None
        
        budgets = db.query(Budget).filter(Budget.sector_id == sector.id).all()
        
        if not budgets:
            return {
                "sector": sector_name,
                "total_allocation": 0,
                "yearly_distribution": {},
                "growth_rate": 0,
                "largest_year": None
            }
        
        total_allocation = sum(b.amount for b in budgets)
        
        yearly_distribution = {}
        for budget in budgets:
            year = str(budget.year)
            yearly_distribution[year] = yearly_distribution.get(year, 0) + budget.amount
        
        sorted_years = sorted(yearly_distribution.keys())
        growth_rate = 0
        if len(sorted_years) >= 2:
            latest_year = sorted_years[-1]
            previous_year = sorted_years[-2]
            current_amount = yearly_distribution[latest_year]
            previous_amount = yearly_distribution[previous_year]
            if previous_amount > 0:
                growth_rate = ((current_amount - previous_amount) / previous_amount) * 100
        
        largest_year = max(yearly_distribution, key=yearly_distribution.get) if yearly_distribution else None
        
        return {
            "sector": sector_name,
            "total_allocation": total_allocation,
            "yearly_distribution": yearly_distribution,
            "growth_rate": round(growth_rate, 2),
            "largest_year": int(largest_year) if largest_year else None
        }