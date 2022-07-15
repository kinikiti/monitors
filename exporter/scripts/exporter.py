import time
from os import path
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

        projects = cp4d_monitor.get_project_list()

        cp4d_catalog_id = cp4d_monitor.get_asset_catalog_id()
        cp4d_platform_global_connections_request = cp4d_monitor.get_all_available_connections_response(cp4d_catalog_id)
        if cp4d_platform_global_connections_request.status_code == 200:
            connection_count = cp4d_platform_global_connections_request.json()["total_count"]
        else:
            connection_count = 0

        jobs_list = cp4d_monitor.get_jobs_list(projects)

        for project in projects:
            if project['metadata']['guid'] in jobs_list.keys():
                project_jobs = jobs_list[project['metadata']['guid']]['results']
                for job in project_jobs:
                    runs = cp4d_monitor.get_job_run_info(project_id=project['metadata']['guid'], job_id=job['metadata']['asset_id'])
                    if len(runs) == 0:
                        continue
                    run = runs[0]
                    if run["entity"]["job_run"]["state"] == "Running": watsonstudio_active_jobs_overall_count += 1
                total_jobs += jobs_list[project['metadata']['guid']]["total_rows"]

            labels = 'icpdsupport/projectId={},runtime=true'.format(project['metadata']['guid'])
            pods = cp4d_monitor.get_pod_usage(label_selector=labels)

            app_labels = 'dsxProjectId={}'.format(project['metadata']['guid'])
            deployments = cp4d_monitor.get_deployment(label_selector=app_labels)

            if len(pods) > 0:
                total_runtime += 1
                for pod in pods:
                    print(pod)
                    project_total_runtime = +1
                    key_deployment = pod['containers'][0]['name'][:-2]
                    deployment_resources = deployments[key_deployment].spec.template.spec.containers[0].resources
                    pod_cpu_usage = convert_cpu_unit(pod['containers'][0]['usage']['cpu'])
                    pod_cpu_limits = convert_cpu_unit(deployment_resources.limits['cpu'])
                    pod_cpu_requests = convert_cpu_unit(deployment_resources.requests['cpu'])
                    pod_memory_limits = convert_memory_unit(deployment_resources.limits['memory'])
                    pod_memory_requests = convert_memory_unit(deployment_resources.requests['memory'])
                    pod_memory_usage = convert_memory_unit(pod['containers'][1]['usage']['memory'])

                    project_total_cpu_limits += pod_cpu_limits
                    project_total_memory_limits += pod_memory_limits
                    project_total_cpu_requests += pod_cpu_requests
                    project_total_memory_requests += pod_memory_requests
                    project_total_memory_usage += pod_memory_usage
                    project_total_cpu_usage += pod_cpu_usage

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
    frequency = 10
    if path.exists('config.yml'):
        with open('config.yml', 'r') as config_file:
            try:
                config = yaml.safe_load(config_file)
                port = int(config['port'])
                frequency = config['scrape_frequency']
            except yaml.YAMLError as error:
                print(error)

    start_http_server(port)
    REGISTRY.register(RandomNumberCollector(host='https://testcp4d.bdap.deloitteanalytics.eu/'))
    while True:
        # period between collection
        time.sleep(frequency)
