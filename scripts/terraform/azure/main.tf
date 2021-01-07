terraform {
  backend "azurerm" {
  }
  required_version = ">= 0.13"
}

provider "azurerm" {
}

locals {
  taito_uptime_channels = (var.taito_uptime_channels == "" ? [] :
    split(" ", trimspace(replace(var.taito_uptime_channels, "/\\s+/", " "))))

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

module "azure" {
  source  = "TaitoUnited/project-resources/azurerm"
  version = "2.0.2"

  # Create flags
  create_storage_buckets              = true
  create_databases                    = true
  create_in_memory_databases          = true
  create_topics                       = true
  create_service_accounts             = true
  create_uptime_checks                = var.taito_uptime_provider == "azure"

  # Labels
  resource_group = var.taito_resource_namespace_id
  project        = var.taito_project

  # Environment info
  env            = var.taito_env

  # Uptime
  uptime_channels             = local.taito_uptime_channels

  # Additional resources as a json file
  resources                   = local.resources
}
