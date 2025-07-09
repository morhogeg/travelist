import os
import re
from datetime import datetime
from typing import Optional, List, Dict, Any
from notion_client import Client
from dotenv import load_dotenv
from utils.logger import get_logger

load_dotenv()
logger = get_logger(__name__)

class NotionManager:
    def __init__(self):
        """Initialize Notion Manager"""
        self.client = None
        self.database_id = os.getenv("NOTION_DATABASE_ID")
        self.token = os.getenv("NOTION_TOKEN")
        
    def authenticate(self) -> bool:
        """
        Authenticate with Notion API
        
        Returns:
            bool: True if authentication successful, False otherwise
        """
        try:
            if not self.token:
                logger.error("NOTION_TOKEN not found in environment variables")
                return False
            
            if not self.database_id:
                logger.error("NOTION_DATABASE_ID not found in environment variables")
                return False
                
            self.client = Client(auth=self.token)
            
            # Test authentication with a simple API call
            self.client.databases.retrieve(database_id=self.database_id)
            
            logger.info("Successfully authenticated with Notion API")
            return True
            
        except Exception as error:
            logger.error(f"Failed to authenticate with Notion API: {error}")
            return False
    
    def create_executive_summary_page(self, summary_content: str, sprint_name: str = None) -> Optional[str]:
        """
        Create a Notion page for the executive summary
        
        Args:
            summary_content: The executive summary content
            sprint_name: The name of the sprint (optional)
            
        Returns:
            str: The page URL if successful, None otherwise
        """
        if not self.client:
            logger.error("Notion client not initialized. Call authenticate() first.")
            return None
            
        try:
            # Generate timestamp
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
            today = datetime.now().strftime("%Y-%m-%d")
            
            # Create page title
            if sprint_name:
                title = f"🎯 STEVE Report - {sprint_name} - {timestamp}"
            else:
                title = f"🎯 STEVE Strategic Alignment Report - {timestamp}"
            
            # Parse the summary content
            parsed_content = self._parse_steve_report(summary_content)
            
            # Create the page
            page_data = {
                "parent": {"database_id": self.database_id},
                "properties": {
                    "Name": {
                        "title": [
                            {
                                "text": {
                                    "content": title
                                }
                            }
                        ]
                    },
                    "Date": {
                        "date": {
                            "start": today
                        }
                    }
                },
                "children": self._create_page_blocks(parsed_content, title)
            }
            
            response = self.client.pages.create(**page_data)
            
            page_url = response["url"]
            logger.info(f"Executive summary saved to Notion: {page_url}")
            return page_url
            
        except Exception as error:
            logger.error(f"Failed to create executive summary page: {error}")
            return None
    
    def _parse_steve_report(self, content: str) -> Dict[str, Any]:
        """
        Parse the Steve report content into structured sections
        
        Args:
            content: The raw markdown content
            
        Returns:
            Dict containing parsed sections
        """
        sections = {}
        lines = content.split('\n')
        current_section = None
        current_content = []
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('# '):
                # Main title
                sections['title'] = line[2:].strip()
                
            elif line.startswith('## Executive Summary'):
                current_section = 'executive_summary'
                current_content = []
                
            elif line.startswith('## Strategic Alignment Scorecard'):
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content)
                current_section = 'scorecard'
                current_content = []
                
            elif line.startswith('## Detailed Ticket Analysis'):
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content)
                current_section = 'detailed_analysis'
                current_content = []
                
            elif line.startswith('## '):
                # Other sections
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content)
                section_name = line[3:].lower().replace(' ', '_')
                current_section = section_name
                current_content = []
                
            elif line and current_section:
                current_content.append(line)
        
        # Add final section
        if current_section and current_content:
            sections[current_section] = '\n'.join(current_content)
            
        return sections
    
    def _create_page_blocks(self, parsed_content: Dict[str, Any], title: str) -> List[Dict[str, Any]]:
        """
        Create Notion blocks from parsed content
        
        Args:
            parsed_content: Parsed sections from the report
            title: Page title
            
        Returns:
            List of Notion blocks
        """
        blocks = []
        
        # Add title
        blocks.append({
            "object": "block",
            "type": "heading_1",
            "heading_1": {
                "rich_text": [
                    {
                        "type": "text",
                        "text": {
                            "content": title
                        }
                    }
                ]
            }
        })
        
        blocks.append({
            "object": "block",
            "type": "divider",
            "divider": {}
        })
        
        # Add executive summary
        if 'executive_summary' in parsed_content:
            blocks.extend(self._create_executive_summary_blocks(parsed_content['executive_summary']))
        
        # Add scorecard
        if 'scorecard' in parsed_content:
            blocks.extend(self._create_scorecard_blocks(parsed_content['scorecard']))
        
        # Add detailed analysis
        if 'detailed_analysis' in parsed_content:
            blocks.extend(self._create_detailed_analysis_blocks(parsed_content['detailed_analysis']))
        
        return blocks
    
    def _create_executive_summary_blocks(self, content: str) -> List[Dict[str, Any]]:
        """Create blocks for executive summary section"""
        blocks = []
        
        blocks.append({
            "object": "block",
            "type": "heading_2",
            "heading_2": {
                "rich_text": [
                    {
                        "type": "text",
                        "text": {
                            "content": "📊 Executive Summary"
                        }
                    }
                ]
            }
        })
        
        # Parse key metrics and insights
        lines = content.split('\n')
        current_paragraph = []
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('### Key Strategic Insights'):
                if current_paragraph:
                    blocks.append(self._create_paragraph_block('\n'.join(current_paragraph)))
                    current_paragraph = []
                
                blocks.append({
                    "object": "block",
                    "type": "heading_3",
                    "heading_3": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": "🔍 Key Strategic Insights"
                                }
                            }
                        ]
                    }
                })
                
            elif line.startswith('### Alignment Breakdown'):
                if current_paragraph:
                    blocks.append(self._create_paragraph_block('\n'.join(current_paragraph)))
                    current_paragraph = []
                
                blocks.append({
                    "object": "block",
                    "type": "heading_3",
                    "heading_3": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": "📈 Alignment Breakdown"
                                }
                            }
                        ]
                    }
                })
                
            elif line.startswith('🚨') or line.startswith('⚠️') or line.startswith('📊'):
                # Key insights as callouts
                blocks.append({
                    "object": "block",
                    "type": "callout",
                    "callout": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": line
                                }
                            }
                        ],
                        "icon": {
                            "emoji": "⚡"
                        },
                        "color": "red_background" if line.startswith('🚨') else "yellow_background"
                    }
                })
                
            elif line.startswith('- 🎯') or line.startswith('- ⚡') or line.startswith('- ⚠️') or line.startswith('- 🚫'):
                # Alignment breakdown as bulleted list
                blocks.append({
                    "object": "block",
                    "type": "bulleted_list_item",
                    "bulleted_list_item": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": line[2:]  # Remove "- " prefix
                                }
                            }
                        ]
                    }
                })
                
            elif line:
                current_paragraph.append(line)
        
        if current_paragraph:
            blocks.extend(self._create_paragraph_blocks('\n'.join(current_paragraph)))
        
        return blocks
    
    def _create_scorecard_blocks(self, content: str) -> List[Dict[str, Any]]:
        """Create blocks for scorecard section"""
        blocks = []
        
        blocks.append({
            "object": "block",
            "type": "heading_2",
            "heading_2": {
                "rich_text": [
                    {
                        "type": "text",
                        "text": {
                            "content": "🏆 Strategic Alignment Scorecard"
                        }
                    }
                ]
            }
        })
        
        # Parse table and score distribution
        lines = content.split('\n')
        table_data = []
        in_table = False
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('| Rank'):
                in_table = True
                continue
            elif line.startswith('|---'):
                continue
            elif line.startswith('|') and in_table:
                # Parse table row
                cells = [cell.strip() for cell in line.split('|')[1:-1]]
                if len(cells) >= 5:
                    table_data.append(cells)
            elif line.startswith('### Score Distribution'):
                in_table = False
                if table_data:
                    # Create table
                    blocks.append(self._create_table_block(table_data))
                    table_data = []
                
                blocks.append({
                    "object": "block",
                    "type": "heading_3",
                    "heading_3": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": "📊 Score Distribution"
                                }
                            }
                        ]
                    }
                })
                
            elif line.startswith('- **'):
                # Score distribution as bulleted list
                blocks.append({
                    "object": "block",
                    "type": "bulleted_list_item",
                    "bulleted_list_item": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": line[2:]  # Remove "- " prefix
                                }
                            }
                        ]
                    }
                })
        
        if table_data:
            blocks.append(self._create_table_block(table_data))
        
        return blocks
    
    def _create_detailed_analysis_blocks(self, content: str) -> List[Dict[str, Any]]:
        """Create blocks for detailed analysis section"""
        blocks = []
        
        blocks.append({
            "object": "block",
            "type": "heading_2",
            "heading_2": {
                "rich_text": [
                    {
                        "type": "text",
                        "text": {
                            "content": "🔬 Detailed Ticket Analysis"
                        }
                    }
                ]
            }
        })
        
        # Parse individual tickets
        lines = content.split('\n')
        current_ticket = {}
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('### ') and ':' in line:
                # New ticket section
                if current_ticket:
                    blocks.append(self._create_ticket_block(current_ticket))
                
                # Parse ticket header
                parts = line[4:].split(':')
                ticket_id = parts[0].strip()
                score = parts[1].strip().split('/')[0]
                
                current_ticket = {
                    'id': ticket_id,
                    'score': score,
                    'category': '',
                    'rationale': '',
                    'principles': '',
                    'depth': ''
                }
                
            elif line.startswith('- **Category**:'):
                current_ticket['category'] = line.split(':', 1)[1].strip()
            elif line.startswith('- **Rationale**:'):
                current_ticket['rationale'] = line.split(':', 1)[1].strip()
            elif line.startswith('- **Matched Principles**:'):
                current_ticket['principles'] = line.split(':', 1)[1].strip()
            elif line.startswith('- **Strategic Depth**:'):
                current_ticket['depth'] = line.split(':', 1)[1].strip()
        
        if current_ticket:
            blocks.append(self._create_ticket_block(current_ticket))
        
        return blocks
    
    def _create_ticket_block(self, ticket: Dict[str, str]) -> Dict[str, Any]:
        """Create a block for an individual ticket"""
        score_int = int(ticket['score']) if ticket['score'].isdigit() else 0
        
        # Choose color based on score
        if score_int >= 80:
            color = "green_background"
            icon = "✅"
        elif score_int >= 60:
            color = "yellow_background"
            icon = "⚠️"
        elif score_int >= 40:
            color = "orange_background"
            icon = "🔶"
        else:
            color = "red_background"
            icon = "❌"
        
        return {
            "object": "block",
            "type": "callout",
            "callout": {
                "rich_text": [
                    {
                        "type": "text",
                        "text": {
                            "content": f"{ticket['id']} - Score: {ticket['score']}/100"
                        },
                        "annotations": {
                            "bold": True
                        }
                    },
                    {
                        "type": "text",
                        "text": {
                            "content": f"\n• Category: {ticket['category']}\n• Rationale: {ticket['rationale']}\n• Principles: {ticket['principles']}\n• Strategic Depth: {ticket['depth']}"
                        }
                    }
                ],
                "icon": {
                    "emoji": icon
                },
                "color": color
            }
        }
    
    def _create_table_block(self, table_data: List[List[str]]) -> Dict[str, Any]:
        """Create a table block from table data"""
        if not table_data:
            return self._create_paragraph_block("No table data available")
        
        # Convert table to simple text format since Notion tables are complex
        table_text = ""
        for row in table_data:
            table_text += " | ".join(row) + "\n"
        
        return {
            "object": "block",
            "type": "code",
            "code": {
                "rich_text": [
                    {
                        "type": "text",
                        "text": {
                            "content": table_text
                        }
                    }
                ],
                "language": "plain text"
            }
        }
    
    def _create_paragraph_blocks(self, text: str) -> List[Dict[str, Any]]:
        """Create paragraph blocks, splitting text if it exceeds Notion's 2000 character limit"""
        blocks = []
        
        # Notion has a 2000 character limit per text block
        if len(text) <= 2000:
            blocks.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": text
                            }
                        }
                    ]
                }
            })
        else:
            # Split text into chunks
            chunks = []
            current_chunk = ""
            
            # Try to split on paragraphs first
            paragraphs = text.split('\n\n')
            
            for paragraph in paragraphs:
                if len(current_chunk) + len(paragraph) + 2 <= 2000:  # +2 for \n\n
                    if current_chunk:
                        current_chunk += "\n\n"
                    current_chunk += paragraph
                else:
                    if current_chunk:
                        chunks.append(current_chunk)
                    current_chunk = paragraph
                    
                    # If a single paragraph is too long, split it
                    while len(current_chunk) > 2000:
                        # Find a good breaking point
                        break_point = current_chunk[:2000].rfind('. ')
                        if break_point == -1:
                            break_point = current_chunk[:2000].rfind(' ')
                        if break_point == -1:
                            break_point = 1997
                        
                        chunks.append(current_chunk[:break_point + 1])
                        current_chunk = current_chunk[break_point + 1:].strip()
            
            if current_chunk:
                chunks.append(current_chunk)
            
            # Create blocks for each chunk
            for chunk in chunks:
                blocks.append({
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": chunk
                                }
                            }
                        ]
                    }
                })
        
        return blocks
    
    def _create_paragraph_block(self, text: str) -> Dict[str, Any]:
        """Create a single paragraph block (for backward compatibility)"""
        blocks = self._create_paragraph_blocks(text)
        return blocks[0] if blocks else {"object": "block", "type": "paragraph", "paragraph": {"rich_text": []}}

def create_notion_manager() -> NotionManager:
    """
    Factory function to create a NotionManager instance
    
    Returns:
        NotionManager: Configured instance
    """
    return NotionManager()