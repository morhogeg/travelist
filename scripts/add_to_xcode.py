import sys
import os
from pbxproj import XcodeProject

project_path = '/Users/morhogeg/travelist-2/ios/App/App.xcodeproj/project.pbxproj'
file_path = 'App/FirebaseAIPlugin.swift'

if not os.path.exists(project_path):
    print(f"Error: Project file not found at {project_path}")
    sys.exit(1)

project = XcodeProject.load(project_path)

# Add the file to the 'App' group if it's not already there
project.add_file(file_path, force=False, parent=project.get_or_create_group('App'))

project.save()
print(f"Successfully added {file_path} to Xcode project.")
