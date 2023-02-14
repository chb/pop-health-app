output "backend_repository_arn" {
  value = aws_ecr_repository.backend_repository.arn
}

output "backend_repository_registry_id" {
  value = aws_ecr_repository.backend_repository.registry_id
}

output "backend_repository_url" {
  value = aws_ecr_repository.backend_repository.repository_url
}