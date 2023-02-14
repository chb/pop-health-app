terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
    }
  }
}

resource "random_pet" "this" {
  length = 2
}

locals {
  build_path = "../${var.artifact_directory}/"
}

module "frontend" {
  source = "terraform-aws-modules/s3-bucket/aws"

  bucket = "${var.component}-frontend-${random_pet.this.id}"

  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  force_destroy = true
}

resource "null_resource" "upload_frontend_content" {
  provisioner "local-exec" {
    command = "aws s3 sync ${local.build_path} s3://${module.frontend.s3_bucket_id}"
  }
}