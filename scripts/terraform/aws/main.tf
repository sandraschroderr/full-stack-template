terraform {
  backend "s3" {
  }
  required_version = ">= 0.13"
}

provider "aws" {
  region                  = var.taito_provider_region
  profile                 = coalesce(var.taito_provider_user_profile, var.taito_organization)
  shared_credentials_file = "/home/taito/.aws/credentials"
}

locals {
  # Read json file
  orig = (
    fileexists("${path.root}/../../terraform-${var.taito_env}-merged.yaml")
      ? yamldecode(file("${path.root}/../../terraform-${var.taito_env}-merged.yaml"))
      : jsondecode(file("${path.root}/../../terraform-merged.json.tmp"))
  )["settings"]

  resources = merge(
    local.orig,
    { alerts = coalesce(local.orig.alerts, []) },
    { apiKeys = coalesce(local.orig.apiKeys, []) },
    { serviceAccounts = coalesce(local.orig.serviceAccounts, []) },
    /* TODO { services = local.services }, */
  )
}

module "aws" {
  source  = "TaitoUnited/project-resources/aws"
  version = "2.1.6"

  # Create flags
  create_domain                       = true
  create_domain_certificate           = true
  create_storage_buckets              = true
  create_databases                    = true
  create_in_memory_databases          = true
  create_topics                       = true
  create_service_accounts             = true
  create_uptime_checks                = var.taito_uptime_provider == "aws"
  create_container_image_repositories = (
    var.taito_container_registry_provider == "aws" && var.taito_env == "dev"
  )

  # Provider
  account_id                  = var.taito_provider_org_id
  region                      = var.taito_provider_region
  user_profile                = coalesce(var.taito_provider_user_profile, var.taito_organization)

  # Project
  zone_name                   = var.taito_zone
  project                     = var.taito_project
  namespace                   = var.taito_namespace
  env                         = var.taito_env

  # Container images
  container_image_repository_path     = var.taito_vc_repository
  container_image_target_types        = [ "static", "container", "function" ]
  additional_container_images         = (
    var.taito_ci_cache_all_targets_with_docker
    ? var.taito_targets
    : var.taito_containers
  )

  # Uptime
  uptime_channels                 = var.taito_uptime_channels

  # Policies
  cicd_policies                   = var.taito_cicd_policies
  gateway_policies                = var.taito_gateway_policies

  # Network
  elasticache_subnet_ids          = data.aws_subnet_ids.elasticache_subnet_ids.ids
  elasticache_security_group_ids  = data.aws_security_groups.elasticache_security_groups.ids

  # Additional resources as a json file
  resources                        = local.resources
}
