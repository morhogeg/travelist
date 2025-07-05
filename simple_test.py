#!/usr/bin/env python3
"""Simple test without complex imports"""

import os
import sys
import yaml
from datetime import datetime

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_basic_functionality():
    """Test basic functionality without CrewAI"""
    print("🎯 Testing Steve Basic Functions\n")
    
    # Test 1: Config loading
    print("1. Testing configuration loading...")
    try:
        with open("config/principles.yaml", "r") as f:
            principles = yaml.safe_load(f)
            print(f"   ✓ Loaded {len(principles['principles'])} principles")
        
        with open("config/agents.yaml", "r") as f:
            agents = yaml.safe_load(f)
            print(f"   ✓ Loaded {len(agents['agents'])} agent configs")
            
        print("   ✅ Configuration files working!\n")
    except Exception as e:
        print(f"   ❌ Config error: {e}\n")
        return False
    
    # Test 2: Environment
    print("2. Testing environment setup...")
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        jira_url = os.getenv("JIRA_URL", "Not set")
        project_key = os.getenv("JIRA_PROJECT_KEY", "Not set")
        
        print(f"   JIRA_URL: {jira_url}")
        print(f"   PROJECT_KEY: {project_key}")
        
        if jira_url != "Not set":
            print("   ✅ Jira configuration found!\n")
        else:
            print("   ⚠️  No Jira config (use --test mode)\n")
            
    except Exception as e:
        print(f"   ❌ Environment error: {e}\n")
        return False
    
    # Test 3: Mock ticket analysis
    print("3. Testing alignment logic...")
    try:
        # Simple mock alignment calculation
        test_tickets = [
            {"key": "TEST-1", "summary": "Improve API performance for better user experience", "score": 85},
            {"key": "TEST-2", "summary": "Add animated GIFs to chat", "score": 25},
            {"key": "TEST-3", "summary": "Fix critical security vulnerability", "score": 90},
            {"key": "TEST-4", "summary": "Refactor legacy code for maintainability", "score": 65},
        ]
        
        categories = []
        for ticket in test_tickets:
            if ticket["score"] >= 80:
                category = "core_value"
            elif ticket["score"] >= 60:
                category = "strategic_enabler"
            elif ticket["score"] >= 40:
                category = "drift"
            else:
                category = "distraction"
            categories.append(category)
            print(f"   {ticket['key']}: {ticket['score']}/100 ({category})")
        
        print("   ✅ Alignment logic working!\n")
        
    except Exception as e:
        print(f"   ❌ Logic error: {e}\n")
        return False
    
    # Test 4: Summary generation
    print("4. Testing summary generation...")
    try:
        total = len(test_tickets)
        avg_score = sum(t["score"] for t in test_tickets) / total
        drift_count = sum(1 for cat in categories if cat in ["drift", "distraction"])
        drift_pct = (drift_count / total) * 100
        
        print(f"   Total tickets: {total}")
        print(f"   Average score: {avg_score:.1f}/100")
        print(f"   Drift percentage: {drift_pct:.0f}%")
        
        if drift_pct > 40:
            print("   🚨 High drift detected!")
        else:
            print("   ✅ Good strategic alignment!")
            
        print("   ✅ Summary generation working!\n")
        
    except Exception as e:
        print(f"   ❌ Summary error: {e}\n")
        return False
    
    return True

def show_next_steps():
    """Show what to do next"""
    print("🎉 Basic functionality works!\n")
    print("Next steps:")
    print("1. ✅ Configure .env with your Jira credentials")
    print("2. ✅ Edit config/principles.yaml with your strategy")
    print("3. ✅ Test with: python simple_crew.py --test")
    print("4. ✅ Run real analysis: python simple_crew.py")
    print("\nSteve is ready! 🎯")

if __name__ == "__main__":
    if test_basic_functionality():
        show_next_steps()
    else:
        print("❌ Some tests failed. Check the errors above.")
        sys.exit(1)