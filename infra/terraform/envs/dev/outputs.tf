output "alb_dns_name" {
  description = "Public DNS name of the dev ALB."
  value       = aws_lb.main.dns_name
}

output "storefront_ecr_repository_url" {
  description = "Storefront ECR repository URL."
  value       = aws_ecr_repository.storefront.repository_url
}

output "api_ecr_repository_url" {
  description = "Commerce API ECR repository URL."
  value       = aws_ecr_repository.api.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name."
  value       = aws_ecs_cluster.main.name
}

output "postgres_address" {
  description = "RDS PostgreSQL endpoint address."
  value       = module.postgres.address
}
