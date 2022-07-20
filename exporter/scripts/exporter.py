import time
import os
import yaml
from prometheus_client.core import REGISTRY, CounterMetricFamily
from prometheus_client import start_http_server
from lib import cp4d_monitor, k8s
import requests
from requests.packages.urllib3.exceptions import InsecureRequestWarning
import json


def get_admin_token(admin_pass='password', cp4d_host='https://ibm-nginx-svc'):
    headers = {'Content-Type': 'application/json', 'Accept': 'application/json'}
    data = {"username": "admin", "password": admin_pass}
    auth_api = cp4d_host + "/icp4d-api/v1/authorize"
    res = requests.post(auth_api, verify=False, headers=headers, json=data)
    if res.status_code != 200:
        print('Error requesting admin token - status_code - ' + str(res.status_code))
        try:
            print(res.json())
        except Exception:
            print(res.text)
        exit(1)

    admin_token = json.loads(res.text)['token']
    return str('Bearer ' + admin_token)


def convert_cpu_unit(cpu):
    if 'm' not in cpu:
        return int(cpu) * 1000
    return int(cpu[0:-1])


def convert_memory_unit(memory):
    if "Ki" in memory:
        return int(memory[0:-2]) / 1024 / 1024
    if "Gi" in memory:
        return int(memory[0:-2])
    if "Mi" in memory:
        return int(memory[0:-2]) / 1024
    return memory


class RandomNumberCollector(object):
    def __init__(self, namespace='cpd', host='https://ibm-nginx-svc'):
        self.namespace = namespace
        self.token = get_admin_token(k8s.get_admin_secret(self.namespace), host)
        self.cp4d_host = host
        pass

    def collect(self):

        total_runtime = 0
        project_total_runtime = 0
        project_total_cpu_limits = 0
        project_total_memory_limits = 0
        project_total_cpu_requests = 0
        project_total_memory_requests = 0
        project_total_memory_usage = 0
        project_total_cpu_usage = 0
        total_jobs = 0
        watsonstudio_active_jobs_overall_count = 0

        count = CounterMetricFamily("connections_count", "Platform connection counts", labels=['connectionCount'])
        count.add_metric(['connectionCount'], connection_count)
        yield count

        jobs = CounterMetricFamily("jobs_count", "Jobs at the platform", labels=['jobsCount'])
        jobs.add_metric(['jobsCount'], total_jobs)
        yield jobs

        active_jobs = CounterMetricFamily("active_jobs_count", "Active jobs at the platform", labels=['activeJobsCount'])
        active_jobs.add_metric(['activeJobsCount'], watsonstudio_active_jobs_overall_count)
        yield active_jobs

        project_total_cpu_limits_metric = CounterMetricFamily("project_total_cpu_limits", "Total Project CPU limits", labels=['projectTotalCPULimits'])
        project_total_cpu_limits_metric.add_metric(['projectTotalCPULimits'], project_total_cpu_limits)
        yield project_total_cpu_limits_metric

        project_total_memory_limits_metric = CounterMetricFamily("project_total_memory_limits", "Total Project Memory limits", labels=['projectTotalMemoryLimits'])
        project_total_memory_limits_metric.add_metric(['projectTotalMemoryLimits'], project_total_memory_limits)
        yield project_total_memory_limits_metric

        project_total_cpu_requests_metric = CounterMetricFamily("project_total_CPU_requests", "Total Project CPU requests", labels=['projectTotalCPURequests'])
        project_total_cpu_requests_metric.add_metric(['projectTotalCPURequests'], project_total_cpu_requests)
        yield project_total_cpu_requests_metric

        project_total_memory_requests_metric = CounterMetricFamily("project_total_memory_requests", "Total Project memory requests", labels=['projectTotalMemoryRequests'])
        project_total_memory_requests_metric.add_metric(['projectTotalMemoryRequests'], project_total_memory_requests)
        yield project_total_memory_requests_metric

        project_total_cpu_usage_metric = CounterMetricFamily("project_total_cpu_usage", "Total Project CPU usage", labels=['projectTotalCPUUsage'])
        project_total_cpu_usage_metric.add_metric(['projectTotalCPUUsage'], project_total_cpu_usage)
        yield project_total_cpu_usage_metric

        project_total_memory_usage_metric = CounterMetricFamily("project_total_memory_usage", "Total Project memory usage", labels=['projectTotalMemoryUsage'])
        project_total_memory_usage_metric.add_metric(['projectTotalMemoryUsage'], project_total_memory_usage)
        yield project_total_memory_usage_metric

        project_total_runtimes_metric = CounterMetricFamily("project_total_runtimes", "Total Project runtimes", labels=['projectTotalRuntimes'])
        project_total_runtimes_metric.add_metric(['projectTotalRuntimes'], project_total_runtime)
        yield project_total_runtimes_metric


if __name__ == "__main__":
    requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

    port = 9000
    frequency = int(os.environ.get('ICPD_SCRAPE_INTERVAL'))

    start_http_server(port)
    REGISTRY.register(RandomNumberCollector())
    while True:
        # period between collection
        time.sleep(frequency)
