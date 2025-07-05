import os
import logging
from datetime import datetime
from typing import Optional, Dict, Any
import yaml
from rich.console import Console
from rich.logging import RichHandler
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.text import Text
from rich import box

from core.schemas import AlignmentCategory, AlignmentResult


class SteveLogger:
    def __init__(self):
        self.console = Console()
        self._load_settings()
        self._setup_logger()
        self.progress = None
    
    def _load_settings(self):
        with open("config/settings.yaml", "r") as f:
            self.settings = yaml.safe_load(f)["logging"]
    
    def _setup_logger(self):
        """Setup rich logging handler"""
        logging.basicConfig(
            level=os.getenv("LOG_LEVEL", "INFO"),
            format="%(message)s",
            handlers=[
                RichHandler(
                    console=self.console,
                    show_time=self.settings["console"]["show_time"],
                    show_path=self.settings["console"]["show_path"],
                    rich_tracebacks=True
                )
            ]
        )
    
    def section(self, section_name: str, message: str, **kwargs):
        """Log with section prefix"""
        color = self._get_section_color(section_name)
        prefix = f"[{color}][{section_name}][/{color}]"
        self.console.print(f"{prefix} {message}", **kwargs)
    
    def _get_section_color(self, section: str) -> str:
        """Get color for section"""
        section_colors = {
            "INGEST": "blue",
            "ANALYZE": "yellow",
            "REWRITE": "magenta",
            "ACTION": "green",
            "SUMMARY": "cyan",
            "ERROR": "red"
        }
        return section_colors.get(section, "white")
    
    def ticket_analysis(self, ticket_key: str, result: AlignmentResult):
        """Display ticket analysis result"""
        color = self.settings["colors"][result.category.value]
        
        # Create a panel for the ticket
        content = f"""
[bold]Ticket:[/bold] {ticket_key}
[bold]Score:[/bold] {result.alignment_score}/100
[bold]Category:[/bold] [{color}]{result.category.value.replace('_', ' ').title()}[/{color}]
[bold]Rationale:[/bold] {result.rationale}
        """
        
        if result.matched_principles:
            content += f"\n[bold]Principles:[/bold] {', '.join(result.matched_principles)}"
        
        panel = Panel(
            content.strip(),
            title=f"📊 Analysis: {ticket_key}",
            border_style=color,
            box=box.ROUNDED
        )
        
        self.console.print(panel)
    
    def sprint_summary(self, summary: Dict[str, Any]):
        """Display sprint summary table"""
        # Alignment breakdown table
        table = Table(title="🎯 Sprint Alignment Summary", box=box.ROUNDED)
        table.add_column("Category", style="bold")
        table.add_column("Count", justify="right")
        table.add_column("Percentage", justify="right")
        
        total = summary["total_tickets"]
        for category, count in summary["alignment_breakdown"].items():
            color = self.settings["colors"][category]
            percentage = (count / total * 100) if total > 0 else 0
            table.add_row(
                f"[{color}]{category.replace('_', ' ').title()}[/{color}]",
                str(count),
                f"{percentage:.1f}%"
            )
        
        self.console.print(table)
        
        # Key metrics
        metrics = Panel(
            f"""
[bold]Total Tickets:[/bold] {summary['total_tickets']}
[bold]Average Alignment:[/bold] {summary['average_alignment_score']:.1f}/100
[bold]Drift Percentage:[/bold] [{self._drift_color(summary['drift_percentage'])}]{summary['drift_percentage']:.1f}%[/{self._drift_color(summary['drift_percentage'])}]
            """.strip(),
            title="📈 Key Metrics",
            box=box.ROUNDED
        )
        self.console.print(metrics)
        
        # Recommendations
        if summary["recommendations"]:
            rec_text = "\n".join([f"• {rec}" for rec in summary["recommendations"]])
            recommendations = Panel(
                rec_text,
                title="💡 Recommendations",
                box=box.ROUNDED,
                border_style="yellow"
            )
            self.console.print(recommendations)
    
    def _drift_color(self, percentage: float) -> str:
        """Get color based on drift percentage"""
        if percentage < 20:
            return "green"
        elif percentage < 40:
            return "yellow"
        else:
            return "red"
    
    def start_progress(self, description: str):
        """Start a progress spinner"""
        self.progress = Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=self.console
        )
        self.progress.start()
        self.task = self.progress.add_task(description)
    
    def stop_progress(self):
        """Stop progress spinner"""
        if self.progress:
            self.progress.stop()
            self.progress = None
    
    def success(self, message: str):
        """Log success message"""
        self.console.print(f"[green]✓[/green] {message}")
    
    def error(self, message: str):
        """Log error message"""
        self.console.print(f"[red]✗[/red] {message}")
    
    def warning(self, message: str):
        """Log warning message"""
        self.console.print(f"[yellow]⚠[/yellow] {message}")
    
    def info(self, message: str):
        """Log info message"""
        self.console.print(f"[blue]ℹ[/blue] {message}")


# Global logger instance
_logger_instance = None

def get_logger(name: Optional[str] = None) -> logging.Logger:
    """Get logger instance"""
    global _logger_instance
    if _logger_instance is None:
        _logger_instance = SteveLogger()
    
    logger = logging.getLogger(name or "steve")
    # Attach custom methods
    logger.steve = _logger_instance
    return logger