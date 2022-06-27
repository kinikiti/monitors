"use strict";(self.webpackChunkcloud_pak_deployer_monitors=self.webpackChunkcloud_pak_deployer_monitors||[]).push([[1014],{9147:function(e,o,n){n.r(o),n.d(o,{_frontmatter:function(){return l},default:function(){return c}});var t=n(3366),s=(n(7294),n(4983)),a=n(7160),r=["components"],l={},i={_frontmatter:l},d=a.Z;function c(e){var o=e.components,n=(0,t.Z)(e,r);return(0,s.kt)(d,Object.assign({},i,n,{components:o,mdxType:"MDXLayout"}),(0,s.kt)("p",null,"This page will go through all manual steps to deploy the Watson Studio Job Information monitor, and in addition to delete it. "),(0,s.kt)("p",null,"The following pre-requisites are assumed:"),(0,s.kt)("ul",null,(0,s.kt)("li",{parentName:"ul"},"IBM Cloud Pak for Data is successfully deployed"),(0,s.kt)("li",{parentName:"ul"},"(Optional) Prometheus is configured. Refer to ",(0,s.kt)("a",{parentName:"li",href:"/cp4d-monitors/prometheus/"},"setup OpenShift Prometheus and Cloud Pak for Data ServiceMonitor")," for instructions")),(0,s.kt)("p",null,"This manual deployment will be based on:"),(0,s.kt)("ul",null,(0,s.kt)("li",{parentName:"ul"},"Source of the Monitor is located in a Git Repository"),(0,s.kt)("li",{parentName:"ul"},"The Image will be pushed to the internal OpenShift Image Registry ")),(0,s.kt)("h2",null,"Deploy Watson Studio Job Schedule Information"),(0,s.kt)("h3",null,"Build the Monitor Image and push to the registry"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre"},"export CP4D_PROJECT=<CP4D_PROJECT>\nexport OPENSHIFT_IMAGE_REGISTRY=image-registry.openshift-image-registry.svc:5000/${CP4D_PROJECT}\n\noc new-build https://github.com/IBM/cp4d-monitors \\\n --context-dir cp4d-watsonstudio-job-schedule-info  \\\n --name cp4d-platform-watsonstudio-job-schedule-info \\\n --to ${OPENSHIFT_IMAGE_REGISTRY}/cp4d-platform-watsonstudio-job-schedule-info:latest \\\n --to-docker=true \\\n --namespace ${CP4D_PROJECT}\n")),(0,s.kt)("p",null,"Wait for the build to complete successfully"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre"},"export CP4D_PROJECT=<CP4D_PROJECT>\noc wait -n ${CP4D_PROJECT} --for=condition=Complete build/cp4d-platform-watsonstudio-job-schedule-info-1  --timeout=300s\n")),(0,s.kt)("p",null,"or to monitor the build process:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre"},"export CP4D_PROJECT=<CP4D_PROJECT>\noc logs -n ${CP4D_PROJECT} build/cp4d-platform-watsonstudio-job-schedule-info-1 -f\n")),(0,s.kt)("p",null,"Ensure the build finishes with the message ",(0,s.kt)("inlineCode",{parentName:"p"},"Push successful")),(0,s.kt)("h3",null,"Create the Cloud Pak for Data zen-watchdog monitor configuration"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre"},'export CP4D_PROJECT=<CP4D_PROJECT>\nexport OPENSHIFT_IMAGE_REGISTRY=image-registry.openshift-image-registry.svc:5000/${CP4D_PROJECT}\n\ncat << EOF | oc apply -f -\nkind: ConfigMap\napiVersion: v1\nmetadata:\n  name: zen-alert-cp4d-platform-watsonstudio-schedule-job-info-monitor-extension\n  namespace: ${CP4D_PROJECT}\n  labels:\n    app: zen-adv\n    icpdata_addon: \'true\'\n    icpdata_addon_version: 4.3.0\n    release: zen-adv\ndata:\n  extensions: |\n    [\n      {\n        "extension_point_id": "zen_alert_monitor",\n        "extension_name": "zen_alert_monitor_cp4d-platform-watsonstudio-schedule-job-info",\n        "display_name": "Watson Studio Job Schedule Info Monitor",\n        "details": {\n          "name": "cp4d-platform-watsonstudio-job-schedule-info",\n          "image": "${OPENSHIFT_IMAGE_REGISTRY}/cp4d-platform-watsonstudio-job-schedule-info:latest",\n          "schedule": "*/15 * * * *",\n          "event_types": [\n            {\n              "name": "cp4d_watsonstudio_jobs_schedule_overall_count",\n              "simple_name": "Watson Stuido Jobs Schedule Overall Count",\n              "alert_type": "platform",\n              "short_description": "CP4D Platform Watson Stuido Jobs Schedule Overall Count",\n              "long_description": "CP4D Platform Watson Stuido Jobs Schedule Overall Count: <cp4d_watsonstudio_jobs_schedule_overall_count>",                \n              "resolution": "none",\n              "reason_code_prefix": "80"\n            },              \n            {\n              "name": "cp4d_watsonstudio_jobs_schedule_project_count",\n              "simple_name": "Watson Studio Jobs Schedule Project Count",\n              "alert_type": "platform",\n              "short_description": "CP4D Platform Watson Studio Jobs Schedule Project Count",\n              "long_description": "CP4D Platform Watson Studio Jobs Schedule Project Count: <cp4d_watsonstudio_jobs_schedule_project_count>",                \n              "resolution": "none",\n              "reason_code_prefix": "80"\n            },\n            {\n              "name": "cp4d_watsonstudio_jobs_schedule_user_overall_count",\n              "simple_name": "Watson Studio Jobs Schedule User Overall Count",\n              "alert_type": "platform",\n              "short_description": "CP4D Watson Studio Jobs Schedule User Overall Count",\n              "long_description": "CP4D Watson Studio Jobs Schedule User Overall Count: <cp4d_watsonstudio_jobs_schedule_user_overall_count>",\n              "resolution": "none",\n              "reason_code_prefix": "80"\n            },\n            {\n              "name": "cp4d_watsonstudio_jobs_schedule_user_notebook_count",\n              "simple_name": "Watson Studio Jobs Schedule User Notebook Count",\n              "alert_type": "platform",\n              "short_description": "CP4D Watson Studio Jobs Schedule User Notebook Count",\n              "long_description": "CP4D Watson Studio Jobs Schedule User Notebook Count: <cp4d_watsonstudio_jobs_schedule_user_notebook_count>",                \n              "resolution": "none",\n              "reason_code_prefix": "80"\n            },\n            {\n              "name": "cp4d_watsonstudio_jobs_schedule_user_datastage_count",\n              "simple_name": "Watson Studio Jobs Schedule User Datastage Count",\n              "alert_type": "platform",\n              "short_description": "CP4D Watson Studio Job Schedule User Datastage Count",\n              "long_description": "CP4D Watson Studio Job Last Status: <cp4d_watsonstudio_jobs_schedule_user_datastage_count>",                \n              "resolution": "none",\n              "reason_code_prefix": "80"\n            },\n            {\n              "name": "cp4d_watsonstudio_job_schedule_last_run_fail",\n              "simple_name": "Watson Studio Job Scheudle Last Run Fail",\n              "alert_type": "platform",\n              "short_description": "CP4D Watson Studio Job Schedule Last Run Fail",\n              "long_description": "CP4D Watson Studio Job Schedule Last Run Fail: <cp4d_watsonstudio_job_schedule_last_run_fail>",                \n              "resolution": "none",\n              "reason_code_prefix": "80"\n            },\n            {\n              "name": "cp4d_watsonstudio_job_schedule_next_run_epoch_time",\n              "simple_name": "Watson Studio Job Schedule Next Run Epoch Time",\n              "alert_type": "platform",\n              "short_description": "CP4D Watson Studio Job Last Status",\n              "long_description": "CP4D Watson Studio Job Last Status: <cp4d_watsonstudio_jobs_schedule_next_run_epoch_time>",                \n              "resolution": "none",\n              "reason_code_prefix": "80"\n            },\n            {\n              "name": "cp4d_watsonstudio_job_schedule_last_run_duration_seconds",\n              "simple_name": "Watson Studio Job Schedule Last Run Duration Seconds",\n              "alert_type": "platform",\n              "short_description": "Watson Studio Job Schedule Last Run Duration Seconds",\n              "long_description": "Watson Studio Job Schedule Last Run Duration Seconds: <cp4d_watsonstudio_job_schedule_last_run_duration_seconds>",                \n              "resolution": "none",\n              "reason_code_prefix": "80"\n            },\n            {\n              "name": "cp4d_watsonstudio_job_schedule_last_run_epoch_time",\n              "simple_name": "Watson Studio Job Schedule Last Run Epoch Time",\n              "alert_type": "platform",\n              "short_description": "CP4D Watson Studio Job Schedule Last Run Epoch Time",\n              "long_description": "CP4D Watson Studio Job Schedule Last Run Epoch Time: <cp4d_watsonstudio_job_schedule_last_run_epoch_time>",                \n              "resolution": "none",\n              "reason_code_prefix": "80"\n            }\n          ]\n        }\n      }\n    ]\nEOF\n')),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Note:")," Once the ConfigMap above is created, the zen-watcher pod will detect it. Please check the log of zen-watcher pod for details. For example:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre"},'\nexport CP4D_PROJECT=<CP4D_PROJECT>\nexport ZEN_WATCHER_POD=$(oc get po -l component=zen-watcher -o custom-columns=CONTAINER:.metadata.name --no-headers)\noc logs ${ZEN_WATCHER_POD}\n\ntime="2022-05-23 08:48:16" level=info msg=processConfigData event="adding extensions from zen-alert-cp4d-platform-watsonstudio-schedule-job-info-monitor-extension to the database"\ntime="2022-05-23 08:48:16" level=info msg=CleanUpStaleExtensions event="upgrade extensions: removing stale extensions from zen-alert-cp4d-platform-watsonstudio-schedule-job-info-monitor-extension to the database"\ntime="2022-05-23 08:48:16" level=info msg=processExtensionHandler event="processing action: update for extension" extension_name=zen_alert_monitor_cp4d-platform-watsonstudio-schedule-job-info\ntime="2022-05-23 08:48:16" level=info msg=watchConfigMap event="config zen-alert-cp4d-platform-watsonstudio-schedule-job-info-monitor-extension added"\n')),(0,s.kt)("h3",null,"Wait for zen-watchdog to create cronjob"),(0,s.kt)("p",null,"Get the watchdog-alert-monitoring-cronjob cronjob details of Cloud Pak for Data"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre"},"export CP4D_PROJECT=<CP4D_PROJECT>\n\noc get cronjob watchdog-alert-monitoring-cronjob -n ${CP4D_PROJECT}\n\nNAME                                SCHEDULE       SUSPEND   ACTIVE   LAST SCHEDULE   AGE\nwatchdog-alert-monitoring-cronjob   */10 * * * *   False     0        3m46s           7d3h\n")),(0,s.kt)("p",null,"This cronjob must run in order for the Watson Studio Job cronjob to be created. Optionally the schedule can be changed to trigger its execution. The pod zen-watchdog can be monitored for any error messages:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre"},"\nexport CP4D_PROJECT=<CP4D_PROJECT>\nexport ZEN_WATCHDOG_POD=$(oc get po -n ${CP4D_PROJECT} -l component=zen-watchdog -o custom-columns=CONTAINER:.metadata.name --no-headers)\n\noc logs -n ${CP4D_PROJECT} ${ZEN_WATCHDOG_POD} -f\n")),(0,s.kt)("p",null,"The new monitor cronjob is created:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre"},"export CP4D_PROJECT=<CP4D_PROJECT>\noc get cronjob -n ${CP4D_PROJECT}\n\nNAME                                                   SCHEDULE       SUSPEND   ACTIVE   LAST SCHEDULE   AGE\ncp4d-platform-watsonstudio-job-schedule-info-cronjob   */15 * * * *   False     0        <none>          52s\n")),(0,s.kt)("p",null,"Most monitors require access to the Cloud Pak for Data /user-home folder to cache information. To test whether this mount point is already present on the monitor use the following command:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre"},'export CP4D_PROJECT=<CP4D_PROJECT>\nexport CP4D_CRONJOB=cp4d-platform-watsonstudio-job-schedule-info-cronjob\noc set volume -n ${CP4D_PROJECT} cronjobs/${CP4D_CRONJOB} | grep "mounted at /user-home" | wc -l\n')),(0,s.kt)("p",null,"If the result is ",(0,s.kt)("inlineCode",{parentName:"p"},"0"),", patch the cronjob using the following command:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre"},'oc patch cronjob -n ${CP4D_PROJECT} ${CP4D_CRONJOB} \\\n--type=json \\\n--patch \'[{"op": "add","path": "/spec/jobTemplate/spec/template/spec/containers/0/volumeMounts/-","value": {"name": "user-home-mount","mountPath": "/user-home"}}]\'\n')),(0,s.kt)("p",null,"Based on the schedule the cronjob will be executed. This will create a pod, which can be monitored:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre"},"export CP4D_PROJECT=<CP4D_PROJECT>\noc logs -n ${CP4D_PROJECT} <PODNAME>\n")),(0,s.kt)("h2",null,"Rebuilding the image"),(0,s.kt)("p",null,"When changes are applied to the monitor, restarting the Build Config will re-build and push the image to the image registry. No other changed are required. The next time the cronjob is executed, the new version of the monitor image will be used"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre"},"export CP4D_PROJECT=<CP4D_PROJECT>\nexport CP4D_CRONJOB=cp4d-platform-watsonstudio-job-schedule-info-cronjob\n\noc start-build -n ${CP4D_PROJECT} cp4d-platform-watsonstudio-job-schedule-info                                  \n")),(0,s.kt)("p",null,"Monitor the build using (use -2, -3 etc, based on the created build by the previous command):"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre"},"export CP4D_PROJECT=<CP4D_PROJECT>\noc logs -n ${CP4D_PROJECT} build/cp4d-platform-watsonstudio-job-schedule-info-2 -f\n")),(0,s.kt)("p",null,"Patch the cronjob so it will Always pull the image to ensure it will fetch the latest version once triggered"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre"},'oc patch cronjob -n ${CP4D_PROJECT} ${CP4D_CRONJOB} \\\n  --type=json \\\n  --patch \'[{"op":"replace","path":"/spec/jobTemplate/spec/template/spec/containers/0/imagePullPolicy","value":"Always"}]\'\n')),(0,s.kt)("h2",null,"Remove the Monitor"),(0,s.kt)("p",null,"Use the following commands to delete the monitor"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre"},"export CP4D_PROJECT=<CP4D_PROJECT>\nexport CP4D_CRONJOB=cp4d-platform-watsonstudio-job-schedule-info-cronjob\noc delete bc -n ${CP4D_PROJECT} cp4d-platform-watsonstudio-job-schedule-info\noc delete cm -n ${CP4D_PROJECT} zen-alert-cp4d-platform-watsonstudio-schedule-job-info-monitor-extension \noc delete cronjob -n ${CP4D_PROJECT} ${CP4D_CRONJOB} \noc delete cm -n ${CP4D_PROJECT} cp4d-monitor-configuration\n")),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Note:")," Please only delete the configmap cp4d-monitor-configuration if no other monitors are deployed. The configmap cp4d-monitor-configuration is generated by monitor. When monitor is deployed and scheduled to run, it will create the configmap with its default values."),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre"},'"cp4d-job-last-refresh" : "0"\n"cp4d-job-refresh-interval-minutes": "120"\n"cp4d-project-last-refresh": "0"\n"cp4d-project-refresh-interval-minutes": "240"\n"cp4d-space-last-refresh": "0"\n"cp4d-space-refresh-interval-minutes": "120"\n"cp4d-wkc-last-refresh": "0"\n"cp4d-wkc-refresh-interval-minutes": "120"\n')),(0,s.kt)("h2",null,"Reset Cloud Pak for Data metrics configuration and influxdb"),(0,s.kt)("p",null,"If, during development, the zen-watchdog is unable to process events because of an incorrect configuration or naming convention, using the following steps to reset the zen-watchdog and its influxdb"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre"},"export CP4D_PROJECT=<CP4D_PROJECT>\noc project ${CP4D_PROJECT}\n\noc exec -it zen-metastoredb-0 /bin/bash\ncp -r /certs/ /tmp/\ncd /tmp/ && chmod -R 0700 certs/\ncd /cockroach \n./cockroach sql --certs-dir=/tmp/certs/ --host=zen-metastoredb-0.zen-metastoredb\nuse zen;\ndrop table policies;\ndrop table products;\ndrop table monitors;\ndrop table monitor_events;\ndrop table event_types;\nexit\n\noc delete cronjob watchdog-alert-monitoring-cronjob watchdog-alert-monitoring-purge-cronjob zen-watchdog-cronjob diagnostics-cronjob\noc delete pod -l component=zen-watchdog\n")),(0,s.kt)("p",null,"Wait for the cronjobs to be re-created"),(0,s.kt)("p",null,"Acquire the Password for influxdb, and copy it."),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre"},"oc extract secret/dsx-influxdb-auth --keys=influxdb-password --to=-\n")),(0,s.kt)("p",null,"Delete the influxdb entries"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre"},"oc exec -it dsx-influxdb-0 bash\ninflux -ssl -unsafeSsl\nauth\n<enter>admin\n\nDelete the events\n\nuse WATCHDOG;\ndrop measurement events;\n")))}c.isMDXComponent=!0}}]);
//# sourceMappingURL=component---src-pages-monitors-cp-4-d-watsonstudio-job-schedule-info-manual-index-mdx-2684279a9ec5de9aa862.js.map