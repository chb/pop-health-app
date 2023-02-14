terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

data "aws_region" "current" {
}

resource "random_string" "origin_signature_value" {
  length  = 32
  special = false
}

module "alb" {
  source = "terraform-aws-modules/alb/aws"

  name = "${var.component}-backend-alb"

  load_balancer_type = "application"

  vpc_id = var.vpc_id

  subnets         = var.public_subnets
  security_groups = var.public_security_groups

  create_security_group = false

  target_groups = [
    {
      name_prefix      = "tg-"
      backend_protocol = "HTTP"
      backend_port     = 80
      target_type      = "ip"

      health_check = {
        path = "/health"
      }
    }
  ]

  http_tcp_listeners = [
    {
      target_group_index = 0

      port     = 80
      protocol = "HTTP"

      action_type = "fixed-response"
      fixed_response = {
        content_type = "application/json"
        message_body = jsonencode({
          message = "Unauthorized"
        })
        status_code = "403"
      }
    }
  ]

  http_tcp_listener_rules = [
    {
      http_tcp_listener_index = 0
      priority                = 1

      conditions = [
        {
          http_headers = [
            {
              http_header_name = "X-Origin-Signature"
              values = [
                random_string.origin_signature_value.result
              ]
            }
          ]
        }
      ]

      actions = [
        {
          type = "forward"
          target_groups = [
            {
              target_group_index = 0
            }
          ]
        }
      ]
    }
  ]
}

module "ecs" {
  source = "terraform-aws-modules/ecs/aws"

  cluster_name = var.component

  cluster_configuration = {
    execute_command_configuration = {
      logging = "OVERRIDE"
      log_configuration = {
        cloud_watch_log_group_name = aws_cloudwatch_log_group.ecs.name
      }
    }
  }

  fargate_capacity_providers = {
    FARGATE_SPOT = {
      default_capacity_provider_strategy = {
        weight = 100
      }
    }
  }
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/aws/ecs/${var.component}"
  retention_in_days = 7
}

resource "aws_ecs_service" "backend" {
  name = "backend"

  cluster = module.ecs.cluster_id

  desired_count = var.api_task_desired_count

  task_definition = aws_ecs_task_definition.backend.arn

  network_configuration {
    subnets         = var.private_subnets
    security_groups = var.private_security_groups
  }

  load_balancer {
    target_group_arn = module.alb.target_group_arns[0]
    container_name   = "${var.component}-backend-api"
    container_port   = 80
  }

  lifecycle {
    ignore_changes = [
      capacity_provider_strategy
    ]
  }
}

resource "aws_ecs_task_definition" "backend" {
  family = "${var.component}-backend-api"

  requires_compatibilities = [
    "FARGATE"
  ]

  execution_role_arn = aws_iam_role.backend_execution_role.arn

  network_mode = "awsvpc"

  cpu    = 256
  memory = 512

  container_definitions = jsonencode([
    {
      name      = "${var.component}-backend-api"
      image     = var.api_task_image
      cpu       = 256
      memory    = 512
      essential = true
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = data.aws_region.current.name
          awslogs-stream-prefix = "backend-api"
        }
      }
      environment = [
        {
          name  = "PORT"
          value = "80"
        },
        {
          name  = "DB_HOST"
          value = var.db_host
        },
        {
          name  = "DB_USER"
          value = var.db_user
        },
        {
          name  = "DB_PASS"
          value = var.db_pass
        },
        {
          name  = "DB_SCHEMA"
          value = var.db_schema
        },
        {
          name  = "DB_WAIT_FOR_CONNECTION"
          value = tostring(var.db_wait_for_connection)
        },
        {
          name  = "DB_CONNECTION_LIMIT"
          value = tostring(var.db_connection_limit)
        },
        {
          name  = "DB_QUEUE_LIMIT"
          value = tostring(var.db_queue_limit)
        }
      ]
    }
  ])
}

resource "aws_iam_role" "backend_execution_role" {
  name = "${var.component}-backend-api-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_tasks_execution_role" {
  role = aws_iam_role.backend_execution_role.id

  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}