from pbxproj import XcodeProject
import sys

project_path = '/Users/morhogeg/travelist-2/ios/App/App.xcodeproj/project.pbxproj'
file_name = 'FirebaseAIPlugin.swift'

project = XcodeProject.load(project_path)

# Find the file reference
file_refs = project.get_files_by_name(file_name)
if not file_refs:
    print(f"Could not find {file_name} in project")
    sys.exit(1)

file_ref = file_refs[0].get_id()

# Get all targets
targets = project.get_targets()

for target in targets:
    if target.name == 'App':
        print(f"Ensuring {file_name} is in target: {target.name}")
        # It's already there most likely, but add_file ensures it
        # Actually we just want to keep it here
        continue
    
    # Remove from other targets
    print(f"Removing {file_name} from target: {target.name}")
    project.remove_file_by_id(file_ref, target_name=target.name)

project.save()
print("Done fixing targets.")
