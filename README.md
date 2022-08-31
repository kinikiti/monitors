# cp4d-monitors
Additional monitors for IBM Cloud Pak for Data 3.5.X These monitors focus more on the functional usage of IBM Cloud Pak for Data and can be used to provide more insights 
into how the Cloud Pak for Data platform is used by its business users.

Monitors forked from  [original IBM monitors](https://ibm.github.io/cp4d-monitors/) and adapted to CP4D v3.5.X

## Architecture
Overall ideology based on [OpenShift user-defined projects monitoring](https://docs.openshift.com/container-platform/4.7/monitoring/monitoring-overview.html):
![Architecture](download.svg)

CP4D monitored by butch jobs running periodically. Because of that metrics are delivered via [Prometheus pushgateway](https://github.com/prometheus/pushgateway).
## Prerequesites
OpenShift at least v4.6.X\\
Cloud pak for data at least v3.5.9\\
Internal or external OpenShuft registry with credentials stored in the secret.\\
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
## Dashboards
