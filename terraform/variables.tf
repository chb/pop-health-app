variable "component" {
  type = string
}

variable "api_task_image" {
  type = string
}

variable "db_user" {
  type      = string
  sensitive = true
  default   = "bulk-data-read-only-user"
}

variable "db_pass" {
  type      = string
  sensitive = true
  default   = "bulk-data-read-only-user-password"
}

variable "db_schema" {
  type    = string
  default = "bulk-data-stu-3"
}