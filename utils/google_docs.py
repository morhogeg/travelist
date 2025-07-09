import os
import json
from datetime import datetime
from typing import Optional
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from utils.logger import get_logger

logger = get_logger(__name__)

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/documents", "https://www.googleapis.com/auth/drive.file"]


class GoogleDocsManager:
    def __init__(self, credentials_path: str = "credentials.json", token_path: str = "token.json"):
        """
        Initialize Google Docs Manager
        
        Args:
            credentials_path: Path to the Google Cloud credentials JSON file
            token_path: Path to store the OAuth token
        """
        self.credentials_path = credentials_path
        self.token_path = token_path
        self.service = None
        self.drive_service = None
        
    def authenticate(self) -> bool:
        """
        Authenticate with Google Docs API
        
        Returns:
            bool: True if authentication successful, False otherwise
        """
        creds = None
        
        # The file token.json stores the user's access and refresh tokens.
        if os.path.exists(self.token_path):
            creds = Credentials.from_authorized_user_file(self.token_path, SCOPES)
        
        # If there are no (valid) credentials available, let the user log in.
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(self.credentials_path):
                    logger.error(f"Google credentials file not found at {self.credentials_path}")
                    return False
                
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_path, SCOPES
                )
                creds = flow.run_local_server(port=0)
            
            # Save the credentials for the next run
            with open(self.token_path, "w") as token:
                token.write(creds.to_json())
        
        try:
            self.service = build("docs", "v1", credentials=creds)
            self.drive_service = build("drive", "v3", credentials=creds)
            logger.info("Successfully authenticated with Google Docs API")
            return True
        except HttpError as error:
            logger.error(f"Failed to authenticate with Google Docs API: {error}")
            return False
    
    def create_document(self, title: str, content: str) -> Optional[str]:
        """
        Create a new Google Document with the given title and content
        
        Args:
            title: The title of the document
            content: The content to add to the document
            
        Returns:
            str: The document ID if successful, None otherwise
        """
        if not self.service:
            logger.error("Google Docs service not initialized. Call authenticate() first.")
            return None
        
        try:
            # Create the document
            document = {"title": title}
            doc = self.service.documents().create(body=document).execute()
            document_id = doc.get("documentId")
            
            logger.info(f"Created document '{title}' with ID: {document_id}")
            
            # Add content to the document
            if content.strip():
                self._add_content_to_document(document_id, content)
            
            return document_id
            
        except HttpError as error:
            logger.error(f"Failed to create document: {error}")
            return None
    
    def _add_structured_content_to_document(self, document_id: str, content: str):
        """
        Add structured content to Google Document with proper formatting
        
        Args:
            document_id: The ID of the document
            content: The markdown content to convert and add
        """
        try:
            # Parse the markdown content and create structured requests
            requests = self._parse_markdown_to_google_docs_requests(content)
            
            # Execute the requests in batches (Google Docs has a limit)
            batch_size = 50
            for i in range(0, len(requests), batch_size):
                batch = requests[i:i + batch_size]
                result = self.service.documents().batchUpdate(
                    documentId=document_id,
                    body={"requests": batch}
                ).execute()
            
            logger.info(f"Added structured content to document {document_id}")
            
        except HttpError as error:
            logger.error(f"Failed to add structured content to document: {error}")
    
    def _add_content_to_document(self, document_id: str, content: str):
        """
        Add content to an existing Google Document (legacy method for compatibility)
        """
        self._add_structured_content_to_document(document_id, content)
    
    def _parse_markdown_to_google_docs_requests(self, content: str) -> list:
        """
        Create professionally formatted Google Docs with simplified, reliable approach
        Focus on the key improvements: proper heading styles, clean tables, good formatting
        """
        import re
        
        requests = []
        
        # Clean the content for better formatting
        clean_content = self._create_professional_content(content)
        
        # Insert all content first
        requests.append({
            "insertText": {
                "location": {"index": 1},
                "text": clean_content
            }
        })
        
        # Apply professional formatting
        formatting_requests = self._apply_professional_styles(clean_content)
        requests.extend(formatting_requests)
        
        return requests
    
    def _convert_markdown_to_clean_text(self, content: str) -> str:
        """Convert markdown to clean text while preserving structure"""
        import re
        
        lines = content.split('\n')
        result_lines = []
        
        for line in lines:
            # Clean up markdown but keep structure indicators
            if line.startswith('# '):
                result_lines.append(line[2:].strip())
            elif line.startswith('## '):
                result_lines.append(line[3:].strip())
            elif line.startswith('### '):
                result_lines.append(line[4:].strip())
            elif line.startswith('| ') and not line.startswith('|---'):
                # Convert table to tab-separated for better Google Docs handling
                cells = [cell.strip() for cell in line.split('|')[1:-1]]
                result_lines.append('\t'.join(cells))
            elif line.startswith('- ') or line.startswith('• '):
                result_lines.append('• ' + line[2:].strip())
            elif re.match(r'^\d+\. ', line):
                result_lines.append(line.strip())
            elif line.strip():
                # Clean markdown formatting from regular text
                clean_line = re.sub(r'\*\*(.*?)\*\*', r'\1', line)
                clean_line = re.sub(r'\*(.*?)\*', r'\1', clean_line)
                clean_line = re.sub(r'`(.*?)`', r'\1', clean_line)
                result_lines.append(clean_line.strip())
            # Skip empty lines to reduce spacing
        
        return '\n'.join(result_lines)
    
    def _create_professional_google_table(self, table_data: list, start_index: int) -> tuple:
        """Create a proper Google Docs table with professional formatting"""
        requests = []
        
        if not table_data or len(table_data) < 1:
            return [], start_index
        
        rows_count = len(table_data)
        cols_count = len(table_data[0]) if table_data else 1
        
        # Insert table structure
        requests.append({
            "insertTable": {
                "location": {"index": start_index},
                "rows": rows_count,
                "columns": cols_count
            }
        })
        
        # Rough calculation for table size (Google Docs tables are complex to index)
        estimated_table_size = rows_count * cols_count * 3 + 20
        
        # Add spacing after table
        table_end_index = start_index + estimated_table_size
        requests.append({
            "insertText": {
                "location": {"index": table_end_index},
                "text": "\n\n"
            }
        })
        
        return requests, table_end_index + 2
    
    def _create_document_style_requests(self) -> list:
        """Create requests to set up document-wide formatting"""
        return [
            {
                "updateDocumentStyle": {
                    "documentStyle": {
                        "defaultHeaderId": "",
                        "defaultFooterId": "",
                        "evenPageHeaderId": "",
                        "evenPageFooterId": "",
                        "firstPageHeaderId": "",
                        "firstPageFooterId": "",
                        "useFirstPageHeaderFooter": False,
                        "useEvenPageHeaderFooter": False,
                        "pageNumberStart": 1,
                        "marginTop": {"magnitude": 72, "unit": "PT"},
                        "marginBottom": {"magnitude": 72, "unit": "PT"},
                        "marginLeft": {"magnitude": 72, "unit": "PT"},
                        "marginRight": {"magnitude": 72, "unit": "PT"},
                        "pageSize": {
                            "width": {"magnitude": 612, "unit": "PT"},
                            "height": {"magnitude": 792, "unit": "PT"}
                        }
                    },
                    "fields": "marginTop,marginBottom,marginLeft,marginRight,pageSize"
                }
            }
        ]
    
    def _parse_content_into_sections(self, content: str) -> list:
        """Parse markdown content into structured sections"""
        import re
        
        sections = []
        lines = content.split('\n')
        current_section = {"type": "paragraph", "content": [], "style": "NORMAL_TEXT"}
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            if line.startswith('# '):
                # Save current section and start new title
                if current_section["content"]:
                    sections.append(current_section)
                sections.append({
                    "type": "title",
                    "content": [line[2:].strip()],
                    "style": "TITLE"
                })
                current_section = {"type": "paragraph", "content": [], "style": "NORMAL_TEXT"}
                
            elif line.startswith('## '):
                # Save current section and start new heading
                if current_section["content"]:
                    sections.append(current_section)
                sections.append({
                    "type": "heading",
                    "content": [line[3:].strip()],
                    "style": "HEADING_1"
                })
                current_section = {"type": "paragraph", "content": [], "style": "NORMAL_TEXT"}
                
            elif line.startswith('### '):
                # Save current section and start new subheading
                if current_section["content"]:
                    sections.append(current_section)
                sections.append({
                    "type": "heading",
                    "content": [line[4:].strip()],
                    "style": "HEADING_2"
                })
                current_section = {"type": "paragraph", "content": [], "style": "NORMAL_TEXT"}
                
            elif line.startswith('| ') and not line.startswith('|---'):
                # Start collecting table data
                if current_section["content"]:
                    sections.append(current_section)
                
                table_lines = []
                while i < len(lines) and lines[i].strip().startswith('|') and not lines[i].strip().startswith('|---'):
                    table_lines.append(lines[i].strip())
                    i += 1
                    if i < len(lines) and lines[i].strip().startswith('|---'):
                        i += 1  # Skip separator row
                
                if table_lines:
                    sections.append({
                        "type": "table",
                        "content": table_lines,
                        "style": "TABLE"
                    })
                current_section = {"type": "paragraph", "content": [], "style": "NORMAL_TEXT"}
                i -= 1  # Adjust for the increment at end of loop
                
            elif line.startswith('• ') or line.startswith('- '):
                # Start bullet list
                if current_section["type"] != "bullet_list":
                    if current_section["content"]:
                        sections.append(current_section)
                    current_section = {"type": "bullet_list", "content": [], "style": "BULLET_LIST"}
                current_section["content"].append(line[2:].strip())
                
            elif re.match(r'^\d+\. ', line):
                # Start numbered list
                if current_section["type"] != "numbered_list":
                    if current_section["content"]:
                        sections.append(current_section)
                    current_section = {"type": "numbered_list", "content": [], "style": "NUMBERED_LIST"}
                current_section["content"].append(re.sub(r'^\d+\. ', '', line).strip())
                
            elif line == '---':
                # Horizontal rule - add spacing
                if current_section["content"]:
                    sections.append(current_section)
                sections.append({
                    "type": "divider",
                    "content": [""],
                    "style": "NORMAL_TEXT"
                })
                current_section = {"type": "paragraph", "content": [], "style": "NORMAL_TEXT"}
                
            elif line:
                # Regular paragraph text
                if current_section["type"] not in ["paragraph"]:
                    if current_section["content"]:
                        sections.append(current_section)
                    current_section = {"type": "paragraph", "content": [], "style": "NORMAL_TEXT"}
                current_section["content"].append(line)
                
            else:
                # Empty line - if we have content, save it and start fresh
                if current_section["content"]:
                    sections.append(current_section)
                    current_section = {"type": "paragraph", "content": [], "style": "NORMAL_TEXT"}
            
            i += 1
        
        # Add final section if it has content
        if current_section["content"]:
            sections.append(current_section)
        
        return sections
    
    def _create_section_requests(self, section: dict, start_index: int) -> tuple:
        """Create requests for a specific section"""
        requests = []
        current_index = start_index
        
        if section["type"] == "title":
            text = section["content"][0] + "\n\n"
            requests.append({
                "insertText": {
                    "location": {"index": current_index},
                    "text": text
                }
            })
            
            # Apply title formatting
            requests.extend([
                {
                    "updateParagraphStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + len(section["content"][0])
                        },
                        "paragraphStyle": {
                            "namedStyleType": "TITLE",
                            "alignment": "CENTER",
                            "spaceAbove": {"magnitude": 0, "unit": "PT"},
                            "spaceBelow": {"magnitude": 20, "unit": "PT"}
                        },
                        "fields": "namedStyleType,alignment,spaceAbove,spaceBelow"
                    }
                },
                {
                    "updateTextStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + len(section["content"][0])
                        },
                        "textStyle": {
                            "fontSize": {"magnitude": 16, "unit": "PT"},
                            "bold": True
                        },
                        "fields": "fontSize,bold"
                    }
                }
            ])
            current_index += len(text)
            
        elif section["type"] == "heading":
            text = section["content"][0] + "\n\n"
            requests.append({
                "insertText": {
                    "location": {"index": current_index},
                    "text": text
                }
            })
            
            # Apply heading formatting
            heading_style = "HEADING_1" if section["style"] == "HEADING_1" else "HEADING_2"
            font_size = 14 if section["style"] == "HEADING_1" else 12
            
            requests.extend([
                {
                    "updateParagraphStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + len(section["content"][0])
                        },
                        "paragraphStyle": {
                            "namedStyleType": heading_style,
                            "spaceAbove": {"magnitude": 16, "unit": "PT"},
                            "spaceBelow": {"magnitude": 8, "unit": "PT"}
                        },
                        "fields": "namedStyleType,spaceAbove,spaceBelow"
                    }
                },
                {
                    "updateTextStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + len(section["content"][0])
                        },
                        "textStyle": {
                            "fontSize": {"magnitude": font_size, "unit": "PT"},
                            "bold": True
                        },
                        "fields": "fontSize,bold"
                    }
                }
            ])
            current_index += len(text)
            
        elif section["type"] == "table":
            # Create proper table
            table_requests, new_index = self._create_professional_table(section["content"], current_index)
            requests.extend(table_requests)
            current_index = new_index
            
        elif section["type"] in ["bullet_list", "numbered_list"]:
            # Create proper lists
            for item in section["content"]:
                list_text = f"• {item}\n" if section["type"] == "bullet_list" else f"{section['content'].index(item) + 1}. {item}\n"
                requests.append({
                    "insertText": {
                        "location": {"index": current_index},
                        "text": list_text
                    }
                })
                
                # Apply list formatting
                requests.append({
                    "updateTextStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + len(list_text) - 1
                        },
                        "textStyle": {
                            "fontSize": {"magnitude": 11, "unit": "PT"}
                        },
                        "fields": "fontSize"
                    }
                })
                
                current_index += len(list_text)
            
            # Add spacing after list
            requests.append({
                "insertText": {
                    "location": {"index": current_index},
                    "text": "\n"
                }
            })
            current_index += 1
            
        else:
            # Regular paragraph
            if section["content"]:
                text = '\n'.join(section["content"]) + "\n\n"
                # Clean up text formatting
                clean_text = self._clean_text_formatting(text)
                
                requests.append({
                    "insertText": {
                        "location": {"index": current_index},
                        "text": clean_text
                    }
                })
                
                # Apply paragraph formatting
                requests.append({
                    "updateTextStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + len(clean_text) - 2
                        },
                        "textStyle": {
                            "fontSize": {"magnitude": 11, "unit": "PT"}
                        },
                        "fields": "fontSize"
                    }
                })
                
                current_index += len(clean_text)
        
        return requests, current_index
    
    def _create_professional_content(self, content: str) -> str:
        """Clean and structure content for professional formatting"""
        import re
        
        lines = content.split('\n')
        result_lines = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Clean title - remove excess emojis
            if line.startswith('# '):
                title = line[2:].strip()
                title = re.sub(r'🎯\s*', '', title)  # Remove multiple emojis
                title = f"🎯 {title.replace('🎯', '').strip()}"
                result_lines.append(title)
                result_lines.append('')  # Add spacing
                
            # Clean headings
            elif line.startswith('## '):
                heading = line[3:].strip()
                result_lines.append(heading)
                result_lines.append('')
                
            elif line.startswith('### '):
                subheading = line[4:].strip()
                result_lines.append(subheading)
                result_lines.append('')
                
            # Handle tables - convert to clean pipe format
            elif line.startswith('| ') and not line.startswith('|---'):
                cells = [cell.strip() for cell in line.split('|')[1:-1]]
                if cells and any(cell for cell in cells):
                    result_lines.append(' | '.join(cells))
                    
            # Clean bullet points
            elif line.startswith('- ') or line.startswith('• '):
                bullet_text = line[2:].strip() if line.startswith('- ') else line[1:].strip()
                # Remove bold markdown
                bullet_text = re.sub(r'\*\*(.*?)\*\*', r'\1', bullet_text)
                result_lines.append(f'• {bullet_text}')
                
            # Clean numbered lists
            elif re.match(r'^\d+\. ', line):
                number_text = re.sub(r'^\d+\. ', '', line)
                number_text = re.sub(r'\*\*(.*?)\*\*', r'\1', number_text)
                result_lines.append(f'{len([l for l in result_lines if re.match(r"^\d+\.", l)]) + 1}. {number_text}')
                
            elif not line.startswith('|---'):  # Skip table separators
                # Regular text - clean markdown
                clean_text = re.sub(r'\*\*(.*?)\*\*', r'\1', line)
                clean_text = re.sub(r'\*(.*?)\*', r'\1', clean_text)
                clean_text = re.sub(r'`(.*?)`', r'\1', clean_text)
                if clean_text.strip():
                    result_lines.append(clean_text.strip())
        
        return '\n'.join(result_lines)
    
    def _apply_professional_styles(self, content: str) -> list:
        """Apply professional Google Docs styles to content"""
        import re
        
        requests = []
        lines = content.split('\n')
        current_index = 1
        
        for line in lines:
            line_length = len(line)
            if line_length == 0:
                current_index += 1
                continue
                
            # Apply proper Google Docs styles
            if line.startswith('🎯 ') and any(word in line.lower() for word in ['strategic alignment report', 'report']):
                # Document title - use Title style
                requests.append({
                    "updateParagraphStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + line_length
                        },
                        "paragraphStyle": {
                            "namedStyleType": "TITLE",
                            "alignment": "CENTER"
                        },
                        "fields": "namedStyleType,alignment"
                    }
                })
                
            elif any(keyword in line.lower() for keyword in ['executive summary', 'strategic scorecard', 'alignment analysis', 'detailed ticket analysis', 'report details']):
                # Major headings - use Heading 1 style
                requests.append({
                    "updateParagraphStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + line_length
                        },
                        "paragraphStyle": {
                            "namedStyleType": "HEADING_1"
                        },
                        "fields": "namedStyleType"
                    }
                })
                
            elif any(keyword in line.lower() for keyword in ["what's working", 'strategic category', 'recommendations', 'top performers', 'areas for improvement', 'strategic principles']):
                # Subheadings - use Heading 2 style
                requests.append({
                    "updateParagraphStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + line_length
                        },
                        "paragraphStyle": {
                            "namedStyleType": "HEADING_2"
                        },
                        "fields": "namedStyleType"
                    }
                })
                
            elif ' | ' in line and ('Rank' in line or 'Ticket' in line or '🜾' in line or '🜠' in line):
                # Table content - apply table formatting
                is_header = 'Rank' in line or 'Ticket' in line
                requests.append({
                    "updateTextStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + line_length
                        },
                        "textStyle": {
                            "fontSize": {"magnitude": 10, "unit": "PT"},
                            "bold": is_header
                        },
                        "fields": "fontSize,bold"
                    }
                })
                
            elif line.startswith('•') or re.match(r'^\d+\. ', line):
                # Lists - use proper list formatting
                if line.startswith('•'):
                    requests.append({
                        "createParagraphBullets": {
                            "range": {
                                "startIndex": current_index,
                                "endIndex": current_index + line_length
                            },
                            "bulletPreset": "BULLET_DISC_CIRCLE_SQUARE"
                        }
                    })
                
                requests.append({
                    "updateTextStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + line_length
                        },
                        "textStyle": {
                            "fontSize": {"magnitude": 11, "unit": "PT"}
                        },
                        "fields": "fontSize"
                    }
                })
                
            else:
                # Regular text - apply consistent formatting
                requests.append({
                    "updateTextStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + line_length
                        },
                        "textStyle": {
                            "fontSize": {"magnitude": 11, "unit": "PT"}
                        },
                        "fields": "fontSize"
                    }
                })
            
            current_index += line_length + 1
        
        return requests
        """Create a section with proper Google Docs formatting"""
        requests = []
        current_index = start_index
        
        if section['type'] == 'title':
            # Document title with proper Title style
            title_text = section['content'] + '\n\n'
            requests.append({
                "insertText": {
                    "location": {"index": current_index},
                    "text": title_text
                }
            })
            
            # Apply Title style
            requests.extend([
                {
                    "updateParagraphStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + len(title_text) - 2
                        },
                        "paragraphStyle": {
                            "namedStyleType": "TITLE",
                            "alignment": "CENTER"
                        },
                        "fields": "namedStyleType,alignment"
                    }
                },
                {
                    "updateTextStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + len(title_text) - 2
                        },
                        "textStyle": {
                            "fontSize": {"magnitude": 14, "unit": "PT"}
                        },
                        "fields": "fontSize"
                    }
                }
            ])
            current_index += len(title_text)
            
        elif section['type'] == 'heading1':
            # Major section heading with Heading 1 style
            heading_text = section['content'] + '\n\n'
            requests.append({
                "insertText": {
                    "location": {"index": current_index},
                    "text": heading_text
                }
            })
            
            requests.extend([
                {
                    "updateParagraphStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + len(heading_text) - 2
                        },
                        "paragraphStyle": {
                            "namedStyleType": "HEADING_1"
                        },
                        "fields": "namedStyleType"
                    }
                },
                {
                    "updateTextStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + len(heading_text) - 2
                        },
                        "textStyle": {
                            "fontSize": {"magnitude": 12, "unit": "PT"}
                        },
                        "fields": "fontSize"
                    }
                }
            ])
            current_index += len(heading_text)
            
        elif section['type'] == 'heading2':
            # Subsection heading with Heading 2 style
            subheading_text = section['content'] + '\n\n'
            requests.append({
                "insertText": {
                    "location": {"index": current_index},
                    "text": subheading_text
                }
            })
            
            requests.extend([
                {
                    "updateParagraphStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + len(subheading_text) - 2
                        },
                        "paragraphStyle": {
                            "namedStyleType": "HEADING_2"
                        },
                        "fields": "namedStyleType"
                    }
                },
                {
                    "updateTextStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + len(subheading_text) - 2
                        },
                        "textStyle": {
                            "fontSize": {"magnitude": 12, "unit": "PT"}
                        },
                        "fields": "fontSize"
                    }
                }
            ])
            current_index += len(subheading_text)
            
        elif section['type'] == 'table':
            # Create proper Google Docs table
            table_requests, new_index = self._create_professional_google_table(
                section['content'], current_index
            )
            requests.extend(table_requests)
            current_index = new_index
            
        elif section['type'] == 'bullets':
            # Create proper bullet list
            for bullet in section['content']:
                bullet_text = bullet + '\n'
                requests.append({
                    "insertText": {
                        "location": {"index": current_index},
                        "text": bullet_text
                    }
                })
                
                # Apply bullet list style
                requests.extend([
                    {
                        "createParagraphBullets": {
                            "range": {
                                "startIndex": current_index,
                                "endIndex": current_index + len(bullet_text) - 1
                            },
                            "bulletPreset": "BULLET_DISC_CIRCLE_SQUARE"
                        }
                    },
                    {
                        "updateTextStyle": {
                            "range": {
                                "startIndex": current_index,
                                "endIndex": current_index + len(bullet_text) - 1
                            },
                            "textStyle": {
                                "fontSize": {"magnitude": 11, "unit": "PT"}
                            },
                            "fields": "fontSize"
                        }
                    }
                ])
                current_index += len(bullet_text)
            
            # Add spacing after bullet list
            requests.append({
                "insertText": {
                    "location": {"index": current_index},
                    "text": "\n"
                }
            })
            current_index += 1
            
        elif section['type'] == 'numbered':
            # Create proper numbered list
            for i, item in enumerate(section['content']):
                item_text = item + '\n'
                requests.append({
                    "insertText": {
                        "location": {"index": current_index},
                        "text": item_text
                    }
                })
                
                # Apply numbered list style
                requests.extend([
                    {
                        "createParagraphBullets": {
                            "range": {
                                "startIndex": current_index,
                                "endIndex": current_index + len(item_text) - 1
                            },
                            "bulletPreset": "NUMBERED_DECIMAL_ALPHA_ROMAN"
                        }
                    },
                    {
                        "updateTextStyle": {
                            "range": {
                                "startIndex": current_index,
                                "endIndex": current_index + len(item_text) - 1
                            },
                            "textStyle": {
                                "fontSize": {"magnitude": 11, "unit": "PT"}
                            },
                            "fields": "fontSize"
                        }
                    }
                ])
                current_index += len(item_text)
            
            # Add spacing after numbered list
            requests.append({
                "insertText": {
                    "location": {"index": current_index},
                    "text": "\n"
                }
            })
            current_index += 1
            
        elif section['type'] == 'paragraph':
            # Regular paragraph with proper formatting
            para_text = section['content'] + '\n\n'
            requests.append({
                "insertText": {
                    "location": {"index": current_index},
                    "text": para_text
                }
            })
            
            # Apply paragraph formatting
            requests.extend([
                {
                    "updateParagraphStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + len(para_text) - 2
                        },
                        "paragraphStyle": {
                            "lineSpacing": 115
                        },
                        "fields": "lineSpacing"
                    }
                },
                {
                    "updateTextStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + len(para_text) - 2
                        },
                        "textStyle": {
                            "fontSize": {"magnitude": 11, "unit": "PT"}
                        },
                        "fields": "fontSize"
                    }
                }
            ])
            current_index += len(para_text)
        
        return requests, current_index
    
    def _clean_text_formatting(self, text: str) -> str:
        """Clean up text formatting and remove markdown"""
        import re
        
        # Remove markdown formatting
        text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)  # Remove **bold**
        text = re.sub(r'\*(.*?)\*', r'\1', text)      # Remove *italic*
        text = re.sub(r'`(.*?)`', r'\1', text)        # Remove `code`
        
        return text
    
    def _convert_markdown_to_plain_text(self, content: str) -> str:
        """Convert markdown to plain text with proper structure"""
        import re
        
        # Clean up the content
        lines = content.split('\n')
        result_lines = []
        
        for line in lines:
            if line.startswith('# '):
                # Main title
                result_lines.append(line[2:].strip())
                result_lines.append('')  # Add spacing
            elif line.startswith('## '):
                # Section heading
                result_lines.append(line[3:].strip())
                result_lines.append('')
            elif line.startswith('### '):
                # Subsection heading
                result_lines.append(line[4:].strip())
                result_lines.append('')
            elif line.startswith('| '):
                # Table row - convert to simple text for now
                cells = [cell.strip() for cell in line.split('|')[1:-1]]
                if not line.startswith('|---'):  # Skip separator row
                    result_lines.append('\t'.join(cells))
            elif line.startswith('- '):
                # Bullet point
                result_lines.append('• ' + line[2:].strip())
            elif re.match(r'^\d+\. ', line):
                # Keep numbered lists as is
                result_lines.append(line.strip())
            else:
                # Regular text - remove markdown formatting
                clean_line = re.sub(r'\*\*(.*?)\*\*', r'\1', line)  # Remove **bold**
                clean_line = re.sub(r'\*(.*?)\*', r'\1', clean_line)  # Remove *italic*
                clean_line = re.sub(r'`(.*?)`', r'\1', clean_line)  # Remove `code`
                if clean_line.strip():
                    result_lines.append(clean_line.strip())
                elif line.strip() == '':
                    result_lines.append('')  # Preserve empty lines for spacing
        
        return '\n'.join(result_lines)
    
    def _create_formatting_for_text(self, text: str) -> list:
        """Create formatting requests for the plain text"""
        requests = []
        lines = text.split('\n')
        current_index = 1
        
        for line in lines:
            line_length = len(line)
            
            # Determine if this should be a heading based on content
            if any(keyword in line.lower() for keyword in ['strategic alignment report', '🎯']):
                # Main title
                requests.append({
                    "updateParagraphStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + line_length
                        },
                        "paragraphStyle": {
                            "namedStyleType": "TITLE"
                        },
                        "fields": "namedStyleType"
                    }
                })
            elif any(keyword in line.lower() for keyword in ['executive summary', 'strategic scorecard', 'alignment analysis', 'detailed ticket analysis']):
                # Section headings
                requests.append({
                    "updateParagraphStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + line_length
                        },
                        "paragraphStyle": {
                            "namedStyleType": "HEADING_1"
                        },
                        "fields": "namedStyleType"
                    }
                })
            elif any(keyword in line.lower() for keyword in ["what's working", 'strategic category', 'recommendations', 'top performers', 'areas for improvement']):
                # Subsection headings
                requests.append({
                    "updateParagraphStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + line_length
                        },
                        "paragraphStyle": {
                            "namedStyleType": "HEADING_2"
                        },
                        "fields": "namedStyleType"
                    }
                })
            elif line.startswith('•') or line.startswith('-') or line.strip().startswith('1.'):
                # Bullet points and numbered lists - apply simple bold formatting for now
                # Google Docs bullet API is complex, so we'll just make these stand out
                requests.append({
                    "updateTextStyle": {
                        "range": {
                            "startIndex": current_index,
                            "endIndex": current_index + line_length
                        },
                        "textStyle": {
                            "bold": True
                        },
                        "fields": "bold"
                    }
                })
            
            current_index += line_length + 1  # +1 for newline
        
        return requests
    
    
    def get_document_url(self, document_id: str) -> str:
        """
        Get the URL for a Google Document
        
        Args:
            document_id: The ID of the document
            
        Returns:
            str: The URL of the document
        """
        return f"https://docs.google.com/document/d/{document_id}/edit"
    
    def create_executive_summary_doc(self, summary_content: str, sprint_name: str = None) -> Optional[str]:
        """
        Create a Google Doc for the executive summary with timestamp and sprint name
        
        Args:
            summary_content: The executive summary content
            sprint_name: The name of the sprint (optional)
            
        Returns:
            str: The document URL if successful, None otherwise
        """
        # Generate timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        
        # Create document title
        if sprint_name:
            title = f"STEVE_Executive_Summary_{sprint_name}_{timestamp}"
        else:
            title = f"STEVE_Executive_Summary_{timestamp}"
        
        # Create the document
        document_id = self.create_document(title, summary_content)
        
        if document_id:
            url = self.get_document_url(document_id)
            logger.info(f"Executive summary saved to Google Doc: {url}")
            return url
        
        return None


def create_google_docs_manager() -> GoogleDocsManager:
    """
    Factory function to create a GoogleDocsManager instance
    
    Returns:
        GoogleDocsManager: Configured instance
    """
    return GoogleDocsManager()