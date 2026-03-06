from sqlalchemy.orm import Session
from app.models.budget import Budget
from app.models.sector import Sector
from typing import Dict, Optional

class AnalyticsService:
    @staticmethod
    def calculate_budget_analytics(
        db: Session, 
        sector_name: str,
        county: Optional[str] = None,
        budget_type: Optional[str] = None
    ) -> Dict:
        # Find sector by name
        sector_obj = db.query(Sector).filter(Sector.name.ilike(sector_name)).first()
        if not sector_obj:
            return {
                "sector": sector_name,
                "total_allocation": 0,
                "yearly_distribution": {},
                "growth_rate": 0,
                "largest_year": None
            }
        
        # Build query with sector_id
        query = db.query(Budget).filter(Budget.sector_id == sector_obj.id)
        
        # Apply optional filters
        if county:
            query = query.filter(Budget.county.ilike(county))
        
        budgets = query.all()
        
        if not budgets:
            return {
                "sector": sector_name,
                "total_allocation": 0,
                "yearly_distribution": {},
                "growth_rate": 0,
                "largest_year": None
            }
        
        total_allocation = sum(b.amount for b in budgets)
        
        # Group by year
        yearly_distribution = {}
        for budget in budgets:
            year = str(budget.year)  # Convert to string for schema compatibility
            yearly_distribution[year] = yearly_distribution.get(year, 0) + budget.amount
        
        # Calculate growth rate
        sorted_years = sorted(yearly_distribution.keys())
        growth_rate = 0
        if len(sorted_years) >= 2:
            latest_year = sorted_years[-1]
            previous_year = sorted_years[-2]
            current_amount = yearly_distribution[latest_year]
            previous_amount = yearly_distribution[previous_year]
            if previous_amount > 0:
                growth_rate = ((current_amount - previous_amount) / previous_amount) * 100
        
        largest_year = str(max(yearly_distribution, key=yearly_distribution.get)) if yearly_distribution else None
        
        return {
            "sector": sector_name,
            "total_allocation": total_allocation,
            "yearly_distribution": yearly_distribution,
            "growth_rate": round(growth_rate, 2),
            "largest_year": largest_year
        }