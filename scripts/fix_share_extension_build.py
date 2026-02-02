from pbxproj import XcodeProject
import sys

project_path = '/Users/morhogeg/travelist-2/ios/App/App.xcodeproj/project.pbxproj'
# The ID found from grep for 'FirebaseAIPlugin.swift in Sources' within the ShareExtension target section
build_file_id = 'E16241B18099AE2C6C6EE82C'

try:
    project = XcodeProject.load(project_path)
    # Surgical removal of the build file entry for the ShareExtension target
    project.remove_build_file(build_file_id)
    project.save()
    print(f"Successfully removed build file entry {build_file_id} from Xcode project.")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
