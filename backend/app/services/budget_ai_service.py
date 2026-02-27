def generate_citizen_explanation(sector_name: str, year: int, amount: float, description: str) -> str:
    """Generate simple citizen-friendly explanation of budget allocation"""
    
    amount_in_millions = amount / 1_000_000
    
    # Determine sector-specific benefits
    sector_benefits = {
        'education': 'schools, teachers, learning materials, and student programs',
        'health': 'hospitals, doctors, nurses, medicines, and medical equipment',
        'agriculture': 'farmers, irrigation, seeds, and agricultural training',
        'infrastructure': 'roads, bridges, water systems, and public facilities',
        'security': 'police, safety equipment, and community protection',
        'water': 'clean water access, boreholes, and sanitation facilities'
    }
    
    benefit = sector_benefits.get(sector_name.lower(), 'public services and community development')
    
    # Generate explanation based on amount
    if amount_in_millions < 10:
        scale = "a focused investment"
        impact = "This will support specific projects"
    elif amount_in_millions < 100:
        scale = "a significant allocation"
        impact = "This will fund multiple important programs"
    elif amount_in_millions < 1000:
        scale = "a major investment"
        impact = "This will enable large-scale improvements"
    else:
        scale = "a substantial commitment"
        impact = "This represents a major priority for the government"
    
    explanation = f"""
The government has allocated KSh {amount:,.0f} ({amount_in_millions:.1f} million shillings) for {sector_name} in {year}.

This is {scale} aimed at improving {benefit} across the country.

{impact} in your community. The funds will be used for: {description}

You can track how this money is spent through this platform and provide feedback on the services you receive.
""".strip()
    
    return explanation


def generate_expenditure_explanation(budget_description: str, amount: float, expenditure_description: str, sector_name: str) -> str:
    """Generate citizen-friendly explanation of expenditure"""
    
    amount_in_millions = amount / 1_000_000
    
    explanation = f"""
The government has spent KSh {amount:,.0f} ({amount_in_millions:.1f} million shillings) from the {sector_name} budget.

Purpose: {expenditure_description}

This spending is part of the larger plan to: {budget_description}

This means the allocated funds are being used as intended to deliver services to citizens.
""".strip()
    
    return explanation
