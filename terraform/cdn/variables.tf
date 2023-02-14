variable "component" {
  type = string
}

variable "frontend_s3_bucket_id" {
  type = string
}

variable "frontend_s3_bucket_arn" {
  type = string
}

variable "frontend_s3_bucket_regional_endpoint" {
  type = string
}

variable "backend_alb_id" {
  type = string
}

variable "backend_alb_regional_endpoint" {
  type = string
}

variable "backend_alb_signature_header_value" {
  type = string
}
