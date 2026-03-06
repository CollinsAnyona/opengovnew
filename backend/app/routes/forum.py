from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.forum import ForumPostCreate, ForumPostRead, ForumPostDetail, ForumReplyCreate, ForumReplyRead, ForumPostUpdate, ForumReplyUpdate
from app.models.forum_post import ForumPost
from app.models.forum_reply import ForumReply
from app.models.user import User
from app.models.user_notification import UserNotification
from app.services.forum_moderation_service import ForumModerationService
from app.db.session import SessionLocal
from app.services.email_service import send_forum_reply_email, send_forum_moderation_email
from app.services.gemini_service import GeminiAIService

from app.core.security import verify_token

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

def get_current_user(token_data: dict = Depends(verify_token)):
    return token_data

@router.get("/posts", response_model=List[ForumPostRead])
def get_posts(category: Optional[str] = None, sector_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(ForumPost).filter(ForumPost.moderation_status != 'removed')
    if category:
        query = query.filter(ForumPost.category == category)
    if sector_id:
        query = query.filter(ForumPost.sector_id == sector_id)
    
    posts = query.order_by(ForumPost.created_at.desc()).all()
    
    result = []
    for post in posts:
        user = db.query(User).filter(User.id == post.user_id).first()
        sector_name = None
        if post.sector_id:
            from app.models.sector import Sector
            sector = db.query(Sector).filter(Sector.id == post.sector_id).first()
            sector_name = sector.name if sector else None
        
        post_dict = {
            "id": post.id,
            "user_id": post.user_id,
            "title": post.title,
            "content": post.content,
            "category": post.category,
            "sector_id": post.sector_id,
            "sector_name": sector_name,
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
def create_post(post: ForumPostCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # AI Moderation using Gemini
    title_moderation = GeminiAIService.moderate_content(post.title, "forum post title")
    content_moderation = GeminiAIService.moderate_content(post.content, "forum post")
    
    is_flagged = title_moderation['is_flagged'] or content_moderation['is_flagged']
    flagged_reason = title_moderation.get('reason') or content_moderation.get('reason')
    
    # Validate sector_id if provided
    sector_id = post.sector_id
    if sector_id:
        from app.models.sector import Sector
        sector_exists = db.query(Sector).filter(Sector.id == sector_id).first()
        if not sector_exists:
            sector_id = None
    
    db_post = ForumPost(
        user_id=int(current_user['sub']),
        title=post.title,
        content=post.content,
        category=post.category,
        sector_id=sector_id,
        is_flagged=is_flagged,
        flagged_reason=flagged_reason,
        moderation_status='pending' if is_flagged else 'approved'
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    user = db.query(User).filter(User.id == db_post.user_id).first()
    sector_name = None
    if db_post.sector_id:
        from app.models.sector import Sector
        sector = db.query(Sector).filter(Sector.id == db_post.sector_id).first()
        sector_name = sector.name if sector else None
    
    return {
        "id": db_post.id,
        "user_id": db_post.user_id,
        "title": db_post.title,
        "content": db_post.content,
        "category": db_post.category,
        "sector_id": db_post.sector_id,
        "sector_name": sector_name,
        "created_at": db_post.created_at,
        "user_name": user.name if user else "Unknown",
        "reply_count": 0
    }

@router.post("/posts/{post_id}/replies", response_model=ForumReplyRead)
def create_reply(post_id: int, reply: ForumReplyCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # AI Moderation using Gemini
    moderation = GeminiAIService.moderate_content(reply.content, "forum reply")
    
    db_reply = ForumReply(
        post_id=post_id,
        user_id=int(current_user['sub']),
        content=reply.content,
        is_flagged=moderation['is_flagged'],
        flagged_reason=moderation.get('reason'),
        moderation_status='pending' if moderation['is_flagged'] else 'approved'
    )
    db.add(db_reply)
    db.commit()
    db.refresh(db_reply)
    
    # Send email notification to post author
    post_author = db.query(User).filter(User.id == post.user_id).first()
    replier = db.query(User).filter(User.id == db_reply.user_id).first()
    
    if post_author and post_author.email and post_author.id != db_reply.user_id:
        try:
            send_forum_reply_email(
                user_email=post_author.email,
                user_name=post_author.name,
                post_title=post.title,
                replier_name=replier.name if replier else "Someone",
                reply_preview=reply.content
            )
        except Exception as e:
            print(f"Failed to send forum reply email: {e}")
    
    user = db.query(User).filter(User.id == db_reply.user_id).first()
    
    return {
        "id": db_reply.id,
        "post_id": db_reply.post_id,
        "user_id": db_reply.user_id,
        "content": db_reply.content,
        "created_at": db_reply.created_at,
        "user_name": user.name if user else "Unknown"
    }


@router.put("/posts/{post_id}", response_model=ForumPostRead)
def update_post(post_id: int, post_update: ForumPostUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if user owns the post
    if post.user_id != int(current_user['sub']):
        raise HTTPException(status_code=403, detail="Not authorized to edit this post")
    
    # AI Moderation for updated content
    if post_update.title:
        title_moderation = GeminiAIService.moderate_content(post_update.title, "forum post title")
        post.title = post_update.title
        post.is_flagged = title_moderation['is_flagged']
        post.flagged_reason = title_moderation.get('reason')
    
    if post_update.content:
        content_moderation = GeminiAIService.moderate_content(post_update.content, "forum post")
        post.content = post_update.content
        if content_moderation['is_flagged']:
            post.is_flagged = True
            post.flagged_reason = content_moderation.get('reason')
    
    if post_update.category:
        post.category = post_update.category
    
    post.moderation_status = 'pending' if post.is_flagged else 'approved'
    
    db.commit()
    db.refresh(post)
    
    user = db.query(User).filter(User.id == post.user_id).first()
    sector_name = None
    if post.sector_id:
        from app.models.sector import Sector
        sector = db.query(Sector).filter(Sector.id == post.sector_id).first()
        sector_name = sector.name if sector else None
    
    return {
        "id": post.id,
        "user_id": post.user_id,
        "title": post.title,
        "content": post.content,
        "category": post.category,
        "sector_id": post.sector_id,
        "sector_name": sector_name,
        "created_at": post.created_at,
        "user_name": user.name if user else "Unknown",
        "reply_count": len([r for r in post.replies if r.moderation_status != 'removed'])
    }

@router.delete("/posts/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if user owns the post
    if post.user_id != int(current_user['sub']):
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    # Delete all replies first
    db.query(ForumReply).filter(ForumReply.post_id == post_id).delete()
    
    # Delete the post
    db.delete(post)
    db.commit()
    
    return {"message": "Post deleted successfully"}

@router.put("/posts/{post_id}/replies/{reply_id}", response_model=ForumReplyRead)
def update_reply(post_id: int, reply_id: int, reply_update: ForumReplyUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    reply = db.query(ForumReply).filter(ForumReply.id == reply_id, ForumReply.post_id == post_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    # Check if user owns the reply
    if reply.user_id != int(current_user['sub']):
        raise HTTPException(status_code=403, detail="Not authorized to edit this reply")
    
    # AI Moderation for updated content
    moderation = GeminiAIService.moderate_content(reply_update.content, "forum reply")
    
    reply.content = reply_update.content
    reply.is_flagged = moderation['is_flagged']
    reply.flagged_reason = moderation.get('reason')
    reply.moderation_status = 'pending' if moderation['is_flagged'] else 'approved'
    
    db.commit()
    db.refresh(reply)
    
    user = db.query(User).filter(User.id == reply.user_id).first()
    
    return {
        "id": reply.id,
        "post_id": reply.post_id,
        "user_id": reply.user_id,
        "content": reply.content,
        "created_at": reply.created_at,
        "user_name": user.name if user else "Unknown"
    }

@router.delete("/posts/{post_id}/replies/{reply_id}")
def delete_reply(post_id: int, reply_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    reply = db.query(ForumReply).filter(ForumReply.id == reply_id, ForumReply.post_id == post_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    # Check if user owns the reply
    if reply.user_id != int(current_user['sub']):
        raise HTTPException(status_code=403, detail="Not authorized to delete this reply")
    
    db.delete(reply)
    db.commit()
    
    return {"message": "Reply deleted successfully"}


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
    
    # Send email notification
    if user and user.email:
        try:
            send_forum_moderation_email(
                user_email=user.email,
                user_name=user.name,
                action=action.action,
                content_type="forum post",
                content_title=post.title,
                reason=action.message
            )
        except Exception as e:
            print(f"Failed to send moderation email: {e}")
    
    return {"message": f"Post {action.action}d successfully"}

@router.post("/admin/moderate-reply/{reply_id}")
def moderate_reply(reply_id: int, action: ModerationAction, db: Session = Depends(get_db)):
    """Admin action on flagged reply"""
    reply = db.query(ForumReply).filter(ForumReply.id == reply_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")
    
    post = db.query(ForumPost).filter(ForumPost.id == reply.post_id).first()
    user = db.query(User).filter(User.id == reply.user_id).first()
    
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
    
    # Send email notification
    if user and user.email:
        try:
            send_forum_moderation_email(
                user_email=user.email,
                user_name=user.name,
                action=action.action,
                content_type="forum reply",
                content_title=post.title if post else "a discussion",
                reason=action.message
            )
        except Exception as e:
            print(f"Failed to send moderation email: {e}")
    
    return {"message": f"Reply {action.action}d successfully"}
