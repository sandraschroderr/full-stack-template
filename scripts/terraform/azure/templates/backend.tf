terraform {
  backend "azurerm" {
    resource_group_name  = "${taito_zone}"
    storage_account_name = "${taito_zone_short}"
    container_name       = "${taito_state_bucket}"
    key                  = "azure${taito_state_path}"
  }

  required_version = ">= 0.12"
}
