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

module "database_backup" {
  source = "terraform-aws-modules/s3-bucket/aws"

  bucket = "${var.component}-db-backup-${random_pet.this.id}"

  block_public_acls   = true
  block_public_policy = true

  ignore_public_acls      = true
  restrict_public_buckets = true

  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  force_destroy = true
}

module "database" {
  source = "terraform-aws-modules/rds-aurora/aws"

  name = "${var.component}-db"

  engine         = "aurora-mysql"
  engine_version = "5.7.mysql_aurora.2.10.2"

  instance_class = "db.t4g.medium"
  instances = {
    one = {}
  }

  vpc_id = var.vpc_id

  create_db_subnet_group = true
  subnets                = var.subnets

  create_random_password = true
  random_password_length = 16

  create_security_group  = false
  vpc_security_group_ids = var.security_groups

  iam_roles = {
    s3_import = {
      role_arn     = aws_iam_role.database_import_role.arn
      feature_name = "s3Import"
    }
  }

  s3_import = {
    source_engine_version = "5.7"
    bucket_name           = module.database_backup.s3_bucket_id
    bucket_prefix         = null
    ingestion_role        = aws_iam_role.database_import_role.arn
  }

  storage_encrypted = true

  master_username = "admin"

  enabled_cloudwatch_logs_exports = ["audit", "error", "general", "slowquery"]

  depends_on = [
    aws_iam_role_policy.database_import_s3_access_policy,
    null_resource.upload_database_backup
  ]
}

resource "aws_iam_role" "database_import_role" {
  name = "${var.component}-db-import-role-${random_pet.this.id}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "rds.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "database_import_s3_access_policy" {
  name = "s3-access-${random_pet.this.id}"

  role = aws_iam_role.database_import_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation",
        ]
        Effect   = "Allow",
        Resource = module.database_backup.s3_bucket_arn
      },
      {
        Action = [
          "s3:GetObject",
        ]
        Effect   = "Allow"
        Resource = "${module.database_backup.s3_bucket_arn}/*"
      }
    ]
  })
}

resource "null_resource" "upload_database_backup" {
  provisioner "local-exec" {
    command = "unzip ./backup.zip && aws s3 sync ./backup s3://${module.database_backup.s3_bucket_id} && rm -r ./backup"
  }
}