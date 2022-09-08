import datetime
import os
from pathlib import Path
import requests
import json
from lib import cpdctl
from lib import k8s
from requests.packages.urllib3.exceptions import InsecureRequestWarning


def get_current_timestamp():
    return datetime.datetime.now().timestamp()


def need_to_fetch(fetch_interval, fetch_timestamp):
    return get_current_timestamp() - (fetch_interval * 60 + fetch_timestamp) > 0


configmap_name = 'cp4d-monitor-configuration'
project_last_refresh_key = 'cp4d-project-last-refresh'
project_refresh_interval_key = 'cp4d-project-refresh-interval-minutes'
jobs_last_refresh_key = 'cp4d-job-last-refresh'
jobs_last_refresh_interval_key = 'cp4d-job-refresh-interval-minutes'
wkc_last_refresh_key = 'cp4d-wkc-last-refresh'
wkc_last_refresh_interval_key = 'cp4d-wkc-refresh-interval-minutes'
spaces_last_refresh_key = 'cp4d-space-last-refresh'
spaces_refresh_interval_key = 'cp4d-space-refresh-interval-minutes'

cache_folder = '/user-home/_global_/monitors'
Path(cache_folder).mkdir(parents=True, exist_ok=True)
projects_cache_file = cache_folder + '/projects.json'
jobs_cache_file = cache_folder + '/jobs.json'
wkc_cache_file = cache_folder + '/wkc.json'
spaces_cache_file = cache_folder + '/spaces.json'

namespace = os.environ.get('ICPD_CONTROLPLANE_NAMESPACE')
if namespace is None:
    print("Unable to read from expected environment variable ICPD_CONTROLPLANE_NAMESPACE")
    exit(1)

requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
admin_pass = k8s.get_admin_secret(namespace)

cp4d_host = os.environ.get('ICPD_URL')
if cp4d_host is None:
    cp4d_host = 'https://ibm-nginx-svc'

k8s.check_ccs_svc(namespace)
cpdctl.cpdctl_init_config_context('admin', admin_pass, cp4d_host)


def get_project_list():
    projects = []
    cacheconfig = k8s.get_config_map(namespace=namespace, name=configmap_name)
    project_fetch_interval = int(cacheconfig[project_refresh_interval_key])*60
    last_fetch_timestamp = datetime.datetime.fromtimestamp(float(cacheconfig[project_last_refresh_key]))
    current_time = datetime.datetime.now()
    time_difference = (current_time - last_fetch_timestamp).total_seconds()
    print('Last time data was fetched %s'.format(last_fetch_timestamp))
    print('Cache renewal interval %s'.format(project_fetch_interval))
    print('Current time %s'.format(current_time))
    print('Difference in seconds %s'.format(time_difference))
    if need_to_fetch(project_fetch_interval, last_fetch_timestamp) or not os.path.exists(projects_cache_file):
        print('fetching projects')
        project_data = cpdctl.cpdctl_get_projects()
        if project_data['total_results'] > 0:
            projects = project_data['resources']
        print(projects)
        with open(projects_cache_file, 'w') as f:
            f.write(json.dumps(projects))
        cacheconfig[project_last_refresh_key] = str(get_current_timestamp())
        k8s.set_config_map(namespace=namespace, name=configmap_name, data=cacheconfig)
        return projects

    with open(projects_cache_file, 'r') as f:
        projects = json.loads(f.read())
    return projects


def get_jobs_list(projects):
    jobs = {}
    cacheconfig = k8s.get_config_map(namespace=namespace, name=configmap_name)
    job_fetch_interval = float(cacheconfig[jobs_last_refresh_interval_key])
    last_fetch_timestamp = float(cacheconfig[jobs_last_refresh_key])
    if need_to_fetch(job_fetch_interval, last_fetch_timestamp) or not os.path.exists(jobs_cache_file):
        for project in projects:
            project_id = project['metadata']['guid']
            jobs_data = cpdctl.cpdctl_get_jobs(project_id=project_id)
            if len(jobs_data) > 0 and jobs_data['total_rows'] > 0:
                jobs[project_id] = cpdctl.cpdctl_get_jobs(project_id=project_id)

        with open(jobs_cache_file, 'w') as f:
            f.write(json.dumps(jobs))
        cacheconfig[jobs_last_refresh_key] = str(get_current_timestamp())
        k8s.set_config_map(namespace=namespace, name=configmap_name, data=cacheconfig)
        return jobs

    with open(jobs_cache_file, 'r') as f:
        jobs = json.loads(f.read())
    return jobs


def get_all_users():
    bearer_token = get_admin_token()
    headers = {'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': str(bearer_token)}
    url = cp4d_host + '/usermgmt/v1/usermgmt/users'
    all_users_res = requests.get(url, headers=headers, verify=False)
    all_users = {}
    # print(all_users_response)
    if all_users_res.status_code != 200:
        print('Error requesting get all users - status_code - ' + str(all_users_res.status_code))
        try:
            print(all_users_res.json())
        except Exception:
            print(all_users_res.text)
        return None

    users = json.loads(all_users_res.text)
    for user in users:
        all_users[user['uid']] = user
    return all_users


def get_job_run_info(project_id, job_id):
    bearer_token = get_admin_token()
    headers = {'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': str(bearer_token)}
    url = cp4d_host + f'/v2/jobs/{job_id}/runs?project_id={project_id}'
    job_run_info_res = requests.get(url, headers=headers, verify=False)
    if job_run_info_res.status_code != 200:
        print('Error requesting get all runs - status_code - ' + str(job_run_info_res.status_code))
        try:
            print(job_run_info_res.json())
        except Exception:
            print(job_run_info_res.text)
        return []
    runs = json.loads(job_run_info_res.text)
    return runs['results']


def get_admin_token():
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


# Get the Cloud Pak for Data Platform Asset Catalog Id
def get_asset_catalog_id():
    bearer_token = get_admin_token()
    headers_nginx = {'Content-Type': 'application/json', 'Accept': 'application/json',
                     'Authorization': str(bearer_token)}
    cp4d_platform_asset_catalog_url = cp4d_host + '/v2/catalogs?entity.name=Platform%20assets%20catalog'
    cp4d_platform_asset_catalog_request = requests.get(cp4d_platform_asset_catalog_url, headers=headers_nginx,
                                                       verify=False)
    if cp4d_platform_asset_catalog_request.status_code != 200:
        print(
            'Error requesting asset catalog id - status_code - ' + str(cp4d_platform_asset_catalog_request.status_code))
        try:
            print(cp4d_platform_asset_catalog_request.json())
        except Exception:
            print(cp4d_platform_asset_catalog_request.text)
        print(
            'Monitor observations will be unavailable as of missing expected "Platform Asset Catalog". Exiting monitor...')
        exit(1)
    cp4d_platform_asset_catalog_response = json.loads(cp4d_platform_asset_catalog_request.content)

    ##cp4d issue, and filter the Platform assets catalog
    cp4d_catalog_id = ""
    for catalog in cp4d_platform_asset_catalog_response["catalogs"]:
        if catalog["entity"]["name"] == "Platform assets catalog":
            cp4d_catalog_id = catalog["metadata"]["guid"]
            break

    if cp4d_catalog_id == "":
        print('Error requesting asset catalog id - Catalog with name "Platform assets catalog" expected, but not found')
        print(cp4d_platform_asset_catalog_request.content)
        exit(1)

    print("Found Cloud Pak for Data Platform Assets Catalog Id: {}".format(cp4d_catalog_id))
    return cp4d_catalog_id


# Get all available connections response
def get_all_available_connections_response(asset_catalog_id):
    bearer_token = get_admin_token()
    headers_nginx = {'Content-Type': 'application/json', 'Accept': 'application/json',
                     'Authorization': str(bearer_token)}
    cp4d_platform_global_connections_url = cp4d_host + '/v2/connections?catalog_id={}&entity.flags=personal_credentials'.format(
        asset_catalog_id)
    cp4d_platform_global_connections_request = requests.get(cp4d_platform_global_connections_url, headers=headers_nginx,
                                                            verify=False)
    return cp4d_platform_global_connections_request


def test_connection_response(resource_id, cp4d_catalog_id):
    bearer_token = get_admin_token()
    headers_nginx = {'Content-Type': 'application/json', 'Accept': 'application/json',
                     'Authorization': str(bearer_token)}
    cp4d_platform_test_connection_url = cp4d_host + '/v2/connections/{}/actions/test?catalog_id={}'.format(resource_id,
                                                                                                           cp4d_catalog_id)
    cp4d_platform_test_connection_request_data = "{}"
    cp4d_platform_test_connection_request = requests.put(cp4d_platform_test_connection_url, headers=headers_nginx,
                                                         verify=False, data=cp4d_platform_test_connection_request_data)
    return cp4d_platform_test_connection_request


def get_deployment(label_selector):
    return k8s.get_deployment(namespace=namespace, label_selector=label_selector)


def get_pod_usage(label_selector):
    return k8s.get_pod_usage(namespace=namespace, label_selector=label_selector)


def get_waston_knowledge_catalogs():
    bearer_token = get_admin_token()
    headers = {'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': str(bearer_token)}
    url = cp4d_host + '/v2/catalogs'
    wkc_res = requests.get(url, headers=headers, verify=False)
    if wkc_res.status_code != 200:
        print('Error requesting get waston knowledge catalogs - status_code - ' + str(wkc_res.status_code))
        try:
            print(wkc_res.json())
        except Exception:
            print(wkc_res.text)
        return []
    return json.loads(wkc_res.text)['catalogs']


def get_waston_knowledge_catalogs_in_cache():
    wkc = []
    cacheconfig = k8s.get_config_map(namespace=namespace, name=configmap_name)
    wkc_fetch_interval = float(cacheconfig[wkc_last_refresh_interval_key])
    last_fetch_timestamp = float(cacheconfig[wkc_last_refresh_key])
    if need_to_fetch(wkc_fetch_interval, last_fetch_timestamp) or not os.path.exists(wkc_cache_file):
        wkc = get_waston_knowledge_catalogs()
        with open(wkc_cache_file, 'w') as f:
            f.write(json.dumps(wkc))

        cacheconfig[wkc_last_refresh_key] = str(get_current_timestamp())
        k8s.set_config_map(namespace=namespace, name=configmap_name, data=cacheconfig)
        return wkc

    with open(wkc_cache_file, 'r') as f:
        wkc = json.loads(f.read())
    return wkc


def get_assets_by_catalog(catalog_id):
    bearer_token = get_admin_token()
    headers = {'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': str(bearer_token)}
    payload = {"query": "*:*", "limit": 200}
    url = cp4d_host + f'/v2/asset_types/asset/search?catalog_id={catalog_id}'
    assets_res = requests.post(url, headers=headers, verify=False, json=payload)
    if assets_res.status_code != 200:
        print('Error requesting assets by catalog - status_code - ' + str(assets_res.status_code))
        try:
            print(assets_res.json())
        except Exception:
            print(assets_res.text)
        return []
    return json.loads(assets_res.text)


def get_spaces_list():
    spaces = []
    cacheconfig = k8s.get_config_map(namespace=namespace, name=configmap_name)
    spaces_fetch_interval = float(cacheconfig[spaces_refresh_interval_key])
    last_fetch_timestamp = float(cacheconfig[spaces_last_refresh_key])
    if need_to_fetch(spaces_fetch_interval, last_fetch_timestamp) or not os.path.exists(spaces_cache_file):
        spaces_data = cpdctl.cpctl_get_spaces()['resources']
        if len(spaces_data) > 0:
            spaces = spaces_data
        with open(spaces_cache_file, 'w') as f:
            f.write(json.dumps(spaces))
        cacheconfig[spaces_last_refresh_key] = str(get_current_timestamp())
        k8s.set_config_map(namespace=namespace, name=configmap_name, data=cacheconfig)
        return spaces

    with open(spaces_cache_file, 'r') as f:
        spaces = json.loads(f.read())
    return spaces


def get_deployments(space_id):
    bearer_token = get_admin_token()
    headers = {'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': str(bearer_token)}
    url = cp4d_host + f'/ml/v4/deployments?space_id={space_id}&version=2020-09-01'
    res = requests.get(url, headers=headers, verify=False)
    if res.status_code != 200:
        print('Error requesting get deployment - status_code - ' + str(res.status_code))
        try:
            print(res.json())
        except Exception:
            print(res.text)
        return []

    results = json.loads(res.text)
    return results
