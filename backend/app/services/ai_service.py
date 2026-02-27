class AIService:
    @staticmethod
    def generate_budget_summary(sector: str, total_allocation: float, growth_rate: float, largest_year: int) -> str:
        sector_name = sector.capitalize()
        total = f"${total_allocation:,.2f}"
        
        if growth_rate > 0:
            trend = f"increased by {growth_rate:.1f}%"
            fiscal_trend = "upward fiscal trajectory"
        elif growth_rate < 0:
            trend = f"decreased by {abs(growth_rate):.1f}%"
            fiscal_trend = "downward fiscal trajectory"
        else:
            trend = "remained stable"
            fiscal_trend = "stable fiscal pattern"
        
        summary = (
            f"The {sector_name} sector has a total allocation of {total}. "
            f"Funding has {trend} compared to the previous year, indicating a {fiscal_trend}. "
            f"The largest allocation was recorded in {largest_year}, "
            f"reflecting peak investment during that fiscal period."
        )
        
        return summary