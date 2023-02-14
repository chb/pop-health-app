provider "aws" {
}

resource "aws_ecr_repository" "backend_repository" {
  name = "${var.component}-backend-api"

  image_tag_mutability = "MUTABLE"

  encryption_configuration {
    encryption_type = "AES256"
  }
}