# set base image (host OS)
FROM registry.access.redhat.com/ubi8/python-38

# install dependencies
COPY requirements.txt .
COPY cpdctl_linux_amd64.tar.gz .
COPY ./scripts /cp4d-monitoring-scripts


RUN pip install -r requirements.txt \
    && tar -xzf cpdctl_linux_amd64.tar.gz \
    && mv cpdctl /opt/app-root/bin \
    && chmod +x /opt/app-root/bin/cpdctl

WORKDIR /cp4d-monitoring-scripts

USER 1000321000
ENTRYPOINT [ "sh", "./run_scripts.sh" ]
