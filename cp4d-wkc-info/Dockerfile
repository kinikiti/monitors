# set base image (host OS)
FROM registry.access.redhat.com/ubi8/python-38

# install dependencies
ENV http_proxy "http://proxyapp.fediap.be:8080"
ENV https_proxy "http://proxyapp.fediap.be:8080"
COPY requirements.txt .
ADD https://github.com/IBM/cpdctl/releases/download/v1.1.194/cpdctl_linux_amd64.tar.gz .
ENV http_proxy ""
ENV https_proxy ""

RUN pip install -r requirements.txt \
    && tar -xzf cpdctl_linux_amd64.tar.gz \
    && mv cpdctl /opt/app-root/bin \
    && chmod +x /opt/app-root/bin/cpdctl

COPY ./scripts /cp4d-monitoring-scripts

WORKDIR /cp4d-monitoring-scripts

USER 1001
ENTRYPOINT [ "sh", "/cp4d-monitoring-scripts/run_scripts.sh" ]
