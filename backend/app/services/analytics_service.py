from sqlalchemy.orm import Session
from app.models.budget import Budget
from typing import Dict, Optional

class AnalyticsService:
    @staticmethod
    def calculate_budget_analytics(
        db: Session, 
        sector_name: str,
        county: Optional[str] = None,
        budget_type: Optional[str] = None
    ) -> Dict:
        # Build query with new schema
        query = db.query(Budget).filter(Budget.sector == sector_name)
        
        # Apply optional filters
        if county:
            query = query.filter(Budget.county == county)
        if budget_type:
            query = query.filter(Budget.budget_type == budget_type)
        
        budgets = query.all()
        
        if not budgets:
            return {
                "sector": sector_name,
                "total_allocation": 0,
                "yearly_distribution": {},
                "growth_rate": 0,
                "largest_year": None
            }
        
        total_allocation = sum(b.allocation_kes for b in budgets)
        
        # Group by fiscal_year
        yearly_distribution = {}
        for budget in budgets:
            year = budget.fiscal_year
            yearly_distribution[year] = yearly_distribution.get(year, 0) + budget.allocation_kes
        
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
        
        largest_year = max(yearly_distribution, key=yearly_distribution.get) if yearly_distribution else None
        
        return {
            "sector": sector_name,
            "total_allocation": total_allocation,
            "yearly_distribution": yearly_distribution,
            "growth_rate": round(growth_rate, 2),
            "largest_year": largest_year
        }