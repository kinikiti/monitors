# cp4d-monitors
Additional monitors for IBM Cloud Pak for Data 3.5.X These monitors focus more on the functional usage of IBM Cloud Pak for Data and can be used to provide more insights 
into how the Cloud Pak for Data platform is used by its business users.

Monitors forked from  [original IBM monitors](https://ibm.github.io/cp4d-monitors/) and adapted to CP4D v3.5.X

## Architecture
Overall ideology based on [OpenShift user-defined projects monitoring](https://docs.openshift.com/container-platform/4.7/monitoring/monitoring-overview.html):
![Architecture](download.svg)

CP4D monitored by python code running periodically. Data gathering is quite slow and depend on the amount of content in CP4D. Because of that metrics are delivered via [Prometheus pushgateway](https://github.com/prometheus/pushgateway). Python code collect data as an `admin` user via [`cpdctl`](https://github.com/IBM/cpdctl) tool.  
All monitors are in the same namespace as a CP4D instance and monitor only one CP4D within same namespace.
## Prerequesites
OpenShift at least v4.6.X  
Cloud pak for data at least v3.5.9  
Internal or external OpenShuft registry with credentials stored in the secret.
## Metrics
All metrics are documented via Prometheus native capabilities.  
Available metrics are:
1. Overall amount of jobs configured on the platform.
      ```
      # HELP jobs_count_total Jobs at the platform
      # TYPE jobs_count_total counter
      jobs_count_total{instance="",job="CP4D",jobsCount="jobsCount"} 14
      ```
2. Overall amoubnt of jobs that currently active (running)
      ```
      # HELP active_jobs_count_total Active jobs at the platform
      # TYPE active_jobs_count_total counter
      active_jobs_count_total{activeJobsCount="activeJobsCount",instance="",job="CP4D"} 0
      ```
3. Overall amount of platform connections
      ```
      # HELP connections_count_total Platform connection counts
      # TYPE connections_count_total counter
      connections_count_total{connectionCount="connectionCount",instance="",job="CP4D"} 60
      ```
4. Overall amount of active environments for all projects
      ```
      # HELP project_total_runtimes_total Total Project runtimes
      # TYPE project_total_runtimes_total counter
      project_total_runtimes_total{instance="",job="CP4D",projectTotalRuntimes="projectTotalRuntimes"} 0
      ```
5. Memory requests, limits and actual consumption for all active environments
      ```
      # HELP project_total_CPU_requests_total Total Project CPU requests
      # TYPE project_total_CPU_requests_total counter
      project_total_CPU_requests_total{instance="",job="CP4D",projectTotalCPURequests="projectTotalCPURequests"} 0
      # HELP project_total_cpu_limits_total Total Project CPU limits
      # TYPE project_total_cpu_limits_total counter
      project_total_cpu_limits_total{instance="",job="CP4D",projectTotalCPULimits="projectTotalCPULimits"} 0
      # HELP project_total_cpu_usage_total Total Project CPU usage
      # TYPE project_total_cpu_usage_total counter
      project_total_cpu_usage_total{instance="",job="CP4D",projectTotalCPUUsage="projectTotalCPUUsage"} 0
      ```
7. CPU requests, limits and actual consumption for all active environments
      ```
      # HELP project_total_memory_requests_total Total Project memory requests
      # TYPE project_total_memory_requests_total counter
      project_total_memory_requests_total{instance="",job="CP4D",projectTotalMemoryRequests="projectTotalMemoryRequests"} 0
      # HELP project_total_memory_limits_total Total Project Memory limits
      # TYPE project_total_memory_limits_total counter
      project_total_memory_limits_total{instance="",job="CP4D",projectTotalMemoryLimits="projectTotalMemoryLimits"} 0
      # HELP project_total_memory_usage_total Total Project memory usage
      # TYPE project_total_memory_usage_total counter
      project_total_memory_usage_total{instance="",job="CP4D",projectTotalMemoryUsage="projectTotalMemoryUsage"} 0
      ```
__*NB*__ All data collected only for resources available for `admin` user.
## Build
To build monitor image run the following:
```shell
oc new-build https://github.com/kinikiti/monitors \
--context-dir exporter \
--name exporter \
--to <REGISTRY>exporter:latest \
--to-docker=true \
--push-secret='<SECRET>' \
--namespace cpd
```
replace `<SECRET>` by secret name like `docker-pull-cpd--registry` and `<REGISTRY>` with registry URI like `registryhost01.mgmt:5000/cpd/`

This should generate build and buildconfigs, create an image and push this image to registry.
```
# oc get build
NAME         TYPE     FROM          STATUS     STARTED       DURATION
exporter-1   Docker   Git@100f098   Complete   5 weeks ago   1m47s
# oc get buildconfig
NAME       TYPE     FROM   LATEST
exporter   Docker   Git    1
```
## Deploy
Clone the project.  
Monitors require at least empty config map named `monitoring-config`. This is an artefact from CP4D 4.0.X. Deploy this config map:  
```
oc create -f YAML/css-cm.yaml
```
Verify:
```
# oc get cm monitoring-config
NAME                DATA   AGE
monitoring-config   0      62d
```
Edit environment variables for metric exporter: in the `YAML/exporter.yaml`:
```yaml
      - env:
        - name: ICPD_CONTROLPLANE_NAMESPACE
          value: cpd
        - name: ICPD_SCRAPE_INTERVAL
          value: "30"
        image: <REGISTRY>/exporter:latest
```
Change `<REGISTRY>` to your registry host. Verify that `ICPD_CONTROLPLANE_NAMESPACE` points to your CP4D namespace (`cpd` by default). Adjust scrape interval changing `ICPD_SCRAPE_INTERVAL` (30 seconds by default)
Deploy metric exporter:
```
oc create -f YAML/exporter.yaml
```
Verify:
```
# oc get all -l app=cpd-exporter
NAME                   READY   STATUS    RESTARTS   AGE
pod/exporter-1-5rxf4   1/1     Running   262        32d

NAME                               DESIRED   CURRENT   READY   AGE
replicationcontroller/exporter-1   1         1         1       42d
```
Edit pushgateway config file `YAML/pushgateway.yaml` and replace `<PULL SECRET NAME>` by your pull-secret name.  
Deploy Prometheus push gateway:
```
oc create -f YAML/pushgateway.yaml
```
Verify:
```
# oc get all -l app=pushgateway
NAME                                          READY   STATUS    RESTARTS   AGE
pod/pushgateway-deployment-646bf7b857-2chhp   1/1     Running   0          32d

NAME                                     READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/pushgateway-deployment   1/1     1            1           41d

NAME                                                DESIRED   CURRENT   READY   AGE
replicaset.apps/pushgateway-deployment-646bf7b857   1         1         1       41d
```
Deploy servicemonitor:
```
oc create -f YAML/servicemonitor.yaml
```
Verify:
```
# oc get ServiceMonitor
NAME           AGE
cpd-exporter   41d
```
At that point all components are deployed and metrics shold arrive in OpenShuft Prometheus within few minutes.
## Verification
Setup environment variables. `NAMESPACE` variable must point to your CP4D namespace.
```
NAMESPACE=cpd
SECRET=`oc get secret -n openshift-user-workload-monitoring | grep  prometheus-user-workload-token | head -n 1 | awk '{print $1 }'`
TOKEN=`echo $(oc get secret $SECRET -n openshift-user-workload-monitoring -o json | jq -r '.data.token') | base64 -d`
THANOS_QUERIER_HOST=`oc get route thanos-querier -n openshift-monitoring -o json | jq -r '.spec.host'`
```
Check if the instance is up:
```
# curl -X GET -kG "https://$THANOS_QUERIER_HOST/api/v1/query?" --data-urlencode "query=up{namespace='$NAMESPACE'}" -H "Authorization: Bearer $TOKEN"
{"status":"success","data":{"resultType":"vector","result":[{"metric":{"__name__":"up","container":"exporter","endpoint":"prometheus","instance":"10.131.0.11:9000","job":"cpd-exporter-service","namespace":"cpd","pod":"exporter-1-5rxf4","prometheus":"openshift-user-workload-monitoring/user-workload","service":"cpd-exporter-service"},"value":[1661943345.56,"0"]}]}}
```
Check basib default python monitoring:
```
# curl -X GET -kG "https://$THANOS_QUERIER_HOST/api/v1/query?" --data-urlencode "query=python_info" -H "Authorization: Bearer $TOKEN"
{"status":"success","data":{"resultType":"vector","result":[{"metric":{"__name__":"python_info","container":"pushgateway","endpoint":"pushgateway","exported_job":"CP4D","implementation":"CPython","instance":"10.128.5.34:9091","job":"pushgateway-service","major":"3","minor":"8","namespace":"cpd","patchlevel":"12","pod":"pushgateway-deployment-5958b8f8c7-tlfrj","prometheus":"openshift-user-workload-monitoring/user-workload","service":"pushgateway-service","version":"3.8.12"},"value":[1661943638.949,"1"]}]}}
```
Test one of the CP4D specific metrics:
```
# curl -X GET -kG "https://$THANOS_QUERIER_HOST/api/v1/query?" --data-urlencode "query=jobs_count_total" -H "Authorization: Bearer $TOKEN"
{"status":"success","data":{"resultType":"vector","result":[{"metric":{"__name__":"jobs_count_total","container":"pushgateway","endpoint":"pushgateway","exported_job":"CP4D","instance":"10.128.5.34:9091","job":"pushgateway-service","jobsCount":"jobsCount","namespace":"cpd","pod":"pushgateway-deployment-5958b8f8c7-tlfrj","prometheus":"openshift-user-workload-monitoring/user-workload","service":"pushgateway-service"},"value":[1661945771.62,"14"]}]}}
```
Pay attention, that if you don't have jobs or projects are not running reply will be empty:
```
# curl -X GET -kG "https://$THANOS_QUERIER_HOST/api/v1/query?" --data-urlencode "query=project_total_runtimes_metric" -H "Authorization: Bearer $TOKEN"
{"status":"success","data":{"resultType":"vector","result":[]}}
```
This may be normal.
## Debugging
Check if exporter pod is up and running:
```
# oc get po -l app=cpd-exporter
NAME               READY   STATUS    RESTARTS   AGE
exporter-1-wvs4b   1/1     Running   4714       41d
```
Check pod logs:
```
# oc logs -f `oc get --no-headers=true po -l app=cpd-exporter | awk '{print $1}'`
Starting Prometheus exporter
-------------------------------------------------------------
Found Cloud Pak for Data Platform Assets Catalog Id: 5f62d9a9-84c0-49a2-b648-8c21a2ad9d1e
Metric collection started at 11:31:47
Metric collection ended at 11:31:56
Found Cloud Pak for Data Platform Assets Catalog Id: 5f62d9a9-84c0-49a2-b648-8c21a2ad9d1e
Metric collection started at 11:32:08
Metric collection ended at 11:32:20
Found Cloud Pak for Data Platform Assets Catalog Id: 5f62d9a9-84c0-49a2-b648-8c21a2ad9d1e
Metric collection started at 11:32:33
Metric collection ended at 11:32:41
Found Cloud Pak for Data Platform Assets Catalog Id: 5f62d9a9-84c0-49a2-b648-8c21a2ad9d1e
Metric collection started at 11:32:53
Metric collection ended at 11:33:01
```
Check Prometheus service:
```
# oc get svc -l app=cpd-exporter
NAME                  TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
pushgateway-service   ClusterIP   172.30.249.127   <none>        9091/TCP   41d
```
Login to IBM CP4D Nginx pod and curl prometheus:
```
# oc exec -it `oc get --no-headers=true po -l component=ibm-nginx | awk '{print $1}' | head -n 1` -- /bin/bash
bash-4.4$ /usr/bin/curl pushgateway-service:9091/metrics
# HELP active_jobs_count_total Active jobs at the platform
# TYPE active_jobs_count_total counter
active_jobs_count_total{activeJobsCount="activeJobsCount",instance="",job="CP4D"} 0
# HELP connections_count_total Platform connection counts
# TYPE connections_count_total counter
connections_count_total{connectionCount="connectionCount",instance="",job="CP4D"} 60
# HELP go_gc_duration_seconds A summary of the pause duration of garbage collection cycles.
# TYPE go_gc_duration_seconds summary
go_gc_duration_seconds{quantile="0"} 7.6596e-05
go_gc_duration_seconds{quantile="0.25"} 0.000238107
go_gc_duration_seconds{quantile="0.5"} 0.000381318
go_gc_duration_seconds{quantile="0.75"} 0.001105985
go_gc_duration_seconds{quantile="1"} 0.011963026
go_gc_duration_seconds_sum 30.781556774
go_gc_duration_seconds_count 30735
# HELP go_goroutines Number of goroutines that currently exist.
# TYPE go_goroutines gauge
go_goroutines 12
# HELP go_info Information about the Go environment.
# TYPE go_info gauge
go_info{version="go1.18.2"} 1
# HELP go_memstats_alloc_bytes Number of bytes allocated and still in use.
# TYPE go_memstats_alloc_bytes gauge
go_memstats_alloc_bytes 1.2604376e+07
# HELP go_memstats_alloc_bytes_total Total number of bytes allocated, even if freed.
# TYPE go_memstats_alloc_bytes_total counter
go_memstats_alloc_bytes_total 1.29428612944e+11
# HELP go_memstats_buck_hash_sys_bytes Number of bytes used by the profiling bucket hash table.
# TYPE go_memstats_buck_hash_sys_bytes gauge
go_memstats_buck_hash_sys_bytes 1.625976e+06
# HELP go_memstats_frees_total Total number of frees.
# TYPE go_memstats_frees_total counter
go_memstats_frees_total 6.14191502e+08
# HELP go_memstats_gc_sys_bytes Number of bytes used for garbage collection system metadata.
# TYPE go_memstats_gc_sys_bytes gauge
go_memstats_gc_sys_bytes 5.35132e+06
# HELP go_memstats_heap_alloc_bytes Number of heap bytes allocated and still in use.
# TYPE go_memstats_heap_alloc_bytes gauge
go_memstats_heap_alloc_bytes 1.2604376e+07
# HELP go_memstats_heap_idle_bytes Number of heap bytes waiting to be used.
# TYPE go_memstats_heap_idle_bytes gauge
go_memstats_heap_idle_bytes 9.732096e+06
# HELP go_memstats_heap_inuse_bytes Number of heap bytes that are in use.
# TYPE go_memstats_heap_inuse_bytes gauge
go_memstats_heap_inuse_bytes 1.359872e+07
# HELP go_memstats_heap_objects Number of allocated objects.
# TYPE go_memstats_heap_objects gauge
go_memstats_heap_objects 36663
# HELP go_memstats_heap_released_bytes Number of heap bytes released to OS.
# TYPE go_memstats_heap_released_bytes gauge
go_memstats_heap_released_bytes 8.593408e+06
# HELP go_memstats_heap_sys_bytes Number of heap bytes obtained from system.
# TYPE go_memstats_heap_sys_bytes gauge
go_memstats_heap_sys_bytes 2.3330816e+07
# HELP go_memstats_last_gc_time_seconds Number of seconds since 1970 of last garbage collection.
# TYPE go_memstats_last_gc_time_seconds gauge
go_memstats_last_gc_time_seconds 1.6619463173407528e+09
# HELP go_memstats_lookups_total Total number of pointer lookups.
# TYPE go_memstats_lookups_total counter
go_memstats_lookups_total 0
# HELP go_memstats_mallocs_total Total number of mallocs.
# TYPE go_memstats_mallocs_total counter
go_memstats_mallocs_total 6.14228165e+08
# HELP go_memstats_mcache_inuse_bytes Number of bytes in use by mcache structures.
# TYPE go_memstats_mcache_inuse_bytes gauge
go_memstats_mcache_inuse_bytes 19200
# HELP go_memstats_mcache_sys_bytes Number of bytes used for mcache structures obtained from system.
# TYPE go_memstats_mcache_sys_bytes gauge
go_memstats_mcache_sys_bytes 31200
# HELP go_memstats_mspan_inuse_bytes Number of bytes in use by mspan structures.
# TYPE go_memstats_mspan_inuse_bytes gauge
go_memstats_mspan_inuse_bytes 212704
# HELP go_memstats_mspan_sys_bytes Number of bytes used for mspan structures obtained from system.
# TYPE go_memstats_mspan_sys_bytes gauge
go_memstats_mspan_sys_bytes 277440
# HELP go_memstats_next_gc_bytes Number of heap bytes when next garbage collection will take place.
# TYPE go_memstats_next_gc_bytes gauge
go_memstats_next_gc_bytes 1.4141728e+07
# HELP go_memstats_other_sys_bytes Number of bytes used for other system allocations.
# TYPE go_memstats_other_sys_bytes gauge
go_memstats_other_sys_bytes 2.758488e+06
# HELP go_memstats_stack_inuse_bytes Number of bytes in use by the stack allocator.
# TYPE go_memstats_stack_inuse_bytes gauge
go_memstats_stack_inuse_bytes 1.835008e+06
# HELP go_memstats_stack_sys_bytes Number of bytes obtained from system for stack allocator.
# TYPE go_memstats_stack_sys_bytes gauge
go_memstats_stack_sys_bytes 1.835008e+06
# HELP go_memstats_sys_bytes Number of bytes obtained from system.
# TYPE go_memstats_sys_bytes gauge
go_memstats_sys_bytes 3.5210248e+07
# HELP go_threads Number of OS threads created.
# TYPE go_threads gauge
go_threads 22
# HELP jobs_count_total Jobs at the platform
# TYPE jobs_count_total counter
jobs_count_total{instance="",job="CP4D",jobsCount="jobsCount"} 14
# HELP process_cpu_seconds_total Total user and system CPU time spent in seconds.
# TYPE process_cpu_seconds_total counter
process_cpu_seconds_total 2280.29
process_cpu_seconds_total{instance="",job="CP4D"} 41.300000000000004
# HELP process_max_fds Maximum number of open file descriptors.
# TYPE process_max_fds gauge
process_max_fds 66560
process_max_fds{instance="",job="CP4D"} 66560
# HELP process_open_fds Number of open file descriptors.
# TYPE process_open_fds gauge
process_open_fds 11
process_open_fds{instance="",job="CP4D"} 7
# HELP process_resident_memory_bytes Resident memory size in bytes.
# TYPE process_resident_memory_bytes gauge
process_resident_memory_bytes 3.315712e+07
process_resident_memory_bytes{instance="",job="CP4D"} 5.853184e+07
# HELP process_start_time_seconds Start time of the process since unix epoch in seconds.
# TYPE process_start_time_seconds gauge
process_start_time_seconds 1.65832042324e+09
process_start_time_seconds{instance="",job="CP4D"} 1.6619454989e+09
# HELP process_virtual_memory_bytes Virtual memory size in bytes.
# TYPE process_virtual_memory_bytes gauge
process_virtual_memory_bytes 7.3711616e+08
process_virtual_memory_bytes{instance="",job="CP4D"} 1.59428608e+08
# HELP process_virtual_memory_max_bytes Maximum amount of virtual memory available in bytes.
# TYPE process_virtual_memory_max_bytes gauge
process_virtual_memory_max_bytes 1.8446744073709552e+19
# HELP project_total_CPU_requests_total Total Project CPU requests
# TYPE project_total_CPU_requests_total counter
project_total_CPU_requests_total{instance="",job="CP4D",projectTotalCPURequests="projectTotalCPURequests"} 0
# HELP project_total_cpu_limits_total Total Project CPU limits
# TYPE project_total_cpu_limits_total counter
project_total_cpu_limits_total{instance="",job="CP4D",projectTotalCPULimits="projectTotalCPULimits"} 0
# HELP project_total_cpu_usage_total Total Project CPU usage
# TYPE project_total_cpu_usage_total counter
project_total_cpu_usage_total{instance="",job="CP4D",projectTotalCPUUsage="projectTotalCPUUsage"} 0
# HELP project_total_memory_limits_total Total Project Memory limits
# TYPE project_total_memory_limits_total counter
project_total_memory_limits_total{instance="",job="CP4D",projectTotalMemoryLimits="projectTotalMemoryLimits"} 0
# HELP project_total_memory_requests_total Total Project memory requests
# TYPE project_total_memory_requests_total counter
project_total_memory_requests_total{instance="",job="CP4D",projectTotalMemoryRequests="projectTotalMemoryRequests"} 0
# HELP project_total_memory_usage_total Total Project memory usage
# TYPE project_total_memory_usage_total counter
project_total_memory_usage_total{instance="",job="CP4D",projectTotalMemoryUsage="projectTotalMemoryUsage"} 0
# HELP project_total_runtimes_total Total Project runtimes
# TYPE project_total_runtimes_total counter
project_total_runtimes_total{instance="",job="CP4D",projectTotalRuntimes="projectTotalRuntimes"} 0
# HELP push_failure_time_seconds Last Unix time when changing this group in the Pushgateway failed.
# TYPE push_failure_time_seconds gauge
push_failure_time_seconds{instance="",job="CP4D"} 0
# HELP push_time_seconds Last Unix time when changing this group in the Pushgateway succeeded.
# TYPE push_time_seconds gauge
push_time_seconds{instance="",job="CP4D"} 1.661946400396461e+09
# HELP pushgateway_build_info A metric with a constant '1' value labeled by version, revision, branch, and goversion from which pushgateway was built.
# TYPE pushgateway_build_info gauge
pushgateway_build_info{branch="HEAD",goversion="go1.18.2",revision="f9dc1c8664050edbc75916c3664be1df595a1958",version="1.4.3"} 1
# HELP pushgateway_http_push_duration_seconds HTTP request duration for pushes to the Pushgateway.
# TYPE pushgateway_http_push_duration_seconds summary
pushgateway_http_push_duration_seconds{method="put",quantile="0.1"} 0.001110382
pushgateway_http_push_duration_seconds{method="put",quantile="0.5"} 0.002077021
pushgateway_http_push_duration_seconds{method="put",quantile="0.9"} 0.003613023
pushgateway_http_push_duration_seconds_sum{method="put"} 384.20200830599714
pushgateway_http_push_duration_seconds_count{method="put"} 143126
# HELP pushgateway_http_push_size_bytes HTTP request size for pushes to the Pushgateway.
# TYPE pushgateway_http_push_size_bytes summary
pushgateway_http_push_size_bytes{method="put",quantile="0.1"} 3914
pushgateway_http_push_size_bytes{method="put",quantile="0.5"} 3914
pushgateway_http_push_size_bytes{method="put",quantile="0.9"} 3927
pushgateway_http_push_size_bytes_sum{method="put"} 5.60744884e+08
pushgateway_http_push_size_bytes_count{method="put"} 143126
# HELP pushgateway_http_requests_total Total HTTP requests processed by the Pushgateway, excluding scrapes.
# TYPE pushgateway_http_requests_total counter
pushgateway_http_requests_total{code="200",handler="push",method="put"} 143126
# HELP python_gc_collections_total Number of times this generation was collected
# TYPE python_gc_collections_total counter
python_gc_collections_total{generation="0",instance="",job="CP4D"} 305
python_gc_collections_total{generation="1",instance="",job="CP4D"} 27
python_gc_collections_total{generation="2",instance="",job="CP4D"} 2
# HELP python_gc_objects_collected_total Objects collected during gc
# TYPE python_gc_objects_collected_total counter
python_gc_objects_collected_total{generation="0",instance="",job="CP4D"} 1986
python_gc_objects_collected_total{generation="1",instance="",job="CP4D"} 43
python_gc_objects_collected_total{generation="2",instance="",job="CP4D"} 0
# HELP python_gc_objects_uncollectable_total Uncollectable object found during GC
# TYPE python_gc_objects_uncollectable_total counter
python_gc_objects_uncollectable_total{generation="0",instance="",job="CP4D"} 0
python_gc_objects_uncollectable_total{generation="1",instance="",job="CP4D"} 0
python_gc_objects_uncollectable_total{generation="2",instance="",job="CP4D"} 0
# HELP python_info Python platform information
# TYPE python_info gauge
python_info{implementation="CPython",instance="",job="CP4D",major="3",minor="8",patchlevel="12",version="3.8.12"} 1
bash-4.4$
```
## Dashboards
