#!/usr/bin/env bash
# shellcheck disable=SC2034
# shellcheck disable=SC2154

##########################################################################
# Project specific settings
##########################################################################

# Taito CLI: Project specific plugins (for the selected database, etc.)
taito_plugins="
  ${taito_plugins}
  postgres-db sqitch-db
  sentry
"

# Environments: In the correct order (e.g. dev test uat stag canary prod)
taito_environments="${template_default_environments}"

# Basic auth: Uncomment the line below to disable basic auth from ALL
# environments. Use env-prod.sh to disable basic auth from prod
# environment only.
# taito_basic_auth_enabled=false

# Service account: Uncomment the line below to always create Cloud provider
# service account
# provider_service_account_enabled=true

# ------ Stack ------
# Configuration instructions:
# TODO

if [[ ${taito_deployment_platforms} == *"docker"* ]] ||
   [[ ${taito_deployment_platforms} == *"kubernetes"* ]]; then
  taito_containers=" admin client graphql database kafka redis server storage worker www zookeeper "
else
  taito_functions=" graphql server worker "
fi
taito_static_contents=" admin client www "
taito_databases=" database "
taito_buckets=" bucket "
taito_networks="default"

# Uptime monitoring
taito_uptime_targets=" admin client graphql server www "
taito_uptime_paths=" /admin/uptimez /uptimez /graphql/uptimez /api/uptimez /docs/uptimez "
taito_uptime_timeouts=" 5 5 5 5 5 "

# ------ Secrets ------
# Configuration instructions:
# https://taitounited.github.io/taito-cli/tutorial/06-env-variables-and-secrets/

taito_local_secrets="
"

taito_remote_secrets="
  $taito_project-$taito_env-basic-auth.auth:htpasswd-plain
  $taito_project-$taito_env-scheduler.secret:random
  $db_database_viewer_secret:random
  $db_database_mgr_secret/devops:random
"

taito_secrets="
  $db_database_app_secret:random
  $taito_project-$taito_env-example.secret:manual
  $taito_project-$taito_env-redis.password:random
  $taito_project-$taito_env-storage.accessKeyId:random
  $taito_project-$taito_env-storage.secretKey:random
"

# ------ Links ------
# Add custom links here. You can regenerate README.md links with
# 'taito project docs'. Configuration instructions: TODO

link_urls="
  * client[:ENV]=$taito_app_url Web application GUI (:ENV)
  * admin[:ENV]=$taito_app_url/admin/ Administration GUI (:ENV)
  * server[:ENV]=$taito_app_url/api/uptimez Server API (:ENV)
  * apidocs[:ENV]=$taito_app_url/api/docs API docs (:ENV)
  * www[:ENV]=$taito_app_url/docs Website (:ENV)
  * graphql[:ENV]=$taito_app_url/graphql/uptimez GraphQL API (:ENV)
  * git=https://$taito_vc_repository_url Git repository
"

# TODO: Temporary hack for https://github.com/gatsbyjs/gatsby/issues/3721
link_urls=${link_urls/:9999\/docs/:7463/}
