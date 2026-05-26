output "address" {
  description = "Database endpoint address."
  value       = aws_db_instance.this.address
}

output "port" {
  description = "Database endpoint port."
  value       = aws_db_instance.this.port
}

output "db_name" {
  description = "Database name."
  value       = aws_db_instance.this.db_name
}

output "username" {
  description = "Database username."
  value       = aws_db_instance.this.username
}

output "security_group_id" {
  description = "Database security group ID."
  value       = aws_security_group.this.id
}
