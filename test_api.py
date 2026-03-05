import requests

# Test sectors endpoint
print("Testing /sectors endpoint...")
try:
    response = requests.get("http://localhost:8000/sectors")
    print(f"Status: {response.status_code}")
    print(f"Data: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50 + "\n")

# Test budgets endpoint
print("Testing /budgets?sector=Education endpoint...")
try:
    response = requests.get("http://localhost:8000/budgets?sector=Education")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Number of budgets: {len(data)}")
    if data:
        print(f"First budget: {data[0]}")
except Exception as e:
    print(f"Error: {e}")
