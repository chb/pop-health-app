provider "aws" {
}

module "network" {
  source    = "./network"
  component = var.component

  vpc_cidr = "10.0.0.0/16"
}

module "database" {
  source    = "./database"
  component = var.component

  vpc_id = module.network.vpc_id

  subnets = module.network.database_subnets
  security_groups = [
    module.network.database_security_group
  ]

  depends_on = [
    module.network
  ]
}

module "backend" {
  source    = "./backend"
  component = var.component

  vpc_id = module.network.vpc_id

  private_subnets = module.network.private_subnets
  private_security_groups = [
    module.network.private_security_group
  ]

  public_subnets = module.network.public_subnets
  public_security_groups = [
    module.network.public_security_group
  ]

  api_task_image         = var.api_task_image
  api_task_desired_count = 2

  db_host             = module.database.cluster_endpoint
  db_user             = var.db_user != null ? var.db_user : module.database.cluster_master_username
  db_pass             = var.db_pass != null ? var.db_pass : module.database.cluster_master_password
  db_schema           = var.db_schema
  db_connection_limit = 10

  depends_on = [
    module.database
  ]
}

module "frontend" {
  source    = "./frontend"
  component = var.component

  artifact_directory = "build"
}

module "cdn" {
  source    = "./cdn"
  component = var.component

  frontend_s3_bucket_id                = module.frontend.s3_bucket_id
  frontend_s3_bucket_arn               = module.frontend.s3_bucket_arn
  frontend_s3_bucket_regional_endpoint = module.frontend.s3_bucket_regional_endpoint

  backend_alb_id                     = module.backend.alb_id
  backend_alb_regional_endpoint      = module.backend.alb_regional_endpoint
  backend_alb_signature_header_value = module.backend.alb_signature_header_value

  depends_on = [
    module.frontend,
    module.backend
  ]
}