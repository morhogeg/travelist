#!/usr/bin/env python3
"""Final integration test for Steve"""

import os
import sys

def test_imports():
    """Test all imports work"""
    print("Testing imports...")
    
    try:
        from crew_steve import run_steve, create_agents, create_tasks
        print("✓ CrewAI components")
        
        from data_collector import collect_all_context
        print("✓ Data collector")
        
        from llm_config import get_llm
        print("✓ LLM config")
        
        from core.schemas import ReviewMode
        print("✓ Core schemas")
        
        from utils.logger import get_logger
        print("✓ Logger")
        
        print("✅ All imports successful!\n")
        return True
        
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def test_data_collection():
    """Test data collection in test mode"""
    print("Testing data collection...")
    
    try:
        from data_collector import collect_all_context
        from core.schemas import ReviewMode
        
        context = collect_all_context(ReviewMode.EXECUTION, test_mode=True)
        
        assert 'tickets_data' in context
        assert 'principles_context' in context
        assert 'analysis_metadata' in context
        
        print("✓ Context data collected")
        print(f"✓ Found {len(context)} context sections")
        print("✅ Data collection working!\n")
        return True
        
    except Exception as e:
        print(f"❌ Data collection error: {e}")
        return False

def test_agent_creation():
    """Test agent creation"""
    print("Testing agent creation...")
    
    try:
        from crew_steve import create_agents
        
        agents = create_agents()
        print(f"✓ Created {len(agents)} agents")
        
        agent_names = [agent.role for agent in agents]
        expected = ["Jira Harvester", "Strategic Gatekeeper", "Alignment Fixer", "Pattern Detector", "Executive Narrator"]
        
        for expected_role in expected:
            if expected_role in agent_names:
                print(f"✓ {expected_role} agent created")
        
        print("✅ Agent creation working!\n")
        return True
        
    except Exception as e:
        print(f"❌ Agent creation error: {e}")
        return False

def test_config_files():
    """Test configuration files"""
    print("Testing configuration files...")
    
    import yaml
    
    try:
        # Test principles
        with open("config/principles.yaml", "r") as f:
            principles = yaml.safe_load(f)
            print(f"✓ Principles config: {len(principles['principles'])} principles")
        
        # Test agents config
        with open("config/agents.yaml", "r") as f:
            agents_config = yaml.safe_load(f)
            print(f"✓ Agents config: {len(agents_config['agents'])} agent configs")
        
        # Test settings
        with open("config/settings.yaml", "r") as f:
            settings = yaml.safe_load(f)
            print("✓ Settings config loaded")
        
        print("✅ All config files valid!\n")
        return True
        
    except Exception as e:
        print(f"❌ Config file error: {e}")
        return False

def main():
    """Run all tests"""
    print("🎯 Running Steve Integration Tests\n")
    
    tests = [
        test_imports,
        test_config_files, 
        test_data_collection,
        test_agent_creation
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print(f"📊 Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All tests passed! Steve is ready to run.")
        print("\nNext steps:")
        print("1. Copy .env.example to .env and configure")
        print("2. Edit config/principles.yaml with your strategy")
        print("3. Run: python cli.py --test")
    else:
        print("❌ Some tests failed. Check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()