from dotenv import load_dotenv
load_dotenv()

from app.services.email_service import send_feedback_response_email, send_feedback_status_email, send_forum_reply_email

print("Test 1: Sending feedback response email...")
result1 = send_feedback_response_email(
    user_email="cjotieno04@gmail.com",
    user_name="Collins",
    feedback_message="The roads in my area need urgent repair. They are in terrible condition.",
    admin_response="Thank you for your feedback. We have forwarded your concern to the Roads Department. They will conduct an inspection within 7 days and provide an update on the repair timeline."
)
print(f"Result: {'SUCCESS' if result1 else 'FAILED'}\n")

print("Test 2: Sending status update email...")
result2 = send_feedback_status_email(
    user_email="cjotieno04@gmail.com",
    user_name="Collins",
    feedback_id=123,
    old_status="submitted",
    new_status="under_review"
)
print(f"Result: {'SUCCESS' if result2 else 'FAILED'}\n")

print("Test 3: Sending forum reply notification...")
result3 = send_forum_reply_email(
    user_email="cjotieno04@gmail.com",
    user_name="Collins",
    post_title="Budget Allocation for Education Sector",
    replier_name="Admin",
    reply_preview="Thank you for raising this important question. The education budget has been increased by 15% this fiscal year to address infrastructure needs in schools."
)
print(f"Result: {'SUCCESS' if result3 else 'FAILED'}\n")

print("\n=== EMAIL TEST SUMMARY ===")
print(f"Feedback Response: {'PASS' if result1 else 'FAIL'}")
print(f"Status Update:     {'PASS' if result2 else 'FAIL'}")
print(f"Forum Reply:       {'PASS' if result3 else 'FAIL'}")
print("\nCheck your inbox at cjotieno04@gmail.com for the test emails!")
