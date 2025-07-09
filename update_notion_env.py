#!/usr/bin/env python3
"""
Script to update Notion credentials in .env file
"""

import os
import sys

def update_notion_credentials():
    """Interactively update Notion credentials in .env file"""
    
    print("=== Update Notion Credentials ===\n")
    
    # Get credentials from user
    print("Please enter your Notion credentials:")
    print("(You mentioned you have them in 'env' - please paste them here)\n")
    
    notion_token = input("Enter your NOTION_TOKEN: ").strip()
    if not notion_token:
        print("❌ No token provided. Exiting.")
        return
        
    notion_database_id = input("Enter your NOTION_DATABASE_ID: ").strip()
    if not notion_database_id:
        print("❌ No database ID provided. Exiting.")
        return
    
    # Read current .env file
    env_file_path = ".env"
    with open(env_file_path, 'r') as f:
        lines = f.readlines()
    
    # Update the lines
    updated = False
    new_lines = []
    
    for line in lines:
        if line.startswith("NOTION_TOKEN="):
            new_lines.append(f"NOTION_TOKEN={notion_token}\n")
            updated = True
            print(f"✅ Updated NOTION_TOKEN")
        elif line.startswith("NOTION_DATABASE_ID="):
            new_lines.append(f"NOTION_DATABASE_ID={notion_database_id}\n")
            updated = True
            print(f"✅ Updated NOTION_DATABASE_ID")
        else:
            new_lines.append(line)
    
    # If credentials weren't found, add them
    if not updated:
        new_lines.append(f"\n# Notion Configuration\n")
        new_lines.append(f"NOTION_TOKEN={notion_token}\n")
        new_lines.append(f"NOTION_DATABASE_ID={notion_database_id}\n")
        print(f"✅ Added Notion credentials to .env file")
    
    # Write back to file
    with open(env_file_path, 'w') as f:
        f.writelines(new_lines)
    
    print("\n✅ .env file updated successfully!")
    print("\nNow testing the connection...")
    
    # Test the connection
    os.system("python test_notion_env.py")

if __name__ == "__main__":
    update_notion_credentials()