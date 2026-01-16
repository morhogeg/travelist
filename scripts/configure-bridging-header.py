#!/usr/bin/env python3
import re
import sys

# Read the project file
pbxproj_path = sys.argv[1]
with open(pbxproj_path, 'r') as f:
    content = f.read()

# Generate a unique ID for the bridging header file reference
bridge_header_ref_id = "BH00000000000001002D63AB"
bridge_header_build_id = "BH00000000000002002D63AB"

# Check if bridging header is already in the project
if 'App-Bridging-Header.h' in content:
    print("Bridging header already exists in project, updating settings only...")
else:
    print("Adding bridging header file to project...")
    
    # Find the PBXFileReference section and add the bridging header
    file_ref_pattern = r'(/\* Begin PBXFileReference section \*/)'
    file_ref_addition = f'''/* Begin PBXFileReference section */
\t\t{bridge_header_ref_id} /* App-Bridging-Header.h */ = {{isa = PBXFileReference; lastKnownFileType = sourcecode.c.h; path = "App-Bridging-Header.h"; sourceTree = "<group>"; }};'''
    
    content = re.sub(file_ref_pattern, file_ref_addition, content, count=1)
    
    # Find the App group (where other files are) and add the bridging header
    # Look for SharedInboxPlugin.m in the group and add our file near it
    app_group_pattern = r'(D7D1840C2EDCAC99002D63AB /\* SharedInboxPlugin\.m \*/,)'
    app_group_addition = f'''\1
\t\t\t\t{bridge_header_ref_id} /* App-Bridging-Header.h */,'''
    
    content = re.sub(app_group_pattern, app_group_addition, content, count=1)

# Set the bridging header build setting for all configurations
print("Setting SWIFT_OBJC_BRIDGING_HEADER build setting...")

# Pattern to find build configurations and add/update the bridging header setting
# We need to add it to both Debug and Release configurations

# Find the buildSettings sections and add SWIFT_OBJC_BRIDGING_HEADER if not present
def add_bridging_header_setting(match):
    settings_block = match.group(0)
    if 'SWIFT_OBJC_BRIDGING_HEADER' not in settings_block:
        # Add before SWIFT_OPTIMIZATION_LEVEL or at the end of buildSettings
        if 'SWIFT_OPTIMIZATION_LEVEL' in settings_block:
            settings_block = settings_block.replace(
                'SWIFT_OPTIMIZATION_LEVEL',
                'SWIFT_OBJC_BRIDGING_HEADER = "App/App-Bridging-Header.h";\n\t\t\t\tSWIFT_OPTIMIZATION_LEVEL'
            )
        else:
            # Add before the closing brace of buildSettings
            settings_block = re.sub(
                r'(\t\t\t};[\r\n]+\t\t\tname = )',
                r'\t\t\t\tSWIFT_OBJC_BRIDGING_HEADER = "App/App-Bridging-Header.h";\n\1',
                settings_block
            )
    return settings_block

# Apply to all buildSettings blocks
content = re.sub(
    r'buildSettings = \{[^}]+\};[\r\n]+\t\t\tname = (Debug|Release);',
    add_bridging_header_setting,
    content,
    flags=re.MULTILINE
)

# Write back
with open(pbxproj_path, 'w') as f:
    f.write(content)

print("✅ Done! Xcode project updated.")
print("Next: Clean build folder and rebuild in Xcode")
