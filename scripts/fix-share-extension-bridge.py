#!/usr/bin/env python3
import re
import sys

# Read the project file
pbxproj_path = sys.argv[1]
with open(pbxproj_path, 'r') as f:
    content = f.read()

print("Fixing bridging header configuration...")

# We need to ensure SWIFT_OBJC_BRIDGING_HEADER is ONLY on App target, not ShareExtension
# Strategy: Find all buildSettings blocks and check if they belong to ShareExtension

# First, let's identify the configuration sections
lines = content.split('\n')
in_build_config = False
in_share_extension = False
current_target = None
modified = False

for i, line in enumerate(lines):
    # Detect when we're in a build configuration
    if 'buildSettings = {' in line:
        in_build_config = True
        # Look back to see what target this belongs to
        for j in range(i-1, max(0, i-50), -1):
            if 'ShareExtension' in lines[j]:
                in_share_extension = True
                break
            elif 'PBXNativeTarget' in lines[j] and 'App' in lines[j]:
                in_share_extension = False
                break
    
    # If we're in ShareExtension buildSettings and find SWIFT_OBJC_BRIDGING_HEADER, remove it
    if in_build_config and in_share_extension and 'SWIFT_OBJC_BRIDGING_HEADER' in line:
        print(f"Removing SWIFT_OBJC_BRIDGING_HEADER from ShareExtension at line {i+1}")
        lines[i] = ''  # Remove the line
        modified = True
    
    # Exit build config section
    if in_build_config and '};' in line and 'buildSettings' not in line:
        in_build_config = False
        in_share_extension = False

if modified:
    # Reconstruct content and remove empty lines
    content = '\n'.join(line for line in lines if line or line == '')  # Keep structure
    
    with open(pbxproj_path, 'w') as f:
        f.write(content)
    
    print("✅ Removed bridging header from ShareExtension")
else:
    print("ℹ️ No bridging header found in ShareExtension config")

print("Done!")
