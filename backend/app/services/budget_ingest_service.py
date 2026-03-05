import pandas as pd
from sqlalchemy.orm import Session
from typing import Dict, List
from app.models.budget import Budget
from app.models.sector import Sector
from app.services.budget_ai_service import generate_citizen_explanation

class BudgetIngestService:
    # Flexible column mapping - maps various possible column names to our fields
    COLUMN_MAPPINGS = {
        'sector': ['sector', 'ministry', 'department', 'sector_name', 'ministry_name'],
        'year': ['year', 'fiscal_year', 'fy', 'budget_year', 'financial_year'],
        'amount': ['amount', 'allocation', 'budget', 'allocation_kes', 'budget_amount', 'total_budget'],
        'description': ['description', 'desc', 'purpose', 'details', 'program', 'project']
    }
    
    @staticmethod
    def parse_file(file_content: bytes, filename: str) -> pd.DataFrame:
        """Parse CSV or XLSX file"""
        if filename.endswith('.csv'):
            return pd.read_csv(pd.io.common.BytesIO(file_content))
        elif filename.endswith('.xlsx'):
            return pd.read_excel(pd.io.common.BytesIO(file_content), engine='openpyxl')
        else:
            raise ValueError("Unsupported file format. Use .csv or .xlsx")
    
    @staticmethod
    def detect_column(df: pd.DataFrame, field: str) -> str:
        """Detect which column in the dataframe matches our field"""
        possible_names = BudgetIngestService.COLUMN_MAPPINGS.get(field, [])
        df_columns_lower = {col.lower(): col for col in df.columns}
        
        for possible_name in possible_names:
            if possible_name.lower() in df_columns_lower:
                return df_columns_lower[possible_name.lower()]
        return None
    
    @staticmethod
    def validate_columns(df: pd.DataFrame) -> Dict:
        """Detect and validate columns"""
        detected = {}
        missing = []
        
        for field in ['sector', 'year', 'amount', 'description']:
            col = BudgetIngestService.detect_column(df, field)
            if col:
                detected[field] = col
            else:
                missing.append(field)
        
        return {'detected': detected, 'missing': missing}
    
    @staticmethod
    def process_upload(db: Session, df: pd.DataFrame) -> Dict:
        """Process and insert budget data with flexible column detection"""
        result = {
            "inserted": 0,
            "updated": 0,
            "skipped": 0,
            "errors": [],
            "column_mapping": {}
        }
        
        # Detect columns
        validation = BudgetIngestService.validate_columns(df)
        detected_cols = validation['detected']
        missing_cols = validation['missing']
        
        result['column_mapping'] = detected_cols
        
        if missing_cols:
            result['errors'].append({
                'row_index': 'N/A',
                'reason': f"Missing required fields: {', '.join(missing_cols)}. Available columns: {', '.join(df.columns)}"
            })
            return result
        
        for idx, row in df.iterrows():
            try:
                # Extract values using detected column names
                sector_name = str(row[detected_cols['sector']]).strip()
                
                # Handle fiscal year formats like "2020/2021" or "2020-2021"
                year_value = str(row[detected_cols['year']]).strip()
                if '/' in year_value:
                    year = int(year_value.split('/')[0])  # Take first year from "2020/2021"
                elif '-' in year_value:
                    year = int(year_value.split('-')[0])  # Take first year from "2020-2021"
                else:
                    year = int(year_value)
                
                amount = float(row[detected_cols['amount']])
                description = str(row[detected_cols['description']])
                
                # Skip empty rows
                if pd.isna(sector_name) or sector_name == 'nan' or not sector_name:
                    result['skipped'] += 1
                    continue
                
                # Get or create sector
                sector = db.query(Sector).filter(Sector.name == sector_name).first()
                if not sector:
                    sector = Sector(name=sector_name, description=f"Ministry of {sector_name}")
                    db.add(sector)
                    db.flush()
                
                # Check if record exists
                existing = db.query(Budget).filter(
                    Budget.sector_id == sector.id,
                    Budget.year == year
                ).first()
                
                # Generate AI explanation
                citizen_explanation = generate_citizen_explanation(
                    sector_name=sector.name,
                    year=year,
                    amount=amount,
                    description=description
                )
                
                if existing:
                    # Update existing record
                    existing.amount = amount
                    existing.description = description
                    existing.citizen_explanation = citizen_explanation
                    result['updated'] += 1
                else:
                    # Insert new record
                    budget = Budget(
                        sector_id=sector.id,
                        year=year,
                        amount=amount,
                        description=description,
                        citizen_explanation=citizen_explanation
                    )
                    db.add(budget)
                    result['inserted'] += 1
                
            except Exception as e:
                result['errors'].append({
                    'row_index': int(idx),
                    'reason': str(e)
                })
                result['skipped'] += 1
        
        db.commit()
        return result
