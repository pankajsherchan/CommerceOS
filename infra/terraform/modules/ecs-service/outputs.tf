output "service_arn" {
  description = "ECS service ARN."
  value       = aws_ecs_service.this.id
}

output "service_name" {
  description = "ECS service name."
  value       = aws_ecs_service.this.name
}

output "task_definition_arn" {
  description = "ECS task definition ARN used by the service."
  value       = aws_ecs_task_definition.this.arn
}
