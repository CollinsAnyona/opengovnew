from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.forum import ForumPostCreate, ForumPostRead, ForumPostDetail, ForumReplyCreate, ForumReplyRead
from app.models.forum_post import ForumPost
from app.models.forum_reply import ForumReply
from app.models.user import User
from app.models.user_notification import UserNotification
from app.services.forum_moderation_service import ForumModerationService
from app.db.session import SessionLocal

router = APIRouter(prefix="/forum", tags=["forum"])

class ModerationAction(BaseModel):
    action: str  # approve, warn, remove, suspend
    message: Optional[str] = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/posts", response_model=List[ForumPostRead])
def get_posts(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ForumPost).filter(ForumPost.moderation_status != 'removed')
    if category:
        query = query.filter(ForumPost.category == category)
    
    posts = query.order_by(ForumPost.created_at.desc()).all()
    
    result = []
    for post in posts:
        user = db.query(User).filter(User.id == post.user_id).first()
        post_dict = {
            "id": post.id,
            "user_id": post.user_id,
            "title": post.title,
            "content": post.content,
            "category": post.category,
            "created_at": post.created_at,
            "user_name": user.name if user else "Unknown",
            "reply_count": len([r for r in post.replies if r.moderation_status != 'removed'])
        }
        result.append(post_dict)
    
    return result

@router.get("/posts/{post_id}", response_model=ForumPostDetail)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post or post.moderation_status == 'removed':
        raise HTTPException(status_code=404, detail="Post not found")
    
    user = db.query(User).filter(User.id == post.user_id).first()
    
    replies_data = []
    for reply in post.replies:
        if reply.moderation_status != 'removed':
            reply_user = db.query(User).filter(User.id == reply.user_id).first()
            replies_data.append({
                "id": reply.id,
                "post_id": reply.post_id,
                "user_id": reply.user_id,
                "content": reply.content,
                "created_at": reply.created_at,
                "user_name": reply_user.name if reply_user else "Unknown"
            })
    
    return {
        "id": post.id,
        "user_id": post.user_id,
        "title": post.title,
        "content": post.content,
        "category": post.category,
        "created_at": post.created_at,
        "user_name": user.name if user else "Unknown",
        "reply_count": len(replies_data),
        "replies": replies_data
    }

@router.post("/posts", response_model=ForumPostRead)
def create_post(post: ForumPostCreate, db: Session = Depends(get_db)):
    # AI Moderation
    title_moderation = ForumModerationService.moderate_content(post.title)
    content_moderation = ForumModerationService.moderate_content(post.content)
    
    is_flagged = title_moderation['is_flagged'] or content_moderation['is_flagged']
    flagged_reason = title_moderation['reason'] or content_moderation['reason']
    
    db_post = ForumPost(
        user_id=1,
        title=post.title,
        content=post.content,
        category=post.category,
        is_flagged=is_flagged,
        flagged_reason=flagged_reason,
        moderation_status='pending' if is_flagged else 'approved'
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    user = db.query(User).filter(User.id == db_post.user_id).first()
    
    return {
        "id": db_post.id,
        "user_id": db_post.user_id,
        "title": db_post.title,
        "content": db_post.content,
        "category": db_post.category,
        "created_at": db_post.created_at,
        "user_name": user.name if user else "Unknown",
        "reply_count": 0
    }

@router.post("/posts/{post_id}/replies", response_model=ForumReplyRead)
def create_reply(post_id: int, reply: ForumReplyCreate, db: Session = Depends(get_db)):
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # AI Moderation
    moderation = ForumModerationService.moderate_content(reply.content)
    
    db_reply = ForumReply(
        post_id=post_id,
        user_id=1,
        content=reply.content,
        is_flagged=moderation['is_flagged'],
        flagged_reason=moderation['reason'],
        moderation_status='pending' if moderation['is_flagged'] else 'approved'
    )
    db.add(db_reply)
    db.commit()
    db.refresh(db_reply)
    
    user = db.query(User).filter(User.id == db_reply.user_id).first()
    
    return {
        "id": db_reply.id,
        "post_id": db_reply.post_id,
        "user_id": db_reply.user_id,
        "content": db_reply.content,
        "created_at": db_reply.created_at,
        "user_name": user.name if user else "Unknown"
    }


# Admin endpoints for moderation
@router.get("/admin/flagged-posts")
def get_flagged_posts(db: Session = Depends(get_db)):
    """Get all posts flagged by AI for admin review"""
    posts = db.query(ForumPost).filter(ForumPost.is_flagged == True).order_by(ForumPost.created_at.desc()).all()
    
    result = []
    for post in posts:
        user = db.query(User).filter(User.id == post.user_id).first()
        result.append({
            "id": post.id,
            "user_id": post.user_id,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "Unknown",
            "title": post.title,
            "content": post.content,
            "category": post.category,
            "flagged_reason": post.flagged_reason,
            "moderation_status": post.moderation_status.value if post.moderation_status else "pending",
            "admin_action": post.admin_action,
            "created_at": post.created_at,
            "type": "post"
        })
    
    return result

@router.get("/admin/flagged-replies")
def get_flagged_replies(db: Session = Depends(get_db)):
    """Get all replies flagged by AI for admin review"""
    replies = db.query(ForumReply).filter(ForumReply.is_flagged == True).order_by(ForumReply.created_at.desc()).all()
    
    result = []
    for reply in replies:
        user = db.query(User).filter(User.id == reply.user_id).first()
        post = db.query(ForumPost).filter(ForumPost.id == reply.post_id).first()
        result.append({
            "id": reply.id,
            "post_id": reply.post_id,
            "post_title": post.title if post else "Unknown",
            "user_id": reply.user_id,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "Unknown",
            "content": reply.content,
            "flagged_reason": reply.flagged_reason,
            "moderation_status": reply.moderation_status.value if reply.moderation_status else "pending",
            "admin_action": reply.admin_action,
            "created_at": reply.created_at,
            "type": "reply"
        })
    
    return result

@router.post("/admin/moderate-post/{post_id}")
def moderate_post(post_id: int, action: ModerationAction, db: Session = Depends(get_db)):
    """Admin action on flagged post"""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    user = db.query(User).filter(User.id == post.user_id).first()
    
    if action.action == "approve":
        post.moderation_status = "approved"
        post.admin_action = "Approved by admin"
    elif action.action == "warn":
        post.moderation_status = "warned"
        post.admin_action = action.message or "Warning issued"
        # Send notification to user
        notification = UserNotification(
            user_id=post.user_id,
            title="Content Warning",
            message=f"Your forum post '{post.title}' has been flagged. {action.message or 'Please follow community guidelines.'}",
            notification_type="warning"
        )
        db.add(notification)
    elif action.action == "remove":
        post.moderation_status = "removed"
        post.admin_action = action.message or "Content removed"
        notification = UserNotification(
            user_id=post.user_id,
            title="Content Removed",
            message=f"Your forum post '{post.title}' has been removed. Reason: {action.message or 'Violation of community guidelines'}",
            notification_type="removal"
        )
        db.add(notification)
    elif action.action == "suspend":
        post.moderation_status = "suspended"
        post.admin_action = action.message or "User suspended"
        notification = UserNotification(
            user_id=post.user_id,
            title="Account Suspended",
            message=f"Your account has been suspended due to your post '{post.title}'. {action.message or 'Contact admin for more information.'}",
            notification_type="suspension"
        )
        db.add(notification)
    
    db.commit()
    return {"message": f"Post {action.action}d successfully"}

@router.post("/admin/moderate-reply/{reply_id}")
def moderate_reply(reply_id: int, action: ModerationAction, db: Session = Depends(get_db)):
    """Admin action on flagged reply"""
    reply = db.query(ForumReply).filter(ForumReply.id == reply_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    post = db.query(ForumPost).filter(ForumPost.id == reply.post_id).first()
    
    if action.action == "approve":
        reply.moderation_status = "approved"
        reply.admin_action = "Approved by admin"
    elif action.action == "warn":
        reply.moderation_status = "warned"
        reply.admin_action = action.message or "Warning issued"
        notification = UserNotification(
            user_id=reply.user_id,
            title="Content Warning",
            message=f"Your reply in '{post.title if post else 'a discussion'}' has been flagged. {action.message or 'Please follow community guidelines.'}",
            notification_type="warning"
        )
        db.add(notification)
    elif action.action == "remove":
        reply.moderation_status = "removed"
        reply.admin_action = action.message or "Content removed"
        notification = UserNotification(
            user_id=reply.user_id,
            title="Content Removed",
            message=f"Your reply in '{post.title if post else 'a discussion'}' has been removed. Reason: {action.message or 'Violation of community guidelines'}",
            notification_type="removal"
        )
        db.add(notification)
    elif action.action == "suspend":
        reply.moderation_status = "suspended"
        reply.admin_action = action.message or "User suspended"
        notification = UserNotification(
            user_id=reply.user_id,
            title="Account Suspended",
            message=f"Your account has been suspended due to your reply. {action.message or 'Contact admin for more information.'}",
            notification_type="suspension"
        )
        db.add(notification)
    
    db.commit()
    return {"message": f"Reply {action.action}d successfully"}
