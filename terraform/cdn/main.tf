terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
    }
  }
}

locals {
  // CachingDisabled AWS managed cache policy ID
  caching_disable_cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"

  // AllViewer AWS managed origin request policy ID
  all_viewer_origin_request_policy = "216adef6-5c7f-47e4-b989-5492eafa07d3"
}

module "cdn" {
  source = "terraform-aws-modules/cloudfront/aws"

  price_class = "PriceClass_100"

  default_root_object = "index.html"

  wait_for_deployment = true

  create_origin_access_control = true

  origin = {
    frontend = {
      domain_name           = var.frontend_s3_bucket_regional_endpoint
      origin_access_control = "s3"
    }

    backend = {
      domain_name = var.backend_alb_regional_endpoint

      custom_origin_config = {
        http_port              = 80
        https_port             = 443
        origin_protocol_policy = "http-only"
        origin_ssl_protocols   = ["TLSv1.1", "TLSv1.2"]
      }

      custom_header = [
        {
          name  = "X-Origin-Signature"
          value = var.backend_alb_signature_header_value
        }
      ]
    }
  }

  default_cache_behavior = {
    target_origin_id       = "frontend"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]

    compress     = true
    query_string = true

    response_headers_policy_id = "67f7725c-6f97-4210-82d7-5512b31e9d03"
  }

  ordered_cache_behavior = [
    {
      path_pattern = "/auth*"

      target_origin_id       = "backend"
      viewer_protocol_policy = "https-only"

      allowed_methods = ["POST", "HEAD", "PATCH", "DELETE", "PUT", "GET", "OPTIONS"]

      cache_policy_id          = local.caching_disable_cache_policy_id
      origin_request_policy_id = local.all_viewer_origin_request_policy

      use_forwarded_values = false
    },
    {
      path_pattern = "/api*"

      target_origin_id       = "backend"
      viewer_protocol_policy = "https-only"

      allowed_methods = ["POST", "HEAD", "PATCH", "DELETE", "PUT", "GET", "OPTIONS"]

      cache_policy_id          = local.caching_disable_cache_policy_id
      origin_request_policy_id = local.all_viewer_origin_request_policy

      use_forwarded_values = false
    },
    {
      path_pattern = "/sql*"

      target_origin_id       = "backend"
      viewer_protocol_policy = "https-only"

      allowed_methods = ["POST", "HEAD", "PATCH", "DELETE", "PUT", "GET", "OPTIONS"]

      cache_policy_id          = local.caching_disable_cache_policy_id
      origin_request_policy_id = local.all_viewer_origin_request_policy

      use_forwarded_values = false
    }
  ]

  custom_error_response = [
    {
      error_code         = 403
      response_code      = 200
      response_page_path = "/index.html"
    }
  ]
}

resource "aws_s3_bucket_policy" "frontend_s3_bucket_allow_cdn_access" {
  bucket = var.frontend_s3_bucket_id

  policy = jsonencode({
    Version = "2008-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action = [
          "s3:GetObject"
        ]
        Resource = "${var.frontend_s3_bucket_arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = module.cdn.cloudfront_distribution_arn
          }
        }
      }
    ]
  })
}