output "alb_id" {
  value = module.alb.lb_id
}

output "alb_regional_endpoint" {
  value = module.alb.lb_dns_name
}

output "alb_signature_header_value" {
  value     = random_string.origin_signature_value.result
  sensitive = true
}