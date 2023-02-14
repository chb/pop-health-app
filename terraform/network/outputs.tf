output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnets" {
  value = module.vpc.public_subnets
}

output "private_subnets" {
  value = module.vpc.private_subnets
}

output "database_subnets" {
  value = module.vpc.database_subnets
}

output "public_security_group" {
  value = module.public_security_group.security_group_id
}

output "private_security_group" {
  value = module.private_security_group.security_group_id
}

output "database_security_group" {
  value = module.database_security_group.security_group_id
}