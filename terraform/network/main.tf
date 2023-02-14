terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
    }
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

# VPC and public / private / database subnets
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "${var.component}-vpc"
  cidr = var.vpc_cidr

  azs = [
    data.aws_availability_zones.available.names[0],
    data.aws_availability_zones.available.names[1]
  ]

  public_subnets = [
    cidrsubnet(var.vpc_cidr, 8, 0),
    cidrsubnet(var.vpc_cidr, 8, 1)
  ]

  private_subnets = [
    cidrsubnet(var.vpc_cidr, 8, 10),
    cidrsubnet(var.vpc_cidr, 8, 11)
  ]

  database_subnets = [
    cidrsubnet(var.vpc_cidr, 8, 20),
    cidrsubnet(var.vpc_cidr, 8, 21)
  ]

  enable_nat_gateway     = true
  single_nat_gateway     = false
  one_nat_gateway_per_az = true

  enable_vpn_gateway = false
}

# security groups for resources in public / private / database subnets
module "public_security_group" {
  source = "terraform-aws-modules/security-group/aws"

  vpc_id = module.vpc.vpc_id

  name = "${var.component}-public-sg"

  ingress_rules = [
    "http-80-tcp",
    "https-443-tcp"
  ]

  ingress_cidr_blocks = [
    "0.0.0.0/0"
  ]

  computed_egress_with_source_security_group_id = [
    {
      rule = "http-80-tcp"
      source_security_group_id = module.private_security_group.security_group_id
    }
  ]

  number_of_computed_egress_with_source_security_group_id = 1
}

module "private_security_group" {
  source = "terraform-aws-modules/security-group/aws"

  vpc_id = module.vpc.vpc_id

  name = "${var.component}-private-sg"

  computed_ingress_with_source_security_group_id = [
    {
      rule = "http-80-tcp"
      source_security_group_id = module.public_security_group.security_group_id
    }
  ]

  number_of_computed_ingress_with_source_security_group_id = 1

  egress_rules = [
    "http-80-tcp",
    "https-443-tcp"
  ]

  computed_egress_with_source_security_group_id = [
    {
      rule                     = "mysql-tcp"
      source_security_group_id = module.database_security_group.security_group_id
    }
  ]

  number_of_computed_egress_with_source_security_group_id = 1
}

module "database_security_group" {
  source = "terraform-aws-modules/security-group/aws"

  vpc_id = module.vpc.vpc_id

  name = "${var.component}-mysql-sg"

  computed_ingress_with_source_security_group_id = [
    {
      rule                     = "mysql-tcp"
      source_security_group_id = module.private_security_group.security_group_id
    }
  ]

  number_of_computed_ingress_with_source_security_group_id = 1
}