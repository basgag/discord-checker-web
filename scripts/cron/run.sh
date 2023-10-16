#!/bin/sh

cd /app || exit

# set env variable
export DATABASE_PRISMA_URL="postgres://postgres:postgres@pgbouncer:6432/dtc-web?pgbouncer=true"
export DATABASE_URL_NON_POOLING="postgres://postgres:postgres@postgres:5432/dtc-web"

if ! ps -ef | grep -v grep | grep -q "/usr/local/bin/python main.py" ; then
    /usr/local/bin/python main.py >> /var/log/cron.log 2>&1
fi

