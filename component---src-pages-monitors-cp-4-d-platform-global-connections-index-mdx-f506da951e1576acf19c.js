"use strict";(self.webpackChunkcloud_pak_deployer_monitors=self.webpackChunkcloud_pak_deployer_monitors||[]).push([[1272],{7290:function(t,n,e){e.r(n),e.d(n,{_frontmatter:function(){return i},default:function(){return p}});var o=e(3366),a=(e(7294),e(4983)),l=e(7160),c=["components"],i={},r={_frontmatter:i},s=l.Z;function p(t){var n=t.components,e=(0,o.Z)(t,c);return(0,a.kt)(s,Object.assign({},r,e,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("h2",null,"Monitor Summary"),(0,a.kt)("p",null,"This monitor will generate the following observations:  "),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Count available Cloud Pak for Data global connections  "),(0,a.kt)("li",{parentName:"ul"},"Perform a connection test for each connection")),(0,a.kt)("h2",null,"Monitor Requirements"),(0,a.kt)("p",null,"In order for Platform Global Connection to be available, CCS (Common Core Services) must be available on the Cloud Pak for Data instance. Catridges like Watson Studio and Watson Machine Learning automatically install CCS as part of their dependencies. If CCS is not available, no platform connections are available. "),(0,a.kt)("h2",null,"Deployment of the monitor"),(0,a.kt)("p",null,"This monitor can be deployed using the IBM Cloud Pak Deployer or manually deployed using oc commands:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/cp4d-monitors/monitors/cp4d-platform-global-connections/deployer"},"Cloud Pak Deployer")," "),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/cp4d-monitors/monitors/cp4d-platform-global-connections/manual"},"Manual Deployment using oc commands"))),(0,a.kt)("h2",null,"Monitor Source"),(0,a.kt)("p",null,"Source folder containing the script can be found  ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/IBM/cp4d-monitors/tree/main/cp4d-platform-global-connections"},"here (cp4d-platform-global-connections).")," "),(0,a.kt)("h2",null,"Generated observations"),(0,a.kt)("p",null,"Once the monitor is deployed, the following observations are available in IBM Cloud Pak for Data Metrics:"),(0,a.kt)("h3",null,"Using the IBM Cloud Pak for Data Platform Management Events:"),(0,a.kt)("p",null,"https://","<","CP4D-BASE-URL",">","/zen/#/platformManagement/events"),(0,a.kt)("p",null,"On the Platform Management Events page the following entries are added:"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Event"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Event Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Possible values"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},"Cloud Pak for Data Global Connections Count"),(0,a.kt)("td",{parentName:"tr",align:"left"},"Number of CP4D Platform connections"),(0,a.kt)("td",{parentName:"tr",align:"left"},"info, warning"),(0,a.kt)("td",{parentName:"tr",align:"left"},"The Cloud Pak for Data Platform Connections are requested.  If this succeeds, an info metric is set.  If this request fails, a warning metric is set.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},"Global Connection - ","<","NAME OF CONNECTION",">"),(0,a.kt)("td",{parentName:"tr",align:"left"},"Test CP4D Platform connection"),(0,a.kt)("td",{parentName:"tr",align:"left"},"info, warning"),(0,a.kt)("td",{parentName:"tr",align:"left"},"For each Global Platform connection a seperate entry is available. If the connection test is successful, an info metric is set.  If the connection test fails, a warning metric is set.")))),(0,a.kt)("span",{className:"gatsby-resp-image-wrapper",style:{position:"relative",display:"block",marginLeft:"auto",marginRight:"auto",maxWidth:"1152px"}},"\n      ",(0,a.kt)("span",{parentName:"span",className:"gatsby-resp-image-background-image",style:{paddingBottom:"29.51388888888889%",position:"relative",bottom:"0",left:"0",backgroundImage:"url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAGCAIAAABM9SnKAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAvElEQVQY053QUYuFIBQEYP94G3Fhb/gni6ioTM8xMz1aubBtvS7c72mYp2FY8frmnBdFkWXZ13/yPH//4pyXZcnOlM7zTB9hWmsAaJpmtdYYY9bNbn/c7clP8N4751jf91VV1XXdtm3XdcMw4m2aJiklACCiEEIpdfVSymEYEJEtyzKO4zzPQggAMMbQDQGUUlprIpK4ImIIgYi2bbPWEhGLMT5LjuOIMZ437721NoSQUgrkQghXv+/7ddMPiks+SokXEPYAAAAASUVORK5CYII=')",backgroundSize:"cover",display:"block"}}),"\n  ",(0,a.kt)("img",{parentName:"span",className:"gatsby-resp-image-image",alt:"Overview Events and Alerts",title:"Overview Events and Alerts",src:"/cp4d-monitors/static/4acb0d49d914bbe1145094f08a7950cc/3cbba/cp4d_events.png",srcSet:["/cp4d-monitors/static/4acb0d49d914bbe1145094f08a7950cc/7fc1e/cp4d_events.png 288w","/cp4d-monitors/static/4acb0d49d914bbe1145094f08a7950cc/a5df1/cp4d_events.png 576w","/cp4d-monitors/static/4acb0d49d914bbe1145094f08a7950cc/3cbba/cp4d_events.png 1152w","/cp4d-monitors/static/4acb0d49d914bbe1145094f08a7950cc/0b124/cp4d_events.png 1728w","/cp4d-monitors/static/4acb0d49d914bbe1145094f08a7950cc/4ea69/cp4d_events.png 2304w","/cp4d-monitors/static/4acb0d49d914bbe1145094f08a7950cc/06d2f/cp4d_events.png 2552w"],sizes:"(max-width: 1152px) 100vw, 1152px",style:{width:"100%",height:"100%",margin:"0",verticalAlign:"middle",position:"absolute",top:"0",left:"0"},loading:"lazy",decoding:"async"}),"\n    "),(0,a.kt)("h3",null,"Using the IBM Cloud Pak for Data Prometheus endpoint"),(0,a.kt)("p",null,"https://","<","CP4D-BASE-URL",">","/zen/metrics"),(0,a.kt)("p",null,"It will generate 2 types of metrics:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Actual Result metrics",(0,a.kt)("br",{parentName:"li"}),"These metrics contain the observed values"),(0,a.kt)("li",{parentName:"ul"},"Zen Watchdog metrics",(0,a.kt)("br",{parentName:"li"}),"These metrics are used by the Cloud Pak for Data Zen Watchdog to monitor the state and trigger notifications")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Actual Result metrics:")),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"global_connections_count\nProvides the number of available connections"),(0,a.kt)("li",{parentName:"ul"},"global_connection_valid (for each connection)\nFor each connection, a test action is performed",(0,a.kt)("ul",{parentName:"li"},(0,a.kt)("li",{parentName:"ul"},"1 (Test Connection success)"),(0,a.kt)("li",{parentName:"ul"},"0 (Test connection failed)")))),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},'# HELP global_connections_count \n# TYPE global_connections_count gauge\nglobal_connections_count{event_type="global_connections_count",monitor_type="cp4d_platform_global_connections",reference="Cloud Pak for Data Global Connections Count"} 2\n\n# HELP global_connection_valid \n# TYPE global_connection_valid gauge\nglobal_connection_valid{event_type="global_connection_valid",monitor_type="cp4d_platform_global_connections",reference="Cognos MetaStore Connection"} 1\nglobal_connection_valid{event_type="global_connection_valid",monitor_type="cp4d_platform_global_connections",reference="Cognos non-shared"} 0\n')),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Zen Watchdog metrics")," (used in platform management events)"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"watchdog_cp4d_platform_global_connections_global_connections_count"),(0,a.kt)("li",{parentName:"ul"},"watchdog_cp4d_platform_global_connections_global_connection_valid (for each connection)")),(0,a.kt)("p",null,"Zen Watchdog metrics can have the following values:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"2 (info)"),(0,a.kt)("li",{parentName:"ul"},"1 (warning)"),(0,a.kt)("li",{parentName:"ul"},"0 (critical)")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},'# HELP watchdog_cp4d_platform_global_connections_global_connection_valid \n# TYPE watchdog_cp4d_platform_global_connections_global_connection_valid gauge\nwatchdog_cp4d_platform_global_connections_global_connection_valid{event_type="global_connection_valid",monitor_type="cp4d_platform_global_connections",reference="Cognos MetaStore Connection"} 2\nwatchdog_cp4d_platform_global_connections_global_connection_valid{event_type="global_connection_valid",monitor_type="cp4d_platform_global_connections",reference="Cognos non-shared"} 1\n\n# HELP watchdog_cp4d_platform_global_connections_global_connections_count \n# TYPE watchdog_cp4d_platform_global_connections_global_connections_count gauge\nwatchdog_cp4d_platform_global_connections_global_connections_count{event_type="global_connections_count",monitor_type="cp4d_platform_global_connections",reference="Cloud Pak for Data Global Connections Count"} 2\n')))}p.isMDXComponent=!0}}]);
//# sourceMappingURL=component---src-pages-monitors-cp-4-d-platform-global-connections-index-mdx-f506da951e1576acf19c.js.map