variable "component" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnets" {
  type = list(string)
}

variable "public_security_groups" {
  type = list(string)
}

variable "private_subnets" {
  type = list(string)
}

variable "private_security_groups" {
  type = list(string)
}

variable "api_task_desired_count" {
  type    = number
  default = 2
}

variable "api_task_image" {
  type = string
}

variable "db_host" {
  type = string
}

variable "db_user" {
  type      = string
  sensitive = true
}

variable "db_pass" {
  type      = string
  sensitive = true
}

variable "db_schema" {
  type = string
}

variable "db_wait_for_connection" {
  type    = bool
  default = true
}

variable "db_connection_limit" {
  type = number
}

variable "db_queue_limit" {
  type    = number
  default = 0
}