output "s3_bucket_id" {
  value = module.frontend.s3_bucket_id
}

output "s3_bucket_arn" {
  value = module.frontend.s3_bucket_arn
}

output "s3_bucket_endpoint" {
  value = module.frontend.s3_bucket_bucket_domain_name
}

output "s3_bucket_regional_endpoint" {
  value = module.frontend.s3_bucket_bucket_regional_domain_name
}