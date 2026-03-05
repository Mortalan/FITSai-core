import subprocess
import re
import logging
from typing import Optional, Dict

logger = logging.getLogger(__name__)

class SystemMonitorService:
    """Provides Momo with self-awareness about her system status."""
    
    @classmethod
    def get_system_report(cls) -> str:
        try:
            report_sections = []
            
            # 1. System Uptime
            uptime = cls._run_command(["/usr/bin/uptime", "-p"])
            load_avg = cls._run_command(["/usr/bin/uptime"])
            if uptime and load_avg:
                load_match = re.search(r"load average: ([\d\.]+, [\d\.]+, [\d\.]+)", load_avg)
                load_str = load_match.group(1) if load_match else "N/A"
                report_sections.append(f"### System Uptime\n{uptime.strip()}\nLoad Average: {load_str}")
            
            # 2. Memory Usage
            mem_info = cls._run_command(["/usr/bin/free", "-h"])
            if mem_info:
                lines = mem_info.split("\n")[:3]
                report_sections.append("### Memory Usage\n```\n" + "\n".join(lines) + "\n```")
            
            # 3. GPU Usage
            gpu_info = cls._run_command(["/usr/bin/nvidia-smi", "--query-gpu=name,memory.used,memory.total,utilization.gpu", "--format=csv,noheader"])
            if gpu_info:
                report_sections.append(f"### GPU Status\n{gpu_info.strip()}")
            
            # 4. Disk Usage
            disk_info = cls._run_command(["/usr/bin/df", "-h", "/"])
            if disk_info:
                lines = disk_info.split("\n")[:2]
                report_sections.append("### Disk Usage (Root)\n```\n" + "\n".join(lines) + "\n```")
            
            # 5. Key Services Status
            services = [
                ("momo-backend", "Momo Backend"), 
                ("felicia-backend", "Felicia Backend"), 
                ("ollama", "Ollama AI"), 
                ("nginx", "Web Server")
            ]
            service_statuses = []
            for service_name, display_name in services:
                # Use full path and remove .service extension just in case
                status_result = cls._run_command(["/usr/bin/systemctl", "is-active", service_name])
                # is-active returns 'active' if running, 'inactive' or other if not
                is_active = status_result.strip() == "active" if status_result else False
                status = "Running" if is_active else f"Not running (Status: {status_result})"
                service_statuses.append(f"- {display_name}: {status}")
            
            if service_statuses:
                report_sections.append("### Service Status\n" + "\n".join(service_statuses))
            
            return "\n\n".join(report_sections)
            
        except Exception as e:
            logger.error(f"Error generating system report: {e}")
            return f"I encountered an issue while checking my system status: {str(e)}"
    
    @staticmethod
    def _run_command(cmd: list, timeout: int = 5) -> Optional[str]:
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, check=False)
            # systemctl is-active often returns non-zero even when active is printed
            output = result.stdout.strip() if result.stdout else result.stderr.strip()
            return output
        except Exception as e:
            return None

system_monitor = SystemMonitorService()
