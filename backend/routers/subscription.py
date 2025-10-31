from fastapi import APIRouter, HTTPException, Depends
from database import users_collection, transactions_collection
from routers.auth import get_current_user
from datetime import datetime, timedelta
from bson import ObjectId

router = APIRouter(prefix="/api/subscription", tags=["Subscription"])

@router.post("/upgrade")
async def upgrade_to_subscriber(plan: str, current_user: dict = Depends(get_current_user)):
    """Upgrade user to subscriber role"""
    if current_user["role"] == "subscriber":
        raise HTTPException(status_code=400, detail="Already a subscriber")
    
    # Plan pricing
    plans = {
        "monthly": {"amount": 9.99, "duration": 30},
        "yearly": {"amount": 99.99, "duration": 365}
    }
    
    if plan not in plans:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    plan_info = plans[plan]
    
    # Create transaction (payment processing would happen here)
    transaction_doc = {
        "user_id": str(current_user["_id"]),
        "type": "subscription",
        "amount": plan_info["amount"],
        "plan": plan,
        "status": "completed",  # In real app, would be pending until payment confirms
        "stripe_payment_id": None,
        "created_at": datetime.utcnow()
    }
    
    await transactions_collection.insert_one(transaction_doc)
    
    # Update user to subscriber
    expires_at = datetime.utcnow() + timedelta(days=plan_info["duration"])
    
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {
            "role": "subscriber",
            "subscription_status": "active",
            "subscription_plan": plan,
            "subscription_expires_at": expires_at,
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {
        "message": "Successfully upgraded to subscriber",
        "expires_at": expires_at
    }

@router.post("/cancel")
async def cancel_subscription(current_user: dict = Depends(get_current_user)):
    """Cancel subscription (remains active until expiry)"""
    if current_user["role"] != "subscriber":
        raise HTTPException(status_code=400, detail="Not a subscriber")
    
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {
            "subscription_status": "cancelled",
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {"message": "Subscription cancelled. Access will continue until expiry date."}

@router.get("/status")
async def get_subscription_status(current_user: dict = Depends(get_current_user)):
    """Get current subscription status"""
    return {
        "is_subscriber": current_user["role"] == "subscriber",
        "status": current_user.get("subscription_status", "none"),
        "plan": current_user.get("subscription_plan"),
        "expires_at": current_user.get("subscription_expires_at")
    }
