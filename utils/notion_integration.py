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
                title = f"STEVE Strategic Report - {sprint_name}"
            else:
                title = f"STEVE Strategic Alignment Report - {timestamp}"
            
            # Parse the content into clean sections
            parsed_data = self._parse_executive_summary(summary_content)
            
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
                "children": self._create_clean_blocks(parsed_data)
            }
            
            response = self.client.pages.create(**page_data)
            
            page_url = response["url"]
            logger.info(f"Executive summary saved to Notion: {page_url}")
            return page_url
            
        except Exception as error:
            logger.error(f"Failed to create executive summary page: {error}")
            return None
    
    def _parse_executive_summary(self, content: str) -> Dict[str, Any]:
        """Parse the executive summary into clean, structured data"""
        lines = content.split('\n')
        
        # Extract key metrics
        total_tickets = 0
        avg_score = 0
        drift_pct = 0
        
        # Extract scorecard table
        scorecard_rows = []
        in_table = False
        
        # Extract recommendations
        recommendations = []
        
        # Extract detailed ticket analysis for representative examples
        ticket_examples = []
        current_ticket = None
        
        # Category breakdown
        category_breakdown = {
            'core_value': {'count': 0, 'percentage': 0},
            'strategic_enabler': {'count': 0, 'percentage': 0},
            'drift': {'count': 0, 'percentage': 0},
            'distraction': {'count': 0, 'percentage': 0}
        }
        
        for line in lines:
            line = line.strip()
            
            # Extract metrics
            if "tickets" in line and "average" in line.lower():
                numbers = re.findall(r'\d+(?:\.\d+)?', line)
                if len(numbers) >= 2:
                    total_tickets = int(float(numbers[0]))
                    avg_score = float(numbers[1])
            
            if "drift" in line.lower() and "%" in line:
                numbers = re.findall(r'\d+(?:\.\d+)?', line)
                if numbers:
                    drift_pct = float(numbers[-1])
            
            # Extract category breakdown - match exact format: "- 🎯 **Core Value**: 4 tickets (27%)"
            if "🎯 **Core Value**:" in line and "tickets" in line:
                # Parse: "- 🎯 **Core Value**: 4 tickets (27%)"
                numbers = re.findall(r'\d+', line)
                if numbers:
                    category_breakdown['core_value']['count'] = int(numbers[0])
                    if len(numbers) > 1:
                        category_breakdown['core_value']['percentage'] = int(numbers[1])
            
            if "⚡ **Strategic Enabler**:" in line and "tickets" in line:
                # Parse: "- ⚡ **Strategic Enabler**: 1 tickets (7%)"
                numbers = re.findall(r'\d+', line)
                if numbers:
                    category_breakdown['strategic_enabler']['count'] = int(numbers[0])
                    if len(numbers) > 1:
                        category_breakdown['strategic_enabler']['percentage'] = int(numbers[1])
            
            if "⚠️ **Drift**:" in line and "tickets" in line:
                # Parse: "- ⚠️ **Drift**: 1 tickets (7%)"
                numbers = re.findall(r'\d+', line)
                if numbers:
                    category_breakdown['drift']['count'] = int(numbers[0])
                    if len(numbers) > 1:
                        category_breakdown['drift']['percentage'] = int(numbers[1])
            
            if "🚫 **Distraction**:" in line and "tickets" in line:
                # Parse: "- 🚫 **Distraction**: 9 tickets (60%)"
                numbers = re.findall(r'\d+', line)
                if numbers:
                    category_breakdown['distraction']['count'] = int(numbers[0])
                    if len(numbers) > 1:
                        category_breakdown['distraction']['percentage'] = int(numbers[1])
            
            # Extract scorecard table
            if line.startswith('| Rank'):
                in_table = True
                continue
            elif line.startswith('|---'):
                continue
            elif line.startswith('|') and in_table and line.count('|') >= 5:
                cells = [cell.strip() for cell in line.split('|')[1:-1]]
                if len(cells) >= 5:
                    scorecard_rows.append({
                        'rank': cells[0],
                        'ticket': cells[1], 
                        'score': cells[2],
                        'category': cells[3],
                        'focus': cells[4]
                    })
            elif in_table and not line.startswith('|'):
                in_table = False
            
            # Extract detailed ticket analysis for examples
            if line.startswith('### ') and ':' in line and '/100' in line:
                # Parse ticket header like "### SCRUM-26: 100/100"
                parts = line.split(':')
                if len(parts) >= 2:
                    ticket_key = parts[0].replace('### ', '').strip()
                    score_part = parts[1].strip().split('/')[0]
                    try:
                        score = int(score_part)
                        current_ticket = {'key': ticket_key, 'score': score, 'rationale': ''}
                    except:
                        current_ticket = None
            elif current_ticket and line.startswith('- **Rationale**:'):
                rationale = line.replace('- **Rationale**:', '').strip()
                current_ticket['rationale'] = rationale
                ticket_examples.append(current_ticket)
                current_ticket = None
            
            # Extract recommendations (numbered lists)
            if re.match(r'^\d+\.', line):
                rec_text = re.sub(r'^\d+\.\s*', '', line)
                if rec_text and rec_text not in recommendations:
                    recommendations.append(rec_text)
        
        # Fallback: If category breakdown is empty, calculate from scorecard
        if all(cat['count'] == 0 for cat in category_breakdown.values()) and scorecard_rows:
            category_mapping = {
                'Core Value': 'core_value',
                'Strategic Enabler': 'strategic_enabler', 
                'Drift': 'drift',
                'Distraction': 'distraction'
            }
            
            for row in scorecard_rows:
                for cat_name, cat_key in category_mapping.items():
                    if cat_name in row['category']:
                        category_breakdown[cat_key]['count'] += 1
            
            # Calculate percentages
            total = sum(cat['count'] for cat in category_breakdown.values())
            if total > 0:
                for cat in category_breakdown.values():
                    cat['percentage'] = round((cat['count'] / total) * 100)
        
        return {
            'total_tickets': total_tickets,
            'avg_score': avg_score,
            'drift_pct': drift_pct,
            'scorecard_rows': scorecard_rows,
            'recommendations': recommendations,
            'category_breakdown': category_breakdown,
            'ticket_examples': ticket_examples
        }
    
    def _create_clean_blocks(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create enhanced, beautiful Notion blocks with full visual capabilities"""
        blocks = []
        
        # Quick Guide to Scoring System (Toggle) - First for reference
        scoring_guide_children = [
            {
                "object": "block",
                "type": "heading_3",
                "heading_3": {
                    "rich_text": [{"type": "text", "text": {"content": "📊 Score Ranges"}}]
                }
            },
            {
                "object": "block",
                "type": "callout",
                "callout": {
                    "rich_text": [
                        {"type": "text", "text": {"content": "80-100: Core Value"}, "annotations": {"bold": True}},
                        {"type": "text", "text": {"content": "\nHigh-impact work that directly advances our product's core mission and strategic principles. These tickets create visible progress toward our most important objectives."}}
                    ],
                    "icon": {"emoji": "🟢"},
                    "color": "green_background"
                }
            },
            {
                "object": "block",
                "type": "callout",
                "callout": {
                    "rich_text": [
                        {"type": "text", "text": {"content": "60-79: Strategic Enabler"}, "annotations": {"bold": True}},
                        {"type": "text", "text": {"content": "\nFoundational infrastructure or internal improvements that unlock future value. While not always user-facing, they are necessary to support Core Value delivery."}}
                    ],
                    "icon": {"emoji": "🟡"},
                    "color": "yellow_background"
                }
            },
            {
                "object": "block",
                "type": "callout",
                "callout": {
                    "rich_text": [
                        {"type": "text", "text": {"content": "40-59: Drift"}, "annotations": {"bold": True}},
                        {"type": "text", "text": {"content": "\nWell-intentioned work that lacks clear strategic connection. Often includes maintenance tasks or updates that consume capacity without clearly serving strategic priorities."}}
                    ],
                    "icon": {"emoji": "🟠"},
                    "color": "orange_background"
                }
            },
            {
                "object": "block",
                "type": "callout",
                "callout": {
                    "rich_text": [
                        {"type": "text", "text": {"content": "0-39: Distraction"}, "annotations": {"bold": True}},
                        {"type": "text", "text": {"content": "\nWork that not only lacks alignment but carries opportunity cost — tasks that should be reframed, deferred, or stopped altogether to maintain strategic focus."}}
                    ],
                    "icon": {"emoji": "🔴"},
                    "color": "red_background"
                }
            },
            {
                "object": "block",
                "type": "heading_3",
                "heading_3": {
                    "rich_text": [{"type": "text", "text": {"content": "🎯 How Scoring Works"}}]
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        {"type": "text", "text": {"content": "STEVE evaluates each ticket against your company's strategic principles using:"}}
                    ]
                }
            },
            {
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {
                    "rich_text": [{"type": "text", "text": {"content": "Keyword matching against principle descriptions"}}]
                }
            },
            {
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {
                    "rich_text": [{"type": "text", "text": {"content": "Semantic similarity analysis of ticket content"}}]
                }
            },
            {
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {
                    "rich_text": [{"type": "text", "text": {"content": "Weighted principle importance scoring"}}]
                }
            },
            {
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {
                    "rich_text": [{"type": "text", "text": {"content": "AI-powered rationale generation for each assessment"}}]
                }
            }
        ]
        
        blocks.append({
            "object": "block",
            "type": "toggle",
            "toggle": {
                "rich_text": [
                    {"type": "text", "text": {"content": "📘 Quick Guide: Understanding STEVE's Scoring System"}, "annotations": {"bold": True}},
                    {"type": "text", "text": {"content": "\nHow we evaluate tickets against strategic principles"}}
                ],
                "children": scoring_guide_children
            }
        })
        
        # Divider
        blocks.append({
            "object": "block",
            "type": "divider",
            "divider": {}
        })
        
        # Title with visual emphasis
        blocks.append({
            "object": "block",
            "type": "heading_1",
            "heading_1": {
                "rich_text": [{"type": "text", "text": {"content": "🎯 Strategic Alignment Report"}}]
            }
        })
        
        # NEW: Summary Metrics Sidebar
        blocks.append({
            "object": "block",
            "type": "callout",
            "callout": {
                "rich_text": [
                    {"type": "text", "text": {"content": "📊 Quick Metrics\n"}, "annotations": {"bold": True}},
                    {"type": "text", "text": {"content": f"🎯 Avg Score: {data['avg_score']:.1f}/100\n"}},
                    {"type": "text", "text": {"content": f"🟢 Core Value Coverage: {data['category_breakdown']['core_value']['percentage']}%\n"}},
                    {"type": "text", "text": {"content": f"🔴 Distraction Load: {data['category_breakdown']['distraction']['percentage']}%\n"}},
                    {"type": "text", "text": {"content": f"⏱ Drift Velocity: {'High' if data['drift_pct'] > 40 else 'Medium' if data['drift_pct'] > 20 else 'Low'}"}}
                ],
                "icon": {"emoji": "📈"},
                "color": "blue_background"
            }
        })
        
        # NEW: Strategic Narrative
        cv_pct = data['category_breakdown']['core_value']['percentage']
        dist_pct = data['category_breakdown']['distraction']['percentage']
        drift_pct = data['drift_pct']
        
        # Get top tickets for narrative
        top_tickets = []
        if data['scorecard_rows']:
            top_tickets = [row for row in data['scorecard_rows'] if 'Core Value' in row['category']][:2]
        
        narrative = ""
        if cv_pct < 30 and dist_pct > 50:
            narrative = f"We're facing high strategic drift this sprint: only {cv_pct}% of tickets qualify as Core Value, while {dist_pct}% fall into Distraction. "
            if top_tickets:
                narrative += f"The strongest aligned initiatives are {' and '.join([t['ticket'] for t in top_tickets])}. "
            narrative += f"Without correction, this trend risks derailing momentum in Q3 builder-first initiatives."
        elif cv_pct > 60:
            narrative = f"Strong strategic alignment this sprint with {cv_pct}% Core Value work. "
            if top_tickets:
                narrative += f"Leading initiatives {' and '.join([t['ticket'] for t in top_tickets])} exemplify our strategic vision. "
            narrative += "Maintain this focus to accelerate product-market fit."
        else:
            narrative = f"Mixed strategic alignment: {cv_pct}% Core Value work shows room for improvement. "
            if dist_pct > 30:
                narrative += f"With {dist_pct}% in Distraction category, we need to rebalance priorities. "
            narrative += "Focus on elevating Strategic Enablers to Core Value through clearer principle alignment."
        
        blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {
                "rich_text": [
                    {"type": "text", "text": {"content": narrative}, "annotations": {"italic": True}}
                ]
            }
        })
        
        # Divider after narrative
        blocks.append({
            "object": "block",
            "type": "divider",
            "divider": {}
        })
        
        # 1. Strategic Alignment Health Diagnosis
        cv_pct = data['category_breakdown']['core_value']['percentage']
        dist_pct = data['category_breakdown']['distraction']['percentage']
        
        health_status = ""
        health_color = "blue_background"
        health_icon = "📊"
        
        if cv_pct >= 60:
            health_status = f"Strong strategic focus with {cv_pct}% Core Value work."
            health_color = "green_background"
            health_icon = "✅"
        elif cv_pct >= 40:
            health_status = f"Moderate alignment with {cv_pct}% Core Value work. Room for improvement."
            health_color = "yellow_background"
            health_icon = "⚠️"
        else:
            health_status = f"Only {cv_pct}% of current work qualifies as Core Value."
            if dist_pct > 40:
                health_status += f" Over {dist_pct}% falls into the Distraction category, signaling high strategic drift. Immediate course correction required."
            health_color = "red_background"
            health_icon = "🚨"
        
        blocks.append({
            "object": "block",
            "type": "callout",
            "callout": {
                "rich_text": [{"type": "text", "text": {"content": f"Strategic Alignment Health: {health_status}"}}],
                "icon": {"emoji": health_icon},
                "color": health_color
            }
        })
        
        # Divider
        blocks.append({
            "object": "block",
            "type": "divider",
            "divider": {}
        })
        
        # 2. Category Breakdown Table (using structured callouts)
        blocks.append({
            "object": "block",
            "type": "heading_2",
            "heading_2": {
                "rich_text": [{"type": "text", "text": {"content": "📈 Category Distribution"}}]
            }
        })
        
        categories = [
            {
                "name": "Core Value",
                "data": data['category_breakdown']['core_value'],
                "icon": "🟢",
                "color": "green_background",
                "note": "Excellent — prioritize"
            },
            {
                "name": "Strategic Enabler", 
                "data": data['category_breakdown']['strategic_enabler'],
                "icon": "🟡",
                "color": "yellow_background",
                "note": "Supportive — schedule wisely"
            },
            {
                "name": "Drift",
                "data": data['category_breakdown']['drift'],
                "icon": "🟠", 
                "color": "orange_background",
                "note": "⚠️ May indicate binary scoring bias" if data['category_breakdown']['drift']['count'] == 0 else "Needs realignment"
            },
            {
                "name": "Distraction",
                "data": data['category_breakdown']['distraction'],
                "icon": "🔴",
                "color": "red_background",
                "note": "🚨 Strategic misalignment risk" if data['category_breakdown']['distraction']['percentage'] > 30 else "Monitor closely"
            }
        ]
        
        for cat in categories:
            blocks.append({
                "object": "block",
                "type": "callout",
                "callout": {
                    "rich_text": [
                        {"type": "text", "text": {"content": f"{cat['name']}: {cat['data']['count']} tickets ({cat['data']['percentage']}%)"}, "annotations": {"bold": True}},
                        {"type": "text", "text": {"content": f"\n{cat['note']}"}}
                    ],
                    "icon": {"emoji": cat['icon']},
                    "color": cat['color']
                }
            })
        
        # Divider
        blocks.append({
            "object": "block",
            "type": "divider",
            "divider": {}
        })
        
        # 3. Score Distribution Visualization with Interactive Toggles
        blocks.append({
            "object": "block",
            "type": "heading_2",
            "heading_2": {
                "rich_text": [{"type": "text", "text": {"content": "📊 Score Distribution"}}]
            }
        })
        
        # Calculate score distribution with ticket details
        score_bands = {
            "100": {"count": 0, "label": "Perfect alignment", "tickets": [], "icon": "🎯", "color": "green_background"},
            "80-99": {"count": 0, "label": "Strong alignment", "tickets": [], "icon": "✅", "color": "green_background"},
            "60-79": {"count": 0, "label": "Moderate alignment", "tickets": [], "icon": "⚠️", "color": "yellow_background"},
            "40-59": {"count": 0, "label": "Weak alignment", "tickets": [], "icon": "🔶", "color": "orange_background"},
            "0-39": {"count": 0, "label": "Low/no alignment", "tickets": [], "icon": "❌", "color": "red_background"}
        }
        
        for row in data['scorecard_rows']:
            score_clean = re.sub(r'[^\d.]', '', row['score'])
            try:
                score_num = float(score_clean)
                ticket_info = f"{row['ticket']} ({row['score']}) - {row['category']}"
                
                if score_num == 100:
                    score_bands["100"]["count"] += 1
                    score_bands["100"]["tickets"].append(ticket_info)
                elif score_num >= 80:
                    score_bands["80-99"]["count"] += 1
                    score_bands["80-99"]["tickets"].append(ticket_info)
                elif score_num >= 60:
                    score_bands["60-79"]["count"] += 1
                    score_bands["60-79"]["tickets"].append(ticket_info)
                elif score_num >= 40:
                    score_bands["40-59"]["count"] += 1
                    score_bands["40-59"]["tickets"].append(ticket_info)
                else:
                    score_bands["0-39"]["count"] += 1
                    score_bands["0-39"]["tickets"].append(ticket_info)
            except:
                score_bands["0-39"]["count"] += 1
                score_bands["0-39"]["tickets"].append(f"{row['ticket']} (Invalid Score) - {row['category']}")
        
        # Create toggle blocks for each score band
        for band, info in score_bands.items():
            if info["count"] > 0:
                # Create toggle block
                toggle_children = []
                
                # Add tickets as bulleted list inside the toggle
                for ticket in info["tickets"]:
                    toggle_children.append({
                        "object": "block",
                        "type": "bulleted_list_item",
                        "bulleted_list_item": {
                            "rich_text": [{"type": "text", "text": {"content": ticket}}]
                        }
                    })
                
                blocks.append({
                    "object": "block",
                    "type": "toggle",
                    "toggle": {
                        "rich_text": [
                            {"type": "text", "text": {"content": f"{info['icon']} {band}: {info['count']} tickets — {info['label']}"}, "annotations": {"bold": True}}
                        ],
                        "children": toggle_children
                    }
                })
        
        # Divider
        blocks.append({
            "object": "block",
            "type": "divider",
            "divider": {}
        })
        
        # 4. Representative Commentary Section
        if data['ticket_examples']:
            blocks.append({
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"type": "text", "text": {"content": "💬 Representative Commentary"}}]
                }
            })
            
            # Sort examples by score to get high and low examples
            examples = sorted(data['ticket_examples'], key=lambda x: x['score'], reverse=True)
            
            # Show highest scoring example
            if examples:
                high_example = examples[0]
                blocks.append({
                    "object": "block",
                    "type": "quote",
                    "quote": {
                        "rich_text": [
                            {"type": "text", "text": {"content": f"Example: {high_example['key']} (Score: {high_example['score']} — Core Value)"}, "annotations": {"bold": True}},
                            {"type": "text", "text": {"content": f"\n\"{high_example['rationale']}\""}}
                        ]
                    }
                })
            
            # Show lowest scoring example if different
            if len(examples) > 1:
                low_example = examples[-1]
                if low_example['score'] != high_example['score']:
                    blocks.append({
                        "object": "block",
                        "type": "quote",
                        "quote": {
                            "rich_text": [
                                {"type": "text", "text": {"content": f"Example: {low_example['key']} (Score: {low_example['score']} — Distraction)"}, "annotations": {"bold": True}},
                                {"type": "text", "text": {"content": f"\n\"{low_example['rationale']}\""}}
                            ]
                        }
                    })
        
        # Divider
        blocks.append({
            "object": "block",
            "type": "divider",
            "divider": {}
        })
        
        # 5. Strategic Scorecard (Top & Bottom Performers)
        if data['scorecard_rows']:
            blocks.append({
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"type": "text", "text": {"content": "🏆 Strategic Scorecard"}}]
                }
            })
            
            # Top Performers
            top_5 = data['scorecard_rows'][:5]
            if top_5:
                blocks.append({
                    "object": "block",
                    "type": "heading_3",
                    "heading_3": {
                        "rich_text": [{"type": "text", "text": {"content": "🌟 Top Performers"}}]
                    }
                })
                
                for i, row in enumerate(top_5):
                    score_clean = re.sub(r'[^\d.]', '', row['score'])
                    try:
                        score_num = float(score_clean)
                        if score_num >= 80:
                            color = "green_background"
                            icon = "✅"
                        elif score_num >= 60:
                            color = "yellow_background" 
                            icon = "⚠️"
                        else:
                            color = "red_background"
                            icon = "❌"
                    except:
                        color = "gray_background"
                        icon = "📋"
                    
                    # Make the top ticket extra prominent
                    if i == 0 and score_num >= 90:
                        blocks.append({
                            "object": "block",
                            "type": "callout",
                            "callout": {
                                "rich_text": [
                                    {"type": "text", "text": {"content": f"⭐ #{row['rank']} {row['ticket']} - {row['score']} "}, "annotations": {"bold": True}},
                                    {"type": "text", "text": {"content": "(HIGHEST IMPACT)"}, "annotations": {"bold": True, "italic": True}},
                                    {"type": "text", "text": {"content": f"\nCategory: {row['category']}\nFocus: {row['focus']}\n💡 This exemplifies strategic alignment"}}
                                ],
                                "icon": {"emoji": "⭐"},
                                "color": "green_background"
                            }
                        })
                    else:
                        blocks.append({
                            "object": "block",
                            "type": "callout",
                            "callout": {
                                "rich_text": [
                                    {"type": "text", "text": {"content": f"#{row['rank']} {row['ticket']} - {row['score']}"}, "annotations": {"bold": True}},
                                    {"type": "text", "text": {"content": f"\nCategory: {row['category']}\nFocus: {row['focus']}"}}
                                ],
                                "icon": {"emoji": icon},
                                "color": color
                            }
                        })
            
            # NEW: Ticket of the Sprint - Highlight the highest scoring ticket
            if top_5 and float(re.sub(r'[^\d.]', '', top_5[0]['score'])) >= 80:
                top_ticket = top_5[0]
                blocks.append({
                    "object": "block",
                    "type": "divider",
                    "divider": {}
                })
                
                blocks.append({
                    "object": "block",
                    "type": "callout",
                    "callout": {
                        "rich_text": [
                            {"type": "text", "text": {"content": f"🏆 Ticket of the Sprint: {top_ticket['ticket']}\n"}, "annotations": {"bold": True}},
                            {"type": "text", "text": {"content": f"This ticket delivers on multiple strategic principles and represents the clearest signal of product vision execution this sprint. It's the work that exemplifies where we're headed."}}
                        ],
                        "icon": {"emoji": "🏆"},
                        "color": "purple_background"
                    }
                })
            
            # Bottom Performers (if more than 5 tickets)
            if len(data['scorecard_rows']) > 5:
                bottom_5 = data['scorecard_rows'][-5:]
                blocks.append({
                    "object": "block",
                    "type": "heading_3",
                    "heading_3": {
                        "rich_text": [{"type": "text", "text": {"content": "🚨 Needs Immediate Attention"}}]
                    }
                })
                
                for row in bottom_5:
                    blocks.append({
                        "object": "block",
                        "type": "callout",
                        "callout": {
                            "rich_text": [
                                {"type": "text", "text": {"content": f"#{row['rank']} {row['ticket']} - {row['score']}"}, "annotations": {"bold": True}},
                                {"type": "text", "text": {"content": f"\nCategory: {row['category']}\nAction: Review and realign immediately"}}
                            ],
                            "icon": {"emoji": "🔴"},
                            "color": "red_background"
                        }
                    })
        
        # Divider
        blocks.append({
            "object": "block",
            "type": "divider",
            "divider": {}
        })
        
        # NEW: Strategic Blind Spots
        blocks.append({
            "object": "block",
            "type": "heading_2",
            "heading_2": {
                "rich_text": [{"type": "text", "text": {"content": "🔍 Strategic Blind Spots"}}]
            }
        })
        
        # Analyze which principles are underrepresented
        # This is a simplified version - in a real implementation, you'd analyze against actual principles
        blind_spots = []
        
        # Check for common blind spots based on low representation
        if not any('fresh' in str(row).lower() or 'intelligence' in str(row).lower() for row in data['scorecard_rows']):
            blind_spots.append("No tickets this sprint advance Fresh Intelligence through real-time data integration or RAG implementation. Consider injecting a scoped agent for automated intelligence gathering.")
        
        if not any('premium' in str(row).lower() or 'source' in str(row).lower() or 'curation' in str(row).lower() for row in data['scorecard_rows']):
            blind_spots.append("Premium Source Curation is completely absent from current work. We're missing opportunities to differentiate through high-quality data sources.")
        
        if data['category_breakdown']['core_value']['count'] == 0:
            blind_spots.append("Zero Core Value tickets signals complete strategic misalignment. This is a critical gap requiring immediate intervention.")
        
        if not blind_spots:
            blind_spots.append("Good principle coverage this sprint. Continue monitoring for gaps in future sprints.")
        
        for blind_spot in blind_spots:
            blocks.append({
                "object": "block",
                "type": "callout",
                "callout": {
                    "rich_text": [{"type": "text", "text": {"content": blind_spot}}],
                    "icon": {"emoji": "🔍"},
                    "color": "gray_background"
                }
            })
        
        # Divider
        blocks.append({
            "object": "block",
            "type": "divider",
            "divider": {}
        })
        
        # 6. Improved Strategic Recommendations
        blocks.append({
            "object": "block",
            "type": "heading_2",
            "heading_2": {
                "rich_text": [{"type": "text", "text": {"content": "🎯 Strategic Recommendations"}}]
            }
        })
        
        # Build specific recommendations based on data with contextual emojis
        core_tickets = [row['ticket'] for row in data['scorecard_rows'] if 'Core Value' in row['category']][:4]
        distraction_tickets = [row['ticket'] for row in data['scorecard_rows'] if 'Distraction' in row['category']][:4]
        
        strategic_recommendations = [
            f"📌 Focus development on Core Value tickets ({', '.join(core_tickets)})" if core_tickets else "📌 Identify and prioritize Core Value work",
            f"⚠️ Deprioritize or pause Distraction tickets ({', '.join(distraction_tickets)})" if distraction_tickets else "⚠️ Review low-scoring tickets for elimination",
            "🏷️ Add 'Strategic Principle' as a required tag in all future tickets",
            "🔄 Run STEVE analysis pre-sprint during backlog grooming",
            "🚫 Flag and halt any new ticket scoring below 40 before grooming"
        ]
        
        for rec in strategic_recommendations:
            blocks.append({
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {
                    "rich_text": [{"type": "text", "text": {"content": rec[:1900]}}]
                }
            })
        
        # Divider
        blocks.append({
            "object": "block",
            "type": "divider",
            "divider": {}
        })
        
        # 7. Next Steps (with checkboxes)
        blocks.append({
            "object": "block",
            "type": "heading_2",
            "heading_2": {
                "rich_text": [{"type": "text", "text": {"content": "📋 Next Steps"}}]
            }
        })
        
        next_steps = [
            "Review ticket priorities based on alignment scores",
            "Focus sprint planning on Core Value tickets",
            "Address or defer Distraction category tickets", 
            "Implement strategic alignment review for future work",
            "Schedule strategic alignment checkpoint for next sprint"
        ]
        
        for step in next_steps:
            blocks.append({
                "object": "block",
                "type": "to_do",
                "to_do": {
                    "rich_text": [{"type": "text", "text": {"content": step}}],
                    "checked": False
                }
            })
        
        return blocks

def create_notion_manager() -> NotionManager:
    """
    Factory function to create a NotionManager instance
    
    Returns:
        NotionManager: Configured instance
    """
    return NotionManager()