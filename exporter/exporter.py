import time
import random
from os import path
import yaml
from prometheus_client.core import GaugeMetricFamily, REGISTRY, CounterMetricFamily
from prometheus_client import start_http_server
from lib import k8s
from lib import cp4d_monitor
import requests
from requests.packages.urllib3.exceptions import InsecureRequestWarning
import json


def get_admin_token(admin_pass='password',cp4d_host='https://ibm-nginx-svc'):
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

class RandomNumberCollector(object):
    def __init__(self, namespace='cpd', host='https://ibm-nginx-svc'):
        self.namespace = namespace
        self.token = get_admin_token(k8s.get_admin_secret(self.namespace),host)
        self.cp4d_host = host
        pass


    def collect(self):
        projects = cp4d_monitor.get_project_list()

        cp4d_catalog_id = cp4d_monitor.get_asset_catalog_id()
        cp4d_platform_global_connections_request = cp4d_monitor.get_all_available_connections_response(cp4d_catalog_id)
        if cp4d_platform_global_connections_request.status_code == 200:
            connection_count = cp4d_platform_global_connections_request.json()["total_count"]
        else:
            connection_count = 0
        count = CounterMetricFamily("connections_count", "Platform connection counts", labels=['connectionCount'])
        count.add_metric(['connectionCount'], connection_count)
        yield count


if __name__ == "__main__":
    requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

    port = 9000
    frequency = 1
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